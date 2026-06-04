/**
 * Seed Script — Navi Borrow-Safe
 *
 * Generates:
 *   - 2,000 synthetic rejection_profiles with realistic income/FOIR/score distributions
 *   - 2,000 corresponding loan_simulations (one per profile)
 *   - ~400 synthetic Play Store reviews (Navi + MoneyView + Fibe)
 *
 * Run: npm run db:seed
 *
 * All data is explicitly labelled SYNTHETIC — never presented as real Navi data.
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import { simulate } from "../src/lib/engine/loan-simulation";
import { diagnose } from "../src/lib/engine/diagnosis";
import { generateActionPlan } from "../src/lib/engine/action-plan";
import type {
  CreditScoreBucket,
  EmploymentType,
  RejectionReason,
} from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ─── Utility helpers ──────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Weighted random — weights don't need to sum to 1 */
function weightedChoice<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysAgo));
  return d;
}

// ─── Review templates ─────────────────────────────────────────────────────────

const REVIEW_TEMPLATES: Record<
  string,
  Array<{ text: string; funnelStage: string; category: string }>
> = {
  navi: [
    { text: "Applied for a personal loan but got rejected without any clear reason. Very frustrating experience.", funnelStage: "rejection", category: "rejection" },
    { text: "The rejection was instant and they didn't tell me why. At least give me a reason!", funnelStage: "rejection", category: "rejection" },
    { text: "Great app, got my loan disbursed in 2 hours. Very smooth process.", funnelStage: "disbursement", category: "processing_time" },
    { text: "EMI deducted twice this month. Support is not responding at all.", funnelStage: "repayment", category: "customer_service" },
    { text: "Interest rate is higher than what was shown during application. Misleading.", funnelStage: "disbursement", category: "interest_rate" },
    { text: "KYC took 3 days, meanwhile the loan offer expired. Had to re-apply.", funnelStage: "application", category: "kyc" },
    { text: "Rejected again for the second time. No explanation given. Will never use Navi again.", funnelStage: "rejection", category: "rejection" },
    { text: "App crashes every time I try to check my loan statement.", funnelStage: "repayment", category: "app_bug" },
    { text: "Applied with a CIBIL score of 740 and still got rejected. Makes no sense.", funnelStage: "rejection", category: "rejection" },
    { text: "Customer support is just bots. No human available to resolve my issue.", funnelStage: "repayment", category: "customer_service" },
    { text: "Fast disbursement and transparent charges. Happy with the service.", funnelStage: "disbursement", category: "processing_time" },
    { text: "Why is my credit score not shown as the reason for rejection? I have a right to know.", funnelStage: "rejection", category: "rejection" },
    { text: "Processing takes too long compared to competitors like Fibe.", funnelStage: "application", category: "processing_time" },
    { text: "Loan amount was reduced without informing me. Very unprofessional.", funnelStage: "disbursement", category: "rejection" },
    { text: "5 stars — absolutely seamless experience. Got ₹2L in 3 hours.", funnelStage: "disbursement", category: "processing_time" },
    { text: "Rejected without explanation. Checked my CIBIL — it's 710. What is the actual criteria?", funnelStage: "rejection", category: "rejection" },
    { text: "The app UI is clean and easy to use. Application process was simple.", funnelStage: "application", category: "processing_time" },
    { text: "Harassment calls for missed payment even after I paid. Terrible experience.", funnelStage: "repayment", category: "customer_service" },
    { text: "Rates went up after disbursement. Not what was agreed.", funnelStage: "repayment", category: "interest_rate" },
    { text: "Video KYC failed 4 times due to app issues. Had to give up.", funnelStage: "application", category: "kyc" },
  ],
  moneyview: [
    { text: "Got rejected for a personal loan. The app just says 'not eligible' with zero details.", funnelStage: "rejection", category: "rejection" },
    { text: "Quick approval and disbursement within 24 hours. Very reliable.", funnelStage: "disbursement", category: "processing_time" },
    { text: "Rejected 3 times from MoneyView even though my score is 720. Frustrating.", funnelStage: "rejection", category: "rejection" },
    { text: "Transparent about charges, no hidden fees. Best personal loan app.", funnelStage: "disbursement", category: "interest_rate" },
    { text: "App crashes during repayment. Scared my EMI won't process.", funnelStage: "repayment", category: "app_bug" },
    { text: "Customer care line is always busy. No email support either.", funnelStage: "repayment", category: "customer_service" },
    { text: "Interest rate changed after approval. Very deceptive.", funnelStage: "disbursement", category: "interest_rate" },
    { text: "Loan approval in 10 minutes. Impressive technology.", funnelStage: "application", category: "processing_time" },
    { text: "Rejected without reason. I have clean history. Very disappointed.", funnelStage: "rejection", category: "rejection" },
    { text: "KYC process is smooth but takes too many selfies and documents.", funnelStage: "application", category: "kyc" },
    { text: "Good for quick personal loans. Rates are competitive.", funnelStage: "disbursement", category: "interest_rate" },
    { text: "Prepayment charges are very high. Trapped in the loan.", funnelStage: "repayment", category: "interest_rate" },
    { text: "Not approved even after multiple applications. No explanation.", funnelStage: "rejection", category: "rejection" },
    { text: "Processing time is too slow compared to what was promised.", funnelStage: "application", category: "processing_time" },
    { text: "Seamless experience overall. Would recommend to friends.", funnelStage: "disbursement", category: "processing_time" },
  ],
  fibe: [
    { text: "Fibe rejected my application without any reason. 760 CIBIL and still no.", funnelStage: "rejection", category: "rejection" },
    { text: "Super fast — got the money in 2 hours. Best loan app I've used.", funnelStage: "disbursement", category: "processing_time" },
    { text: "Interest rate is 24% which is way too high for a good credit profile.", funnelStage: "disbursement", category: "interest_rate" },
    { text: "App UI is very clean. Application process took only 5 minutes.", funnelStage: "application", category: "processing_time" },
    { text: "Got rejected again. This is my fourth attempt. Zero transparency.", funnelStage: "rejection", category: "rejection" },
    { text: "Auto-debit failed but I already paid manually. Support took 5 days to resolve.", funnelStage: "repayment", category: "customer_service" },
    { text: "Good loan app for young professionals. Competitive rates.", funnelStage: "disbursement", category: "interest_rate" },
    { text: "Rejection communication is very poor. Just a banner that says 'not eligible'.", funnelStage: "rejection", category: "rejection" },
    { text: "KYC validation takes too long. Had to wait 48 hours.", funnelStage: "application", category: "kyc" },
    { text: "Zero hidden charges — what they show is what they charge. Respect.", funnelStage: "disbursement", category: "interest_rate" },
    { text: "Chat support doesn't understand the issue. Always gives scripted replies.", funnelStage: "repayment", category: "customer_service" },
    { text: "Why does Fibe reject salaried people with good scores? Makes no sense.", funnelStage: "rejection", category: "rejection" },
    { text: "Loan disbursed same day. Highly recommended for emergencies.", funnelStage: "disbursement", category: "processing_time" },
    { text: "App keeps crashing during document upload. Very buggy.", funnelStage: "application", category: "app_bug" },
    { text: "No rejection reason given. I deserve to know why I'm being denied.", funnelStage: "rejection", category: "rejection" },
  ],
};

// Sentiment based on review content (simplified: high rejection = negative)
function inferSentiment(rating: number): string {
  if (rating <= 2) return "negative";
  if (rating === 3) return "neutral";
  return "positive";
}

function inferRatingFromCategory(category: string, funnelStage: string): number {
  if (funnelStage === "rejection" || category === "customer_service") return randChoice([1, 1, 2]);
  if (category === "processing_time" && funnelStage !== "disbursement") return randChoice([2, 3]);
  if (category === "interest_rate") return randChoice([2, 3, 3]);
  if (funnelStage === "disbursement") return randChoice([4, 5, 5]);
  return randChoice([3, 4, 5]);
}

// ─── Seed synthetic profiles and simulations ──────────────────────────────────

async function seedProfilesAndSimulations(count: number) {
  console.log(`\nSeeding ${count} rejection profiles + simulations...`);

  const scoreBuckets: CreditScoreBucket[] = ["excellent", "good", "fair", "poor", "no_score"];
  const scoreBucketWeights = [3, 12, 40, 28, 17]; // weighted toward fair/poor (rejection-skewed)

  const employmentTypes: EmploymentType[] = [
    "salaried_govt",
    "salaried_private",
    "self_employed",
    "freelancer",
  ];
  const employmentWeights = [15, 60, 18, 7];

  const BATCH_SIZE = 50;

  for (let batch = 0; batch < Math.ceil(count / BATCH_SIZE); batch++) {
    const batchSize = Math.min(BATCH_SIZE, count - batch * BATCH_SIZE);
    const profileBatch = [];
    const simBatch = [];

    for (let i = 0; i < batchSize; i++) {
      // Generate income (₹15,000 – ₹1,20,000, weighted toward 25k-60k)
      const incomeOptions = [15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000, 75000, 90000, 120000];
      const incomeWeights =  [3,     8,     12,    15,    12,    12,    10,    10,    8,     5,     3,      2    ];
      const monthlyIncome = weightedChoice(incomeOptions, incomeWeights);

      // Existing EMI: 0-55% of income
      const foirTarget = weightedChoice(
        [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
        [8, 5, 8,  10, 12, 12, 12, 10, 10, 8,  6,  5 ]
      );
      const existingEmi = Math.round((monthlyIncome * foirTarget) / 100 / 500) * 500;

      const creditScoreBucket = weightedChoice(scoreBuckets, scoreBucketWeights);
      const employmentType = weightedChoice(employmentTypes, employmentWeights);

      const diagnosis = diagnose({ monthlyIncome, existingEmi, creditScoreBucket, employmentType });

      profileBatch.push({
        monthlyIncome,
        existingEmi,
        foirCalculated: diagnosis.foirCalculated,
        creditScoreBucket,
        employmentType,
        primaryReason: diagnosis.primaryReason,
        allReasons: diagnosis.allReasons,
        createdAt: randDate(180),
      });
    }

    // Insert profiles
    const insertedProfiles = await db
      .insert(schema.rejectionProfiles)
      .values(profileBatch)
      .returning();

    // Generate simulations for each profile
    for (const profile of insertedProfiles) {
      // Random loan request: ₹50k – ₹5L
      const loanAmounts = [50000, 75000, 100000, 150000, 200000, 300000, 400000, 500000];
      const loanWeights =  [12,    15,    20,     18,     15,     10,     6,      4    ];
      const requestedAmount = weightedChoice(loanAmounts, loanWeights);
      const tenureOptions = [12, 18, 24, 36, 48, 60];
      const tenureMonths = randChoice(tenureOptions);

      const sim = simulate({
        monthlyIncome: profile.monthlyIncome,
        existingEmi: profile.existingEmi,
        requestedAmount,
        tenureMonths,
      });

      simBatch.push({
        profileId: profile.id,
        requestedAmount,
        tenureMonths,
        computedEmi: sim.computedEmi,
        postLoanFoir: sim.postLoanFoir,
        stressPassBool: sim.stressPassBool,
        safeEmiMax: sim.safeEmiMax,
        safeAmountMax: sim.safeAmountMax,
        riskBandBefore: sim.riskBandBefore,
        riskBandAfter: sim.riskBandAfter,
        shieldRecommendedBool: sim.shieldRecommendedBool,
        createdAt: randDate(90),
      });
    }

    if (simBatch.length > 0) {
      await db.insert(schema.loanSimulations).values(simBatch);
    }

    process.stdout.write(`  ✓ Batch ${batch + 1}/${Math.ceil(count / BATCH_SIZE)} (${(batch + 1) * batchSize} profiles)\r`);
  }

  console.log(`\n  ✅ ${count} profiles and simulations seeded.`);
}

// ─── Seed reviews ─────────────────────────────────────────────────────────────

async function seedReviews() {
  console.log("\nSeeding synthetic Play Store reviews...");

  const reviewBatch = [];

  for (const [appName, templates] of Object.entries(REVIEW_TEMPLATES)) {
    const targetCount = appName === "navi" ? 160 : 120; // ~400 total

    for (let i = 0; i < targetCount; i++) {
      // Cycle through templates + add some randomness
      const template = templates[i % templates.length];
      const rating = inferRatingFromCategory(template.category, template.funnelStage);

      // Add slight variation to review text
      const variations = [
        template.text,
        template.text + " Would not recommend.",
        template.text + " Please fix this.",
        template.text + " Overall " + (rating >= 4 ? "great" : "bad") + " experience.",
      ];

      reviewBatch.push({
        sourceApp: appName,
        rating,
        reviewText: randChoice(variations),
        funnelStageLabel: template.funnelStage,
        complaintCategory: template.category,
        sentiment: inferSentiment(rating),
        reviewDate: randDate(365),
        createdAt: randDate(365),
      });
    }
  }

  await db.insert(schema.reviews).values(reviewBatch);
  console.log(`  ✅ ${reviewBatch.length} reviews seeded (Navi + MoneyView + Fibe).`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Navi Borrow-Safe seed script starting...");
  console.log("   DB:", process.env.DATABASE_URL?.substring(0, 40) + "...");

  try {
    await seedProfilesAndSimulations(2000);
    await seedReviews();
    console.log("\n✅ Seed complete. Run `npm run dev` and visit /dashboard to see the analytics.");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
