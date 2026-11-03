# Authentication

DashDrive uses [Better Auth](https://www.better-auth.com/) 1.7 with the
email/password provider and a SQLite database (`better-sqlite3`). The auth
server runs inside the Next.js app; there is no separate service.

## Data model

Better Auth owns four tables in `data/auth.db`:

- `user` — `id`, `name`, `email` (unique), `emailVerified`, `image`,
  timestamps plus the app fields `firstName`, `lastName`, `phone`,
  `neighbourhood`, `role`, `status`.
- `account` — credential record per user. `password` holds a scrypt
  `salt:hash` string; `providerId` is `credential`.
- `session` — one row per active session, keyed by a random `token`, with
  `expiresAt`, IP and user agent. Deleting the row revokes the session.
- `verification` — reserved for future email/password-reset flows.

`role` and `status` are declared with `input: false`, so a client can never
submit them. `role` defaults to `renter` and `status` to `active`; only the
seed script or a server-side update can change them. The app stores a single
role and derives `roles: [role]` when mapping to the UI model.

## Configuration

`src/lib/auth.ts`:

| Setting | Value |
| --- | --- |
| `baseURL` | `BETTER_AUTH_URL` (defaults to the request origin; set it in production) |
| `secret` | `BETTER_AUTH_SECRET`, else a random secret persisted to `data/auth.secret` |
| `trustedOrigins` | `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, and in non-production the local ports 3000/3100 |
| Session lifetime | 7 days, refreshed at most once per day |
| Minimum password | 10 characters for public sign-up |
| Rate limits | 60 requests/min per path; 10/min for `/sign-in/email`; 5/min for `/sign-up/email` |
| Extra origins | `BETTER_AUTH_TRUSTED_ORIGINS` (comma separated) |

`nextCookies()` is registered last so Better Auth can set cookies from Server
Actions and route handlers.

Production requires a strong `BETTER_AUTH_SECRET` and a stable
`BETTER_AUTH_URL` (HTTPS). The generated file secret is a development
convenience, not a production key.

## Request flow

1. `AuthScreen` calls `signIn` / `signUp` from `src/lib/session.ts`.
2. `authClient` posts to `/api/auth/sign-in/email` or `/api/auth/sign-up/email`
   (route handler: `src/app/api/auth/[...all]/route.ts`).
3. Better Auth verifies the scrypt hash, creates a session row and returns a
   `Set-Cookie: better-auth.session_token=...; HttpOnly; SameSite=Lax;
   Max-Age=604800`.
4. The client mirrors the user into the local directory (`sw_users_v1`)
   without a password field, then routes to the validated `next` path or
   `/dashboard`.
5. `src/app/(dashboard)/layout.tsx` calls `auth.api.getSession({ headers })` on
   every request. No session returns `redirect("/signin?next=%2Fdashboard")`.

Profile edits call `authClient.updateUser` for `firstName`, `lastName`,
`phone` and `neighbourhood`, then refresh the session.

Sign-out calls `authClient.signOut()`, which deletes the session row and clears
the cookie; the legacy `sw_session_v1` key is also removed if it still exists.

## Authorization

- Authentication is required for all `/dashboard/*` routes, including the
  owner fleet and admin users views, via the server layout guard.
- `role` drives the workspace label, navigation and data scoping
  (`loadDashboardData` filters cars and bookings by the current user).
- Role checks are presentation/data-scoping only: the marketplace itself is a
  local demo store, so there is no server API that enforces ownership.
- Suspension is enforced twice: `databaseHooks.session.create.before` refuses
  to create a session for `status = "suspended"`, and the dashboard layout
  redirects a session whose user is suspended.
- `safeReturn` only accepts same-origin absolute paths. It rejects
  protocol-relative URLs, backslash/control-character variants, paths that
  normalize to `//host`, and any value that parses to another origin.

## Passwords and seeding

`npm run db:seed` inserts the five demo accounts with IDs `admin-1`, `owner-1`,
`owner-2`, `renter-1` and `renter-2` (matching `car.ownerId` and booking
references). It uses `hashPassword` from `better-auth/crypto`, so the stored
value matches what the sign-in endpoint expects.

Re-running the seed updates names, phone, neighbourhood, role and status, and
reactivates suspended demo accounts. It never overwrites an existing password.

Public sign-up always creates a `renter`. The admin account cannot be created
through the public form.

## Verification performed

Against a production build (`next build` + `next start`):

| Check | Result |
| --- | --- |
| Admin sign-in | `200`, cookie `better-auth.session_token` HttpOnly/SameSite=Lax/7 days; `/dashboard` renders "Admin workspace" |
| Wrong password | `401`; UI shows "Invalid credentials" and stays on `/signin` |
| `GET /dashboard` without a cookie | `307` to `/signin?next=%2Fdashboard` |
| Sign-out | session row deleted (11 → 10 in the test DB); next `/dashboard` request redirects |
| Signed-out form submit | focus moves to email, `aria-invalid=true`, `role=alert` "Enter your email." |
| Suspended account | sign-in `401`; reactivated account `200` |
| Untrusted origin | sign-in POST with `Origin: http://evil.example` returns `403`; a trusted origin returns `200` |
| Rate limiting | 9th rapid bad sign-in returns `429`; UI shows "Too many attempts. Wait a minute and try again." |
| New sign-up | creates a `renter`, lands on `/dashboard`; no `password` field is written to `localStorage` |
| Legacy data | `sw_session_v1` and any `password` fields in `sw_users_v1` are removed on load |
| Open-redirect payloads | `?next=//evil.example`, `/%5Cevil.example`, `/..//evil.example` all resolve to `/dashboard` |
| Security headers | `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` and HSTS are returned on every route |
| Type/build | `npx tsc --noEmit` and `next build` exit `0` |

Rate-limit counters are shared per IP: a burst of bad attempts locks sign-in
for 60 seconds, which is expected behaviour.

## Non-production security disclaimer

The demo accounts and their passwords are published on the sign-in screen.
Anyone with access to the running app can sign in as admin. This build is for
demonstration and coursework, not for storing real personal data or accepting
payments.

Before production use:

- Use a managed database with backups instead of a local SQLite file.
- Require email verification, add password reset and optional 2FA.
- Move rate limiting to a shared store (Redis) if more than one instance runs.
- Move the marketplace (cars, bookings, users) behind server APIs with
  authorization checks; `localStorage` is not a trust boundary.
- Make admin suspension update the auth `user.status` row, not only the local
  directory.
- Serve over HTTPS in production and replace the CSP's `'unsafe-inline'`
  script allowance with nonces or hashes.
- Upgrade Next.js when a release with the patched PostCSS is available
  (`npm audit` currently reports advisories in Next's bundled PostCSS).
