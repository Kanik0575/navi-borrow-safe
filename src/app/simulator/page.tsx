/**
 * Screen 5 — Safe Borrowing Simulator (Client Component)
 *
 * The differentiator. Users adjust amount + tenure, see live EMI, post-loan FOIR,
 * and whether they pass the two stress tests — with the formula shown openly.
 *
 * Design rationale: The math is visible, not hidden.
 * This is the Integrity signal — transparent pricing/risk is exactly what Navi
 * committed to after the 2024 RBI remediation.
 */

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ProgressSteps } from "@/components/ProgressSteps";
import { RiskBadge } from "@/components/RiskBadge";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calculator,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  simulate,
  DEFAULT_ANNUAL_RATE,
  SAFE_FOIR_THRESHOLD,
  MEDIUM_FOIR_THRESHOLD,
  INCOME_DROP_PCT,
  ASSUMED_SAVINGS_MONTHS,
} from "@/lib/engine/loan-simulation";
import type { SimulationResult } from "@/lib/engine/loan-simulation";
import type { RiskBand } from "@/lib/db/schema";
import Link from "next/link";

// Tenor options in months
const TENURE_OPTIONS = [12, 18, 24, 36, 48, 60, 72, 84];

function SimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = searchParams.get("profileId");

  // Profile data (fetched once)
  const [profile, setProfile] = useState<{
    monthlyIncome: number;
    existingEmi: number;
  } | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Slider state
  const [loanAmount, setLoanAmount] = useState(100000);
  const [tenureMonths, setTenureMonths] = useState(24);

  // Live simulation result (computed client-side, no DB call yet)
  const [liveResult, setLiveResult] = useState<SimulationResult | null>(null);

  // Submission state
  const [saving, setSaving] = useState(false);

  // Fetch profile income/EMI
  useEffect(() => {
    if (!profileId) return;
    fetch(`/api/rejection-profile?profileId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        // Drizzle returns camelCase property names matching the schema definition
        setProfile({
          monthlyIncome: data.monthlyIncome,
          existingEmi: data.existingEmi,
        });
      })
      .catch(() => setProfileError("Could not load profile. Please go back and re-enter your details."));
  }, [profileId]);

  // Live calculation whenever amount/tenure/profile changes
  const runLiveSimulation = useCallback(() => {
    if (!profile) return;
    const result = simulate({
      monthlyIncome: profile.monthlyIncome,
      existingEmi: profile.existingEmi,
      requestedAmount: loanAmount,
      tenureMonths,
    });
    setLiveResult(result);
  }, [profile, loanAmount, tenureMonths]);

  useEffect(() => {
    runLiveSimulation();
  }, [runLiveSimulation]);

  // Save to DB and redirect to risk report
  async function handleAnalyzeRisk() {
    if (!profileId || !liveResult) return;
    setSaving(true);
    try {
      const res = await fetch("/api/loan-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          requestedAmount: loanAmount,
          tenureMonths,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push(`/risk?simulationId=${data.simulationId}&profileId=${profileId}`);
    } catch {
      setSaving(false);
    }
  }

  if (!profileId) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <p className="text-slate-600">No profile found. Please start from the beginning.</p>
        <Link href="/profile" className={cn(buttonVariants(), "bg-indigo-600 text-white")}>
          Start over
        </Link>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <p className="text-slate-600">{profileError}</p>
      </div>
    );
  }

  if (!profile || !liveResult) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-500 mt-3 text-sm">Loading your profile…</p>
      </div>
    );
  }

  const overBand = liveResult.computedEmi > liveResult.safeEmiMax;
  const foirBefore = liveResult.formulaBreakdown.foirBefore;
  const foirAfter  = liveResult.postLoanFoir;
  const foirDelta  = Math.round((foirAfter - foirBefore) * 10) / 10;
  // Existing FOIR already over the safe threshold — NOT caused by the new loan
  const existingAlreadyOverLimit = foirBefore >= SAFE_FOIR_THRESHOLD;

  return (
    <div className="space-y-6">
      <ProgressSteps current={4} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Safe Borrowing Simulator</h1>
        <p className="text-slate-500 text-sm mt-1">
          Adjust the loan amount and tenure. We&apos;ll show you the EMI, your
          payment-to-income ratio, and whether you pass two stress tests.
        </p>
      </div>

      {/* ── Sliders ────────────────────────────────────────────────────────── */}
      <Card className="bg-white">
        <CardContent className="pt-5 space-y-7">

          {/* Loan amount slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Loan amount</Label>
              <span className="text-lg font-bold text-slate-900">
                ₹{loanAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <Slider
              value={[loanAmount]}
              onValueChange={(v) => setLoanAmount(Array.isArray(v) ? v[0] : v)}
              min={25000}
              max={1000000}
              step={5000}
              orientation="horizontal"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>₹25,000</span>
              <span>₹10,00,000</span>
            </div>
            {liveResult.safeAmountMax > 0 ? (
              <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                Safe max for this tenure: ₹{liveResult.safeAmountMax.toLocaleString("en-IN")}
              </p>
            ) : (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <XCircle className="w-3 h-3 shrink-0" />
                Existing debt already exceeds safe limit — no safe amount available
              </p>
            )}
          </div>

          {/* Tenure selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tenure</Label>
              <span className="text-lg font-bold text-slate-900">
                {tenureMonths} months ({Math.round(tenureMonths / 12 * 10) / 10} yr)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TENURE_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTenureMonths(t)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    t === tenureMonths
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-400"
                  )}
                >
                  {t}m
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Alert: existing FOIR already over safe limit ──────────────────── */}
      {existingAlreadyOverLimit && (
        <Card className="bg-amber-50 border-amber-300">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Your existing payments already exceed the safe limit
                </p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Before this loan, your payment-to-income ratio is already{" "}
                  <strong>{foirBefore}%</strong> — above the safe threshold of{" "}
                  {SAFE_FOIR_THRESHOLD}%. Any new loan adds to an already stretched
                  position. The high FOIR shown below is{" "}
                  <strong>not caused by this loan</strong> — it&apos;s your current
                  debt load. Use the 90-day plan to reduce existing obligations first.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── EMI + FOIR output ─────────────────────────────────────────────── */}
      {/* 3-column: EMI | Before FOIR | After FOIR */}
      <div className="grid grid-cols-3 gap-2">
        {/* Monthly EMI */}
        <Card className="bg-white">
          <CardContent className="pt-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide leading-tight">
              Monthly EMI
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ₹{liveResult.computedEmi.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{DEFAULT_ANNUAL_RATE}% p.a.</p>
          </CardContent>
        </Card>

        {/* Before FOIR (existing obligations, no new loan) */}
        <Card className={cn(
          "border",
          foirBefore >= SAFE_FOIR_THRESHOLD ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"
        )}>
          <CardContent className="pt-4">
            <p className="text-xs font-medium uppercase tracking-wide leading-tight text-slate-500">
              Before loan
            </p>
            <p className={cn(
              "text-xl font-bold mt-1",
              foirBefore >= SAFE_FOIR_THRESHOLD ? "text-amber-700" : "text-slate-700"
            )}>
              {foirBefore}%
            </p>
            <p className="text-xs text-slate-400 mt-0.5">existing FOIR</p>
          </CardContent>
        </Card>

        {/* After FOIR (with new loan) */}
        <Card className={cn(
          "border",
          foirAfter > MEDIUM_FOIR_THRESHOLD
            ? "bg-red-50 border-red-200"
            : foirAfter > SAFE_FOIR_THRESHOLD
            ? "bg-amber-50 border-amber-200"
            : "bg-emerald-50 border-emerald-200"
        )}>
          <CardContent className="pt-4">
            <p className="text-xs font-medium uppercase tracking-wide leading-tight text-slate-500">
              After loan
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <p className={cn(
                "text-xl font-bold",
                foirAfter > MEDIUM_FOIR_THRESHOLD
                  ? "text-red-700"
                  : foirAfter > SAFE_FOIR_THRESHOLD
                  ? "text-amber-700"
                  : "text-emerald-700"
              )}>
                {foirAfter}%
              </p>
              {foirDelta > 0 && (
                <span className="text-xs font-medium text-red-500">+{foirDelta}%</span>
              )}
            </div>
            <p className={cn(
              "text-xs mt-0.5",
              foirAfter > SAFE_FOIR_THRESHOLD ? "text-red-500" : "text-emerald-600"
            )}>
              {foirAfter > SAFE_FOIR_THRESHOLD
                ? `Over safe limit (${SAFE_FOIR_THRESHOLD}%)`
                : `Within safe limit`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FOIR visual progress bar */}
      <Card className="bg-white border-slate-100">
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Payment-to-income ratio</span>
            <span className="font-medium">{foirAfter}% after new loan</span>
          </div>
          <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
            {/* Existing obligations bar */}
            <div
              className="absolute inset-y-0 left-0 bg-amber-400 rounded-l-full"
              style={{ width: `${Math.min(100, foirBefore)}%` }}
            />
            {/* New loan addition */}
            {foirDelta > 0 && (
              <div
                className={cn(
                  "absolute inset-y-0",
                  foirAfter > MEDIUM_FOIR_THRESHOLD ? "bg-red-500" : "bg-amber-500"
                )}
                style={{
                  left: `${Math.min(100, foirBefore)}%`,
                  width: `${Math.min(100 - foirBefore, foirDelta)}%`,
                }}
              />
            )}
            {/* Safe limit marker (40%) */}
            <div className="absolute inset-y-0 w-0.5 bg-emerald-600 z-10" style={{ left: `${SAFE_FOIR_THRESHOLD}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span className="text-emerald-600 font-medium">Safe ≤{SAFE_FOIR_THRESHOLD}%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 mr-1 align-middle" />
            Existing obligations ({foirBefore}%)
            {foirDelta > 0 && (
              <>
                {"  "}
                <span className={cn(
                  "inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle",
                  foirAfter > MEDIUM_FOIR_THRESHOLD ? "bg-red-500" : "bg-amber-500"
                )} />
                New loan adds +{foirDelta}%
              </>
            )}
            {"  "}
            <span className="inline-block w-0.5 h-3 bg-emerald-600 mr-1 align-middle" />
            Safe limit (40%)
          </p>
        </CardContent>
      </Card>

      {/* Risk band */}
      <Card className="bg-white border-slate-100">
        <CardContent className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Risk band after loan</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Before: <strong>{liveResult.riskBandBefore}</strong> → After:{" "}
              <strong>{liveResult.riskBandAfter}</strong>
            </p>
          </div>
          <RiskBadge band={liveResult.riskBandAfter as RiskBand} size="md" />
        </CardContent>
      </Card>

      {/* ── Stress tests ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Stress tests
        </h2>
        {liveResult.stressTests.map((test, i) => (
          <Card key={i} className={cn("border", test.passed ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
            <CardContent className="pt-3">
              <div className="flex items-start gap-3">
                {test.passed
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-sm font-semibold text-slate-800">{test.scenario}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{test.newFoirOrNote}</p>
                  <p className="text-sm text-slate-600 mt-1">{test.detail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Transparent formula ───────────────────────────────────────────── */}
      <Card className="bg-slate-50 border-slate-100">
        <CardContent className="pt-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Calculator className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              How we calculated this
            </p>
          </div>
          <div className="font-mono text-xs text-slate-600 space-y-1.5">
            <p>EMI = P × r × (1+r)^n / ((1+r)^n − 1)</p>
            <p>where P = ₹{liveResult.formulaBreakdown.principal.toLocaleString("en-IN")}, r = {liveResult.formulaBreakdown.monthlyRate}%/mo, n = {liveResult.formulaBreakdown.tenureMonths}m</p>
            <p className="text-emerald-600">→ New EMI = ₹{liveResult.formulaBreakdown.emi.toLocaleString("en-IN")}/month</p>
            <p className="mt-1 text-amber-700">Before-loan FOIR = ₹{profile.existingEmi.toLocaleString("en-IN")} / ₹{profile.monthlyIncome.toLocaleString("en-IN")} × 100 = {foirBefore}%</p>
            <p>After-loan FOIR = (₹{profile.existingEmi.toLocaleString("en-IN")} + ₹{liveResult.computedEmi.toLocaleString("en-IN")}) / ₹{profile.monthlyIncome.toLocaleString("en-IN")} × 100 = {foirAfter}%</p>
            <p className="text-slate-400">→ New loan adds only +{foirDelta}% to FOIR</p>
            <p className="mt-1">Stress test 1: {INCOME_DROP_PCT}% income drop → FOIR with reduced income</p>
            <p>Stress test 2: assumes {ASSUMED_SAVINGS_MONTHS}× monthly income as liquid savings</p>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            These assumptions are stated — not hidden. Your actual situation may differ.
          </p>
        </CardContent>
      </Card>

      {/* Safe band nudge — 3 states */}
      {overBand && liveResult.safeAmountMax > 0 && (
        // Case A: safe amount exists — recommend it
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold text-indigo-800">
              Recommended safe amount: ₹{liveResult.safeAmountMax.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              Borrowing ₹{liveResult.safeAmountMax.toLocaleString("en-IN")} keeps your
              payment-to-income ratio at or below {SAFE_FOIR_THRESHOLD}% for this tenure.
              Try moving the slider above.
            </p>
          </CardContent>
        </Card>
      )}

      {existingAlreadyOverLimit && liveResult.safeAmountMax === 0 && (
        // Case B: existing FOIR already exceeds safe limit — no loan amount is "safe"
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  No safe loan amount at current debt level
                </p>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  Your existing payments (₹{profile.existingEmi.toLocaleString("en-IN")}/mo)
                  already consume <strong>{foirBefore}%</strong> of your income — above the
                  safe limit of {SAFE_FOIR_THRESHOLD}%. There is no loan amount that keeps
                  your total ratio within the safe band.
                </p>
                <p className="text-xs text-red-700 mt-2 font-medium">
                  To reduce existing FOIR to below {SAFE_FOIR_THRESHOLD}%, you need to reduce
                  monthly obligations by ≥ ₹{(profile.existingEmi - Math.floor(profile.monthlyIncome * SAFE_FOIR_THRESHOLD / 100)).toLocaleString("en-IN")}/mo.
                  Your 90-day plan shows exactly how.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Button
        onClick={handleAnalyzeRisk}
        disabled={saving}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-base rounded-xl gap-2"
        size="lg"
      >
        {saving ? "Generating report…" : "View full risk report"}
        {!saving && <ArrowRight className="w-4 h-4" />}
      </Button>
    </div>
  );
}

// Simple label component used within the client
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-medium text-slate-700">{children}</span>
  );
}

// Wrap in Suspense because useSearchParams requires it in Next.js
export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SimulatorContent />
    </Suspense>
  );
}
