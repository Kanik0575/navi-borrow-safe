# Interview Synthesis — Navi Borrow-Safe

**Notes from 8 conversations, March–April 2026**  
Each theme is tagged with the people who brought it up. Quotes are from my session notes — I've kept them close to what was actually said but they're notes, not transcripts.

---

## Theme 1: The Rejection Screen Communicates Nothing Actionable
**Supported by:** P1, P3, P5, P6, P7 (5/8)

Every rejected participant saw a message equivalent to "not eligible at this time" or "your application could not be processed." Not one screen explained *why*. Not one screen told users what to do next.

**Representative quotes:**

> **P3 (Rahul):** *"I just saw 'not eligible.' I didn't even know if it was my salary or my credit score or something else. It felt like a test where they don't give you the questions back."*

> **P1 (Arjun):** *"I applied on two apps on the same day. Both said 'not eligible.' I thought maybe I'd done something wrong, like uploaded the wrong document."*

> **P5 (Suresh, self-employed):** *"I was rejected three times. The third time I called customer care. They said 'it's an automated decision, we can't tell you the reason.' That's when I stopped trying."*

**Product decision:** Every rejection reason on the diagnosis screen is stated in plain language with the specific threshold. Users can verify the logic. "Your monthly payments are X% of your income — lenders want this below Y%" not "Your FOIR exceeds threshold."

---

## Theme 2: Rejection Feels Like a Moral Judgment, Not a Data Point
**Supported by:** P1, P3, P4, P6, P7, P8 (6/8)

The emotional experience of rejection was consistently described as personal, stigmatising, or confusing. Users did not experience rejection as neutral information — they experienced it as a verdict on their trustworthiness.

**Representative quotes:**

> **P6 (Anjali):** *"I felt like I'd done something wrong. Like the bank doesn't trust me. But I've never taken a loan before — how can I have bad credit if I've never done anything?"*

> **P3 (Rahul):** *"My friend got approved on the same app. I didn't understand why he could and I couldn't. I didn't ask him because it felt embarrassing."*

> **P7 (Vikram):** *"The second time I applied and got approved, I had just closed a small loan the month before. I didn't know that was the reason [for the first rejection]. Nobody told me."*

**Product decision:** The landing screen headline is "Not approved this time — let's get you ready." Forward-looking, not backward-judging. The word "rejected" never appears in user-facing copy. Every screen is framed around what to do next.

**Note on P7:** This is the most important data point for the product thesis. Vikram fixed his FOIR accidentally and got approved — but he didn't know why the first rejection happened or why the second application succeeded. Borrow-Safe makes this connection explicit and intentional.

---

## Theme 3: Financial Jargon Is a Comprehension Barrier
**Supported by:** P1, P3, P5, P6 (5/8, with partial understanding from P4 and P7)

When asked "have you heard of FOIR?", 5 of 8 said no. When the concept was explained as "what percentage of your monthly income goes to existing loan payments," all 5 immediately understood what had caused their rejection.

**Representative quotes:**

> **P1 (Arjun):** *"Oh — so it's basically how much of my salary is already spoken for? That's it? Why didn't they just say that?"*

> **P5 (Suresh):** *"I have two business loans and a credit card. I never added up what I'm paying per month. I just knew each payment individually. I had no idea they were adding up to 62% of my income."*

**Product decision:** The word "FOIR" never appears in user-facing copy. We say "your monthly-payment-to-income ratio" or "X% of your income already goes to existing payments." The diagnosis screen shows the calculation explicitly: ₹[existing EMI] / ₹[income] × 100 = X%.

---

## Theme 4: Nobody Had Told Them Whether Their EMI Was Safe
**Supported by:** P2, P4 (2/8 — both approved participants who reflected on affordability)

Both approved participants who had experience with repayment discussed this unprompted. Neither had been told whether their loan was within a "safe" payment-to-income ratio before they borrowed.

**Representative quotes:**

> **P2 (Meera):** *"I wish someone had told me ₹15,000 EMI on ₹35,000 income is too much. I would have borrowed ₹1 lakh instead of ₹2 lakh. I didn't know I had that option."*

> **P4 (Priya):** *"I asked the app if this EMI was affordable. There was no answer — it just showed me the amount. I assumed if they were giving me the loan, it must be fine."*

**Product decision:** This is the Persona B insight that no competitor builds for. The simulator screen shows live FOIR, stress tests (30% income drop; 1-month no-income scenario), and a "safe EMI max" before the user applies. It exists entirely because of P2's quote. This is also the asset-quality lever: users who voluntarily reduce their loan amount after seeing their FOIR are demonstrably lower-default borrowers.

---

## Theme 5: Post-Rejection Inaction Is the Default
**Supported by:** P1, P3, P5, P6 (4/8 who were rejected multiple times or gave up)

After rejection, the most common behavior was either immediate competitor-shopping or complete inaction. None of the rejected participants received a structured path forward from the lender.

**Representative quotes:**

> **P3 (Rahul):** *"I tried two apps. Both rejected. Then I just waited. I didn't know what I was waiting for. Six months later I applied again and got rejected again. I gave up after that."*

> **P6 (Anjali):** *"Someone told me to get a secured credit card, but I didn't know how. I thought FDs were only for old people. I just didn't apply for anything for a year."*

**Product decision:** The 90-day plan is specific, not vague. Not "improve your credit" but "open a secured card against a ₹10,000 FD at HDFC — walk-in process, 30 minutes, your FD earns 6.5% while your credit history builds." Specificity defeats inaction.

---

## Theme 6: The Self-Employed / Variable-Income Gap
**Supported by:** P5 (1/8, but high-signal)

Suresh (P5) is self-employed with ₹67k/month income. Despite having adequate income, he was rejected 3 times because he couldn't produce documentation that lenders accept. Customer care told him nothing actionable.

**Representative quotes:**

> **P5 (Suresh):** *"I earn more than my friend who got approved. But they want a salary slip. I file ITR but the app doesn't ask for it. It just says 'upload your salary slip.' I'm self-employed — I don't have one."*

> **P5 (Suresh):** *"If someone had told me: download your ITR from the income tax portal and get a current account statement for 3 months — I would have done it immediately. Nobody told me."*

**Product decision:** The employment_risk plan step specifically walks self-employed users through downloading ITR from incometax.gov.in and explains why 3 months of consistent bank credits is the substitute for a salary slip. This step came directly from P5's session.

---

## Pivots and Decisions Changed by Research

The following initial product decisions were **reversed** or **modified** based on interview findings:

| Initial assumption | What the research showed | Change made |
|-------------------|------------------------|-------------|
| Show all rejection reasons on diagnosis screen | P1 and P3 found multiple reasons overwhelming: "I didn't know where to start" | Show primary reason first, secondary on scroll; plan addresses only primary + first step of secondary |
| Include city and loan purpose in profile form (9 fields) | 6/8 said loan purpose felt irrelevant and forms felt "like applications I'm trying to fill" — completion anxiety | Cut to 4 fields only: income, EMI, score bucket, employment type |
| Position EMI Shield on every screen | P4 and P8 found insurance upsells "annoying" when they hadn't asked | Conditional: EMI Shield shown only when riskBandAfter = medium/high. Invisible when risk is low. |
| Use the word "FOIR" in the diagnosis screen | 5/8 didn't know what FOIR was | "FOIR" never appears in user-facing copy — always "payment-to-income ratio" |
| 120-day recovery plan | P6 found "4 months feels too long, I'll never stick to it" | 90-day plan: shorter, more urgent, consistent with CIBIL's 60-90 day update window |

---

## Summary Matrix

| Theme | Participants | Feature driven |
|-------|-------------|---------------|
| 1. No explanation after rejection | P1, P3, P5, P6, P7 | Diagnosis screen — plain language |
| 2. Rejection feels like moral judgment | P1, P3, P4, P6, P7, P8 | Landing headline + copy tone throughout |
| 3. Jargon as barrier | P1, P3, P5, P6 | No "FOIR" in copy; formula shown |
| 4. EMI affordability blind spot | P2, P4 | Safe Borrowing Simulator |
| 5. Post-rejection inaction | P1, P3, P5, P6 | Specific 90-day plan |
| 6. Self-employed documentation gap | P5 | employment_risk plan steps |
