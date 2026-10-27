export type UserRole = 'renter' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roles: UserRole[];
  phone: string;
  status: 'active' | 'suspended';
  createdAt: string;
  neighbourhood?: string;
}

export interface Car {
  id: string;
  ownerId: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: 'Economy' | 'SUV' | 'Luxury' | 'Van' | 'Truck';
  pricePerDay: number;
  images: string[];
  seats: number;
  transmission: 'Manual' | 'Automatic';
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  description: string;
  location: { neighbourhood: string; address: string };
  features: string[];
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  createdAt: string;
}

export type BookingStatus = 'requested' | 'confirmed' | 'declined' | 'cancelled' | 'in_progress' | 'completed' | 'disputed' | 'resolved';

export interface Booking {
  id: string;
  carId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDaySnapshot: number;
  totalPrice: number;
  status: BookingStatus;
  pickupLocation: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  commission?: number;
}
