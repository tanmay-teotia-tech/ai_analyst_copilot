export interface LineItem {
  id: string;
  lineNumber: number;
  description: string;
  category: string;
  amount: number;
  isExcluded: boolean;
  isUncertain?: boolean;
  classification?: 'ALLOWED' | 'EXCLUDED' | 'UNCERTAIN';
  clauseReference?: string;
  tenantShareAmount: number;
  evidence?: string;
  confidence?: number;
}

export interface LeaseRule {
  id: string;
  category: string;
  description: string;
  allowed: boolean;
  clauseReference?: string;
  sourceEvidence: string;
  cap?: number;
  conditions?: string;
  keywords?: string[];
}

export interface ParsedLease {
  tenantName?: string;
  landlordName?: string;
  propertyName?: string;
  leaseTerm?: string;
  tenantSharePct?: number;
  tenantShareClause?: string;
  rules: LeaseRule[];
  rawText: string;
  warnings: string[];
  hasTenantShare: boolean;
  parseError?: boolean;
}

export interface ParsedBill {
  fileName: string;
  period: string;
  statementDate?: string;
  tenantName?: string;
  propertyName?: string;
  statedBuildingTotal?: number;
  statedTenantShareAmount?: number;
  lineItems: LineItem[];
  parsedTotalAmount: number;
  rawText: string;
  warnings: string[];
  parseError?: boolean;
}

export interface Finding {
  id: string;
  bill_name: string;
  period: string;
  status: 'safe' | 'needs_review' | 'likely_overcharge';
  reason: string;
  evidence: string;
  amount_at_risk: string;
  amount_at_risk_num: number;
  potential_exposure_num?: number;
  confidence: string | number;
  total_bill_amount: number;
  tenant_share_pct: number;
  has_tenant_share?: boolean;
  lineItems?: LineItem[];
  warnings?: string[];
  tenantName?: string;
  landlordName?: string;
  propertyName?: string;
  leaseTerm?: string;
  statedTenantShareAmount?: number;
  statedBuildingTotal?: number;
  totalAllowedBuilding?: number;
  totalExcludedBuilding?: number;
  totalUncertainBuilding?: number;
  executionLogs?: PipelineLog[];
}

export interface UploadedFile {
  file: File;
  name: string;
  content?: string;
  size?: number;
  type?: string;
}

export interface PipelineLog {
  id: string;
  timestamp: string;
  node: string;
  level: 'INFO' | 'TRACE' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
  details?: string;
}

export interface PresetSample {
  id: string;
  title: string;
  description: string;
  leaseFileName: string;
  leaseContent: string;
  billFiles: { name: string; content: string }[];
}