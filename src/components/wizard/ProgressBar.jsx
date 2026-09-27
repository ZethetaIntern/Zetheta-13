import { Check } from 'lucide-react';

const ALL_STEPS = [
  { id: 1, title: 'Loan Product', short: 'Product' },
  { id: 2, title: 'Personal Info', short: 'Personal' },
  { id: 3, title: 'KYC & Identity', short: 'KYC' },
  { id: 4, title: 'Address Details', short: 'Address' },
  { id: 5, title: 'Employment', short: 'Income' },
  { id: 6, title: 'Co-Applicant', short: 'Co-App', conditional: true },
  { id: 7, title: 'Documents', short: 'Docs' },
  { id: 8, title: 'Review & Submit', short: 'Review' },
];

const ProgressBar = ({ currentStep, activeSteps, completedSteps = [] }) => {
  // Filter steps based on whether Step 6 is in activeSteps
  const displayedSteps = ALL_STEPS.filter((s) => activeSteps.includes(s.id));
  const activeIndex = displayedSteps.findIndex((s) => s.id === currentStep);
  const totalActive = displayedSteps.length;
  const percent = Math.round(((activeIndex + 1) / totalActive) * 100);

  return (
    <div className="w-full bg-white border-b border-slate-200 px-4 py-3.5 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto">
        {/* Mobile View: Simple Bar with Percentage */}
        <div className="sm:hidden">
          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
            <span className="text-brand-blue">
              Step {activeIndex + 1} of {totalActive}: {displayedSteps[activeIndex]?.title}
            </span>
            <span className="text-slate-500">{percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Application progress: ${percent}% completed`}
            className="w-full bg-slate-200 rounded-full h-2 overflow-hidden"
          >
            <div
              className="bg-brand-blue h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Desktop / Tablet View: Stepper Breadcrumb */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between relative">
            {/* Connecting Track Line */}
            <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-200 -z-0" />
            <div
              className="absolute left-4 top-4 h-0.5 bg-brand-blue -z-0 transition-all duration-300"
              style={{
                width: `calc(${percent}% - 2rem)`,
                maxWidth: 'calc(100% - 2rem)',
              }}
            />

            {displayedSteps.map((step, idx) => {
              const isCurrent = step.id === currentStep;
              const isCompleted = completedSteps.includes(step.id) || idx < activeIndex;

              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                      isCompleted
                        ? 'bg-brand-green text-white shadow-xs'
                        : isCurrent
                        ? 'bg-brand-blue text-white ring-4 ring-blue-100 shadow-sm'
                        : 'bg-white border-2 border-slate-300 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={`text-[11px] font-medium mt-1.5 whitespace-nowrap ${
                      isCurrent
                        ? 'text-brand-blue font-bold'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.short}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
