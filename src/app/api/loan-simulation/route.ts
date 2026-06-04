/**
 * POST /api/loan-simulation
 * Accepts loan parameters + profileId, runs the simulation engine,
 * persists the result, and returns the full simulation output.
 *
 * This endpoint is the "differentiator" API — it implements the safe-borrowing
 * logic that separates Borrow-Safe from a generic EMI calculator.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, rejectionProfiles, loanSimulations } from "@/lib/db";
import { simulate } from "@/lib/engine/loan-simulation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      profileId: string;
      requestedAmount: number;
      tenureMonths: number;
      annualInterestRate?: number;
    };

    const { profileId, requestedAmount, tenureMonths, annualInterestRate } = body;

    if (!profileId || !requestedAmount || !tenureMonths) {
      return NextResponse.json(
        { error: "Missing required fields: profileId, requestedAmount, tenureMonths" },
        { status: 400 }
      );
    }
    if (requestedAmount < 10_000 || requestedAmount > 10_000_000) {
      return NextResponse.json({ error: "Loan amount must be between ₹10,000 and ₹1 Crore" }, { status: 400 });
    }
    if (tenureMonths < 3 || tenureMonths > 84) {
      return NextResponse.json({ error: "Tenure must be between 3 and 84 months" }, { status: 400 });
    }

    // Fetch income/EMI from the stored profile
    const [profile] = await db
      .select()
      .from(rejectionProfiles)
      .where(eq(rejectionProfiles.id, profileId));

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Run the simulation engine
    const result = simulate({
      monthlyIncome: profile.monthlyIncome,
      existingEmi: profile.existingEmi,
      requestedAmount,
      tenureMonths,
      annualInterestRate,
    });

    // Persist to DB
    const [saved] = await db
      .insert(loanSimulations)
      .values({
        profileId,
        requestedAmount,
        tenureMonths,
        computedEmi: result.computedEmi,
        postLoanFoir: result.postLoanFoir,
        stressPassBool: result.stressPassBool,
        safeEmiMax: result.safeEmiMax,
        safeAmountMax: result.safeAmountMax,
        riskBandBefore: result.riskBandBefore,
        riskBandAfter: result.riskBandAfter,
        shieldRecommendedBool: result.shieldRecommendedBool,
      })
      .returning();

    return NextResponse.json({
      simulationId: saved.id,
      result,
    });
  } catch (error) {
    console.error("[loan-simulation POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const simulationId = req.nextUrl.searchParams.get("simulationId");
    if (!simulationId) {
      return NextResponse.json({ error: "Missing simulationId" }, { status: 400 });
    }

    const [simulation] = await db
      .select()
      .from(loanSimulations)
      .where(eq(loanSimulations.id, simulationId));

    if (!simulation) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    return NextResponse.json(simulation);
  } catch (error) {
    console.error("[loan-simulation GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
