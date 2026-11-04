/**
 * Seeds the Better Auth database with the demo accounts advertised on the
 * sign-in screen. Safe to re-run: existing accounts are left in place (their
 * password is never reset) and only their directory fields are refreshed.
 *
 * The admin plugin owns `role` and the ban fields, so this script writes
 * `role` and clears `banned` / `banReason` / `banExpires` for demo accounts.
 *
 * Run with: npm run db:seed
 */
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { hashPassword } from "better-auth/crypto";

const dbPath =
  process.env.AUTH_DATABASE_PATH ?? path.join(process.cwd(), "data", "auth.db");

if (!fs.existsSync(dbPath)) {
  console.error(
    `No auth database at ${dbPath}.\nStart the app once, or run the Better Auth migration, then retry.`,
  );
  process.exit(1);
}

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

// better-sqlite3 transactions are synchronous, so hash every password first.
const prepared = await Promise.all(
  demoUsers.map(async (user) => ({
    ...user,
    passwordHash: await hashPassword(user.password),
  })),
);

for (const user of prepared) {
  const name = `${user.firstName} ${user.lastName}`.trim();
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


db.close();
console.log("Demo accounts ready.");
