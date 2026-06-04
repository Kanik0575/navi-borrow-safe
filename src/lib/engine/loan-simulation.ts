/**
 * Loan Simulation Engine — Navi Borrow-Safe
 *
 * Computes EMI, post-loan FOIR, two stress tests, and a safe-borrowing band.
 * ALL formulas and thresholds are shown on-screen — this transparency is the
 * product's Integrity signal and differentiates it from a black-box calculator.
 *
 * Standard EMI formula: P × r × (1+r)^n / ((1+r)^n − 1)
 *   P = principal, r = monthly interest rate, n = tenure in months
 *
 * Safe band: maximum EMI/loan amount where post-loan FOIR ≤ SAFE_FOIR_THRESHOLD
 *
 * Stress tests:
 *   1. 30% income drop for 3 months — simulates job loss or business downturn
 *   2. 1 month no income — simulates sudden unemployment gap
 */

import type { RiskBand } from "@/lib/db/schema";

// ─── Constants (visible to users on-screen) ───────────────────────────────────

export const DEFAULT_ANNUAL_RATE = 14;         // 14% p.a. — Navi's typical personal loan rate
export const SAFE_FOIR_THRESHOLD = 40;         // % — above this = risk
export const MEDIUM_FOIR_THRESHOLD = 50;       // % — above this = high risk
export const INCOME_DROP_PCT = 30;             // % income reduction in stress test 1
export const ASSUMED_SAVINGS_MONTHS = 2;       // months of income assumed as liquid savings

// ─── Input / Output Types ─────────────────────────────────────────────────────

export interface SimulationInput {
  monthlyIncome: number;
  existingEmi: number;
  requestedAmount: number;       // ₹
  tenureMonths: number;
  annualInterestRate?: number;   // defaults to DEFAULT_ANNUAL_RATE
}

export interface StressTestResult {
  scenario: string;
  newFoirOrNote: string;
  passed: boolean;
  detail: string;
}

export interface SimulationResult {
  // Inputs echoed back (for display)
  requestedAmount: number;
  tenureMonths: number;
  annualRate: number;

  // Primary outputs
  computedEmi: number;           // ₹/month
  postLoanFoir: number;          // %

  // Stress tests
  stressTests: StressTestResult[];
  stressPassBool: boolean;       // true = both tests pass

  // Safe borrowing band
  safeEmiMax: number;            // ₹/month — max EMI for FOIR ≤ 40%
  safeAmountMax: number;         // ₹ principal — reverse-calculated from safeEmiMax

  // Risk classification
  riskBandBefore: RiskBand;      // existing FOIR only
  riskBandAfter: RiskBand;       // post-loan FOIR

  // Cross-sell flag — true only when band is medium or high (genuinely helps)
  shieldRecommendedBool: boolean;

  // Formula breakdown for on-screen transparency
  formulaBreakdown: {
    principal: number;
    annualRate: number;
    monthlyRate: number;          // annualRate / 12
    tenureMonths: number;
    emi: number;
    foirBefore: number;
    foirAfter: number;
  };
}

// ─── Core calculations ────────────────────────────────────────────────────────

/** Standard EMI formula */
function calcEmi(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.round(principal / months);
  return Math.round(
    (principal * r * Math.pow(1 + r, months)) /
      (Math.pow(1 + r, months) - 1)
  );
}

/** Reverse EMI formula — maximum principal for a given max EMI */
function maxPrincipalForEmi(
  maxEmi: number,
  annualRate: number,
  months: number
): number {
  if (maxEmi <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return maxEmi * months;
  const factor =
    (Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months));
  return Math.round((maxEmi * factor) / 1000) * 1000; // round to nearest ₹1,000
}

function getFoirBand(foir: number): RiskBand {
  if (foir <= SAFE_FOIR_THRESHOLD) return "low";
  if (foir <= MEDIUM_FOIR_THRESHOLD) return "medium";
  return "high";
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ─── Main simulation function ─────────────────────────────────────────────────

export function simulate(input: SimulationInput): SimulationResult {
  const {
    monthlyIncome,
    existingEmi,
    requestedAmount,
    tenureMonths,
    annualInterestRate = DEFAULT_ANNUAL_RATE,
  } = input;

  // ── Core EMI and FOIR ─────────────────────────────────────────────────────
  const computedEmi = calcEmi(requestedAmount, annualInterestRate, tenureMonths);
  const foirBefore = round1((existingEmi / monthlyIncome) * 100);
  const postLoanFoir = round1(((existingEmi + computedEmi) / monthlyIncome) * 100);
  const riskBandBefore = getFoirBand(foirBefore);
  const riskBandAfter = getFoirBand(postLoanFoir);

  // ── Stress Test 1: 30% income drop ────────────────────────────────────────
  const reducedIncome = monthlyIncome * (1 - INCOME_DROP_PCT / 100);
  const foirWithDrop = round1(((existingEmi + computedEmi) / reducedIncome) * 100);
  // Pass if FOIR under a stretched (but survivable) 65% even with income drop
  const stress1Pass = foirWithDrop <= 65;

  // ── Stress Test 2: 1 month no income ─────────────────────────────────────
  // Assumption: user has ~2 months of income as liquid savings
  const estimatedSavings = monthlyIncome * ASSUMED_SAVINGS_MONTHS;
  const monthlyTotal = existingEmi + computedEmi;
  const stress2Pass = estimatedSavings >= monthlyTotal;

  const stressTests: StressTestResult[] = [
    {
      scenario: `30% income drop (₹${Math.round(reducedIncome).toLocaleString("en-IN")}/mo)`,
      newFoirOrNote: `FOIR becomes ${foirWithDrop}%`,
      passed: stress1Pass,
      detail: stress1Pass
        ? "Even with a 30% income cut, your total EMI obligations stay below 65% of reduced income — manageable, though tight."
        : `A 30% income cut pushes your obligations to ${foirWithDrop}% of reduced income. Reducing the loan amount brings this under control.`,
    },
    {
      scenario: "1 month with no income",
      newFoirOrNote: `Savings needed: ₹${monthlyTotal.toLocaleString("en-IN")}`,
      passed: stress2Pass,
      detail: stress2Pass
        ? `Assuming ~${ASSUMED_SAVINGS_MONTHS} months' savings (₹${estimatedSavings.toLocaleString("en-IN")}), you can cover one missed month without missing EMIs.`
        : `Your combined EMI (₹${monthlyTotal.toLocaleString("en-IN")}) exceeds the assumed ${ASSUMED_SAVINGS_MONTHS}-month savings buffer. Consider a smaller loan or higher tenure.`,
    },
  ];

  const stressPassBool = stress1Pass && stress2Pass;

  // ── Safe borrowing band ───────────────────────────────────────────────────
  // Maximum new EMI such that post-loan FOIR ≤ SAFE_FOIR_THRESHOLD
  const safeEmiMax = Math.max(
    0,
    Math.floor((monthlyIncome * SAFE_FOIR_THRESHOLD) / 100) - existingEmi
  );
  const safeAmountMax = maxPrincipalForEmi(
    safeEmiMax,
    annualInterestRate,
    tenureMonths
  );

  // ── EMI Shield recommendation ─────────────────────────────────────────────
  // Show cross-sell ONLY when the user genuinely benefits (medium or high risk band)
  // This is the anti-mis-selling design principle
  const shieldRecommendedBool =
    riskBandAfter === "medium" || riskBandAfter === "high";

  return {
    requestedAmount,
    tenureMonths,
    annualRate: annualInterestRate,
    computedEmi,
    postLoanFoir,
    stressTests,
    stressPassBool,
    safeEmiMax,
    safeAmountMax,
    riskBandBefore,
    riskBandAfter,
    shieldRecommendedBool,
    formulaBreakdown: {
      principal: requestedAmount,
      annualRate: annualInterestRate,
      monthlyRate: round1(annualInterestRate / 12),
      tenureMonths,
      emi: computedEmi,
      foirBefore,
      foirAfter: postLoanFoir,
    },
  };
}
