# Regulatory Analysis — Navi Borrow-Safe

**Author:** Kanik Kumar  
**Date:** June 2026  
**Scope:** RBI/NBFC regulations relevant to a post-rejection recovery product embedded in a digital personal lending flow  
**Disclaimer:** This analysis is prepared by a student researcher, not a qualified legal or compliance professional. Any production implementation must be reviewed by Navi's legal and compliance team.

---

## Summary Verdict

Borrow-Safe as designed has **low regulatory risk** because:
1. It is an educational/diagnostic tool, not a credit decisioning system
2. It does not disburse loans, collect payments, or issue financial advice in the regulated sense
3. Its transparency-first design is directionally aligned with current RBI priorities

**One real compliance requirement exists:** The 4-field profile form collects financial personal data under DPDPA 2023 — a consent checkbox is required before submission.

---

## Regulation 1: RBI Digital Lending Directions, 2025

**Original Circular:** DOR.CRE.REC.66/21.07.001/2022-23, dated September 2, 2022  
**Superseded by:** RBI Digital Lending Directions, 2025 (issued May 8, 2025) — consolidated the 2022 guidelines, the Default Loss Guarantee framework, and digital lending outsourcing instructions into a single master direction.  
**Applicability:** All Regulated Entities (NBFCs, banks) offering digital lending products and their Lending Service Providers (LSPs)

### Key changes in 2025 Directions vs. 2022

| Change | 2022 position | 2025 position | Borrow-Safe impact |
|--------|--------------|---------------|---------------------|
| Key Fact Statement (KFS) | Required before sanction | Standardised format mandated; must show all-inclusive APR | Not applicable — Borrow-Safe is pre-application |
| Cooling-off period | ≥3 days for loans ≥7 days | Standardised; borrower can exit paying only principal + proportionate APR, no penalty | Not applicable |
| Data collection limits | No phonebook/photo/contacts access | Explicitly prohibited: phonebook, photo gallery, file storage, contact list | Borrow-Safe only collects 4 fields — fully compliant |
| FLDG (Default Loss Guarantee) | Permitted but unregulated | Capped at 5% of outstanding portfolio; must be cash/bank guarantee/FD | Not applicable |
| LSP conduct | Supervised indirectly | Direct conduct standards; LSP cannot charge borrowers | Borrow-Safe is not an LSP |

### Relevant provisions for Borrow-Safe

| Provision | Borrow-Safe implication | Risk level |
|-----------|------------------------|------------|
| Loans disbursed only to borrower's bank account | Not applicable — Borrow-Safe doesn't disburse | None |
| Data collection limited to what is necessary for lending | Borrow-Safe collects for diagnosis, not underwriting — but must not share this data with Navi's credit model without separate consent | Low |
| KFS required before loan acceptance | Not applicable — Borrow-Safe is pre-application | None |
| Cooling-off period | Not applicable | None |
| LSPs cannot charge borrowers | Borrow-Safe is free | None |

**Assessment:** The 2025 Directions do not change Borrow-Safe's regulatory position. It is not an LSP and does not participate in the lending transaction. The data-minimisation strengthening in 2025 actually *supports* Borrow-Safe's 4-field design — fewer fields than the minimum already.

**Watch-out:** If Borrow-Safe ever surfaces a specific lender recommendation ("apply at Navi now"), it could be construed as a digital lending referral and subject to LSP registration requirements. The current implementation avoids this — the "Apply at Navi" CTA is generic and post-simulation.

---

## Regulation 2: RBI Fair Practices Code for NBFCs

**Master Circular:** RBI/2015-16/16, DNBS (PD) CC.No.080/03.10.042/2015-16  
**Key provision:** NBFCs must communicate the reason for rejection in writing to loan applicants.

### Implication for Borrow-Safe

This is **favorable**, not a risk. RBI already requires Navi to disclose rejection reasons. Borrow-Safe makes that disclosure better — more specific, more actionable, and more useful. It is in direct alignment with the Fair Practices Code.

**Compliance upside:** A PM can argue internally that Borrow-Safe helps Navi demonstrate Fair Practices Code compliance in a more substantive way than a form letter.

---

## Regulation 3: Digital Personal Data Protection Act 2023 (DPDPA)

**Act:** Digital Personal Data Protection Act, 2023 (effective from notified rules, 2025)  
**Applicability:** Any entity that processes "digital personal data" of individuals — which includes Navi's web/app infrastructure

### Data collected by Borrow-Safe

| Field | Personal data? | Sensitive? |
|-------|---------------|-----------|
| Monthly income | Yes | Yes (financial data) |
| Existing EMI | Yes | Yes (financial data) |
| Credit score bucket | Yes | Yes (financial data) |
| Employment type | Yes | Moderate |

### Required actions

1. **Consent notice before data collection** — The DPDPA requires explicit, informed consent before collecting personal data. A checkbox ("I consent to this data being used to generate my diagnosis. It will not be shared with lenders.") is **legally required** before the profile form submission.

2. **Purpose limitation** — Data collected can only be used for the stated purpose (generating diagnosis + plan). Cannot be used for credit underwriting or marketing without separate consent.

3. **Data retention** — The DPDPA requires a defined retention period. Suggested: profiles are retained for 12 months (time to re-apply) and then deleted, unless user explicitly extends.

4. **Data principal rights** — Users must be able to request deletion of their profile. The current implementation has no delete endpoint. **This is the one real compliance gap.**

### Recommended implementation changes (in priority order)

| Priority | Change | Effort |
|----------|--------|--------|
| High | Add consent checkbox to profile form before submission | 2 hours engineering |
| High | Add "Delete my data" link in profile or footer | 4 hours engineering |
| Medium | Add privacy notice page with data usage, retention, and deletion instructions | 1 day |
| Low | Add retention policy to server: auto-delete profiles > 12 months old | 1 week engineering |

---

## Regulation 4: CIBIL / Credit Information Companies (Regulation) Act 2005

**Applicability:** Entities that access credit bureau data must be registered Credit Institutions

### Borrow-Safe position

Borrow-Safe does **not** access CIBIL data directly. It asks the user for their self-reported credit score *range* (excellent/good/fair/poor/no_score) — not a bureau pull.

**Implication:** No Credit Information Companies (Regulation) Act obligation applies to Borrow-Safe in its current form.

**Future consideration:** If Borrow-Safe is upgraded to pull CIBIL scores via API (recommended in Phase 3 of the GTM plan), Navi already has Credit Institution registration. The API integration would use Navi's existing consent and bureau access framework — no new registration required.

---

## Regulation 5: RBI Actions (2024 + February 2026) and Remediation Context

### 2024 restriction

In 2024, RBI imposed restrictions on Navi Finserv for violations related to loan pricing transparency and fairness. The restrictions were subsequently lifted after remediation. Borrow-Safe's transparency-first design is directly aligned with the remediation commitments Navi made to the regulator.

### February 2026 penalty

The RBI imposed a monetary penalty of ₹3.80 lakh on Navi Finserv (February 10, 2026) for recovery agent violations — specifically, contacting borrowers for loan recovery outside the permitted 8 AM–7 PM window (Source: RBI Press Release Prid 62229; Business Standard, February 13, 2026).

**Why this matters for Borrow-Safe:** The February 2026 penalty is about borrowers in distress being contacted at inappropriate times. Borrow-Safe reduces the population of borrowers who end up in distress by:
1. Preventing over-borrowing via the safe-band simulator (less exposure → fewer collections cases)
2. Routing genuinely ineligible users toward a recovery path rather than pushing them into a loan they can't repay

A product that structurally shrinks the at-risk borrower pool reduces the collections pressure that led to the penalty in the first place. This is not a stretch PM argument — it is a direct causal chain.

### Borrow-Safe's alignment with remediation commitments

The public record suggests Navi's remediation commitments include:
- More transparent loan pricing communication
- Fairer treatment of borrowers in the credit process

Borrow-Safe directly advances both:
- Shows every formula and threshold on-screen (pricing transparency)
- Explains rejection reasons in plain language (fairer treatment)
- Surfaces EMI Shield only when genuinely warranted (no mis-selling)

**Internal PM argument:** Borrow-Safe has political capital inside Navi that is independent of its P&L. After two regulatory actions in two years, a product that is architecturally fair — and demonstrably so — has organizational support that a purely commercial feature does not.

---

## Risk Summary Table

| Regulation | Current risk | Required action | Priority |
|-----------|-------------|-----------------|----------|
| RBI Digital Lending Directions 2025 | None | None | — |
| RBI Fair Practices Code | None (favorable) | None (already compliant) | — |
| RBI Recovery Agent guidelines (Feb 2026 penalty context) | None (Borrow-Safe reduces at-risk pool) | None | — |
| DPDPA 2023 — Consent | **Implemented** | Consent checkbox added to profile form | Done ✓ |
| DPDPA 2023 — Deletion | **Low-Medium** | Add delete endpoint | Medium |
| DPDPA 2023 — Privacy notice | Low | Add privacy page | Medium |
| CIC Act (CIBIL) | None (no bureau pull) | None | — |
| LSP registration (if referral added) | Potential | Keep CTA generic; review before adding lender-specific referral | Medium |

**Overall regulatory risk:** Low, with a short remaining action list. The non-negotiable consent checkbox is already implemented. The deletion endpoint is the remaining priority.

---

## Sources

- RBI Digital Lending Guidelines (Sep 2, 2022): https://rbidocs.rbi.org.in/rdocs/notification/PDFs/GUIDELINESDIGITALLENDINGD5C35A71D8124A0E92AEB940A7D25BB3.PDF
- RBI Digital Lending Directions, 2025 (May 8, 2025): consolidated master direction superseding 2022 guidelines
- RBI Fair Practices Code for NBFCs: Master Circular RBI/2015-16/16
- Digital Personal Data Protection Act, 2023: Ministry of Electronics and Information Technology
- RBI Press Release Prid 62229 (Feb 10, 2026): Penalty on Navi Finserv for recovery agent violations — https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=62229
- Business Standard (Feb 13, 2026): RBI fines Navi Finserv, Bank of Maharashtra, CSB Bank for non-compliance
- CRIF How India Lends FY2024: https://www.crifhighmark.com/media/3617/crif-how-india-lends-fy2024.pdf
