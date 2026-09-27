import { useEffect, useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Briefcase, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';

const POPULAR_COMPANIES = [
  'Tata Consultancy Services (TCS)',
  'Infosys Limited',
  'Wipro Technologies',
  'HCL Technologies',
  'Reliance Industries Limited',
  'HDFC Bank Limited',
  'ICICI Bank Limited',
  'State Bank of India',
  'Bharti Airtel',
  'Larsen & Toubro (L&T)',
  'Mahindra & Mahindra',
  'Tech Mahindra',
  'Tata Motors',
  'Kotak Mahindra Bank',
  'ITC Limited',
];

const Step5Employment = () => {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const loanType = watch('loanType') || 'personal';
  const employmentType = watch('employmentType') || (loanType === 'business' ? 'business_owner' : 'salaried');
  const prevEmpTypeRef = useRef(employmentType);

  const isBusinessLoan = loanType === 'business';

  // Wipe obsolete fields when employment type switches (Section E3.1 anti-leak defence)
  useEffect(() => {
    const prev = prevEmpTypeRef.current;
    if (prev && prev !== employmentType) {
      if (prev === 'salaried') {
        setValue('companyName', '');
        setValue('designation', '');
        setValue('yearsOfExperience', '');
      } else if (prev === 'self_employed') {
        setValue('businessName', '');
        setValue('businessType', '');
        setValue('annualTurnover', '');
        setValue('yearsInBusiness', '');
        setValue('officeAddress', '');
      } else if (prev === 'business_owner') {
        setValue('businessName', '');
        setValue('businessType', '');
        setValue('annualTurnover', '');
        setValue('yearsInBusiness', '');
        setValue('gstNumber', '');
        setValue('officeAddress', '');
      }
    }
    prevEmpTypeRef.current = employmentType;
  }, [employmentType, setValue]);

  // If Business Loan selected in Step 1 and current type is salaried, switch to business_owner
  useEffect(() => {
    if (isBusinessLoan && employmentType === 'salaried') {
      setValue('employmentType', 'business_owner', { shouldValidate: true });
    }
  }, [isBusinessLoan, employmentType, setValue]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Employment & Financial Profile</h2>
        <p className="text-sm text-slate-600 mt-1">
          Provide your current source of income to determine repayment capacity and interest rates.
        </p>
      </div>

      {isBusinessLoan && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Note for Business Loans: </strong>
            Salaried category is disabled. Business loans are restricted to registered Business Owners and Self-Employed professionals.
          </span>
        </div>
      )}

      {/* 1. Employment Type Selector */}
      <fieldset>
        <legend className="block text-sm font-semibold text-slate-700 mb-2.5">
          Employment Category <span className="text-brand-red">*</span>
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Salaried */}
          <label
            className={`flex flex-col p-4 rounded-xl border-2 transition-all ${
              isBusinessLoan
                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                : employmentType === 'salaried'
                ? 'border-brand-blue bg-blue-50/50 shadow-sm ring-1 ring-brand-blue/20 cursor-pointer'
                : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
            }`}
          >
            <input
              type="radio"
              value="salaried"
              disabled={isBusinessLoan}
              {...register('employmentType')}
              className="sr-only"
            />
            <div className="flex items-center gap-2.5 mb-1.5">
              <Briefcase className="w-5 h-5 text-brand-blue" />
              <span className="font-bold text-slate-900">Salaried</span>
            </div>
            <p className="text-xs text-slate-500">Working in Private, Public, or Govt sector</p>
            {isBusinessLoan && (
              <span className="text-[10px] text-brand-red font-medium mt-2">
                Not applicable for Business Loan
              </span>
            )}
          </label>

          {/* Self-Employed */}
          <label
            className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
              employmentType === 'self_employed'
                ? 'border-brand-blue bg-blue-50/50 shadow-sm ring-1 ring-brand-blue/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              value="self_employed"
              {...register('employmentType')}
              className="sr-only"
            />
            <div className="flex items-center gap-2.5 mb-1.5">
              <TrendingUp className="w-5 h-5 text-brand-green" />
              <span className="font-bold text-slate-900">Self-Employed</span>
            </div>
            <p className="text-xs text-slate-500">Doctors, Consultants, CA, Proprietors</p>
          </label>

          {/* Business Owner */}
          <label
            className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
              employmentType === 'business_owner'
                ? 'border-brand-blue bg-blue-50/50 shadow-sm ring-1 ring-brand-blue/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              value="business_owner"
              {...register('employmentType')}
              className="sr-only"
            />
            <div className="flex items-center gap-2.5 mb-1.5">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-slate-900">Business Owner</span>
            </div>
            <p className="text-xs text-slate-500">Pvt Ltd, LLP, or GST-registered firm</p>
          </label>
        </div>
        {errors.employmentType && (
          <p className="text-xs text-brand-red font-medium mt-1.5">
            {errors.employmentType.message}
          </p>
        )}
      </fieldset>

      {/* 2. Dynamic Sub-Forms */}

      {/* SUB-FORM 1: Salaried */}
      {employmentType === 'salaried' && (
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-5 animate-fade-in shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-blue" />
            Salaried Professional Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Employer / Company Name <span className="text-brand-red ml-1">*</span>
              </label>
              <input
                id="companyName"
                list="company-list"
                placeholder="Type or select company name"
                required
                autoComplete="organization"
                aria-invalid={!!errors.companyName}
                className={`w-full min-h-touch px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.companyName
                    ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                    : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
                }`}
                {...register('companyName')}
              />
              <datalist id="company-list">
                {POPULAR_COMPANIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.companyName ? (
                <p className="text-xs text-brand-red font-medium mt-1">{errors.companyName.message}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Start typing to see suggested corporations.
                </p>
              )}
            </div>

            <Input
              id="designation"
              label="Designation / Role"
              placeholder="e.g. Senior Software Engineer"
              required
              autoComplete="organization-title"
              error={errors.designation?.message}
              {...register('designation')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="monthlyIncome"
                  name="monthlyIncome"
                  label="Monthly Net Take-Home Salary"
                  required
                  maskable
                  placeholder="e.g. 75,000"
                  quickAmounts={[25000, 50000, 75000, 100000, 150000]}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.monthlyIncome?.message}
                  helpText="Minimum ₹ 15,000. Used for debt-to-income affordability."
                />
              )}
            />

            <div>
              <label
                htmlFor="yearsOfExperience"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Total Work Experience (Years) <span className="text-brand-red ml-1">*</span>
              </label>
              <input
                id="yearsOfExperience"
                type="number"
                min={0}
                max={50}
                step={0.5}
                placeholder="e.g. 5"
                required
                aria-invalid={!!errors.yearsOfExperience}
                className={`w-full min-h-touch px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.yearsOfExperience
                    ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                    : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
                }`}
                {...register('yearsOfExperience', { valueAsNumber: true })}
              />
              {errors.yearsOfExperience && (
                <p className="text-xs text-brand-red font-medium mt-1">
                  {errors.yearsOfExperience.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-FORM 2: Self-Employed */}
      {employmentType === 'self_employed' && (
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-5 animate-fade-in shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-green" />
            Self-Employed Professional Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="businessName"
              label="Profession / Business Name"
              placeholder="e.g. Sharma Legal Consultants"
              required
              error={errors.businessName?.message}
              {...register('businessName')}
            />

            <Controller
              name="businessType"
              control={control}
              render={({ field }) => (
                <Select
                  id="businessType"
                  name="businessType"
                  label="Profession Type"
                  required
                  options={[
                    { value: 'Doctor / Healthcare', label: 'Doctor / Healthcare Professional' },
                    { value: 'Chartered Accountant / Financial', label: 'Chartered Accountant / Financial' },
                    { value: 'Advocate / Legal', label: 'Advocate / Legal Consultant' },
                    { value: 'Architect / Engineer', label: 'Architect / Engineer' },
                    { value: 'IT Consultant / Freelancer', label: 'IT Consultant / Freelancer' },
                    { value: 'Sole Proprietorship Trader', label: 'Sole Proprietor / Retail Trader' },
                    { value: 'Other Professional', label: 'Other Professional Services' },
                  ]}
                  placeholder="Select profession"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.businessType?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Controller
              name="annualTurnover"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="annualTurnover"
                  name="annualTurnover"
                  label="Annual Gross Receipts / Turnover"
                  required
                  placeholder="e.g. 12,00,000"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.annualTurnover?.message}
                  helpText="Minimum ₹ 3,00,000."
                />
              )}
            />

            <div>
              <label
                htmlFor="yearsInBusiness"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Years in Practice / Business <span className="text-brand-red ml-1">*</span>
              </label>
              <input
                id="yearsInBusiness"
                type="number"
                min={2}
                max={50}
                placeholder="e.g. 4"
                required
                aria-invalid={!!errors.yearsInBusiness}
                className={`w-full min-h-touch px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.yearsInBusiness
                    ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                    : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
                }`}
                {...register('yearsInBusiness', { valueAsNumber: true })}
              />
              {errors.yearsInBusiness ? (
                <p className="text-xs text-brand-red font-medium mt-1">
                  {errors.yearsInBusiness.message}
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">Minimum 2 years required.</p>
              )}
            </div>

            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="monthlyIncome"
                  name="monthlyIncome"
                  label="Average Monthly Net Income"
                  required
                  maskable
                  placeholder="e.g. 80,000"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.monthlyIncome?.message}
                  helpText="Used for EMI affordability."
                />
              )}
            />
          </div>

          <Input
            id="officeAddress"
            label="Clinic / Chamber / Office Address"
            placeholder="Full business or chamber address"
            required
            error={errors.officeAddress?.message}
            {...register('officeAddress')}
          />
        </div>
      )}

      {/* SUB-FORM 3: Business Owner */}
      {employmentType === 'business_owner' && (
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-5 animate-fade-in shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            Enterprise & Business Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="businessName"
              label="Registered Business Entity Name"
              placeholder="e.g. Apex Technologies Pvt Ltd"
              required
              error={errors.businessName?.message}
              {...register('businessName')}
            />

            <Controller
              name="businessType"
              control={control}
              render={({ field }) => (
                <Select
                  id="businessType"
                  name="businessType"
                  label="Business Constitution"
                  required
                  options={[
                    { value: 'Private Limited', label: 'Private Limited Company (Pvt Ltd)' },
                    { value: 'Public Limited', label: 'Public Limited Company' },
                    { value: 'Limited Liability Partnership', label: 'Limited Liability Partnership (LLP)' },
                    { value: 'Partnership Firm', label: 'Registered Partnership Firm' },
                  ]}
                  placeholder="Select constitution"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.businessType?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="gstNumber"
              label="GST Identification Number (GSTIN)"
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
              required
              error={errors.gstNumber?.message}
              helpText="15-character GSTIN: 2-digit state code + 10-char PAN + entity code + Z + checksum."
              {...register('gstNumber')}
            />

            <Controller
              name="annualTurnover"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="annualTurnover"
                  name="annualTurnover"
                  label="Annual Business Turnover (Audited)"
                  required
                  placeholder="e.g. 50,00,000"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.annualTurnover?.message}
                  helpText="Minimum ₹ 3,00,000."
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="yearsInBusiness"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Business Vintage / Operational Years <span className="text-brand-red ml-1">*</span>
              </label>
              <input
                id="yearsInBusiness"
                type="number"
                min={2}
                max={50}
                placeholder="e.g. 5"
                required
                aria-invalid={!!errors.yearsInBusiness}
                className={`w-full min-h-touch px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.yearsInBusiness
                    ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                    : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
                }`}
                {...register('yearsInBusiness', { valueAsNumber: true })}
              />
              {errors.yearsInBusiness ? (
                <p className="text-xs text-brand-red font-medium mt-1">
                  {errors.yearsInBusiness.message}
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">Minimum 2 years operational vintage.</p>
              )}
            </div>

            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="monthlyIncome"
                  name="monthlyIncome"
                  label="Monthly Net Profit / Director Remuneration"
                  required
                  maskable
                  placeholder="e.g. 1,50,000"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.monthlyIncome?.message}
                  helpText="Factored into EMI repayment capacity."
                />
              )}
            />
          </div>

          <Input
            id="officeAddress"
            label="Registered Office Address"
            placeholder="Complete office or factory premises address"
            required
            error={errors.officeAddress?.message}
            {...register('officeAddress')}
          />
        </div>
      )}
    </div>
  );
};

export default Step5Employment;
