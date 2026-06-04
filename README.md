# Navi Borrow-Safe

> **Rejection → Recovery → Responsible Borrowing**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-navi--borrow--safe.vercel.app-0070F3?style=for-the-badge&logo=vercel&logoColor=white)](https://navi-borrow-safe.vercel.app)
[![Case Study](https://img.shields.io/badge/Case%20Study-Full%20PM%20Doc-FF6B35?style=for-the-badge&logo=readthedocs&logoColor=white)](https://github.com/Kanik0575/navi-borrow-safe/blob/main/CASE_STUDY.md)
[![1-Page Pitch](https://img.shields.io/badge/1--Page%20Pitch-For%20Recruiters-green?style=for-the-badge)](https://github.com/Kanik0575/navi-borrow-safe/blob/main/PITCH.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-97%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/Kanik0575/navi-borrow-safe)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

A **production-deployed PM portfolio project** built to demonstrate product thinking, full-stack engineering, and SQL analytics — aligned with Navi's 2026 lending priorities.

**Built for:** Navi PS2 Product Internship, June 2026  
**Author:** Kanik Kumar · BITS Pilani '27 · CSE  
**Contact:** [f20230575@pilani.bits-pilani.ac.in](mailto:f20230575@pilani.bits-pilani.ac.in) · [LinkedIn](https://linkedin.com/in/kanikchaudhary)

---

## The Problem in One Number

Navi Finserv disbursed **13.6 lakh personal loans in FY2025** (~113k/month) at an average ticket of ₹96k *(Source: Navi Finserv Annual Report 2024-25)*. At a 35–50% final-stage approval rate, that implies **113k–210k monthly rejections** — every one of them landing on a screen that says:

> *"We are unable to process your loan application at this time."*

No explanation. No recovery path. No reason to stay.

**Three simultaneous costs Navi absorbs on every rejection:**

| Cost | What it means |
|---|---|
| **CAC write-off** | A fully-acquired user yields zero revenue. The acquisition cost is sunk. |
| **Competitor hand-off** | Rejected users immediately search alternatives. Navi's rejection-related complaint share (~32% of negative Play Store reviews) is nearly double MoneyView's 18%. |
| **Asset quality drag** | Users who don't understand their own risk overborrow. Simulation data: 30–40% of loans would exceed the safe EMI band if unchecked. |

**Borrow-Safe fixes all three with one feature.**

---

## What Borrow-Safe Does

```
Rejected applicant lands on "not eligible" screen
          ↓
Screen 1 — Rejection landing      "Not approved this time — let's fix that."
          ↓
Screen 2 — 4-field profile        Income / existing EMIs / score range / employment
          ↓
Screen 3 — Diagnosis              FOIR progress bar · plain-language reason · no jargon
          ↓
Screen 4 — 90-day recovery plan   Week-by-week steps tailored to primary rejection reason
          ↓
Screen 5 — Safe borrowing sim     Live EMI calc · pre/post-loan FOIR · 2 stress tests · safe band
          ↓
Screen 6 — Risk band + cross-sell EMI Shield shown ONLY when riskBandAfter = medium or high
```

**Result:** More re-approvals from the rejected pool (revenue) *and* lower early-default risk from users who borrow only what they can afford (asset quality) — simultaneously, from a single feature.

---

## Business Case (Sourced Numbers)

*Full model with sensitivity table and sources → [research/04-financial-model.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/research/04-financial-model.md)*

### Revenue lever

| Scenario | Post-rejection screens/mo | Engagement | Re-apply rate | Annual incremental disbursement |
|---|---|---|---|---|
| Pessimistic | 30,000 | 12% | 10% | ~₹12 Cr |
| **Conservative** | **30,000** | **15%** | **12%** | **~₹17 Cr** |
| **Base** | **60,000** | **20%** | **15%** | **~₹59 Cr** |
| Optimistic | 100,000 | 25% | 20% | ~₹149 Cr |

*Base case math: 60k screens/mo × 20% engagement × 60% profile completion × 80% plan generation × 15% re-application × 60% approval × ₹95,773 avg ticket = ₹4.96 Cr/month = **~₹59 Cr/year.***

### Asset quality lever

Simulator prevents ~129 over-borrowers/month in base case → ~10 avoided NPAs/month → **~₹11.5 Cr/year in avoided write-offs** at 8% NPA rate on over-borrowers (3× Navi's 2.46% FY25 GNPA).

**Securitisation implication:** A measurable NPA reduction on the Borrow-Safe cohort improves pool quality for future PTC issuances, reducing credit enhancement requirements and lowering cost of capital — directly relevant after the J.P. Morgan PTC deal.

**One-line pitch:** *At the conservative scenario, Borrow-Safe recovers ~₹17 Cr/year in incremental disbursement and prevents ~₹4 Cr/year in early-stage defaults — simultaneously — at near-zero marginal CAC.*

---

## North Star Metric

```
30-day re-application rate  (Borrow-Safe cohort vs. unassisted rejected-user control)
Target Q1:  +15 percentage points above unassisted baseline (~5–8%)
```

**Why this metric:** Captures both product resonance (diagnosis useful enough to act on) and outcome (user improved enough to try again). Directly tied to revenue. Measurable from Day 1 with a cohort split.

### Metric tree

```
North Star: 30-day re-application rate
│
├── Leading indicators (move within days–weeks)
│   ├── Funnel completion: rejection screen → plan generated       [target: ≥25%]
│   ├── Simulator engagement: plan page → simulator used          [target: ≥40%]
│   └── Safe-band adherence: % who adjust to recommended amount   [target: ≥55%]
│
└── Lagging indicators (confirm thesis at 30–90 days)
    ├── 90-day approval rate on re-applicants                     [target: ≥60%]
    ├── Day-30 NPA rate on recovered cohort                       [target: ≤5%]
    └── NPS on Borrow-Safe flow                                   [target: ≥40]
```

---

## Key PM Decisions (the Non-Obvious Ones)

**Why 4 form fields, not 9?**
First spec had 9 fields. Mobile form completion drops ~3–5% per extra field. 6/8 interview participants said multi-field forms felt like "re-applying." The 4 chosen fields (income, existing EMI, score range, employment type) are the minimum sufficient to compute FOIR and determine primary rejection reason at >80% accuracy.

**Why a rule engine and not an LLM?**
Diagnosis is credit-adjacent. Hallucination in a financial context is a regulatory liability. A rule engine is auditable, consistent, zero-latency, and zero-cost — and can be reviewed by Navi's credit team on Day 1 before any user touches it.

**Why 90 days, not 120?**
CIBIL publishes that payment history changes reflect in bureau data within 45–60 days; utilization changes within 30 days. 90 days is the shortest credible window for both levers to compound. 120 days lost users in research: *"Too long, I'll never stick to it"* (P6).

**Why conditional EMI Shield cross-sell?**
Initial spec showed Shield on every risk report. Then re-read the 2024 RBI action — specifically about insurance mis-selling in lending contexts. Shield now appears **only when `riskBandAfter = medium or high`.** SQL Q6 validates: 100% of Shield-surfaced users are genuinely high-risk. This is the architectural anti-pattern to the pattern that triggered the RBI action.

**Why show the EMI formula?**
`EMI = P × r × (1+r)^n / ((1+r)^n − 1)` is displayed on the simulator. Transparency is the architectural response to the 2024 RBI transparency action. Users who understand the math borrow less than is dangerous, reducing Navi's NPA rate on this cohort.

**What would change the spec:**
Three pre-stated findings that would materially change the product — because a PM who can't name them hasn't thought hard enough:
1. If the baseline re-application rate is already >15%, the asset quality lever becomes the primary thesis, not the revenue lever.
2. If Phase 0 accuracy gate fails (<80% on real rejection cases), CIBIL API integration moves from Phase 3 to Phase 1.
3. If repeat rejecters (2+ rejections) respond with cynicism rather than engagement, the copy needs to be segmented by rejection count.

---

## Research

*Full artifacts in [`research/`](https://github.com/Kanik0575/navi-borrow-safe/tree/main/research)*

### Play Store review analysis (400 reviews, 3 apps, April 2026)

Scraped using `google-play-scraper`. Hand-labelled with `funnel_stage_label`, `complaint_category`, `sentiment`.

| App | Rating | Installs | Rejection complaint % of negative reviews |
|---|---|---|---|
| MoneyView | 4.6★ | 50M+ | ~18% |
| Fibe | 4.8★ | 10M+ | ~15% |
| KreditBee | 4.5★ | 50M+ | ~22% |
| **Navi** | **4.5★** | **10M+** | **~32%** |

The story is not in the aggregate rating — it's in the complaint composition. Navi's 4.5★ overall is nearly identical to KreditBee. But 32% of Navi's negative reviews are rejection-related — nearly double MoneyView's 18%. Borrow-Safe addresses the most complained-about moment in Navi's funnel, precisely because it's a concentrated, specific problem that aggregate metrics hide.

### 8 user interviews (March–April 2026)

Age 22–34, income ₹22k–₹67k/month. Apps tested: Navi, MoneyView, KreditBee, Fibe, PhonePe Loans.

| Finding | Product decision made |
|---|---|
| 5/8 didn't know what FOIR meant | Replaced "FOIR" with "your monthly-payment-to-income ratio" throughout |
| 6/8 described rejection as a "moral verdict" | Hope-framed headline on Screen 1 |
| P6: "120 days is too long, I'll never stick to it" | Cut to 90-day plan matching CIBIL update window |
| P4, P8: "Annoying upsells" | EMI Shield conditional on risk band only |
| 6/8: Forms feel like "re-applying" | Cut from 9 fields to 4 |
| P7 recovered without knowing why | Borrow-Safe makes accidental recovery intentional |

---

## Competitive Gap (Mystery Shopping, April 2026)

| Feature | Navi now | MoneyView | Fibe | KreditBee | **Borrow-Safe** |
|---|---|---|---|---|---|
| Plain-language rejection reason | ✗ | Partial | ✗ | ✗ | ✓ |
| Structured recovery plan | ✗ | ✗ | ✗ | ✗ | ✓ |
| Safe borrowing simulator | ✗ | ✗ | ✗ | ✗ | ✓ |
| Stress-test before applying | ✗ | ✗ | ✗ | ✗ | ✓ |
| Conditional honest cross-sell | ✗ | ✗ | ✗ | ✗ | ✓ |
| Formula visibility | ✗ | ✗ | ✗ | ✗ | ✓ |

Zero competitors offer any post-rejection recovery path. This is a white space.

---

## OKRs & Kill Criteria

**Objective:** Turn loan rejections into a retention and asset-quality lever.

| Key Result | Target | Measurement |
|---|---|---|
| KR1: Funnel completion (rejection → plan) | ≥25% | `plan_generated / rejection_screen_viewed` |
| KR2: 30-day re-application rate vs. control | +15 pp | Cohort: `loan_application_submitted` within 30d |
| KR3: Approval rate on re-applicants | ≥60% | Credit decisioning outcome within 90d |
| KR4: Day-30 NPA rate on recovered cohort | ≤5% | Default flag at Day 30 post-disbursement |
| KR5: NPS on Borrow-Safe flow | ≥40 | In-app prompt at risk report screen |

**Kill criteria (explicit, not just guardrails):**

| Signal | Threshold | Decision |
|---|---|---|
| 30-day re-application rate | <8% at Day 90, p<0.05 | Pause. Redesign before Phase 2 full rollout. |
| "Wrong diagnosis" CS tickets | >5% of plan-generation volume within 30d | Immediate rollback. |
| Phase 0 accuracy gate | <80% on 30 real anonymised rejection cases | Don't launch Phase 1. |
| NPS on Borrow-Safe flow | <20 at Day 60 | Deep qualitative investigation before any further rollout. |

---

## Regulatory Context

*Full analysis → [research/05-regulatory-analysis.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/research/05-regulatory-analysis.md)*

**Why 2026 is specifically the right moment:**
- **2024 RBI restriction** on Navi (loan-pricing opacity, collections fairness) lifted after remediation — Borrow-Safe's transparent borrowing approach has political capital inside Navi independent of P&L
- **February 2026 RBI penalty** (₹3.80 lakh) on Navi Finserv for recovery agent violations — any product that reduces the population of high-risk borrowers who face collections is increasingly valuable
- **IPO context** — Navi's GNPA improved from 2.46% (March 2025) to 1.51% (December 2025). Any product that keeps that trend going is a fundraising argument.
- **J.P. Morgan PTC deal** — asset quality now has a direct, named cost-of-capital consequence

**Bottom line on regulatory risk:** Low. Borrow-Safe is not a Lending Service Provider. The 2022 RBI Digital Lending Guidelines do not apply. One real requirement: DPDPA 2023 consent checkbox before collecting income/EMI data — a 2-hour engineering change.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | Vercel-native, zero-config deploy |
| UI | Tailwind CSS v4 + shadcn/ui (base-ui v1.5) | Accessible, no runtime overhead |
| Database | Neon Postgres (serverless) | Free tier, Vercel-native, serverless HTTP driver |
| ORM | Drizzle ORM | Type-safe, SQL-first, lightweight |
| Charts | Recharts | React-native, well-documented |
| Hosting | Vercel | Free hobby tier, CI/CD from GitHub |
| **Total cost** | **₹0** | All free tiers |

---

## Project Structure

```
navi-borrow-safe/
├── src/
│   ├── app/
│   │   ├── page.tsx                # Screen 1: Rejection landing
│   │   ├── profile/page.tsx        # Screen 2: 4-field input form
│   │   ├── diagnosis/page.tsx      # Screen 3: Plain-language diagnosis
│   │   ├── plan/page.tsx           # Screen 4: 90-day action plan
│   │   ├── simulator/page.tsx      # Screen 5: Safe borrowing simulator
│   │   ├── risk/page.tsx           # Screen 6: Risk band + EMI Shield
│   │   ├── dashboard/page.tsx      # Analytics dashboard (6 SQL queries)
│   │   └── api/
│   │       ├── rejection-profile/  # POST + GET: diagnose + persist
│   │       ├── action-plan/        # POST: generate + persist plan
│   │       ├── loan-simulation/    # POST + GET: simulate + persist
│   │       └── analytics/          # GET: all 6+ SQL queries
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts           # 5 Postgres tables (Drizzle)
│   │   │   └── index.ts            # Drizzle + Neon client
│   │   └── engine/
│   │       ├── diagnosis.ts        # FOIR/rejection rule engine
│   │       ├── action-plan.ts      # 90-day plan generator
│   │       └── loan-simulation.ts  # EMI/FOIR/stress engine
│   └── components/
│       ├── NavBar.tsx
│       ├── RiskBadge.tsx
│       ├── ProgressSteps.tsx
│       └── ui/                     # shadcn components
├── scripts/
│   ├── seed.ts                     # Generates 2,000 synthetic profiles
│   ├── scrape-reviews.ts           # Scrapes Play Store reviews
│   └── queries.sql                 # All 6 SQL queries (raw)
└── drizzle/                        # Migration files (auto-generated)
```

**Architecture principle:** Server Components for read-heavy screens (fast TTFB). Client Components only where user interaction drives live calculation. All business logic lives in `lib/engine/`, not in route handlers — making it independently testable and reviewable by Navi's credit team.

---

## Database Schema

```sql
users(id, email, created_at)

rejection_profiles(
  id, user_id,
  monthly_income, existing_emi, foir_calculated,
  credit_score_bucket, employment_type,
  primary_reason, all_reasons[],
  created_at
)

action_plans(
  id, profile_id,
  target_date, steps_json,
  created_at
)

loan_simulations(
  id, profile_id,
  requested_amount, tenure_months,
  computed_emi, post_loan_foir, stress_pass_bool,
  safe_emi_max, safe_amount_max,
  risk_band_before, risk_band_after,
  shield_recommended_bool,
  created_at
)

reviews(
  id, source_app, rating, review_text,
  funnel_stage_label, complaint_category, sentiment,
  review_date, created_at
)
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/rejection-profile` | Diagnose + persist profile, return profileId + diagnosis |
| `GET` | `/api/rejection-profile?profileId=` | Fetch stored profile |
| `POST` | `/api/action-plan` | Generate + persist 90-day plan |
| `POST` | `/api/loan-simulation` | Simulate loan, persist, return simulationId |
| `GET` | `/api/loan-simulation?simulationId=` | Fetch simulation result |
| `GET` | `/api/analytics` | Run all 6+ SQL queries, return aggregated data |

---

## SQL Queries (Summary)

Full queries in [`scripts/queries.sql`](https://github.com/Kanik0575/navi-borrow-safe/blob/main/scripts/queries.sql)

| # | Business question |
|---|---|
| Q1 | Which funnel stage generates the most complaints? |
| Q2 | Navi vs. competitors: rejection complaint share |
| Q3 | Primary rejection reason distribution (sizes each fixable segment) |
| Q4 | What share fall outside the safe-EMI band? (asset-quality risk) |
| Q5 | Does following the plan move the risk band? |
| Q6 | EMI Shield impact: shown only when it genuinely helps? |

---

## Architecture

```
Browser
  │
  ├── GET /                 → Server Component (landing, static)
  ├── GET /profile          → Client Component (4-field form)
  │     └── POST /api/rejection-profile  → FOIR rule engine → Neon Postgres
  ├── GET /diagnosis        → Server Component → Neon DB
  ├── GET /plan             → Server Component → action-plan engine → Neon DB
  ├── GET /simulator        → Client Component (live calc, no DB call for preview)
  │     └── POST /api/loan-simulation    → EMI/FOIR/stress engine → Neon DB
  ├── GET /risk             → Server Component → Neon DB
  └── GET /dashboard        → Client Component
        └── GET /api/analytics           → 6+ SQL queries → Neon DB
```

---

## Setup & Running Locally

### Prerequisites
- Node.js 18+
- A free [Neon](https://neon.tech) account

### 1. Clone and install
```bash
git clone https://github.com/Kanik0575/navi-borrow-safe
cd navi-borrow-safe
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local and paste your Neon connection string
```

`.env.local`:
```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run database migrations
```bash
npm run db:push       # Pushes schema directly to Neon (easiest for dev)
# OR
npm run db:generate   # Generates migration SQL
npm run db:migrate    # Applies migrations
```

### 4. Seed the database
```bash
npm run db:seed       # ~2,000 synthetic profiles + simulations + ~400 reviews
```
Optional — scrape real Play Store reviews:
```bash
npm run db:scrape
```

### 5. Run locally
```bash
npm run dev
```
Open `http://localhost:3000`

**Test the full flow:**
1. `http://localhost:3000` — landing
2. "See why & get a plan" → fill form → diagnosis → plan → simulator → risk report
3. `http://localhost:3000/dashboard` — analytics dashboard

---

## Deployment to Vercel

```bash
# Already on GitHub at github.com/Kanik0575/navi-borrow-safe
# 1. Go to vercel.com → New Project → Import from GitHub → Select this repo
# 2. Add environment variable: DATABASE_URL = your Neon connection string
# 3. Deploy (takes ~90 seconds)

# 4. Seed production DB
DATABASE_URL=your_neon_connection_string npm run db:seed
```

---

## Honest Limitations

**What's synthetic:** 2,009 rejection profiles and loan simulations generated by `scripts/seed.ts`. The analytics dashboard is an analytical framework — the patterns are hypotheses about what real Navi data would show, not findings from real users.

**What's assumed:** The rule engine uses industry-convention thresholds (FOIR 45%, min score 650) — not Navi's actual credit policy. Every diagnosis in the app may be wrong for Navi's specific model.

**What I can't know without internal access:**
- Actual monthly post-rejection screen views at Navi
- Real re-application rate baseline and approval uplift for re-applicants
- Default correlation with FOIR bands in Navi's loan book
- Navi's actual rejection reason distribution

**The most important Day-1 data question:**
*"Of users rejected in the last 12 months, what % re-applied within 90 days — and what was their approval rate vs. first-time applicants? That's the baseline against which everything in Borrow-Safe is measured."*

---

## Portfolio Artifacts

| Document | Contents |
|---|---|
| [CASE_STUDY.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/CASE_STUDY.md) | Full PM case study: north star, OKRs, research, business case, A/B roadmap, GTM plan |
| [PITCH.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/PITCH.md) | 1-page TL;DR for recruiters |
| [INTERVIEW_PREP.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/INTERVIEW_PREP.md) | Objection defense guide with verbatim answers |
| [research/00-interview-guide.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/research/00-interview-guide.md) | 22-question user interview guide |
| [research/01-participant-list.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/research/01-participant-list.md) | 8 anonymized participants with profiles |
| [research/02-synthesis.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/research/02-synthesis.md) | 6 themes, direct quotes, pivot log |
| [research/03-affinity-map.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/research/03-affinity-map.md) | Text-based affinity map |
| [research/04-financial-model.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/research/04-financial-model.md) | Sourced financial model (Navi FY25 data), sensitivity table |
| [research/05-regulatory-analysis.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/research/05-regulatory-analysis.md) | RBI/NBFC rules, DPDPA 2023 analysis |
| [research/06-competitive-analysis.md](https://github.com/Kanik0575/navi-borrow-safe/blob/main/research/06-competitive-analysis.md) | Quantified competitive matrix, copy-risk analysis |

---

## Author

**Kanik Kumar** — BITS Pilani '27, CSE · 4th Year  
[f20230575@pilani.bits-pilani.ac.in](mailto:f20230575@pilani.bits-pilani.ac.in)

[LinkedIn](https://linkedin.com/in/kanikchaudhary) · [Case Study](https://github.com/Kanik0575/navi-borrow-safe/blob/main/CASE_STUDY.md) · [1-Page Pitch](https://github.com/Kanik0575/navi-borrow-safe/blob/main/PITCH.md) · [Live Demo](https://navi-borrow-safe.vercel.app)
