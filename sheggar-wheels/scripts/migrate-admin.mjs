/**
 * Adds the Better Auth admin-plugin columns to an existing database.
 *
 * Better Auth's own migration CLI can do this, but this script is idempotent,
 * reviewable, and also folds the app's legacy `user.status` column into the
 * plugin-owned `user.banned` flag.
 *
 * Two modes:
 * - Local SQLite: `data/auth.db` (or `AUTH_DATABASE_PATH`).
 * - Hosted Postgres: selected by `DATABASE_URL` / `POSTGRES_URL`.
 *
 * Run with: npm run db:migrate:admin
 */
import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { Pool } from "pg";

const databaseUrl =
  process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
const dbPath =
  process.env.AUTH_DATABASE_PATH ?? path.join(process.cwd(), "data", "auth.db");

if (databaseUrl) {
  await migratePostgres();
} else {
  migrateSqlite();
}

async function migratePostgres() {
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const tables = await pool.query(
      `SELECT table_name
         FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name IN ('user', 'session')`,
    );
    const names = tables.rows.map((row) => row.table_name);

    if (!names.includes("user") || !names.includes("session")) {
      console.error(
        'The auth database has no "user" / "session" tables. Run "npm run db:migrate" first.',
      );
      process.exitCode = 1;
      return;
    }

    async function columns(table) {
      const result = await pool.query(
        `SELECT column_name
           FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1`,
        [table],
      );
      return result.rows.map((row) => row.column_name);
    }

    async function addColumn(table, name, definition) {
      if ((await columns(table)).includes(name)) {
        console.log(`skip   ${table}.${name}`);
        return;
      }

      await pool.query(
        `ALTER TABLE "${table}" ADD COLUMN "${name}" ${definition}`,
      );
      console.log(`add    ${table}.${name}`);
    }

    const hadLegacyStatus = (await columns("user")).includes("status");

    await addColumn("user", "banned", "boolean NOT NULL DEFAULT false");
    await addColumn("user", "banReason", "text");
    await addColumn("user", "banExpires", "timestamp");
    await addColumn("session", "impersonatedBy", "text");

    if (hadLegacyStatus) {
      // Preserve any suspension that was recorded by the pre-admin-plugin model.
      const migrated = await pool.query(
        `UPDATE "user" SET "banned" = true WHERE "status" = 'suspended'`,
      );
      if (migrated.rowCount > 0) {
        console.log(
          `moved  ${migrated.rowCount} suspended account(s) to user.banned`,
        );
      }

      await pool.query('ALTER TABLE "user" DROP COLUMN "status"');
      console.log("drop   user.status (legacy)");
    }
  } finally {
    await pool.end();
  }
}

function migrateSqlite() {
  if (!fs.existsSync(dbPath)) {
    console.error(
      `No auth database at ${dbPath}.\nStart the app once, or run "npm run db:migrate", then retry.`,
    );
    process.exitCode = 1;
    return;
  }

  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  const hasTable = (table) =>
    Boolean(
      db
        .prepare(
          "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
        )
        .get(table),
    );

  const columns = (table) =>
    db
      .prepare(`PRAGMA table_info("${table}")`)
      .all()
      .map((column) => column.name);

  const addColumn = (table, name, definition) => {
    if (columns(table).includes(name)) {
      console.log(`skip   ${table}.${name}`);
      return;
    }

    db.exec(`ALTER TABLE "${table}" ADD COLUMN "${name}" ${definition}`);
    console.log(`add    ${table}.${name}`);
  };

  try {
    if (!hasTable("user") || !hasTable("session")) {
      console.error(
        'The auth database has no "user" / "session" tables. Run "npm run db:migrate" first.',
      );
      process.exitCode = 1;
      return;
    }

    const hadLegacyStatus = columns("user").includes("status");

    addColumn("user", "banned", "integer NOT NULL DEFAULT 0");
    addColumn("user", "banReason", "text");
    addColumn("user", "banExpires", "date");
    addColumn("session", "impersonatedBy", "text");

    if (hadLegacyStatus) {
      // Preserve any suspension that was recorded by the pre-admin-plugin model.
      const migrated = db
        .prepare("UPDATE user SET banned = 1 WHERE status = 'suspended'")
        .run().changes;
      if (migrated > 0) {
        console.log(`moved  ${migrated} suspended account(s) to user.banned`);
      }

      try {
        db.exec('ALTER TABLE "user" DROP COLUMN "status"');
        console.log("drop   user.status (legacy)");
      } catch (error) {
        // Older SQLite builds cannot drop a column; keeping it is harmless.
        console.warn(
          "kept   user.status (SQLite could not drop it):",
          error instanceof Error ? error.message : error,
        );
      }
    }
  } finally {
    db.close();
  }
}

console.log("Admin plugin schema ready.");
