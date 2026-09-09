import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const sql = postgres(url, { prepare: false, max: 1 });
try {
  const [row] = await sql<{ table_count: number }[]>`
    SELECT count(*)::int AS table_count FROM information_schema.tables WHERE table_schema = 'public'
  `;
  if (!row || row.table_count < 12) throw new Error(`Expected at least 12 public tables, found ${row?.table_count ?? 0}`);
  console.log(`Database schema verified (${row.table_count} tables)`);
} finally {
  await sql.end();
}
