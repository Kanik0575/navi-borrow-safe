/**
 * Diagnosis Engine — Navi Borrow-Safe
 *
 * A transparent, rule-based engine (NOT a black-box ML model).
 * Every threshold and decision rule is explicit here and shown on-screen.
 * This "self-aware limitation" is itself a product-integrity signal.
 *
 * Primary rejection reason priority:
 *   1. foir_high        (most common, most actionable)
 *   2. score_low        (requires sustained behaviour change)
 *   3. thin_file        (new-to-credit — build from scratch)
 *   4. utilization_high (subset of score_low but faster to fix)
 *   5. employment_risk  (income verification + score gap)
 */

import type { CreditScoreBucket, EmploymentType, RejectionReason } from "@/lib/db/schema";

// ─── Thresholds (all values are explicit and visible to users) ─────────────────

/** FOIR above this = rejection. Navi's effective operational threshold. */
const FOIR_REJECTION_THRESHOLD = 45;

/** FOIR target for "safe" borrowing — what we recommend users stay under. */
export const SAFE_FOIR_THRESHOLD = 40;

/** Minimum credit score bucket for loan approval. */
const MIN_APPROVABLE_BUCKET: CreditScoreBucket = "good"; // 650+

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileInput {
  monthlyIncome: number;          // ₹/month take-home
  existingEmi: number;            // total current monthly EMI obligations
  creditScoreBucket: CreditScoreBucket;
  employmentType: EmploymentType;
}

export interface DiagnosisResult {
  foirCalculated: number;
  primaryReason: RejectionReason;
  allReasons: RejectionReason[];
  /** Human-readable explanation per reason — used directly as UI copy */
  readableExplanations: Partial<Record<RejectionReason, string>>;
  thresholds: {
    foirThreshold: number;
    yourFoir: number;
    scoreRequired: string;
    yourScore: string;
  };
  /** true only when the profile passes ALL rejection checks — used to unlock simulator */
  isEligible: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SCORE_LABELS: Record<CreditScoreBucket, string> = {
  excellent: "750+ — Excellent",
  good:      "650-749 — Good",
  fair:      "550-649 — Fair",
  poor:      "300-549 — Poor",
  no_score:  "No credit history (unscored)",
};

const APPROVABLE_BUCKETS = new Set<CreditScoreBucket>(["excellent", "good"]);

/** Round to 1 decimal place */
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ─── Main diagnosis function ──────────────────────────────────────────────────

export function diagnose(input: ProfileInput): DiagnosisResult {
  const { monthlyIncome, existingEmi, creditScoreBucket, employmentType } = input;

  // FOIR = total existing monthly obligations ÷ gross income × 100
  const foirCalculated =
    monthlyIncome > 0 ? round1((existingEmi / monthlyIncome) * 100) : 0;

  const reasons: RejectionReason[] = [];

  // ── Rule 1: FOIR too high ───────────────────────────────────────────────────
  // Use >= so that FOIR exactly at the threshold (e.g. 45%) correctly triggers
  if (foirCalculated >= FOIR_REJECTION_THRESHOLD) {
    reasons.push("foir_high");
  }

  // ── Rule 2: Credit score too low ────────────────────────────────────────────
  // Only flag for poor (300-549) — good (650-749) and excellent (750+) are fine
  if (creditScoreBucket === "poor") {
    reasons.push("score_low");
  }

  // ── Rule 3: No credit history ───────────────────────────────────────────────
  if (creditScoreBucket === "no_score") {
    reasons.push("thin_file");
  }

  // ── Rule 4: High utilization signal ─────────────────────────────────────────
  // Fair score + moderate-high FOIR = likely high card utilization
  if (creditScoreBucket === "fair" && foirCalculated > 30) {
    reasons.push("utilization_high");
  }

  // ── Rule 5: Employment type adds risk when score is not excellent ────────────
  if (
    (employmentType === "self_employed" || employmentType === "freelancer") &&
    creditScoreBucket !== "excellent"
  ) {
    reasons.push("employment_risk");
  }

  // Eligibility: user passes all our observable rules
  const wouldBeEligible =
    foirCalculated < FOIR_REJECTION_THRESHOLD &&
    APPROVABLE_BUCKETS.has(creditScoreBucket) &&
    !reasons.includes("employment_risk");

  // Fallback: only add a reason when the user is NOT clearly eligible
  if (reasons.length === 0 && !wouldBeEligible) {
    // Not eligible but no specific rule fired — likely a borderline/fair score case
    if (creditScoreBucket === "fair") {
      reasons.push("score_low");
    } else {
      reasons.push("foir_high");
    }
  }

  // Safe fallback for primaryReason (eligible users may have empty reasons array)
  const primaryReason: RejectionReason = reasons[0] ?? "foir_high";

  // Build readable explanations only for the flagged reasons
  const readableExplanations: Partial<Record<RejectionReason, string>> = {};

  if (reasons.includes("foir_high")) {
    readableExplanations.foir_high = `Your existing monthly payments (₹${existingEmi.toLocaleString("en-IN")}) are ${foirCalculated}% of your income. Navi requires this to be below ${FOIR_REJECTION_THRESHOLD}% to approve a new loan.`;
  }
  if (reasons.includes("score_low")) {
    readableExplanations.score_low = `Your credit score (${SCORE_LABELS[creditScoreBucket]}) is below the minimum needed. Lenders typically require 650+ for unsecured personal loans.`;
  }
  if (reasons.includes("thin_file")) {
    readableExplanations.thin_file = `You have no credit history yet. Lenders have no repayment record to evaluate — not bad, just unknown. This is fixable in 6 months.`;
  }
  if (reasons.includes("utilization_high")) {
    readableExplanations.utilization_high = `Your credit card balances are likely high relative to your limits (utilization >30%). This signals financial stress and reduces your score.`;
  }
  if (reasons.includes("employment_risk")) {
    readableExplanations.employment_risk = `${employmentType === "self_employed" ? "Self-employed" : "Freelance"} income is harder for lenders to verify. Combined with your current score, this adds perceived risk.`;
  }

  // Re-use the eligibility we already computed (strict <, not <=)
  const isEligible = wouldBeEligible;

  return {
    foirCalculated,
    primaryReason,
    allReasons: reasons,
    readableExplanations,
    thresholds: {
      foirThreshold: FOIR_REJECTION_THRESHOLD,
      yourFoir: foirCalculated,
      scoreRequired: "650+ (Good or Excellent)",
      yourScore: SCORE_LABELS[creditScoreBucket],
    },
    isEligible,
  };
}
