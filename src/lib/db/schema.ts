/**
 * Navi Borrow-Safe — Database Schema
 * ORM: Drizzle (drizzle-orm)
 * DB: Neon Postgres (serverless)
 *
 * 5 tables that map directly to the product lifecycle:
 *   users → rejection_profiles → action_plans
 *                              ↘ loan_simulations
 *   reviews (standalone — scraped Play Store data for SQL analysis)
 */

import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── rejection_profiles ───────────────────────────────────────────────────────
// One row per rejection diagnosis session. userId is nullable (anonymous flow).
export const rejectionProfiles = pgTable("rejection_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),

  // Raw inputs from the 4-field form
  monthlyIncome: integer("monthly_income").notNull(), // ₹/month, take-home
  existingEmi: integer("existing_emi").notNull(),     // total monthly EMI obligations

  // Computed by the diagnosis engine
  foirCalculated: real("foir_calculated").notNull(),  // existingEmi / monthlyIncome × 100

  // Categorical inputs
  creditScoreBucket: text("credit_score_bucket").notNull(), // excellent|good|fair|poor|no_score
  employmentType: text("employment_type").notNull(),         // salaried_govt|salaried_private|self_employed|freelancer

  // Diagnosis output
  primaryReason: text("primary_reason").notNull(),    // foir_high|score_low|thin_file|utilization_high|employment_risk
  allReasons: jsonb("all_reasons")
    .$type<string[]>()
    .notNull()
    .default([]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── action_plans ─────────────────────────────────────────────────────────────
// Generated 90-day plan keyed to a rejection profile.
export const actionPlans = pgTable("action_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .references(() => rejectionProfiles.id)
    .notNull(),

  targetDate: timestamp("target_date").notNull(), // 90 days from createdAt
  stepsJson: jsonb("steps_json")
    .$type<ActionStep[]>()
    .notNull()
    .default([]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── loan_simulations ─────────────────────────────────────────────────────────
// One row per simulator run. Captures both the request and the computed risk output.
export const loanSimulations = pgTable("loan_simulations", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .references(() => rejectionProfiles.id)
    .notNull(),

  // User inputs
  requestedAmount: integer("requested_amount").notNull(), // ₹
  tenureMonths: integer("tenure_months").notNull(),

  // Computed outputs
  computedEmi: integer("computed_emi").notNull(),         // ₹/month
  postLoanFoir: real("post_loan_foir").notNull(),         // % after new loan

  // Stress test result (true = passes both scenarios)
  stressPassBool: boolean("stress_pass_bool").notNull(),

  // Safe band (max values where FOIR ≤ 40%)
  safeEmiMax: integer("safe_emi_max").notNull(),          // ₹/month
  safeAmountMax: integer("safe_amount_max").notNull(),    // ₹ principal

  // Risk bands (low|medium|high)
  riskBandBefore: text("risk_band_before").notNull(),     // FOIR before new loan
  riskBandAfter: text("risk_band_after").notNull(),       // FOIR after new loan

  // EMI Shield cross-sell flag — true only when riskBandAfter = medium|high
  shieldRecommendedBool: boolean("shield_recommended_bool").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── reviews ──────────────────────────────────────────────────────────────────
// Play Store reviews for Navi + competitors, used exclusively for SQL analysis.
// Populated by scripts/scrape-reviews.ts (or manual import).
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceApp: text("source_app").notNull(),          // navi|moneyview|fibe

  rating: integer("rating").notNull(),              // 1-5
  reviewText: text("review_text").notNull(),

  // Labels assigned during analysis (manually or semi-automatically)
  funnelStageLabel: text("funnel_stage_label"),     // application|rejection|disbursement|repayment|support
  complaintCategory: text("complaint_category"),    // rejection|processing_time|interest_rate|kyc|app_bug|customer_service
  sentiment: text("sentiment"),                     // positive|negative|neutral

  reviewDate: timestamp("review_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Shared TypeScript types ──────────────────────────────────────────────────

/** A single step in a 90-day action plan (stored as JSONB in action_plans.steps_json) */
export type ActionStep = {
  week: number;
  title: string;
  description: string;
  impact: string;
  category: "credit_score" | "foir" | "employment" | "documentation";
};

export type RejectionReason =
  | "foir_high"
  | "score_low"
  | "thin_file"
  | "utilization_high"
  | "employment_risk";

export type CreditScoreBucket =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "no_score";

export type EmploymentType =
  | "salaried_govt"
  | "salaried_private"
  | "self_employed"
  | "freelancer";

export type RiskBand = "low" | "medium" | "high";
