import postgres from "postgres";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const sql = postgres(url, { prepare: false, max: 1 });

try {
  const migration = await readFile(resolve("drizzle/0000_initial.sql"), "utf8");
  await sql.begin(async (tx) => {
    await tx.unsafe(`CREATE TABLE IF NOT EXISTS coach_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
    const applied = await tx`SELECT name FROM coach_migrations WHERE name = '0000_initial.sql'`;
    if (applied.length === 0) {
      await tx.unsafe(migration);
      await tx`INSERT INTO coach_migrations (name) VALUES ('0000_initial.sql')`;
    }
  });
  console.log("Coach migrations are current");
} finally {
  await sql.end();
}
