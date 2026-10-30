import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Car,
  Compass,
  Inbox,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";

import type { DashboardData } from "@/lib/dashboard";
import type { UserRole } from "@/types";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  exact?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export function getNavGroups(
  role: UserRole,
  data: DashboardData,
): NavGroup[] {
  const activeBookings = data.myBookings.filter((booking) =>
    ["requested", "confirmed", "in_progress"].includes(booking.status),
  ).length;

  const requestedBookings = data.myBookings.filter(
    (booking) => booking.status === "requested",
  ).length;

  const pendingCars = data.cars.filter((car) => car.status === "pending").length;

  if (role === "admin") {
    return [
      {
        label: "Workspace",
        items: [
          {
            title: "Overview",
            href: "/dashboard",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            title: "Bookings",
            href: "/dashboard/bookings",
            icon: CalendarDays,
          },
          {
            title: "Fleet",
            href: "/dashboard/listings",
            icon: Car,
            badge: pendingCars,
          },
          {
            title: "Users",
            href: "/dashboard/users",
            icon: Users,
          },
        ],
      },
      {
        label: "Marketplace",
        items: [
          {
            title: "Browse cars",
            href: "/cars",
            icon: Compass,
          },
        ],
      },
      {
        label: "Account",
        items: [
          {
            title: "Profile & settings",
            href: "/dashboard/settings",
            icon: Settings,
          },
        ],
      },
    ];
  }

  if (role === "owner") {
    return [
      {
        label: "Workspace",
        items: [
          {
            title: "Overview",
            href: "/dashboard",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            title: "Booking requests",
            href: "/dashboard/bookings",
            icon: Inbox,
            badge: requestedBookings,
          },
          {
            title: "My listings",
            href: "/dashboard/listings",
            icon: Car,
          },
        ],
      },
      {
        label: "Manage",
        items: [
          {
            title: "Add a car",
            href: "/owner/cars/new",
            icon: PlusCircle,
          },
          {
            title: "Browse marketplace",
            href: "/cars",
            icon: Compass,
          },
        ],
      },
      {
        label: "Account",
        items: [
          {
            title: "Profile & settings",
            href: "/dashboard/settings",
            icon: Settings,
          },
        ],
      },
    ];
  }

  return [
    {
      label: "Workspace",
      items: [
        {
          title: "Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          title: "My bookings",
          href: "/dashboard/bookings",
          icon: CalendarDays,
          badge: activeBookings,
        },
      ],
    },
    {
      label: "Discover",
      items: [
        {
          title: "Browse cars",
          href: "/cars",
          icon: Compass,
        },
        {
          title: "How it works",
          href: "/#how",
          icon: Inbox,
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          title: "Profile & settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ];
}
