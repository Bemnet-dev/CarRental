"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { read, KEYS } from "@/lib/storage";
import Link from "next/link";

export default function Owner() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || !s.roles?.includes('owner')) { router.push('/signin'); return; }
    setSession(s);
    const allCars = read<any[]>(KEYS.CARS, []);
    setCars(allCars.filter(c => c.ownerId === s.userId));
    const allBookings = read<any[]>(KEYS.BOOKINGS, []);
    setBookings(allBookings.filter(b => b.ownerId === s.userId));
  }, [router]);

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <Link href="/owner/cars/new" className="bg-primary text-primary-foreground px-4 py-2 rounded">Add Car</Link>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded shadow"><p>Cars</p><p className="text-2xl font-bold">{cars.length}</p></div>
        <div className="bg-card p-4 rounded shadow"><p>Bookings</p><p className="text-2xl font-bold">{bookings.length}</p></div>
        <div className="bg-card p-4 rounded shadow"><p>Pending</p><p className="text-2xl font-bold">{bookings.filter(b=>b.status==='requested').length}</p></div>
      </div>
    </main>
  );
}
