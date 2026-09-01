import { motion } from 'motion/react';
import { DollarSign, ShieldAlert, FileSpreadsheet, TrendingDown, AlertTriangle } from 'lucide-react';
import type { Finding } from '../types';

interface MetricCardsProps {
  findings: Finding[];
}

export function MetricCards({ findings }: MetricCardsProps) {
  const totalBillAmount = findings.reduce((acc, f) => acc + (f.total_bill_amount || 0), 0);
  const totalConfirmedAtRisk = findings.reduce((acc, f) => acc + (f.amount_at_risk_num || 0), 0);
  const totalPotentialReview = findings.reduce((acc, f) => acc + (f.potential_exposure_num || 0), 0);

  const overchargeCount = findings.filter((f) => f.status === 'likely_overcharge').length;
  const safeCount = findings.filter((f) => f.status === 'safe').length;
  const reviewCount = findings.filter((f) => f.status === 'needs_review').length;

  // Extract actual Tenant Share % from active findings
  let tenantShareBadge = 'Unspecified Share';
  if (findings.length > 0) {
    const validShareFinding = findings.find((f) => f.has_tenant_share && f.tenant_share_pct > 0);
    if (validShareFinding) {
      tenantShareBadge = `${validShareFinding.tenant_share_pct}% Tenant Share`;
    } else if (findings.every((f) => f.tenant_share_pct === 15)) {
      tenantShareBadge = '15% Tenant Share';
    } else {
      tenantShareBadge = 'Needs Share %';
    }
  }

  // Calculate Average Confidence
  const avgConfidence =
    findings.length > 0
      ? Math.round(
          findings.reduce((acc, f) => acc + (typeof f.confidence === 'number' ? f.confidence : parseInt(String(f.confidence), 10) || 75), 0) /
            findings.length
        )
      : 100;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const cards = [
    {
      title: 'Total Audited Expenses',
      value: formatCurrency(totalBillAmount),
      subtitle: `${findings.length} Statement${findings.length === 1 ? '' : 's'} Analyzed`,
      icon: DollarSign,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
      glow: 'glow-blue',
      badge: tenantShareBadge
    },
    {
      title: 'Confirmed Overcharges',
      value: formatCurrency(totalConfirmedAtRisk),
      subtitle: `${overchargeCount} Prohibited Item${overchargeCount === 1 ? '' : 's'} Flagged`,
      icon: ShieldAlert,
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30',
      glow: 'glow-rose',
      badge: totalConfirmedAtRisk > 0 ? 'Action Required' : 'No Overcharges',
      badgeColor: totalConfirmedAtRisk > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      title: 'Potential Review Exposure',
      value: formatCurrency(totalPotentialReview),
      subtitle: `${safeCount} Safe / ${reviewCount} Needs Review`,
      icon: AlertTriangle,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      glow: 'glow-amber',
      badge: 'Uncertain Items',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      title: 'Audit Accuracy & Confidence',
      value: `${avgConfidence}% Match`,
      subtitle: 'Deterministic TypeScript Engine',
      icon: FileSpreadsheet,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
      glow: 'glow-indigo',
      badge: 'Rules Engine v2.4'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`p-5 rounded-2xl glass-card border bg-gradient-to-br ${card.color} ${card.glow} relative overflow-hidden flex flex-col justify-between group transition-all`}
          >
            {/* Ambient Background Gradient Accent */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor || 'bg-slate-800/80 text-slate-300 border-slate-700'}`}>
                  {card.badge}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2 mb-1">
                <motion.span
                  key={card.value}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono"
                >
                  {card.value}
                </motion.span>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5 mt-2">
              <span>{card.subtitle}</span>
              {card.title === 'Confirmed Overcharges' && totalConfirmedAtRisk > 0 && (
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5" /> Recoverable
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
