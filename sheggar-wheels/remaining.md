# Sheggar Wheels — Complete Remaining Implementation Plan (`remaining.md`)

This document details every single missing and partial component, route, helper, business rule, and documentation requirement identified during the capstone audit. It serves as the definitive specification for completing the project against its brief.

---

## 1. Directory Structure & Route Organization

### 1.1 Route Groups and Nested Layouts
Organize the App Router into four distinct route groups with dedicated navigation sidebars and layouts:
- `src/app/(public)/` — Shared public navigation with Browse Cars, Sign In, Sign Up.
- `src/app/(renter)/` — Renter portal layout with sub-navigation: Dashboard, Bookings, Active Trips.
- `src/app/(owner)/` — Host portal layout with sub-navigation: Overview, My Fleet, Earnings, Reviews, Disputes.
- `src/app/(admin)/` — Admin portal layout with sub-navigation: Overview, Listings, Users, Bookings, Disputes, Reports, Announcements.

### 1.2 Missing Routes to Create

#### Renter Routes:
1. `src/app/(renter)/bookings/page.tsx` — List of all reservations with tabbed filtering (`All`, `Active`, `Completed`, `Cancelled`), status badges, and direct links to booking details.
2. `src/app/(renter)/bookings/[id]/page.tsx` — Detailed reservation view displaying car card, rental dates, pickup address, itemized price breakdown (ETB), current status, and allowed actions (Cancel, Track, Review, Dispute).
3. `src/app/(renter)/bookings/[id]/track/page.tsx` — Client-only simulated GPS tracking view showing pickup spot, live simulation marker, journey progress, and clear "Simulation" notice with non-map address fallback.
4. `src/app/(renter)/bookings/[id]/review/page.tsx` — 1-time review submission form (1–5 star rating + text comment) unlocked strictly when status is `completed`.

#### Owner Routes:
5. `src/app/(owner)/owner/cars/page.tsx` — Fleet management table showing all host vehicles, approval status (`approved`, `pending`, `rejected`, `inactive`), daily rates, and action links.
6. `src/app/(owner)/owner/cars/[id]/edit/page.tsx` — Vehicle editing form (price per day, description, features, neighbourhood), protected by ownership check (`car.ownerId === session.userId`).
7. `src/app/(owner)/owner/cars/[id]/availability/page.tsx` — Host blackout calendar to block out dates when the car is unavailable.
8. `src/app/(owner)/owner/cars/[id]/bookings/page.tsx` — Filtered reservation queue specifically for this vehicle.
9. `src/app/(owner)/owner/earnings/page.tsx` — Revenue analytics with Recharts monthly income bar/line chart, accessible data table, total payout calculations, and CSV export.
10. `src/app/(owner)/owner/reviews/page.tsx` — Customer reviews table with an owner reply form (one response per review).
11. `src/app/(owner)/owner/disputes/page.tsx` — Incident reporting and claims center for rental damage or late return issues.

#### Admin Routes:
12. `src/app/(admin)/admin/listings/page.tsx` — Listing moderation queue with "Approve" and "Reject" buttons for submitted cars.
13. `src/app/(admin)/admin/users/page.tsx` — User management directory with search, role inspection, and "Suspend" / "Reinstate" toggle buttons.
14. `src/app/(admin)/admin/users/[id]/page.tsx` — Detailed user activity inspect view (rental history, host listings, account status).
15. `src/app/(admin)/admin/bookings/page.tsx` — Platform-wide booking ledger with status filtering and override tools.
16. `src/app/(admin)/admin/disputes/page.tsx` — Open claims queue.
17. `src/app/(admin)/admin/disputes/[id]/page.tsx` — Dispute resolution workbench with resolution notes, refund determination, and "Resolve" action.
18. `src/app/(admin)/admin/reports/page.tsx` — Platform GMV, 10% commission fee accumulation, monthly metrics, and CSV financial export.
19. `src/app/(admin)/admin/announcements/page.tsx` — System-wide banner announcement manager (create, toggle active, expire).

---

## 2. Data Model & Storage Refactoring

### 2.1 Type Definitions (`src/types/index.ts`)
Add missing entities and expand existing interfaces:
- **`Review`**:
  ```ts
  export interface Review {
    id: string;
    bookingId: string;
    carId: string;
    renterId: string;
    renterName: string;
    rating: number; // 1-5
    comment: string;
    ownerReply?: string;
    createdAt: string;
  }
  ```
- **`Dispute`**:
  ```ts
  export interface Dispute {
    id: string;
    bookingId: string;
    carId: string;
    renterId: string;
    ownerId: string;
    openedByRole: 'renter' | 'owner';
    reason: string;
    status: 'open' | 'resolved';
    adminNotes?: string;
    createdAt: string;
    resolvedAt?: string;
  }
  ```
- **`Announcement`**:
  ```ts
  export interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'alert';
    active: boolean;
    createdAt: string;
    expiresAt?: string;
  }
  ```
- **`Booking` updates**:
  - Add `priceSnapshot: { pricePerDay: number; days: number; subtotal: number; serviceFee: number; total: number }`.
  - Add `reviewId?: string`, `disputeId?: string`, `cancellationReason?: string`.
- **`Car` updates**:
  - Add `blackoutDates: string[]`.
  - Ensure status includes `'pending' | 'approved' | 'rejected' | 'inactive'`.
- **`User` updates**:
  - Remove plain-text password field from storage types.

### 2.2 Storage Layer Refactoring (`src/lib/storage.ts`)
1. **Key Definitions**:
   - `localStorage` keys: `sw_users_v1`, `sw_cars_v1`, `sw_bookings_v1`, `sw_reviews_v1`, `sw_disputes_v1`, `sw_announcements_v1`.
   - `sessionStorage` keys: `sw_session_v1`, `sw_checkout_draft_v1`.
2. **Session Storage Migration**:
   - Move `getSession()` and session writes from `localStorage` to `sessionStorage`.
3. **Storage Helpers**:
   - Export typed CRUD functions: `getCars()`, `saveCar()`, `getBookings()`, `saveBooking()`, `getUsers()`, `saveUser()`, `getReviews()`, `saveReview()`, `getDisputes()`, `saveDispute()`, `getAnnouncements()`, `saveAnnouncement()`.
   - Implement `resetDemoData()` to reset all collections back to seed state on demand.
   - Implement `subscribeToStorageChanges(callback)` to synchronize state across multiple open browser tabs via `window.addEventListener('storage', ...)`.
4. **Seed Data Enhancement**:
   - Pre-populate bookings across all lifecycle statuses: `requested`, `confirmed`, `in_progress`, `completed`, and `cancelled`.
   - Pre-populate at least 2 reviews and 1 sample announcement.
   - Ensure image fallback helper (`placeholder-car.svg` or `onError` fallback).

---

## 3. Auth, Security & Guardrails

### 3.1 Security Fixes (`src/lib/auth.ts`)
1. **Fix `safeReturnPath`**:
   Replace flawed logic with strict protocol-relative check:
   ```ts
   export function safeReturnPath(url: string | null): string {
     if (!url) return '/';
     if (!url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) return '/';
     return url;
   }
   ```
2. **Purge Passwords from Storage**:
   Remove plain-text passwords. Demo sign-in should authenticate against email directly.
3. **Demo Quick Sign-In**:
   Implement `signInAsDemo(role: 'renter' | 'owner' | 'admin')` allowing instant 1-click authentication from `/signin`.
4. **Multi-Role Coexistence**:
   Allow users to possess both `renter` and `owner` in `roles: ['renter', 'owner']`.
5. **Role Guardrails**:
   Implement `hasRole(user, role)` and `requireRole(role)` helpers.
6. **Active Session Lockout**:
   Validate user `status !== 'suspended'` upon every state mutation, not just at sign-in time.

---

## 4. Booking Lifecycle & Business Logic

### 4.1 State Machine Transition Helper (`src/lib/bookingMachine.ts`)
Create a centralized transition validator:
- Allowed transitions:
  - `requested` → `confirmed` (Owner only)
  - `requested` → `declined` (Owner only)
  - `requested` → `cancelled` (Renter only)
  - `confirmed` → `in_progress` (Owner/Renter check-in)
  - `confirmed` → `cancelled` (Renter/Owner with penalty rules)
  - `in_progress` → `completed` (Owner/Renter return)
  - `in_progress` → `disputed` (Renter or Owner)
  - `completed` → `reviewed` (Renter only, 1-time)
  - `disputed` → `resolved` (Admin only)
- Terminal states: `declined`, `cancelled`, `resolved`.

### 4.2 Overlapping Reservation Validation
Before confirming any booking, assert that no other active reservation (`confirmed` or `in_progress`) for the same `carId` overlaps the requested date range:
```ts
export function isCarAvailable(carId: string, startDate: string, endDate: string, excludeBookingId?: string): boolean {
  const bookings = getBookings().filter(b => 
    b.carId === carId && 
    b.id !== excludeBookingId &&
    ['confirmed', 'in_progress'].includes(b.status)
  );
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return !bookings.some(b => {
    const bStart = new Date(b.startDate).getTime();
    const bEnd = new Date(b.endDate).getTime();
    return start <= bEnd && end >= bStart;
  });
}
```

---

## 5. UI Features, Catalogue & Formatting

### 5.1 Formatting Utility (`src/lib/format.ts`)
Create formatting functions:
- `formatETB(amount: number): string` — Format numbers into Ethiopian Birr (`Br 1,200` or `1,200 ETB`).
- `formatDate(date: string | Date): string` — Format dates (`Oct 29, 2026`).
- `formatRelativeTime(date: string | Date): string` — Relative timestamps (`2 days ago`).

### 5.2 Catalogue Enhancements (`src/app/cars/page.tsx`)
1. **Search**: Search across `brand`, `model`, and `name` case-insensitively.
2. **Filters**: Add Min/Max price sliders, Transmission dropdown (Automatic/Manual), Seats minimum count, and Date picker.
3. **Sorting**: Add `newest` and `popularity`.
4. **URL Synchronization**: Synchronize all filter and sort inputs to URL search query parameters in real time.
5. **Pagination**: Implement client pagination (e.g., 6 or 9 cars per page) with page clamping.
6. **Friendly Empty State**: Display "No cars match your filters" with a "Reset Filters" action button.

### 5.3 Simulated Features
1. **Leaflet GPS Tracker** (`src/components/MapTracker.tsx`):
   - Dynamic import using `next/dynamic` with `{ ssr: false }`.
   - Render mock Addis Ababa route (e.g., Bole Road to Kazanchis).
   - Prominent disclaimer badge: "Simulated GPS Tracking — Not Live Hardware".
   - Non-map fallback showing pickup and dropoff text addresses.
2. **TeleBirr Demo Checkout Modal**:
   - Interactive payment simulator with TeleBirr logo/palette.
   - Display fake transaction reference (e.g., `TB-ADDIS-893427`).
   - "Complete demo payment" action button that commits the reservation.
3. **CSV Exporter** (`src/lib/csv.ts`):
   - Proper escaping of quotes, commas, and newlines.
   - Export bookings for Renters, earnings for Owners, and GMV reports for Admins.

---

## 6. The 43-Concept Optimization Checklist

1. **`next/image` Migration**: Replace all unoptimized `<img>` tags in `page.tsx`, `cars/page.tsx`, `cars/[id]/page.tsx`, and `image-stream-hero.tsx` with `<Image />`. Configure remote domains in `next.config.ts`.
2. **SEO & Discovery**:
   - Create `src/app/sitemap.ts` listing all static pages and dynamic approved cars.
   - Create `src/app/robots.ts`.
   - Add OpenGraph metadata tags and canonical URLs in `src/app/layout.tsx`.
   - Add dynamic `generateMetadata` on `src/app/cars/[id]/page.tsx`.
   - Add JSON-LD (`AutoRental` schema) on car detail page.
3. **Mobile Drawer Navigation**: Add a mobile responsive hamburger menu toggle to `src/components/Navbar.tsx`.
4. **Accessibility Overhaul**:
   - Add `<label htmlFor="...">` to every input across all forms.
   - Ensure touch targets meet the 44×44px minimum requirement.
   - Wrap all tables in `overflow-x-auto` wrappers to prevent narrow screen overflow.

---

## 7. Documentation Deliverables

Create all 7 missing required architectural markdown documents in the project root:
1. `README.md` — Comprehensive project brief, architecture overview, setup steps, demo account credentials, live deployment link, and known limitations.
2. `STRATEGY.md` — Rendering strategy catalog (Static prerendering vs Dynamic client rendering rationale per route).
3. `BOUNDARY.md` — Server vs Client Component boundaries and localStorage/sessionStorage execution requirements.
4. `AUTH.md` — Authentication model, role coexistence, guardrails, the three negative test proofs, and demo security disclaimer.
5. `DATA.md` — Schemas, storage keys, validation, recovery strategies, and seed data catalog.
6. `PERF.md` — Performance benchmarks, Core Web Vitals (LCP, CLS, INP), and optimization techniques applied.
7. `FUTURE.md` — Next steps, backend migration strategy (database, real auth, TeleBirr payment gateway, real-time WebSocket GPS).
8. `.env.example` — Template showing all used environment variables.

---

## 8. Automated Verification Test Suite

Install a test runner (`vitest` or `jest`) and write tests covering:
1. Negative Test 1: Signed-out user cannot book.
2. Negative Test 2: Renter cannot cancel another renter's booking.
3. Negative Test 3: `safeReturnPath` blocks `//evil.com` and `https://evil.com`.
4. State machine: Valid status transitions succeed; invalid transitions throw/fail without mutating storage.
5. Collision detector: Overlapping active bookings for the same car are refused.

