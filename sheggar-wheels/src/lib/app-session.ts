import type { Session } from "@/lib/dashboard";
import type { User, UserRole } from "@/types";

/**
 * Pure mapping between the Better Auth user record and the app's session /
 * directory shapes. No I/O, so it is safe to use from server layouts.
 */

export type AuthUserShape = {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  neighbourhood?: string | null;
  role?: string | null;
  /** Owned by the Better Auth admin plugin. */
  banned?: boolean | null;
  createdAt?: Date | string | null;
};

export type AuthSessionShape =
  | { user?: AuthUserShape | null }
  | null
  | undefined;

const ROLES = ["renter", "owner", "admin"] as const;

export function asRole(value: unknown): UserRole {
  return ROLES.includes(value as (typeof ROLES)[number])
    ? (value as UserRole)
    : "renter";
}

function splitName(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const [firstName = "", ...rest] = parts;
  return { firstName, lastName: rest.join(" ") };
}

function toIso(value: Date | string | null | undefined) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }
  return new Date().toISOString();
}

export function toAppSession(payload: AuthSessionShape): Session | null {
  const user = payload?.user;
  if (!user?.id || !user.email) return null;

  const role = asRole(user.role);
  const fallback = splitName(user.name);

  return {
    userId: user.id,
    email: user.email,
    role,
    roles: [role],
    firstName: user.firstName?.trim() || fallback.firstName,
    lastName: user.lastName?.trim() || fallback.lastName,
  };
}

export function toDirectoryUser(user: AuthUserShape): User {
  const role = asRole(user.role);
  const fallback = splitName(user.name);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName?.trim() || fallback.firstName,
    lastName: user.lastName?.trim() || fallback.lastName,
    role,
    roles: [role],
    phone: user.phone ?? "",
    neighbourhood: user.neighbourhood ?? undefined,
    status: user.banned ? "suspended" : "active",
    createdAt: toIso(user.createdAt),
  };
}
