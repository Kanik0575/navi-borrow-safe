/**
 * Screen 4 — 90-Day Action Plan (Server Component)
 *
 * Auto-generates and persists the plan when first visited.
 * Idempotent — revisiting the page returns the same plan.
 *
 * Design rationale: Every step is SPECIFIC and MEASURABLE.
 * "Pay Card X from ₹45k→₹15k" not "improve your credit."
 * Research insight: vague advice is what users already ignore — specificity is the product.
 */

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, rejectionProfiles, actionPlans } from "@/lib/db";
import { generateActionPlan } from "@/lib/engine/action-plan";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ProgressSteps } from "@/components/ProgressSteps";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Briefcase,
  FileText,
  TrendingUp,
} from "lucide-react";
import type { ActionStep, CreditScoreBucket, EmploymentType, RejectionReason } from "@/lib/db/schema";

const CATEGORY_CONFIG = {
  credit_score: { icon: <CreditCard className="w-4 h-4" />, color: "text-indigo-600", bg: "bg-indigo-50" },
  foir:         { icon: <TrendingUp className="w-4 h-4" />,  color: "text-amber-600",  bg: "bg-amber-50"  },
  employment:   { icon: <Briefcase className="w-4 h-4" />,   color: "text-violet-600", bg: "bg-violet-50" },
  documentation:{ icon: <FileText className="w-4 h-4" />,    color: "text-slate-600",  bg: "bg-slate-50"  },
} as const;

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ profileId?: string }>;
}) {
  const { profileId } = await searchParams;

  if (!profileId) notFound();

  // Fetch the profile
  const [profile] = await db
    .select()
    .from(rejectionProfiles)
    .where(eq(rejectionProfiles.id, profileId));

  if (!profile) notFound();

  // Check if plan already exists (idempotency)
  const [existingPlan] = await db
    .select()
    .from(actionPlans)
    .where(eq(actionPlans.profileId, profileId));

  let steps: ActionStep[];
  let targetDate: Date;
  let summary: string;

  if (existingPlan) {
    steps = existingPlan.stepsJson as ActionStep[];
    targetDate = existingPlan.targetDate;
    // Re-generate summary string (not stored — cheap to compute)
    const planResult = generateActionPlan({
      primaryReason: profile.primaryReason as RejectionReason,
      allReasons: profile.allReasons as RejectionReason[],
      monthlyIncome: profile.monthlyIncome,
      existingEmi: profile.existingEmi,
      creditScoreBucket: profile.creditScoreBucket as CreditScoreBucket,
      employmentType: profile.employmentType as EmploymentType,
    });
    summary = planResult.summary;
  } else {
    // Generate and persist
    const planResult = generateActionPlan({
      primaryReason: profile.primaryReason as RejectionReason,
      allReasons: profile.allReasons as RejectionReason[],
      monthlyIncome: profile.monthlyIncome,
      existingEmi: profile.existingEmi,
      creditScoreBucket: profile.creditScoreBucket as CreditScoreBucket,
      employmentType: profile.employmentType as EmploymentType,
    });

    await db.insert(actionPlans).values({
      profileId,
      targetDate: planResult.targetDate,
      stepsJson: planResult.steps,
    });

    steps = planResult.steps;
    targetDate = planResult.targetDate;
    summary = planResult.summary;
  }

  const formattedDate = new Date(targetDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <ProgressSteps current={3} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your 90-day plan</h1>
        <p className="text-slate-500 text-sm mt-1">
          Follow this plan and you should be approvable by{" "}
          <strong className="text-indigo-700">{formattedDate}</strong>.
        </p>
      </div>

      {/* Summary callout */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-sm text-indigo-800 leading-relaxed">{summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Step-by-step actions
        </h2>

        {steps.map((step, idx) => {
          const cfg = CATEGORY_CONFIG[step.category];
          return (
            <Card key={idx} className="bg-white border-slate-100">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {/* Week badge */}
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        cfg.bg,
                        cfg.color
                      )}
                    >
                      {cfg.icon}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">W{step.week}</span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Impact callout */}
                    <div className="flex items-start gap-1.5 bg-slate-50 rounded-lg p-2.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0 mt-0.5">
                        Impact:
                      </span>
                      <p className="text-xs text-slate-600">{step.impact}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Timeline note */}
      <Card className="bg-slate-50 border-slate-100">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <p className="text-sm text-slate-600">
              <strong>Target date: {formattedDate}</strong> — 90 days from today.
            </p>
          </div>
          <div className="space-y-1.5 pl-6 text-xs text-slate-500 leading-relaxed">
            <p>
              <strong className="text-slate-600">Why 90 days?</strong> Payment history updates reach
              CIBIL within 45–60 days of each billing cycle; credit utilization changes reflect within
              30 days. A consistent 90-day window allows both to compound — and is the shortest
              period in which a re-application is likely to see a materially different outcome.
            </p>
            <p className="text-slate-400 text-[11px]">
              Based on CIBIL&apos;s published report-update guidelines and RBI&apos;s credit-bureau
              data-submission frequency mandates (Monthly Reporting format).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="space-y-3 pt-2">
        <Link
          href={`/simulator?profileId=${profileId}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-base rounded-xl gap-2 justify-center"
          )}
        >
          I&apos;m ready — show me how much to borrow safely
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="text-center text-xs text-slate-400">
          The simulator works even if you haven&apos;t completed the plan yet — it shows you the
          safe amount for your <em>current</em> financial situation.
        </p>
      </div>
    </div>
  );
}
