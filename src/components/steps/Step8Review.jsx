import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Award,
  ExternalLink,
} from 'lucide-react';
import Checkbox from '../common/Checkbox';
import { generateLoanSummary, formatCurrency } from '../../utils/emiCalculator';
import { isStep6Required } from '../../schemas/step6Schema';

const Step8Review = ({ onJumpToStep, onSubmitSuccess }) => {
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormContext();

  const [submittedApp, setSubmittedApp] = useState(null);

  const allFormData = watch();
  const {
    loanType = 'personal',
    loanAmount = 0,
    loanTenure = 12,
    loanPurpose = '',
    fullName = '',
    dateOfBirth = '',
    gender = '',
    maritalStatus = '',
    fatherName = '',
    motherName = '',
    email = '',
    mobileNumber = '',
    alternateMobile = '',
    panNumber = '',
    aadhaarNumber = '',
    voterId = '',
    passport = '',
    addressLine1 = '',
    addressLine2 = '',
    city = '',
    state = '',
    pinCode = '',
    residenceType = '',
    monthlyRent = '',
    yearsAtCurrentAddress = 0,
    employmentType = 'salaried',
    companyName = '',
    designation = '',
    monthlyIncome = 0,
    businessName = '',
    annualTurnover = 0,
    gstNumber = '',
    coApplicantName = '',
    coApplicantRelationship = '',
    coApplicantPAN = '',
    coApplicantIncome = 0,
    coApplicantSignature = '',
    documents = {},
    signature = '',
  } = allFormData;

  const step6Active = isStep6Required(loanType, loanAmount);

  const kfsSummary = generateLoanSummary(
    loanType,
    loanAmount,
    loanTenure,
    monthlyIncome,
    step6Active ? coApplicantIncome : 0
  );

  const handleFinalSubmit = (data) => {
    // Generate UUID reference
    const refNumber = `LS-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const applicationRecord = {
      referenceNumber: refNumber,
      submissionDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      kfs: kfsSummary,
      data,
    };

    setSubmittedApp(applicationRecord);
    if (onSubmitSuccess) {
      onSubmitSuccess(applicationRecord);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayRefNumber = submittedApp
    ? submittedApp.referenceNumber
    : 'LS-2026-PREVIEW';

  const displayDate = submittedApp
    ? submittedApp.submissionDate
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  return (
    <>
      {/* ─── SCREEN VIEW (HIDDEN ON PRINT) ─── */}
      <div className="space-y-7 print:hidden">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Application Review & Final Consent</h2>
          <p className="text-sm text-slate-600 mt-1">
            Review all information carefully before final submission. This application is legally binding upon submission.
          </p>
        </div>

      {/* 1. Key Fact Statement (KFS) Card - Section A3.1 */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-blue-subtle/60 to-white border-2 border-brand-blue/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-blue text-white shadow-xs">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-blue">
                RBI Digital Lending Guidelines Compliant
              </span>
              <h3 className="text-lg font-bold text-slate-900">Key Fact Statement (KFS)</h3>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-blue text-white">
            Fixed Reducing Balance
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Sanctioned Principal</span>
            <span className="text-base font-bold text-slate-900">{kfsSummary.formattedPrincipal}</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Tenure</span>
            <span className="text-base font-bold text-slate-900">
              {kfsSummary.tenureMonths} Mos ({kfsSummary.tenureYears} yrs)
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Annual Rate (APR)</span>
            <span className="text-base font-bold text-brand-blue">{kfsSummary.interestRate}% p.a.</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Monthly EMI</span>
            <span className="text-base font-extrabold text-brand-green">{kfsSummary.formattedEMI}</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Total Interest</span>
            <span className="text-base font-bold text-slate-800">{kfsSummary.formattedInterest}</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Processing Fee (1%)</span>
            <span className="text-base font-bold text-slate-800">{kfsSummary.formattedProcessingFee}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-slate-600 border-t border-slate-200/80 flex-wrap gap-2">
          <span>
            Total Cost of Borrowing: <strong>{kfsSummary.formattedInterest}</strong> | Net Disbursal:{' '}
            <strong>{kfsSummary.formattedNetDisbursal}</strong>
          </span>
          <span>
            Total Repayment: <strong>{kfsSummary.formattedTotalRepayment}</strong>
          </span>
        </div>
      </div>

      {/* 2. EMI-to-Income Affordability Guardrail */}
      {kfsSummary.isHighRisk ? (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-brand-red font-bold text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>High Debt-to-Income Ratio Alert ({kfsSummary.emiRatio}% of monthly income)</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            The projected EMI (<strong>{kfsSummary.formattedEMI}</strong>) accounts for{' '}
            <strong>{kfsSummary.emiRatio}%</strong> of your net verified monthly household income. Under RBI prudent lending guidelines, loans with an EMI exceeding 50% of income carry an elevated risk of default.
          </p>

          <div className="pt-2">
            <Controller
              name="riskAcknowledgement"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="riskAcknowledgement"
                  name="riskAcknowledgement"
                  required
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  error={errors.riskAcknowledgement?.message}
                >
                  <span className="font-semibold text-slate-900 text-xs">
                    I acknowledge that the estimated EMI exceeds 50% of my net monthly income, and I confirm my ability to maintain regular monthly repayments without hardship.
                  </span>
                </Checkbox>
              )}
            />
          </div>
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-xs text-brand-green font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Healthy Repayment Capacity: EMI is only {kfsSummary.emiRatio}% of your verified income.
            </span>
          </div>
          <span className="font-bold">Affordability Passed</span>
        </div>
      )}

      {/* 3. Section-by-Section Review Cards with Edit Buttons */}
      <div className="space-y-4">
        {/* Step 1 Review */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-sm text-slate-900">Loan Product & Terms</h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-500 block">Product</span>
              <span className="font-semibold text-slate-900 capitalize">{loanType} Loan</span>
            </div>
            <div>
              <span className="text-slate-500 block">Amount</span>
              <span className="font-semibold text-slate-900">{formatCurrency(loanAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tenure</span>
              <span className="font-semibold text-slate-900">{loanTenure} Months</span>
            </div>
            <div>
              <span className="text-slate-500 block">Purpose</span>
              <span className="font-semibold text-slate-900 truncate block">{loanPurpose}</span>
            </div>
          </div>
        </div>

        {/* Step 2 Review */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-sm text-slate-900">Personal Information</h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-500 block">Full Legal Name</span>
              <span className="font-semibold text-slate-900">{fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Date of Birth</span>
              <span className="font-semibold text-slate-900">{dateOfBirth}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Gender / Marital</span>
              <span className="font-semibold text-slate-900">
                {gender} / {maritalStatus}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Contact Mobile</span>
              <span className="font-semibold text-slate-900">+91 {mobileNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Email Address</span>
              <span className="font-semibold text-slate-900">{email}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Father&apos;s Name</span>
              <span className="font-semibold text-slate-900">{fatherName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Mother&apos;s Name</span>
              <span className="font-semibold text-slate-900">{motherName}</span>
            </div>
            {alternateMobile && (
              <div>
                <span className="text-slate-500 block">Alternate Mobile</span>
                <span className="font-semibold text-slate-900">+91 {alternateMobile}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 Review */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-sm text-slate-900">KYC & Identity Verification</h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-500 block">PAN Number</span>
              <span className="font-semibold text-slate-900 font-mono">
                {panNumber ? `••••••${panNumber.slice(-4)}` : '-'}
              </span>
              <span className="text-[10px] text-brand-green font-medium block">Verified ✓</span>
            </div>
            <div>
              <span className="text-slate-500 block">Aadhaar (UIDAI)</span>
              <span className="font-semibold text-slate-900 font-mono">
                {aadhaarNumber ? `•••• •••• ${aadhaarNumber.slice(-4)}` : '-'}
              </span>
              <span className="text-[10px] text-brand-green font-medium block">Verified ✓</span>
            </div>
            {voterId && (
              <div>
                <span className="text-slate-500 block">Voter ID</span>
                <span className="font-semibold text-slate-900">{voterId}</span>
              </div>
            )}
            {passport && (
              <div>
                <span className="text-slate-500 block">Passport No.</span>
                <span className="font-semibold text-slate-900">{passport}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 4 Review */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="font-bold text-sm text-slate-900">Address Information</h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-500 block">Current Address</span>
              <span className="font-semibold text-slate-900">
                {addressLine1} {addressLine2}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">City, State & PIN</span>
              <span className="font-semibold text-slate-900">
                {city}, {state} - {pinCode}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Residence Type</span>
              <span className="font-semibold text-slate-900">
                {residenceType} ({yearsAtCurrentAddress} yrs)
                {residenceType === 'Rented' && ` - Rent: ${formatCurrency(monthlyRent)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Step 5 Review */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                5
              </span>
              <h3 className="font-bold text-sm text-slate-900">Employment & Income</h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-500 block">Employment Category</span>
              <span className="font-semibold text-slate-900 capitalize">
                {employmentType.replace('_', ' ')}
              </span>
            </div>
            {employmentType === 'salaried' && (
              <>
                <div>
                  <span className="text-slate-500 block">Employer Name</span>
                  <span className="font-semibold text-slate-900">{companyName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Designation</span>
                  <span className="font-semibold text-slate-900">{designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Monthly Net Salary</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(monthlyIncome)}</span>
                </div>
              </>
            )}
            {(employmentType === 'self_employed' || employmentType === 'business_owner') && (
              <>
                <div>
                  <span className="text-slate-500 block">Entity Name</span>
                  <span className="font-semibold text-slate-900">{businessName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Annual Turnover</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(annualTurnover)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Monthly Profit</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(monthlyIncome)}</span>
                </div>
              </>
            )}
            {employmentType === 'business_owner' && (
              <div>
                <span className="text-slate-500 block">GSTIN</span>
                <span className="font-semibold text-slate-900 font-mono">{gstNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 6 Review (If Active) */}
        {step6Active && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                  6
                </span>
                <h3 className="font-bold text-sm text-slate-900">Co-Applicant / Guarantor</h3>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(6)}
                className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-500 block">Co-Applicant Name</span>
                <span className="font-semibold text-slate-900">{coApplicantName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Relationship</span>
                <span className="font-semibold text-slate-900">{coApplicantRelationship}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Co-Applicant PAN</span>
                <span className="font-semibold text-slate-900 font-mono">
                  ••••••{coApplicantPAN.slice(-4)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Co-Applicant Income</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(coApplicantIncome)}/mo
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 7 Review (Documents & Signatures) */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                7
              </span>
              <h3 className="font-bold text-sm text-slate-900">Documents & E-Signature</h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(7)}
              className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Uploaded Document Files:
              </span>
              <ul className="text-xs text-slate-600 space-y-1">
                {Object.keys(documents).map((k) => {
                  const fileArr = documents[k];
                  if (!fileArr || fileArr.length === 0) return null;
                  return (
                    <li key={k} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                      <span className="font-medium text-slate-800 capitalize">
                        {k.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <span>{fileArr.map((f) => f.name).join(', ')}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Borrower Digital E-Signature:
              </span>
              {signature ? (
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 inline-block">
                  <img
                    src={signature}
                    alt="Applicant Signature"
                    className="h-16 max-w-full object-contain"
                  />
                </div>
              ) : (
                <span className="text-xs text-brand-red">Signature missing</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mandatory RBI Regulatory Disclosures & Consents (Non-bundled) - Section A3.1 */}
      <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-brand-blue" />
          <span>RBI Mandatory Granular Consents & Declarations (Non-Bundled)</span>
        </div>

        <div className="space-y-3">
          <Controller
            name="consentAccuracy"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="consentAccuracy"
                name="consentAccuracy"
                required
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                error={errors.consentAccuracy?.message}
              >
                <span className="text-xs text-slate-700">
                  <strong>1. Accuracy of Information: </strong>
                  I declare that all particulars, identity details, and financial information entered in this application are true, correct, and complete to the best of my knowledge.
                </span>
              </Checkbox>
            )}
          />

          <Controller
            name="consentCreditBureau"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="consentCreditBureau"
                name="consentCreditBureau"
                required
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                error={errors.consentCreditBureau?.message}
              >
                <span className="text-xs text-slate-700">
                  <strong>2. Credit Bureau Pull Authorization: </strong>
                  I explicitly authorize LendSwift NBFC to pull, fetch, and evaluate my credit report and score from authorized Credit Information Companies (TransUnion CIBIL, Experian, Equifax, CRIF High Mark).
                </span>
              </Checkbox>
            )}
          />

          <Controller
            name="consentTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="consentTerms"
                name="consentTerms"
                required
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                error={errors.consentTerms?.message}
              >
                <span className="text-xs text-slate-700">
                  <strong>3. Digital Lending Terms & Conditions: </strong>
                  I have read, understood, and agreed to the{' '}
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(
                        'LendSwift Digital Lending Terms:\n\n1. Fixed reducing rate.\n2. 3-day Cooling-Off period.\n3. Zero prepayment charges for individual floating term loans.\n4. Timely reporting to RBI and CICs.'
                      );
                    }}
                    className="text-brand-blue underline inline-flex items-center gap-0.5"
                  >
                    Digital Lending Agreement Terms & Policies <ExternalLink className="w-3 h-3" />
                  </a>
                  .
                </span>
              </Checkbox>
            )}
          />

          <Controller
            name="consentCommunication"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="consentCommunication"
                name="consentCommunication"
                required
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                error={errors.consentCommunication?.message}
              >
                <span className="text-xs text-slate-700">
                  <strong>4. Communication Consent: </strong>
                  I consent to receive application status updates, sanction letters, and payment notices via SMS, WhatsApp, Phone calls, and registered Email.
                </span>
              </Checkbox>
            )}
          />
        </div>

        {/* Cooling-Off and Grievance Disclosure Banner */}
        <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
          <p>
            <strong>Cooling-Off Period: </strong>
            Under RBI DL/2022/01 guidelines, you are entitled to a 3-day cooling-off window post-disbursal to exit the loan by repaying principal without penalty.
          </p>
          <p>
            <strong>Grievance Redressal: </strong>
            Nodal Officer: grievance@lendswift.in | Escalation: RBI Ombudsman portal (cms.rbi.org.in).
          </p>
        </div>
      </div>

      {/* 5. Final Submit Application Button & Preview KFS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4 text-brand-blue" />
          Preview / Print KFS (PDF)
        </button>

        <button
          type="button"
          onClick={handleSubmit(handleFinalSubmit)}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl font-bold text-sm shadow-md transition-all duration-150 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Submit Loan Application
        </button>
      </div>

      {/* SUCCESS MODAL ON SUBMISSION */}
      {submittedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-full bg-green-100 text-brand-green mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">
                Application Successfully Dispatched
              </span>
              <h2 className="text-xl font-bold text-slate-900">Sanction In-Principle Approved!</h2>
              <p className="text-xs text-slate-600">
                Your loan request has been recorded in LendSwift Core Banking system.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Application Reference No:</span>
                <span className="font-mono font-bold text-brand-blue">
                  {submittedApp.referenceNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Sanctioned Amount:</span>
                <span className="font-bold text-slate-900">{kfsSummary.formattedPrincipal}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Estimated Monthly EMI:</span>
                <span className="font-bold text-brand-green">{kfsSummary.formattedEMI}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Submission Timestamp:</span>
                <span className="font-medium text-slate-700">{submittedApp.submissionDate}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 text-brand-blue rounded-xl text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>A confirmation copy with KFS has been dispatched to {email}.</span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
                className="flex-1 py-2.5 px-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold transition-colors"
              >
                Start New Application
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ─── 6. DEDICATED OFFICIAL PRINTABLE KEY FACT STATEMENT (KFS) & SANCTION DOCUMENT ─── */}
      {/* Rendered ONLY on print (Paper or Save as PDF) */}
      <div className="hidden print:block text-slate-900 bg-white font-sans text-[11px] space-y-4 leading-normal">
        {/* Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-slate-900 text-white font-black flex items-center justify-center text-sm">
                LS
              </span>
              <span className="text-base font-black tracking-tight text-slate-900 uppercase">
                LendSwift Financial Services Private Limited
              </span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1">
              RBI Certificate of Registration No: <strong>N-14.03291</strong> | Corporate Identity Number: <strong>U65929DL2021PTC384912</strong>
            </p>
            <p className="text-[10px] text-slate-600">
              Registered Office: 14/A, Inner Circle, Connaught Place, New Delhi - 110001 | Toll-Free: 1800-200-5363
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-[10px]">
              {displayRefNumber}
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Date: {displayDate}</p>
            <p className="text-[10px] font-semibold text-slate-700">Digital Lending Origination</p>
          </div>
        </div>

        {/* Document Title Banner */}
        <div className="text-center py-1.5 bg-slate-100 border border-slate-300 rounded">
          <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
            Key Fact Statement (KFS) & In-Principle Sanction Advice
          </h1>
          <p className="text-[9px] text-slate-600">
            Issued in strict adherence to Reserve Bank of India (RBI) Digital Lending Guidelines (DL/2022/01)
          </p>
        </div>

        {/* 1. Borrower & Co-Borrower Particulars */}
        <div className="print-avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
            1. Borrower & Co-Borrower Profile
          </h2>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 bg-slate-50 font-semibold w-1/4 border-r border-slate-200">Applicant Full Name:</td>
                <td className="p-1.5 w-1/4 border-r border-slate-200 font-bold">{fullName || 'N/A'}</td>
                <td className="p-1.5 bg-slate-50 font-semibold w-1/4 border-r border-slate-200">Date of Birth & Gender:</td>
                <td className="p-1.5 w-1/4">{dateOfBirth || 'N/A'} ({gender || 'N/A'})</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 bg-slate-50 font-semibold border-r border-slate-200">Contact Details:</td>
                <td className="p-1.5 border-r border-slate-200">+91 {mobileNumber} | {email}</td>
                <td className="p-1.5 bg-slate-50 font-semibold border-r border-slate-200">Marital Status:</td>
                <td className="p-1.5">{maritalStatus || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 bg-slate-50 font-semibold border-r border-slate-200">Verified PAN:</td>
                <td className="p-1.5 border-r border-slate-200 font-mono">
                  {panNumber ? `••••••${panNumber.slice(-4)}` : 'N/A'} (NSDL Verified ✓)
                </td>
                <td className="p-1.5 bg-slate-50 font-semibold border-r border-slate-200">Verified Aadhaar:</td>
                <td className="p-1.5 font-mono">
                  {aadhaarNumber ? `•••• •••• ${aadhaarNumber.slice(-4)}` : 'N/A'} (Verhoeff Checksum ✓)
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 bg-slate-50 font-semibold border-r border-slate-200">Current Residence:</td>
                <td className="p-1.5 border-r border-slate-200" colSpan="3">
                  {addressLine1} {addressLine2 ? addressLine2 + ', ' : ''}{city}, {state} - {pinCode} ({residenceType})
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 bg-slate-50 font-semibold border-r border-slate-200">Employment & Income:</td>
                <td className="p-1.5 border-r border-slate-200">
                  {employmentType.replace('_', ' ').toUpperCase()} ({companyName || businessName || designation || 'Self'})
                </td>
                <td className="p-1.5 bg-slate-50 font-semibold border-r border-slate-200">Verified Net Monthly Income:</td>
                <td className="p-1.5 font-bold">{formatCurrency(monthlyIncome)}</td>
              </tr>
              {step6Active && (
                <tr>
                  <td className="p-1.5 bg-slate-50 font-semibold border-r border-slate-200">Co-Applicant / Guarantor:</td>
                  <td className="p-1.5 border-r border-slate-200">
                    {coApplicantName} ({coApplicantRelationship})
                  </td>
                  <td className="p-1.5 bg-slate-50 font-semibold border-r border-slate-200">Co-Applicant PAN & Income:</td>
                  <td className="p-1.5">
                    {coApplicantPAN ? `••••••${coApplicantPAN.slice(-4)}` : 'N/A'} | {formatCurrency(coApplicantIncome)}/mo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. Key Fact Statement (KFS) Table */}
        <div className="print-avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
            2. Key Fact Statement (KFS) Financial Schedule
          </h2>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-1.5 text-left border-r border-slate-300 w-12 font-bold">Sr. No.</th>
                <th className="p-1.5 text-left border-r border-slate-300 font-bold">Parameter / Term</th>
                <th className="p-1.5 text-left font-bold">Details / Sanction Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 border-r border-slate-200 text-center font-mono">1</td>
                <td className="p-1.5 border-r border-slate-200 font-medium">Loan Product Category</td>
                <td className="p-1.5 font-bold uppercase">{loanType} Loan ({loanPurpose || 'Personal / General'})</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="p-1.5 border-r border-slate-200 text-center font-mono">2</td>
                <td className="p-1.5 border-r border-slate-200 font-semibold">Sanctioned Principal Loan Amount (P)</td>
                <td className="p-1.5 font-extrabold text-slate-900">{kfsSummary.formattedPrincipal}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 border-r border-slate-200 text-center font-mono">3</td>
                <td className="p-1.5 border-r border-slate-200 font-medium">Loan Tenure (n)</td>
                <td className="p-1.5 font-bold">{kfsSummary.tenureMonths} Months ({kfsSummary.tenureYears} Years)</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="p-1.5 border-r border-slate-200 text-center font-mono">4</td>
                <td className="p-1.5 border-r border-slate-200 font-medium">Annualized Percentage Rate (APR)</td>
                <td className="p-1.5 font-bold">{kfsSummary.interestRate}% per annum (Fixed Reducing Balance)</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 border-r border-slate-200 text-center font-mono">5</td>
                <td className="p-1.5 border-r border-slate-200 font-semibold">Equated Monthly Installment (EMI)</td>
                <td className="p-1.5 font-extrabold text-slate-900">{kfsSummary.formattedEMI} / month</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="p-1.5 border-r border-slate-200 text-center font-mono">6</td>
                <td className="p-1.5 border-r border-slate-200 font-medium">Total Interest Payable Over Tenure</td>
                <td className="p-1.5 font-bold">{kfsSummary.formattedInterest}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 border-r border-slate-200 text-center font-mono">7</td>
                <td className="p-1.5 border-r border-slate-200 font-medium">Upfront Processing Fee (1% + GST)</td>
                <td className="p-1.5 font-bold">{kfsSummary.formattedProcessingFee} (Deducted upfront at disbursal)</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="p-1.5 border-r border-slate-200 text-center font-mono">8</td>
                <td className="p-1.5 border-r border-slate-200 font-semibold">Net Disbursal Amount to Borrower</td>
                <td className="p-1.5 font-extrabold text-slate-900">{kfsSummary.formattedNetDisbursal}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 border-r border-slate-200 text-center font-mono">9</td>
                <td className="p-1.5 border-r border-slate-200 font-semibold">Total Amount Payable (Principal + Interest)</td>
                <td className="p-1.5 font-extrabold text-slate-900">{kfsSummary.formattedTotalRepayment}</td>
              </tr>
              <tr>
                <td className="p-1.5 border-r border-slate-200 text-center font-mono">10</td>
                <td className="p-1.5 border-r border-slate-200 font-medium">Repayment Mode & Schedule</td>
                <td className="p-1.5">Monthly NACH / e-Mandate auto-debit on 5th of each calendar month</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. Statutory Disclosures & Consents */}
        <div className="print-avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
            3. Regulatory Disclosures & Consents (RBI DL/2022/01)
          </h2>
          <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50 space-y-1.5 text-[9.5px] leading-relaxed text-slate-700">
            <p>
              <strong>• Cooling-off / Look-up Period: </strong>
              The borrower is entitled to an explicit cooling-off window of 3 business days post-disbursal to exit the credit facility by repaying the principal along with proportionate APR without any penalty.
            </p>
            <p>
              <strong>• Foreclosure / Prepayment Charges: </strong>
              In compliance with RBI circulars, zero foreclosure charges or prepayment penalties shall apply to individual floating-rate term loans.
            </p>
            <p>
              <strong>• Grievance Redressal Mechanism: </strong>
              Nodal Grievance Officer: grievance@lendswift.in | Helpline: 1800-200-5363. If complaints remain unresolved beyond 30 days, the borrower may escalate directly to the Reserve Bank of India Ombudsman via CMS Portal (cms.rbi.org.in).
            </p>
            <p>
              <strong>• Statutory Declarations Executed: </strong>
              Borrower has explicitly confirmed (1) Accuracy of all information, (2) Consent to pull credit records from CICs (CIBIL/Equifax/Experian/CRIF), (3) Acceptance of Digital Lending Agreement terms, and (4) Communication preferences.
            </p>
          </div>
        </div>

        {/* 4. Digital Signatures & NBFC Certification */}
        <div className="print-avoid-break pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-3">
            4. Digital Execution & Sign-off (Sec 3A, Information Technology Act 2000)
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* Borrower Signature */}
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50/40 flex flex-col justify-between items-center min-h-[110px]">
              <span className="text-[10px] font-bold text-slate-700 mb-1">Primary Borrower Signature</span>
              {signature ? (
                <img src={signature} alt="Borrower Digital Signature" className="h-12 max-w-full object-contain my-auto" />
              ) : (
                <span className="text-[10px] text-slate-400 italic my-auto">[Signature Affixed]</span>
              )}
              <div className="border-t border-slate-200 pt-1 w-full text-[9px] text-slate-500">
                <span className="font-semibold text-slate-800 block">{fullName}</span>
                <span>Date: {displayDate}</span>
              </div>
            </div>

            {/* Co-Applicant Signature */}
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50/40 flex flex-col justify-between items-center min-h-[110px]">
              <span className="text-[10px] font-bold text-slate-700 mb-1">Co-Applicant / Guarantor</span>
              {step6Active && coApplicantSignature ? (
                <img src={coApplicantSignature} alt="Co-Applicant Digital Signature" className="h-12 max-w-full object-contain my-auto" />
              ) : (
                <span className="text-[10px] text-slate-400 italic my-auto">
                  {step6Active ? '[Signature Affixed]' : '[Not Applicable]'}
                </span>
              )}
              <div className="border-t border-slate-200 pt-1 w-full text-[9px] text-slate-500">
                <span className="font-semibold text-slate-800 block">{step6Active ? coApplicantName : 'N/A'}</span>
                <span>{step6Active ? `Relation: ${coApplicantRelationship}` : 'Single Applicant'}</span>
              </div>
            </div>

            {/* NBFC Digital Seal */}
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50/40 flex flex-col justify-between items-center min-h-[110px]">
              <span className="text-[10px] font-bold text-slate-700 mb-1">LendSwift NBFC Certification</span>
              <div className="my-auto text-center">
                <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-brand-blue font-bold text-[9px]">
                  CERTIFIED & DIGITALLY SEALED
                </span>
                <p className="text-[8px] font-mono text-slate-500 mt-1">Token: 0x{displayRefNumber.replace(/[^A-Z0-9]/g, '')}</p>
              </div>
              <div className="border-t border-slate-200 pt-1 w-full text-[9px] text-slate-500">
                <span className="font-semibold text-slate-800 block">Authorized Underwriter System</span>
                <span>LendSwift FinServ Pvt Ltd</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[8.5px] text-slate-400 pt-2 border-t border-slate-200">
          This is an electronically generated Key Fact Statement & Sanction Advice valid without a physical signature under the Information Technology Act, 2000.
        </div>
      </div>
    </>
  );
};

export default Step8Review;
