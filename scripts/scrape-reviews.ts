/**
 * Play Store Review Scraper — Navi Borrow-Safe
 *
 * Scrapes real reviews for Navi, MoneyView, and Fibe from the Google Play Store
 * using google-play-scraper, then upserts them into the reviews table.
 *
 * Usage: npm run db:scrape
 *
 * Note: After scraping, you should MANUALLY LABEL each review with:
 *   - funnel_stage_label: application|rejection|disbursement|repayment|support
 *   - complaint_category: rejection|processing_time|interest_rate|kyc|app_bug|customer_service
 * This labelling process is itself a research artifact — document it in your case study.
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// App IDs on Google Play Store
const APPS = [
  { id: "com.navi.app",            name: "navi"       },
  { id: "com.moneyview.savings",   name: "moneyview"  },
  { id: "in.fibe",                 name: "fibe"       },
];

// Auto-labelling heuristics (for a first pass — manual review recommended)
function autoLabelFunnel(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/reject|not approved|denied|not eligible|eligib/)) return "rejection";
  if (lower.match(/disburse|credited|received|got the loan|amount/)) return "disbursement";
  if (lower.match(/emi|repay|deduct|payment|miss|pay/))               return "repayment";
  if (lower.match(/kyc|document|aadhaar|pan|verification/))           return "application";
  if (lower.match(/support|helpline|customer care|resolve|ticket/))   return "support";
  return "application"; // default
}

function autoLabelCategory(text: string, funnelStage: string): string {
  const lower = text.toLowerCase();
  if (funnelStage === "rejection")                                        return "rejection";
  if (lower.match(/interest|rate|apr|processing fee|charge/))            return "interest_rate";
  if (lower.match(/kyc|aadhaar|pan|selfie|document|verif/))             return "kyc";
  if (lower.match(/crash|bug|error|slow|loading|freeze|app/))           return "app_bug";
  if (lower.match(/support|agent|helpline|call|resolve|response/))      return "customer_service";
  if (lower.match(/fast|quick|slow|delay|time|process/))                return "processing_time";
  return "processing_time";
}

function inferSentiment(rating: number): string {
  if (rating <= 2) return "negative";
  if (rating === 3) return "neutral";
  return "positive";
}

async function scrapeAndSave(appId: string, appName: string) {
  console.log(`\nScraping ${appName} (${appId})...`);

  // Dynamic import for CJS module
  const gplay = await import("google-play-scraper");

  try {
    // Fetch up to 200 reviews (free, no auth required)
    const reviews = await gplay.default.reviews({
      appId,
      lang: "en",
      country: "in",
      sort: 2, // 2 = NEWEST in google-play-scraper
      num: 200,
    });

    const rows = reviews.data.map((r: {
      id: string;
      text: string;
      score: number;
      date: Date | string;
    }) => ({
      sourceApp: appName,
      rating: r.score,
      reviewText: r.text ?? "",
      funnelStageLabel: autoLabelFunnel(r.text ?? ""),
      complaintCategory: autoLabelCategory(r.text ?? "", autoLabelFunnel(r.text ?? "")),
      sentiment: inferSentiment(r.score),
      reviewDate: new Date(r.date),
    }));

    if (rows.length > 0) {
      await db.insert(schema.reviews).values(rows);
      console.log(`  ✅ Inserted ${rows.length} reviews for ${appName}`);
    }
  } catch (err) {
    console.error(`  ❌ Failed to scrape ${appName}:`, err);
    console.log(`     Falling back to synthetic data. Run db:seed instead.`);
  }
}

async function main() {
  console.log("📱 Scraping Play Store reviews...");
  console.log("   Note: Auto-labels are approximate. Manual review recommended for accuracy.\n");

  for (const app of APPS) {
    await scrapeAndSave(app.id, app.name);
    // Rate-limit courtesy delay
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n✅ Scraping complete.");
  console.log(
    "   Next: Manually review labels in Drizzle Studio (npm run db:studio) or a spreadsheet."
  );
}

main().catch(console.error);
