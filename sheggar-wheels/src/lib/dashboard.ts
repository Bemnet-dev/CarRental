import { Booking, BookingStatus, Car, User, UserRole } from "@/types";
import { KEYS, read, write } from "@/lib/storage";

export type Session = {
  userId: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  firstName: string;
  lastName: string;
};

export const DATA_CHANGED_EVENT = "sw:data-changed";

export function primaryRole(session: Session): UserRole {
  if (session.roles.includes("admin")) return "admin";
  if (session.roles.includes("owner")) return "owner";
  return "renter";
}

export function roleLabel(role: UserRole) {
  if (role === "admin") return "Administrator";
  if (role === "owner") return "Car owner";
  return "Renter";
}

export function roleShortLabel(role: UserRole) {
  if (role === "admin") return "Admin";
  if (role === "owner") return "Owner";
  return "Renter";
}

export function initials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "DD";
}

export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)} ETB`;
}

export function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type DashboardData = {
  role: UserRole;
  users: User[];
  cars: Car[];
  bookings: Booking[];
  myCars: Car[];
  myBookings: Booking[];
  currentUser: User | undefined;
};

export function loadDashboardData(session: Session): DashboardData {
  const role = primaryRole(session);
  const users = read<User[]>(KEYS.USERS, []);
  const cars = read<Car[]>(KEYS.CARS, []);
  const bookings = read<Booking[]>(KEYS.BOOKINGS, []);

  const myCars =
    role === "admin"
      ? cars
      : role === "owner"
        ? cars.filter((car) => car.ownerId === session.userId)
        : [];

  const myBookings =
    role === "admin"
      ? bookings
      : role === "owner"
        ? bookings.filter((booking) => booking.ownerId === session.userId)
        : bookings.filter((booking) => booking.renterId === session.userId);

  return {
    role,
    users,
    cars,
    bookings,
    myCars,
    myBookings,
    currentUser: users.find((user) => user.id === session.userId),
  };
}

/**
 * Server-render placeholder: localStorage is unreadable until hydration, so the
 * provider starts empty and fills in from the effect to avoid a mismatch.
 */
export function emptyDashboardData(session: Session): DashboardData {
  return {
    role: primaryRole(session),
    users: [],
    cars: [],
    bookings: [],
    myCars: [],
    myBookings: [],
    currentUser: undefined,
  };
}

export function getCar(cars: Car[], carId: string) {
  return cars.find((car) => car.id === carId);
}

export function getUser(users: User[], userId: string) {
  return users.find((user) => user.id === userId);
}

export function carLabel(cars: Car[], carId: string) {
  return getCar(cars, carId)?.name ?? "Removed vehicle";
}

export function emitDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
  }
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  const bookings = read<Booking[]>(KEYS.BOOKINGS, []);
  write(
    KEYS.BOOKINGS,
    bookings.map((booking) =>
      booking.id === id
        ? { ...booking, status, updatedAt: new Date().toISOString() }
        : booking,
    ),
  );
  emitDataChanged();
}

export function updateCarStatus(id: string, status: Car["status"]) {
  const cars = read<Car[]>(KEYS.CARS, []);
  write(
    KEYS.CARS,
    cars.map((car) => (car.id === id ? { ...car, status } : car)),
  );
  emitDataChanged();
}

export function updateUserStatus(id: string, status: User["status"]) {
  const users = read<User[]>(KEYS.USERS, []);
  write(
    KEYS.USERS,
    users.map((user) => (user.id === id ? { ...user, status } : user)),
  );
  emitDataChanged();
}

