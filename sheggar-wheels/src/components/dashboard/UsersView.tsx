"use client";

import * as React from "react";
import Link from "next/link";
import {
  Ban,
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
import { formatDateTime, updateUserStatus } from "@/lib/dashboard";
import type { User, UserRole } from "@/types";

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | User["status"];

export function UsersView() {
  const { session, data } = useDashboard();
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

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

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = data.users.filter((user) => {
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

  const renters = data.users.filter((user) => user.role === "renter").length;
  const owners = data.users.filter((user) => user.role === "owner").length;
  const suspended = data.users.filter(
    (user) => user.status === "suspended",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Users"
        description="Review the people on both sides of the marketplace and manage account access."
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to overview</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={data.users.length}
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
        description="Search by name, email, phone, or neighbourhood."
        contentClassName="p-5"
      >
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

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border">
            <EmptyState
              icon={Users}
              title="No users match this view"
              description="Try a different search term or clear the role and status filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40 text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Neighbourhood</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const isSelf = user.id === session.userId;

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
                        <RoleBadge role={user.role} />
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
                          <Button
                            size="sm"
                            variant={
                              user.status === "active" ? "ghost" : "outline"
                            }
                            className="h-8 px-2.5"
                            onClick={() =>
                              updateUserStatus(
                                user.id,
                                user.status === "active"
                                  ? "suspended"
                                  : "active",
                              )
                            }
                          >
                            {user.status === "active" ? "Suspend" : "Reactivate"}
                          </Button>
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
