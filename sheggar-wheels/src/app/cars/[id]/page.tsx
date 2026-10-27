"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Car } from "@/types";
import { read, KEYS } from "@/lib/storage";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default function CarDetail() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    setSession(getSession());
    const cars = read<Car[]>(KEYS.CARS, []);
    setCar(cars.find(c => c.id === params.id) || null);
  }, [params.id]);

  const book = () => {
    if (!session) return router.push(`/signin?next=/cars/${params.id}`);
    if (!session.roles?.includes('renter')) return alert('Only renters can book');
    router.push(`/checkout?carId=${params.id}`);
  };

  if (!car) return <div className="p-8">Car not found</div>;

  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/cars" className="text-blue-600">← Back</Link>
      <div className="mt-4 bg-white rounded shadow overflow-hidden">
        <img src={car.images[0]} alt={car.name} className="w-full h-64 object-cover" />
        <div className="p-6">
          <h1 className="text-3xl font-bold">{car.name}</h1>
          <p className="text-gray-600">{car.location.neighbourhood}</p>
          <p className="my-4">{car.description}</p>
          <p className="text-2xl font-bold text-blue-600">${car.pricePerDay}/day</p>
          <button onClick={book} className="mt-4 bg-blue-600 text-white px-6 py-3 rounded">Book Now</button>
        </div>
      </div>
    </main>
  );
}
