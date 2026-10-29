"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { read, KEYS } from "@/lib/storage";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Car {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  status: string;
}

interface Booking {
  id: string;
  carId: string;
  status: string;
  totalPrice: number;
}

export default function Owner() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || !s.roles?.includes('owner')) { router.push('/signin'); return; }
    setSession(s);
    const allCars = read<any[]>(KEYS.CARS, []);
    setCars(allCars.filter(c => c.ownerId === s.userId));
    const allBookings = read<any[]>(KEYS.BOOKINGS, []);
    setBookings(allBookings.filter(b => b.ownerId === s.userId));
  }, [router]);

  // Format price in Ethiopian Birr
  const formatPrice = (price: number) => {
    return `${price} ETB`;
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Owner Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-bg ember text-sm font-bold text-ink">U</span>
          <span className="text-sm text-muted-foreground">Welcome, {session?.firstName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-5 rounded-xl shadow-sm border transition-colors hover:shadow-md">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Cars</p>
          <p className="text-3xl font-bold text-foreground mt-1">{cars.length}</p>
        </div>
        <div className="bg-card p-5 rounded-xl shadow-sm border transition-colors hover:shadow-md">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Bookings</p>
          <p className="text-3xl font-bold text-foreground mt-1">{bookings.length}</p>
        </div>
        <div className="bg-card p-5 rounded-xl shadow-sm border transition-colors hover:shadow-md">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-bold text-foreground mt-1">{bookings.filter(b=>b.status==='requested').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">My Cars Revenue</p>
          <p className="text-2xl font-bold text-foreground mt-1">ETB {bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)}</p>
        </div>
        <div className="bg-card p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Active Bookings</p>
          <p className="text-2xl font-bold text-foreground mt-1">{bookings.filter(b=>b.status==='confirmed' || b.status==='in_progress').length}</p>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/owner/cars/new" className="inline-flex items-center gap-2 px-4 py-2 bg-ember text-sand rounded-md text-sm font-medium hover:bg-ember/90 transition-colors">
          Add New Car
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </Link>
      </div>
    </main>
  );
}