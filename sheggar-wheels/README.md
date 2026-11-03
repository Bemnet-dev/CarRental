# DashDrive

Peer-to-peer car rental demo for Addis Ababa. The UI is Next.js App Router with
TypeScript, Tailwind CSS and shadcn/Radix components. Accounts and sessions are
handled by Better Auth on SQLite; the demo marketplace data (cars, bookings,
reviews, user directory) still lives in `localStorage`.

## Requirements

- Node.js 20.9 or newer
- npm

## Setup

```bash
npm install
```

Create the local env file (PowerShell: `Copy-Item .env.example .env.local`):

```bash
cp .env.example .env.local
```

Set `BETTER_AUTH_SECRET` to 32+ random characters. In development you can leave
it blank: the app generates a secret once and stores it in `data/auth.secret`
(never committed).

Create the auth tables and seed the demo accounts:

```bash
npm run db:migrate
npm run db:seed
```

The migration CLI can log a "Database schema mismatch" warning while it
creates the tables. If `npm run db:seed` then succeeds, the schema is ready.

Run the app:

```bash
npm run dev
```

Open <http://localhost:3000>.

For a production build:

```bash
npm run build
npm run start
```

Set `BETTER_AUTH_URL` to the public HTTPS origin, provide a permanent
`BETTER_AUTH_SECRET`, and keep the `data/` directory on persistent storage.

## Demo accounts

| Role   | Email                  | Password    |
| ------ | ---------------------- | ----------- |
| Admin  | `admin@dashdrive.com`  | `admin123`  |
| Owner  | `owner1@dashdrive.com` | `owner123`  |
| Owner  | `owner2@dashdrive.com` | `owner123`  |
| Renter | `renter1@dashdrive.com`| `renter123` |
| Renter | `renter2@dashdrive.com`| `renter123` |

These passwords are shorter than the 10-character minimum enforced on public
sign-up because the demo accounts are seeded directly into SQLite. New
sign-ups must satisfy the 10-character rule.

All roles use the same `/dashboard` workspace, which changes its navigation,
metrics and label (Admin / Owner / Renter workspace) based on the signed-in
user's role.

## Authentication

- `/signin` and `/signup` submit to Better Auth at `/api/auth/*`.
- Sessions are `better-auth.session_token` httpOnly cookies (`SameSite=Lax`,
  7 days), so page JavaScript cannot read the token.
- `/dashboard/*` is guarded on the server; without a session the request is
  redirected to `/signin?next=...`.
- Suspended accounts cannot create a session, and an already-live session is
  redirected out of the dashboard.
- Passwords are stored as scrypt hashes in `data/auth.db`. Neither
  `localStorage` nor the user directory contains passwords.
- Sign-in and sign-up are rate limited per IP (10 and 5 attempts per minute).

See [AUTH.md](AUTH.md) for the model, configuration and known gaps.

## Scripts

| Script             | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `npm run dev`      | Development server (Turbopack)                       |
| `npm run build`    | Production build                                     |
| `npm run start`    | Serve the production build                           |
| `npm run lint`     | ESLint                                               |
| `npm run db:migrate` | Create/update the Better Auth SQLite schema        |
| `npm run db:seed`  | Create or refresh the five demo accounts             |

`npm run db:seed` is idempotent: it refreshes directory fields, reactivates the
demo accounts and never resets an existing password.

## Data

`localStorage` holds the demo marketplace: `sw_users_v1`, `sw_cars_v1`,
`sw_bookings_v1`, `sw_reviews_v1`, `sw_disputes_v1` and
`sw_announcements_v1`. It is seeded on first load. Clearing site data resets the
marketplace but not the auth database.

Auth data lives in `data/auth.db` (WAL mode). Both `data/auth.db` and
`data/auth.secret` are gitignored.

## Known limitations

This is a capstone demo, not a production rental platform:

- The marketplace directory is client-trusted `localStorage`; only
  authentication is server-enforced.
- Admin "Suspend" in the users view updates the local directory but not the
  Better Auth record, so it does not block that account's future sign-ins.
- Rate-limit counters are in memory and reset when the server restarts.
- Email verification, password reset, magic links and 2FA are not enabled.
- A user has one role; dual renter/owner accounts are not supported.
- Payments and GPS tracking are simulated.
