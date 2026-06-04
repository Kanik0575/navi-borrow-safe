# Affinity Map — Navi Borrow-Safe User Research

Mapped themes across all 8 sessions — grouped the recurring patterns into clusters and tied each to a product decision. Every quote below is from a real conversation.

---

## CLUSTER A — "The Black Box Rejection"
*Theme: Users receive no information from the rejection screen*

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLUSTER A: THE BLACK BOX                                           │
│                                                                     │
│  [P3] "Not eligible" — no reason, no context                        │
│  [P1] Applied on 2 apps same day, both rejected, assumed own fault   │
│  [P5] Called CS after 3rd rejection — told "automated, can't say"   │
│  [P7] Never knew closed loan was the fix until it accidentally worked│
│  [P6] "Am I bad with money? I've never taken a loan before"         │
│                                                                     │
│  → PRODUCT: Plain-language diagnosis screen with threshold shown    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CLUSTER B — "The Emotional Sting"
*Theme: Rejection feels like a moral verdict, not neutral information*

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLUSTER B: EMOTIONAL STING                                         │
│                                                                     │
│  [P3] "Like a test where they don't return the questions"           │
│  [P6] "I felt like the bank doesn't trust me"                       │
│  [P3] Embarrassed to ask approved friend why it worked for him      │
│  [P1] "Did I upload the wrong document? Did I do something wrong?"  │
│  [P8] "I was nervous even when I got approved"                       │
│                                                                     │
│  → PRODUCT: "Not approved this time — let's get you ready."         │
│    Forward-framing, never backward-judging                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CLUSTER C — "The Jargon Wall"
*Theme: Financial terms (FOIR, utilization, thin file) are invisible to users*

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLUSTER C: JARGON WALL                                             │
│                                                                     │
│  [P1] Never heard of FOIR → immediately understood when explained   │
│  [P3] "What does 'credit utilization' mean?"                        │
│  [P5] Never calculated total monthly obligation across 2 loans+card │
│  [P6] Knew about CIBIL score but not what drives it                 │
│  [P4] "It said my CIBIL was fine but I still got rejected. Why?"    │
│                                                                     │
│  → PRODUCT: No "FOIR" in copy. "X% of income goes to payments."     │
│    Formula visible. User can verify every number.                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CLUSTER D — "The Affordability Blind Spot"
*Theme: Approved users have no idea whether the loan is safe for their income*

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLUSTER D: AFFORDABILITY BLIND SPOT                                │
│                                                                     │
│  [P2] "₹15k EMI on ₹35k income. Nobody told me."                   │
│  [P2] "I would have borrowed ₹1L instead of ₹2L. Didn't know I     │
│        could choose."                                               │
│  [P4] "If they're approving me, I assumed it must be affordable"    │
│  [P8] "I got lucky. I didn't calculate anything beforehand."        │
│                                                                     │
│  → PRODUCT: Safe Borrowing Simulator — live FOIR, stress tests,     │
│    safe-amount nudge BEFORE user applies                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CLUSTER E — "The Inaction Loop"
*Theme: After rejection, most users don't know what to do and stop trying*

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLUSTER E: INACTION LOOP                                           │
│                                                                     │
│  [P3] Tried 2 apps → both rejected → "just waited" → rejected again │
│  [P6] "Someone told me to get a secured card but I didn't know how" │
│  [P5] "If they'd told me what to fix, I would have fixed it same day│
│  [P1] Applied to 2nd app immediately → rejected → stopped           │
│  [P7] Accidentally fixed it (closed a loan) → re-applied → approved │
│                                                                     │
│  → PRODUCT: 90-day plan with specific, actionable steps per reason  │
│    Not "improve score" → "Pay ₹5k on highest-utilization card now"  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CLUSTER F — "The Self-Employed Documentation Gap"
*Theme: Variable-income users have specific, unaddressed documentation problems*

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLUSTER F: SELF-EMPLOYED GAP                                       │
│                                                                     │
│  [P5] ₹67k/mo income but 3 rejections — "no salary slip"           │
│  [P5] Has 2-year ITR but app never asked for it                     │
│  [P5] "Earns more than approved friend but couldn't prove it"       │
│  [P5] Nobody told him 3 months bank credits + ITR = lender accepts  │
│                                                                     │
│  → PRODUCT: employment_risk plan: ITR download steps, bank credit   │
│    consistency, co-applicant option, gold loan as credit-builder    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Themes That Changed the Product (Pivot Log)

```
INITIAL ASSUMPTION                    →    RESEARCH FINDING           →  CHANGE

9-field form (industry standard)      →    "Forms feel like            →  4 fields only
                                           applications" [6/8]

All rejection reasons shown at once   →    "I didn't know where        →  Primary first,
                                           to start" [P1, P3]             secondary on scroll

EMI Shield shown always               →    "Annoying upsells" [P4, P8] →  Conditional on
                                                                           riskBandAfter

"FOIR" on diagnosis screen            →    5/8 didn't know FOIR        →  Replaced with
                                                                           plain language

120-day plan                          →    "4 months too long" [P6]    →  90-day plan
```
