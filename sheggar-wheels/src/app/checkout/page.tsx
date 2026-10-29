"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { read, write, KEYS } from "@/lib/storage";
import { Car, Booking } from "@/types";

function Checkout() {
  const router = useRouter();
  const params = useSearchParams();
  const carId = params.get('carId');
  const [session, setSession] = useState<any>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [data, setData] = useState({ startDate: '', endDate: '', pickupLocation: '' });

  useEffect(() => {
    const s = getSession();
    if (!s || !s.roles?.includes('renter')) { router.push('/signin'); return; }
    setSession(s);
    const cars = read<Car[]>(KEYS.CARS, []);
    setCar(cars.find(c => c.id === carId) || null);
  }, [carId, router]);

  const submit = (e: any) => {
    e.preventDefault();
    if (!car || !session) return;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (86400000));
    if (days <= 0) return alert('Invalid dates');
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      carId: car.id,
      renterId: session.userId,
      ownerId: car.ownerId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: days,
      pricePerDaySnapshot: car.pricePerDay,
      totalPrice: days * car.pricePerDay,
      status: 'requested',
      pickupLocation: data.pickupLocation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commission: days * car.pricePerDay * 0.1
    };
    const bookings = read<Booking[]>(KEYS.BOOKINGS, []);
    bookings.push(booking);
    write(KEYS.BOOKINGS, bookings);
    alert('Booking requested! Mock payment: TeleBirr');
    router.push('/dashboard');
  };

  if (!car) return <div className="p-8">Car not found</div>;

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="bg-card p-4 rounded shadow mb-4">
        <p className="font-semibold">{car.name}</p>
        <p>${car.pricePerDay}/day</p>
      </div>
      <form onSubmit={submit} className="bg-card p-4 rounded shadow space-y-4">
        <input type="date" required value={data.startDate} onChange={e => setData({...data, startDate: e.target.value})} className="w-full border p-2 rounded" />
        <input type="date" required value={data.endDate} onChange={e => setData({...data, endDate: e.target.value})} className="w-full border p-2 rounded" />
        <input type="text" placeholder="Pickup Location" required value={data.pickupLocation} onChange={e => setData({...data, pickupLocation: e.target.value})} className="w-full border p-2 rounded" />
        <button className="w-full bg-primary text-primary-foreground p-2 rounded">Request Booking</button>
      </form>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense><Checkout /></Suspense>;
}
