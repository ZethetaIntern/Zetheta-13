import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';

const StepNavigation = ({
  _currentStep,
  _totalSteps,
  isFirstStep,
  isLastStep,
  onPrevious,
  onNext,
  onSaveDraft,
  isValidating = false,
  lastSavedText,
}) => {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
      {/* Back Button */}
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPrevious();
              }
            }}
            disabled={isValidating}
            className="min-h-touch px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
        )}
      </div>

      {/* Save Draft & Status */}
      <div className="flex items-center gap-3">
        {lastSavedText && (
          <span className="hidden sm:inline text-xs text-slate-500 font-medium">
            {lastSavedText}
          </span>
        )}

        <button
          type="button"
          onClick={onSaveDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSaveDraft();
            }
          }}
          disabled={isValidating}
          className="min-h-touch px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          <Save className="w-3.5 h-3.5 text-slate-500" />
          Save Draft
        </button>

        {/* Next Button (Only on Steps 1 to 7; Step 8 has Submit button) */}
        {!isLastStep && (
          <button
            type="button"
            onClick={onNext}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNext();
              }
            }}
            disabled={isValidating}
            className="min-h-touch px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default StepNavigation;
