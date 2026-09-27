import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CheckCircle2, ShieldCheck, Mail, Send, Loader2 } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import RadioGroup from '../common/RadioGroup';
import { calculateAge, validateDOB } from '../../utils/validators';

const Step2PersonalInfo = () => {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const dob = watch('dateOfBirth');
  const mobile = watch('mobileNumber');
  const email = watch('email');

  // Simulated OTP & Email verification states
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpError, setOtpError] = useState(null);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const calculatedAge = dob ? calculateAge(dob) : null;
  const dobValidity = dob ? validateDOB(dob) : null;

  const handleSendOtp = () => {
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      setOtpError('Please enter a valid 10-digit mobile number first');
      return;
    }
    setOtpError(null);
    setOtpSent(true);
    setOtpValue('123456'); // Pre-fill mock OTP for smooth testing & demo
  };

  const handleVerifyOtp = () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError('Enter valid 6-digit OTP');
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError(null);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setIsMobileVerified(true);
    }, 1000);
  };

  const handleVerifyEmail = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }
    setIsVerifyingEmail(true);
    setTimeout(() => {
      setIsVerifyingEmail(false);
      setIsEmailVerified(true);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Personal & Contact Information</h2>
        <p className="text-sm text-slate-600 mt-1">
          Provide your legal identity details as recorded on your government-issued documents.
        </p>
      </div>

      {/* 1. Full Name & Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          id="fullName"
          label="Full Name (as per PAN card)"
          placeholder="e.g. Rajesh Kumar Sharma"
          required
          autoComplete="name"
          error={errors.fullName?.message}
          helpText="Ensure exact spelling as per your Permanent Account Number (PAN) card."
          {...register('fullName')}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-semibold text-slate-700"
            >
              Date of Birth <span className="text-brand-red ml-1">*</span>
            </label>
            {calculatedAge !== null && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  dobValidity?.valid
                    ? 'bg-brand-green/10 text-brand-green'
                    : 'bg-brand-red/10 text-brand-red'
                }`}
              >
                Age: {calculatedAge} years {dobValidity?.valid ? '✓' : '(Must be 21-65)'}
              </span>
            )}
          </div>
          <input
            type="date"
            id="dateOfBirth"
            required
            aria-invalid={!!errors.dateOfBirth}
            aria-describedby={errors.dateOfBirth ? 'dob-error' : undefined}
            className={`w-full min-h-touch px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
              errors.dateOfBirth
                ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
            }`}
            {...register('dateOfBirth', {
              onChange: (e) => {
                setValue('dateOfBirth', e.target.value, { shouldValidate: true });
              },
            })}
            onInput={(e) => {
              setValue('dateOfBirth', e.target.value, { shouldValidate: true });
            }}
          />
          {errors.dateOfBirth ? (
            <p id="dob-error" role="alert" className="text-xs text-brand-red font-medium mt-1">
              {errors.dateOfBirth.message}
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              Applicant must be between 21 and 65 years old.
            </p>
          )}
        </div>
      </div>

      {/* 2. Gender & Marital Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <RadioGroup
              id="gender"
              name="gender"
              label="Gender"
              required
              layout="horizontal"
              options={['Male', 'Female', 'Other']}
              value={field.value}
              onChange={field.onChange}
              error={errors.gender?.message}
            />
          )}
        />

        <Controller
          name="maritalStatus"
          control={control}
          render={({ field }) => (
            <Select
              id="maritalStatus"
              name="maritalStatus"
              label="Marital Status"
              required
              options={[
                { value: 'Single', label: 'Single' },
                { value: 'Married', label: 'Married' },
                { value: 'Divorced', label: 'Divorced' },
                { value: 'Widowed', label: 'Widowed' },
              ]}
              placeholder="Select marital status"
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.maritalStatus?.message}
              helpText="If Married, spouse details will be defaulted for co-applicant consideration."
            />
          )}
        />
      </div>

      {/* 3. Parents' Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          id="fatherName"
          label="Father's Full Name"
          placeholder="e.g. Suresh Chandra Sharma"
          required
          error={errors.fatherName?.message}
          helpText="Required for credit history and KYC matching."
          {...register('fatherName')}
        />

        <Input
          id="motherName"
          label="Mother's Full Name"
          placeholder="e.g. Sunita Sharma"
          required
          error={errors.motherName?.message}
          helpText="Required for bank account and bureau verification."
          {...register('motherName')}
        />
      </div>

      {/* 4. Contact & Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email Address <span className="text-brand-red ml-1">*</span>
            </label>
            {isEmailVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>
          <div className="relative flex">
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              aria-invalid={!!errors.email}
              className={`w-full min-h-touch px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                  : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
              }`}
              {...register('email')}
            />
            {!isEmailVerified && email && !errors.email && (
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={isVerifyingEmail}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
              >
                {isVerifyingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                Verify
              </button>
            )}
          </div>
          {errors.email ? (
            <p className="text-xs text-brand-red font-medium mt-1">{errors.email.message}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              Loan sanction letter and Key Fact Statement will be sent here.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="mobileNumber" className="block text-sm font-semibold text-slate-700">
              Primary Mobile Number <span className="text-brand-red ml-1">*</span>
            </label>
            {isMobileVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                OTP Verified
              </span>
            )}
          </div>
          <div className="relative flex">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 font-medium text-sm">
              +91
            </span>
            <input
              id="mobileNumber"
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              autoComplete="tel-national"
              required
              aria-invalid={!!errors.mobileNumber}
              className={`w-full min-h-touch pl-12 pr-20 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                errors.mobileNumber
                  ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                  : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
              }`}
              {...register('mobileNumber')}
            />
            {!isMobileVerified && (
              <button
                type="button"
                onClick={handleSendOtp}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                {otpSent ? 'Resend' : 'Send OTP'}
              </button>
            )}
          </div>
          {errors.mobileNumber && (
            <p className="text-xs text-brand-red font-medium mt-1">{errors.mobileNumber.message}</p>
          )}

          {/* OTP Input Simulation */}
          {otpSent && !isMobileVerified && (
            <div className="mt-2.5 p-3 bg-blue-50/70 border border-blue-200 rounded-lg animate-fade-in">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Enter 6-digit OTP sent to +91 {mobile}</span>
                <span className="text-brand-blue text-[11px]">(Demo code: 123456)</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-32 px-3 py-1.5 text-sm tracking-widest font-mono text-center rounded border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp}
                  className="px-3 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold rounded transition-colors flex items-center gap-1"
                >
                  {isVerifyingOtp ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Confirm OTP
                </button>
              </div>
              {otpError && <p className="text-xs text-brand-red font-medium mt-1">{otpError}</p>}
            </div>
          )}
        </div>
      </div>

      {/* 5. Alternate Mobile Number */}
      <div className="max-w-md">
        <Input
          id="alternateMobile"
          label="Alternate Mobile Number (Optional)"
          placeholder="e.g. 9876543211"
          maxLength={10}
          error={errors.alternateMobile?.message}
          helpText="Must be a different 10-digit number from primary mobile."
          {...register('alternateMobile')}
        />
      </div>
    </div>
  );
};

export default Step2PersonalInfo;
