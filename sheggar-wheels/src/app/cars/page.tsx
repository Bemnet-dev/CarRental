"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Car } from "@/types";
import { read, initData, KEYS } from "@/lib/storage";

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filtered, setFiltered] = useState<Car[]>([]);
  const [filters, setFilters] = useState({ search: '', neighbourhood: '', category: '', sort: 'price-asc' });

  useEffect(() => {
    initData();
    const all = read<Car[]>(KEYS.CARS, []).filter(c => c.status === 'approved');
    setCars(all);
    const params = new URLSearchParams(window.location.search);
    const neighbourhood = params.get('neighbourhood') ?? '';
    const category = params.get('category') ?? '';
    if (neighbourhood || category) {
      setFilters(current => ({ ...current, neighbourhood, category }));
    }
  }, []);

  useEffect(() => {
    let res = [...cars];
    if (filters.search) res = res.filter(c => c.name.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.neighbourhood) res = res.filter(c => c.location.neighbourhood === filters.neighbourhood);
    if (filters.category) res = res.filter(c => c.category === filters.category);
    if (filters.sort === 'price-asc') res.sort((a,b) => a.pricePerDay - b.pricePerDay);
    if (filters.sort === 'price-desc') res.sort((a,b) => b.pricePerDay - a.pricePerDay);
    setFiltered(res);
  }, [filters, cars]);

  const neighbourhoods = Array.from(new Set(cars.map(c => c.location.neighbourhood)));

  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary/60 to-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Available Cars</h1>
          <p className="text-xl text-muted-foreground">Find the perfect ride for your journey</p>
        </div>
        
        <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search cars..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all" />
            </div>
            <select value={filters.neighbourhood} onChange={e => setFilters({...filters, neighbourhood: e.target.value})} className="px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
              <option value="">All Locations</option>
              {neighbourhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
              <option value="">All Categories</option>
              <option value="Economy">Economy</option>
              <option value="SUV">SUV</option>
              <option value="Luxury">Luxury</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
            </select>
            <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})} className="px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6 text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span> cars available
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(car => (
            <div key={car.id} className="group bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-border">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={car.images[0]}
                  alt={car.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary">{car.category}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">{car.name}</h3>
                <div className="flex items-center text-muted-foreground mb-3">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{car.location.neighbourhood}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-primary">${car.pricePerDay}</span>
                    <span className="text-muted-foreground ml-1">/day</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>👥 {car.seats}</span>
                    <span>⚙️ {car.transmission}</span>
                  </div>
                </div>
                <Link href={`/cars/${car.id}`} className="w-full block text-center bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
