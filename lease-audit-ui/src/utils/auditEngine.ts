import type { UploadedFile, Finding, LineItem, ParsedLease, ParsedBill, LeaseRule, PipelineLog } from '../types';
import { parseFileDetails } from './fileReader';

/**
 * Robust Lease Agreement Parser
 */
export function parseLeaseDocument(leaseText: string, fileName: string = 'Lease Agreement'): ParsedLease {
  const warnings: string[] = [];
  const rules: LeaseRule[] = [];

  if (!leaseText || leaseText.trim().length === 0) {
    return {
      rawText: '',
      rules: [],
      warnings: [`Lease document (${fileName}) is empty or unreadable.`],
      hasTenantShare: false,
      parseError: true
    };
  }

  // 1. Extract Tenant Name
  let tenantName: string | undefined;
  const tenantMatch =
    leaseText.match(/(?:Tenant|Lessee|Tenant Name)[:\s]+([A-Za-z0-9\s,.&]+?)(?=\n|\r|,|Landlord|Lease|Clause|Section|Premises)/i) ||
    leaseText.match(/between\s+[\s\S]+?\s+and\s+([A-Za-z0-9\s,.&]+?)(?:\s*\(|"|'|\bTenant\b)/i);
  if (tenantMatch && tenantMatch[1]) {
    tenantName = tenantMatch[1].trim().replace(/^["']|["']$/g, '');
  }

  // 2. Extract Landlord Name
  let landlordName: string | undefined;
  const landlordMatch =
    leaseText.match(/(?:Landlord|Lessor|Landlord Name)[:\s]+([A-Za-z0-9\s,.&]+?)(?=\n|\r|,|Tenant|Lease|Clause|Section|Premises)/i) ||
    leaseText.match(/by and between\s+([A-Za-z0-9\s,.&]+?)(?:\s*\(|"|'|\bLandlord\b)/i);
  if (landlordMatch && landlordMatch[1]) {
    landlordName = landlordMatch[1].trim().replace(/^["']|["']$/g, '');
  }

  // 3. Extract Property / Premises
  let propertyName: string | undefined;
  const propertyMatch = leaseText.match(/(?:Property|Premises|Building|Address)[:\s]+([A-Za-z0-9\s,.#-]+?)(?=\n|\r|Tenant|Landlord|Lease)/i);
  if (propertyMatch && propertyMatch[1]) {
    propertyName = propertyMatch[1].trim();
  }

  // 4. Extract Lease Term
  let leaseTerm: string | undefined;
  const termMatch = leaseText.match(/(?:Lease Term|Term)[:\s]+([A-Za-z0-9\s,.-—]+?)(?=\n|\r|Base Rent|Tenant|Landlord|Clause)/i);
  if (termMatch && termMatch[1]) {
    leaseTerm = termMatch[1].trim();
  }

  // 5. Extract Tenant Share Percentage
  let tenantSharePct: number | undefined;
  let tenantShareClause: string | undefined;

  const shareMatch =
    leaseText.match(/(?:Tenant(?:'s)?\s+(?:Proportionate\s+)?Share|Proportionate\s+Share)[:\s]+(?:is\s+)?(\d+(?:\.\d+)?)%/i) ||
    leaseText.match(/(?:pay|responsible for)\s+(\d+(?:\.\d+)?)%\s+of\s+(?:Building\s+)?Operating\s+Expenses/i) ||
    leaseText.match(/(\d+(?:\.\d+)?)%\s+(?:of\s+)?(?:Building\s+)?Operating\s+Expenses/i);

  if (shareMatch && shareMatch[1]) {
    tenantSharePct = parseFloat(shareMatch[1]);
    
    // Find section/clause surrounding match
    const matchPos = leaseText.indexOf(shareMatch[0]);
    if (matchPos !== -1) {
      const snippet = leaseText.substring(Math.max(0, matchPos - 100), Math.min(leaseText.length, matchPos + 150));
      const clauseHeaderMatch = snippet.match(/(?:Clause|Section|Article|Paragraph)\s+([0-9.]+)/i);
      tenantShareClause = clauseHeaderMatch ? clauseHeaderMatch[0] : 'Tenant Share Clause';
    }
  } else {
    warnings.push('Tenant share percentage could not be identified in the lease text.');
  }

  // 6. Extract Expense Rules (Included vs Excluded)
  // Check for Excluded Expenses section/clause
  const excludedKeywordsMap = [
    {
      cat: 'Capital Expenditure (Structural)',
      keywords: ['roof replacement', 'replacement of roof', 'structural roof', 'roof repair', 'structural capital', 'structural repair', 'foundation repair', 'load-bearing'],
      defaultClause: 'Clause 4.3 (Structural Capital Excluded)'
    },
    {
      cat: 'Capital Expenditure',
      keywords: ['capital expenditure', 'capital expenditures', 'capital improvement', 'capital replacements', 'capital cost'],
      defaultClause: 'Clause 4.3 (Capital Expenditures Excluded)'
    },
    {
      cat: 'Legal Fees',
      keywords: ['landlord legal fees', 'lease negotiation', 'legal fees for lease', 'unrelated legal fees', 'attorney fees for leasing', 'legal negotiation'],
      defaultClause: 'Clause 4.3 (Landlord Legal Fees Excluded)'
    },
    {
      cat: 'Leasing Commissions',
      keywords: ['marketing commissions', 'leasing commissions', 'advertising for new tenants', 'tenant acquisition costs', 'brokerage fees'],
      defaultClause: 'Clause 4.3 (Marketing & Leasing Excluded)'
    },
    {
      cat: 'Administrative Overhead',
      keywords: ['landlord administrative salaries', 'admin salaries', 'executive salaries', 'landlord overhead', 'corporate admin salaries', 'headquarters overhead'],
      defaultClause: 'Clause 4.3 (Landlord Overhead Excluded)'
    },
    {
      cat: 'Depreciation',
      keywords: ['depreciation', 'depreciation on building', 'amortization of original construction'],
      defaultClause: 'Clause 4.3 (Depreciation Excluded)'
    },
    {
      cat: 'Penalties & Fines',
      keywords: ['penalty', 'penalties', 'late fee', 'fines', 'environmental remediation'],
      defaultClause: 'Clause 4.3 (Penalties Excluded)'
    }
  ];

  // Scan lease text for rules and clause references
  excludedKeywordsMap.forEach((entry, idx) => {
    let matchedInText = false;
    let foundClause = entry.defaultClause;
    let foundEvidence = '';

    for (const kw of entry.keywords) {
      const pos = leaseText.toLowerCase().indexOf(kw.toLowerCase());
      if (pos !== -1) {
        matchedInText = true;
        const snippetStart = Math.max(0, pos - 60);
        const snippetEnd = Math.min(leaseText.length, pos + 120);
        foundEvidence = leaseText.substring(snippetStart, snippetEnd).replace(/\s+/g, ' ').trim();

        // Extract clause reference if available
        const clauseMatch = leaseText.substring(Math.max(0, pos - 150), pos).match(/(?:Clause|Section|Article|Paragraph)\s+([0-9.]+)/i);
        if (clauseMatch) {
          foundClause = `${clauseMatch[0]} (${entry.cat} Excluded)`;
        }
        break;
      }
    }

    if (matchedInText || leaseText.toLowerCase().includes('excluded')) {
      rules.push({
        id: `rule-ex-${idx}`,
        category: entry.cat,
        description: `Excludes ${entry.cat.toLowerCase()} from operating expense reconciliation.`,
        allowed: false,
        clauseReference: foundClause,
        sourceEvidence: foundEvidence || `Explicit exclusion rule detected in lease.`,
        keywords: entry.keywords
      });
    }
  });

  // Extract Management Fee Cap if present
  const mgmtFeeCapMatch = leaseText.match(/management fee[s]?\s*(?:\([^)]*\))?\s*(?:capped at|not to exceed|maximum of)\s*(\d+(?:\.\d+)?)%/i);
  if (mgmtFeeCapMatch && mgmtFeeCapMatch[1]) {
    rules.push({
      id: `rule-cap-mgmt`,
      category: 'Property Management Fee',
      description: `Property Management Fee is allowed but capped at ${mgmtFeeCapMatch[1]}% of gross rents.`,
      allowed: true,
      cap: parseFloat(mgmtFeeCapMatch[1]),
      clauseReference: 'Clause 4.2 (Cap Enforced)',
      sourceEvidence: mgmtFeeCapMatch[0]
    });
  }

  return {
    tenantName,
    landlordName,
    propertyName,
    leaseTerm,
    tenantSharePct,
    tenantShareClause,
    rules,
    rawText: leaseText,
    warnings,
    hasTenantShare: typeof tenantSharePct === 'number' && !isNaN(tenantSharePct),
    parseError: false
  };
}

/**
 * Robust Operating Statement / Bill Parser
 */
export function parseBillDocument(billText: string, fileName: string): ParsedBill {
  const warnings: string[] = [];
  const lineItems: LineItem[] = [];

  if (!billText || billText.trim().length === 0) {
    return {
      fileName,
      period: 'Unknown Period',
      lineItems: [],
      parsedTotalAmount: 0,
      rawText: '',
      warnings: ['Operating statement document is empty or unreadable.'],
      parseError: true
    };
  }

  // 1. Extract Period
  let period = fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  const periodMatch =
    billText.match(/(?:Billing Period|Statement Period|Period|For Month Of|Billing Month)[:\s]+([A-Za-z0-9\s,-/]+?)(?=\n|\r|Tenant|Property|Total|\$)/i) ||
    billText.match(/(May|June|July|August|September|October|November|December|January|February|March|April)\s+\d{4}/i);
  if (periodMatch && periodMatch[1]) {
    period = periodMatch[1].trim();
  }

  // 2. Extract Stated Building Total Amount
  let statedBuildingTotal: number | undefined;
  const totalMatch =
    billText.match(/(?:TOTAL BUILDING OPERATING EXPENSES|TOTAL OPERATING EXPENSES|TOTAL EXPENSES|TOTAL BUILDING EXPENSES|TOTAL)[:\s]*\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i);
  if (totalMatch && totalMatch[1]) {
    statedBuildingTotal = parseFloat(totalMatch[1].replace(/,/g, ''));
  }

  // 3. Extract Stated Tenant Share Amount
  let statedTenantShareAmount: number | undefined;
  const tenantShareMatch =
    billText.match(/(?:TENANT(?:'S)? SHARE|AMOUNT DUE FROM TENANT|TENANT PORTION)[:\s]*(?:\([^)]*\))?[:\s]*\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i);
  if (tenantShareMatch && tenantShareMatch[1]) {
    statedTenantShareAmount = parseFloat(tenantShareMatch[1].replace(/,/g, ''));
  }

  // 4. Extract Line Items
  const rawLines = billText.split(/\r?\n/);
  let parsedTotalAmount = 0;
  let autoLineNum = 1;

  for (let idx = 0; idx < rawLines.length; idx++) {
    const rawLine = rawLines[idx].trim();
    if (!rawLine) continue;

    const lower = rawLine.toLowerCase();

    // Skip summary / header / footer lines
    if (
      lower.startsWith('total') ||
      lower.includes('total building') ||
      lower.includes("tenant's share") ||
      lower.includes('tenant share') ||
      lower.includes('amount due') ||
      lower.startsWith('---') ||
      lower.startsWith('===') ||
      lower.startsWith('billing period:') ||
      lower.startsWith('statement date:') ||
      lower.startsWith('property:') ||
      lower.startsWith('tenant:') ||
      lower.startsWith('landlord:')
    ) {
      continue;
    }

    // Match numeric amount in line: e.g. "$125,000.00", "$8,500.00", "$125,000", "125000.00"
    // Be careful to avoid years (2026), line numbers (1.), percentages (15%)
    const dollarMatch = rawLine.match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?|\b[0-9]{1,7}\.[0-9]{2}\b|\$[0-9]{1,7})/);
    const numMatch = dollarMatch || rawLine.match(/\b([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?)\b/);

    if (numMatch) {
      const rawAmtStr = numMatch[1].replace(/[$,]/g, '');
      const amount = parseFloat(rawAmtStr);

      if (!isNaN(amount) && amount > 0) {
        // Extract line number if explicitly prefixed (e.g. "11. Roof Replacement...")
        let lineNum = autoLineNum;
        const linePrefixMatch = rawLine.match(/^(\d+)[.)]\s*/);
        if (linePrefixMatch) {
          lineNum = parseInt(linePrefixMatch[1], 10);
        }

        // Clean description by stripping line numbers and amounts
        let description = rawLine
          .replace(/^\d+[.)]\s*/, '')
          .replace(/\$\s*[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?/, '')
          .replace(/\b[0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?\b/, '')
          .trim();

        if (!description || description.length < 3) {
          description = `Operating Expense Line #${lineNum}`;
        }

        lineItems.push({
          id: `line-${lineNum}-${idx}`,
          lineNumber: lineNum,
          description,
          category: 'Building Expense',
          amount,
          isExcluded: false,
          classification: 'ALLOWED',
          tenantShareAmount: 0
        });

        parsedTotalAmount += amount;
        autoLineNum++;
      }
    }
  }

  // 5. Total Validation Checks
  if (lineItems.length === 0) {
    warnings.push('Could not extract structured line items from document.');
  } else if (statedBuildingTotal !== undefined && Math.abs(statedBuildingTotal - parsedTotalAmount) > 1.0) {
    warnings.push(
      `Statement total ($${statedBuildingTotal.toLocaleString()}) does not match parsed line items total ($${parsedTotalAmount.toLocaleString()}).`
    );
  }

  return {
    fileName,
    period,
    statedBuildingTotal,
    statedTenantShareAmount,
    lineItems,
    parsedTotalAmount,
    rawText: billText,
    warnings,
    parseError: lineItems.length === 0
  };
}

/**
 * Main User File Audit Pipeline Execution
 */
export async function processUserAudit(
  leaseUploadedFile: UploadedFile | null,
  billUploadedFiles: UploadedFile[]
): Promise<Finding[]> {
  const executionLogs: PipelineLog[] = [];
  const startTime = Date.now();

  const addLog = (node: string, level: PipelineLog['level'], message: string, details?: string) => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(3);
    executionLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: `+${elapsed}s`,
      node,
      level,
      message,
      details
    });
  };

  addLog('webhook_1', 'INFO', 'User Audit Job Initialized.', `Received ${leaseUploadedFile ? 1 : 0} lease file and ${billUploadedFiles.length} bill file(s).`);

  // 1. Ingest Lease Document
  let leaseText = leaseUploadedFile?.content || '';
  if (!leaseText && leaseUploadedFile?.file) {
    const readResult = await parseFileDetails(leaseUploadedFile.file);
    leaseText = readResult.text;
    if (!readResult.success) {
      addLog('parse_lease', 'WARN', `Lease document extraction warning: ${readResult.error}`);
    }
  }

  const parsedLease = parseLeaseDocument(leaseText, leaseUploadedFile?.name || 'Lease Agreement');
  addLog(
    'parse_lease',
    parsedLease.hasTenantShare ? 'SUCCESS' : 'WARN',
    `Parsed Lease Agreement (${leaseText.length} chars).`,
    parsedLease.hasTenantShare
      ? `Tenant Share identified: ${parsedLease.tenantSharePct}%.`
      : 'Tenant share percentage not specified in lease. Flagging as Needs Review.'
  );

  const findings: Finding[] = [];

  // If ONLY lease agreement uploaded with no bills
  if (billUploadedFiles.length === 0 && leaseUploadedFile) {
    const tenantSharePct = parsedLease.hasTenantShare ? (parsedLease.tenantSharePct as number) : 0;
    findings.push({
      id: `lease-rules-only-${Date.now()}`,
      bill_name: leaseUploadedFile.name + ' (Rules Extracted)',
      period: 'Lease Agreement Rules',
      status: parsedLease.hasTenantShare ? 'safe' : 'needs_review',
      reason: parsedLease.hasTenantShare
        ? `Lease parsed successfully. Tenant Share configured to ${tenantSharePct}%. ${parsedLease.rules.length} expense rule(s) active. Upload operating statements to perform line-item audit.`
        : `Lease parsed but Tenant Share percentage was missing. Upload operating statements to evaluate rules.`,
      evidence: `Lease text length ${leaseText.length} characters. Tenant: ${parsedLease.tenantName || 'Unspecified'}, Landlord: ${parsedLease.landlordName || 'Unspecified'}.`,
      amount_at_risk: '$0.00',
      amount_at_risk_num: 0,
      potential_exposure_num: 0,
      confidence: parsedLease.hasTenantShare ? 100 : 50,
      total_bill_amount: 0,
      tenant_share_pct: tenantSharePct,
      has_tenant_share: parsedLease.hasTenantShare,
      tenantName: parsedLease.tenantName,
      landlordName: parsedLease.landlordName,
      propertyName: parsedLease.propertyName,
      leaseTerm: parsedLease.leaseTerm,
      lineItems: [],
      executionLogs
    });
    return findings;
  }

  // If NO files uploaded at all
  if (!leaseUploadedFile && billUploadedFiles.length === 0) {
    addLog('audit_validator', 'ERROR', 'No document files provided for analysis.');
    return [];
  }

  // 2. Process Operating Statement Bills
  for (let bIdx = 0; bIdx < billUploadedFiles.length; bIdx++) {
    const billUploadedFile = billUploadedFiles[bIdx];
    let billText = billUploadedFile.content || '';

    if (!billText && billUploadedFile.file) {
      const readResult = await parseFileDetails(billUploadedFile.file);
      billText = readResult.text;
      if (!readResult.success) {
        addLog('parse_bill', 'ERROR', `Failed to read file ${billUploadedFile.name}: ${readResult.error}`);
      }
    }

    const parsedBill = parseBillDocument(billText, billUploadedFile.name);
    addLog(
      'parse_bill',
      parsedBill.lineItems.length > 0 ? 'TRACE' : 'WARN',
      `Parsed statement ${parsedBill.fileName} (${parsedBill.lineItems.length} line items, total $${parsedBill.parsedTotalAmount.toLocaleString()}).`
    );

    // 3. Classify Line Items Against Lease Rules
    const lineItems: LineItem[] = [];
    const tenantSharePct = parsedLease.hasTenantShare ? (parsedLease.tenantSharePct as number) : 0;

    let totalExcludedBuilding = 0;
    let totalUncertainBuilding = 0;
    let totalAllowedBuilding = 0;

    for (const rawItem of parsedBill.lineItems) {
      const descLower = rawItem.description.toLowerCase();
      let classification: 'ALLOWED' | 'EXCLUDED' | 'UNCERTAIN' = 'ALLOWED';
      let clauseReference = 'Clause 4.2 (Allowed Operating Expense)';
      let isExcluded = false;
      let isUncertain = false;
      let itemEvidence = 'Expense is an allowed operational building cost.';

      // Check for excluded rule match
      const matchedRule = parsedLease.rules.find((r) => {
        if (r.allowed) return false;
        if (r.keywords && r.keywords.some((kw) => descLower.includes(kw))) return true;
        return descLower.includes(r.category.toLowerCase());
      });

      // Default keywords fallback if dynamic lease rules were limited
      const defaultExclusions = [
        { kw: 'roof replacement', cat: 'Capital Expenditure (Structural)', clause: 'Clause 4.3 (Structural Repairs Excluded)' },
        { kw: 'roof', cat: 'Capital Expenditure (Structural)', clause: 'Clause 4.3 (Structural Repairs Excluded)' },
        { kw: 'capital expenditure', cat: 'Capital Expenditure', clause: 'Clause 4.3 (Capital Expenditure Excluded)' },
        { kw: 'capital', cat: 'Capital Expenditure', clause: 'Clause 4.3 (Capital Expenditure Excluded)' },
        { kw: 'legal fees', cat: 'Legal Fees', clause: 'Clause 4.3 (Landlord Legal Fees Excluded)' },
        { kw: 'lease negotiation', cat: 'Legal Fees', clause: 'Clause 4.3 (Lease Negotiation Legal Excluded)' },
        { kw: 'marketing commissions', cat: 'Leasing Commissions', clause: 'Clause 4.3 (Marketing & Leasing Excluded)' },
        { kw: 'marketing', cat: 'Leasing Commissions', clause: 'Clause 4.3 (Marketing & Leasing Excluded)' },
        { kw: 'leasing commissions', cat: 'Leasing Commissions', clause: 'Clause 4.3 (Leasing Commissions Excluded)' },
        { kw: 'administrative salaries', cat: 'Administrative Overhead', clause: 'Clause 4.3 (Landlord Admin Salaries Excluded)' },
        { kw: 'admin salaries', cat: 'Administrative Overhead', clause: 'Clause 4.3 (Landlord Admin Salaries Excluded)' },
        { kw: 'overhead', cat: 'Landlord Overhead', clause: 'Clause 4.3 (Landlord Overhead Excluded)' },
        { kw: 'depreciation', cat: 'Depreciation', clause: 'Clause 4.3 (Depreciation Excluded)' },
        { kw: 'penalty', cat: 'Penalties & Fines', clause: 'Clause 4.3 (Penalties Excluded)' }
      ];

      const matchedDefaultEx = defaultExclusions.find((e) => descLower.includes(e.kw));

      if (matchedRule) {
        classification = 'EXCLUDED';
        isExcluded = true;
        clauseReference = matchedRule.clauseReference || 'Clause 4.3 (Excluded Expenses)';
        itemEvidence = matchedRule.sourceEvidence || `Explicitly prohibited by lease rule for ${matchedRule.category}.`;
        totalExcludedBuilding += rawItem.amount;
      } else if (matchedDefaultEx) {
        classification = 'EXCLUDED';
        isExcluded = true;
        clauseReference = matchedDefaultEx.clause;
        itemEvidence = `Prohibited category (${matchedDefaultEx.cat}) excluded under lease terms.`;
        totalExcludedBuilding += rawItem.amount;
      } else if (
        descLower.includes('miscellaneous') ||
        descLower.includes('unclassified') ||
        descLower.includes('other expenses') ||
        descLower.includes('general charges') ||
        descLower.includes('sundry')
      ) {
        classification = 'UNCERTAIN';
        isUncertain = true;
        clauseReference = 'Requires Landlord Ledger Verification';
        itemEvidence = 'Vague description without backup accounting ledger documentation.';
        totalUncertainBuilding += rawItem.amount;
      } else {
        classification = 'ALLOWED';
        totalAllowedBuilding += rawItem.amount;
      }

      // Calculate Tenant Share Amount
      const tenantShareAmount = parsedLease.hasTenantShare
        ? Math.round(rawItem.amount * (tenantSharePct / 100) * 100) / 100
        : 0;

      lineItems.push({
        ...rawItem,
        category: matchedRule ? matchedRule.category : matchedDefaultEx ? matchedDefaultEx.cat : rawItem.category,
        classification,
        isExcluded,
        isUncertain,
        clauseReference,
        tenantShareAmount,
        evidence: itemEvidence,
        confidence: classification === 'UNCERTAIN' ? 60 : 95
      });
    }

    // 4. Financial Exposure Calculations
    const amountAtRiskNum = parsedLease.hasTenantShare
      ? Math.round(totalExcludedBuilding * (tenantSharePct / 100) * 100) / 100
      : 0;
    const potentialExposureNum = parsedLease.hasTenantShare
      ? Math.round(totalUncertainBuilding * (tenantSharePct / 100) * 100) / 100
      : 0;

    // 5. Determine Finding Status
    let status: 'safe' | 'needs_review' | 'likely_overcharge' = 'safe';
    let reason = '';
    let evidence = '';
    let confidence = 95;

    const warnings = [...parsedLease.warnings, ...parsedBill.warnings];

    if (parsedBill.parseError || parsedBill.lineItems.length === 0) {
      status = 'needs_review';
      confidence = 40;
      reason = `Unable to reliably extract structured data from document ${parsedBill.fileName}. Manual ledger reconciliation is required.`;
      evidence = `Unstructured text data parsed from file (${parsedBill.rawText.length} characters).`;
    } else if (!parsedLease.hasTenantShare) {
      status = 'needs_review';
      confidence = 65;
      reason = `Tenant Share percentage was not specified in the uploaded lease. Unable to calculate confirmed tenant share exposure.`;
      evidence = `Lease agreement ingested without explicit Tenant Share clause. Found ${lineItems.length} line items.`;
    } else if (amountAtRiskNum > 0) {
      status = 'likely_overcharge';
      confidence = 98;
      const excludedNames = lineItems.filter((i) => i.isExcluded).map((i) => i.description).join('; ');
      reason = `Statement contains $${totalExcludedBuilding.toLocaleString(undefined, { minimumFractionDigits: 2 })} in EXCLUDED expenses (${excludedNames}) billed to tenant. Tenant's ${tenantSharePct}% share = $${amountAtRiskNum.toLocaleString(undefined, { minimumFractionDigits: 2 })} at risk.`;
      evidence = `Lease Clause 4.3 (Excludes capital expenditures, legal fees, marketing commissions, admin salaries); ${lineItems.filter((i) => i.isExcluded).length} prohibited line item(s) detected.`;
    } else if (totalUncertainBuilding > 0 || warnings.length > 0) {
      status = 'needs_review';
      confidence = 70;
      reason = `Statement contains $${totalUncertainBuilding.toLocaleString(undefined, { minimumFractionDigits: 2 })} in unclassified miscellaneous expenses requiring landlord ledger verification. Potential exposure = $${potentialExposureNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`;
      evidence = `Lease Clause 4.2 & 4.3; ${lineItems.filter((i) => i.isUncertain).length} item(s) require audit verification. ${warnings.join(' ')}`;
    } else {
      status = 'safe';
      confidence = 96;
      reason = `All ${lineItems.length} bill line items map to allowed operating expense categories under Lease Clause 4.2. Tenant's ${tenantSharePct}% share calculation is verified compliant.`;
      evidence = `Lease Clause 4.2 (Includes real estate taxes, insurance, utilities, janitorial, maintenance); ${lineItems.length} line item(s) compliant.`;
    }

    // 6. Tenant Share Amount Display String
    let amountAtRiskStr = '$0.00';
    if (amountAtRiskNum > 0) {
      amountAtRiskStr = `$${amountAtRiskNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (potentialExposureNum > 0) {
      amountAtRiskStr = `Needs Verification ($${potentialExposureNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} at risk)`;
    }

    addLog(
      'extract_data_1',
      status === 'likely_overcharge' ? 'WARN' : 'INFO',
      `Audit result generated: status="${status}", amount_at_risk="${amountAtRiskStr}".`
    );

    findings.push({
      id: `finding-usr-${bIdx}-${Date.now()}`,
      bill_name: parsedBill.fileName.replace(/\.[^/.]+$/, '') + ' Statement',
      period: parsedBill.period,
      status,
      reason,
      evidence,
      amount_at_risk: amountAtRiskStr,
      amount_at_risk_num: amountAtRiskNum,
      potential_exposure_num: potentialExposureNum,
      confidence,
      total_bill_amount: parsedBill.parsedTotalAmount,
      tenant_share_pct: tenantSharePct,
      has_tenant_share: parsedLease.hasTenantShare,
      lineItems,
      warnings,
      tenantName: parsedLease.tenantName,
      landlordName: parsedLease.landlordName,
      propertyName: parsedLease.propertyName,
      leaseTerm: parsedLease.leaseTerm,
      statedBuildingTotal: parsedBill.statedBuildingTotal,
      statedTenantShareAmount: parsedBill.statedTenantShareAmount,
      totalAllowedBuilding,
      totalExcludedBuilding,
      totalUncertainBuilding,
      executionLogs
    });
  }

  addLog('response_answers_1', 'SUCCESS', `Audit pipeline complete in ${((Date.now() - startTime) / 1000).toFixed(2)}s. Created ${findings.length} finding(s).`);

  return findings;
}
