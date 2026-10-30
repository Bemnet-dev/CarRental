"use client";

import { CalendarDays, Check, X } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  carLabel,
  formatCurrency,
  formatShortDate,
  getUser,
  updateBookingStatus,
} from "@/lib/dashboard";
import type { Booking, Car, User, UserRole } from "@/types";

export function BookingTable({
  bookings,
  cars,
  users,
  role,
  showActions = false,
  compact = false,
  limit,
  emptyTitle = "No bookings yet",
  emptyDescription = "Bookings will appear here as soon as a request is made.",
}: {
  bookings: Booking[];
  cars: Car[];
  users: User[];
  role: UserRole;
  showActions?: boolean;
  compact?: boolean;
  limit?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const head = compact ? "px-3 py-2.5" : "px-5 py-3";
  const cell = compact ? "px-3 py-3" : "px-5 py-4";
  const showOwner = role !== "owner" && !(compact && role === "admin");

  const rows = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit ?? bookings.length);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className={
          compact
            ? "w-full min-w-[640px] text-sm"
            : "w-full min-w-[760px] text-sm"
        }
      >
        <thead>
          <tr className="border-b border-border/70 bg-secondary/40 text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <th className={`${head} font-medium`}>Vehicle</th>
            {role !== "renter" ? (
              <th className={`${head} font-medium`}>Renter</th>
            ) : null}
            {showOwner ? (
              <th className={`${head} font-medium`}>Owner</th>
            ) : null}
            <th className={`${head} font-medium`}>Dates</th>
            <th className={`${head} font-medium`}>Status</th>
            <th className={`${head} text-right font-medium`}>Total</th>
            {showActions ? (
              <th className={`${head} text-right font-medium`}>Action</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((booking) => {
            const renter = getUser(users, booking.renterId);
            const owner = getUser(users, booking.ownerId);

            return (
              <tr
                key={booking.id}
                className="border-b border-border/60 align-top last:border-0"
              >
                <td className={cell}>
                  <p className="font-medium text-foreground">
                    {carLabel(cars, booking.carId)}
                  </p>
                  {compact ? null : (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {booking.pickupLocation || "Pickup to be confirmed"}
                    </p>
                  )}
                </td>
                {role !== "renter" ? (
                  <td className={cell}>
                    <p className="font-medium text-foreground">
                      {renter
                        ? `${renter.firstName} ${renter.lastName}`
                        : "Unknown renter"}
                    </p>
                    {compact ? null : (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {renter?.email ?? "—"}
                      </p>
                    )}
                  </td>
                ) : null}
                {showOwner ? (
                  <td className={cell}>
                    <p className="font-medium text-foreground">
                      {owner
                        ? `${owner.firstName} ${owner.lastName}`
                        : "Unknown owner"}
                    </p>
                    {compact ? null : (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {owner?.email ?? "—"}
                      </p>
                    )}
                  </td>
                ) : null}
                <td className={cell}>
                  <p className="font-medium text-foreground">
                    {formatShortDate(booking.startDate)} –{" "}
                    {formatShortDate(booking.endDate)}
                  </p>
                  {compact ? null : (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {booking.totalDays}{" "}
                      {booking.totalDays === 1 ? "day" : "days"}
                    </p>
                  )}
                </td>
                <td className={cell}>
                  <StatusBadge status={booking.status} />
                </td>
                <td className={`${cell} text-right font-medium text-foreground`}>
                  {formatCurrency(booking.totalPrice)}
                </td>
                {showActions ? (
                  <td className={cell}>
                    <BookingActions
                      booking={booking}
                      role={role}
                      compact={compact}
                    />
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BookingActions({
  booking,
  role,
  compact = false,
}: {
  booking: Booking;
  role: UserRole;
  compact?: boolean;
}) {
  const confirmClass = compact
    ? "h-8 w-8 p-0"
    : "h-8 gap-1.5 px-2.5";
  const ghostClass = compact
    ? "h-8 w-8 p-0 text-muted-foreground"
    : "h-8 gap-1.5 px-2.5 text-muted-foreground";

  if (role === "owner" && booking.status === "requested") {
    return (
      <div className="flex justify-end gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className={confirmClass}
          aria-label="Confirm booking"
          onClick={() => updateBookingStatus(booking.id, "confirmed")}
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          {compact ? null : "Confirm"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={ghostClass}
          aria-label="Decline booking"
          onClick={() => updateBookingStatus(booking.id, "declined")}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          {compact ? null : "Decline"}
        </Button>
      </div>
    );
  }

  if (
    role === "renter" &&
    ["requested", "confirmed"].includes(booking.status)
  ) {
    return (
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          className={ghostClass}
          aria-label="Cancel booking"
          onClick={() => updateBookingStatus(booking.id, "cancelled")}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          {compact ? null : "Cancel"}
        </Button>
      </div>
    );
  }

  if (role === "admin" && booking.status === "disputed") {
    return (
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className={confirmClass}
          aria-label="Resolve dispute"
          onClick={() => updateBookingStatus(booking.id, "resolved")}
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          {compact ? null : "Resolve"}
        </Button>
      </div>
    );
  }

  return <p className="text-right text-xs text-muted-foreground">—</p>;
}
