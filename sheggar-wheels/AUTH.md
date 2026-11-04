# Authentication

DashDrive uses [Better Auth](https://www.better-auth.com/) 1.7 with the
email/password provider and a SQLite database (`better-sqlite3`). The auth
server runs inside the Next.js app; there is no separate service.

## Data model

Better Auth owns four tables in `data/auth.db`:

- `user` — `id`, `name`, `email` (unique), `emailVerified`, `image`,
  timestamps plus the app fields `firstName`, `lastName`, `phone`,
  `neighbourhood`, and the admin-plugin fields `role`, `banned`, `banReason`,
  `banExpires`.
- `account` — credential record per user. `password` holds a scrypt
  `salt:hash` string; `providerId` is `credential`.
- `session` — one row per active session, keyed by a random `token`, with
  `expiresAt`, IP and user agent, plus `impersonatedBy` for the admin plugin.
  Deleting the row revokes the session.
- `verification` — reserved for future email/password-reset flows.

`role` and the ban fields are declared with `input: false`, so a client can
never submit them. The admin plugin defaults new accounts to `renter`; only
an admin API call, the seed script, or a server-side update can change the
role or ban state. The app stores a single role and derives `roles: [role]`
when mapping to the UI model.

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
| Admin plugin | `roles` = renter/owner/admin, `defaultRole: "renter"`, `adminRoles: ["admin"]`, default ban reason |
| Admin UI | `/dashboard/users` (admins only) |
| Hosted dashboard | `dash()` from `@better-auth/infra`, `apiKey` from `BETTER_AUTH_API_KEY` |

`nextCookies()` is registered last so Better Auth can set cookies from Server
Actions and route handlers. The admin plugin is self-hosted: it exposes the
`/api/auth/admin/*` endpoints and owns the role and ban fields.

The hosted Better Auth Infrastructure dashboard is wired in through `dash()`.
Set `BETTER_AUTH_API_KEY` to the key from <https://dash.better-auth.com> to
send events and directory data; with an empty key the plugin still loads and
sign-in works, but the hosted dashboard stays empty. `activityTracking` and
`managedDirectorySync` are deliberately disabled because they add columns and
tables to `data/auth.db`; enable them only together with a migration.

Existing databases need `npm run db:migrate:admin` once. It adds `banned`,
`banReason`, `banExpires` and `session.impersonatedBy`, and folds the legacy
`user.status` column into `user.banned` before dropping it.

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

## User management

Admins manage Better Auth accounts from `/dashboard/users`. The page calls the
admin plugin's client API and writes the authoritative result back into the
local directory mirror:

| Action | Better Auth call | Effect |
| --- | --- | --- |
| Refresh | `authClient.admin.listUsers` | Reads every account, role and ban state |
| Change role | `authClient.admin.setRole` | Sets `renter`, `owner` or `admin` |
| Suspend | `authClient.admin.banUser` | Sets `banned`, stores the reason, deletes all sessions |
| Reactivate | `authClient.admin.unbanUser` | Clears `banned` / `banReason` / `banExpires` |
| Sign out everywhere | `authClient.admin.revokeUserSessions` | Deletes every session for that account |

The page disables self-management: an admin cannot change their own role or
ban themselves. `src/components/dashboard/dashboard-context.tsx` refreshes the
directory from Better Auth when an admin opens the dashboard, so the overview
counts and the users table show the same authoritative records.

## Authorization

- Authentication is required for all `/dashboard/*` routes, including the
  owner fleet and admin users views, via the server layout guard.
- `role` drives the workspace label, navigation and data scoping
  (`loadDashboardData` filters cars and bookings by the current user).
- The admin plugin enforces `adminRoles: ["admin"]` on every
  `/api/auth/admin/*` endpoint, so the Users page's client-side role check is
  only a UX guard; a non-admin call still receives `403`.
- Marketplace role checks are presentation/data-scoping only: the marketplace
  itself is a local demo store, so there is no server API that enforces
  ownership.
- Suspension uses the admin plugin's `banned` flag. A banned account cannot
  create a session (`403` / `BANNED_USER`), banning deletes its existing
  sessions, and the dashboard layout redirects a live session whose
  `user.banned` is true.
- `safeReturn` only accepts same-origin absolute paths. It rejects
  protocol-relative URLs, backslash/control-character variants, paths that
  normalize to `//host`, and any value that parses to another origin.

## Passwords and seeding

`npm run db:seed` inserts the five demo accounts with IDs `admin-1`, `owner-1`,
`owner-2`, `renter-1` and `renter-2` (matching `car.ownerId` and booking
references). It uses `hashPassword` from `better-auth/crypto`, so the stored
value matches what the sign-in endpoint expects.

Re-running the seed updates names, phone, neighbourhood and role, and clears
the ban fields on the demo accounts. It never overwrites an existing password.

Public sign-up always creates a `renter`. The admin account cannot be created
through the public form.

## Verification performed

Against a production build (`next build` + `next start`):

| Check | Result |
| --- | --- |
| Admin sign-in | `200`, cookie `better-auth.session_token` HttpOnly/SameSite=Lax/7 days; `/dashboard` renders "Admin workspace" |
| Wrong password | `401`; UI shows "Invalid credentials" and stays on `/signin` |
| `GET /dashboard` without a cookie | `307` to `/signin?next=%2Fdashboard` |
| Sign-out | session row deleted; next `/dashboard` request redirects to `/signin` |
| Signed-out form submit | focus moves to email, `aria-invalid=true`, `role=alert` "Enter your email." |
| Suspended account | sign-in `403` / `BANNED_USER`; reactivated account `200` |
| Admin user list | `GET /api/auth/admin/list-users` returns the five demo accounts with `role` and `banned` |
| Admin role change | `set-role` to `owner` and back to `renter` returns `200` and the UI shows the new role |
| Admin suspend/reactivate | `ban-user` sets `banned`, blocks sign-in and deletes sessions; `unban-user` restores sign-in |
| Revoke sessions | `revoke-user-sessions` returns `{ success: true }`; the revoked cookie no longer resolves a session |
| Users dashboard | `/dashboard/users` renders five rows, live role selects and suspend/reactivate/sign-out actions with no console errors |
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
- The in-app admin plugin is self-hosted. The hosted Better Auth
  Infrastructure dashboard is wired in with `dash()`, but it only receives
  data once `BETTER_AUTH_API_KEY` is set; the plugin loads and sign-in works
  without it.
- Serve over HTTPS in production and replace the CSP's `'unsafe-inline'`
  script allowance with nonces or hashes.
- Upgrade Next.js when a release with the patched PostCSS is available
  (`npm audit` currently reports advisories in Next's bundled PostCSS).
