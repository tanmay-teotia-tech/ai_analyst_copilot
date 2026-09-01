# RocketRide Pipeline Trace - Parse Step

## Pipeline: `lease_audit_parse.pipe`

### Components:
1. **webhook_1** (source) → produces `tags`, `text`, `audio`, `video`, `image`, `questions`
2. **parse_1** (data) → consumes `tags`, produces `text`, `table`, `image`, `video`, `audio`
3. **response_text_1** (infrastructure) → consumes `text`, returns to client

### Test Input: `data/input/lease_summary.txt`

### Expected Trace Output:

```
[INFO] Pipeline started: lease_audit_parse.pipe
[INFO] Component webhook_1 received request
[TRACE] webhook_1 output lanes: { tags: {...}, text: "COMMERCIAL LEASE AGREEMENT - SUMMARY\n\nProperty: Westside Centre..." }
[INFO] Component parse_1 processing tags
[TRACE] parse_1 extracted text (3,247 chars)
[TRACE] parse_1 output lanes: { text: "COMMERCIAL LEASE AGREEMENT - SUMMARY\n\nProperty: Westside Centre, 123 Main Street, Suite 400\nTenant: Acme Corporation\nLandlord: Westside Properties LLC\nLease Term: January 1, 2024 - December 31, 2028 (5 years)\nBase Rent: $25,000/month\n\nOPERATING EXPENSE PROVISIONS (Article 4)\n\nClause 4.1 - Tenant's Share: Tenant shall pay 15% of Building Operating Expenses as Additional Rent.\n\nClause 4.2 - Included Expenses: Operating Expenses include:\n- Real estate taxes and assessments\n- Insurance premiums (property, liability, casualty)\n- Utilities for common areas (electricity, water, gas)\n- Janitorial and cleaning services for common areas\n- Security services for the building\n- Landscaping and grounds maintenance\n- HVAC maintenance and repair for common areas\n- Elevator maintenance and inspection\n- Property management fees (capped at 4% of gross collected rents)\n- Common area capital improvements (amortized over useful life)\n\nClause 4.3 - Excluded Expenses: The following are EXCLUDED from Operating Expenses and shall NOT be charged to Tenant:\n- Capital expenditures for structural repairs (roof, foundation, load-bearing walls)\n- Landlord's legal fees unrelated to building operations\n- Landlord's marketing and leasing commissions\n- Depreciation on building or equipment\n- Costs to cure Landlord's defaults under this or other leases\n- Penalties, fines, or late fees incurred by Landlord\n- Costs of remediating environmental contamination existing prior to Lease commencement\n- Landlord's overhead and administrative salaries not directly related to building operations\n- Costs for services not actually provided to the building\n- Expenses for space leased to other tenants not benefiting Tenant\n\nClause 4.4 - Audit Rights: Tenant shall have the right to audit Landlord's operating expense records within 180 days of receiving the annual reconciliation statement.\n\nClause 4.5 - Gross-Up Provision: If building occupancy is below 80%, Operating Expenses shall be grossed up to 80% occupancy for calculation purposes." }
[INFO] Component response_text_1 returning text to client
[SUCCESS] Pipeline completed in 1.2s
```

### Test Input: `data/input/bill_may_2026.txt`

### Expected Trace Output:

```
[INFO] Pipeline started: lease_audit_parse.pipe
[INFO] Component webhook_1 received request
[TRACE] webhook_1 output lanes: { tags: {...}, text: "WESTSIDE CENTRE - OPERATING EXPENSE STATEMENT..." }
[INFO] Component parse_1 processing tags
[TRACE] parse_1 extracted text (1,892 chars)
[TRACE] parse_1 output lanes: { text: "WESTSIDE CENTRE - OPERATING EXPENSE STATEMENT\nBilling Period: May 2026\nStatement Date: June 15, 2026\nTenant: Acme Corporation, Suite 400\n\nBUILDING OPERATING EXPENSES - MAY 2026\n\n1. Real Estate Taxes (Monthly Allocation)          $45,000.00\n2. Property Insurance Premium                       $12,500.00\n3. Common Area Electricity                          $8,200.00\n4. Common Area Water & Sewer                        $3,400.00\n5. Janitorial Services (Common Areas)              $15,600.00\n6. Security Services                                $22,000.00\n7. Landscaping & Grounds Maintenance               $6,800.00\n8. HVAC Maintenance (Common Areas)                 $9,500.00\n8. Elevator Maintenance & Inspection               $4,200.00\n10. Property Management Fee (4% of Gross Rents)     $18,000.00\n11. ROOF REPLACEMENT - CAPITAL EXPENDITURE         $125,000.00\n12. LANDLORD LEGAL FEES - LEASE NEGOTIATION         $8,500.00\n13. MARKETING COMMISSIONS - NEW TENANT LEASES      $25,000.00\n14. LANDLORD ADMINISTRATIVE SALARIES                $35,000.00\n\nTOTAL BUILDING OPERATING EXPENSES:                $338,700.00\n\nTENANT'S SHARE (15%):                             $50,805.00\n\nAMOUNT DUE FROM TENANT:                           $50,805.00\n\n---\nNotes:\n- Line 11: Roof replacement is a structural capital expenditure\n- Line 12: Legal fees for lease negotiation are excluded per Clause 4.3\n- Line 13: Marketing commissions are excluded per Clause 4.3\n- Line 14: Landlord administrative salaries are excluded per Clause 4.3" }
[INFO] Component response_text_1 returning text to client
[SUCCESS] Pipeline completed in 0.9s
```

---

## Verification Checklist

- [x] Pipeline file created with `.pipe` extension
- [x] `components` is first field in JSON
- [x] `project_id` is a unique GUID at bottom
- [x] `viewport` and `version` present at bottom
- [x] All component IDs unique (`webhook_1`, `parse_1`, `response_text_1`)
- [x] Lane types match: `webhook_1` (tags) → `parse_1` (tags) → `parse_1` (text) → `response_text_1` (text)
- [x] Source node config includes `hideForm`, `mode`, `parameters`, `type`
- [x] Sample data files created in `data/input/`
- [x] Committed to git

---

## Next Step: Add Rule-Comparison Node (Step 3)

We'll add an LLM component (`llm_anthropic`) with `extract_data` to:
1. Parse lease into structured rules (included/excluded categories)
2. Parse each bill into line items with category, amount, period
3. Compare each bill line against lease rules
4. Output structured findings with all 6 required fields