"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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

  // Format price in Ethiopian Birr
  const formatPrice = (price: number) => {
    return `${price} ETB`;
  };

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Available Cars</h1>
          <p className="text-lg text-muted-foreground">Find the perfect ride for your journey</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm p-5 rounded-xl border border-border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="mb-4 text-center">
          <span className="font-semibold text-foreground">{filtered.length}</span> cars available
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(car => (
            <div key={car.id} className="bg-card rounded-xl shadow-sm overflow-hidden border border-border hover:shadow-md transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                {car.images && car.images.length > 0 ? (
                  <img
                    src={car.images[0]}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wider text-primary">{car.category}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{car.name}</h3>
                <div className="flex items-center text-muted-foreground mb-3">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{car.location.neighbourhood}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-2xl font-bold text-primary">{formatPrice(car.pricePerDay)}</span>
                    <span className="text-muted-foreground ml-1">/day</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <span>👥 {car.seats} seats</span>
                    <span>⚙️ {car.transmission}</span>
                  </div>
                </div>
                <Link href={`/cars/${car.id}`} className="w-full flex items-center justify-center py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
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