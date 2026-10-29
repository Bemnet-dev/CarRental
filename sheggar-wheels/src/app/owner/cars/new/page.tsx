"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { read, write, KEYS } from "@/lib/storage";

function formatPrice(price: number) {
  return `${price} ETB`;
}

export default function NewCar() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [data, setData] = useState({ name: '', brand: '', model: '', year: 2020, category: 'Economy', pricePerDay: 50, seats: 5, transmission: 'Automatic', fuelType: 'Petrol', description: '', neighbourhood: '', address: '', features: '' });

  useEffect(() => {
    const s = getSession();
    if (!s || !s.roles?.includes('owner')) { router.push('/signin'); return; }
    setSession(s);
  }, [router]);

  const submit = (e: any) => {
    e.preventDefault();
    if (!session) return;
    const car = {
      id: `car-${Date.now()}`,
      ownerId: session.userId,
      name: data.name,
      brand: data.brand,
      model: data.model,
      year: data.year,
      category: data.category,
      pricePerDay: data.pricePerDay,
      images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'],
      seats: data.seats,
      transmission: data.transmission,
      fuelType: data.fuelType,
      description: data.description,
      location: { neighbourhood: data.neighbourhood, address: data.address },
      features: data.features.split(',').map((f:any) => f.trim()).filter((f:any) => f),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const cars = read<any[]>(KEYS.CARS, []);
    cars.push(car);
    write(KEYS.CARS, cars);
    alert('Car submitted for approval');
    router.push('/owner');
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Add New Car</h1>
      <form onSubmit={submit} className="bg-card p-4 rounded shadow space-y-4">
        <input type="text" placeholder="Car Name" required value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full border p-2 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Brand" required value={data.brand} onChange={e => setData({...data, brand: e.target.value})} className="border p-2 rounded" />
          <input type="text" placeholder="Model" required value={data.model} onChange={e => setData({...data, model: e.target.value})} className="border p-2 rounded" />
        </div>
        <input type="number" placeholder="Year" value={data.year} onChange={e => setData({...data, year: parseInt(e.target.value)})} className="w-full border p-2 rounded" />
        <input type="number" placeholder="Price per day (ETB)" value={data.pricePerDay} onChange={e => setData({...data, pricePerDay: parseInt(e.target.value)})} className="w-full border p-2 rounded" />
        <input type="text" placeholder="Neighbourhood" required value={data.neighbourhood} onChange={e => setData({...data, neighbourhood: e.target.value})} className="w-full border p-2 rounded" />
        <input type="text" placeholder="Address" required value={data.address} onChange={e => setData({...data, address: e.target.value})} className="w-full border p-2 rounded" />
        <textarea placeholder="Description" value={data.description} onChange={e => setData({...data, description: e.target.value})} className="w-full border p-2 rounded" />
        <input type="text" placeholder="Features (comma separated)" value={data.features} onChange={e => setData({...data, features: e.target.value})} className="w-full border p-2 rounded" />
        <button className="w-full bg-primary text-primary-foreground p-2 rounded">Submit</button>
      </form>
    </main>
  );
}
