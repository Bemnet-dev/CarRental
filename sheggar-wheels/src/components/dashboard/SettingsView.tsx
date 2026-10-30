"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useDashboard } from "@/components/dashboard/dashboard-context";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { RoleBadge, StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signOut } from "@/lib/auth";
import {
  formatDateTime,
  initials,
  roleLabel,
  updateUserProfile,
} from "@/lib/dashboard";

export function SettingsView() {
  const router = useRouter();
  const { session, data, refreshSession } = useDashboard();
  const currentUser = data.currentUser;

  const [form, setForm] = React.useState({
    firstName: currentUser?.firstName ?? session.firstName,
    lastName: currentUser?.lastName ?? session.lastName,
    phone: currentUser?.phone ?? "",
    neighbourhood: currentUser?.neighbourhood ?? "",
  });
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (!currentUser) return;
    setForm({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      phone: currentUser.phone,
      neighbourhood: currentUser.neighbourhood ?? "",
    });
  }, [currentUser]);

  React.useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 3000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUserProfile(session.userId, form);
    refreshSession();
    setSaved(true);
  };

  const logout = () => {
    signOut();
    router.replace("/");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile & settings"
        description="Keep your contact details current so bookings and handovers run smoothly."
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to overview</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Profile details"
          description="This information is used on your bookings and listings."
          contentClassName="p-5"
        >
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(event) =>
                    setForm({ ...form, firstName: event.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(event) =>
                    setForm({ ...form, lastName: event.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentUser?.email ?? session.email}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Email changes are not available in this demo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighbourhood">Neighbourhood</Label>
                <Input
                  id="neighbourhood"
                  value={form.neighbourhood}
                  onChange={(event) =>
                    setForm({ ...form, neighbourhood: event.target.value })
                  }
                  placeholder="e.g. Bole"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
              <Button type="submit">Save changes</Button>
              <p
                aria-live="polite"
                className="text-sm text-emerald-700 dark:text-emerald-300"
              >
                {saved ? "Profile updated." : ""}
              </p>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Account" description="Your workspace identity.">
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ember/15 text-sm font-semibold text-clay">
                {initials(
                  currentUser?.firstName ?? session.firstName,
                  currentUser?.lastName ?? session.lastName,
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {currentUser
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : `${session.firstName} ${session.lastName}`}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentUser?.email ?? session.email}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-border/70 pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Role</span>
                <RoleBadge role={data.role} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={currentUser?.status ?? "active"} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Workspace</span>
                <span className="font-medium text-foreground">
                  {roleLabel(data.role)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium text-foreground">
                  {currentUser
                    ? formatDateTime(currentUser.createdAt)
                    : "—"}
                </span>
              </div>
            </div>

            <div className="border-t border-border/70 pt-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
