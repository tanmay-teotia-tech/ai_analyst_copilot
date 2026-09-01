import { describe, it, expect } from 'vitest';
import { parseLeaseDocument, parseBillDocument, processUserAudit } from './auditEngine';
import type { UploadedFile } from '../types';

describe('Lease Audit Copilot Engine Unit Tests', () => {
  // TEST 1: Lease says 15%. Bill contains excluded roof replacement. Expected: LIKELY_OVERCHARGE.
  it('TEST 1: Lease says 15%. Bill contains excluded roof replacement -> LIKELY_OVERCHARGE', async () => {
    const leaseText = `Commercial Lease Agreement. Tenant: Acme Corp. Clause 4.1: Tenant's Share is 15%. Clause 4.3 Excluded: Roof replacement and capital expenditures.`;
    const billText = `Billing Period: May 2026\n1. Real Estate Taxes $45,000.00\n2. ROOF REPLACEMENT - CAPITAL EXPENDITURE $125,000.00`;

    const mockLease: UploadedFile = {
      file: new File([leaseText], 'lease.txt', { type: 'text/plain' }),
      name: 'lease.txt',
      content: leaseText
    };
    const mockBill: UploadedFile = {
      file: new File([billText], 'bill.txt', { type: 'text/plain' }),
      name: 'bill.txt',
      content: billText
    };

    const findings = await processUserAudit(mockLease, [mockBill]);
    expect(findings.length).toBe(1);
    expect(findings[0].status).toBe('likely_overcharge');
    expect(findings[0].amount_at_risk_num).toBe(18750); // $125,000 * 15% = $18,750
  });

  // TEST 2: Lease says 10%. Bill contains excluded expense of $10,000. Expected amount at risk: $1,000.
  it('TEST 2: Lease says 10%. Bill contains excluded expense $10,000 -> amount at risk $1,000', async () => {
    const leaseText = `Lease Agreement. Tenant shall pay 10% of Building Operating Expenses. Clause 4.3: Landlord Legal Fees are excluded.`;
    const billText = `Billing Period: June 2026\n1. Common Area Janitorial $5,000.00\n2. Landlord Legal Fees for Lease Negotiation $10,000.00`;

    const mockLease: UploadedFile = {
      file: new File([leaseText], 'lease.txt', { type: 'text/plain' }),
      name: 'lease.txt',
      content: leaseText
    };
    const mockBill: UploadedFile = {
      file: new File([billText], 'bill.txt', { type: 'text/plain' }),
      name: 'bill.txt',
      content: billText
    };

    const findings = await processUserAudit(mockLease, [mockBill]);
    expect(findings[0].tenant_share_pct).toBe(10);
    expect(findings[0].amount_at_risk_num).toBe(1000); // $10,000 * 10% = $1,000
    expect(findings[0].status).toBe('likely_overcharge');
  });

  // TEST 3: Lease says 12.5%. System must calculate 12.5%, not 15%.
  it('TEST 3: Lease says 12.5%. System calculates 12.5%, not 15%', async () => {
    const leaseText = `Tenant's Proportionate Share is 12.5% of Operating Expenses. Excludes roof replacement.`;
    const billText = `Billing Period: July 2026\n1. Roof Replacement $100,000.00`;

    const mockLease: UploadedFile = {
      file: new File([leaseText], 'lease.txt', { type: 'text/plain' }),
      name: 'lease.txt',
      content: leaseText
    };
    const mockBill: UploadedFile = {
      file: new File([billText], 'bill.txt', { type: 'text/plain' }),
      name: 'bill.txt',
      content: billText
    };

    const findings = await processUserAudit(mockLease, [mockBill]);
    expect(findings[0].tenant_share_pct).toBe(12.5);
    expect(findings[0].amount_at_risk_num).toBe(12500); // $100,000 * 12.5% = $12,500
  });

  // TEST 4: Bill has unknown miscellaneous expense. Expected: NEEDS_REVIEW.
  it('TEST 4: Bill has unknown miscellaneous expense -> NEEDS_REVIEW', async () => {
    const leaseText = `Tenant Share: 15%. Included: Taxes, Utilities, Insurance. Excluded: Capital Expenses.`;
    const billText = `Billing Period: August 2026\n1. Real Estate Taxes $10,000.00\n2. Unclassified Miscellaneous Operations $5,000.00`;

    const mockLease: UploadedFile = {
      file: new File([leaseText], 'lease.txt', { type: 'text/plain' }),
      name: 'lease.txt',
      content: leaseText
    };
    const mockBill: UploadedFile = {
      file: new File([billText], 'bill.txt', { type: 'text/plain' }),
      name: 'bill.txt',
      content: billText
    };

    const findings = await processUserAudit(mockLease, [mockBill]);
    expect(findings[0].status).toBe('needs_review');
    expect(findings[0].potential_exposure_num).toBe(750); // $5,000 * 15% = $750
  });

  // TEST 5: Missing amount. Expected: NEEDS_REVIEW.
  it('TEST 5: Missing amount / unparseable line item -> NEEDS_REVIEW', async () => {
    const leaseText = `Tenant Share: 15%.`;
    const billText = `Billing Period: September 2026\nItem without any dollar amount string here`;

    const mockLease: UploadedFile = {
      file: new File([leaseText], 'lease.txt', { type: 'text/plain' }),
      name: 'lease.txt',
      content: leaseText
    };
    const mockBill: UploadedFile = {
      file: new File([billText], 'bill.txt', { type: 'text/plain' }),
      name: 'bill.txt',
      content: billText
    };

    const findings = await processUserAudit(mockLease, [mockBill]);
    expect(findings[0].status).toBe('needs_review');
  });

  // TEST 6: Bill total does not equal parsed line-item total. Expected: validation warning.
  it('TEST 6: Bill total != sum of line items -> validation warning & confidence check', async () => {
    const billText = `Billing Period: October 2026\n1. Janitorial $5,000.00\n2. Utilities $5,000.00\nTOTAL BUILDING OPERATING EXPENSES: $25,000.00`;
    const parsed = parseBillDocument(billText, 'statement.txt');
    expect(parsed.parsedTotalAmount).toBe(10000);
    expect(parsed.statedBuildingTotal).toBe(25000);
    expect(parsed.warnings.length).toBeGreaterThan(0);
    expect(parsed.warnings[0]).toContain('does not match');
  });

  // TEST 7: All expenses clearly allowed. Expected: SAFE.
  it('TEST 7: All expenses clearly allowed -> SAFE', async () => {
    const leaseText = `Tenant Share: 15%. Included Expenses: Real Estate Taxes, Insurance, Janitorial, Utilities. Excluded: Roof Replacement.`;
    const billText = `Billing Period: November 2026\n1. Real Estate Taxes $15,000.00\n2. Property Insurance $5,000.00\n3. Common Area Electricity $3,000.00`;

    const mockLease: UploadedFile = {
      file: new File([leaseText], 'lease.txt', { type: 'text/plain' }),
      name: 'lease.txt',
      content: leaseText
    };
    const mockBill: UploadedFile = {
      file: new File([billText], 'bill.txt', { type: 'text/plain' }),
      name: 'bill.txt',
      content: billText
    };

    const findings = await processUserAudit(mockLease, [mockBill]);
    expect(findings[0].status).toBe('safe');
    expect(findings[0].amount_at_risk_num).toBe(0);
  });

  // TEST 8: Lease does not contain tenant share. Expected: NEEDS_REVIEW.
  it('TEST 8: Lease missing tenant share -> NEEDS_REVIEW', async () => {
    const leaseText = `Commercial Lease Agreement without explicit tenant share mentioned. Clause 4.3 Excluded: Structural Roof Replacement.`;
    const billText = `Billing Period: December 2026\n1. Roof Replacement $50,000.00`;

    const mockLease: UploadedFile = {
      file: new File([leaseText], 'lease.txt', { type: 'text/plain' }),
      name: 'lease.txt',
      content: leaseText
    };
    const mockBill: UploadedFile = {
      file: new File([billText], 'bill.txt', { type: 'text/plain' }),
      name: 'bill.txt',
      content: billText
    };

    const findings = await processUserAudit(mockLease, [mockBill]);
    expect(findings[0].status).toBe('needs_review');
    expect(findings[0].has_tenant_share).toBe(false);
  });

  // TEST 9: PDF Lease + PDF Bill extraction verification structure
  it('TEST 9: Lease parser correctly extracts Tenant Name, Landlord Name, Property and Tenant Share', () => {
    const text = `LEASE AGREEMENT\nTenant: Apex Retail Group\nLandlord: Horizon Properties LLC\nProperty: 500 Commerce Way\nClause 4.1 - Tenant Share: Tenant shall pay 14.5% of Operating Expenses.`;
    const parsed = parseLeaseDocument(text, 'lease.pdf');
    expect(parsed.tenantName).toBe('Apex Retail Group');
    expect(parsed.landlordName).toBe('Horizon Properties LLC');
    expect(parsed.propertyName).toBe('500 Commerce Way');
    expect(parsed.tenantSharePct).toBe(14.5);
  });

  // TEST 10: DOCX Lease + XLSX Bill extraction verification structure
  it('TEST 10: Bill parser preserves line numbers, periods, and formats', () => {
    const text = `OPERATING EXPENSE RECONCILIATION STATEMENT\nBilling Period: Q1 2026\n10. HVAC Maintenance $4,200.00\n15. Marketing Commissions $18,000.00`;
    const parsed = parseBillDocument(text, 'statement.xlsx');
    expect(parsed.period).toBe('Q1 2026');
    expect(parsed.lineItems.length).toBe(2);
    expect(parsed.lineItems[0].lineNumber).toBe(10);
    expect(parsed.lineItems[1].lineNumber).toBe(15);
  });
});
