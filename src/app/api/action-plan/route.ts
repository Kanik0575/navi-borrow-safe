/**
 * POST /api/action-plan
 * Accepts a profileId, fetches the stored profile, generates a 90-day
 * action plan, persists it, and returns the plan.
 *
 * Idempotent: if a plan already exists for the profileId, returns the existing one.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, rejectionProfiles, actionPlans } from "@/lib/db";
import { generateActionPlan } from "@/lib/engine/action-plan";
import type { CreditScoreBucket, EmploymentType, RejectionReason } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { profileId: string };
    const { profileId } = body;

    if (!profileId) {
      return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
    }

    // Idempotency: return existing plan if already generated
    const [existing] = await db
      .select()
      .from(actionPlans)
      .where(eq(actionPlans.profileId, profileId));

    if (existing) {
      return NextResponse.json({
        planId: existing.id,
        profileId,
        steps: existing.stepsJson,
        targetDate: existing.targetDate,
        fromCache: true,
      });
    }

    // Fetch the profile
    const [profile] = await db
      .select()
      .from(rejectionProfiles)
      .where(eq(rejectionProfiles.id, profileId));

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Generate the plan
    const plan = generateActionPlan({
      primaryReason: profile.primaryReason as RejectionReason,
      allReasons: profile.allReasons as RejectionReason[],
      monthlyIncome: profile.monthlyIncome,
      existingEmi: profile.existingEmi,
      creditScoreBucket: profile.creditScoreBucket as CreditScoreBucket,
      employmentType: profile.employmentType as EmploymentType,
    });

    // Persist
    const [saved] = await db
      .insert(actionPlans)
      .values({
        profileId,
        targetDate: plan.targetDate,
        stepsJson: plan.steps,
      })
      .returning();

    return NextResponse.json({
      planId: saved.id,
      profileId,
      steps: plan.steps,
      targetDate: plan.targetDate,
      summary: plan.summary,
      fromCache: false,
    });
  } catch (error) {
    console.error("[action-plan POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
