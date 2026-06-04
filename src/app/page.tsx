import Link from "next/link";
import { CheckCircle2, TrendingUp, Shield, ArrowRight, Zap, BarChart2, Lock, Target, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 py-4">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative text-center space-y-5 pt-6 pb-2 hero-bg rounded-2xl px-4 -mx-2">
        {/* Status badge */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-dot" />
          Loan not approved this time
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
          Not approved this time —{" "}
          <span className="text-gradient-indigo">let&apos;s get you ready.</span>
        </h1>

        <p className="text-slate-500 max-w-md mx-auto text-[15px] leading-relaxed">
          We diagnose exactly why in plain language, build your 90-day
          improvement plan, and help you borrow an amount that&apos;s{" "}
          <strong className="text-slate-700">genuinely safe for your income.</strong>
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 pt-1">
          {[
            { value: "60s", label: "to diagnose" },
            { value: "90 days", label: "recovery plan" },
            { value: "₹0", label: "always free" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold text-indigo-700 tabular-nums">{s.value}</p>
              <p className="text-[11px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Primary CTA ──────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/profile"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-base gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"
          )}
        >
          See why &amp; get a plan
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="text-xs text-slate-400">No login required · Your data stays private</p>

        {/* De-emphasised exit */}
        <a
          href="https://www.paisabazaar.com/personal-loan/"
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Compare other lenders while you work on your plan
        </a>
      </div>

      {/* ── Flow overview ─────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="flex items-center gap-1 mb-4">
          <div className="flex-1 h-px bg-slate-100" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3">How it works</p>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { step: "01", label: "Diagnose", desc: "Plain-language rejection reason in seconds" },
            { step: "02", label: "Plan", desc: "Specific 90-day roadmap, not vague advice" },
            { step: "03", label: "Simulate", desc: "Test EMIs and stress scenarios live" },
            { step: "04", label: "Borrow safe", desc: "Apply only when you're genuinely ready" },
          ].map((f) => (
            <div key={f.step} className="relative bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
              <span className="text-[10px] font-bold text-indigo-400 tabular-nums">{f.step}</span>
              <p className="text-sm font-semibold text-slate-800 mt-1">{f.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature highlights ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            icon: <CheckCircle2 className="w-4 h-4" />,
            color: "indigo",
            title: "Plain-language diagnosis",
            desc: "No jargon. Exactly why you were rejected and what it means in ₹ terms.",
          },
          {
            icon: <TrendingUp className="w-4 h-4" />,
            color: "violet",
            title: "90-day roadmap",
            desc: "Specific, measurable steps — not vague advice like \"improve your score.\"",
          },
          {
            icon: <Shield className="w-4 h-4" />,
            color: "emerald",
            title: "Stress-test before you borrow",
            desc: "See if your EMI is safe even if your income drops or you miss a salary.",
          },
        ].map((f) => (
          <Card key={f.title} className="bg-white border-slate-100 shadow-xs hover:shadow-sm transition-shadow">
            <CardContent className="pt-4">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center mb-3",
                f.color === "indigo" ? "bg-indigo-50 text-indigo-600" :
                f.color === "violet" ? "bg-violet-50 text-violet-600" :
                "bg-emerald-50 text-emerald-600"
              )}>
                {f.icon}
              </div>
              <p className="text-sm font-semibold text-slate-800">{f.title}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Research signals ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
          {
            icon: <Users className="w-3.5 h-3.5 text-violet-600" />,
            bg: "bg-violet-50 border-violet-100",
            headline: "8 user interviews",
            body: "5/8 didn't know what FOIR meant. 6/8 said rejection felt like a punishment, not information.",
          },
          {
            icon: <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />,
            bg: "bg-indigo-50 border-indigo-100",
            headline: "400 Play Store reviews",
            body: "Rejection is the #1 negative-review category across Navi, MoneyView, and Fibe.",
          },
          {
            icon: <Target className="w-3.5 h-3.5 text-emerald-600" />,
            bg: "bg-emerald-50 border-emerald-100",
            headline: "North star: +15 pp re-apply rate",
            body: "Target: 15 pp above unassisted control. Conservative model: ~₹36–79 Cr/yr incremental disbursement.",
          },
        ].map((s, i) => (
          <div key={i} className={cn("flex items-start gap-2 border rounded-xl px-3 py-2.5 text-xs", s.bg)}>
            <span className="mt-0.5 shrink-0">{s.icon}</span>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">{s.headline}</p>
              <p className="text-slate-500 leading-relaxed mt-0.5">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Analytics CTA ─────────────────────────────────────────────────── */}
      <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart2 className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-indigo-900">Product analytics + business case inside</p>
              <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                12 SQL-backed insights · A/B experiment roadmap · ₹ business impact model ·
                North star metric tree. Built to show PM thinking end-to-end.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-2 transition-colors"
              >
                View full analytics dashboard
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Transparency note ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          {
            icon: <Zap className="w-3.5 h-3.5 text-amber-600" />,
            bg: "bg-amber-50 border-amber-100",
            text: "Every formula and threshold is shown on-screen — no black box. You can verify why each recommendation is made.",
          },
          {
            icon: <Lock className="w-3.5 h-3.5 text-slate-500" />,
            bg: "bg-slate-50 border-slate-100",
            text: "Your data is used only to generate your diagnosis. We don't share it with lenders or third parties.",
          },
        ].map((n, i) => (
          <div key={i} className={cn("flex items-start gap-2 border rounded-xl px-3 py-2.5 text-xs", n.bg)}>
            <span className="mt-0.5 shrink-0">{n.icon}</span>
            <p className="text-slate-600 leading-relaxed">{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
