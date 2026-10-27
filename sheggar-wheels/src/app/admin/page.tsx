"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { read, KEYS } from "@/lib/storage";

export default function Admin() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || !s.roles?.includes('admin')) { router.push('/signin'); return; }
    setUsers(read<any[]>(KEYS.USERS, []));
    setCars(read<any[]>(KEYS.CARS, []));
    setBookings(read<any[]>(KEYS.BOOKINGS, []));
  }, [router]);

  const revenue = bookings.reduce((sum, b) => sum + (b.commission || 0), 0);

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow"><p>Users</p><p className="text-2xl font-bold">{users.length}</p></div>
        <div className="bg-white p-4 rounded shadow"><p>Cars</p><p className="text-2xl font-bold">{cars.length}</p></div>
        <div className="bg-white p-4 rounded shadow"><p>Bookings</p><p className="text-2xl font-bold">{bookings.length}</p></div>
        <div className="bg-white p-4 rounded shadow"><p>Revenue</p><p className="text-2xl font-bold">${revenue}</p></div>
      </div>
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b"><h2>Pending Cars</h2></div>
        {cars.filter(c => c.status === 'pending').map(c => <div key={c.id} className="p-4 border-t">{c.name} - ${c.pricePerDay}/day</div>)}
      </div>
    </main>
  );
}
