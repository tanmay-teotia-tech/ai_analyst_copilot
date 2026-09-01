import type { Finding, PipelineLog, PresetSample } from './types';

export const SAMPLE_FINDINGS: Finding[] = [
  {
    id: 'finding-may-2026',
    bill_name: 'Westside Centre - May 2026 Statement',
    period: 'May 2026',
    status: 'likely_overcharge',
    reason: 'Statement includes $193,500 in EXCLUDED capital and administrative expenses (roof replacement, legal fees for lease negotiations, marketing commissions, and landlord admin salaries) charged as operating costs per Lease Clause 4.3. Tenant\'s 15% share of excluded expenses = $29,025 at risk.',
    evidence: 'Lease Clause 4.3 (Explicitly excludes structural repairs, landlord legal fees, marketing commissions, and admin salaries); Bill line items 11, 12, 13, 14 totaling $193,500.',
    amount_at_risk: '$29,025.00',
    amount_at_risk_num: 29025,
    confidence: 98,
    total_bill_amount: 338700,
    tenant_share_pct: 15,
    lineItems: [
      { id: 'm1', lineNumber: 1, description: 'Real Estate Taxes (Monthly Allocation)', category: 'Real Estate Taxes', amount: 45000, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 6750 },
      { id: 'm2', lineNumber: 2, description: 'Property Insurance Premium', category: 'Insurance', amount: 12500, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 1875 },
      { id: 'm3', lineNumber: 3, description: 'Common Area Electricity', category: 'Utilities', amount: 8200, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 1230 },
      { id: 'm4', lineNumber: 4, description: 'Common Area Water & Sewer', category: 'Utilities', amount: 3400, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 510 },
      { id: 'm5', lineNumber: 5, description: 'Janitorial Services (Common Areas)', category: 'Janitorial', amount: 15600, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 2340 },
      { id: 'm6', lineNumber: 6, description: 'Security Services', category: 'Security', amount: 22000, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 3300 },
      { id: 'm7', lineNumber: 7, description: 'Landscaping & Grounds Maintenance', category: 'Landscaping', amount: 6800, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 1020 },
      { id: 'm8', lineNumber: 8, description: 'HVAC Maintenance (Common Areas)', category: 'HVAC', amount: 9500, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 1425 },
      { id: 'm9', lineNumber: 9, description: 'Elevator Maintenance & Inspection', category: 'Elevator', amount: 4200, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 630 },
      { id: 'm10', lineNumber: 10, description: 'Property Management Fee (4% of Gross Rents)', category: 'Management Fee', amount: 18000, isExcluded: false, clauseReference: 'Clause 4.2 (Capped at 4%)', tenantShareAmount: 2700 },
      { id: 'm11', lineNumber: 11, description: 'ROOF REPLACEMENT - CAPITAL EXPENDITURE', category: 'Capital Expenditure (Structural)', amount: 125000, isExcluded: true, clauseReference: 'Clause 4.3 (Structural Repairs Excluded)', tenantShareAmount: 18750 },
      { id: 'm12', lineNumber: 12, description: 'LANDLORD LEGAL FEES - LEASE NEGOTIATION', category: 'Legal Fees', amount: 8500, isExcluded: true, clauseReference: 'Clause 4.3 (Unrelated Legal Fees Excluded)', tenantShareAmount: 1275 },
      { id: 'm13', lineNumber: 13, description: 'MARKETING COMMISSIONS - NEW TENANT LEASES', category: 'Leasing Commissions', amount: 25000, isExcluded: true, clauseReference: 'Clause 4.3 (Marketing Commissions Excluded)', tenantShareAmount: 3750 },
      { id: 'm14', lineNumber: 14, description: 'LANDLORD ADMINISTRATIVE SALARIES', category: 'Administrative Salaries', amount: 35000, isExcluded: true, clauseReference: 'Clause 4.3 (Landlord Admin Salaries Excluded)', tenantShareAmount: 5250 }
    ]
  },
  {
    id: 'finding-june-2026',
    bill_name: 'Westside Centre - June 2026 Statement',
    period: 'June 2026',
    status: 'safe',
    reason: 'All bill line items map to allowed operating expense categories under Lease Clause 4.2. Common area carpet replacement (line 11) is properly amortized over its useful life. Tenant\'s 15% share of $147,100 = $22,065 is correctly billed.',
    evidence: 'Lease Clause 4.2 (includes taxes, insurance, utilities, janitorial, security, landscaping, HVAC, elevator, management fees, amortized common area capital improvements); Bill line items 1-11 all compliant.',
    amount_at_risk: '$0.00',
    amount_at_risk_num: 0,
    confidence: 96,
    total_bill_amount: 147100,
    tenant_share_pct: 15,
    lineItems: [
      { id: 'j1', lineNumber: 1, description: 'Real Estate Taxes (Monthly Allocation)', category: 'Real Estate Taxes', amount: 45000, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 6750 },
      { id: 'j2', lineNumber: 2, description: 'Property Insurance Premium', category: 'Insurance', amount: 12500, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 1875 },
      { id: 'j3', lineNumber: 3, description: 'Common Area Electricity', category: 'Utilities', amount: 7800, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 1170 },
      { id: 'j4', lineNumber: 4, description: 'Common Area Water & Sewer', category: 'Utilities', amount: 3200, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 480 },
      { id: 'j5', lineNumber: 5, description: 'Janitorial Services (Common Areas)', category: 'Janitorial', amount: 15600, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 2340 },
      { id: 'j6', lineNumber: 6, description: 'Security Services', category: 'Security', amount: 22000, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 3300 },
      { id: 'j7', lineNumber: 7, description: 'Landscaping & Grounds Maintenance', category: 'Landscaping', amount: 6800, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 1020 },
      { id: 'j8', lineNumber: 8, description: 'HVAC Maintenance (Common Areas)', category: 'HVAC', amount: 9500, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 1425 },
      { id: 'j9', lineNumber: 9, description: 'Elevator Maintenance & Inspection', category: 'Elevator', amount: 4200, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 630 },
      { id: 'j10', lineNumber: 10, description: 'Property Management Fee (4% of Gross Rents)', category: 'Management Fee', amount: 18000, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 2700 },
      { id: 'j11', lineNumber: 11, description: 'Common Area Carpet Replacement (Amortized)', category: 'Amortized Capital Improvement', amount: 2500, isExcluded: false, clauseReference: 'Clause 4.2 (Amortized Allowed)', tenantShareAmount: 375 }
    ]
  },
  {
    id: 'finding-july-2026',
    bill_name: 'Westside Centre - July 2026 Statement',
    period: 'July 2026',
    status: 'needs_review',
    reason: 'Line item 5 ("Unclassified Miscellaneous Operations") contains vague description and lacks backup documentation. Cannot determine whether expense falls under Clause 4.2 (Included) or Clause 4.3 (Excluded).',
    evidence: 'Lease Clause 4.2 & 4.3; Bill line 5 lists $14,200 as "Miscellaneous" without itemized ledger or category breakdown.',
    amount_at_risk: 'Needs Verification ($2,130 at risk)',
    amount_at_risk_num: 2130,
    confidence: 62,
    total_bill_amount: 162500,
    tenant_share_pct: 15,
    lineItems: [
      { id: 'jul1', lineNumber: 1, description: 'Real Estate Taxes (Monthly Allocation)', category: 'Real Estate Taxes', amount: 45000, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 6750 },
      { id: 'jul2', lineNumber: 2, description: 'Property Insurance Premium', category: 'Insurance', amount: 12500, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 1875 },
      { id: 'jul3', lineNumber: 3, description: 'Common Area Electricity', category: 'Utilities', amount: 8900, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 1335 },
      { id: 'jul4', lineNumber: 4, description: 'Janitorial Services', category: 'Janitorial', amount: 15600, isExcluded: false, clauseReference: 'Clause 4.2', tenantShareAmount: 2340 },
      { id: 'jul5', lineNumber: 5, description: 'UNCLASSIFIED MISCELLANEOUS OPERATIONS', category: 'Unclear Category', amount: 14200, isExcluded: true, clauseReference: 'Requires Landlord Backup Ledger', tenantShareAmount: 2130 }
    ]
  }
];

export const STATUS_COLORS = {
  safe: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 glow-emerald',
    icon: 'text-emerald-400'
  },
  needs_review: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber',
    icon: 'text-amber-400'
  },
  likely_overcharge: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-rose',
    icon: 'text-rose-400'
  }
} as const;

export const STATUS_LABELS = {
  safe: 'Safe (Compliant)',
  needs_review: 'Needs Review',
  likely_overcharge: 'Likely Overcharge'
} as const;

export const SAMPLE_PIPELINE_LOGS: PipelineLog[] = [
  { id: 'log-1', timestamp: '12:50:01.102', node: 'webhook_1', level: 'INFO', message: 'Webhook trigger received payload from Lease Audit UI.' },
  { id: 'log-2', timestamp: '12:50:01.340', node: 'parse_1', level: 'TRACE', message: 'Ingested lease summary document (3,247 characters, 5 lease clauses).' },
  { id: 'log-3', timestamp: '12:50:01.890', node: 'parse_1', level: 'TRACE', message: 'Parsed May 2026 bill statement (14 line items, total $338,700.00).' },
  { id: 'log-4', timestamp: '12:50:02.150', node: 'prompt_1', level: 'INFO', message: 'Constructed LLM prompt with Article 4 Operating Expense Rules (Tenant Share: 15%).' },
  { id: 'log-5', timestamp: '12:50:02.920', node: 'llm_anthropic_1', level: 'TRACE', message: 'LLM reasoning step complete. Detected 4 prohibited line items matching Clause 4.3 exclusions.' },
  { id: 'log-6', timestamp: '12:50:03.210', node: 'extract_data_1', level: 'INFO', message: 'Extracted structured finding fields: status="likely_overcharge", amount_at_risk="$29,025.00".' },
  { id: 'log-7', timestamp: '12:50:03.580', node: 'prompt_validation_1', level: 'INFO', message: 'Validation rule check: 6/6 strict audit validation requirements passed.' },
  { id: 'log-8', timestamp: '12:50:03.910', node: 'response_answers_1', level: 'SUCCESS', message: 'Pipeline execution complete in 2.81 seconds. Structured findings returned.' }
];

export const WESTSIDE_SAMPLE: PresetSample = {
  id: 'westside-preset',
  title: 'Westside Centre Lease Audit Demo',
  description: 'Westside Centre Commercial Lease Agreement (Suite 400) + May, June & July 2026 Expense Statements.',
  leaseFileName: 'lease_summary.txt',
  leaseContent: `COMMERCIAL LEASE AGREEMENT - SUMMARY\nProperty: Westside Centre, 123 Main Street, Suite 400\nTenant: Acme Corporation\nLandlord: Westside Properties LLC\nLease Term: January 1, 2024 - December 31, 2028 (5 years)\nBase Rent: $25,000/month\n\nClause 4.1 - Tenant's Share: Tenant shall pay 15% of Building Operating Expenses as Additional Rent.\nClause 4.2 - Included Expenses: Taxes, Insurance, Common Area Utilities, Janitorial, Security, Landscaping, HVAC, Elevator, Management Fees (capped at 4%), Amortized Capital Improvements.\nClause 4.3 - Excluded Expenses: Structural capital expenditures (roof, foundation), Landlord legal fees, Marketing/leasing commissions, Administrative salaries.`,
  billFiles: [
    {
      name: 'bill_may_2026.txt',
      content: `WESTSIDE CENTRE - OPERATING EXPENSE STATEMENT\nBilling Period: May 2026\n11. ROOF REPLACEMENT - CAPITAL EXPENDITURE $125,000.00\n12. LANDLORD LEGAL FEES - LEASE NEGOTIATION $8,500.00\n13. MARKETING COMMISSIONS - NEW TENANT LEASES $25,000.00\n14. LANDLORD ADMINISTRATIVE SALARIES $35,000.00\nTOTAL: $338,700.00 | TENANT SHARE (15%): $50,805.00`
    },
    {
      name: 'bill_june_2026.txt',
      content: `WESTSIDE CENTRE - OPERATING EXPENSE STATEMENT\nBilling Period: June 2026\n11. Common Area Carpet Replacement (Amortized) $2,500.00\nTOTAL: $147,100.00 | TENANT SHARE (15%): $22,065.00`
    }
  ]
};