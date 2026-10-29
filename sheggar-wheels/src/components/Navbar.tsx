"use client";
import { useEffect, useState } from "react";
import {
  Car,
  Compass,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Leaf,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import { getSession, signOut } from "@/lib/auth";
import { initData } from "@/lib/storage";
import { Navbar1, type MenuItem } from "@/components/ui/shadcnblocks-com-navbar1";

type Session = {
  firstName: string;
  roles: string[];
} | null;

const menu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Browse Cars", url: "/cars" },
  {
    title: "Fleet",
    url: "/cars",
    items: [
      {
        title: "Economy",
        description: "Budget-friendly compacts from ETB 40/day",
        icon: <Gauge className="size-5 shrink-0" />,
        url: "/cars?category=Economy",
      },
      {
        title: "SUV",
        description: "Spacious vehicles for families and groups",
        icon: <Car className="size-5 shrink-0" />,
        url: "/cars?category=SUV",
      },
      {
        title: "Luxury",
        description: "Premium rides for special occasions",
        icon: <Sparkles className="size-5 shrink-0" />,
        url: "/cars?category=Luxury",
      },
      {
        title: "Hybrid",
        description: "Efficient hybrids and electrics",
        icon: <Leaf className="size-5 shrink-0" />,
        url: "/cars?fuelType=Hybrid",
      },
    ],
  },
  {
    title: "Renters",
    url: "/cars",
    items: [
      {
        title: "How it works",
        description: "Book in three simple steps",
        icon: <Compass className="size-5 shrink-0" />,
        url: "/#how",
      },
      {
        title: "Browse cars",
        description: "Explore cars near you across Addis Ababa",
        icon: <Car className="size-5 shrink-0" />,
        url: "/cars",
      },
      {
        title: "My dashboard",
        description: "Manage your bookings and requests",
        icon: <LayoutDashboard className="size-5 shrink-0" />,
        url: "/dashboard",
      },
    ],
  },
  {
    title: "Owners",
    url: "/signup",
    items: [
      {
        title: "List your car",
        description: "Earn from your car when you are not driving",
        icon: <Wallet className="size-5 shrink-0" />,
        url: "/signup",
      },
      {
        title: "Owner portal",
        description: "Track earnings, bookings and listings",
        icon: <KeyRound className="size-5 shrink-0" />,
        url: "/owner",
      },
      {
        title: "Verified community",
        description: "Every owner and renter is ID-verified",
        icon: <ShieldCheck className="size-5 shrink-0" />,
        url: "/#how",
      },
    ],
  },
];

const mobileExtraLinks = [
  { name: "How it works", url: "/#how" },
  { name: "Browse cars", url: "/cars" },
  { name: "List your car", url: "/signup" },
  { name: "Sign in", url: "/signin" },
];

export function Navbar() {
  const [session, setSession] = useState<Session>(null);
  useEffect(() => {
    initData();
    setSession(getSession());
  }, []);

  const logout = () => {
    signOut();
    setSession(null);
    window.location.href = "/";
  };

  const isRenter = !!session?.roles?.includes("renter");
  const isOwner = !!session?.roles?.includes("owner");
  const isAdmin = !!session?.roles?.includes("admin");

  const auth = session
    ? {
        login: {
          text: isRenter ? "My Dashboard" : isOwner ? "Owner Portal" : isAdmin ? "Admin" : "Dashboard",
          url: isRenter ? "/dashboard" : isOwner ? "/owner" : isAdmin ? "/admin" : "/dashboard",
        },
        signup: { text: `Sign Out (${session.firstName})`, url: "/", onClick: logout },
      }
    : {
        login: { text: "Sign In", url: "/signin" },
        signup: { text: "Get Started", url: "/signup" },
      };

  const logo = {
    url: "/",
    alt: "Sheggar Wheels",
    title: "Sheggar Wheels",
    mark: <span className="text-sm font-bold">SW</span>,
  };

  return (
    <div className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Navbar1
          logo={logo}
          menu={menu}
          mobileExtraLinks={mobileExtraLinks}
          auth={auth}
        />
      </div>
    </div>
  );
}
