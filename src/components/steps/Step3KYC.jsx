import { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { ShieldCheck, CheckCircle2, FileCheck } from 'lucide-react';
import MaskedInput from '../common/MaskedInput';
import Input from '../common/Input';
import Checkbox from '../common/Checkbox';
import { useVerification } from '../../hooks/useVerification';
import { validatePAN, validateAadhaar } from '../../utils/validators';

const Step3KYC = () => {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const loanType = watch('loanType') || 'personal';
  const loanAmount = Number(watch('loanAmount') || 0);
  const isHighValueHomeLoan = loanType === 'home' && loanAmount > 5000000;

  const currentPanVerified = Boolean(watch('panVerified'));
  const currentAadhaarVerified = Boolean(watch('aadhaarVerified'));

  // Custom simulated verification hooks with 1.5s delay
  const panVerifier = useVerification('PAN', loanType, currentPanVerified);
  const aadhaarVerifier = useVerification('Aadhaar', null, currentAadhaarVerified);

  // Sync verifier states into form state
  useEffect(() => {
    setValue('panVerified', panVerifier.isVerified, { shouldValidate: true });
  }, [panVerifier.isVerified, setValue]);

  useEffect(() => {
    setValue('aadhaarVerified', aadhaarVerifier.isVerified, { shouldValidate: true });
  }, [aadhaarVerifier.isVerified, setValue]);

  // Handle PAN blur
  const handlePanBlur = async (e) => {
    const rawVal = e?.target?.value || '';
    const formVal = getValues('panNumber') || '';
    const val = (rawVal.includes('•') ? formVal : rawVal).trim().toUpperCase();
    if (!val || val.includes('•')) return;
    setValue('panNumber', val);
    const check = validatePAN(val, loanType);
    if (check.valid) {
      clearErrors('panNumber');
      await panVerifier.verify(val);
    } else {
      panVerifier.reset();
      setError('panNumber', { type: 'manual', message: check.message });
    }
  };

  // Handle Aadhaar blur
  const handleAadhaarBlur = async (e) => {
    const rawVal = e?.target?.value || '';
    const formVal = getValues('aadhaarNumber') || '';
    const val = (rawVal.includes('•') ? formVal : rawVal).trim().replace(/\s+/g, '');
    if (!val || val.includes('•')) return;
    setValue('aadhaarNumber', val);
    const check = validateAadhaar(val);
    if (check.valid) {
      clearErrors('aadhaarNumber');
      await aadhaarVerifier.verify(val);
    } else {
      aadhaarVerifier.reset();
      setError('aadhaarNumber', { type: 'manual', message: check.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Identity & KYC Verification</h2>
        <p className="text-sm text-slate-600 mt-1">
          Instant government database verification via NSDL & UIDAI e-KYC.
        </p>
      </div>

      {/* Regulatory Disclosure Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-brand-blue">RBI Digital Lending Mandate: </span>
          All customer identity credentials are transmitted securely through 256-bit encrypted channels. We do not store full Aadhaar numbers in plain text.
        </div>
      </div>

      {/* 1. PAN Number & Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Controller
            name="panNumber"
            control={control}
            render={({ field }) => (
              <MaskedInput
                id="panNumber"
                name="panNumber"
                label="Permanent Account Number (PAN)"
                placeholder="ABCDE1234F"
                maxLength={10}
                required
                maskType="pan"
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e.target.value.toUpperCase());
                  panVerifier.reset();
                }}
                onBlur={handlePanBlur}
                isVerifying={panVerifier.isVerifying}
                isVerified={panVerifier.isVerified}
                error={errors.panNumber?.message || panVerifier.error}
                helpText={
                  loanType === 'business'
                    ? '4th character must be P (Individual), C (Company), or F (Firm).'
                    : '4th character must be P (Individual).'
                }
              />
            )}
          />
          {panVerifier.isVerified && (
            <p className="text-[11px] text-brand-green font-medium -mt-2 mb-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PAN verified with Income Tax / NSDL records
            </p>
          )}
        </div>

        {/* 2. Aadhaar Number & Verification */}
        <div>
          <Controller
            name="aadhaarNumber"
            control={control}
            render={({ field }) => (
              <MaskedInput
                id="aadhaarNumber"
                name="aadhaarNumber"
                label="Aadhaar Number (12 Digits)"
                placeholder="1234 5678 9012"
                maxLength={14}
                required
                maskType="aadhaar"
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e.target.value.replace(/\D/g, ''));
                  aadhaarVerifier.reset();
                }}
                onBlur={handleAadhaarBlur}
                isVerifying={aadhaarVerifier.isVerifying}
                isVerified={aadhaarVerifier.isVerified}
                error={errors.aadhaarNumber?.message || aadhaarVerifier.error}
                helpText="Validated using official Verhoeff checksum algorithm."
              />
            )}
          />
          {aadhaarVerifier.isVerified && (
            <p className="text-[11px] text-brand-green font-medium -mt-2 mb-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aadhaar authenticated via UIDAI e-KYC
            </p>
          )}
        </div>
      </div>

      {/* Hidden inputs to keep RHF form state for verification */}
      <input type="hidden" {...register('panVerified')} />
      <input type="hidden" {...register('aadhaarVerified')} />
      {errors.panVerified && (
        <p className="text-xs text-brand-red font-medium -mt-2">{errors.panVerified.message}</p>
      )}
      {errors.aadhaarVerified && (
        <p className="text-xs text-brand-red font-medium -mt-2">{errors.aadhaarVerified.message}</p>
      )}

      {/* 3. Mandatory Explicit Aadhaar Consent Checkbox */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <Controller
          name="aadhaarConsent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="aadhaarConsent"
              name="aadhaarConsent"
              required
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              error={errors.aadhaarConsent?.message}
            >
              <span className="text-xs text-slate-700 leading-relaxed font-normal">
                I hereby provide voluntary consent to <span className="font-semibold text-slate-900">LendSwift Finance NBFC</span> to authenticate my identity via UIDAI e-KYC services in compliance with the Aadhaar Act, 2016 and RBI Digital Lending Guidelines. I understand my demographic data will only be utilized for this loan application.
              </span>
            </Checkbox>
          )}
        />
      </div>

      {/* 4. Secondary Identity Documents */}
      <div className="pt-2 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-brand-blue" />
          Supplementary Identity Proofs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            id="voterId"
            label="Voter ID Card (EPIC) - Optional"
            placeholder="e.g. ABC1234567"
            maxLength={10}
            error={errors.voterId?.message}
            helpText="3 letters followed by 7 digits (e.g. ABC1234567)."
            {...register('voterId')}
          />

          <Input
            id="passport"
            label={`Passport Number ${isHighValueHomeLoan ? '(Mandatory)' : '(Optional)'}`}
            placeholder="e.g. A1234567"
            maxLength={8}
            required={isHighValueHomeLoan}
            error={errors.passport?.message}
            helpText={
              isHighValueHomeLoan
                ? 'Mandatory for Home Loans exceeding ₹ 50 Lakh under RBI AML policy.'
                : '1 letter followed by 7 digits.'
            }
            {...register('passport')}
          />
        </div>
      </div>
    </div>
  );
};

export default Step3KYC;
