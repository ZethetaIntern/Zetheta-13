import Wizard from './components/wizard/Wizard';
import { ShieldCheck, Lock, Award, Headphones } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white font-black text-xl shadow-xs">
              LS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  LendSwift
                </span>
                <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full">
                  NBFC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">
                Digital Lending Platform
              </p>
            </div>
          </div>

          {/* Security & Regulatory Badges */}
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:flex items-center gap-2 text-slate-600 font-medium">
              <span className="flex items-center gap-1 text-brand-green font-semibold">
                <ShieldCheck className="w-4 h-4" />
                RBI Reg. NBFC
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                256-bit AES
              </span>
            </div>

            <a
              href="tel:18002005363"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-brand-blue" />
              <span className="hidden sm:inline">Support:</span> 1800-200-5363
            </a>
          </div>
        </div>
      </header>

      {/* Wizard Form Area */}
      <div className="flex-1">
        <Wizard />
      </div>

      {/* Regulatory Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-blue" />
              <span className="font-semibold text-slate-700">
                LendSwift Financial Services Private Limited (CIN: U65929DL2021PTC384912)
              </span>
            </div>
            <span>RBI Registration Certificate No: N-14.03291</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-slate-500 leading-relaxed">
            <div>
              <h4 className="font-bold text-slate-700 mb-1">RBI DL/2022/01 Compliance</h4>
              <p>
                LendSwift strictly complies with RBI Guidelines on Digital Lending. No hidden charges, no pre-ticked consents, and strict data minimality.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 mb-1">Cooling-Off Period & Rights</h4>
              <p>
                Borrowers are entitled to an explicit cooling-off window of 3 days to exit without penalty by repaying principal and proportionate APR.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 mb-1">Grievance Redressal Mechanism</h4>
              <p>
                Nodal Grievance Officer: grievance@lendswift.in. Unresolved complaints beyond 30 days can be escalated to the RBI Ombudsman (cms.rbi.org.in).
              </p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2">
            © 2026 LendSwift Financial Services. All rights reserved. Built with WCAG 2.1 AA accessibility standards.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
