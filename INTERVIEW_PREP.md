# Interview Preparation Guide — Navi Borrow-Safe

**For:** Kanik Kumar · Navi PM Intern (PS2) interviews  
**Purpose:** Verbal defense guide — every likely objection with the exact data to counter it

---

## 1. The Elevator Pitch (60 seconds)

*"Navi rejects about 60–100k loan applicants per month who completed a full application. The current post-rejection screen says 'not eligible at this time' with no explanation and no path forward. Those users — who Navi has already acquired — either churn to competitors or give up.*

*I built Borrow-Safe: a 6-screen flow that diagnoses exactly why you were rejected in plain language, generates a specific 90-day recovery plan, and lets you stress-test a safer loan amount before you re-apply. The product converts a rejection dead-end into the start of a lending relationship.*

*At conservative assumptions — using Navi's actual FY25 disbursement data — recovering even 1–2% of rejected applicants represents ₹17–59 Cr/year in incremental disbursement at near-zero CAC. There's also an asset quality component: users who use the simulator voluntarily reduce their loan amount, making them lower-NPA borrowers.*

*The north star metric is 30-day re-application rate from Borrow-Safe users vs. unassisted control. I'd want to see +15 percentage points above baseline."*

---

## 2. The Most Likely Objections — With Defenses

### Q: "How do you know your rejection rate numbers are right? 50k or 60k per month — where does that come from?"

**Defense:**
- Navi's FY2025 annual report shows 13.6 lakh personal loans disbursed (~113k/month)
- Industry digital NBFC approval rates run 25–50% of completed applications (DLAI-CRIF Fintech Barometer)
- At 50% approval, monthly rejections at the final-screen stage = ~113k
- I chose 60k as the base case — conservative, representing completed applications only (not early-stage drop-offs)
- "If the real number is 20k, the base case revenue is ~₹20 Cr/year. Still worth building."
- **Don't defend the exact number — defend the structure of the model. The model is parametric: plug in your number, the output scales.**

### Q: "Your financial model assumes a 15% re-application rate. Where does that come from?"

**Defense:**
- The unassisted re-application baseline for digital lenders is ~5–8% (no published study I found gives a precise number for India; CRIF Barometer tracks delinquencies but not re-application)
- 15% is the *target*, not the baseline — I'm claiming Borrow-Safe adds +10pp above the ~5% baseline
- "I explicitly mark this as an assumption in the model. The correct answer is: the first 30-day cohort tells us the real number. The business case doesn't need 15% to be positive — even at 10% the conservative scenario is ~₹12 Cr/year."
- **The model is a framework, not a prediction. Show you know the difference.**

### Q: "Why would users actually follow a 90-day plan? Most people don't stick to plans."

**Defense:**
- This is the right question. It's why the north star is re-application rate, not plan completion rate.
- Plan adherence is a second-order concern. Even 20% adherence → 20% of plan-generated users re-apply → still positive
- The Day 75 nudge experiment (in the A/B roadmap) tests whether a push notification improves 90-day return rate
- "The plan doesn't need everyone to follow it. It needs to shift the distribution. P7 in my research accidentally did one thing (closed a loan) and got approved. The plan makes that intentional for the marginal user who would have figured it out anyway."

### Q: "Competitors can copy this in 3 months. What's the moat?"

**Defense:**
- Surface UX: Yes, 2–4 weeks to replicate
- Real moat: behavioral data accumulated from the recovery journey; Navi-specific credit policy integration; trust attribution (first-mover gets the relationship credit)
- "The moat isn't the feature — it's the data. Every user who follows the plan creates a structured improvement record that Navi can use to calibrate the re-application approval model. That data is exclusive to Navi."
- "Also: MoneyView and Fibe can copy the diagnosis screen. They can't copy Navi's credit policy into the diagnosis — only Navi knows its own thresholds. That's the proprietary version of this feature."

### Q: "You mentioned the RBI action in 2024. Is there any regulatory risk to this product?"

**Defense:**
- "I did a regulatory analysis — it's in `research/05-regulatory-analysis.md`"
- Key point: Borrow-Safe is not a Lending Service Provider. It doesn't disburse loans, pull CIBIL, or charge fees. The 2022 Digital Lending Guidelines don't apply to it.
- One real requirement: DPDPA 2023 requires a consent checkbox before collecting income/EMI data. That's a 2-hour engineering change.
- "The regulatory situation is actually favorable. The RBI Fair Practices Code already requires NBFCs to disclose rejection reasons. Borrow-Safe makes that disclosure better. A PM could argue it helps Navi demonstrate Fair Practices Code compliance more substantively."

### Q: "Your FOIR threshold is 45%. Navi's actual threshold might be different."

**Defense:**
- "Yes — and this is the most important caveat in the whole product."
- The rule engine uses industry conventions (FOIR 45%, min score 650) because I don't have access to Navi's internal credit policy
- In production: the engine would be replaced with Navi's actual parameters, or Borrow-Safe would sit *outside* the credit engine and surface only the output decision (not re-implement the model)
- "The 90-day plan is validated by the user's behavior change, not by Navi's credit model. Even if the threshold is 42% not 45%, the plan advice (reduce EMI, pay down high-utilization card) is correct for the user's direction of improvement."

### Q: "Why did you build this instead of just writing a case study?"

**Defense:**
- "Because writing a case study about building a product is not the same as building it."
- "The technical decisions forced product decisions I wouldn't have had to make in a deck: Why 4 fields not 9? Because I tried 9 and the form felt like an application. Why show the formula? Because hiding it felt dishonest given Navi's context. Why conditional EMI Shield? Because I read the RBI action carefully."
- "The live URL also means anyone can verify my claims. The SQL queries are in the repo. The data is in a live Postgres database. I can't hide bad thinking behind a Figma mockup."

### Q: "Tell me about a time you got something wrong in this project."

**Defense (use this answer):**
- "My initial design had EMI Shield shown on every risk report screen. I thought more exposure = more cross-sell revenue."
- "Then I read the 2024 RBI action more carefully. The action was specifically about insurance mis-selling in lending contexts. A product that shows a ₹199/month insurance upsell to every borrower, regardless of their risk level, is the same pattern."
- "I changed it to conditional: Shield appears only when riskBandAfter = medium or high. The SQL query (Q6) validates that 100% of Shield-shown users are genuinely high-risk. That's the change — and I'd defend it to a compliance team."
- **This answer shows regulatory awareness, intellectual honesty, and a real product decision. Use it.**

### Q: "How would you prioritize within the Navi product org? Where does this sit?"

**Defense:**
- Borrow-Safe sits at the intersection of Growth (recovering rejected applicants) and Risk (reducing NPA on the recovered cohort)
- It touches the post-application experience team, the credit team (for integration), and potentially the insurance team (EMI Shield)
- Day-1 priority: Get credit team to validate the diagnosis logic against real rejection data. Nothing else ships until that's done.
- "I'd also want to know the monthly rejection volume from the data team on Day 1. That number changes the business case from 'directionally positive' to 'prioritized or deprioritized.'"

---

## 3. Questions to Ask the Interviewer

**Good questions that show depth:**

1. "What % of rejected Navi applicants re-apply within 90 days today — and what's their approval rate? That's the baseline for evaluating everything in this project."

2. "When Navi rejects a loan today, does the user get a reason in the rejection screen? Or in a follow-up communication? What does that communication look like?"

3. "Has the product team thought about the post-rejection experience before? What's stopped it from being built?"

4. "Who owns the post-rejection user experience internally — the lending product team, growth, or risk?"

5. "The 2024 RBI remediation included commitments around transparency. Has that changed internal product priorities around borrower communication?"

---

## 4. Numbers to Have Ready (Memorize These)

| Fact | Number | Source |
|------|--------|--------|
| Navi FY25 personal loan disbursements | 13.6 lakh / year (~113k/month) | Navi Finserv AR 2024-25 |
| Average loan ticket (FY25) | ~₹95,773 | Derived from AR |
| Navi GNPA (March 2025) | 2.46% | CARE Ratings |
| Navi GNPA (Dec 2025, improved) | 1.51% | CARE Ratings |
| Fintech share of personal loan sanctions | 76% (H1 FY25) | Business Standard |
| RBI DL Circular date/number | Sep 2, 2022 · DOR.CRE.REC.66/21.07.001/2022-23 | RBI |
| North star target | +15 pp 30-day re-application rate | Your model |
| Business case base | ~₹59 Cr/year | Your model |
| Business case conservative | ~₹17 Cr/year | Your model |
| Interview count | 8 (5 rejected, 2 approved-struggling, 1 approved-fine) | Your research |
| Play Store reviews scraped | 400 (Navi, MoneyView, Fibe) | Your scraper |
| Rejection complaint share in reviews | 28–35% | Your analysis |
| DPDPA consent gap | 2-hour engineering fix | Your regulatory analysis |
