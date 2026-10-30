"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Inbox,
} from "lucide-react";

import { BookingTable } from "@/components/dashboard/BookingTable";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";

type FilterValue = "all" | BookingStatus;

const filterLabels: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
  in_progress: "In progress",
  completed: "Completed",
  disputed: "Disputed",
  resolved: "Resolved",
};

export function BookingsView() {
  const { data } = useDashboard();
  const [filter, setFilter] = React.useState<FilterValue>("all");
  const bookings = data.myBookings;

  const requested = bookings.filter(
    (booking) => booking.status === "requested",
  ).length;
  const active = bookings.filter((booking) =>
    ["confirmed", "in_progress"].includes(booking.status),
  ).length;
  const completed = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  const availableStatuses = (
    Object.keys(filterLabels) as BookingStatus[]
  ).filter((status) => bookings.some((booking) => booking.status === status));

  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  const title =
    data.role === "owner"
      ? "Booking requests"
      : data.role === "renter"
        ? "My bookings"
        : "Bookings";

  const description =
    data.role === "owner"
      ? "Confirm or decline incoming requests and keep track of every trip on your cars."
      : data.role === "renter"
        ? "Every request and trip in one place, from pickup details to final status."
        : "All marketplace bookings with renter, owner, status, and value.";

  const actions =
    data.role === "renter" ? (
      <Button asChild>
        <Link href="/cars">
          <Compass className="h-4 w-4" aria-hidden="true" />
          Browse cars
        </Link>
      </Button>
    ) : data.role === "owner" ? (
      <Button asChild>
        <Link href="/dashboard/listings">My listings</Link>
      </Button>
    ) : (
      <Button asChild>
        <Link href="/dashboard/listings">Review fleet</Link>
      </Button>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${data.role} workspace`}
        title={title}
        description={description}
        actions={actions}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total bookings"
          value={bookings.length}
          hint="All time"
          icon={CalendarDays}
        />
        <StatCard
          label="Awaiting response"
          value={requested}
          hint="Requests that need attention"
          icon={Inbox}
          tone="amber"
        />
        <StatCard
          label="Active trips"
          value={active}
          hint="Confirmed or currently on the road"
          icon={Clock3}
          tone="blue"
        />
        <StatCard
          label="Completed"
          value={completed}
          hint="Finished trips"
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      <SectionCard
        title="Booking timeline"
        description="Filter by status to focus on what needs action."
        contentClassName="p-5"
      >
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <FilterButton
            active={filter === "all"}
            label="All"
            count={bookings.length}
            onClick={() => setFilter("all")}
          />
          {availableStatuses.map((status) => (
            <FilterButton
              key={status}
              active={filter === status}
              label={filterLabels[status]}
              count={bookings.filter((booking) => booking.status === status).length}
              onClick={() => setFilter(status)}
            />
          ))}
        </div>
        <div className="-mx-5 -mb-5 border-t border-border/70">
          <BookingTable
            bookings={filtered}
            cars={data.cars}
            users={data.users}
            role={data.role}
            showActions
            emptyTitle="No bookings in this view"
            emptyDescription="Try a different status filter or browse the fleet to start a new booking."
          />
        </div>
      </SectionCard>
    </div>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {label}
      <span className="tabular-nums opacity-70">{count}</span>
    </button>
  );
}
