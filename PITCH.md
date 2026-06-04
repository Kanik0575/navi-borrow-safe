# Navi Borrow-Safe — 1-Page TL;DR

**Kanik Kumar · BITS Pilani '27 · CSE · f20230575@pilani.bits-pilani.ac.in**  
**Live:** navi-borrow-safe.vercel.app · **Code:** github.com/Kanik0575/navi-borrow-safe · **Case study:** CASE_STUDY.md

---

## The Problem (1 sentence)

When Navi rejects a loan application, the user sees "not eligible at this time" — no explanation, no recovery path — and churns to a competitor. Navi spent the acquisition cost, kept the risk, captured nothing.

## The Insight (from 8 user interviews + 400 Play Store reviews)

- 5/8 interviewees didn't know what FOIR meant — but understood their rejection *instantly* when it was explained in plain language
- 6/8 said rejection felt like a moral judgment, not a data point
- 1 user accidentally fixed his rejection reason (closed a loan) and got approved — without ever knowing why the first attempt failed
- 28–35% of negative Play Store reviews across Navi, MoneyView, and Fibe are rejection-related — the single largest complaint category. Navi's share (32%) is nearly double MoneyView's (18%) despite similar aggregate ratings (4.5★ vs 4.6★) — the pain is hidden in the headline number

## The Product

A 6-screen post-rejection flow built into the Navi app:

```
Rejection → Diagnosis (plain language, formula shown) → 90-day plan (specific to reason)
→ Safe Borrowing Simulator (live FOIR + stress tests) → Risk report + EMI Shield (conditional)
```

Key PM decisions: 4 fields not 9 (user research), "FOIR" never in copy, EMI Shield shown only at medium/high risk (anti-mis-selling), transparent formula (post-RBI-action alignment).

## North Star Metric

**30-day re-application rate from Borrow-Safe users vs. control**  
Target: +15 percentage points above unassisted baseline (~5–8%).

## Business Case

| Scenario | Annual incremental disbursement | Avoided NPA |
|----------|--------------------------------|-------------|
| Conservative | ~₹17 Cr/yr | ~₹4 Cr |
| Base | ~₹59 Cr/yr | ~₹11.5 Cr |
| Optimistic | ~₹149 Cr/yr | ~₹28 Cr |

*Sources: Navi Finserv AR 2024-25 (₹95k avg ticket, 1.13L monthly disbursals); all model assumptions explicit in research/04-financial-model.md*

## What I Built

- **Full-stack Next.js 16 app** — deployed on Vercel with Neon Postgres, Drizzle ORM
- **Deterministic rule engine** — diagnosis, plan, simulation — auditable, no LLM
- **12 SQL-backed analytics** — rejection patterns, FOIR histogram, competitive benchmarking, risk-band transitions, A/B experiment roadmap, business case
- **Research artifacts** — 8 interviews (guide, participant list, synthesis, affinity map), competitive matrix, financial model, regulatory analysis (all in `research/`)

## Regulatory Position

Low risk. Not an LSP. No bureau pull. One real requirement: DPDPA 2023 consent checkbox before data collection — a 2-hour engineering change. Analysis in research/05-regulatory-analysis.md.

## What I'd Ask on Day 1

*"Of users rejected in the last 12 months, what % re-applied within 90 days — and what was their approval rate vs. first-time applicants? That's the baseline against which everything in this product is measured."*

---

**Research folder:** `research/` — all artifacts, sources, and citations  
**Full case study:** `CASE_STUDY.md`  
**Interview prep:** `INTERVIEW_PREP.md`
