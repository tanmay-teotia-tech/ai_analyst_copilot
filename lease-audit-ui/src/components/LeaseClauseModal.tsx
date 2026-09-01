import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, CheckCircle, XCircle, ShieldCheck, FileText } from 'lucide-react';

interface LeaseClauseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaseClauseModal({ isOpen, onClose }: LeaseClauseModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl glass-panel rounded-3xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 glow-indigo">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Lease Provisions Matrix (Article 4)
                </h3>
                <p className="text-xs text-slate-400">
                  Westside Centre Commercial Lease Agreement • Tenant Share: 15% Additional Rent
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clauses Content */}
          <div className="p-6 overflow-y-auto space-y-6 bg-slate-950/90 text-sm">
            {/* Clause 4.1 & 4.4 Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                <div className="flex items-center gap-2 font-bold text-indigo-300 mb-1">
                  <ShieldCheck className="w-4 h-4" /> Clause 4.1 - Tenant Share
                </div>
                <p className="text-xs text-slate-300">
                  Tenant pays exactly <span className="text-indigo-400 font-mono font-bold">15%</span> of total Building Operating Expenses as Additional Rent.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
                  <CheckCircle className="w-4 h-4" /> Clause 4.4 - Audit Rights
                </div>
                <p className="text-xs text-slate-300">
                  Tenant has the express right to audit Landlord's ledgers within <span className="text-emerald-400 font-bold">180 days</span> of statement receipt.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 font-bold text-purple-300 mb-1">
                  <FileText className="w-4 h-4" /> Clause 4.5 - Occupancy Gross-Up
                </div>
                <p className="text-xs text-slate-300">
                  If building occupancy drops below 80%, expenses are grossed up to <span className="text-purple-400 font-bold">80% occupancy</span> limit.
                </p>
              </div>
            </div>

            {/* Allowed vs Excluded Expenses Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clause 4.2 Allowed */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-base font-bold text-emerald-400 mb-3 pb-2 border-b border-slate-800">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Clause 4.2 - Included Operating Expenses
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Real estate taxes and municipal assessments</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Property, liability, and casualty insurance premiums</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Common area utilities (electricity, water, gas)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Janitorial, security, landscaping & grounds care</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> HVAC and elevator maintenance & inspection</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Property management fees (capped at 4% of gross rents)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Common area capital improvements (amortized)</li>
                </ul>
              </div>

              {/* Clause 4.3 Excluded */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/30">
                <div className="flex items-center gap-2 text-base font-bold text-rose-400 mb-3 pb-2 border-b border-slate-800">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  Clause 4.3 - Prohibited Excluded Expenses
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2 text-rose-300 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Structural capital expenditures (roof, foundation, load-bearing)</li>
                  <li className="flex items-center gap-2 text-rose-300 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Landlord legal fees unrelated to building ops</li>
                  <li className="flex items-center gap-2 text-rose-300 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Marketing and leasing commissions</li>
                  <li className="flex items-center gap-2 text-rose-300 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Landlord overhead & corporate admin salaries</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Depreciation on building or equipment</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Fines, late fees, or environmental remediation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-900 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all border border-slate-700"
            >
              Close Reference Matrix
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
