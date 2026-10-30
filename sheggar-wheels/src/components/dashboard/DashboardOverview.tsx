"use client";

import { AdminOverview } from "@/components/dashboard/AdminOverview";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { OwnerOverview } from "@/components/dashboard/OwnerOverview";
import { RenterOverview } from "@/components/dashboard/RenterOverview";

export function DashboardOverview() {
  const { data } = useDashboard();

  if (data.role === "admin") return <AdminOverview />;
  if (data.role === "owner") return <OwnerOverview />;
  return <RenterOverview />;
}
