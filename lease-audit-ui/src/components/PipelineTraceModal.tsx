import { motion, AnimatePresence } from 'motion/react';
import { X, Terminal, CheckCircle2, Cpu } from 'lucide-react';
import type { PipelineLog } from '../types';
import { SAMPLE_PIPELINE_LOGS } from '../sampleFindings';

interface PipelineTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs?: PipelineLog[];
}

export function PipelineTraceModal({ isOpen, onClose, logs }: PipelineTraceModalProps) {
  if (!isOpen) return null;

  const displayLogs = logs && logs.length > 0 ? logs : SAMPLE_PIPELINE_LOGS;

  const pipelineNodes = [
    { id: 'webhook_1', label: '1. Ingest Files', type: 'source' },
    { id: 'parse_lease', label: '2. Parse Lease', type: 'lease' },
    { id: 'parse_bill', label: '3. Parse Bill', type: 'bill' },
    { id: 'rule_evaluator', label: '4. Match Rules', type: 'rules' },
    { id: 'extract_data_1', label: '5. Exposure Math', type: 'math' },
    { id: 'audit_validator', label: '6. Validation', type: 'validator' },
    { id: 'response_answers_1', label: '7. Findings Output', type: 'output' }
  ];

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
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 glow-emerald">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Client Audit Engine Pipeline Trace
                </h3>
                <p className="text-xs text-slate-400">
                  Deterministic Audit Execution Graph ({displayLogs.length} execution logs recorded)
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

          {/* Node Flow Visualizer */}
          <div className="p-6 bg-slate-950 border-b border-slate-800 overflow-x-auto">
            <div className="flex items-center justify-between gap-3 min-w-[700px]">
              {pipelineNodes.map((node, i) => (
                <div key={node.id} className="flex items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1 text-center min-w-[105px] relative group"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200">{node.label}</span>
                    <span className="text-[9px] font-mono text-slate-500">{node.id}</span>
                  </motion.div>
                  {i < pipelineNodes.length - 1 && (
                    <div className="w-4 h-0.5 bg-slate-800 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-emerald-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Console Logs */}
          <div className="p-6 bg-slate-950 font-mono text-xs overflow-y-auto space-y-3 flex-1 min-h-[250px]">
            {displayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-colors"
              >
                <span className="text-slate-500 select-none min-w-[50px]">{log.timestamp}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.level === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : log.level === 'WARN'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : log.level === 'ERROR'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : log.level === 'TRACE'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-amber-400 font-semibold min-w-[100px]">{log.node}</span>
                <div className="flex-1">
                  <span className="text-slate-200 block">{log.message}</span>
                  {log.details && <span className="text-[11px] text-slate-400 block mt-0.5">{log.details}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Deterministic Pipeline Execution Validated
            </span>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all border border-slate-700"
            >
              Close Pipeline Log
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
