# Sheggar Wheels — System Verification Checklist (`checklist.md`)

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
- [ ] **Demo One-Click Sign-In**:
  - [ ] Clicking "Sign In as Renter" logs in `renter1@sheggar.com` and navigates to `/dashboard`.
  - [ ] Clicking "Sign In as Owner" logs in `owner1@sheggar.com` and navigates to `/owner`.
  - [ ] Clicking "Sign In as Admin" logs in `admin@sheggar.com` and navigates to `/admin`.
- [ ] **Role Coexistence**:
  - [ ] A user can hold both `renter` and `owner` roles simultaneously (`roles: ['renter', 'owner']`).
  - [ ] When dual-role user is logged in, both "Dashboard" and "Owner Portal" links appear in the navigation.
- [ ] **Public Signup Security**:
  - [ ] Public `/signup` form does **not** permit choosing the `admin` role.
  - [ ] Admin account is strictly restricted to the seeded demo user.
- [ ] **Session Storage Validation**:
  - [ ] Active session is stored in `sessionStorage` under `sw_session_v1` (closing browser tab terminates session).
  - [ ] No plain-text passwords or secrets exist anywhere in `localStorage` or `sessionStorage`.
- [ ] **Sign-Out Flow**:
  - [ ] Clicking "Sign Out" completely removes session keys from storage.
  - [ ] User is redirected immediately to the home page `/`.
- [ ] **Suspended User Lockout**:
  - [ ] Suspended accounts cannot log in (shows "Account suspended" message).
  - [ ] If an active user is suspended by admin in another tab, any subsequent booking or listing mutation is immediately blocked.
- [ ] **Required Negative Security Tests**:
  - [ ] **Negative Test 1**: Submitting a booking while signed out returns "Not signed in" and creates zero records in storage.
  - [ ] **Negative Test 2**: Attempting to cancel another renter's booking returns "Not yours" and leaves storage unchanged.
  - [ ] **Negative Test 3**: Accessing `/signin?next=https://example.com` or `/signin?next=//evil.com` safely redirects internally to `/` or `/dashboard`.
- [ ] **Cross-User Privacy Guardrails**:
  - [ ] Owner A cannot view or edit Owner B's vehicle by guessing the ID in `/owner/cars/[id]/edit`.
  - [ ] Renter A cannot view Renter B's reservation details at `/bookings/[id]`.

---

## 3. Route Access & Route Groups Verification

### 3.1 Public Routes
- [ ] `/` (Landing Page): Hero image corridor renders, quick search navigates to catalogue.
- [ ] `/cars` (Catalogue): Displays all approved, active vehicles.
- [ ] `/cars/[id]` (Car Details): Displays specs, images, host information, daily ETB price.
- [ ] `/signin`: Renders credential form and demo one-click buttons.
- [ ] `/signup`: Renders registration form with renter/owner role options.

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
- [ ] `/admin`: Platform overview (total users, approved vs pending cars, platform fee revenue).
- [ ] `/admin/listings`: Pending car queue with "Approve" and "Reject" buttons.
- [ ] `/admin/users`: User list with "Suspend" and "Reinstate" buttons.
- [ ] `/admin/users/[id]`: User profile and activity inspector.
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
- [ ] `AUTH.md`: Explains role model, guardrails, the 3 negative test cases, and includes the non-production security disclaimer.
- [ ] `DATA.md`: Detailed entity schemas, storage keys, validation, corrupted JSON recovery, and seed catalog.
- [ ] `PERF.md`: Documents Core Web Vitals (LCP, CLS, INP) and optimization steps.
- [ ] `FUTURE.md`: Details simulated vs production items, real database transition plans, and payment API roadmap.
- [ ] No false documentation claims (no claiming a real database, real TeleBirr gateway, or real-time hardware GPS exists).

