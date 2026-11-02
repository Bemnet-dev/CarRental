"use client";

import {
  toAppSession,
  toDirectoryUser,
  type AuthUserShape,
} from "@/lib/app-session";
import { authClient } from "@/lib/auth-client";
import type { Session } from "@/lib/dashboard";
import { KEYS, read, write } from "@/lib/storage";
import type { User } from "@/types";

export type AuthResult =
  | { success: true; session: Session }
  | { success: false; message: string };

export type ProfileResult = { success: true } | { success: false; message: string };

export type SignUpInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  neighbourhood?: string;
};

type AuthErrorLike = {
  status?: number;
  message?: string;
  code?: string;
} | null;

/**
 * Better Auth errors are already user-safe, but a few codes deserve wording
 * that matches the rest of this UI. Never surface raw status codes.
 */
function authMessage(error: AuthErrorLike, fallback: string) {
  if (!error) return fallback;

  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Invalid credentials";
    case "USER_ALREADY_EXISTS":
      return "That email already has an account. Try signing in instead.";
    case "PASSWORD_TOO_SHORT":
    case "PASSWORD_TOO_LONG":
      return "Use a password with at least 10 characters.";
    case "INVALID_EMAIL":
      return "That doesn't look like an email address.";
    case "BANNED_USER":
      return "This account is suspended.";
    case "TOO_MANY_REQUESTS":
      return "Too many attempts. Wait a minute and try again.";
    case "INVALID_ORIGIN":
      return "This site isn't allowed to sign in right now.";
  }

  if (error.status === 429) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (error.status === 401) return "Invalid credentials";

  return error.message || fallback;
}

/**
 * Keep the localStorage directory (used for car ownership, booking history and
 * the admin user list) in sync with the authoritative auth record.
 */
function mirrorDirectoryUser(user: AuthUserShape) {
  if (typeof window === "undefined") return;

  const users = read<User[]>(KEYS.USERS, []);
  const next = toDirectoryUser(user);
  const index = users.findIndex(
    (entry) => entry.id === user.id || entry.email === user.email,
  );

  if (index === -1) {
    write(KEYS.USERS, [...users, next]);
    return;
  }

  users[index] = {
    ...users[index],
    ...next,
    createdAt: users[index].createdAt || next.createdAt,
  };
  write(KEYS.USERS, users);
}

export async function getSession(): Promise<Session | null> {
  try {
    const { data } = await authClient.getSession();
    const user = data?.user as AuthUserShape | undefined;
    if (user) mirrorDirectoryUser(user);
    return toAppSession({ user });
  } catch {
    return null;
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data, error } = await authClient.signIn.email({ email, password });

  if (error) {
    return {
      success: false,
      message: authMessage(error, "Those details don't match an account."),
    };
  }

  const user = data?.user as AuthUserShape | undefined;
  const session = toAppSession({ user });

  if (!session) {
    return {
      success: false,
      message: "Sign-in succeeded but the session could not be read. Try again.",
    };
  }

  if (user) mirrorDirectoryUser(user);
  return { success: true, session };
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const name =
    `${input.firstName} ${input.lastName}`.trim() ||
    input.email.split("@")[0];

  const { data, error } = await authClient.signUp.email({
    email: input.email,
    password: input.password,
    name,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    neighbourhood: input.neighbourhood ?? "",
  });

  if (error) {
    return {
      success: false,
      message: authMessage(error, "Could not create your account."),
    };
  }

  const user = data?.user as AuthUserShape | undefined;
  const session = toAppSession({ user });

  if (!session) {
    return {
      success: false,
      message: "Your account was created. Sign in to continue.",
    };
  }

  if (user) mirrorDirectoryUser(user);
  return { success: true, session };
}

export async function updateProfile(
  data: Pick<User, "firstName" | "lastName" | "phone" | "neighbourhood">,
): Promise<ProfileResult> {
  const name = `${data.firstName} ${data.lastName}`.trim();

  const { error } = await authClient.updateUser({
    name,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    neighbourhood: data.neighbourhood ?? "",
  });

  if (error) {
    return {
      success: false,
      message: authMessage(error, "Could not save your profile."),
    };
  }

  return { success: true };
}

export async function signOut(): Promise<void> {
  try {
    await authClient.signOut();
  } catch {
    // An expired session still counts as signed out.
  } finally {
    // Drop the pre-Better-Auth session key if one is still around.
    if (typeof window !== "undefined") localStorage.removeItem(KEYS.SESSION);
  }
}

export function safeReturn(url: string | null) {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return "/";
  return url;
}
