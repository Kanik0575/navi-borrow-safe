/**
 * Action Plan Generator — Navi Borrow-Safe
 *
 * Generates a 90-day, step-by-step improvement plan keyed to the
 * primary rejection reason. Steps are SPECIFIC and MEASURABLE —
 * "Pay Card X from ₹45k→₹15k" not "improve your score".
 *
 * Design decision: We only show the plan for the primary reason, plus
 * the first step of the secondary reason. Showing all reasons exhaustively
 * is cognitively overwhelming and makes users drop off.
 * (Research insight: 6/8 interviewees said generic multi-step advice
 *  felt "impossible to start" — specificity is the product.)
 */

import type { ActionStep, CreditScoreBucket, EmploymentType, RejectionReason } from "@/lib/db/schema";

// ─── Input/Output Types ────────────────────────────────────────────────────────

export interface ActionPlanInput {
  primaryReason: RejectionReason;
  allReasons: RejectionReason[];
  monthlyIncome: number;
  existingEmi: number;
  creditScoreBucket: CreditScoreBucket;
  employmentType: EmploymentType;
}

export interface ActionPlanResult {
  steps: ActionStep[];
  targetDate: Date;
  summary: string;
}

// ─── Plan templates per rejection reason ──────────────────────────────────────

type PlanGenerator = (input: ActionPlanInput) => ActionStep[];

const PLANS: Record<RejectionReason, PlanGenerator> = {

  foir_high: ({ monthlyIncome, existingEmi }) => {
    const targetEmiDrop = Math.round(existingEmi * 0.35);
    const foirAfterDrop = Math.round(((existingEmi - targetEmiDrop) / monthlyIncome) * 100);
    return [
      {
        week: 1,
        title: "Get your full CIBIL report",
        description:
          "Download your free CIBIL report at cibil.com. List every active loan and credit card with: outstanding balance, EMI amount, remaining tenure. This takes 15 minutes and is step zero.",
        impact: "You'll see exactly which loans are driving your high payment-to-income ratio.",
        category: "foir",
      },
      {
        week: 2,
        title: `Close or part-pay your smallest loan — target: cut EMIs by ₹${targetEmiDrop.toLocaleString("en-IN")}/mo`,
        description:
          "Identify the loan with the smallest outstanding balance. Make a lump-sum payment or foreclose it. A closed loan disappears from your monthly obligations immediately — unlike partial payments on large loans, which barely move the needle.",
        impact: `Removes ₹${targetEmiDrop.toLocaleString("en-IN")}/mo from obligations → FOIR drops from ${Math.round((existingEmi / monthlyIncome) * 100)}% toward ${foirAfterDrop}%.`,
        category: "foir",
      },
      {
        week: 4,
        title: "Freeze all new credit applications for 90 days",
        description:
          "Every new application creates a hard inquiry that temporarily dips your score. More importantly, any new loan increases your FOIR — exactly what you're trying to fix. No new EMI for 90 days, no exceptions.",
        impact: "Prevents FOIR from creeping back up while you're paying it down.",
        category: "foir",
      },
      {
        week: 10,
        title: "Verify your updated FOIR and re-apply",
        description:
          "Pull a fresh CIBIL report. Confirm closed loans are removed. Calculate: (total remaining EMIs ÷ your income) × 100. If the result is below 40%, you're ready to re-apply.",
        impact: "If FOIR is now ≤40%, Navi's approval probability increases significantly.",
        category: "foir",
      },
    ];
  },

  score_low: () => [
    {
      week: 1,
      title: "Enable autopay on ALL dues — today",
      description:
        "Open each bank app and enable autopay for the minimum due on every credit card and loan EMI. Payment history accounts for 35% of your credit score. One missed payment can set you back 60-90 days. Autopay costs nothing.",
      impact: "Stops all further score damage from missed payments. Necessary before anything else.",
      category: "credit_score",
    },
    {
      week: 2,
      title: "Bring every credit card below 30% utilization",
      description:
        "List each card with its limit and current balance. Pay down any card above 30% first (e.g., if your limit is ₹1,00,000, balance must be below ₹30,000). Utilization is 30% of your score and updates within one billing cycle — fastest lever you have.",
      impact: "Can add 30-50 score points within 30-45 days if you're consistently >30%.",
      category: "credit_score",
    },
    {
      week: 3,
      title: "Dispute errors on your CIBIL report",
      description:
        "Check for: loans you've closed that show as 'open', payments marked 'late' that you paid on time, accounts you don't recognise. Raise a dispute at cibil.com — resolution takes ~30 days. Errors affect ~15% of credit reports.",
      impact: "A corrected entry can instantly remove inaccurate negative marks from your score.",
      category: "credit_score",
    },
    {
      week: 12,
      title: "Check score and re-apply if 650+",
      description:
        "90 days of consistent autopay + lower utilization should move your score noticeably. Pull a fresh report. If you're at 650+, your application will likely pass the score filter. If you're at 620-649, give it one more month.",
      impact: "Score improvements compound — the trend matters as much as the number.",
      category: "credit_score",
    },
  ],

  thin_file: () => [
    {
      week: 1,
      title: "Open a secured credit card with a ₹10,000-25,000 FD",
      description:
        "Walk into any bank (HDFC, SBI, ICICI) and open a fixed deposit of ₹10,000-25,000. Ask for a secured credit card against it. You'll get a card with a limit of ~80% of the FD. The FD earns 6.5-7% interest while your credit history builds.",
      impact: "Creates your first credit account. You'll have a credit history in 6 months.",
      category: "credit_score",
    },
    {
      week: 2,
      title: "Become an authorised user on a family member's old card",
      description:
        "Ask a parent or sibling with a card older than 3 years and a clean payment history to add you as an 'authorised user'. You inherit years of their credit history without being liable for repayment. Takes 10 minutes at any bank branch.",
      impact: "Can jump-start your credit age — the second biggest scoring factor after payment history.",
      category: "credit_score",
    },
    {
      week: 3,
      title: "Use the secured card for 20-30% of its limit each month",
      description:
        "Spend roughly ₹2,000-5,000 per month on the secured card (groceries, fuel, utility bill). Set autopay for the full outstanding amount. Never carry a balance. Do this every month, without exception.",
      impact: "Builds payment history (35% of score) and demonstrates responsible utilization. Do not skip months.",
      category: "credit_score",
    },
    {
      week: 26,
      title: "Check if CIBIL has generated your score",
      description:
        "After 6 months of activity, CIBIL generates your first score. Disciplined new users typically score 650-720 on their first report. Check at cibil.com. If your score is 650+, you're now ready to apply.",
      impact: "You've gone from 'unscored' to 'approvable' in 6 months with zero impact on your savings.",
      category: "credit_score",
    },
  ],

  utilization_high: () => [
    {
      week: 1,
      title: "Map every card: limit, balance, utilization %",
      description:
        "For each credit card, note: (1) credit limit, (2) current outstanding balance, (3) utilization = balance ÷ limit × 100. Sort by utilization %, highest first. Your target: every card below 30%.",
      impact: "Knowing the exact numbers tells you exactly how much you need to pay on each card.",
      category: "credit_score",
    },
    {
      week: 2,
      title: "Pay the highest-utilization card first",
      description:
        "A ₹5,000 payment on a ₹10,000 card (50% → 0%) improves your score far more than ₹5,000 on a ₹1,00,000 card (50% → 45%). Target the highest-% card first. Make the payment now — utilization updates within one billing cycle.",
      impact: "Utilization changes can show on your score within 30 days — fastest scoring lever available.",
      category: "credit_score",
    },
    {
      week: 3,
      title: "Request a credit limit increase on your main card",
      description:
        "Call your bank and ask for a limit increase without a hard inquiry (ask specifically — some banks soft-pull only). Even without changing your balance, doubling your limit halves your utilization. E.g., ₹20,000 balance on a ₹40,000 limit = 50% → on a ₹80,000 limit = 25%.",
      impact: "Free improvement with no cash outlay. Works especially well if you have good payment history.",
      category: "credit_score",
    },
    {
      week: 8,
      title: "Verify all cards are below 30% and re-check score",
      description:
        "Pull a fresh CIBIL report. Confirm every card shows below 30% utilization. Your score should reflect the improvement. If the score is now 650+, you're ready for the simulator.",
      impact: "Score improvement should be visible. If not, wait one more billing cycle.",
      category: "credit_score",
    },
  ],

  employment_risk: ({ employmentType }) => [
    {
      week: 1,
      title: "Download your last 2 years of ITR from the IT portal",
      description:
        "Go to incometax.gov.in → Login → e-File → Income Tax Returns → View Filed Returns. Download the ITR-V acknowledgements for the last 2 assessment years. Lenders use ITR to verify self-employed income. Without it, no unsecured loan application will progress.",
      impact: "Non-negotiable first step. No lender will proceed without 2 years of ITR.",
      category: "documentation",
    },
    {
      week: 2,
      title: "Ensure 3 months of consistent bank credits",
      description: `Your ${employmentType === "self_employed" ? "business" : "freelance"} income should appear as regular credits in your primary bank account. If income is lumpy, get a letter from your major clients confirming ongoing engagement. Consistent credits = the closest equivalent to a salary slip.`,
      impact: "3 months of consistent deposits addresses the biggest concern lenders have about variable income.",
      category: "documentation",
    },
    {
      week: 4,
      title: "Push your credit score to 700+",
      description:
        "Self-employed applicants need a higher score than salaried applicants to compensate for income variability. At 700+, lenders are significantly more flexible on documentation. Use the score-improvement steps (autopay, low utilization).",
      impact: "A 700+ score can overcome ~80% of employment-type risk concerns in lender models.",
      category: "credit_score",
    },
    {
      week: 8,
      title: "Apply jointly with a salaried co-applicant or get a secured loan first",
      description:
        "Two parallel options: (1) Apply for a personal loan jointly with a salaried family member — their income stability compensates for yours. (2) Get a gold loan or LAP first — near-100% approval for any applicant with an asset — and use timely repayments to build your credit profile.",
      impact: "Either path unlocks a loan now and adds to your credit history for future unsecured applications.",
      category: "employment",
    },
  ],
};

// ─── Main generator ────────────────────────────────────────────────────────────

export function generateActionPlan(input: ActionPlanInput): ActionPlanResult {
  const { primaryReason, allReasons } = input;

  // Generate primary plan
  const steps: ActionStep[] = [...PLANS[primaryReason](input)];

  // Add first step of secondary reason (if it exists and is different)
  if (allReasons.length > 1) {
    const secondaryReason = allReasons[1];
    if (secondaryReason && secondaryReason !== primaryReason) {
      const secondarySteps = PLANS[secondaryReason]?.(input) ?? [];
      if (secondarySteps[0]) {
        const maxWeek = Math.max(...steps.map((s) => s.week));
        steps.push({
          ...secondarySteps[0],
          week: maxWeek + 2,
          title: `Also: ${secondarySteps[0].title}`,
        });
      }
    }
  }

  // Target date = 90 days from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 90);

  const SUMMARIES: Record<RejectionReason, string> = {
    foir_high:
      "Your monthly payment load is too high relative to your income. Closing even one small loan has an immediate FOIR impact — start there. You can be back to an approvable ratio in 60-90 days.",
    score_low:
      "90 days of on-time payments + lower card utilization = a meaningfully higher score. Payment history is 35% of your score. Autopay is free and takes 10 minutes to set up. Start today.",
    thin_file:
      "You don't have bad credit — you have no credit. One secured card + 6 disciplined months = a scoreable, approvable credit file. This is the fastest known path from zero to eligible.",
    utilization_high:
      "Your card balances are likely crowding your credit limit. Pay down the highest-% card first — score improvements from lower utilization can appear in as little as 30 days.",
    employment_risk:
      "Documentation is your unlock. Two years of ITR + 3 months of consistent bank credits is what lenders need to trust variable income. Get those documents ready first — everything else is secondary.",
  };

  return {
    steps,
    targetDate,
    summary: SUMMARIES[primaryReason],
  };
}
