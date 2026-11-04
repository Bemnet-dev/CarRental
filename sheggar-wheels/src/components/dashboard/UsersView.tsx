"use client";

import * as React from "react";
import Link from "next/link";
import {
  Ban,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { useDashboard } from "@/components/dashboard/dashboard-context";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { RoleBadge, StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { formatDateTime } from "@/lib/dashboard";
import type { User, UserRole } from "@/types";

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | User["status"];

type Notice = { tone: "success" | "error"; text: string };

type UserActionResult = { error: { message?: string } | null };

const ROLE_OPTIONS: UserRole[] = ["renter", "owner", "admin"];

function displayName(user: User) {
  return (
    `${user.firstName} ${user.lastName}`.trim() || user.email || "This account"
  );
}

export function UsersView() {
  const {
    session,
    data,
    refreshDirectory,
    directoryStatus,
    directoryError,
  } = useDashboard();
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<Notice | null>(null);

  const runUserAction = React.useCallback(
    async (
      userId: string,
      action: () => Promise<UserActionResult>,
      successMessage: string,
    ) => {
      setPendingId(userId);
      setNotice(null);

      try {
        const { error } = await action();
        if (error) {
          setNotice({
            tone: "error",
            text: error.message || "The action could not be completed.",
          });
          return;
        }

        await refreshDirectory();
        setNotice({ tone: "success", text: successMessage });
      } catch {
        setNotice({
          tone: "error",
          text: "The action could not be completed. Check your connection and try again.",
        });
      } finally {
        setPendingId(null);
      }
    },
    [refreshDirectory],
  );

  if (data.role !== "admin") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Restricted area"
          title="Users"
          description="User management is available to administrators only."
        />
        <SectionCard title="Admin access required">
          <EmptyState
            icon={ShieldCheck}
            title="You do not have access to this page"
            description="Return to your dashboard to continue managing your bookings or listings."
            action={
              <Button size="sm" asChild>
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            }
          />
        </SectionCard>
      </div>
    );
  }

  const users = [...data.users].sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || ""),
  );
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = users.filter((user) => {
    const haystack = [
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      user.neighbourhood ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!normalizedSearch || haystack.includes(normalizedSearch)) &&
      (roleFilter === "all" || user.role === roleFilter) &&
      (statusFilter === "all" || user.status === statusFilter)
    );
  });

  const renters = users.filter((user) => user.role === "renter").length;
  const owners = users.filter((user) => user.role === "owner").length;
  const suspended = users.filter((user) => user.status === "suspended").length;
  const isLoading = directoryStatus === "loading";

  const handleToggleBan = (user: User) => {
    const isSuspended = user.status === "suspended";
    const name = displayName(user);

    return runUserAction(
      user.id,
      () =>
        isSuspended
          ? authClient.admin.unbanUser({ userId: user.id })
          : authClient.admin.banUser({
              userId: user.id,
              banReason: "Suspended by an administrator",
            }),
      isSuspended
        ? `${name} can sign in again.`
        : `${name} is suspended and has been signed out everywhere.`,
    );
  };

  const handleRoleChange = (user: User, role: UserRole) => {
    const article = role === "renter" ? "a" : "an";
    return runUserAction(
      user.id,
      () => authClient.admin.setRole({ userId: user.id, role }),
      `${displayName(user)} is now ${article} ${role}.`,
    );
  };

  const handleRevokeSessions = (user: User) =>
    runUserAction(
      user.id,
      () => authClient.admin.revokeUserSessions({ userId: user.id }),
      `${displayName(user)} has been signed out of every device.`,
    );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Users"
        description="Review the people on both sides of the marketplace and manage their Better Auth accounts."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => void refreshDirectory()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to overview</Link>
            </Button>
          </>
        }
      />

      {notice ? (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.length}
          hint="Renters, owners, and admins"
          icon={Users}
        />
        <StatCard
          label="Renters"
          value={renters}
          hint="Accounts booking cars"
          icon={UserRound}
          tone="green"
        />
        <StatCard
          label="Owners"
          value={owners}
          hint="Accounts listing cars"
          icon={ShieldCheck}
          tone="blue"
        />
        <StatCard
          label="Suspended"
          value={suspended}
          hint="Accounts without access"
          icon={Ban}
          tone="amber"
        />
      </div>

      <SectionCard
        title="All accounts"
        description="Accounts are read from Better Auth. Suspending an account blocks sign-in and revokes its active sessions."
        contentClassName="p-5"
      >
        {directoryError ? (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          >
            <span>{directoryError}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refreshDirectory()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users"
              className="pl-9"
              aria-label="Search users"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as RoleFilter)
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Filter by role"
            >
              <option value="all">All roles</option>
              <option value="renter">Renters</option>
              <option value="owner">Owners</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {isLoading && users.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading accounts from Better Auth…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border">
            <EmptyState
              icon={Users}
              title="No users match this view"
              description="Try a different search term or clear the role and status filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40 text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Neighbourhood</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const isSelf = user.id === session.userId;
                  const isPending = pendingId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-border/60 align-middle last:border-0"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                          {isSelf ? (
                            <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              You
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <RoleBadge role={user.role} />
                        ) : (
                          <select
                            value={user.role}
                            onChange={(event) =>
                              void handleRoleChange(
                                user,
                                event.target.value as UserRole,
                              )
                            }
                            disabled={isPending}
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
                            aria-label={`Role for ${displayName(user)}`}
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role[0].toUpperCase() + role.slice(1)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.phone}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.neighbourhood || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">
                            Current account
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 gap-1.5 px-2.5 text-muted-foreground"
                              onClick={() => void handleRevokeSessions(user)}
                              disabled={isPending}
                              title={`Sign ${displayName(user)} out of every device`}
                            >
                              <LogOut
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              <span className="hidden xl:inline">Sign out</span>
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                user.status === "active" ? "ghost" : "outline"
                              }
                              className="h-8 gap-1.5 px-2.5"
                              onClick={() => void handleToggleBan(user)}
                              disabled={isPending}
                            >
                              {isPending ? (
                                <Loader2
                                  className="h-3.5 w-3.5 animate-spin"
                                  aria-hidden="true"
                                />
                              ) : user.status === "active" ? (
                                <Ban
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ShieldCheck
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              )}
                              {user.status === "active"
                                ? "Suspend"
                                : "Reactivate"}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
