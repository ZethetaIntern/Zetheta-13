import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import ProgressBar from './ProgressBar';
import StepNavigation from './StepNavigation';
import ResumeModal from './ResumeModal';
import Step1LoanType from '../steps/Step1LoanType';
import Step2PersonalInfo from '../steps/Step2PersonalInfo';
import Step3KYC from '../steps/Step3KYC';
import Step4Address from '../steps/Step4Address';
import Step5Employment from '../steps/Step5Employment';
import Step6CoApplicant from '../steps/Step6CoApplicant';
import Step7Documents from '../steps/Step7Documents';
import Step8Review from '../steps/Step8Review';
import { getStepSchema } from '../../schemas/schemaFactory';
import { isStep6Required } from '../../schemas/step6Schema';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useFormPersistence } from '../../hooks/useFormPersistence';
import { Shield } from 'lucide-react';

const STEP_COMPONENTS = {
  1: Step1LoanType,
  2: Step2PersonalInfo,
  3: Step3KYC,
  4: Step4Address,
  5: Step5Employment,
  6: Step6CoApplicant,
  7: Step7Documents,
  8: Step8Review,
};

const INITIAL_FORM_VALUES = {
  loanType: 'personal',
  loanAmount: 300000,
  loanTenure: 24,
  loanPurpose: '',
  referralCode: '',
  fullName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  fatherName: '',
  motherName: '',
  email: '',
  mobileNumber: '',
  alternateMobile: '',
  panNumber: '',
  aadhaarNumber: '',
  aadhaarConsent: false,
  voterId: '',
  passport: '',
  panVerified: false,
  aadhaarVerified: false,
  addressLine1: '',
  addressLine2: '',
  pinCode: '',
  city: '',
  state: '',
  residenceType: '',
  monthlyRent: '',
  yearsAtCurrentAddress: '',
  prevAddressLine1: '',
  prevPinCode: '',
  prevCity: '',
  prevState: '',
  sameAsPermanent: true,
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentPinCode: '',
  permanentCity: '',
  permanentState: '',
  employmentType: 'salaried',
  companyName: '',
  designation: '',
  monthlyIncome: '',
  yearsOfExperience: '',
  businessName: '',
  businessType: '',
  annualTurnover: '',
  yearsInBusiness: '',
  gstNumber: '',
  officeAddress: '',
  coApplicantName: '',
  coApplicantRelationship: '',
  coApplicantPAN: '',
  coApplicantPanVerified: false,
  coApplicantIncome: '',
  coApplicantConsent: false,
  coApplicantSignature: '',
  documents: {},
  signature: '',
  consentAccuracy: false,
  consentCreditBureau: false,
  consentTerms: false,
  consentCommunication: false,
  riskAcknowledgement: false,
};

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const contentAreaRef = useRef(null);

  const methods = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: INITIAL_FORM_VALUES,
  });

  const { watch, reset, setError, clearErrors, getValues } = methods;
  const formValues = watch();

  // Determine active steps dynamically
  const step6Active = isStep6Required(formValues.loanType, formValues.loanAmount);
  const activeSteps = step6Active ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 7, 8];

  // Auto-Save hook: runs every 30s with AES-256 encryption
  const { lastSaved, toastMessage, saveNow } = useAutoSave(formValues, currentStep, 30000);

  // Form persistence hook for resume modal on page load
  const { savedDraft, showResumeModal, resumeDraft, discardDraft, clearCurrentDraft } =
    useFormPersistence();

  // Focus management: move focus to first input on step change (Accessibility Section B4.2 / E2)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentAreaRef.current) {
        const firstInput = contentAreaRef.current.querySelector(
          'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
        );
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 50);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Handle Resume
  const handleResume = async () => {
    const restored = await resumeDraft();
    if (restored && restored.formData) {
      reset(restored.formData);
      // Validate that target step is valid
      const targetStep = activeSteps.includes(restored.step) ? restored.step : 1;
      setCurrentStep(targetStep);
    }
  };

  // Handle Start Fresh
  const handleStartFresh = () => {
    discardDraft();
    reset(INITIAL_FORM_VALUES);
    setCurrentStep(1);
  };

  // Validate current step using Zod schema
  const validateStep = async (stepNum) => {
    const currentValues = getValues();
    const schema = getStepSchema(stepNum, currentValues);
    clearErrors();

    const result = schema.safeParse(currentValues);

    if (!result.success) {
      // Map Zod errors to React Hook Form, retaining earliest specific error per field
      const seenFields = new Set();
      result.error.errors.forEach((err) => {
        const fieldName = err.path.join('.');
        if (!seenFields.has(fieldName)) {
          seenFields.add(fieldName);
          setError(fieldName, {
            type: 'manual',
            message: err.message,
          });
        }
      });
      return false;
    }
    return true;
  };

  // Handle Next step transition (with double-click protection)
  const handleNext = async () => {
    if (isValidating) return; // Prevent double trigger / spam
    setIsValidating(true);

    try {
      const isValid = await validateStep(currentStep);
      if (isValid) {
        setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])));

        // Determine next step from latest active steps calculation
        const currentVals = getValues();
        const is6Active = isStep6Required(currentVals.loanType, currentVals.loanAmount);
        const dynamicActiveSteps = is6Active ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 7, 8];
        const currentIndex = dynamicActiveSteps.indexOf(currentStep);
        if (currentIndex !== -1 && currentIndex < dynamicActiveSteps.length - 1) {
          const nextStepId = dynamicActiveSteps[currentIndex + 1];
          setCurrentStep(nextStepId);
        }
      }
    } catch (e) {
      console.error('Validation error:', e);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle Previous step transition
  const handlePrevious = () => {
    if (isValidating) return;
    clearErrors();
    const currentVals = getValues();
    const is6Active = isStep6Required(currentVals.loanType, currentVals.loanAmount);
    const dynamicActiveSteps = is6Active ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 7, 8];
    const currentIndex = dynamicActiveSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStepId = dynamicActiveSteps[currentIndex - 1];
      setCurrentStep(prevStepId);
    }
  };

  // Jump directly to step (from Review edit button)
  const handleJumpToStep = (stepNumber) => {
    if (activeSteps.includes(stepNumber)) {
      clearErrors();
      setCurrentStep(stepNumber);
    }
  };

  // Final submission handler
  const handleFinalSubmitSuccess = (_record) => {
    clearCurrentDraft(formValues.loanType);
  };

  const CurrentStepComponent = STEP_COMPONENTS[currentStep] || Step1LoanType;
  const isFirstStep = currentStep === activeSteps[0];
  const isLastStep = currentStep === activeSteps[activeSteps.length - 1];

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        {/* Top Progress Stepper */}
        <ProgressBar
          currentStep={currentStep}
          activeSteps={activeSteps}
          completedSteps={completedSteps}
        />

        {/* Auto-Save Subtle Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-40 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-2 animate-fade-in"
          >
            <Shield className="w-4 h-4 text-brand-green" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Resume Modal on Page Load */}
        <ResumeModal
          isOpen={showResumeModal}
          draft={savedDraft}
          onResume={handleResume}
          onStartFresh={handleStartFresh}
        />

        {/* Main Application Card */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <div
            ref={contentAreaRef}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8"
          >
            {/* Render Active Step Component */}
            <CurrentStepComponent
              onJumpToStep={handleJumpToStep}
              onSubmitSuccess={handleFinalSubmitSuccess}
            />

            {/* Step Navigation Controls (Back / Save / Next) */}
            <StepNavigation
              currentStep={currentStep}
              totalSteps={activeSteps.length}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSaveDraft={() => saveNow()}
              isValidating={isValidating}
              lastSavedText={lastSaved ? `Draft saved ${lastSaved}` : null}
            />
          </div>
        </main>
      </div>
    </FormProvider>
  );
};

export default Wizard;
