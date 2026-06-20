import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import {
  getDatabaseUrl,
  getTursoAuthToken,
  isTursoDatabase,
} from "../src/lib/database-url";

async function main() {
  if (!isTursoDatabase()) {
    console.log("Not a Turso/libSQL database — skipping remote migrations.");
    return;
  }

  const client = createClient({
    url: getDatabaseUrl(),
    authToken: getTursoAuthToken(),
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT (datetime('now')),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )
  `);

  const migrationsDir = path.join(process.cwd(), "prisma/migrations");
  const dirs = fs
    .readdirSync(migrationsDir)
    .filter((name) => fs.statSync(path.join(migrationsDir, name)).isDirectory())
    .sort();

  for (const dir of dirs) {
    const existing = await client.execute({
      sql: `SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = ? LIMIT 1`,
      args: [dir],
    });

    if (existing.rows.length > 0) {
      console.log(`  ✓ ${dir} (already applied)`);
      continue;
    }

    const sqlPath = path.join(migrationsDir, dir, "migration.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");

    console.log(`  → Applying ${dir}...`);
    await client.executeMultiple(sql);
    await client.execute({
      sql: `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
            VALUES (?, ?, datetime('now'), ?, datetime('now'), 1)`,
      args: [randomUUID(), checksum, dir],
    });
    console.log(`  ✓ ${dir}`);
  }

  console.log("Turso migrations complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
