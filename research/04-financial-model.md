# Financial Model — Navi Borrow-Safe

**Kanik Kumar · June 2026**  
Built from public sources — Navi's annual report, CARE Ratings notes, RBI data, DLAI-CRIF Fintech Barometer. Every number I couldn't find publicly, I've stated as an assumption with a range. A Navi PM with access to internal data would replace my assumptions with real numbers on Day 1 — that's the point of making the model transparent.

> **What this is:** A back-of-envelope business case built from public data. Not based on Navi's internal numbers. The structure is what matters — any PM can validate or replace each input.

---

## Section 1: Input Assumptions (Sourced)

### 1.1 Navi's Loan Volume

| Metric | Value | Source |
|--------|-------|--------|
| FY2025 personal loans disbursed | 13,59,534 (≈ 1.13L/month) | Navi Finserv AR 2024-25 (via Scribd) |
| FY2024 personal loans disbursed | 21,55,210 (≈ 1.80L/month) | Navi Finserv AR 2024-25 |
| Average loan ticket size (FY25) | ₹95,773 (₹13,020 Cr ÷ 13.6L loans) | Derived from AR data |
| Personal loan AUM (June 2024) | ₹10,419 Cr | CARE Ratings, Oct 2024 |
| GNPA (March 2025) | 2.46% | CARE Ratings, Oct 2024 |
| GNPA (December 2025) | 1.51% | CARE Ratings, Apr 2026 |

### 1.2 Rejection Volume (Derived)

Navi does not disclose application volumes or rejection rates publicly. The following ranges are derived from:

| Assumption | Conservative | Base | High | Basis |
|------------|-------------|------|------|-------|
| Final-stage application approval rate | 50% | 35% | 25% | Digital NBFC industry range (DLAI-CRIF Fintech Barometer Vol I, 2025; RBI NBFC data) |
| Monthly applications (derived) | 226,000 | 323,000 | 452,000 | Monthly disbursals ÷ approval rate |
| Monthly rejections at final stage | 113,000 | 210,000 | 339,000 | Applications − disbursals |
| Rejections who see post-rejection screen | 30,000 | 60,000 | 100,000 | Subset who completed app, not dropped-off early |

**Why "who see post-rejection screen" ≠ total rejections:** Many applications are declined at the CIBIL pull stage or during KYC before reaching a formal rejection screen. Borrow-Safe's addressable market is users who completed the application flow and received a defined rejection.

### 1.3 Industry Context

| Metric | Value | Source |
|--------|-------|--------|
| Fintech share of personal loan sanctions (H1 FY25) | 76% by volume | Business Standard, Jan 2025 |
| Fintech NBFC personal loans disbursed (H1 FY25) | 5.3 Cr loans, ₹49,000 Cr | Business Standard, Jan 2025 |
| Implied monthly fintech NBFC market | ~88L loans/month | Derived |
| Digital lending delinquency increase (Dec 2023–June 2024) | +44% | DLAI-CRIF Fintech Barometer |
| RBI Digital Lending Guidelines | DOR.CRE.REC.66/21.07.001/2022-23, Sep 2, 2022 | RBI official |

---

## Section 2: Revenue Model

### 2.1 Growth Lever — Incremental Disbursement

**Base model assumptions (all explicit, all debatable):**

```
Monthly post-rejection screen views:         60,000   [see 1.2 base case]
× Borrow-Safe engagement rate:                   20%  → 12,000 enter profile form
  [assumption: strong CTA immediately post-rejection; no benchmark; range: 10–30%]
× Profile completion rate:                       60%  → 7,200 complete 4 fields
  [assumption: 4-field form; typical mobile form completion 55–70%]
× Plan generation rate:                          80%  → 5,760 plans generated
  [assumption: most profile completers see the diagnosis; high because it's instant]
× 30-day re-application rate:                    15%  → 864 re-applications
  [target; today ~5–8% unaided; range if plan works: 12–25%]
× Approval rate on re-applicants:               60%  → 518 incremental approvals
  [assumption: self-selected + behaviour change; vs ~30–35% for general pop]
× Average loan size:                          ₹95,773  [from Navi FY25 data]
```

**Monthly incremental disbursement:** 518 × ₹95,773 = **₹4.96 Cr/month**  
**Annual:** **~₹59 Cr/year**

---

### 2.2 Sensitivity Table

| Scenario | Post-rejection screens | Engagement | Re-apply rate | Approval rate | Monthly disbursement | Annual |
|----------|----------------------|------------|--------------|--------------|---------------------|--------|
| **Pessimistic** | 30,000 | 12% | 10% | 50% | ₹1.03 Cr | ~₹12 Cr |
| **Conservative** | 30,000 | 15% | 12% | 55% | ₹1.42 Cr | ~₹17 Cr |
| **Base** | 60,000 | 20% | 15% | 60% | ₹4.96 Cr | ~₹59 Cr |
| **Optimistic** | 100,000 | 25% | 20% | 65% | ₹12.4 Cr | ~₹149 Cr |
| **Stretch** | 100,000 | 30% | 25% | 70% | ₹20.1 Cr | ~₹241 Cr |

**Most defensible scenario:** Conservative to Base (₹17–59 Cr/year). The pessimistic case (₹12 Cr/year) still justifies the feature — it's near-zero marginal CAC on already-acquired users.

**Revenue model as yield improvement:**  
An alternative framing: Navi disburses ~₹13,020 Cr/year (FY25). If Borrow-Safe recovers even 0.5% of rejected applicants as qualified borrowers, at average ₹96k ticket, that's an incremental ₹6–8 Cr disbursement — achievable even at pessimistic engagement rates.

---

## Section 3: Asset Quality Lever

### 3.1 Over-Borrowing Prevention

From simulation data (2,009 synthetic simulations): **30–40% of simulations** exceed the safe EMI band (post-loan FOIR > 40%). This is consistent with CRIF data showing high delinquencies among high-FOIR borrowers.

```
Incremental approvals/month (base case):          518
× Would-over-borrow rate without simulator:       30%    → ~155 users/month
× Simulator reduces to safe-band (target):         5%    → ~26 users/month
  [assumption: 80–90% of users nudged to safe band take it]
Prevented over-borrowers/month:                  ~129

× 90-day NPA rate (over-borrowers):               ~8%   [GNPA was 2.46% overall;
                                                          over-borrowers estimated at
                                                          3–4x base NPA rate]
Prevented NPAs/month:                            ~10
Annual avoided NPA (× ₹95,773 avg):          ~₹11.5 Cr/year
```

**Note on NPA assumption:** Navi's FY25 GNPA was 2.46%. Over-borrowers (FOIR > 50%) are assumed to default at 3–4x the average rate = 7–10%. This is plausible given CRIF data on delinquency concentration in high-FOIR cohorts, but is an estimate, not a measured outcome.

### 3.2 Securitisation Pool Quality

Navi completed India's first unsecured personal loan Pass-Through Certificate (PTC) securitisation with J.P. Morgan in 2024. A 1 pp reduction in NPA rate on the securitised pool directly improves the credit enhancement requirement and lowers future funding cost. **This makes NPA prevention a balance-sheet argument, not just a P&L argument.**

---

## Section 4: EMI Shield Revenue

```
High/medium risk simulations:          ~68% of all simulations (SQL Query 6 data)
Addressable Shield users/month:        ~352 of 518 incremental approvals
× Shield subscription rate:             ~5%   [conservative; no benchmark]
Monthly Shield subscribers:            ~18
× Monthly premium:                     ₹199
Monthly Shield revenue:                ~₹3,582
Annual:                                ~₹43,000
```

Shield revenue is small at launch. It grows with the recovered user base. The business case does not rely on it — it's upside.

---

## Section 5: The Business Case in One Sentence

At the **conservative** scenario: ~₹17 Cr/year incremental disbursement + ~₹6 Cr/year avoided NPA, at near-zero marginal CAC, on users already in the acquisition funnel.

At the **base** scenario: ~₹59 Cr/year incremental disbursement + ~₹11.5 Cr/year avoided NPA.

---

## Section 6: Model Risks and Challenges

| Risk | Impact | Mitigation |
|------|--------|------------|
| Post-rejection screen views are lower than estimated | Revenue scales down proportionally | Use pessimistic case as floor; feature still positive at ₹12 Cr |
| Re-application rate doesn't improve (users don't follow plan) | Revenue collapses to near zero | Add Day 75 push notification; measure plan adherence metrics; iterate |
| Approval rate on re-applicants same as first-timers | Revenue down ~30% | Still positive if engagement is high; A/B test plan vs. no-plan cohort |
| CIBIL doesn't update within 90 days for all users | Timeline metric misses | Caveat plan with "timeline varies; check CIBIL at day 60" |
| Navi tightens underwriting (fewer approvals) | Approval rate assumption fails | Model is parametric; update input when policy changes |

---

## Sources

- Navi Finserv AR 2024-25: https://www.scribd.com/document/933540952/
- CARE Ratings (Oct 2024): https://www.careratings.com/upload/CompanyFiles/PR/202410141039_Navi_Finserv_Limited.pdf
- CARE Ratings (Apr 2026): https://www.careratings.com/upload/CompanyFiles/PR/202604120416_Navi_Limited.pdf
- Business Standard (Fintech loans H1 FY25): https://www.business-standard.com/finance/news/fintech-lenders-nbfcs-personal-loans-rbi-report-fy25-125011400766_1.html
- DLAI-CRIF Fintech Barometer Vol I: https://unifiedfintech.in/wp-content/uploads/2025/05/DLAI-CRIF-FinTech-Barometer-Vol-I-Personal-Loans-%E2%80%93-Deep-dive.pdf
- RBI Digital Lending Guidelines: https://rbidocs.rbi.org.in/rdocs/notification/PDFs/GUIDELINESDIGITALLENDINGD5C35A71D8124A0E92AEB940A7D25BB3.PDF
