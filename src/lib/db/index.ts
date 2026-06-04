/**
 * Drizzle ORM client using Neon's serverless HTTP driver.
 *
 * Why neon-http over neon-serverless websocket?
 * - The HTTP driver has zero cold-start overhead in Vercel Edge/Node functions.
 * - No connection pooling config needed — Neon handles it server-side.
 * - Works identically in local dev and production.
 *
 * Lazy initialization: the client is created on first use, not at module load.
 * This prevents build-time failures when DATABASE_URL is not yet set.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy singleton — created on first call, reused across requests in the same lambda
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Copy .env.local.example → .env.local and fill in your Neon connection string."
      );
    }
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Proxy — allows `db.select()`, `db.insert()`, etc. directly (same API as before)
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle<typeof schema>>];
  },
});

// Re-export schema types and table objects for convenience
export * from "./schema";
