# DashDrive — System Verification Checklist (`checklist.md`)

Use this comprehensive checklist to verify that all functional requirements, security guardrails, business rules, and capstone criteria are fully operational.

---

## 1. Build, Lint & Runtime Smoke Tests
- [ ] `npm install` completes with zero package resolution or dependency errors.
- [ ] `npm run lint` completes with **0 errors and 0 warnings** (no `@next/next/no-img-element` warnings).
- [ ] `npm run build` completes with exit code `0` and generates optimized static/dynamic routes.
- [ ] App starts cleanly in production mode with `npm run start` at `http://localhost:3000`.
- [ ] Browser console has zero unhandled exceptions, hydration errors, or missing key warnings during a complete user journey.

---

## 2. Authentication, Session & Guardrails

> **Current implementation:** Better Auth email/password on SQLite. Sessions are
> httpOnly cookies, not `sessionStorage`. Setup, accounts and known gaps are in
> `README.md` and `AUTH.md`. Items marked **(gap)** are brief requirements that
> this demo does not enforce server-side.

- [ ] **Demo Accounts**:
  - [ ] The demo strip on `/signin` lists `admin@dashdrive.com/admin123`, `owner1@dashdrive.com/owner123` and `renter1@dashdrive.com/renter123`.
  - [ ] Each credential signs in to `/dashboard` and shows the matching workspace label (Admin / Owner / Renter workspace).
  - [ ] `npm run db:seed` creates all five demo accounts; re-running it does not reset an existing password.
- [ ] **Role Coexistence (gap)**:
  - [ ] Dual-role accounts (`roles: ['renter', 'owner']`) are not supported; Better Auth stores one `role` per user and the UI derives `roles: [role]`.
- [ ] **Public Signup Security**:
  - [ ] Public `/signup` always creates a `renter` and cannot submit `role` or the ban fields (`input: false`).
  - [ ] Admin access exists only through the seeded `admin@dashdrive.com` account.
- [ ] **Session Validation**:
  - [ ] The session is a `better-auth.session_token` cookie with `HttpOnly`, `SameSite=Lax` and a 7-day lifetime.
  - [ ] No session token is written to `localStorage` or `sessionStorage`; `sw_session_v1` is removed if a legacy value exists.
  - [ ] No plain-text passwords or secrets exist anywhere in `localStorage` or `sessionStorage`; passwords are scrypt hashes in `data/auth.db`.
- [ ] **Sign-Out Flow**:
  - [ ] Clicking "Sign out" deletes the session row, clears the cookie and redirects to `/`.
  - [ ] A subsequent visit to `/dashboard` redirects to `/signin?next=%2Fdashboard`.
- [ ] **Suspended User Lockout**:
  - [ ] Better Auth refuses to create a session for a banned account (sign-in returns `403` / `BANNED_USER`).
  - [ ] The dashboard server guard redirects an already-live session whose user is banned.
  - [ ] Admin "Suspend" in `/dashboard/users` calls the Better Auth admin API, sets `banned`, deletes that user's sessions and blocks their next sign-in.
  - [ ] "Reactivate" clears the ban and restores sign-in.
- [ ] **Rate Limiting & Origin Checks**:
  - [ ] The 9th rapid bad sign-in returns `429` and the form shows "Too many attempts. Wait a minute and try again."
  - [ ] A sign-in POST with an untrusted `Origin` returns `403`; a trusted origin returns `200`.
- [ ] **Required Negative Security Tests**:
  - [ ] **Negative Test 1 (gap)**: `/checkout` without a session redirects to `/signin`; booking writes are local-storage operations with no server API, so enforcement is client-side only.
  - [ ] **Negative Test 2 (gap)**: The UI only exposes the renter's own bookings, but the local-storage directory is client-editable, so cross-renter cancellation is not server-enforced.
  - [ ] **Negative Test 3**: `/signin?next=https://example.com`, `//evil.example`, `/%5Cevil.example` and `/..//evil.example` all resolve internally to `/dashboard` after sign-in.
- [ ] **Cross-User Privacy Guardrails (gap)**:
  - [ ] Owner A cannot see Owner B's cars in the workspace because data is filtered by `ownerId`, but the underlying local directory is client-trusted.
  - [ ] Renter A's booking list is filtered by `renterId`; direct cross-renter access is not server-enforced.

---

## 3. Route Access & Route Groups Verification

### 3.1 Public Routes
- [ ] `/` (Landing Page): Hero image corridor renders, quick search navigates to catalogue.
- [ ] `/cars` (Catalogue): Displays all approved, active vehicles.
- [ ] `/cars/[id]` (Car Details): Displays specs, images, host information, daily ETB price.
- [ ] `/signin`: Renders the credential form and the demo-credential strip (no one-click buttons).
- [ ] `/signup`: Renders the registration form (name, email, password); new accounts are always renters.

### 3.2 Renter Protected Routes (Requires `renter` role; redirects unauthenticated to `/signin?next=...`)
- [ ] `/dashboard`: Summary cards (Spend, Trips count, Next upcoming rental) and quick links.
- [ ] `/bookings`: Complete reservation history with status filter tabs (`All`, `Active`, `Completed`, `Cancelled`).
- [ ] `/bookings/[id]`: Individual trip ledger with status timeline and action buttons.
- [ ] `/bookings/[id]/track`: Simulated GPS route map with "Simulation" label and address fallback.
- [ ] `/bookings/[id]/review`: Star rating and comment form (unlocked only after completion).
- [ ] `/checkout`: Booking date selection, live price computation, and TeleBirr payment simulator.

### 3.3 Owner Protected Routes (Requires `owner` role; non-owners blocked)
- [ ] `/owner`: Host dashboard with metrics (fleet size, active rentals, monthly earnings).
- [ ] `/owner/cars`: Host fleet inventory table with status indicators.
- [ ] `/owner/cars/new`: New car submission form (sets status to `pending`).
- [ ] `/owner/cars/[id]/edit`: Vehicle detail editor.
- [ ] `/owner/cars/[id]/availability`: Host blackout calendar for unlisting specific dates.
- [ ] `/owner/cars/[id]/bookings`: Reservation requests for this specific car.
- [ ] `/owner/earnings`: Monthly revenue Recharts graph + accessible table fallback + CSV export.
- [ ] `/owner/reviews`: Guest feedback list with 1-time host response form.
- [ ] `/owner/disputes`: Host damage/incident claims manager.

### 3.4 Admin Protected Routes (Requires `admin` role; unauthorized users blocked)
- [ ] `/dashboard`: Platform overview (total users, approved vs pending cars, platform fee revenue).
- [ ] `/dashboard/listings`: Pending car queue with "Approve" and "Reject" buttons.
- [ ] `/dashboard/users`: Better Auth user list with role changes, "Suspend"/"Reactivate", and "Sign out everywhere".
- [ ] `/admin/bookings`: System-wide reservations ledger.
- [ ] `/admin/disputes`: List of open renter/owner disputes.
- [ ] `/admin/disputes/[id]`: Dispute resolution view with admin notes and "Resolve" action.
- [ ] `/admin/reports`: Financial report with platform fee volume charts and CSV export.
- [ ] `/admin/announcements`: System banner creator and toggle switch.

---

## 4. Booking Lifecycle & Business Rules
- [ ] **State Transitions**:
  - [ ] Newly submitted booking enters `requested` status.
  - [ ] Owner can change `requested` → `confirmed` or `declined`.
  - [ ] Renter can cancel `requested` → `cancelled`.
  - [ ] On pickup date, booking transitions `confirmed` → `in_progress`.
  - [ ] On return, booking transitions `in_progress` → `completed`.
  - [ ] If an issue arises, `in_progress` can transition → `disputed`.
  - [ ] Admin can transition `disputed` → `resolved` with resolution notes.
  - [ ] Completed booking transitions → `reviewed` once the renter submits a review.
  - [ ] Terminal states (`declined`, `cancelled`, `resolved`) refuse any further transitions.
- [ ] **Overlapping Booking Protection**:
  - [ ] Attempting to confirm a booking that overlaps dates with an already `confirmed` or `in_progress` booking for the same car is strictly rejected with a clear collision error.
- [ ] **Transparent Pricing**:
  - [ ] Checkout page calculates and visually displays:
    `Days × Daily Rate (ETB) + 10% Platform Fee = Total Price`
    **before** the user clicks "Request Booking".
- [ ] **Review Rules**:
  - [ ] A renter can review a booking **only once**.
  - [ ] Review is only allowed when status is `completed`.
  - [ ] The vehicle owner can post a single reply to the review.
- [ ] **Dispute Rules**:
  - [ ] Only the renter or owner involved in the booking can file or view the dispute.
  - [ ] Admin resolves dispute with formal resolution text.
- [ ] **Public Listing Visibility**:
  - [ ] Only cars marked as `approved` and active appear in `/cars` search. Cars marked as `pending`, `rejected`, or `inactive` are hidden from public search.

---

## 5. Catalogue & Search Experience
- [ ] **Search**: Case-insensitive matching across car name, brand, model, and description.
- [ ] **Filters**:
  - [ ] Neighbourhood / Location (Bole, Kazanchis, Piassa, Merkato, etc.).
  - [ ] Price Range (Min ETB / Max ETB).
  - [ ] Transmission (Automatic / Manual).
  - [ ] Minimum Seats (e.g., 4+, 5+, 7+).
  - [ ] Availability Dates (excludes cars with active booking overlap).
- [ ] **Sorting**:
  - [ ] Price: Low to High.
  - [ ] Price: High to Low.
  - [ ] Newest Listings.
  - [ ] Popularity (Highest booking count).
- [ ] **URL Sync**: Filter and sort values synchronize with URL search params (e.g. `/cars?neighbourhood=Bole&sort=price-asc`). Refreshing the browser preserves the exact filter state.
- [ ] **Pagination**:
  - [ ] Catalogue displays paginated results (e.g. 6 per page).
  - [ ] Changing filters clamps/resets pagination to page 1.
- [ ] **Empty State**:
  - [ ] When no cars match criteria, displays "No cars match your filters" with a "Clear all filters" button.

---

## 6. Dashboards, Visualizations & Mock Integrations
- [ ] **Recharts Earnings Chart**:
  - [ ] Monthly income bar/area chart renders on `/owner/earnings` and `/admin/reports`.
  - [ ] An accessible HTML `<table>` alternative is provided for screen readers and non-JS clients.
- [ ] **CSV Export**:
  - [ ] Renter can download a CSV of their own bookings.
  - [ ] Owner can download a CSV of their payouts.
  - [ ] Admin can download a platform report CSV.
  - [ ] CSV escaping properly handles strings with commas, double quotes (`""`), and newlines.
- [ ] **Leaflet Simulated GPS Map**:
  - [ ] Dynamic client-only import (`next/dynamic` with `ssr: false`).
  - [ ] No build or SSR errors on server render.
  - [ ] Route displays simulated car marker in Addis Ababa.
  - [ ] Clear notice displayed: *"Simulation only — not live GPS"*.
  - [ ] Text address fallback is visible if map fails to load.
- [ ] **Mock TeleBirr Checkout**:
  - [ ] Realistic TeleBirr demo modal / screen.
  - [ ] Generates fake transaction reference ID (e.g. `TB-894102-ET`).
  - [ ] Clicking "Complete demo payment" confirms payment without requiring real card/PIN numbers.
- [ ] **In-App Notifications**:
  - [ ] State changes (e.g., "Owner confirmed your booking", "Car approved by Admin") trigger notification toasts or in-app notification badges.

---

## 7. Next.js 43-Concept Compliance
- [ ] `next/image`: All images use `<Image />` with defined dimensions, `alt` attributes, and domain whitelist in `next.config.ts`.
- [ ] `next/font`: Google Fonts (`Inter` and `Instrument Serif`) loaded efficiently without layout shift.
- [ ] Metadata: Title, Description, Open Graph (`og:image`, `og:title`), Twitter Card, and Canonical URLs configured in `layout.tsx`.
- [ ] `generateMetadata`: Dynamic SEO title on `/cars/[id]` based on car name and neighbourhood.
- [ ] JSON-LD: Structured `AutoRental` schema script included on car detail page without false ratings.
- [ ] Sitemap & Robots: `sitemap.ts` and `robots.ts` exist in `src/app/` and return valid XML / robots txt.
- [ ] Localization: `src/lib/format.ts` formats all currency in Ethiopian Birr (`ETB` or `Br`), dates cleanly, and provides relative time.
- [ ] Multi-Tab Synchronization: Storage listener updates app state in real time across open browser tabs.
- [ ] Environment Template: `.env.example` exists and documents any mock environment keys.

---

## 8. Accessibility & Responsiveness
- [ ] **Keyboard Navigation**:
  - [ ] Entire application can be navigated using `Tab`, `Shift+Tab`, `Enter`, `Space`, and `Escape`.
  - [ ] Visible focus rings (`focus-visible:ring-2`) appear around all focused interactive elements.
- [ ] **Screen Reader Support**:
  - [ ] Every form input, select, and textarea has an explicitly associated `<label htmlFor="...">`.
  - [ ] Buttons containing only icons include `aria-label` attributes.
- [ ] **Touch Targets**:
  - [ ] All interactive buttons and links have a minimum touch target area of `44 × 44px`.
- [ ] **Mobile Layout (320px – 375px)**:
  - [ ] Zero horizontal page overflow at 320px width.
  - [ ] Responsive mobile drawer / hamburger menu allows navigation to all pages on phones.
  - [ ] All tables are wrapped in `overflow-x-auto` to prevent viewport breakages.

---

## 9. Documentation Integrity
- [ ] `README.md`: Contains overview, features, screenshots/video link, tech stack, setup instructions, demo credentials, limitations, and live deployment link.
- [ ] `STRATEGY.md`: Documents every route, rendering strategy (SSG, Client CSR, Dynamic), and justifications.
- [ ] `BOUNDARY.md`: Documents Server vs Client component boundaries and why localStorage mandates client code.
- [x] `AUTH.md`: Explains the Better Auth role model, guardrails, the 3 negative test cases, and includes the non-production security disclaimer.
- [ ] `DATA.md`: Detailed entity schemas, storage keys, validation, corrupted JSON recovery, and seed catalog.
- [ ] `PERF.md`: Documents Core Web Vitals (LCP, CLS, INP) and optimization steps.
- [ ] `FUTURE.md`: Details simulated vs production items, real database transition plans, and payment API roadmap.
- [ ] No false documentation claims (no claiming a real database, real TeleBirr gateway, or real-time hardware GPS exists).

