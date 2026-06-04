/**
 * Screen 3 — Diagnosis (Server Component)
 *
 * Fetches the stored profile, re-runs the diagnosis engine, and displays
 * colour-coded rejection reasons with plain-language explanations.
 *
 * Design rationale: Transparency over jargon.
 * "Your monthly-payment-to-income ratio is 52%" NOT "Your FOIR is 52%."
 * (5/8 interviewees said they did not know what FOIR meant.)
 * Thresholds are shown on-screen so users can verify the logic themselves.
 */

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, rejectionProfiles } from "@/lib/db";
import { diagnose } from "@/lib/engine/diagnosis";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ProgressSteps } from "@/components/ProgressSteps";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  TrendingDown,
  CreditCard,
  FileQuestion,
  Briefcase,
} from "lucide-react";
import type { RejectionReason, CreditScoreBucket, EmploymentType } from "@/lib/db/schema";

// Map rejection reasons to display config
const REASON_CONFIG: Record<
  RejectionReason,
  {
    icon: React.ReactNode;
    label: string;
    severity: "high" | "medium";
    color: string;
    bg: string;
  }
> = {
  foir_high: {
    icon: <TrendingDown className="w-4 h-4" />,
    label: "Payment-to-income ratio too high",
    severity: "high",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  score_low: {
    icon: <CreditCard className="w-4 h-4" />,
    label: "Credit score below minimum",
    severity: "high",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  thin_file: {
    icon: <FileQuestion className="w-4 h-4" />,
    label: "No credit history (thin file)",
    severity: "medium",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  utilization_high: {
    icon: <CreditCard className="w-4 h-4" />,
    label: "High credit card utilization",
    severity: "medium",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  employment_risk: {
    icon: <Briefcase className="w-4 h-4" />,
    label: "Income verification risk",
    severity: "medium",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
};

export default async function DiagnosisPage({
  searchParams,
}: {
  searchParams: Promise<{ profileId?: string }>;
}) {
  const { profileId } = await searchParams;

  if (!profileId) notFound();

  const [profile] = await db
    .select()
    .from(rejectionProfiles)
    .where(eq(rejectionProfiles.id, profileId));

  if (!profile) notFound();

  const diagnosis = diagnose({
    monthlyIncome: profile.monthlyIncome,
    existingEmi: profile.existingEmi,
    creditScoreBucket: profile.creditScoreBucket as CreditScoreBucket,
    employmentType: profile.employmentType as EmploymentType,
  });

  // FOIR bar calculation
  const foirBarWidth = Math.min(100, diagnosis.foirCalculated);
  const foirSafe = diagnosis.foirCalculated <= 40;
  const foirBorderline = diagnosis.foirCalculated > 40 && diagnosis.foirCalculated <= 45;

  return (
    <div className="space-y-6">
      <ProgressSteps current={2} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Here&apos;s what we found
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {diagnosis.allReasons.length === 1
            ? "1 primary reason for the rejection."
            : `${diagnosis.allReasons.length} factors contributed to the rejection — starting with the most impactful.`}
        </p>
      </div>

      {/* FOIR meter */}
      <Card className="bg-white">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Monthly-payment-to-income ratio
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {diagnosis.foirCalculated}%
                <span className="text-sm font-normal text-slate-400 ml-2">
                  (threshold: {diagnosis.thresholds.foirThreshold}%)
                </span>
              </p>
            </div>
            {foirSafe ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-500" />
            )}
          </div>

          {/* Visual bar */}
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all",
                foirSafe
                  ? "bg-emerald-500"
                  : foirBorderline
                  ? "bg-amber-500"
                  : "bg-red-500"
              )}
              style={{ width: `${foirBarWidth}%` }}
            />
            {/* 40% safe threshold marker */}
            <div
              className="absolute inset-y-0 w-px bg-slate-300"
              style={{ left: "40%" }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span className="text-emerald-600 font-medium">Safe: ≤40%</span>
            <span>100%</span>
          </div>

          <p className="text-xs text-slate-500">
            ₹{profile.existingEmi.toLocaleString("en-IN")}/mo in current payments ÷ ₹
            {profile.monthlyIncome.toLocaleString("en-IN")}/mo income ={" "}
            <strong>{diagnosis.foirCalculated}%</strong>. Lenders want this below{" "}
            {diagnosis.thresholds.foirThreshold}% before adding a new loan.
          </p>
        </CardContent>
      </Card>

      {/* Rejection reasons */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Rejection reasons
        </h2>

        {(diagnosis.allReasons as RejectionReason[]).map((reason, idx) => {
          const cfg = REASON_CONFIG[reason];
          const explanation = diagnosis.readableExplanations[reason];
          return (
            <Card key={reason} className={cn("border", cfg.bg)}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <span className={cn("mt-0.5", cfg.color)}>{cfg.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn("text-sm font-semibold", cfg.color)}>
                        {cfg.label}
                      </p>
                      {idx === 0 && (
                        <span className="text-xs bg-slate-800 text-white px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Credit score */}
      <Card className="bg-white border-slate-100">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Credit score on file
            </p>
          </div>
          <p className="text-slate-700 text-sm">
            <strong>{diagnosis.thresholds.yourScore}</strong> · Minimum required:{" "}
            {diagnosis.thresholds.scoreRequired}
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="space-y-3 pt-2">
        <Link
          href={`/plan?profileId=${profileId}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-base rounded-xl gap-2 justify-center"
          )}
        >
          Get my 90-day recovery plan
          <ArrowRight className="w-4 h-4" />
        </Link>

        {diagnosis.isEligible && (
          <Link
            href={`/simulator?profileId=${profileId}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full rounded-xl text-base justify-center text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
            )}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            You may be approvable — Skip to Safe Borrowing Simulator
          </Link>
        )}
      </div>
    </div>
  );
}
