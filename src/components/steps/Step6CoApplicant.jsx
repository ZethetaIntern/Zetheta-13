import { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Users } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import MaskedInput from '../common/MaskedInput';
import CurrencyInput from '../common/CurrencyInput';
import Checkbox from '../common/Checkbox';
import SignatureCanvas from '../common/SignatureCanvas';
import { useVerification } from '../../hooks/useVerification';
import { validatePAN } from '../../utils/validators';

const Step6CoApplicant = () => {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  const loanType = watch('loanType') || 'personal';
  const loanAmount = Number(watch('loanAmount') || 0);
  const maritalStatus = watch('maritalStatus');

  const currentPanVerified = Boolean(watch('coApplicantPanVerified'));
  const panVerifier = useVerification('PAN', 'personal', currentPanVerified);

  // Cross-step dependency: If primary applicant is Married, default co-applicant relationship to 'Spouse'
  useEffect(() => {
    const currentRel = watch('coApplicantRelationship');
    if (!currentRel && maritalStatus === 'Married') {
      setValue('coApplicantRelationship', 'Spouse', { shouldValidate: true });
    }
  }, [maritalStatus, setValue, watch]);

  // Sync PAN verification state
  useEffect(() => {
    setValue('coApplicantPanVerified', panVerifier.isVerified, { shouldValidate: true });
  }, [panVerifier.isVerified, setValue]);

  const handlePanBlur = async (e) => {
    const rawVal = e?.target?.value || '';
    const formVal = getValues('coApplicantPAN') || '';
    const val = (rawVal.includes('•') ? formVal : rawVal).trim().toUpperCase();
    if (!val || val.includes('•')) return;
    setValue('coApplicantPAN', val);
    const check = validatePAN(val, 'personal');
    if (check.valid) {
      await panVerifier.verify(val);
    } else {
      panVerifier.reset();
    }
  };

  const getReasonBanner = () => {
    if (loanType === 'home') {
      return 'Home loans mandate a co-applicant or property co-owner under standard lending guidelines to enhance borrowing power.';
    }
    if (loanType === 'personal' && loanAmount > 500000) {
      return `Personal loans exceeding ₹ 5,00,000 (your request: ₹ ${new Intl.NumberFormat('en-IN').format(
        loanAmount
      )}) require a co-applicant / guarantor as a risk mitigation measure.`;
    }
    if (loanType === 'business' && loanAmount > 2000000) {
      return `High-ticket business loans exceeding ₹ 20,00,000 (your request: ₹ ${new Intl.NumberFormat('en-IN').format(
        loanAmount
      )}) mandate an executive partner or director as personal guarantor.`;
    }
    return 'A co-applicant is required for this loan request.';
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Co-Applicant & Guarantor Details</h2>
        <p className="text-sm text-slate-600 mt-1">
          Add a co-borrower to enhance creditworthiness and increase sanction approval limits.
        </p>
      </div>

      {/* Why co-applicant is required notice */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
        <Users className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-brand-blue">Mandatory Co-Applicant Trigger: </span>
          {getReasonBanner()}
        </div>
      </div>

      {/* 1. Co-Applicant Name & Relationship */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          id="coApplicantName"
          label="Co-Applicant / Guarantor Full Name"
          placeholder="e.g. Anjali Sharma"
          required
          autoComplete="name"
          error={errors.coApplicantName?.message}
          helpText="As per government ID records."
          {...register('coApplicantName')}
        />

        <Controller
          name="coApplicantRelationship"
          control={control}
          render={({ field }) => (
            <Select
              id="coApplicantRelationship"
              name="coApplicantRelationship"
              label="Relationship with Primary Applicant"
              required
              options={[
                { value: 'Spouse', label: 'Spouse (Husband / Wife)' },
                { value: 'Parent', label: 'Parent (Father / Mother)' },
                { value: 'Sibling', label: 'Sibling (Brother / Sister)' },
                { value: 'Business Partner', label: 'Business Partner / Co-Director' },
              ]}
              placeholder="Select relationship"
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.coApplicantRelationship?.message}
              helpText={
                maritalStatus === 'Married'
                  ? 'Defaulted to Spouse based on your marital status.'
                  : 'Select legal relationship.'
              }
            />
          )}
        />
      </div>

      {/* 2. Co-Applicant PAN & Monthly Income */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Controller
            name="coApplicantPAN"
            control={control}
            render={({ field }) => (
              <MaskedInput
                id="coApplicantPAN"
                name="coApplicantPAN"
                label="Co-Applicant PAN"
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
                error={errors.coApplicantPAN?.message || panVerifier.error}
                helpText="4th character must be P (Individual)."
              />
            )}
          />
          <input type="hidden" {...register('coApplicantPanVerified')} />
          {errors.coApplicantPanVerified && (
            <p className="text-xs text-brand-red font-medium -mt-2">
              {errors.coApplicantPanVerified.message}
            </p>
          )}
        </div>

        <Controller
          name="coApplicantIncome"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              id="coApplicantIncome"
              name="coApplicantIncome"
              label="Co-Applicant Monthly Net Income"
              required
              maskable
              placeholder="e.g. 50,000"
              value={field.value}
              onChange={field.onChange}
              error={errors.coApplicantIncome?.message}
              helpText="Will be added to combined household income in Step 8."
            />
          )}
        />
      </div>

      {/* 3. Consent & Digital Signature */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
        <Controller
          name="coApplicantConsent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="coApplicantConsent"
              name="coApplicantConsent"
              required
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              error={errors.coApplicantConsent?.message}
            >
              <span className="text-xs text-slate-700 leading-relaxed font-normal">
                I hereby declare that the co-applicant / guarantor has authorized LendSwift to verify their credit score and identity through CICs and NSDL, and agrees to be jointly and severally liable for loan repayment obligations.
              </span>
            </Checkbox>
          )}
        />

        <Controller
          name="coApplicantSignature"
          control={control}
          render={({ field }) => (
            <SignatureCanvas
              id="coApplicantSignature"
              label="Co-Applicant Digital Signature"
              required
              value={field.value}
              onChange={field.onChange}
              error={errors.coApplicantSignature?.message}
              helpText="Co-applicant must draw signature using mouse or touch screen."
            />
          )}
        />
      </div>
    </div>
  );
};

export default Step6CoApplicant;
