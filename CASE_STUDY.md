# Navi Borrow-Safe — Product Case Study

**Candidate:** Kanik Kumar · BITS Pilani '27 · CSE · 4th Year (7th Semester)  
**Contact:** f20230575@pilani.bits-pilani.ac.in · [LinkedIn](https://linkedin.com/in/kanikchaudhary)  
**Target role:** Product Intern (PS2) — Personal Lending / Growth, Navi  
**Date:** June 2026  
**Live demo:** [navi-borrow-safe.vercel.app](https://navi-borrow-safe.vercel.app)  
**GitHub:** [github.com/Kanik0575/navi-borrow-safe](https://github.com/Kanik0575/navi-borrow-safe)  
**Research artifacts:** [research/](./research/)

---

## TL;DR (read this first)

**The problem:** Navi rejects ~60–113k loan applicants per month who completed a full application. The post-rejection screen says "not eligible at this time" — no explanation, no path back, no reason to stay. The user churns. Navi spent the acquisition cost, kept the risk, captured nothing.

**The product:** Borrow-Safe turns the rejection moment into the start of a lending relationship — plain-language diagnosis of *why*, a specific 90-day recovery plan, and a safe-borrowing simulator that shows whether the EMI is affordable before the user re-applies.

**The insight:** From 8 user interviews — 5/8 didn't know what FOIR meant but understood their rejection instantly when explained plainly. 6/8 said rejection felt like a moral verdict. 1 user accidentally fixed his rejection reason and got approved — without ever knowing why the first attempt failed. Borrow-Safe makes that accidental success intentional and repeatable.

**The business case:** At the conservative scenario (using real Navi FY25 data: ~113k monthly disbursals, ₹96k avg ticket), recovering 1% of rejected applicants represents ~₹17–59 Cr/year in incremental disbursement at near-zero marginal CAC. The simulator adds an asset quality lever: users who reduce their loan amount voluntarily are demonstrably lower-NPA borrowers. Both levers simultaneously.

**North star:** 30-day re-application rate from Borrow-Safe users vs. unassisted rejected-user control. Target: +15 percentage points above ~5–8% baseline.

---

## 1. North Star Metric

```
North Star: 30-day re-application rate (Borrow-Safe cohort vs. unassisted rejected-user control)
Target Q1:  +15 percentage points above unassisted baseline
Baseline:   ~5–8% (estimated; no published India-specific benchmark found — Day 1 data ask)
```

### Why this metric and not another

| Option considered | Why rejected |
|-------------------|-------------|
| DAU / MAU | Borrow-Safe is not a daily product — a returning user signals failure, not success |
| Funnel completion rate | Leading indicator only; doesn't confirm eligibility improved |
| Approval rate on re-applicants | Not fully within Navi's control; credit policy changes affect it independently |
| 90-day default rate | 90-day lag; too slow for product iteration cycles |
| **30-day re-application rate** | ✅ Captures both product resonance (diagnosis useful enough to act on) and outcome (user improved enough to try again). Measurable. Directly tied to revenue. |

### Metric tree

```
North Star: 30-day re-application rate
│
├── Leading indicators (move within days–weeks)
│   ├── Funnel completion: rejection screen → plan generated       [target: ≥25%]
│   ├── Simulator engagement: plan page → simulator used           [target: ≥40%]
│   └── Safe-band adherence: % who adjust to recommended amount    [target: ≥55%]
│
└── Lagging indicators (confirm thesis at 30–90 days)
    ├── 90-day approval rate on re-applicants                      [target: ≥60%]
    ├── Day-30 NPA rate on recovered cohort vs. direct approvals   [target: ≤5% vs ~2.5%]
    └── NPS on Borrow-Safe flow (in-app prompt at risk report)     [target: ≥40]
```

---

## 2. Problem & Navi's 2026 Context

### 2.1 The rejection dead-end (verified with data)

Navi Finserv disbursed 13.6 lakh personal loans in FY2025 (~113k/month) at an average ticket of ~₹96k (Source: Navi Finserv AR 2024-25). At a digital NBFC final-stage approval rate of 35–50%, monthly applications total 226k–323k — implying 113k–210k monthly rejections at the final application stage (60k used as base case; see financial model for full range).

The post-rejection experience across every digital lender tested (Navi, MoneyView, Fibe, KreditBee, PhonePe Loans — mystery shopping, April 2026):
- **Zero** apps explain the rejection reason on the rejection screen
- **Zero** apps offer an in-app recovery path
- Fibe sends a 24-hour email with generic tips ("check your CIBIL score")
- Navi's screen: "We are unable to process your loan application at this time."

Three simultaneous costs:

**Cost 1 — CAC write-off.** A rejected applicant is a fully-acquired user whose CAC is sunk. Without a recovery path, that acquisition cost yields nothing.

**Cost 2 — Competitor hand-off.** Rejected users immediately search alternatives. Navi's rejection-related complaint share (~32% of negative reviews, from scraping 400 Play Store reviews) is the highest among the three apps analyzed — above MoneyView (~18%) and Fibe (~15%). Users are leaving and saying so publicly.

**Cost 3 — Asset quality on approvals.** Users who don't understand their own risk often borrow more than is safe. Simulation data (2,009 synthetic profiles): 30–40% of simulated loans exceed the safe EMI band — consistent with CRIF data on high-FOIR delinquency concentration.

### 2.2 Why 2026 is the right moment for Navi specifically

**Fact 1 — The 2024 RBI restriction left a cultural scar.** The action was about loan-pricing opacity and collections fairness. It was lifted after remediation. A product that visibly advances transparent, fair borrowing has political capital inside Navi independent of its P&L.

**Fact 2 — A second RBI action, February 2026.** The RBI imposed a ₹3.80 lakh monetary penalty on Navi Finserv (February 10, 2026) for recovery agent violations — specifically, contacting borrowers outside the permitted 8 AM–7 PM window (Source: RBI Press Release Prid 62229; Business Standard, February 13, 2026). This is the second regulatory action in two years. A product that structurally reduces borrower distress and reduces the population of high-risk borrowers who face collections in the first place is increasingly valuable inside Navi independent of its commercial case.

**Fact 3 — The IPO context.** Navi Technologies has filed for a ₹3,350 Cr IPO. IPO-bound companies are scrutinised on asset quality. Navi's GNPA improved from 2.46% (March 2025) to 1.51% (December 2025) — Source: CARE Ratings. Any product that keeps that trend going is a fundraising argument.

**Fact 4 — The J.P. Morgan PTC deal.** Navi completed India's first unsecured personal loan Pass-Through Certificate securitisation with J.P. Morgan in 2024. Asset quality now has a direct, named cost-of-capital consequence. A 1 pp NPA reduction on the securitised pool is a balance-sheet argument.

**Fact 5 — NBFC funding structure.** Navi's cost of funds depends on debt markets, not deposits. Clean loan pools literally cost less to fund. "Asset quality as financing cost" is not a metaphor here.

---

## 3. Research

*Full artifacts in the `research/` folder: interview guide, participant list, synthesis, affinity map, financial model, regulatory analysis, competitive analysis.*

### 3.1 Play Store review analysis

**Method:** Scraped ~400 reviews across Navi, MoneyView, and Fibe using `google-play-scraper` (open source, public data). Hand-labelled with `funnel_stage_label`, `complaint_category`, `sentiment`. Queries in `scripts/queries.sql`.

**Key findings:**

- **SQL Q1:** Rejection-stage complaints = 28–35% of all negative reviews — the single largest complaint category across all three apps. *Implication: building at the rejection touchpoint addresses the most-complained-about moment.*

- **SQL Q2:** Navi's rejection complaint share (~32%) is higher than MoneyView (~18%) and Fibe (~15%) relative to total review volume. *Implication: Navi's post-rejection communication quality is worse than competitors — independent of how often it rejects.*

- **SQL Q7 (Sentiment):** Navi's overall positive sentiment share is lower than MoneyView and Fibe despite similar aggregate Play Store ratings (Navi 4.5★ vs. MoneyView 4.6★, Fibe 4.8★). The sentiment gap is concentrated in rejection and CS review categories — masked by the headline rating.

### 3.2 User interviews (8 sessions, March–April 2026)

**Full methodology:** [research/00-interview-guide.md](./research/00-interview-guide.md)  
**Participant list:** [research/01-participant-list.md](./research/01-participant-list.md)  
**Full synthesis:** [research/02-synthesis.md](./research/02-synthesis.md)  
**Affinity map:** [research/03-affinity-map.md](./research/03-affinity-map.md)

8 participants (5 rejected, 2 approved-but-struggling, 1 approved-comfortable). Age 22–34, income ₹22k–₹67k/month, apps tested include Navi, MoneyView, KreditBee, Fibe, PhonePe Loans.

**Theme 1 — No explanation, no path:** 5/8 received a "not eligible" screen with no reason and no next step. P5 (self-employed, ₹67k/mo, rejected 3 times) called customer care and was told "automated decision, we can't tell you."

**Theme 2 — Rejection as moral verdict:** 6/8 described rejection in emotional terms — "like a test where they don't return the questions" (P3), "felt like the bank doesn't trust me" (P6).

**Theme 3 — Jargon barrier:** 5/8 didn't know what FOIR meant. When explained as "what percentage of your monthly income goes to loan payments," all 5 immediately understood their rejection reason.

> **P1 (Arjun, 26):** *"Oh — so it's basically how much of my salary is already spoken for? That's it? Why didn't they just say that?"*

**Theme 4 — Affordability blind spot:** Both approved-but-struggling participants said no one told them whether their EMI was safe before they borrowed.

> **P2 (Meera, 31):** *"I wish someone had told me ₹15,000 EMI on ₹35,000 income is too much. I would have borrowed ₹1 lakh instead of ₹2 lakh. I didn't know I had that option."*

**Theme 5 — Accidental recovery:** P7 (Vikram, 28) closed a small loan four months after rejection and re-applied. He got approved — but never knew the closed loan was the reason the first attempt failed. Borrow-Safe makes that connection explicit.

**Theme 6 — Self-employed documentation gap:** P5 had ₹67k/month income but was rejected 3 times because no one explained that ITR + 3 months bank credits is the substitute for a salary slip.

### 3.3 What the research changed (pivot log)

| Initial assumption | Research finding | Change |
|-------------------|-----------------|--------|
| 9-field form (income + EMI + score + employment + city + amount + purpose + tenure + occupation) | "Forms feel like applications I'm trying to fill" [6/8 — completion anxiety] | Cut to 4 fields |
| Show all rejection reasons on diagnosis screen | "I didn't know where to start" [P1, P3 — overwhelm] | Primary reason first; secondary on scroll; plan addresses only primary + first step of secondary |
| EMI Shield shown on every risk report | "Annoying upsells" [P4, P8] | Conditional only: Shield shown when riskBandAfter = medium or high |
| "FOIR" in diagnosis copy | 5/8 didn't know the term | Replaced with "your monthly-payment-to-income ratio" throughout |
| 120-day recovery plan | "4 months feels too long, I'll never stick to it" [P6] | 90-day plan: matches CIBIL's published update window |

---

## 4. Product Design

### 4.1 Target personas

**Persona A — Rohit, 24, ₹40k/mo salaried private (primary TAM)**  
Applied for ₹1.5L personal loan. Rejected (FOIR 52%, score 640). Doesn't know what to fix. Goal: understand the reason, get a realistic timeline, come back approvable.

**Persona B — Priya, 31, ₹32k/mo, borderline eligible (secondary TAM + asset quality lever)**  
Applied for ₹3L. Borderline eligible — but the EMI would have been 58% of income. Goal: understand the right amount to borrow, not just whether she was approved. This persona is under-served by every competitor.

### 4.2 Six screens — design decisions

**Screen 1 — Rejection landing**  
"Not approved this time — let's get you ready." De-emphasized exit link present ("Compare other lenders while you work on your plan") for user autonomy — not promoted.  
*Why:* Reframing failure as a beginning is the retention thesis. Burying the exit is a dark pattern. The exit link signals product confidence.

**Screen 2 — 4-field profile input**  
Fields: monthly income, existing EMIs, credit score range, employment type. Nothing else.  
*Why 4:* Mobile form completion drops ~3–5% per additional field. These 4 are the minimum for an accurate FOIR + score diagnosis. Validated by P1, P3, P4 in sessions — "less feels less like an application."

**Screen 3 — Diagnosis**  
FOIR as a progress bar vs. threshold. Color-coded rejection reasons in priority order. Plain-language explanations. Thresholds visible: "Lenders want this below 45%."  
*Why transparency:* Users who see the formula trust the diagnosis and are more likely to take the next action. Directly aligned with Navi's post-RBI transparency commitments.

**Screen 4 — 90-day plan**  
Week-by-week, tailored to primary rejection reason. Deterministic rule engine (not LLM) — auditable, consistent, 0 latency, 0 cost.  
*Why 90 days:* CIBIL publishes that payment history changes reflect in bureau data within 45–60 days; utilization changes within 30 days. 90 days is the shortest credible window for both levers to compound. (Source: CIBIL documentation; RBI CIC guidelines on bureau update frequency.)

**Screen 5 — Safe Borrowing Simulator**  
Sliders → live EMI, pre/post-loan FOIR, two stress tests, safe-band recommendation. Formula shown: `EMI = P × r × (1+r)^n / ((1+r)^n − 1)`.  
*Why show the formula:* Transparency is the architectural response to the 2024 RBI action. Users who understand the math borrow less than is dangerous — making them lower-risk borrowers and reducing Navi's NPA rate on this cohort.

**Screen 6 — Risk band + EMI Shield**  
Before/after/safe-band risk progression. EMI Shield shown **only** when riskBandAfter = medium or high. Priced explicitly: ₹199/mo, up to 3 EMIs on involuntary unemployment or hospitalisation.  
*Why conditional cross-sell:* SQL Q6 shows that 100% of Shield-surfaced users are genuinely high-risk. This is the architectural anti-pattern to the mis-selling behaviour that triggered the 2024 RBI action.

---

## 5. OKRs & Success Metrics

### Objective: Turn loan rejections into a retention and asset-quality lever

| Key Result | Target | Measurement |
|------------|--------|-------------|
| KR1: Funnel completion (rejection → plan) | ≥25% | `plan_generated` / `rejection_screen_viewed` |
| KR2: 30-day re-application rate vs. control | +15 pp | Cohort: `loan_application_submitted` within 30d |
| KR3: Approval rate on re-applicants | ≥60% | Credit decisioning outcome within 90d |
| KR4: Day-30 NPA rate on recovered cohort | ≤5% (vs. ~2.5% Navi overall GNPA) | Default flag at Day 30 post-disbursement |
| KR5: NPS on Borrow-Safe flow | ≥40 | In-app prompt at risk report screen |

### Guardrails (must not worsen)

| Guardrail | Threshold | Risk if violated |
|-----------|-----------|-----------------|
| App store rating | No drop >0.1★ from current | Flow generates frustration |
| EMI Shield show rate | ≤% of high/medium risk only | Over-showing = regulatory flag |
| Time to plan generation | ≤3 seconds | Drop-off |
| CS ticket volume on "wrong diagnosis" | Monitor post-launch | Diagnosis accuracy issue |

### Kill criteria (explicit decision rules)

These are the signals that trigger a pause-and-redesign decision, not just monitoring:

| Signal | Threshold | Decision |
|--------|-----------|----------|
| 30-day re-application rate | <8% at Day 90 with p<0.05 | Pause. Investigate whether diagnosis is accurate or plan is not being followed. Redesign before Phase 2 full rollout. |
| "Wrong diagnosis" CS tickets | >5% of plan-generation volume within 30 days of launch | Immediate rollback to Phase 0. Credit team re-validation before any user sees the product again. |
| Phase 0 accuracy gate | <80% diagnosis match on 30 real anonymised rejection cases | Don't launch Phase 1. Diagnosis engine is not calibrated to Navi's actual credit policy. |
| NPS on Borrow-Safe flow | <20 at Day 60 | The product is generating frustration, not help. Deep qualitative investigation before any further rollout. |

**Why explicit kill criteria matter:** Guardrails tell you when something went wrong. Kill criteria tell you when to stop rather than iterate. The difference matters: if the core thesis (diagnosis → plan → re-application) doesn't hold, iterating on copy or UI won't fix it. The kill criteria force that honest evaluation at a defined point.

---

## 6. Business Case

*Full model with sensitivity table, sources, and model risks: [research/04-financial-model.md](./research/04-financial-model.md)*

### Revenue lever (sourced numbers)

**Navi base data (Navi Finserv AR 2024-25):**
- Monthly personal loan disbursals: ~113k (FY25: 13.6L total)
- Average ticket size: ~₹95,773 (derived: ₹13,020 Cr ÷ 13.6L loans)
- GNPA: 2.46% (March 2025), improving to 1.51% (December 2025) — CARE Ratings

**Model (base case):**
```
Post-rejection screen views/month:      60,000   [see financial model for derivation]
× Borrow-Safe engagement rate:             20%  → 12,000
× Profile completion:                      60%  → 7,200
× Plan generation:                         80%  → 5,760
× 30-day re-application rate (target):     15%  → 864
× Approval rate on re-applicants:          60%  → 518 incremental approvals
× Average ticket:                     ₹95,773
= Monthly incremental disbursement:   ₹4.96 Cr
= Annual:                           ~₹59 Cr/yr
```

### Sensitivity table

| Scenario | Post-rejection screens | Engagement | Re-apply rate | Annual disbursement |
|----------|----------------------|------------|--------------|---------------------|
| Pessimistic | 30,000 | 12% | 10% | ~₹12 Cr |
| **Conservative** | 30,000 | 15% | 12% | **~₹17 Cr** |
| **Base** | 60,000 | 20% | 15% | **~₹59 Cr** |
| Optimistic | 100,000 | 25% | 20% | ~₹149 Cr |

*Even at pessimistic: ₹12 Cr/year at near-zero marginal CAC on already-acquired users justifies the feature.*

### Asset quality lever

Simulator prevents ~129 over-borrowers/month in base case (at 30% would-over-borrow rate, reduced to 5% with nudge). At 8% NPA rate on over-borrowers (3× Navi's 2.46% GNPA): ~10 avoided NPAs/month → **~₹11.5 Cr/year in avoided write-offs** at average ₹96k ticket.

Securitisation implication: a measurable NPA reduction on the Borrow-Safe cohort improves the pool quality of future PTC issuances, reducing the credit enhancement requirement and lowering the cost of capital.

### One-line pitch

*"At the conservative scenario, Borrow-Safe recovers ~₹17 Cr/year in incremental disbursement and prevents ~₹4 Cr/year in early-stage defaults — simultaneously — at near-zero marginal CAC. At the base case: ~₹59 Cr disbursement + ~₹11.5 Cr NPA prevention."*

---

## 7. Competitive Analysis

*Full matrix with sources: [research/06-competitive-analysis.md](./research/06-competitive-analysis.md)*

### Feature gap (mystery shopping, April 2026)

| Feature | Navi now | MoneyView | Fibe | KreditBee | **Borrow-Safe** |
|---------|----------|-----------|------|-----------|-----------------|
| Plain-language rejection reason | ✗ | Partial | ✗ | ✗ | ✓ |
| Structured recovery plan | ✗ | ✗ | ✗ | ✗ | ✓ |
| Safe borrowing simulator | ✗ | ✗ | ✗ | ✗ | ✓ |
| Stress-test before applying | ✗ | ✗ | ✗ | ✗ | ✓ |
| Conditional honest cross-sell | ✗ | ✗ | ✗ | ✗ | ✓ |
| Formula visibility | ✗ | ✗ | ✗ | ✗ | ✓ |

### Play Store ratings (June 2026)

| App | Rating | Installs | Rejection complaint % of negative reviews |
|-----|--------|----------|------------------------------------------|
| MoneyView | 4.6★ | 50M+ | ~18% |
| Fibe | 4.8★ | 10M+ | ~15% |
| KreditBee | 4.5★ | 50M+ | ~22% |
| **Navi** | **4.5★** | **10M+** | **~32%** |

**The story is not in the aggregate rating — it's in the complaint composition.** Navi's 4.5★ overall rating is nearly identical to KreditBee and only 0.1★ below MoneyView. The pain point is invisible in the headline number. But 32% of Navi's negative reviews are rejection-related — the highest concentration among all apps analyzed, nearly double MoneyView's 18%. Borrow-Safe addresses the most complained-about moment in Navi's lending funnel, precisely because it's a concentrated, specific problem that aggregate metrics hide.

### Defensibility

Surface UX: replicable in 2–4 weeks by any competitor. Real moat: (1) behavioral data from improvement journeys — exclusive to Navi, improves credit model for re-applicants; (2) Navi-specific credit policy integration in Phase 3 — only Navi knows its own thresholds; (3) trust attribution — the lender that helped you through rejection gets the relationship credit.

---

## 8. Regulatory Analysis

*Full analysis with RBI circular references: [research/05-regulatory-analysis.md](./research/05-regulatory-analysis.md)*

**Bottom line:** Low regulatory risk. Borrow-Safe is not a Lending Service Provider and does not participate in the lending transaction. The 2022 RBI Digital Lending Guidelines (DOR.CRE.REC.66/21.07.001/2022-23) do not apply.

**One real requirement:** DPDPA 2023 requires a consent checkbox before collecting income/EMI data. This is a 2-hour engineering change.

**Regulatory upside:** The RBI Fair Practices Code already requires NBFCs to disclose rejection reasons. Borrow-Safe makes that disclosure better and more substantive — a PM can argue it demonstrates Fair Practices Code compliance in a way a form letter cannot.

---

## 9. A/B Experiment Roadmap

*Full experiment specs with sample sizes: see [dashboard /dashboard](https://navi-borrow-safe.vercel.app/dashboard) Section 06*

| # | Experiment | Primary metric | Success criteria | Week |
|---|-----------|---------------|-----------------|------|
| 1 | Hope-framed vs. neutral rejection headline | Rejection screen → profile submitted | ≥10 pp lift, p<0.05 | 1–2 |
| 2 | 4 fields vs. 7 fields in profile form | Form completion rate | ≥15% lift AND accuracy ≥80% | 3–4 |
| 3 | Chronological plan vs. quick-wins-first | 30-day plan return rate | ≥20% lift | 5–6 |
| 4 | EMI Shield: risk report only vs. simulator teaser | Shield CTR + 30d cancellation rate | CTR +15%; cancellation ≤ control | Month 2 |
| 5 | Day 75 re-application nudge (push notification) | 90-day re-application rate | ≥8 pp lift | Month 3 |

---

## 10. GTM & Rollout Plan

**Phase 0 (Days 1–30) — Internal validation**  
Credit team validates diagnosis logic against 30 real (anonymised) rejection cases. Gate: ≥80% accuracy before any public launch.

**Phase 1 (Days 31–60) — 10% soft launch**  
10% of daily rejected applicants see Borrow-Safe. 90% control. Instrument all events. Watch-out: spike in "wrong diagnosis" CS tickets → rollback.

**Phase 2 (Days 61–90) — Full rollout + Experiment 1**  
100% of rejected applicants. Run hope-framed headline A/B. NPS prompt at risk report.

**Phase 3 (Month 4+) — CIBIL API integration**  
Replace self-reported score bucket with direct CIBIL pull via Navi's existing CIC registration. Removes one form field, improves diagnosis accuracy from ±40 points to exact. Requires legal sign-off on consent flow — sequence after Phases 1–2 validate the product thesis.

**Phase 3.5 — Trezo integration for borderline-FOIR users**  
For users with FOIR 40–50% and score ≥650 (borderline-eligible — too risky for a term loan, but manageable as a credit line), surface Navi's Trezo revolving credit product as an alternative. Trezo's managed drawdown model limits exposure to what users actually withdraw rather than the sanctioned limit — structurally lower NPA risk for this profile. This:
1. Converts a "no" into a "yes, but smaller" — recovers CAC from a segment that would otherwise churn
2. Creates an upgradeability path: Trezo users who demonstrate responsible usage become the highest-quality re-applicants for a full personal loan in 6–12 months
3. Keeps the user inside the Navi ecosystem rather than handing them to a competitor

**Why Phase 3.5 and not Phase 1:** Trezo integration requires coordination with the Trezo product team and a consent flow update. The core Borrow-Safe thesis (diagnosis → recovery → re-application) should be validated before adding a second conversion path.

### Day 30 / Day 60 / Day 90 PM check-ins

What the PM looks at and what decisions get made at each milestone:

**Day 30 (first real signal)**
- Look at: funnel completion rate (rejection screen → plan generated), drop-off by screen, median time on plan page
- Decision gate: if funnel completion <15%, the product is not capturing attention — copy or UX redesign before continuing
- Data ask: are "wrong diagnosis" CS tickets appearing? What's the most common complaint category?

**Day 60 (leading indicators mature)**
- Look at: 30-day re-application rate on first cohort (users who entered Borrow-Safe in Day 1–30), simulator engagement rate, safe-band adherence %
- Decision gate: if re-application rate is tracking toward <8% at current rate, pause Phase 2 full rollout
- Secondary check: NPS prompt response rate and score. If NPS <25 with >100 responses, qualitative investigation

**Day 90 (north star verdict)**
- Look at: 30-day re-application rate vs. control (statistical significance check), 90-day approval rate on re-applicants, Day-30 NPA rate on recovered cohort vs. direct approvals
- Decision gate: kill criteria evaluation (see Section 5). Go/no-go on Phase 3 (CIBIL API integration)
- Write-up: what did the data change vs. the pre-launch hypothesis? What would I spec differently now?

---

## 11. Technical Architecture

```
Browser
 ├── / (landing)              → Server Component (static, Next.js 16)
 ├── /profile                 → Client Component (4-field form)
 │     └── POST /api/rejection-profile  → Rule engine → Neon Postgres
 ├── /diagnosis               → Server Component
 ├── /plan                    → Server Component → Action plan engine
 ├── /simulator               → Client Component (live calc, no DB call for preview)
 │     └── POST /api/loan-simulation    → EMI/FOIR engine → Neon DB
 ├── /risk                    → Server Component
 └── /dashboard               → Client Component
       └── GET /api/analytics            → 12 SQL queries → Neon DB
```

**Why rule engine not LLM:** Deterministic, auditable, 0 latency, 0 cost. In a credit-adjacent context, hallucination risk is dangerous. The rule engine can be unit-tested and reviewed by the credit team on Day 1.

---

## 12. Honest Limitations

**What's synthetic:** 2,009 rejection profiles and loan simulations generated by `scripts/seed.ts`. The analytics dashboard is an analytical framework — the patterns are hypotheses about what real Navi data would show, not findings.

**What's assumed:** The rule engine uses industry-convention thresholds (FOIR 45%, min score 650) — not Navi's actual credit policy. Every diagnosis in the app may be wrong for Navi's specific model.

**What I can't know without internal access:**
- Actual monthly post-rejection screen views at Navi
- Real re-application rate baseline and approval uplift for re-applicants
- Default correlation with FOIR bands in Navi's loan book
- Navi's actual rejection reason distribution

**The most important question on Day 1:**  
*"Of users rejected in the last 12 months, what % re-applied within 90 days — and what was their approval rate vs. first-time applicants? That's the baseline against which everything in this product is measured."*

---

## 13. What I Learned

**On scope:** Cut from 9 fields to 4. Cut from 120-day plan to 90-day. Cut EMI Shield from always-visible to conditional. Every cut was a product decision that has no code but is the thing I'd defend most confidently in an interview.

**On the EMI Shield:** My initial spec showed Shield on every risk report. Then I read the 2024 RBI action more carefully. The action was about insurance mis-selling in lending contexts. A product that shows an insurance upsell to every borrower regardless of their risk level is the same pattern. Changed to conditional — Shield appears only at medium/high risk. SQL Q6 validates this: 100% of Shield-surfaced users are genuinely high-risk.

**On synthetic data:** The right way to use synthetic data in a portfolio is not to pretend it's real — it's to use it to build the analytical scaffolding that you'd fill with real data on Day 1. Every chart in the dashboard is a *question* about real Navi data, not an answer.

**On building vs. writing:** A case study about building a product is not the same as building it. The technical decisions forced PM decisions I would have skipped in a deck: Why 4 fields? Because I built 9 and the form felt wrong. Why show the formula? Because hiding it felt dishonest in Navi's context.

### What would change my mind

Three findings that would materially change the product spec — stated upfront because a PM who can't name these hasn't thought hard enough:

**Finding 1 — Baseline re-application rate is already >15%.**  
If Navi's data shows rejected users re-apply within 30 days at 15%+ (vs. my assumed 5–8% baseline), the north star target (+15 pp lift) is harder to achieve and the business case shrinks. In this scenario, I'd reframe the product: Borrow-Safe's value is not re-application rate but *approval rate on re-applicants* and *NPA rate on recovered cohort*. The asset quality lever becomes primary, not secondary.

**Finding 2 — Phase 0 accuracy gate fails (<80% on real rejection cases).**  
If Navi's credit team validates the diagnosis engine against 30 real rejection cases and accuracy is below 80%, the product's core credibility is broken. The fix is not UI — it's CIBIL API integration (Phase 3, pulled forward) and replacing self-reported score buckets with exact bureau data. This changes the launch sequence: Phase 3 becomes Phase 1.

**Finding 3 — The 'rejection as moral verdict' finding is specific to first-time rejecters.**  
If user research at Navi shows that repeat rejecters (2+ rejections) respond to Borrow-Safe with cynicism rather than engagement ("I've heard this before"), the copy and positioning need to be segmented. First-time rejecters: hope-framed ("let's get you ready"). Repeat rejecters: credibility-framed ("here's specifically why the last application failed, with numbers"). The current product is built for the first-time case.

---

*Prepared June 2026 · Kanik Kumar · BITS Pilani '27 · CSE*  
*f20230575@pilani.bits-pilani.ac.in · [LinkedIn](https://linkedin.com/in/kanikchaudhary)*  
*[github.com/Kanik0575/navi-borrow-safe](https://github.com/Kanik0575/navi-borrow-safe) · [navi-borrow-safe.vercel.app](https://navi-borrow-safe.vercel.app)*
