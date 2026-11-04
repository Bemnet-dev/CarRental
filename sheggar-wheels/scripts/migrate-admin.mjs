/**
 * Adds the Better Auth admin-plugin columns to an existing SQLite database.
 *
 * Better Auth's own migration CLI can do this, but this script is idempotent,
 * reviewable, and also folds the app's legacy `user.status` column into the
 * plugin-owned `user.banned` flag.
 *
 * Run with: npm run db:migrate:admin
 */
import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

const dbPath =
  process.env.AUTH_DATABASE_PATH ?? path.join(process.cwd(), "data", "auth.db");

if (!fs.existsSync(dbPath)) {
  console.error(
    `No auth database at ${dbPath}.\nStart the app once, or run "npm run db:migrate", then retry.`,
  );
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

function hasTable(table) {
  return Boolean(
    db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
      )
      .get(table),
  );
}

function columns(table) {
  return db
    .prepare(`PRAGMA table_info("${table}")`)
    .all()
    .map((column) => column.name);
}

function addColumn(table, name, definition) {
  if (columns(table).includes(name)) {
    console.log(`skip   ${table}.${name}`);
    return;
  }

  db.exec(`ALTER TABLE "${table}" ADD COLUMN "${name}" ${definition}`);
  console.log(`add    ${table}.${name}`);
}

if (!hasTable("user") || !hasTable("session")) {
  console.error(
    'The auth database has no "user" / "session" tables. Run "npm run db:migrate" first.',
  );
  db.close();
  process.exit(1);
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

db.close();
console.log("Admin plugin schema ready.");
