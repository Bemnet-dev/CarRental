"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { read, KEYS } from "@/lib/storage";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
}

interface Car {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
}

interface Booking {
  id: string;
  carId: string;
  status: string;
  totalPrice: number;
}

export default function Admin() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || !s.roles?.includes('admin')) { router.push('/signin'); return; }
    setUsers(read<User[]>(KEYS.USERS, []));
    setCars(read<Car[]>(KEYS.CARS, []));
    setBookings(read<Booking[]>(KEYS.BOOKINGS, []));
  }, [router]);

  // Format price in Ethiopian Birr
  const formatPrice = (price: number) => {
    return `${price} ETB`;
  };

  const revenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          <span>ETB {formatPrice(revenue)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-5 rounded-xl shadow-sm border transition-colors hover:shadow-md">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Users</p>
          <p className="text-3xl font-bold text-foreground mt-1">{users.length}</p>
        </div>
        <div className="bg-card p-5 rounded-xl shadow-sm border transition-colors hover:shadow-md">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Cars</p>
          <p className="text-3xl font-bold text-foreground mt-1">{cars.length}</p>
        </div>
        <div className="bg-card p-5 rounded-xl shadow-sm border transition-colors hover:shadow-md">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Bookings</p>
          <p className="text-3xl font-bold text-foreground mt-1">{bookings.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Pending Cars</p>
          <div className="mt-3">
            {cars.filter(c => c.status === 'pending').map(c => (
              <div key={c.id} className="p-4 border rounded-md flex items-center justify-between">
                <span className="text-foreground">{c.name}</span>
                <span className="text-sm text-muted-foreground">{formatPrice(c.pricePerDay)}/day</span>
              </div>
            )) || <p className="text-muted-foreground text-sm">No pending cars</p>}
          </div>
        </div>
        <div className="bg-card p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Approved Cars</p>
          <div className="mt-3">
            {cars.filter(c => c.status === 'approved').map(c => (
              <div key={c.id} className="p-4 border rounded-md flex items-center justify-between">
                <span className="text-foreground">{c.name}</span>
                <span className="text-sm text-primary">{formatPrice(c.pricePerDay)}/day</span>
              </div>
            )) || <p className="text-muted-foreground text-sm">No approved cars</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Revenue</p>
          <p className="text-2xl font-bold text-foreground mt-1">ETB {revenue}</p>
        </div>
        {/* Additional stats can be added here */}
      </div>
    </main>
  );
}