/**
 * Screen 6 — Risk Band + EMI Shield (Server Component)
 *
 * Shows a "Before → After → After + within safe band" risk visualization
 * and conditionally surfaces the EMI Shield cross-sell.
 *
 * Design rationale: Shield is shown ONLY when riskBandAfter = medium | high.
 * An honest cross-sell that's shown only when it genuinely helps signals
 * product maturity and avoids the mis-selling pattern that earned the 2024 RBI action.
 * Clearly priced: ₹199/mo, specific coverage, specific conditions.
 */

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, loanSimulations, rejectionProfiles } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { ProgressSteps } from "@/components/ProgressSteps";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  XCircle,
  RefreshCcw,
  ExternalLink,
  Info,
} from "lucide-react";
import type { RiskBand } from "@/lib/db/schema";
import { SAFE_FOIR_THRESHOLD } from "@/lib/engine/loan-simulation";

export default async function RiskPage({
  searchParams,
}: {
  searchParams: Promise<{ simulationId?: string; profileId?: string }>;
}) {
  const { simulationId, profileId } = await searchParams;

  if (!simulationId) notFound();

  // Fetch simulation + profile
  const [simulation] = await db
    .select()
    .from(loanSimulations)
    .where(eq(loanSimulations.id, simulationId));

  if (!simulation) notFound();

  const [profile] = await db
    .select()
    .from(rejectionProfiles)
    .where(eq(rejectionProfiles.id, simulation.profileId));

  const existingFoir = profile
    ? Math.round((profile.existingEmi / profile.monthlyIncome) * 100 * 10) / 10
    : null;

  // Safe-band FOIR (40%)
  const safeAfterFoir = SAFE_FOIR_THRESHOLD;

  const bands: Array<{
    label: string;
    foir: number | null;
    band: RiskBand;
    sublabel: string;
  }> = [
    {
      label: "Before this loan",
      foir: existingFoir,
      band: simulation.riskBandBefore as RiskBand,
      sublabel: "Existing payment load",
    },
    {
      label: "After this loan",
      foir: simulation.postLoanFoir,
      band: simulation.riskBandAfter as RiskBand,
      sublabel: `Post-loan ratio: ${simulation.postLoanFoir}%`,
    },
    {
      label: "After loan + within safe band",
      foir: safeAfterFoir,
      band: simulation.computedEmi <= simulation.safeEmiMax ? "low" : simulation.riskBandAfter as RiskBand,
      sublabel: `Safe band: EMI ≤ ₹${simulation.safeEmiMax.toLocaleString("en-IN")}/mo`,
    },
  ];

  const isInSafeBand = simulation.computedEmi <= simulation.safeEmiMax;
  const allStressPass = simulation.stressPassBool;

  return (
    <div className="space-y-6">
      <ProgressSteps current={5} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your risk report</h1>
        <p className="text-slate-500 text-sm mt-1">
          Loan of ₹{simulation.requestedAmount.toLocaleString("en-IN")} over{" "}
          {simulation.tenureMonths} months — EMI ₹{simulation.computedEmi.toLocaleString("en-IN")}/mo
        </p>
      </div>

      {/* ── Risk band progression ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Risk band progression
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {bands.map((b, idx) => (
            <Card
              key={idx}
              className={cn(
                "border text-center",
                b.band === "low" && "bg-emerald-50 border-emerald-200",
                b.band === "medium" && "bg-amber-50 border-amber-200",
                b.band === "high" && "bg-red-50 border-red-200"
              )}
            >
              <CardContent className="pt-3 pb-3 px-2">
                <p className="text-xs text-slate-500 font-medium leading-tight">{b.label}</p>
                <div className="flex justify-center mt-2 mb-1">
                  <RiskBadge band={b.band} size="sm" showLabel={false} />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {b.band === "low" ? "Low" : b.band === "medium" ? "Medium" : "High"}
                </p>
                {b.foir !== null && (
                  <p className="text-xs text-slate-400 mt-0.5">{b.foir}% FOIR</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Stress test summary ───────────────────────────────────────────── */}
      <Card className={cn("border", allStressPass ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200")}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            {allStressPass
              ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              : <XCircle className="w-5 h-5 text-amber-600" />}
            <p className="text-sm font-semibold text-slate-800">
              Stress tests: {allStressPass ? "Both passed ✓" : "One or more failed"}
            </p>
          </div>
          <p className="text-sm text-slate-600">
            {allStressPass
              ? "Your EMI remains manageable under a 30% income drop AND a 1-month no-income scenario — this loan appears genuinely affordable."
              : "Your EMI may be difficult to sustain under stress scenarios. Consider borrowing ₹" + simulation.safeAmountMax.toLocaleString("en-IN") + " or less for a safer buffer."}
          </p>
        </CardContent>
      </Card>

      {/* ── Safe band verdict ─────────────────────────────────────────────── */}
      <Card className={cn("border", isInSafeBand ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-1">
            {isInSafeBand
              ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              : <XCircle className="w-5 h-5 text-red-600" />}
            <p className="text-sm font-semibold text-slate-800">
              {isInSafeBand ? "Within safe EMI band" : "Outside safe EMI band"}
            </p>
          </div>
          <p className="text-sm text-slate-600">
            {isInSafeBand
              ? `Your EMI of ₹${simulation.computedEmi.toLocaleString("en-IN")}/mo is at or below the safe maximum of ₹${simulation.safeEmiMax.toLocaleString("en-IN")}/mo (FOIR ≤ ${SAFE_FOIR_THRESHOLD}%).`
              : `Safe EMI max for your income: ₹${simulation.safeEmiMax.toLocaleString("en-IN")}/mo (FOIR ≤ ${SAFE_FOIR_THRESHOLD}%). Your current EMI is ₹${(simulation.computedEmi - simulation.safeEmiMax).toLocaleString("en-IN")} above this. Max safe loan amount: ₹${simulation.safeAmountMax.toLocaleString("en-IN")}.`}
          </p>
        </CardContent>
      </Card>

      {/* ── EMI Shield cross-sell ──────────────────────────────────────────
           ONLY shown when shield_recommended_bool = true (medium or high risk)
           Honestly priced, specific conditions stated, no dark patterns. */}
      {simulation.shieldRecommendedBool && (
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-indigo-900">Navi EMI Shield</p>
                  <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">
                    Recommended for your risk level
                  </span>
                </div>
                <p className="text-sm text-indigo-800 mt-1 leading-relaxed">
                  <strong>₹199/month</strong> covers up to 3 consecutive EMIs if you lose your job
                  or are hospitalised for 7+ days. This would reduce your effective risk band if
                  you take the loan at the current amount.
                </p>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-3 space-y-1">
              <p className="text-xs font-semibold text-indigo-700">What&apos;s covered:</p>
              {[
                "Up to 3 EMIs paid if involuntarily unemployed",
                "Up to 3 EMIs paid if hospitalised 7+ consecutive days",
                "No premium if no claim — monthly plan, cancel anytime",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
                  <p className="text-xs text-indigo-800">{item}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-indigo-600 flex items-center gap-1">
              <Info className="w-3 h-3" />
              This is shown because your post-loan risk band is{" "}
              <strong>{simulation.riskBandAfter}</strong>. We don&apos;t show this when
              the risk band is already low.
            </p>

            <a
              href="#"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs"
              )}
            >
              Learn more about EMI Shield
              <ExternalLink className="w-3 h-3" />
            </a>
          </CardContent>
        </Card>
      )}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="space-y-3 pt-2">
        {!isInSafeBand && (
          <Link
            href={`/simulator?profileId=${profileId ?? simulation.profileId}`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-base rounded-xl gap-2 justify-center"
            )}
          >
            <RefreshCcw className="w-4 h-4" />
            Try a safer amount
          </Link>
        )}

        <a
          href="https://www.navi.com/personal-loan/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full rounded-xl text-base justify-center gap-2"
          )}
        >
          Apply at Navi
          <ArrowRight className="w-4 h-4" />
        </a>

        <p className="text-center text-xs text-slate-400">
          This report is based on the transparent rule engine explained above.
          Actual lender decisions may factor in additional data.
        </p>
      </div>
    </div>
  );
}
