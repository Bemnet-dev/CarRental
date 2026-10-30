"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Car as CarIcon,
  Check,
  CheckCircle2,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { BookingTable } from "@/components/dashboard/BookingTable";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { DistributionRow } from "@/components/dashboard/DistributionRow";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  getUser,
  updateCarStatus,
} from "@/lib/dashboard";

export function AdminOverview() {
  const { session, data } = useDashboard();
  const { users, cars, bookings } = data;

  const pendingCars = cars.filter((car) => car.status === "pending");
  const approvedCars = cars.filter((car) => car.status === "approved");
  const rejectedCars = cars.filter((car) => car.status === "rejected");
  const inactiveCars = cars.filter((car) => car.status === "inactive");

  const renters = users.filter((user) => user.role === "renter");
  const owners = users.filter((user) => user.role === "owner");
  const admins = users.filter((user) => user.role === "admin");
  const suspended = users.filter((user) => user.status === "suspended");

  const requested = bookings.filter(
    (booking) => booking.status === "requested",
  );
  const activeBookings = bookings.filter((booking) =>
    ["confirmed", "in_progress"].includes(booking.status),
  );
  const completed = bookings.filter(
    (booking) => booking.status === "completed",
  );
  const closed = bookings.filter((booking) =>
    ["cancelled", "declined"].includes(booking.status),
  );
  const revenue = bookings
    .filter((booking) =>
      ["confirmed", "in_progress", "completed"].includes(booking.status),
    )
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Platform overview"
        description={`Welcome back, ${session.firstName}. Monitor marketplace health, clear the review queue, and keep both sides of the marketplace moving.`}
        actions={
          <>
            <Button asChild>
              <Link href="/dashboard/listings">
                Review queue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/users">Manage users</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.length}
          hint={`${owners.length} owners · ${renters.length} renters`}
          icon={Users}
          tone="green"
        />
        <StatCard
          label="Active listings"
          value={approvedCars.length}
          hint={`${pendingCars.length} awaiting review`}
          icon={CarIcon}
          tone="amber"
        />
        <StatCard
          label="Total bookings"
          value={bookings.length}
          hint={`${requested.length} new requests`}
          icon={CalendarDays}
          tone="blue"
        />
        <StatCard
          label="Gross revenue"
          value={formatCurrency(revenue)}
          hint="Confirmed, active, and completed bookings"
          icon={Wallet}
          tone="ember"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Pending approvals"
          description="New listings waiting for a review decision."
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/listings">
                View fleet
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          }
        >
          {pendingCars.length > 0 ? (
            <div className="divide-y divide-border/60">
              {pendingCars.slice(0, 4).map((car) => {
                const owner = getUser(users, car.ownerId);

                return (
                  <div
                    key={car.id}
                    className="flex flex-wrap items-center gap-4 px-5 py-4"
                  >
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                      {car.images?.[0] ? (
                        <Image
                          src={car.images[0]}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <CarIcon className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {car.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {owner
                          ? `${owner.firstName} ${owner.lastName}`
                          : "Unknown owner"}{" "}
                        · {formatCurrency(car.pricePerDay)}/day
                      </p>
                    </div>
                    <StatusBadge status={car.status} />
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 px-2.5"
                        onClick={() => updateCarStatus(car.id, "approved")}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5 px-2.5 text-muted-foreground"
                        onClick={() => updateCarStatus(car.id, "rejected")}
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Review queue is clear"
              description="Every submitted listing has been reviewed. New submissions will appear here."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Platform mix"
          description="Users, fleet, and booking health."
        >
          <div className="space-y-5 p-5">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Users
              </p>
              <DistributionRow
                label="Renters"
                value={renters.length}
                total={users.length}
                tone="bg-emerald-500"
              />
              <DistributionRow
                label="Owners"
                value={owners.length}
                total={users.length}
                tone="bg-sky-500"
              />
              <DistributionRow
                label="Admins"
                value={admins.length}
                total={users.length}
                tone="bg-ember"
              />
              <DistributionRow
                label="Suspended"
                value={suspended.length}
                total={users.length}
                tone="bg-red-500"
              />
            </div>

            <div className="space-y-3 border-t border-border/70 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Fleet
              </p>
              <DistributionRow
                label="Approved"
                value={approvedCars.length}
                total={cars.length}
                tone="bg-emerald-500"
              />
              <DistributionRow
                label="Pending"
                value={pendingCars.length}
                total={cars.length}
                tone="bg-amber-500"
              />
              <DistributionRow
                label="Rejected / inactive"
                value={rejectedCars.length + inactiveCars.length}
                total={cars.length}
                tone="bg-clay"
              />
            </div>

            <div className="space-y-3 border-t border-border/70 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Bookings
              </p>
              <DistributionRow
                label="Requested"
                value={requested.length}
                total={bookings.length}
                tone="bg-amber-500"
              />
              <DistributionRow
                label="Active"
                value={activeBookings.length}
                total={bookings.length}
                tone="bg-sky-500"
              />
              <DistributionRow
                label="Completed"
                value={completed.length}
                total={bookings.length}
                tone="bg-emerald-500"
              />
              <DistributionRow
                label="Cancelled / declined"
                value={closed.length}
                total={bookings.length}
                tone="bg-red-500"
              />
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent bookings"
        description="The latest activity across the marketplace."
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/bookings">
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        }
      >
        <BookingTable
          bookings={bookings}
          cars={cars}
          users={users}
          role="admin"
          showActions
          compact
          limit={6}
          emptyTitle="No bookings yet"
          emptyDescription="Marketplace bookings will appear here once renters start requesting cars."
        />
      </SectionCard>
    </div>
  );
}
