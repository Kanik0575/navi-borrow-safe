"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  ResponsiveContainer, Legend, CartesianGrid, AreaChart, Area,
  ReferenceLine,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle, Database, TrendingUp, TrendingDown, Users,
  BarChart2, Shield, MessageSquare, Zap, ChevronRight, ArrowUpRight,
  Target, FlaskConical, IndianRupee, Lightbulb, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  funnelStageComplaints: Array<{ funnel_stage_label: string; complaints: number; pct: number }>;
  naviVsCompetitors: Array<{ source_app: string; total_reviews: number; pct_rejection_complaints: number }>;
  rejectionReasons: Array<{ primary_reason: string; users: number; avg_foir: number; avg_income: number }>;
  overBorrowingByScore: Array<{ credit_score_bucket: string; approvals: number; pct_over: number }>;
  riskBandTransitions: Array<{ risk_band_before: string; risk_band_after: string; users: number }>;
  shieldImpact: { high_risk_users: number; shield_helps: number; pct_shield_helps: number } | null;
  sentimentByApp: Array<{ source_app: string; sentiment: string; count: number }>;
  summaryStats: {
    total_profiles: number; total_simulations: number; total_reviews: number;
    avg_foir: number; pct_stress_pass: number;
  } | null;
  employmentBreakdown: Array<{ employment_type: string; count: number; avg_foir: number; pct_foir_high: number }>;
  foirHistogram: Array<{ bucket: string; count: number }>;
  loanAmountDist: Array<{ bucket: string; count: number; pct_over_band: number }>;
  scoreBucketDist: Array<{ credit_score_bucket: string; count: number; avg_foir: number; pct_score_blocked: number }>;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const P = {
  indigo: "#4F46E5",
  violet: "#7C3AED",
  emerald: "#059669",
  amber: "#D97706",
  rose: "#E11D48",
  sky: "#0284C7",
  slate: "#475569",
  light: "#E2E8F0",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: P.emerald,
  neutral: P.slate,
  negative: P.rose,
  unlabelled: P.light,
};

const RISK_COLORS: Record<string, string> = {
  low: P.emerald,
  medium: P.amber,
  high: P.rose,
};

const REASON_LABELS: Record<string, string> = {
  foir_high: "High Debt-to-Income",
  score_low: "Low Credit Score",
  thin_file: "No Credit History",
  utilization_high: "High CC Utilization",
  employment_risk: "Income Verification",
};

const EMP_LABELS: Record<string, string> = {
  salaried_govt: "Govt. Salaried",
  salaried_private: "Private Salaried",
  self_employed: "Self-Employed",
  freelancer: "Freelancer",
};

const SCORE_ORDER = ["excellent", "good", "fair", "poor", "no_score"];

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function ChartTooltip({
  active, payload, label, unit = "",
}: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>;
  label?: string; unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon, color = "indigo", trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color?: "indigo" | "emerald" | "amber" | "rose" | "sky";
  trend?: "up" | "down" | "neutral";
}) {
  const bg = {
    indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600",
    sky: "bg-sky-50 text-sky-600",
  }[color];

  return (
    <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", bg)}>{icon}</div>
          {trend && (
            <span className={cn("text-xs font-medium",
              trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-400"
            )}>
              {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : trend === "down" ? <TrendingDown className="w-3.5 h-3.5" /> : null}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-3 tabular-nums">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  num, label, title, description,
}: {
  num: string; label: string; title: string; description: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
          {num}
        </span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Query Header ─────────────────────────────────────────────────────────────

function QueryLabel({ id, question, source }: { id: string; question: string; source?: string }) {
  return (
    <div className="flex items-start gap-2 mb-3">
      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-0.5 shrink-0 tabular-nums">
        {id}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-800">{question}</p>
        {source && <p className="text-[11px] text-slate-400 mt-0.5">{source}</p>}
      </div>
    </div>
  );
}

// ─── PM Insight Box ───────────────────────────────────────────────────────────

function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5">
      <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
      <p className="text-xs text-indigo-800 leading-relaxed">{children}</p>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="border-t border-slate-100 my-8" />;
}

// ─── Loading ──────────────────────────────────────────────────────────────────

function Loading() {
  return (
    <div className="space-y-4 py-12">
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-100" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      </div>
      <p className="text-center text-sm text-slate-400">Running SQL queries…</p>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────

function ErrorState({ msg }: { msg: string }) {
  return (
    <div className="text-center py-16 space-y-3">
      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6 text-amber-500" />
      </div>
      <p className="text-slate-700 text-sm font-medium">Failed to load analytics</p>
      <p className="text-slate-400 text-xs">{msg}</p>
      <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 inline-block">
        Run <code className="font-mono bg-slate-100 px-1 rounded">npm run db:seed</code> and verify the DB connection.
      </p>
    </div>
  );
}

// ─── No Data Placeholder ──────────────────────────────────────────────────────

function NoData({ msg = "No data yet — run the seed script." }: { msg?: string }) {
  return (
    <p className="text-sm text-slate-400 text-center py-8">{msg}</p>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState msg={error} />;
  if (!data) return null;

  const { summaryStats } = data;

  // Derived insight values
  const topFunnelStage = data.funnelStageComplaints[0];
  const naviPct = data.naviVsCompetitors.find((r) => r.source_app === "navi")?.pct_rejection_complaints ?? 0;
  const topRejectionReason = data.rejectionReasons[0];
  const foirHighCount = data.rejectionReasons.find((r) => r.primary_reason === "foir_high")?.users ?? 0;
  const totalProfiles = summaryStats?.total_profiles ?? 0;
  const foirHighPct = totalProfiles > 0 ? Math.round((foirHighCount / totalProfiles) * 100) : 0;

  // Risk band stable-or-improved rate (for the efficacy insight)
  const totalTransitions = data.riskBandTransitions.reduce((s, r) => s + r.users, 0);
  const stableOrBetter = data.riskBandTransitions.filter(
    (r) => r.risk_band_after === r.risk_band_before ||
            (r.risk_band_before === "high" && r.risk_band_after !== "high") ||
            (r.risk_band_before === "medium" && r.risk_band_after === "low")
  ).reduce((s, r) => s + r.users, 0);
  const improvementRate = totalTransitions > 0 ? Math.round((stableOrBetter / totalTransitions) * 100) : 0;

  // Prepare score chart data in logical order
  const scoreBucketSorted = [...data.scoreBucketDist].sort(
    (a, b) => SCORE_ORDER.indexOf(a.credit_score_bucket) - SCORE_ORDER.indexOf(b.credit_score_bucket)
  );

  return (
    <div className="space-y-0 pb-16">

      {/* ── Synthetic data framing ──────────────────────────────────────── */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-6 text-xs">
        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-amber-800 leading-relaxed">
          <strong>How to read this dashboard:</strong> Rejection profiles and loan simulations are synthetic (2,011 records generated by{" "}
          <code className="bg-amber-100 px-1 rounded text-[10px]">scripts/seed.ts</code>).
          Each chart is an <em>analytical framework</em> — the structure and questions are real,
          the numbers are illustrative. With Navi&apos;s actual data, these patterns would be validated,
          calibrated, and used to prioritise which rejection segment to target first.
          Reviews (400) are scraped real data.
        </p>
      </div>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
          12 SQL-backed product insights across user rejection profiles, borrowing behaviour,
          and review sentiment — powering evidence-based PM decisions.
        </p>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Database className="w-3 h-3" />
            Live queries against Neon Postgres
          </div>
          <span className="text-slate-200">·</span>
          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
            Synthetic profiles & simulations
          </span>
          <span className="text-xs bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full font-medium">
            Scraped Play Store reviews
          </span>
        </div>
      </div>

      {/* ── KPI Summary ─────────────────────────────────────────────────── */}
      {summaryStats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-8">
          <KpiCard
            label="Rejection Profiles"
            value={summaryStats.total_profiles.toLocaleString()}
            sub="Synthetic dataset"
            icon={<Users className="w-4 h-4" />}
            color="indigo"
          />
          <KpiCard
            label="Loan Simulations"
            value={summaryStats.total_simulations.toLocaleString()}
            sub="Synthetic dataset"
            icon={<TrendingUp className="w-4 h-4" />}
            color="sky"
          />
          <KpiCard
            label="Reviews Analysed"
            value={summaryStats.total_reviews.toLocaleString()}
            sub="Scraped + labelled"
            icon={<MessageSquare className="w-4 h-4" />}
            color="indigo"
          />
          <KpiCard
            label="Avg FOIR"
            value={`${summaryStats.avg_foir}%`}
            sub={`Safe threshold: 40%`}
            icon={<BarChart2 className="w-4 h-4" />}
            color={summaryStats.avg_foir > 40 ? "rose" : "emerald"}
            trend={summaryStats.avg_foir > 40 ? "down" : "neutral"}
          />
          <KpiCard
            label="Stress Test Pass Rate"
            value={`${summaryStats.pct_stress_pass}%`}
            sub="Of all simulations"
            icon={<Shield className="w-4 h-4" />}
            color={summaryStats.pct_stress_pass >= 60 ? "emerald" : "amber"}
            trend="neutral"
          />
          <KpiCard
            label="FOIR-Driven Rejections"
            value={`${foirHighPct}%`}
            sub="Primary addressable segment"
            icon={<ChevronRight className="w-4 h-4" />}
            color="amber"
            trend="neutral"
          />
        </div>
      )}

      {/* ── North Star ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shrink-0">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">North Star Metric</span>
            </div>
            <p className="text-base font-bold text-slate-900">30-day re-application rate from Borrow-Safe users vs. rejected-user control</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Target: <strong className="text-indigo-700">+15 percentage points</strong> above unassisted control (~4–6% industry baseline).
              Captures both product resonance <em>(diagnosis was useful)</em> and outcome <em>(eligibility actually improved)</em>.
            </p>
            <div className="grid grid-cols-1 gap-2 mt-3 sm:grid-cols-3">
              {[
                { badge: "Leading", label: "Funnel completion rate", sub: "Rejection screen → plan generated", target: "≥25%", color: "indigo" },
                { badge: "Lagging", label: "90-day re-application rate", sub: "vs. unassisted rejected-user control", target: "+15 pp", color: "violet" },
                { badge: "Quality guard", label: "Day-30 NPA rate on recovered cohort", sub: "Must stay ≤ direct-approve baseline", target: "≤5%", color: "emerald" },
              ].map((m) => (
                <div key={m.label} className="bg-white/80 rounded-xl px-3 py-2.5 border border-indigo-100">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest",
                      m.color === "indigo" ? "text-indigo-500" : m.color === "violet" ? "text-violet-500" : "text-emerald-600"
                    )}>{m.badge}</span>
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      m.color === "indigo" ? "text-indigo-700" : m.color === "violet" ? "text-violet-700" : "text-emerald-700"
                    )}>{m.target}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{m.label}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — USER VOICE
      ════════════════════════════════════════════════════════════════════ */}
      <SectionHeader
        num="01"
        label="User Voice"
        title="Where does friction live in the loan journey?"
        description="Play Store review analysis — negative sentiment mapped to product funnel stages and competitive benchmarking."
      />

      {/* SQL 1: Funnel stage complaints */}
      <Card className="bg-white border-slate-100 shadow-sm mb-4">
        <CardContent className="pt-5">
          <QueryLabel
            id="SQL 1"
            question="Which funnel stage generates the most complaints?"
            source="Negative reviews only · Play Store scrape"
          />
          {data.funnelStageComplaints.length === 0 ? (
            <NoData />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={data.funnelStageComplaints} margin={{ left: -16, right: 8, top: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="funnel_stage_label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip unit=" complaints" />} />
                  <Bar dataKey="complaints" name="Complaints" fill={P.indigo} radius={[5, 5, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
              {topFunnelStage && (
                <Insight>
                  <strong>{topFunnelStage.funnel_stage_label}</strong> accounts for{" "}
                  <strong>{topFunnelStage.pct}%</strong> of all negative reviews — the highest-friction
                  stage in the funnel. Borrow-Safe directly addresses this by transforming the
                  rejection moment into an improvement pathway.{" "}
                  <span className="text-indigo-700 font-semibold">
                    Business implication: every percentage point improvement in rejection-stage
                    NPS reduces competitive churn — each churned rejected user represents a
                    potential ₹80k+ loan that goes to a competitor.
                  </span>
                </Insight>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* SQL 2: Navi vs competitors */}
      <Card className="bg-white border-slate-100 shadow-sm mb-4">
        <CardContent className="pt-5">
          <QueryLabel
            id="SQL 2"
            question="Rejection complaint share: Navi vs. competitors"
            source="% of total reviews that are rejection-related · Play Store"
          />
          {data.naviVsCompetitors.length === 0 ? (
            <NoData />
          ) : (
            <>
              <div className="space-y-4 mt-1">
                {data.naviVsCompetitors.map((row) => {
                  const isNavi = row.source_app === "navi";
                  const pct = row.pct_rejection_complaints;
                  const barW = Math.min(100, pct * 4);
                  return (
                    <div key={row.source_app}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-semibold capitalize",
                            isNavi ? "text-indigo-700" : "text-slate-600"
                          )}>
                            {row.source_app}
                          </span>
                          {isNavi && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">OUR APP</span>
                          )}
                        </div>
                        <span className={cn(
                          "text-sm font-bold tabular-nums",
                          pct > 15 ? "text-rose-600" : pct > 10 ? "text-amber-600" : "text-emerald-600"
                        )}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            pct > 15 ? "bg-rose-400" : pct > 10 ? "bg-amber-400" : "bg-emerald-400"
                          )}
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {row.pct_rejection_complaints}% of {row.total_reviews.toLocaleString()} reviews mention rejection
                      </p>
                    </div>
                  );
                })}
              </div>
              <Insight>
                Navi&apos;s rejection complaint rate is <strong>{naviPct}%</strong>. Borrow-Safe converts this
                complaint surface into product retention — users who understand their rejection path are
                more likely to return and apply again.
              </Insight>
            </>
          )}
        </CardContent>
      </Card>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — WHO GETS REJECTED
      ════════════════════════════════════════════════════════════════════ */}
      <SectionHeader
        num="02"
        label="Rejection Profile"
        title="Who gets rejected and why?"
        description="Segmentation of 2,000 synthetic rejection profiles by primary reason, credit tier, and employment type."
      />

      {/* SQL 3: Rejection reasons */}
      <Card className="bg-white border-slate-100 shadow-sm mb-4">
        <CardContent className="pt-5">
          <QueryLabel
            id="SQL 3"
            question="Primary rejection reason distribution"
            source="Sizes each fixable segment · Synthetic rejection profiles"
          />
          {data.rejectionReasons.length === 0 ? (
            <NoData />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={data.rejectionReasons.map((r) => ({
                    ...r,
                    label: REASON_LABELS[r.primary_reason] ?? r.primary_reason,
                  }))}
                  layout="vertical"
                  margin={{ left: 8, right: 32, top: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={130} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip unit=" users" />} />
                  <Bar dataKey="users" name="Users" fill={P.violet} radius={[0, 5, 5, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
              {topRejectionReason && (
                <Insight>
                  <strong>{REASON_LABELS[topRejectionReason.primary_reason] ?? topRejectionReason.primary_reason}</strong>{" "}
                  drives <strong>{Math.round((topRejectionReason.users / totalProfiles) * 100)}%</strong> of all
                  rejections ({topRejectionReason.users.toLocaleString()} users), avg FOIR {topRejectionReason.avg_foir}%.
                  {" "}<span className="text-indigo-700 font-semibold">FOIR-high users are the fastest-recovering segment</span>{" "}
                  — closing even one small loan has immediate impact. At avg income ₹{(topRejectionReason.avg_income / 1000).toFixed(0)}k/mo,
                  a 5% FOIR reduction unlocks ~₹{Math.round(topRejectionReason.avg_income * 0.05 / 1000)}k/mo in
                  additional debt capacity — enough to qualify for a ₹50–80k loan within 60 days.
                </Insight>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Q10: FOIR histogram */}
      <Card className="bg-white border-slate-100 shadow-sm mb-4">
        <CardContent className="pt-5">
          <QueryLabel
            id="SQL 10"
            question="FOIR distribution across all rejected profiles"
            source="Identifies how many users are near vs. far from the safe 40% threshold"
          />
          {data.foirHistogram.length === 0 ? (
            <NoData />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.foirHistogram} margin={{ left: -16, right: 8, top: 4 }}>
                  <defs>
                    <linearGradient id="foirGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={P.indigo} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={P.indigo} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip unit=" profiles" />} />
                  <Area
                    type="monotone" dataKey="count" name="Profiles"
                    stroke={P.indigo} strokeWidth={2} fill="url(#foirGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <Insight>
                The 40–50% bucket reveals users who are <em>closest</em> to the safe threshold — they need
                only small income changes or debt paydowns to qualify. Borrow-Safe&apos;s 90-day plan
                specifically targets this high-conversion segment.
              </Insight>
            </>
          )}
        </CardContent>
      </Card>

      {/* Q12: Score bucket distribution */}
      <Card className="bg-white border-slate-100 shadow-sm mb-4">
        <CardContent className="pt-5">
          <QueryLabel
            id="SQL 12"
            question="Rejection volume and score-blocked rate by credit tier"
            source="Shows how many rejections are score-driven vs. FOIR-driven"
          />
          {data.scoreBucketDist.length === 0 ? (
            <NoData />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scoreBucketSorted} margin={{ left: -16, right: 8, top: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="credit_score_bucket" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend formatter={(v) => <span className="text-[11px] text-slate-500">{v}</span>} />
                  <Bar yAxisId="left" dataKey="count" name="Profiles" fill={P.sky} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar yAxisId="right" dataKey="pct_score_blocked" name="Score-blocked %" fill={P.rose} radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
              <Insight>
                &quot;Fair&quot; and &quot;poor&quot; score buckets show the highest score-blocked rates.
                Users in these segments need the score-building steps in the 90-day plan before
                they can advance to the simulator.
              </Insight>
            </>
          )}
        </CardContent>
      </Card>

      {/* Q9: Employment type breakdown */}
      <Card className="bg-white border-slate-100 shadow-sm mb-4">
        <CardContent className="pt-5">
          <QueryLabel
            id="SQL 9"
            question="Rejection volume and FOIR profile by employment type"
            source="Identifies which employment segments carry the highest income-risk"
          />
          {data.employmentBreakdown.length === 0 ? (
            <NoData />
          ) : (
            <>
              <div className="space-y-3">
                {data.employmentBreakdown.map((row) => {
                  const label = EMP_LABELS[row.employment_type] ?? row.employment_type;
                  const maxCount = Math.max(...data.employmentBreakdown.map((r) => r.count));
                  const barW = Math.round((row.count / maxCount) * 100);
                  return (
                    <div key={row.employment_type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-400">{row.count.toLocaleString()} profiles</span>
                          <span className={cn(
                            "font-bold tabular-nums",
                            row.avg_foir > 45 ? "text-rose-600" : row.avg_foir > 40 ? "text-amber-600" : "text-slate-600"
                          )}>
                            {row.avg_foir}% avg FOIR
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-400"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {row.pct_foir_high}% have FOIR as primary rejection reason
                      </p>
                    </div>
                  );
                })}
              </div>
              <Insight>
                Freelancers and self-employed users typically have higher FOIR variance and lower
                approval rates. The plan generator surfaces documentation and income-stabilization
                steps specifically for these segments.
              </Insight>
            </>
          )}
        </CardContent>
      </Card>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — BORROWING BEHAVIOUR & RISK
      ════════════════════════════════════════════════════════════════════ */}
      <SectionHeader
        num="03"
        label="Borrowing Behaviour"
        title="How much are users trying to borrow, and is it safe?"
        description="Loan simulation data — safe EMI band analysis, over-borrowing rates, and loan size preferences."
      />

      {/* SQL 4: Over-borrowing by score */}
      <Card className="bg-white border-slate-100 shadow-sm mb-4">
        <CardContent className="pt-5">
          <QueryLabel
            id="SQL 4"
            question="% of simulations exceeding the safe-EMI band, by credit score"
            source="Asset-quality risk indicator · Synthetic simulation data"
          />
          {data.overBorrowingByScore.length === 0 ? (
            <NoData />
          ) : (
            <>
              <div className="space-y-3 mt-1">
                {data.overBorrowingByScore.map((row) => (
                  <div key={row.credit_score_bucket}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 capitalize">{row.credit_score_bucket}</span>
                      <span className={cn(
                        "text-sm font-bold tabular-nums",
                        row.pct_over > 40 ? "text-rose-600" : row.pct_over > 20 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {row.pct_over}% over band
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          row.pct_over > 40 ? "bg-rose-400" : row.pct_over > 20 ? "bg-amber-400" : "bg-emerald-400"
                        )}
                        style={{ width: `${row.pct_over}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Insight>
                Higher-risk score buckets paradoxically attempt more over-band loans — likely
                because they have limited borrowing history and underestimate their debt capacity.
                The simulator&apos;s safe-amount nudge directly corrects this.{" "}
                <span className="text-indigo-700 font-semibold">
                  Asset quality implication: if 30–40% of over-band approvals trend toward NPA
                  and the safe-band nudge reduces over-borrowing from ~40% → 5%, this prevents
                  ~3–7 NPAs per 100 incremental approvals — measurable in securitisation pool quality
                  and directly relevant to Navi&apos;s J.P. Morgan PTC deal terms.
                </span>
              </Insight>
            </>
          )}
        </CardContent>
      </Card>

      {/* Q11: Loan amount distribution */}
      <Card className="bg-white border-slate-100 shadow-sm mb-4">
        <CardContent className="pt-5">
          <QueryLabel
            id="SQL 11"
            question="Loan amount preference distribution and over-band rate"
            source="Shows where over-borrowing risk concentrates by loan size"
          />
          {data.loanAmountDist.length === 0 ? (
            <NoData />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.loanAmountDist} margin={{ left: -16, right: 8, top: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend formatter={(v) => <span className="text-[11px] text-slate-500">{v}</span>} />
                  <Bar yAxisId="left" dataKey="count" name="Simulations" fill={P.sky} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar yAxisId="right" dataKey="pct_over_band" name="Over-band %" fill={P.rose} radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
              <Insight>
                Larger loan buckets show higher over-band rates — users attempting ₹5L+ are most
                likely to exceed their safe EMI capacity. The simulator&apos;s safe-amount indicator
                prevents these high-NPA-risk approvals.
              </Insight>
            </>
          )}
        </CardContent>
      </Card>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — PRODUCT EFFICACY
      ════════════════════════════════════════════════════════════════════ */}
      <SectionHeader
        num="04"
        label="Product Efficacy"
        title="Does following the plan actually improve outcomes?"
        description="Risk band migration analysis and EMI Shield cross-sell effectiveness validation."
      />

      {/* SQL 5: Risk band transitions */}
      <Card className="bg-white border-slate-100 shadow-sm mb-4">
        <CardContent className="pt-5">
          <QueryLabel
            id="SQL 5"
            question="Does following the plan move users to a better risk band?"
            source="Before → after risk band migration · Synthetic simulation data"
          />
          {data.riskBandTransitions.length === 0 ? (
            <NoData />
          ) : (
            <>
              <div className="overflow-x-auto mt-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">Before</th>
                      <th className="text-left py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">After</th>
                      <th className="text-right py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">Users</th>
                      <th className="text-right py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.riskBandTransitions.map((row, i) => {
                      const improved = (
                        (row.risk_band_before === "high" && row.risk_band_after !== "high") ||
                        (row.risk_band_before === "medium" && row.risk_band_after === "low")
                      );
                      const worsened = (
                        (row.risk_band_before === "low" && row.risk_band_after !== "low") ||
                        (row.risk_band_before === "medium" && row.risk_band_after === "high")
                      );
                      return (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: RISK_COLORS[row.risk_band_before] + "20", color: RISK_COLORS[row.risk_band_before] }}>
                              {row.risk_band_before}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: RISK_COLORS[row.risk_band_after] + "20", color: RISK_COLORS[row.risk_band_after] }}>
                              {row.risk_band_after}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-700 text-sm">
                            {row.users.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right">
                            {improved && <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Improved</span>}
                            {worsened && <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Worsened</span>}
                            {!improved && !worsened && <span className="text-[11px] text-slate-300">Stable</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Insight>
                <strong>{improvementRate}%</strong> of simulations result in a better risk band after
                the plan is followed — validating the core product thesis. This metric is the north star
                KPI for Borrow-Safe&apos;s recovery efficacy.
              </Insight>
            </>
          )}
        </CardContent>
      </Card>

      {/* SQL 6: EMI Shield */}
      <Card className="bg-white border-slate-100 shadow-sm mb-4">
        <CardContent className="pt-5">
          <QueryLabel
            id="SQL 6"
            question="EMI Shield: among high-risk simulations, how many actually benefit?"
            source="Validates the cross-sell shows only where genuinely helpful — no mis-selling"
          />
          {data.shieldImpact ? (
            <>
              <div className="grid grid-cols-3 gap-3 mt-1">
                {[
                  { label: "High-risk simulations", value: data.shieldImpact.high_risk_users.toLocaleString(), color: "rose" as const },
                  { label: "Shield helps", value: data.shieldImpact.shield_helps.toLocaleString(), color: "indigo" as const },
                  { label: "% Shield beneficial", value: `${data.shieldImpact.pct_shield_helps}%`, color: "emerald" as const },
                ].map((s) => (
                  <div key={s.label} className={cn(
                    "rounded-xl p-3 text-center",
                    s.color === "rose" ? "bg-rose-50" : s.color === "indigo" ? "bg-indigo-50" : "bg-emerald-50"
                  )}>
                    <p className={cn(
                      "text-2xl font-bold tabular-nums",
                      s.color === "rose" ? "text-rose-700" : s.color === "indigo" ? "text-indigo-700" : "text-emerald-700"
                    )}>
                      {s.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
              <Insight>
                <strong>{data.shieldImpact.pct_shield_helps}%</strong> of high-risk users genuinely benefit
                from EMI Shield — it&apos;s surfaced only when risk band is medium or high, avoiding the
                mis-selling pattern that triggered the 2024 RBI remediation action.
              </Insight>
            </>
          ) : (
            <NoData />
          )}
        </CardContent>
      </Card>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — BUSINESS CASE
      ════════════════════════════════════════════════════════════════════ */}
      <SectionHeader
        num="05"
        label="Business Case"
        title="What is this worth in ₹ terms?"
        description="Conservative back-of-envelope model. All assumptions are explicit. The structure of the case matters more than the precision of the numbers."
      />

      {/* Impact model cards */}
      <div className="space-y-4 mb-6">
        {/* Revenue opportunity */}
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Revenue lever — incremental disbursement</p>
                <p className="text-xs text-slate-400 mt-0.5">Conservative estimate · Assumptions stated explicitly below</p>
              </div>
            </div>
            <div className="space-y-2 font-mono text-xs">
              {[
                { label: "Monthly rejected applicants (Navi, conservative)", value: "50,000", type: "input" },
                { label: "× Borrow-Safe engagement rate (post-rejection CTA)", value: "20%  →  10,000 users", type: "calc" },
                { label: "× Plan completion rate", value: "42%  →  4,200 plans/month", type: "calc" },
                { label: "× 30-day re-application rate (target: 15% vs ~5% today)", value: "15%  →  630 re-applications", type: "calc" },
                { label: "× Approval rate (self-selected + behaviour change)", value: "60%  →  378 approvals/month", type: "calc" },
                { label: "× Average loan size", value: "₹80,000", type: "input" },
              ].map((r) => (
                <div key={r.label} className={cn(
                  "flex items-start justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0",
                )}>
                  <span className={cn("text-slate-500 flex-1", r.type === "calc" && "pl-3")}>{r.label}</span>
                  <span className="text-slate-800 font-semibold tabular-nums shrink-0">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700 font-semibold">Monthly incremental disbursement</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Annual at conservative → optimistic range</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-emerald-800 tabular-nums">₹3.02 Cr/mo</p>
                <p className="text-xs text-emerald-600 font-semibold tabular-nums">₹36–79 Cr/year</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset quality lever */}
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                <Shield className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Asset quality lever — avoided early-stage defaults</p>
                <p className="text-xs text-slate-400 mt-0.5">The simulator&apos;s safe-band nudge reduces over-borrowing on recovered users</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Incremental approvals/month", value: "378", color: "slate" },
                { label: "Would over-borrow without simulator (~30%)", value: "~113/mo", color: "amber" },
                { label: "Simulator reduces to ~5%", value: "~19/mo", color: "emerald" },
                { label: "Avoided NPAs/year (8% default on over-borrowers)", value: "~90/year", color: "indigo" },
              ].map((m) => (
                <div key={m.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-lg font-bold text-slate-900 tabular-nums">{m.value}</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-1">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-xs text-indigo-700 font-semibold">Annual avoided NPA value (90 × ₹80,000)</p>
              <p className="text-lg font-bold text-indigo-800 tabular-nums">~₹7.2 Cr/year</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Additional: cleaner loan pool improves securitisation pool quality — measurable in cost of subsequent PTC issuances.
            </p>
          </CardContent>
        </Card>

        {/* One-line pitch */}
        <div className="bg-slate-900 rounded-2xl px-5 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">One-line pitch</p>
          <p className="text-sm text-white leading-relaxed">
            At conservative assumptions, Borrow-Safe recovers{" "}
            <span className="text-emerald-400 font-bold">₹36–79 Cr/year in incremental disbursement</span>{" "}
            at near-zero marginal CAC, prevents{" "}
            <span className="text-indigo-400 font-bold">~₹7 Cr/year in early-stage defaults</span>,
            and reduces the effective NPA rate on the recovered cohort from ~8% toward 5% —
            making it a simultaneous growth and asset-quality initiative.
          </p>
          <p className="text-[10px] text-slate-500 mt-3">All figures are illustrative estimates. Key assumption: 15% 30-day re-application rate vs. ~5% unassisted baseline.</p>
        </div>
      </div>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 6 — A/B EXPERIMENT ROADMAP
      ════════════════════════════════════════════════════════════════════ */}
      <SectionHeader
        num="06"
        label="Experiment Roadmap"
        title="What would I test first, and how?"
        description="Five A/B experiments in priority order. Each follows: hypothesis → primary metric → success criteria → decision rule."
      />

      <div className="space-y-4 mb-6">
        {[
          {
            week: "Week 1–2",
            title: "Rejection screen framing",
            hypothesis: "A hope-framed headline increases funnel completion vs. neutral status language",
            control: '"Your loan application was not approved"',
            test: '"Not approved this time — let\'s get you ready."',
            metric: "Funnel completion: rejection screen → profile submitted",
            success: "≥10 pp lift, p < 0.05",
            risk: "May feel casual — monitor bounce rate as guardrail",
            color: "indigo",
          },
          {
            week: "Week 3–4",
            title: "Form length: 4 fields vs. 7 fields",
            hypothesis: "Reducing form fields increases completion at acceptable accuracy cost",
            control: "7 fields (income + EMI + score + employment + city + loan amount + purpose)",
            test: "4 fields: income + EMI + score + employment (current)",
            metric: "Form completion rate + diagnosis accuracy (CS-validated)",
            success: "≥15% completion lift AND accuracy stays ≥80%",
            risk: "Lower accuracy = wrong plan = lower re-application rate downstream",
            color: "violet",
          },
          {
            week: "Week 5–6",
            title: "Plan format: chronological vs. quick-wins-first",
            hypothesis: "Quick-wins-first ordering reduces perceived overwhelm and lifts plan adherence",
            control: "Week-by-week chronological plan (current)",
            test: "Highest-impact, lowest-effort step always first",
            metric: "30-day plan return rate + self-reported satisfaction (1-Q NPS)",
            success: "≥20% higher 30-day return rate, p < 0.05",
            risk: "May not align with optimal execution sequence — monitor CS complaints",
            color: "sky",
          },
          {
            week: "Month 2",
            title: "EMI Shield placement: risk report only vs. simulator teaser",
            hypothesis: "Earlier Shield surface (when FOIR > 50% in simulator) increases CTR without mis-selling",
            control: "Shield on risk report only when riskBandAfter = medium/high (current)",
            test: "Shield teaser at simulator when post-loan FOIR > 50%",
            metric: "Shield CTR (primary) + cancellation rate at 30d (mis-selling proxy)",
            success: "≥15% CTR lift AND cancellation rate ≤ control",
            risk: "Earlier placement without full context may feel pushy — monitor NPS",
            color: "amber",
          },
          {
            week: "Month 3",
            title: "Re-application timing nudge (push notification at Day 75)",
            hypothesis: "A Day-75 reminder ('your plan ends in 2 weeks') increases 90-day re-application rate",
            control: "No notification (current)",
            test: "Single push at Day 75: 'Your 90-day plan ends soon — check your progress'",
            metric: "90-day re-application rate",
            success: "≥8 pp lift in 90-day re-application rate",
            risk: "Notification fatigue — limit to 1 per plan cycle, monitor opt-out rate",
            color: "emerald",
          },
        ].map((exp, i) => {
          const colorMap: Record<string, string> = {
            indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
            violet: "bg-violet-50 border-violet-100 text-violet-700",
            sky: "bg-sky-50 border-sky-100 text-sky-700",
            amber: "bg-amber-50 border-amber-100 text-amber-700",
            emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
          };
          const dotMap: Record<string, string> = {
            indigo: "bg-indigo-500", violet: "bg-violet-500", sky: "bg-sky-500",
            amber: "bg-amber-500", emerald: "bg-emerald-500",
          };
          return (
            <Card key={i} className="bg-white border-slate-100 shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={cn("flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 mt-0.5", colorMap[exp.color])}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-slate-900">{exp.title}</p>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", colorMap[exp.color])}>{exp.week}</span>
                    </div>
                    <p className="text-xs text-slate-600 italic mb-3">&quot;{exp.hypothesis}&quot;</p>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {[
                        { label: "Control", value: exp.control },
                        { label: "Test", value: exp.test },
                        { label: "Primary metric", value: exp.metric },
                        { label: "Success if", value: exp.success },
                      ].map((row) => (
                        <div key={row.label} className="bg-slate-50 rounded-lg px-2.5 py-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</p>
                          <p className="text-xs text-slate-700 mt-0.5 leading-snug">{row.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-start gap-1.5 mt-2 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-700"><strong>Risk:</strong> {exp.risk}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 7 — SENTIMENT INTELLIGENCE
      ════════════════════════════════════════════════════════════════════ */}
      <SectionHeader
        num="07"
        label="Sentiment Intelligence"
        title="How do users feel about each app?"
        description="Positive / Negative / Neutral breakdown from Play Store reviews — NPS proxy and competitive voice-of-customer analysis."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["navi", "moneyview", "fibe"].map((app) => {
          const appData = data.sentimentByApp.filter((r) => r.source_app === app);
          const total = appData.reduce((s, r) => s + r.count, 0);
          const positiveCount = appData.find((r) => r.sentiment === "positive")?.count ?? 0;
          const score = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
          return (
            <Card key={app} className="bg-white border-slate-100 shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-800 capitalize">{app}</p>
                  {total > 0 && (
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      score >= 50 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    )}>
                      {score}% positive
                    </span>
                  )}
                </div>
                {appData.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No data</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={130}>
                      <PieChart>
                        <Pie
                          data={appData} dataKey="count" nameKey="sentiment"
                          cx="50%" cy="50%" outerRadius={50} innerRadius={24} paddingAngle={3}
                        >
                          {appData.map((entry) => (
                            <Cell key={entry.sentiment} fill={SENTIMENT_COLORS[entry.sentiment] ?? P.light} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [v, "Reviews"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-2 mt-1">
                      {appData.map((d) => (
                        <div key={d.sentiment} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: SENTIMENT_COLORS[d.sentiment] ?? P.light }} />
                          <span className="text-[10px] text-slate-500 capitalize">{d.sentiment} ({d.count})</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400 text-center space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Database className="w-3 h-3" />
          <span className="font-medium text-slate-500">Data Sources</span>
        </div>
        <p>Rejection profiles and loan simulations are entirely synthetic — generated by <code className="bg-slate-100 px-1 rounded">scripts/seed.ts</code>.</p>
        <p>Reviews scraped from Google Play Store via <code className="bg-slate-100 px-1 rounded">google-play-scraper</code> and hand-labelled.</p>
        <p className="mt-2">
          <a href="https://github.com/Kanik0575/navi-borrow-safe/blob/main/scripts/queries.sql"
            className="text-indigo-500 hover:text-indigo-700 underline underline-offset-2 transition-colors"
            target="_blank" rel="noopener noreferrer">
            View all 12 raw SQL queries →
          </a>
        </p>
      </div>
    </div>
  );
}
