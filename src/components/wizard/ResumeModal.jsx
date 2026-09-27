import { History, Play, RefreshCw } from 'lucide-react';

const ResumeModal = ({ isOpen, draft, onResume, onStartFresh }) => {
  if (!isOpen || !draft) return null;

  const formattedTime = draft.timestamp
    ? new Date(draft.timestamp).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
          <History className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 id="resume-dialog-title" className="text-lg font-bold text-slate-900">
            Resume Previous Application?
          </h2>
          <p className="text-xs text-slate-600">
            We discovered an encrypted draft saved on this browser. You can pick up where you left off or start a brand new application.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Loan Category:</span>
            <span className="font-bold text-slate-900 capitalize">{draft.loanType} Loan</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last Active Step:</span>
            <span className="font-semibold text-brand-blue">Step {draft.step}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Saved On:</span>
            <span className="text-slate-700 font-medium">{formattedTime}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={onResume}
            className="flex-1 py-2.5 px-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm min-h-touch"
          >
            <Play className="w-3.5 h-3.5" />
            Resume Application
          </button>
          <button
            type="button"
            onClick={onStartFresh}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-touch"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeModal;
