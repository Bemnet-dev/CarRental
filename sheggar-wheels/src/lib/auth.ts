import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { authRoles } from "@/lib/auth-roles";

/**
 * Server-side Better Auth instance.
 *
 * Sessions live in SQLite (`data/auth.db`) and are delivered as httpOnly
 * cookies, so no credential or token is ever readable by page JavaScript.
 * Only the dashboard data directory (cars, bookings, demo users) still lives
 * in localStorage.
 */

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

/**
 * Prefer an explicit env secret. Without one, generate a random secret and
 * keep it next to the database so dev/demo builds stay reproducible without a
 * hardcoded fallback in source.
 */
function resolveSecret() {
  const fromEnv = process.env.BETTER_AUTH_SECRET;
  if (fromEnv) return fromEnv;

  const secretFile = path.join(dataDir, "auth.secret");
  if (fs.existsSync(secretFile)) {
    const saved = fs.readFileSync(secretFile, "utf8").trim();
    if (saved) return saved;
  }

  const generated = randomBytes(32).toString("hex");
  fs.writeFileSync(secretFile, generated, { mode: 0o600 });
  return generated;
}

function resolveTrustedOrigins() {
  const fromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const localOrigins =
    process.env.NODE_ENV === "production"
      ? []
      : [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          // Port used by the local verification runs.
          "http://localhost:3100",
          "http://127.0.0.1:3100",
        ];

  return [process.env.BETTER_AUTH_URL ?? "", ...fromEnv, ...localOrigins].filter(
    Boolean,
  );
}

const globalForAuth = globalThis as typeof globalThis & {
  __dashdriveAuth?: ReturnType<typeof createAuth>;
  __dashdriveDb?: Database.Database;
};

function openDatabase() {
  const file =
    process.env.AUTH_DATABASE_PATH ?? path.join(dataDir, "auth.db");
  const database = new Database(file);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  return database;
}

// One connection per process; dev HMR reloads reuse the cached handle.
const db = globalForAuth.__dashdriveDb ?? openDatabase();
if (process.env.NODE_ENV !== "production") globalForAuth.__dashdriveDb = db;

function createAuth() {
  return betterAuth({
    database: db,
    secret: resolveSecret(),
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: resolveTrustedOrigins(),
    emailAndPassword: {
      enabled: true,
      // The sign-in form advertises this floor and enforces it client-side.
      minPasswordLength: 10,
      autoSignIn: true,
    },
    user: {
      additionalFields: {
        firstName: { type: "string", required: true, input: true },
        lastName: { type: "string", required: false, input: true },
        phone: { type: "string", required: false, input: true },
        neighbourhood: { type: "string", required: false, input: true },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 10 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    plugins: [
      /**
       * Self-hosted user management. The admin plugin owns `role` and the
       * `banned` / `banReason` / `banExpires` fields, and exposes the
       * `/admin/*` endpoints that the dashboard Users page calls.
       *
       * `adminRoles` is the set of roles allowed to call those endpoints;
       * `defaultRole` matches the marketplace's default account type.
       */
      admin({
        roles: authRoles,
        defaultRole: "renter",
        adminRoles: ["admin"],
        defaultBanReason: "Suspended by an administrator",
      }),
      // Must stay last so Better Auth can set cookies from route handlers.
      nextCookies(),
    ],
  });
}

export const auth = globalForAuth.__dashdriveAuth ?? createAuth();
if (process.env.NODE_ENV !== "production") globalForAuth.__dashdriveAuth = auth;
