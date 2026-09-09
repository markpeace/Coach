import postgres from "postgres";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const sql = postgres(url, { prepare: false, max: 1 });

try {
  await sql.unsafe(`CREATE TABLE IF NOT EXISTS coach_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const names = (await readdir(resolve("drizzle"))).filter(name => name.endsWith(".sql")).sort();
  for (const name of names) {
    const migration = await readFile(resolve("drizzle", name), "utf8");
    await sql.begin(async (tx) => {
      const applied = await tx`SELECT name FROM coach_migrations WHERE name = ${name}`;
      if (applied.length === 0) {
        await tx.unsafe(migration);
        await tx`INSERT INTO coach_migrations (name) VALUES (${name})`;
      }
    });
  }
  console.log("Coach migrations are current");
} finally {
  await sql.end();
}
