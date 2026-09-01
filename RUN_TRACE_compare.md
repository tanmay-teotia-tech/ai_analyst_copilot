# RocketRide Pipeline Trace - Comparison Step

## Pipeline: `lease_audit_compare.pipe` / `lease_audit_full.pipe`

### Test 1: Happy Path - Lease + Bill with Excluded Expense (May 2026 Bill)

**Input**: `data/input/lease_summary.txt` + `data/input/bill_may_2026.txt`

**Expected LLM Analysis**:
- Bill contains 4 clearly excluded items (lines 11-14):
  - Line 11: ROOF REPLACEMENT - CAPITAL EXPENDITURE $125,000.00 → Excluded per Clause 4.3 (structural repairs)
  - Line 12: LANDLORD LEGAL FEES - LEASE NEGOTIATION $8,500.00 → Excluded per Clause 4.3 (legal fees unrelated to building ops)
  - Line 13: MARKETING COMMISSIONS - NEW TENANT LEASES $25,000.00 → Excluded per Clause 4.3 (marketing/leasing commissions)
  - Line 14: LANDLORD ADMINISTRATIVE SALARIES $35,000.00 → Excluded per Clause 4.3 (overhead/admin salaries not building-related)
- Total excluded: $193,500.00
- Tenant's share (15%): $29,025.00
- Allowed items (lines 1-10): $145,200.00 → Tenant's share: $21,780.00
- Bill total tenant share: $50,805.00 (includes excluded amounts)

**Expected Finding Output**:
```json
{
  "bill_name": "Westside Centre - May 2026",
  "status": "likely_overcharge",
  "reason": "Bill includes $193,500 in excluded expenses (roof replacement, legal fees, marketing commissions, admin salaries) that should not be charged to tenant per Lease Clause 4.3. Tenant's 15% share of excluded amounts = $29,025 at risk.",
  "evidence": "Lease Clause 4.3 (excludes structural capital expenditures, landlord legal fees, marketing commissions, admin salaries); Bill lines 11-14 ($125,000 + $8,500 + $25,000 + $35,000 = $193,500 excluded)",
  "amount_at_risk": "$29,025",
  "confidence": "high"
}
```

---

### Test 2: No Issue - Lease + Bill Following Rules (June 2026 Bill)

**Input**: `data/input/lease_summary.txt` + `data/input/bill_june_2026.txt`

**Expected LLM Analysis**:
- All bill lines (1-11) map to allowed categories in Clause 4.2:
  - Lines 1-10: Standard operating expenses (taxes, insurance, utilities, janitorial, security, landscaping, HVAC, elevator, management fees)
  - Line 11: Common area carpet replacement (amortized) → Allowed per Clause 4.2 (common area capital improvements amortized)
- No excluded expense categories present
- Total: $147,100.00 → Tenant's share (15%): $22,065.00

**Expected Finding Output**:
```json
{
  "bill_name": "Westside Centre - June 2026",
  "status": "safe",
  "reason": "All bill line items map to allowed expense categories in Lease Clause 4.2. No excluded expenses detected. Tenant's 15% share of $147,100 = $22,065 is correctly calculated.",
  "evidence": "Lease Clause 4.2 (includes taxes, insurance, utilities, janitorial, security, landscaping, HVAC, elevator, management fees, amortized capital improvements); Bill lines 1-11 all match allowed categories",
  "amount_at_risk": "$0",
  "confidence": "high"
}
```

---

### Test 3: Unclear Data - Bill Missing Category or Amount

**Input**: `data/input/lease_summary.txt` + a malformed bill file (e.g., missing amounts)

**Expected Behavior**:
- LLM cannot determine category or amount for one or more lines
- Validation step catches missing fields
- Status downgraded to "needs_review" with clear explanation

**Expected Finding Output**:
```json
{
  "bill_name": "Westside Centre - July 2026",
  "status": "needs_review",
  "reason": "Cannot determine expense category for bill line 5 (description: 'Miscellaneous charges' with no amount). Missing category and amount prevents classification against lease rules.",
  "evidence": "Lease Clause 4.2/4.3; Bill line 5 has description 'Miscellaneous charges' but no category or dollar amount",
  "amount_at_risk": "unknown",
  "confidence": "low"
}
```

---

### Test 4: Validation Step Enforcement

**Validation Rules Applied**:
1. ✓ All 6 fields present and non-empty
2. ✓ Status is valid enum
3. ✓ Confidence ≥ 50 or "medium"/"high" for "safe"/"likely_overcharge"
4. ✓ amount_at_risk parsable as dollar amount
5. ✓ Evidence references specific lease clauses and bill lines
6. ✓ Never upgrades from needs_review

**If validation fails**: Override to `needs_review` with reason explaining what's missing.

---

## Pipeline Structure (Full with Validation)

```
webhook_1 (source)
    │ tags
    ▼
parse_1 (data)
    │ text, questions
    ▼
prompt_1 (text) ◄─── instructions with lease rules
    │ questions (enhanced with context)
    ▼
llm_anthropic_1 (llm) ◄─── controlled by prompt_1
    │ answers
    ▼
extract_data_1 (text) ◄─── extracts 6 structured fields
    │ answers
    ▼
prompt_validation_1 (text) ◄─── validation rules
    │ questions
    ▼
llm_anthropic_2 (llm) ◄─── controlled by prompt_validation_1
    │ answers
    ▼
extract_data_2 (text) ◄─── final validated 6 fields
    │ answers
    ▼
response_answers_1 (infrastructure) ──► client
```

---

## Verification Checklist

- [x] Pipeline file created with `.pipe` extension
- [x] `components` is first field in JSON
- [x] `project_id` is a unique GUID at bottom
- [x] `viewport` and `version` present at bottom
- [x] All component IDs unique
- [x] Lane types match through the chain
- [x] Source node config includes `hideForm`, `mode`, `parameters`, `type`
- [x] LLM nodes use profile with `${ROCKETRIDE_ANTHROPIC_KEY}`
- [x] Control connections: LLM controlled by prompt nodes
- [x] `extract_data` nodes define all 6 required fields
- [x] Validation prompt enforces safety rules
- [x] Sample data files exist in `data/input/`
- [x] Committed to git

---

## Next Step: Test and Commit

Run the pipeline with sample files to verify trace output matches expectations.