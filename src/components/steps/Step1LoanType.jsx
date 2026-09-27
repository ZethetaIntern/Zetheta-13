import { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { User, Home, Briefcase, Calculator, Percent } from 'lucide-react';
import CurrencyInput from '../common/CurrencyInput';
import Select from '../common/Select';
import Input from '../common/Input';
import { LOAN_LIMITS, LOAN_PURPOSES } from '../../schemas/step1Schema';
import { generateLoanSummary } from '../../utils/emiCalculator';
import { getMaxTenureForAge } from '../../utils/validators';

const LOAN_PRODUCTS = [
  {
    id: 'personal',
    title: 'Personal Loan',
    subtitle: 'For personal needs & emergencies',
    rate: '10.5% p.a.',
    maxAmount: 'Up to ₹ 10 Lakh',
    tenureText: '12 – 60 Months',
    icon: User,
    badge: 'Fast Disbursal',
  },
  {
    id: 'home',
    title: 'Home Loan',
    subtitle: 'Purchase, construction or renovation',
    rate: '8.5% p.a.',
    maxAmount: 'Up to ₹ 1 Crore',
    tenureText: '60 – 360 Months',
    icon: Home,
    badge: 'Lowest Rate',
  },
  {
    id: 'business',
    title: 'Business Loan',
    subtitle: 'Working capital & expansion',
    rate: '14.0% p.a.',
    maxAmount: 'Up to ₹ 50 Lakh',
    tenureText: '12 – 120 Months',
    icon: Briefcase,
    badge: 'Zero Collateral',
  },
];

const QUICK_AMOUNTS = {
  personal: [100000, 250000, 500000, 750000, 1000000],
  home: [1500000, 3000000, 5000000, 7500000, 10000000],
  business: [500000, 1000000, 2000000, 3500000, 5000000],
};

const Step1LoanType = () => {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedLoanType = watch('loanType') || 'personal';
  const loanAmount = watch('loanAmount');
  const loanTenure = watch('loanTenure');
  const dateOfBirth = watch('dateOfBirth');

  const limits = LOAN_LIMITS[selectedLoanType] || LOAN_LIMITS.personal;
  const purposes = LOAN_PURPOSES[selectedLoanType] || LOAN_PURPOSES.personal;

  // Generate tenure options based on loan limits and applicant age
  const maxAllowedTenure = dateOfBirth
    ? getMaxTenureForAge(dateOfBirth, limits.maxTenure)
    : limits.maxTenure;

  const tenureOptions = [];
  const stepMonth = selectedLoanType === 'home' ? 12 : 6;
  for (let m = limits.minTenure; m <= maxAllowedTenure; m += stepMonth) {
    const years = (m / 12).toFixed(1);
    tenureOptions.push({
      value: m,
      label: `${m} Months (${years} ${m === 12 ? 'year' : 'years'})`,
    });
  }

  // Adjust defaults when loan type changes
  useEffect(() => {
    if (!loanAmount || loanAmount < limits.min || loanAmount > limits.max) {
      const defaultAmt = selectedLoanType === 'home' ? 2500000 : selectedLoanType === 'business' ? 1000000 : 300000;
      setValue('loanAmount', defaultAmt, { shouldValidate: false });
    }
    if (!loanTenure || loanTenure < limits.minTenure || loanTenure > maxAllowedTenure) {
      const defaultTenure = selectedLoanType === 'home' ? 120 : selectedLoanType === 'business' ? 36 : 24;
      setValue('loanTenure', defaultTenure, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLoanType, limits.min, limits.max, limits.minTenure, maxAllowedTenure, setValue]);

  // Real-time EMI Preview
  const liveSummary = generateLoanSummary(
    selectedLoanType,
    loanAmount || limits.min,
    loanTenure || limits.minTenure
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Select Loan Product & Requirements</h2>
        <p className="text-sm text-slate-600 mt-1">
          Choose a tailored financial product to get an immediate indicative interest rate and terms.
        </p>
      </div>

      {/* 1. Loan Type Cards */}
      <fieldset>
        <legend className="block text-sm font-semibold text-slate-700 mb-2.5">
          Select Loan Product <span className="text-brand-red">*</span>
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {LOAN_PRODUCTS.map((prod) => {
            const Icon = prod.icon;
            const isSelected = selectedLoanType === prod.id;
            return (
              <label
                key={prod.id}
                className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'border-brand-blue bg-blue-50/50 shadow-sm ring-1 ring-brand-blue/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <input
                  type="radio"
                  value={prod.id}
                  {...register('loanType')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full">
                    {prod.badge}
                  </span>
                </div>

                <span className="font-bold text-base text-slate-900">{prod.title}</span>
                <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">{prod.subtitle}</span>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-blue">{prod.rate}</span>
                  <span className="text-slate-500">{prod.maxAmount}</span>
                </div>
              </label>
            );
          })}
        </div>
        {errors.loanType && (
          <p className="text-xs text-brand-red font-medium mt-1.5">{errors.loanType.message}</p>
        )}
      </fieldset>

      {/* 2. Amount & Tenure in 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Controller
          name="loanAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              id="loanAmount"
              name="loanAmount"
              label="Desired Loan Amount"
              required
              min={limits.min}
              max={limits.max}
              step={selectedLoanType === 'home' ? 50000 : 10000}
              showSlider
              quickAmounts={QUICK_AMOUNTS[selectedLoanType] || []}
              value={field.value}
              onChange={field.onChange}
              error={errors.loanAmount?.message}
              helpText={`Allowed range: ₹ ${new Intl.NumberFormat('en-IN').format(
                limits.min
              )} to ₹ ${new Intl.NumberFormat('en-IN').format(limits.max)}`}
            />
          )}
        />

        <div className="space-y-4">
          <Controller
            name="loanTenure"
            control={control}
            render={({ field }) => (
              <Select
                id="loanTenure"
                name="loanTenure"
                label="Loan Tenure (Months)"
                required
                options={tenureOptions}
                placeholder="Choose tenure"
                value={field.value || ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={errors.loanTenure?.message}
                helpText={`Select between ${limits.minTenure} and ${maxAllowedTenure} months.`}
              />
            )}
          />

          <Controller
            name="loanPurpose"
            control={control}
            render={({ field }) => (
              <Select
                id="loanPurpose"
                name="loanPurpose"
                label="Specific Loan Purpose"
                required
                options={purposes.map((p) => ({ value: p, label: p }))}
                placeholder="Select purpose of loan"
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.loanPurpose?.message}
                helpText="Required by RBI Digital Lending Guidelines for audit verification."
              />
            )}
          />
        </div>
      </div>

      {/* 3. Referral Code */}
      <div className="max-w-md">
        <Input
          id="referralCode"
          label="Partner / Referral Code"
          placeholder="Optional promo code (e.g. LEND2026)"
          error={errors.referralCode?.message}
          helpText="Enter a 6-10 character partner code if you were referred by an agent."
          {...register('referralCode')}
        />
      </div>

      {/* 4. Live Indicative EMI Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-brand-blue" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Indicative Financial Estimate (Reducing Balance)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Monthly EMI</span>
            <span className="text-lg font-extrabold text-brand-blue">
              {liveSummary.formattedEMI}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">per month</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Annual Interest</span>
            <span className="text-lg font-bold text-slate-800 flex items-center gap-1">
              <Percent className="w-4 h-4 text-brand-green" />
              {liveSummary.interestRate}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">fixed p.a.</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Processing Fee (1%)</span>
            <span className="text-lg font-bold text-slate-800">
              {liveSummary.formattedProcessingFee}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">min ₹2k, max ₹25k</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Total Interest</span>
            <span className="text-lg font-bold text-slate-800">
              {liveSummary.formattedInterest}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">over full tenure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1LoanType;
