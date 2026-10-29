"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { read, KEYS } from "@/lib/storage";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || !s.roles?.includes('renter')) { router.push('/signin'); return; }
    setSession(s);
    const all = read<any[]>(KEYS.BOOKINGS, []);
    setBookings(all.filter(b => b.renterId === s.userId));
  }, [router]);

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
      <div className="bg-card rounded shadow">
        <div className="p-4 border-b"><h2 className="text-xl">My Bookings</h2></div>
        <table className="w-full">
          <thead className="bg-secondary">
            <tr><th className="p-4 text-left">Booking ID</th><th className="p-4 text-left">Dates</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Total</th></tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-t">
                <td className="p-4">{b.id.slice(-6)}</td>
                <td className="p-4">{b.startDate} to {b.endDate}</td>
                <td className="p-4">{b.status}</td>
                <td className="p-4">${b.totalPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="p-4 text-center">No bookings. <Link href="/cars" className="text-primary">Browse cars</Link></p>}
      </div>
    </main>
  );
}
