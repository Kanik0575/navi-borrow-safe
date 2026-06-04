import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load .env.local (Next.js convention) then fall back to .env
config({ path: ".env.local" });
config({ path: ".env" });

// Drizzle Kit config — used for migrations (npx drizzle-kit generate / migrate)
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
