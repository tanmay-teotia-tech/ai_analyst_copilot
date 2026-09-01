import { motion } from 'motion/react';
import { FileSearch, Sparkles, Terminal, BookOpen, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onLoadPreset: () => void;
  onOpenTrace: () => void;
  onOpenLeaseRules: () => void;
  isProcessing: boolean;
}

export function Header({ onLoadPreset, onOpenTrace, onOpenLeaseRules, isProcessing }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-4 z-40 mb-8 rounded-2xl glass-panel p-4 md:p-6 shadow-2xl border border-slate-800"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg glow-indigo text-white flex items-center justify-center"
          >
            <FileSearch className="w-7 h-7" />
          </motion.div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                Lease Audit Copilot
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Client Audit Engine
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Automated Commercial Lease Operating Expense Audit & Overcharge Prevention Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 md:gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLoadPreset}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Load Sample Data</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenLeaseRules}
            className="px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700/80 hover:text-white transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Lease Clauses</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenTrace}
            className="px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-900/90 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-950/40 transition-all flex items-center gap-2"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Pipeline Trace</span>
          </motion.button>

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Engine Ready</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
