/**
 * Screen 2 — 4-Field Profile Input (Client Component)
 *
 * Design rationale: 4 fields ONLY.
 * Research finding: 6/8 interviewees said loan application forms felt "too long."
 * Every extra field reduces completion rate. These 4 fields are the minimum
 * needed to produce an accurate, actionable diagnosis.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressSteps } from "@/components/ProgressSteps";
import { ArrowRight, Info } from "lucide-react";

const SCORE_BUCKETS = [
  { value: "excellent", label: "750+ — Excellent" },
  { value: "good",      label: "650-749 — Good" },
  { value: "fair",      label: "550-649 — Fair" },
  { value: "poor",      label: "300-549 — Poor" },
  { value: "no_score",  label: "No credit history yet" },
] as const;

const EMPLOYMENT_TYPES = [
  { value: "salaried_govt",    label: "Salaried — Government" },
  { value: "salaried_private", label: "Salaried — Private company" },
  { value: "self_employed",    label: "Self-employed / Business owner" },
  { value: "freelancer",       label: "Freelancer / Consultant" },
] as const;

interface FormState {
  monthlyIncome: string;
  existingEmi: string;
  creditScoreBucket: string;
  employmentType: string;
  consentGiven: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    monthlyIncome: "",
    existingEmi: "",
    creditScoreBucket: "",
    employmentType: "",
    consentGiven: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete =
    form.monthlyIncome &&
    form.existingEmi !== "" &&
    form.creditScoreBucket &&
    form.employmentType &&
    form.consentGiven;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rejection-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyIncome: Number(form.monthlyIncome),
          existingEmi: Number(form.existingEmi),
          creditScoreBucket: form.creditScoreBucket,
          employmentType: form.employmentType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Submission failed");
      }

      const data = await res.json();
      router.push(`/diagnosis?profileId=${data.profileId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <ProgressSteps current={1} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Tell us about your finances
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          4 fields only — this is exactly what we need to diagnose your rejection accurately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="bg-white">
          <CardContent className="pt-5 space-y-6">

            {/* Monthly income */}
            <div className="space-y-1.5">
              <Label htmlFor="income" className="text-sm font-medium text-slate-700">
                Monthly take-home income (₹)
              </Label>
              <Input
                id="income"
                type="number"
                placeholder="e.g. 45000"
                value={form.monthlyIncome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthlyIncome: e.target.value }))
                }
                required
                min={5000}
                className="text-base"
              />
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                After tax, in-hand per month. Include salary + any regular side income.
              </p>
            </div>

            {/* Existing EMI */}
            <div className="space-y-1.5">
              <Label htmlFor="emi" className="text-sm font-medium text-slate-700">
                Total existing monthly EMIs (₹)
              </Label>
              <Input
                id="emi"
                type="number"
                placeholder="e.g. 8000"
                value={form.existingEmi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, existingEmi: e.target.value }))
                }
                required
                min={0}
                className="text-base"
              />
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                All loans + credit card minimum payments combined. Enter 0 if none.
              </p>
            </div>

            {/* Credit score bucket */}
            <div className="space-y-1.5">
              <Label htmlFor="score" className="text-sm font-medium text-slate-700">
                Credit score range
              </Label>
              <Select
                value={form.creditScoreBucket}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, creditScoreBucket: v ?? "" }))
                }
              >
                <SelectTrigger id="score" className="w-full text-base">
                  <SelectValue placeholder="Select your score range" />
                </SelectTrigger>
                <SelectContent>
                  {SCORE_BUCKETS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Check free at cibil.com or your bank app. Not sure? Pick &quot;Fair&quot; to start.
              </p>
            </div>

            {/* Employment type */}
            <div className="space-y-1.5">
              <Label htmlFor="employment" className="text-sm font-medium text-slate-700">
                Employment type
              </Label>
              <Select
                value={form.employmentType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, employmentType: v ?? "" }))
                }
              >
                <SelectTrigger id="employment" className="w-full text-base">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* DPDPA 2023 consent — required before data collection */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.consentGiven}
            onChange={(e) => setForm((f) => ({ ...f, consentGiven: e.target.checked }))}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-xs text-slate-500 leading-relaxed">
            I consent to this information being used to generate my loan diagnosis and recovery plan.
            My data will not be shared with any lender or third party.
            I can request deletion at any time —{" "}
            <a href="mailto:f20230575@pilani.bits-pilani.ac.in" className="text-indigo-500 hover:underline">
              contact the researcher
            </a>.
            <span className="text-slate-400 block mt-0.5">(Required under DPDPA 2023)</span>
          </span>
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={!isComplete || loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-base rounded-xl gap-2"
          size="lg"
        >
          {loading ? "Analysing…" : "Show me the diagnosis"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </Button>

        <p className="text-center text-xs text-slate-400">
          Your data is used only to generate your diagnosis. We don&apos;t share it with lenders.
        </p>
      </form>
    </div>
  );
}
