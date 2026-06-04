import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // SQL 1: Funnel stage complaints
    const funnelStageComplaints = await db.execute<{
      funnel_stage_label: string;
      complaints: number;
      pct: number;
    }>(sql`
      SELECT
        COALESCE(funnel_stage_label, 'unlabelled') AS funnel_stage_label,
        COUNT(*)::int AS complaints,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1)::float AS pct
      FROM reviews
      WHERE sentiment = 'negative'
      GROUP BY funnel_stage_label
      ORDER BY complaints DESC
    `);

    // SQL 2: Navi vs competitors — rejection complaint share
    const naviVsCompetitors = await db.execute<{
      source_app: string;
      total_reviews: number;
      rejection_complaints: number;
      pct_rejection_complaints: number;
    }>(sql`
      SELECT
        source_app,
        COUNT(*)::int AS total_reviews,
        SUM(CASE WHEN complaint_category = 'rejection' THEN 1 ELSE 0 END)::int AS rejection_complaints,
        ROUND(100.0 * SUM(CASE WHEN complaint_category = 'rejection' THEN 1 ELSE 0 END) / COUNT(*), 1)::float AS pct_rejection_complaints
      FROM reviews
      GROUP BY source_app
      ORDER BY pct_rejection_complaints DESC
    `);

    // SQL 3: Rejection reason distribution
    const rejectionReasons = await db.execute<{
      primary_reason: string;
      users: number;
      avg_foir: number;
      avg_income: number;
    }>(sql`
      SELECT
        primary_reason,
        COUNT(*)::int AS users,
        ROUND(AVG(foir_calculated)::numeric, 2)::float AS avg_foir,
        ROUND(AVG(monthly_income))::int AS avg_income
      FROM rejection_profiles
      GROUP BY primary_reason
      ORDER BY users DESC
    `);

    // SQL 4: Over-borrowing by credit score bucket
    const overBorrowingByScore = await db.execute<{
      credit_score_bucket: string;
      approvals: number;
      over_borrowing: number;
      pct_over: number;
    }>(sql`
      SELECT
        rp.credit_score_bucket,
        COUNT(*)::int AS approvals,
        SUM(CASE WHEN ls.computed_emi > ls.safe_emi_max THEN 1 ELSE 0 END)::int AS over_borrowing,
        ROUND(100.0 * SUM(CASE WHEN ls.computed_emi > ls.safe_emi_max THEN 1 ELSE 0 END) / COUNT(*), 1)::float AS pct_over
      FROM loan_simulations ls
      JOIN rejection_profiles rp ON rp.id = ls.profile_id
      GROUP BY rp.credit_score_bucket
      ORDER BY pct_over DESC
    `);

    // SQL 5: Risk band transitions
    const riskBandTransitions = await db.execute<{
      risk_band_before: string;
      risk_band_after: string;
      users: number;
    }>(sql`
      SELECT
        risk_band_before,
        risk_band_after,
        COUNT(*)::int AS users
      FROM loan_simulations
      GROUP BY risk_band_before, risk_band_after
      ORDER BY users DESC
    `);

    // SQL 6: EMI Shield impact
    const shieldImpact = await db.execute<{
      high_risk_users: number;
      shield_helps: number;
      pct_shield_helps: number;
    }>(sql`
      SELECT
        COUNT(*)::int AS high_risk_users,
        SUM(CASE WHEN shield_recommended_bool THEN 1 ELSE 0 END)::int AS shield_helps,
        ROUND(100.0 * SUM(CASE WHEN shield_recommended_bool THEN 1 ELSE 0 END) / COUNT(*), 1)::float AS pct_shield_helps
      FROM loan_simulations
      WHERE risk_band_after = 'high'
    `);

    // Q7: Sentiment distribution per app
    const sentimentByApp = await db.execute<{
      source_app: string;
      sentiment: string;
      count: number;
    }>(sql`
      SELECT source_app, COALESCE(sentiment, 'unlabelled') AS sentiment, COUNT(*)::int AS count
      FROM reviews
      GROUP BY source_app, sentiment
      ORDER BY source_app, count DESC
    `);

    // Q8: Summary stats
    const summaryStats = await db.execute<{
      total_profiles: number;
      total_simulations: number;
      total_reviews: number;
      avg_foir: number;
      pct_stress_pass: number;
    }>(sql`
      SELECT
        (SELECT COUNT(*)::int FROM rejection_profiles) AS total_profiles,
        (SELECT COUNT(*)::int FROM loan_simulations) AS total_simulations,
        (SELECT COUNT(*)::int FROM reviews) AS total_reviews,
        (SELECT ROUND(AVG(foir_calculated)::numeric, 1)::float FROM rejection_profiles) AS avg_foir,
        (SELECT ROUND(100.0 * SUM(CASE WHEN stress_pass_bool THEN 1 ELSE 0 END) / COUNT(*), 1)::float FROM loan_simulations) AS pct_stress_pass
    `);

    // Q9: Employment type breakdown — average FOIR and % rejected for FOIR
    const employmentBreakdown = await db.execute<{
      employment_type: string;
      count: number;
      avg_foir: number;
      pct_foir_high: number;
    }>(sql`
      SELECT
        employment_type,
        COUNT(*)::int AS count,
        ROUND(AVG(foir_calculated)::numeric, 1)::float AS avg_foir,
        ROUND(100.0 * SUM(CASE WHEN primary_reason = 'foir_high' THEN 1 ELSE 0 END) / COUNT(*), 1)::float AS pct_foir_high
      FROM rejection_profiles
      GROUP BY employment_type
      ORDER BY count DESC
    `);

    // Q10: FOIR distribution histogram
    const foirHistogram = await db.execute<{
      bucket: string;
      count: number;
      sort_key: number;
    }>(sql`
      SELECT
        CASE
          WHEN foir_calculated < 20 THEN '< 20%'
          WHEN foir_calculated < 30 THEN '20–30%'
          WHEN foir_calculated < 40 THEN '30–40%'
          WHEN foir_calculated < 50 THEN '40–50%'
          WHEN foir_calculated < 60 THEN '50–60%'
          ELSE '60%+'
        END AS bucket,
        COUNT(*)::int AS count,
        MIN(foir_calculated)::int AS sort_key
      FROM rejection_profiles
      GROUP BY 1
      ORDER BY sort_key
    `);

    // Q11: Loan amount distribution with over-borrowing rate
    const loanAmountDist = await db.execute<{
      bucket: string;
      count: number;
      pct_over_band: number;
    }>(sql`
      SELECT
        CASE
          WHEN requested_amount < 50000 THEN '< ₹50k'
          WHEN requested_amount < 100000 THEN '₹50k–1L'
          WHEN requested_amount < 200000 THEN '₹1L–2L'
          WHEN requested_amount < 500000 THEN '₹2L–5L'
          ELSE '₹5L+'
        END AS bucket,
        COUNT(*)::int AS count,
        ROUND(100.0 * SUM(CASE WHEN computed_emi > safe_emi_max THEN 1 ELSE 0 END) / COUNT(*), 1)::float AS pct_over_band
      FROM loan_simulations
      GROUP BY 1
      ORDER BY MIN(requested_amount)
    `);

    // Q12: Score bucket distribution with eligibility rate
    const scoreBucketDist = await db.execute<{
      credit_score_bucket: string;
      count: number;
      avg_foir: number;
      pct_score_blocked: number;
    }>(sql`
      SELECT
        credit_score_bucket,
        COUNT(*)::int AS count,
        ROUND(AVG(foir_calculated)::numeric, 1)::float AS avg_foir,
        ROUND(100.0 * SUM(CASE WHEN primary_reason IN ('score_low', 'thin_file') THEN 1 ELSE 0 END) / COUNT(*), 1)::float AS pct_score_blocked
      FROM rejection_profiles
      GROUP BY credit_score_bucket
      ORDER BY count DESC
    `);

    return NextResponse.json({
      funnelStageComplaints: funnelStageComplaints.rows,
      naviVsCompetitors: naviVsCompetitors.rows,
      rejectionReasons: rejectionReasons.rows,
      overBorrowingByScore: overBorrowingByScore.rows,
      riskBandTransitions: riskBandTransitions.rows,
      shieldImpact: shieldImpact.rows[0] ?? null,
      sentimentByApp: sentimentByApp.rows,
      summaryStats: summaryStats.rows[0] ?? null,
      employmentBreakdown: employmentBreakdown.rows,
      foirHistogram: foirHistogram.rows,
      loanAmountDist: loanAmountDist.rows,
      scoreBucketDist: scoreBucketDist.rows,
    });
  } catch (error) {
    console.error("[analytics GET]", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
