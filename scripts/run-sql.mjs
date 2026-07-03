// Runs a .sql file against a Postgres connection string.
// Usage: DATABASE_URL="postgresql://..." node scripts/run-sql.mjs supabase/setup_all.sql
import { readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL;
const file = process.argv[2];
if (!url || !file) {
  console.error("Need DATABASE_URL env and a file argument.");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");
const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("✅ SQL applied successfully.");
} catch (err) {
  console.error("❌ SQL failed:");
  console.error("  message:", err.message);
  if (err.position) {
    const pos = Number(err.position);
    console.error("  near:", JSON.stringify(sql.slice(pos - 60, pos + 60)));
  }
  process.exitCode = 1;
} finally {
  await client.end();
}
