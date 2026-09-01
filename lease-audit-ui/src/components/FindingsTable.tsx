import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, AlertCircle, FileText, Search, ShieldAlert, Sparkles, Scale, ListFilter } from 'lucide-react';
import type { Finding } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../sampleFindings';

interface FindingsTableProps {
  findings: Finding[];
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  onOpenDisputeLetter: (finding: Finding) => void;
  isLoading?: boolean;
}

export function FindingsTable({
  findings,
  selectedIndex,
  onSelect,
  onOpenDisputeLetter,
  isLoading = false
}: FindingsTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredFindings = findings.filter((f) => {
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    const matchesSearch =
      f.bill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.evidence.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: Finding['status']) => {
    switch (status) {
      case 'safe':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'needs_review':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'likely_overcharge':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6 glass-panel rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 text-indigo-400 font-semibold animate-pulse mb-4">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Executing Client-Side Document Audit Engine & Rule Matcher...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
            className="h-20 bg-slate-900/80 border border-slate-800 rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Audit Findings & Line Item Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a row to expand itemized audit ledger or draft a formal landlord dispute letter
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bill or rule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            {[
              { id: 'all', label: `All (${findings.length})` },
              { id: 'likely_overcharge', label: `Overcharges (${findings.filter(f => f.status === 'likely_overcharge').length})` },
              { id: 'needs_review', label: `Review (${findings.filter(f => f.status === 'needs_review').length})` },
              { id: 'safe', label: `Safe (${findings.filter(f => f.status === 'safe').length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Content */}
      {filteredFindings.length === 0 ? (
        <div className="text-center py-16 px-4">
          <ListFilter className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">No findings match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6">Statement / Bill Name</th>
                <th className="py-4 px-4">Audit Status</th>
                <th className="py-4 px-4">Amount at Risk</th>
                <th className="py-4 px-4">Confidence</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <AnimatePresence mode="popLayout">
                {filteredFindings.map((finding, idx) => {
                  const isExpanded = selectedIndex === idx;
                  const statusStyle = STATUS_COLORS[finding.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.needs_review;
                  const tenantShareLabel = finding.has_tenant_share !== false ? `${finding.tenant_share_pct}% Tenant Share` : 'Tenant Share Unstated';

                  return (
                    <tr key={finding.id || finding.bill_name} className="contents group">
                      <motion.td
                        colSpan={5}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="p-0"
                      >
                        <div
                          onClick={() => onSelect(isExpanded ? null : idx)}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 gap-4 cursor-pointer transition-all ${
                            isExpanded ? 'bg-indigo-950/20 border-l-4 border-indigo-500' : 'hover:bg-slate-900/60'
                          }`}
                        >
                          {/* Bill Name */}
                          <div className="flex items-center gap-3 min-w-[240px]">
                            <div className={`p-2 rounded-xl border ${statusStyle.bg}`}>
                              {getStatusIcon(finding.status)}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                                {finding.bill_name}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-mono">
                                Statement Period: {finding.period} • Total Billed: ${finding.total_bill_amount ? finding.total_bill_amount.toLocaleString() : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="min-w-[140px]">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.badge}`}>
                              {getStatusIcon(finding.status)}
                              {STATUS_LABELS[finding.status as keyof typeof STATUS_LABELS] || finding.status}
                            </span>
                          </div>

                          {/* Amount at Risk */}
                          <div className="min-w-[140px]">
                            <span className="font-mono text-sm font-extrabold text-slate-100 block">
                              {finding.amount_at_risk}
                            </span>
                            <span className="text-[10px] text-slate-400">{tenantShareLabel}</span>
                          </div>

                          {/* Confidence Badge */}
                          <div className="min-w-[100px]">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              typeof finding.confidence === 'number' && finding.confidence >= 90
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}>
                              {typeof finding.confidence === 'number' ? `${finding.confidence}%` : finding.confidence} Match
                            </span>
                          </div>

                          {/* Action Expand */}
                          <div className="flex items-center gap-2 justify-end min-w-[140px]">
                            {finding.status === 'likely_overcharge' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenDisputeLetter(finding);
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 transition-all flex items-center gap-1.5"
                              >
                                <Scale className="w-3.5 h-3.5 text-rose-400" />
                                <span>Draft Letter</span>
                              </motion.button>
                            )}

                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>

                        {/* Itemized Evidence & Ledger Drawer */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-slate-950/90 border-t border-b border-slate-800 p-6 space-y-6"
                            >
                              {/* Validation Warnings (if any) */}
                              {finding.warnings && finding.warnings.length > 0 && (
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold block mb-0.5">Audit Statement Discrepancy Warnings:</span>
                                    <ul className="list-disc list-inside space-y-1">
                                      {finding.warnings.map((w, wIdx) => (
                                        <li key={wIdx}>{w}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {/* Analysis Reason & Clause Evidence */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                                    Audit Finding Rationale
                                  </span>
                                  <p className="text-xs text-slate-200 leading-relaxed">{finding.reason}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono text-xs">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1 font-sans">
                                    Lease Clause Evidence & Rules
                                  </span>
                                  <p className="text-slate-300 leading-relaxed">{finding.evidence}</p>
                                </div>
                              </div>

                              {/* Itemized Line-Items Ledger */}
                              {finding.lineItems && finding.lineItems.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-indigo-400" />
                                    Statement Line-Item Audit Ledger
                                  </h4>
                                  <div className="rounded-2xl border border-slate-800 overflow-hidden">
                                    <table className="w-full text-left text-xs font-mono">
                                      <thead>
                                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px]">
                                          <th className="py-2.5 px-4">Line #</th>
                                          <th className="py-2.5 px-4">Expense Description</th>
                                          <th className="py-2.5 px-4">Classification</th>
                                          <th className="py-2.5 px-4 text-right">Building Cost</th>
                                          <th className="py-2.5 px-4 text-right">Tenant Share ({finding.tenant_share_pct}%)</th>
                                          <th className="py-2.5 px-4">Lease Clause Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-800/50">
                                        {finding.lineItems.map((item) => (
                                          <tr
                                            key={item.id}
                                            className={
                                              item.isExcluded
                                                ? 'bg-rose-500/10 hover:bg-rose-500/15'
                                                : item.isUncertain
                                                ? 'bg-amber-500/10 hover:bg-amber-500/15'
                                                : 'hover:bg-slate-900/40'
                                            }
                                          >
                                            <td className="py-2.5 px-4 font-bold text-slate-400">#{item.lineNumber}</td>
                                            <td className={`py-2.5 px-4 font-sans ${item.isExcluded ? 'font-bold text-rose-300' : item.isUncertain ? 'font-semibold text-amber-300' : 'text-slate-200'}`}>
                                              {item.description}
                                            </td>
                                            <td className="py-2.5 px-4 text-slate-400 text-[11px]">{item.category}</td>
                                            <td className="py-2.5 px-4 text-right text-slate-200">${item.amount.toLocaleString()}</td>
                                            <td className={`py-2.5 px-4 text-right font-bold ${item.isExcluded ? 'text-rose-400' : item.isUncertain ? 'text-amber-400' : 'text-slate-300'}`}>
                                              ${item.tenantShareAmount.toLocaleString()}
                                            </td>
                                            <td className="py-2.5 px-4">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                item.isExcluded
                                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                                  : item.isUncertain
                                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                              }`}>
                                                {item.clauseReference || (item.isExcluded ? 'Excluded Expense' : 'Allowed Expense')}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.td>
                    </tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}