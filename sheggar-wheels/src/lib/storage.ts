import { User, Car, Booking } from '@/types';

const KEYS = {
  USERS: 'sw_users_v1',
  CARS: 'sw_cars_v1',
  BOOKINGS: 'sw_bookings_v1',
  SESSION: 'sw_session_v1'
};

export function read<T>(key: string, def: T): T {
  if (typeof window === 'undefined') return def;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : def;
  } catch {
    return def;
  }
}

export function write<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export function initData() {
  if (typeof window === 'undefined') return;
  if (read(KEYS.USERS, []).length > 0) return;

  const users: User[] = [
    { id: 'admin-1', email: 'admin@sheggar.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin', roles: ['admin'], phone: '+251911111111', status: 'active', createdAt: new Date().toISOString() },
    { id: 'owner-1', email: 'owner1@sheggar.com', password: 'owner123', firstName: 'Tadesse', lastName: 'Bekele', role: 'owner', roles: ['owner'], phone: '+251922222222', status: 'active', createdAt: new Date().toISOString(), neighbourhood: 'Bole' },
    { id: 'owner-2', email: 'owner2@sheggar.com', password: 'owner123', firstName: 'Sara', lastName: 'Mohammed', role: 'owner', roles: ['owner'], phone: '+251933333333', status: 'active', createdAt: new Date().toISOString(), neighbourhood: 'Kazanchis' },
    { id: 'renter-1', email: 'renter1@sheggar.com', password: 'renter123', firstName: 'Dawit', lastName: 'Alemayehu', role: 'renter', roles: ['renter'], phone: '+251944444444', status: 'active', createdAt: new Date().toISOString(), neighbourhood: 'Merkato' },
  ];

  const cars: Car[] = [
    { id: 'car-1', ownerId: 'owner-1', name: 'Toyota Corolla 2020', brand: 'Toyota', model: 'Corolla', year: 2020, category: 'Economy', pricePerDay: 45, images: ['https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800'], seats: 5, transmission: 'Automatic', fuelType: 'Petrol', description: 'Reliable and fuel-efficient sedan', location: { neighbourhood: 'Bole', address: 'Bole Road' }, features: ['Air Conditioning', 'Bluetooth'], status: 'approved', createdAt: new Date().toISOString() },
    { id: 'car-2', ownerId: 'owner-1', name: 'Honda CR-V 2021', brand: 'Honda', model: 'CR-V', year: 2021, category: 'SUV', pricePerDay: 75, images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'], seats: 5, transmission: 'Automatic', fuelType: 'Petrol', description: 'Spacious SUV for families', location: { neighbourhood: 'Bole', address: 'Bole Road' }, features: ['4WD', 'Bluetooth'], status: 'approved', createdAt: new Date().toISOString() },
    { id: 'car-3', ownerId: 'owner-2', name: 'BMW 3 Series 2022', brand: 'BMW', model: '3 Series', year: 2022, category: 'Luxury', pricePerDay: 120, images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'], seats: 5, transmission: 'Automatic', fuelType: 'Petrol', description: 'Premium luxury sedan', location: { neighbourhood: 'Kazanchis', address: 'Kazanchis' }, features: ['Leather Seats', 'GPS'], status: 'approved', createdAt: new Date().toISOString() },
    { id: 'car-4', ownerId: 'owner-2', name: 'Nissan Sentra 2019', brand: 'Nissan', model: 'Sentra', year: 2019, category: 'Economy', pricePerDay: 40, images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'], seats: 5, transmission: 'Manual', fuelType: 'Petrol', description: 'Budget-friendly compact car', location: { neighbourhood: 'Kazanchis', address: 'Kazanchis' }, features: ['Air Conditioning'], status: 'approved', createdAt: new Date().toISOString() },
    { id: 'car-5', ownerId: 'owner-1', name: 'Toyota RAV4 2021', brand: 'Toyota', model: 'RAV4', year: 2021, category: 'SUV', pricePerDay: 80, images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'], seats: 5, transmission: 'Automatic', fuelType: 'Hybrid', description: 'Hybrid SUV', location: { neighbourhood: 'Bole', address: 'Bole Road' }, features: ['Hybrid', 'Backup Camera'], status: 'approved', createdAt: new Date().toISOString() },
    { id: 'car-6', ownerId: 'owner-2', name: 'Mercedes C-Class 2023', brand: 'Mercedes', model: 'C-Class', year: 2023, category: 'Luxury', pricePerDay: 150, images: ['https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=800'], seats: 5, transmission: 'Automatic', fuelType: 'Petrol', description: 'Elegant luxury car', location: { neighbourhood: 'Piassa', address: 'Piassa' }, features: ['Leather Seats', 'Sunroof'], status: 'approved', createdAt: new Date().toISOString() },
    { id: 'car-7', ownerId: 'owner-1', name: 'Hyundai Tucson 2020', brand: 'Hyundai', model: 'Tucson', year: 2020, category: 'SUV', pricePerDay: 70, images: ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800'], seats: 5, transmission: 'Automatic', fuelType: 'Petrol', description: 'Comfortable SUV', location: { neighbourhood: 'Merkato', address: 'Merkato' }, features: ['Air Conditioning'], status: 'approved', createdAt: new Date().toISOString() },
    { id: 'car-8', ownerId: 'owner-2', name: 'VW Golf 2021', brand: 'Volkswagen', model: 'Golf', year: 2021, category: 'Economy', pricePerDay: 50, images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'], seats: 5, transmission: 'Manual', fuelType: 'Petrol', description: 'Sporty hatchback', location: { neighbourhood: 'Piassa', address: 'Piassa' }, features: ['Bluetooth'], status: 'approved', createdAt: new Date().toISOString() },
  ];

  write(KEYS.USERS, users);
  write(KEYS.CARS, cars);
  write(KEYS.BOOKINGS, []);
}

export { KEYS };
