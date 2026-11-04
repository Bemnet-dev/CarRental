/**
 * Seeds the Better Auth database with the demo accounts advertised on the
 * sign-in screen. Safe to re-run: existing accounts are left in place (their
 * password is never reset) and only their directory fields are refreshed.
 *
 * The admin plugin owns `role` and the ban fields, so this script writes
 * `role` and clears `banned` / `banReason` / `banExpires` for demo accounts.
 *
 * Two modes:
 * - Local SQLite: `data/auth.db` (or `AUTH_DATABASE_PATH`).
 * - Hosted Postgres: selected by `DATABASE_URL` / `POSTGRES_URL`
 *   (Vercel Postgres / Neon).
 *
 * Run with: npm run db:seed
 */
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { hashPassword } from "better-auth/crypto";
import { Pool } from "pg";

const databaseUrl =
  process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
const dbPath =
  process.env.AUTH_DATABASE_PATH ?? path.join(process.cwd(), "data", "auth.db");

const demoUsers = [
  {
    id: "admin-1",
    email: "admin@dashdrive.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    phone: "+251911111111",
    neighbourhood: "Bole",
    role: "admin",
  },
  {
    id: "owner-1",
    email: "owner1@dashdrive.com",
    password: "owner123",
    firstName: "Tadesse",
    lastName: "Bekele",
    phone: "+251922222222",
    neighbourhood: "Bole",
    role: "owner",
  },
  {
    id: "owner-2",
    email: "owner2@dashdrive.com",
    password: "owner123",
    firstName: "Sara",
    lastName: "Mohammed",
    phone: "+251933333333",
    neighbourhood: "Kazanchis",
    role: "owner",
  },
  {
    id: "renter-1",
    email: "renter1@dashdrive.com",
    password: "renter123",
    firstName: "Dawit",
    lastName: "Alemayehu",
    phone: "+251944444444",
    neighbourhood: "Merkato",
    role: "renter",
  },
  {
    id: "renter-2",
    email: "renter2@dashdrive.com",
    password: "renter123",
    firstName: "Hana",
    lastName: "Tesfaye",
    phone: "+251955555555",
    neighbourhood: "Piassa",
    role: "renter",
  },
];

// Hash every password first; scrypt is intentionally slow.
const prepared = await Promise.all(
  demoUsers.map(async (user) => ({
    ...user,
    passwordHash: await hashPassword(user.password),
  })),
);

if (databaseUrl) {
  await seedPostgres(prepared);
} else {
  seedSqlite(prepared);
}

function displayName(user) {
  return `${user.firstName} ${user.lastName}`.trim();
}

async function seedPostgres(users) {
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const table = await pool.query(
      `SELECT 1
         FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user'`,
    );

    if (table.rowCount === 0) {
      console.error(
        "The Postgres auth schema is missing. Run `npm run db:migrate` " +
          "(and `npm run db:migrate:admin`) against this database first.",
      );
      process.exitCode = 1;
      return;
    }

    for (const user of users) {
      const name = displayName(user);
      const now = new Date();
      const existing = await pool.query(
        'SELECT "id" FROM "user" WHERE "email" = $1',
        [user.email],
      );

      if (existing.rowCount > 0) {
        await pool.query(
          `UPDATE "user"
              SET "name" = $1, "firstName" = $2, "lastName" = $3,
                  "phone" = $4, "neighbourhood" = $5, "role" = $6,
                  "banned" = false, "banReason" = NULL, "banExpires" = NULL,
                  "updatedAt" = $7
            WHERE "id" = $8`,
          [
            name,
            user.firstName,
            user.lastName,
            user.phone,
            user.neighbourhood,
            user.role,
            now,
            existing.rows[0].id,
          ],
        );
        console.log(`updated ${user.email} (${user.role})`);
        continue;
      }

      await pool.query(
        `INSERT INTO "user"
           ("id", "name", "email", "emailVerified", "image", "createdAt",
            "updatedAt", "firstName", "lastName", "phone", "neighbourhood",
            "role", "banned")
         VALUES ($1, $2, $3, true, NULL, $4, $5, $6, $7, $8, $9, $10, false)`,
        [
          user.id,
          name,
          user.email,
          now,
          now,
          user.firstName,
          user.lastName,
          user.phone,
          user.neighbourhood,
          user.role,
        ],
      );
      await pool.query(
        `INSERT INTO "account"
           ("id", "accountId", "providerId", "userId", "accessToken",
            "refreshToken", "idToken", "accessTokenExpiresAt",
            "refreshTokenExpiresAt", "scope", "password", "createdAt",
            "updatedAt")
         VALUES ($1, $2, 'credential', $3, NULL, NULL, NULL, NULL, NULL,
                 NULL, $4, $5, $6)`,
        [
          randomBytes(16).toString("hex"),
          user.id,
          user.id,
          user.passwordHash,
          now,
          now,
        ],
      );
      console.log(`created ${user.email} (${user.role})`);
    }
  } finally {
    await pool.end();
  }
}

function seedSqlite(users) {
  if (!fs.existsSync(dbPath)) {
    console.error(
      `No auth database at ${dbPath}.\nStart the app once, or run the Better Auth migration, then retry.`,
    );
    process.exitCode = 1;
    return;
  }

  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  const findUser = db.prepare("SELECT id FROM user WHERE email = ?");
  const updateUser = db.prepare(
    `UPDATE user
        SET name = ?, firstName = ?, lastName = ?, phone = ?, neighbourhood = ?,
            role = ?, banned = 0, banReason = NULL, banExpires = NULL, updatedAt = ?
      WHERE id = ?`,
  );
  const insertUser = db.prepare(
    `INSERT INTO user
       (id, name, email, emailVerified, image, createdAt, updatedAt,
        firstName, lastName, phone, neighbourhood, role, banned)
     VALUES (?, ?, ?, 1, NULL, ?, ?, ?, ?, ?, ?, ?, 0)`,
  );
  const insertAccount = db.prepare(
    `INSERT INTO account
       (id, accountId, providerId, userId, accessToken, refreshToken, idToken,
        accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt)
     VALUES (?, ?, 'credential', ?, NULL, NULL, NULL, NULL, NULL, NULL, ?, ?, ?)`,
  );

  try {
    for (const user of users) {
      const name = displayName(user);
      const now = new Date().toISOString();
      const existing = findUser.get(user.email);

      if (existing) {
        updateUser.run(
          name,
          user.firstName,
          user.lastName,
          user.phone,
          user.neighbourhood,
          user.role,
          now,
          existing.id,
        );
        console.log(`updated ${user.email} (${user.role})`);
        continue;
      }

      insertUser.run(
        user.id,
        name,
        user.email,
        now,
        now,
        user.firstName,
        user.lastName,
        user.phone,
        user.neighbourhood,
        user.role,
      );
      insertAccount.run(
        randomBytes(16).toString("hex"),
        user.id,
        user.id,
        user.passwordHash,
        now,
        now,
      );
      console.log(`created ${user.email} (${user.role})`);
    }
  } finally {
    db.close();
  }
}

console.log("Demo accounts ready.");
