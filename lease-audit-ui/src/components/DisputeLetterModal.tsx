import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Printer, FileText, Scale } from 'lucide-react';
import type { Finding } from '../types';

interface DisputeLetterModalProps {
  finding: Finding | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DisputeLetterModal({ finding, isOpen, onClose }: DisputeLetterModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !finding) return null;

  const tenantName = finding.tenantName || '[Tenant Name]';
  const landlordName = finding.landlordName || '[Landlord Name]';
  const propertyName = finding.propertyName || 'Leased Premises';
  const tenantShareStr = finding.has_tenant_share !== false ? `${finding.tenant_share_pct}%` : '[Tenant Share %]';

  // Itemize actual excluded items from finding
  const excludedLineItems = (finding.lineItems || []).filter((item) => item.isExcluded);

  let itemizedText = '';
  let totalExcludedBuilding = 0;

  if (excludedLineItems.length > 0) {
    itemizedText = excludedLineItems
      .map((item, idx) => {
        totalExcludedBuilding += item.amount;
        return `${idx + 1}. Line #${item.lineNumber}: ${item.description} — $${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
   Classification: ${item.category}
   Lease Basis: ${item.clauseReference || 'Clause 4.3 (Excluded Expense)'}
   Evidence: ${item.evidence || 'Expense prohibited under lease operating reconciliation terms.'}`;
      })
      .join('\n\n');
  } else {
    itemizedText = `[No explicit excluded line items identified. Dispute applies to general reconciliation breakdown.]`;
  }

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const letterText = `FORMAL NOTICE OF OPERATING EXPENSE DISPUTE & AUDIT FINDING

Date: ${dateStr}

TO: Landlord: ${landlordName}
    Audit Operations & Property Management

RE: Formal Audit Notice — Prohibited Operating Expense Exclusions
    Property / Premises: ${propertyName}
    Tenant: ${tenantName}
    Billing Statement: ${finding.bill_name} (${finding.period})
    Total Disputed Building Cost: $${totalExcludedBuilding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    Tenant Proportionate Share (${tenantShareStr}): ${finding.amount_at_risk}

Dear Landlord Audit Operations,

Notice is hereby given on behalf of Tenant (${tenantName}) pursuant to the audit rights set forth in the Commercial Lease Agreement for ${propertyName}.

Upon audit of the ${finding.period} Operating Expense Statement (${finding.bill_name}), our lease audit engine identified prohibited operating expenses billed in violation of explicit lease provisions:

ITEMIZED PROHIBITED EXPENSES DISPUTED:
${itemizedText}

FINANCIAL RECONCILIATION SUMMARY:
- Total Prohibited Building Expenses: $${totalExcludedBuilding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
- Tenant Proportionate Share (${tenantShareStr}): ${finding.amount_at_risk}

Pursuant to the terms of the Lease Agreement, ${tenantName} hereby requests an immediate billing credit of ${finding.amount_at_risk} applied against Additional Rent, along with itemized backup ledgers for all underlying general accounts.

Sincerely,

Lease Administration & Audit Operations
${tenantName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl glass-panel rounded-3xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-6 bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 glow-rose">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Dynamic Landlord Dispute Letter
                </h3>
                <p className="text-xs text-slate-400">
                  Generated from uploaded audit data for {finding.bill_name} ({finding.amount_at_risk})
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

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-slate-200 bg-slate-950/90 leading-relaxed border-b border-slate-800">
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 font-sans space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Dispute Status: <span className="text-rose-400 font-bold uppercase">Ready for Review & Send</span>
                </span>
                <span>
                  Tenant Share: <span className="text-indigo-400 font-mono font-bold">{tenantShareStr}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Citing <span className="text-amber-300 font-semibold">{excludedLineItems.length} prohibited line item(s)</span> for a total tenant deduction request of{' '}
                <span className="text-rose-400 font-mono font-bold">{finding.amount_at_risk}</span>.
              </p>
            </div>

            <pre className="whitespace-pre-wrap font-mono p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-300">
              {letterText}
            </pre>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-900 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-400" /> Factual Audit Notice
            </span>

            <div className="flex items-center gap-3 ml-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-700"
              >
                <Printer className="w-4 h-4" /> Print / Export PDF
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCopy}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg glow-rose hover:from-rose-500 hover:to-indigo-500 transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Letter Text'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
