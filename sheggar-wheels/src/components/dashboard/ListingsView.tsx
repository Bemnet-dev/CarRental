"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Car as CarIcon,
  Check,
  Compass,
  PlusCircle,
  Search,
  X,
} from "lucide-react";

import { CarCard } from "@/components/dashboard/CarCard";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatCurrency,
  formatDateTime,
  getUser,
  updateCarStatus,
} from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import type { Car as CarType, User } from "@/types";

type FilterValue = "all" | CarType["status"];

const filterLabels: Record<CarType["status"], string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  inactive: "Inactive",
};

export function ListingsView() {
  const { data } = useDashboard();
  const [filter, setFilter] = React.useState<FilterValue>("all");
  const [search, setSearch] = React.useState("");

  const cars = data.role === "admin" ? data.cars : data.myCars;
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = cars.filter((car) => {
    const matchesFilter = filter === "all" || car.status === filter;
    const haystack = [
      car.name,
      car.brand,
      car.model,
      car.category,
      car.location.neighbourhood,
    ]
      .join(" ")
      .toLowerCase();

    return matchesFilter && (!normalizedSearch || haystack.includes(normalizedSearch));
  });

  const approved = cars.filter((car) => car.status === "approved").length;
  const pending = cars.filter((car) => car.status === "pending").length;
  const rejected = cars.filter((car) => car.status === "rejected").length;
  const inactive = cars.filter((car) => car.status === "inactive").length;

  const availableStatuses = (
    Object.keys(filterLabels) as CarType["status"][]
  ).filter((status) => cars.some((car) => car.status === status));

  if (data.role === "renter") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Renter workspace"
          title="Listings"
          description="You are browsing as a renter. List a car to start earning from the marketplace."
          actions={
            <>
              <Button asChild>
                <Link href="/cars">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  Browse cars
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Become an owner</Link>
              </Button>
            </>
          }
        />
        <SectionCard title="Owner tools" description="Listing management is available to owner accounts.">
          <EmptyState
            icon={CarIcon}
            title="No listings on this account"
            description="Create an owner account to add your car, set a daily rate, and receive booking requests."
            action={
              <Button size="sm" asChild>
                <Link href="/signup">List your car</Link>
              </Button>
            }
          />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${data.role} workspace`}
        title={data.role === "admin" ? "Fleet" : "My listings"}
        description={
          data.role === "admin"
            ? "Review, approve, and monitor every car in the marketplace."
            : "Manage the cars you rent out, keep their details fresh, and track their status."
        }
        actions={
          data.role === "owner" ? (
            <>
              <Button asChild>
                <Link href="/owner/cars/new">
                  <PlusCircle className="h-4 w-4" aria-hidden="true" />
                  Add a car
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/cars">View marketplace</Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/cars">View marketplace</Link>
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total cars"
          value={cars.length}
          hint="All listings on this account"
          icon={CarIcon}
        />
        <StatCard
          label="Approved"
          value={approved}
          hint="Visible in the marketplace"
          icon={Check}
          tone="green"
        />
        <StatCard
          label="Pending"
          value={pending}
          hint="Waiting for an admin review"
          icon={Search}
          tone="amber"
        />
        <StatCard
          label={data.role === "admin" ? "Rejected" : "Inactive"}
          value={data.role === "admin" ? rejected : inactive}
          hint={
            data.role === "admin"
              ? "Listings that did not pass review"
              : "Listings hidden from renters"
          }
          icon={X}
          tone={data.role === "admin" ? "blue" : "default"}
        />
      </div>

      <SectionCard
        title="Fleet inventory"
        description="Search and filter the listings in this view."
        contentClassName="p-5"
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by car, brand, or area"
              className="pl-9"
              aria-label="Search listings"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            <FilterButton
              active={filter === "all"}
              label="All"
              count={cars.length}
              onClick={() => setFilter("all")}
            />
            {availableStatuses.map((status) => (
              <FilterButton
                key={status}
                active={filter === status}
                label={filterLabels[status]}
                count={cars.filter((car) => car.status === status).length}
                onClick={() => setFilter(status)}
              />
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border">
            <EmptyState
              icon={CarIcon}
              title={
                cars.length === 0
                  ? "No cars in this fleet yet"
                  : "No cars match this view"
              }
              description={
                cars.length === 0
                  ? data.role === "admin"
                    ? "No listings have been submitted to the marketplace yet."
                    : "Add your first car to start receiving booking requests from renters."
                  : "Try a different search or status filter, or add a new car to your fleet."
              }
              action={
                data.role === "owner" ? (
                  <Button size="sm" asChild>
                    <Link href="/owner/cars/new">Add a car</Link>
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : data.role === "admin" ? (
          <AdminFleetTable cars={filtered} users={data.users} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                footer={
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={car.status} />
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/cars/${car.id}`}>View</Link>
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function AdminFleetTable({
  cars,
  users,
}: {
  cars: CarType[];
  users: User[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-secondary/40 text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-4 py-3 font-medium">Vehicle</th>
            <th className="px-4 py-3 font-medium">Owner</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 text-right font-medium">Rate</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => {
            const owner = getUser(users, car.ownerId);

            return (
              <tr
                key={car.id}
                className="border-b border-border/60 align-middle last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
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
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {car.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {car.location.neighbourhood}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">
                    {owner
                      ? `${owner.firstName} ${owner.lastName}`
                      : "Unknown owner"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {owner?.email ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {car.category}
                </td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  {formatCurrency(car.pricePerDay)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={car.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(car.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <CarActions car={car} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CarActions({ car }: { car: CarType }) {
  if (car.status === "pending") {
    return (
      <div className="flex justify-end gap-1.5">
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
    );
  }

  if (car.status === "approved") {
    return (
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2.5 text-muted-foreground"
          onClick={() => updateCarStatus(car.id, "inactive")}
        >
          Set inactive
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button
        size="sm"
        variant="outline"
        className="h-8 px-2.5"
        onClick={() => updateCarStatus(car.id, "approved")}
      >
        Approve
      </Button>
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
