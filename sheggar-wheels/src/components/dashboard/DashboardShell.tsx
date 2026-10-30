"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Compass, LogOut } from "lucide-react";

import { DashboardProvider, useDashboard } from "@/components/dashboard/dashboard-context";
import { getNavGroups, type NavItem } from "@/components/dashboard/nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession, signOut } from "@/lib/auth";
import {
  initials,
  normalizeSession,
  primaryRole,
  roleShortLabel,
  type Session,
} from "@/lib/dashboard";
import { initData } from "@/lib/storage";
import type { UserRole } from "@/types";

export function DashboardShell({
  defaultOpen = true,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    initData();
    const next = normalizeSession(getSession());

    if (!next) {
      router.replace(
        `/signin?next=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    setSession(next);
    setLoading(false);
  }, [router]);

  if (loading || !session) {
    return <DashboardLoading />;
  }

  return (
    <DashboardProvider initialSession={session}>
      <DashboardFrame defaultOpen={defaultOpen}>{children}</DashboardFrame>
    </DashboardProvider>
  );
}

function DashboardFrame({
  defaultOpen,
  children,
}: {
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, data } = useDashboard();
  const role = primaryRole(session);
  const navGroups = getNavGroups(role, data);
  const pageTitle = getPageTitle(pathname, role);

  const logout = () => {
    signOut();
    router.replace("/");
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                tooltip="Sheggar Wheels"
                className="gap-3"
              >
                <Link href="/dashboard">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                    SW
                  </span>
                  <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      Sheggar Wheels
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/60">
                      {roleShortLabel(role)} workspace
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = isNavActive(pathname, item);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          className="relative pl-3 data-[active=true]:before:absolute data-[active=true]:before:bottom-1.5 data-[active=true]:before:left-0 data-[active=true]:before:top-1.5 data-[active=true]:before:w-0.5 data-[active=true]:before:rounded-full data-[active=true]:before:bg-sidebar-primary"
                        >
                          <Link href={item.href}>
                            <item.icon aria-hidden="true" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {typeof item.badge === "number" && item.badge > 0 ? (
                          <SidebarMenuBadge className="bg-sidebar-primary/15 text-sidebar-primary">
                            {item.badge}
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <SidebarSeparator className="mx-0" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                tooltip="Profile & settings"
                className="gap-3"
              >
                <Link href="/dashboard/settings">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                    {initials(session.firstName, session.lastName)}
                  </span>
                  <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-medium text-sidebar-foreground">
                      {session.firstName} {session.lastName}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/60">
                      {session.email}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign out"
                onClick={logout}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <LogOut aria-hidden="true" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {roleShortLabel(role)} workspace
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {pageTitle}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/cars">
                <Compass className="h-4 w-4" aria-hidden="true" />
                Browse cars
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" aria-label="Back to the marketplace">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">View site</span>
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function isNavActive(pathname: string, item: NavItem) {
  if (item.href === "/cars" || item.href.startsWith("/#")) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function getPageTitle(pathname: string, role: UserRole) {
  if (pathname === "/dashboard") return "Overview";
  if (pathname === "/dashboard/bookings") {
    if (role === "owner") return "Booking requests";
    if (role === "renter") return "My bookings";
    return "Bookings";
  }
  if (pathname === "/dashboard/listings") {
    if (role === "admin") return "Fleet";
    if (role === "owner") return "My listings";
    return "Listings";
  }
  if (pathname === "/dashboard/users") return "Users";
  if (pathname === "/dashboard/settings") return "Profile & settings";
  if (pathname === "/owner/cars/new") return "Add a car";
  return "Workspace";
}

function DashboardLoading() {
  return (
    <div className="flex min-h-svh bg-background">
      <div className="hidden w-64 shrink-0 bg-sidebar md:block" />
      <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
