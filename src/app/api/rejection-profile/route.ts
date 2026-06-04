/**
 * POST /api/rejection-profile
 * Accepts a 4-field profile input, runs the diagnosis engine, persists to DB,
 * and returns the full diagnosis + profileId for subsequent steps.
 *
 * GET /api/rejection-profile?profileId=xxx
 * Returns stored profile data (used by the simulator page to hydrate income/EMI).
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, rejectionProfiles } from "@/lib/db";
import { diagnose } from "@/lib/engine/diagnosis";
import type { CreditScoreBucket, EmploymentType } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      monthlyIncome: number;
      existingEmi: number;
      creditScoreBucket: CreditScoreBucket;
      employmentType: EmploymentType;
      userId?: string;
    };

    const { monthlyIncome, existingEmi, creditScoreBucket, employmentType, userId } = body;

    // Basic validation
    if (!monthlyIncome || !creditScoreBucket || !employmentType) {
      return NextResponse.json(
        { error: "Missing required fields: monthlyIncome, creditScoreBucket, employmentType" },
        { status: 400 }
      );
    }
    if (monthlyIncome < 1000) {
      return NextResponse.json({ error: "Monthly income must be at least ₹1,000" }, { status: 400 });
    }

    // Run the rule engine
    const diagnosis = diagnose({
      monthlyIncome,
      existingEmi: existingEmi ?? 0,
      creditScoreBucket,
      employmentType,
    });

    // Persist to DB
    const [profile] = await db
      .insert(rejectionProfiles)
      .values({
        userId: userId ?? null,
        monthlyIncome,
        existingEmi: existingEmi ?? 0,
        foirCalculated: diagnosis.foirCalculated,
        creditScoreBucket,
        employmentType,
        primaryReason: diagnosis.primaryReason,
        allReasons: diagnosis.allReasons,
      })
      .returning();

    return NextResponse.json({
      profileId: profile.id,
      diagnosis,
    });
  } catch (error) {
    console.error("[rejection-profile POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const profileId = req.nextUrl.searchParams.get("profileId");
    if (!profileId) {
      return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
    }

    const [profile] = await db
      .select()
      .from(rejectionProfiles)
      .where(eq(rejectionProfiles.id, profileId));

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[rejection-profile GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
