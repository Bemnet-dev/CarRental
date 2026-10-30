"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  CarFront,
  Compass,
  Wallet,
} from "lucide-react";

import { BookingTable } from "@/components/dashboard/BookingTable";
import { CarCard } from "@/components/dashboard/CarCard";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDate,
  getCar,
} from "@/lib/dashboard";

export function RenterOverview() {
  const { session, data } = useDashboard();
  const bookings = data.myBookings;
  const today = new Date().toISOString().slice(0, 10);

  const active = bookings.filter((booking) =>
    ["confirmed", "in_progress"].includes(booking.status),
  );
  const upcoming = bookings
    .filter(
      (booking) =>
        ["requested", "confirmed"].includes(booking.status) &&
        booking.startDate >= today,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const completed = bookings.filter(
    (booking) => booking.status === "completed",
  );
  const totalSpent = bookings
    .filter((booking) => !["cancelled", "declined"].includes(booking.status))
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  const nextTrip = upcoming[0];
  const nextCar = nextTrip ? getCar(data.cars, nextTrip.carId) : undefined;
  const recommended = data.cars
    .filter((car) => car.status === "approved")
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Renter workspace"
        title={`Welcome back, ${session.firstName}`}
        description="Track your trips, manage requests, and find your next car across Addis Ababa."
        actions={
          <>
            <Button asChild>
              <Link href="/cars">
                <Compass className="h-4 w-4" aria-hidden="true" />
                Browse cars
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/bookings">My bookings</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active bookings"
          value={active.length}
          hint="Confirmed or currently on the road"
          icon={CalendarCheck2}
          tone="green"
        />
        <StatCard
          label="Upcoming trips"
          value={upcoming.length}
          hint="Requests and confirmed trips starting soon"
          icon={CalendarDays}
          tone="blue"
        />
        <StatCard
          label="Completed trips"
          value={completed.length}
          hint="Trips you have finished"
          icon={CarFront}
        />
        <StatCard
          label="Total spent"
          value={formatCurrency(totalSpent)}
          hint="Across active and completed bookings"
          icon={Wallet}
          tone="ember"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Recent bookings"
          description="Your latest requests and trips."
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
            role="renter"
            showActions
            compact
            limit={5}
            emptyTitle="No bookings yet"
            emptyDescription="When you request a car, the booking will appear here with its status and pickup details."
          />
        </SectionCard>

        <SectionCard
          title="Your next trip"
          description="The closest confirmed or requested booking."
        >
          {nextTrip ? (
            <div>
              {nextCar?.images?.[0] ? (
                <div className="relative aspect-[16/9] bg-secondary">
                  <Image
                    src={nextCar.images[0]}
                    alt={nextCar.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-secondary text-muted-foreground">
                  <CarFront className="h-8 w-8" aria-hidden="true" />
                </div>
              )}
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {nextCar?.name ?? "Your next car"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {nextCar?.location.neighbourhood ?? "Addis Ababa"}
                    </p>
                  </div>
                  <StatusBadge status={nextTrip.status} />
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      Pickup
                    </dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {formatDate(nextTrip.startDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      Return
                    </dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {formatDate(nextTrip.endDate)}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      Pickup location
                    </dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {nextTrip.pickupLocation || "To be confirmed"}
                    </dd>
                  </div>
                </dl>
                <div className="flex items-center justify-between border-t border-border/70 pt-4">
                  <span className="text-xs text-muted-foreground">
                    {nextTrip.totalDays}{" "}
                    {nextTrip.totalDays === 1 ? "day" : "days"}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(nextTrip.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming trips"
              description="Your next adventure starts with a car. Browse the fleet and send a booking request."
              action={
                <Button size="sm" asChild>
                  <Link href="/cars">Browse cars</Link>
                </Button>
              }
            />
          )}
        </SectionCard>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Cars near you
            </h2>
            <p className="text-sm text-muted-foreground">
              Approved vehicles ready to book across Addis Ababa.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cars">
              See all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recommended.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>
    </div>
  );
}
