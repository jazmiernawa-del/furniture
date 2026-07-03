// Runs each statement in a .sql file separately (autocommit) so that commands
// which can't run in a transaction block (e.g. ALTER TYPE ... ADD VALUE) work.
// Usage: DATABASE_URL="postgresql://..." node scripts/run-sql-each.mjs file.sql
import { readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL;
const file = process.argv[2];
if (!url || !file) {
  console.error("Need DATABASE_URL env and a file argument.");
  process.exit(1);
}

const raw = readFileSync(file, "utf8");
// Strip full-line SQL comments, then split on statement-terminating semicolons.
const cleaned = raw
  .split(/\r?\n/)
  .filter((line) => !/^\s*--/.test(line))
  .join("\n");
const statements = cleaned
  .split(/;\s*(?:\r?\n|$)/)
  .map((s) => s.trim())
  .filter(Boolean);

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  for (const stmt of statements) {
    await client.query(stmt);
    process.stdout.write("✓");
  }
  console.log(`\n✅ Applied ${statements.length} statement(s).`);
} catch (err) {
  console.error("\n❌ Failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
