"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Car as CarIcon,
  Inbox,
  PlusCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { BookingTable } from "@/components/dashboard/BookingTable";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/dashboard";

export function OwnerOverview() {
  const { session, data } = useDashboard();
  const cars = data.myCars;
  const bookings = data.myBookings;

  const activeListings = cars.filter((car) => car.status === "approved");
  const requests = bookings.filter(
    (booking) => booking.status === "requested",
  );
  const revenue = bookings
    .filter((booking) =>
      ["confirmed", "in_progress", "completed"].includes(booking.status),
    )
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  const averageRate = activeListings.length
    ? Math.round(
        activeListings.reduce((sum, car) => sum + car.pricePerDay, 0) /
          activeListings.length,
      )
    : 0;

  const fleetPerformance = cars
    .map((car) => {
      const carBookings = bookings.filter(
        (booking) => booking.carId === car.id,
      );
      const carRevenue = carBookings
        .filter((booking) =>
          ["confirmed", "in_progress", "completed"].includes(booking.status),
        )
        .reduce((sum, booking) => sum + booking.totalPrice, 0);

      return { car, bookings: carBookings.length, revenue: carRevenue };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Owner workspace"
        title={`Welcome back, ${session.firstName}`}
        description="Keep your fleet moving, respond to requests, and track what your cars earn."
        actions={
          <>
            <Button asChild>
              <Link href="/owner/cars/new">
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Add a car
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/listings">My listings</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active listings"
          value={activeListings.length}
          hint={`${cars.length} total cars in your fleet`}
          icon={CarIcon}
          tone="green"
        />
        <StatCard
          label="Booking requests"
          value={requests.length}
          hint="Requests waiting for your response"
          icon={Inbox}
          tone="amber"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(revenue)}
          hint="Confirmed, active, and completed bookings"
          icon={Wallet}
          tone="ember"
        />
        <StatCard
          label="Average daily rate"
          value={formatCurrency(averageRate)}
          hint="Across your approved listings"
          icon={TrendingUp}
          tone="blue"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Booking requests"
          description="Respond quickly to keep your calendar full."
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
            cars={data.cars}
            users={data.users}
            role="owner"
            showActions
            compact
            limit={5}
            emptyTitle="No booking requests yet"
            emptyDescription="When a renter requests one of your cars, it will show up here for you to confirm or decline."
          />
        </SectionCard>

        <SectionCard
          title="Your fleet"
          description="A quick view of your listings."
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/listings">Manage</Link>
            </Button>
          }
        >
          {cars.length > 0 ? (
            <div className="divide-y divide-border/60">
              {cars.slice(0, 4).map((car) => {
                const bookingCount = bookings.filter(
                  (booking) => booking.carId === car.id,
                ).length;

                return (
                  <Link
                    key={car.id}
                    href={`/cars/${car.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/40"
                  >
                    <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                      {car.images?.[0] ? (
                        <Image
                          src={car.images[0]}
                          alt=""
                          fill
                          sizes="56px"
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
                        {formatCurrency(car.pricePerDay)}/day · {bookingCount}{" "}
                        {bookingCount === 1 ? "booking" : "bookings"}
                      </p>
                    </div>
                    <StatusBadge status={car.status} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CarIcon}
              title="No cars listed"
              description="Add your first car to start receiving booking requests from renters."
              action={
                <Button size="sm" asChild>
                  <Link href="/owner/cars/new">Add a car</Link>
                </Button>
              }
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Fleet performance"
        description="Bookings and revenue by vehicle."
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/listings">
              All listings
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        }
      >
        {fleetPerformance.length > 0 ? (
          <div className="divide-y divide-border/60">
            {fleetPerformance.map(({ car, bookings: count, revenue: earned }) => (
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
                    {car.category} · {formatCurrency(car.pricePerDay)}/day
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {count} {count === 1 ? "booking" : "bookings"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatCurrency(earned)} earned
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No performance data yet"
            description="Once your cars start receiving bookings, revenue and booking counts will appear here."
          />
        )}
      </SectionCard>
    </div>
  );
}
