# Design evidence

Captured against the local production server (`http://localhost:3000`) with
Chromium (Edge) at 390x844 and 1440x900, using `reducedMotion: "reduce"`.

## Dashboard (current)

Role-aware shadcn sidebar dashboard for renter, owner, and admin.

- `dashboard-renter-desktop.png`, `dashboard-renter-mobile.png`
- `dashboard-owner-desktop.png`, `dashboard-owner-mobile.png`
- `dashboard-admin-desktop.png`, `dashboard-admin-mobile.png`
- `dashboard-renter-bookings-desktop.png`
- `dashboard-owner-bookings-desktop.png`
- `dashboard-owner-confirm-desktop.png` (post-confirm state)
- `dashboard-owner-listings-desktop.png`
- `dashboard-admin-fleet-desktop.png`
- `dashboard-admin-users-desktop.png`, `dashboard-admin-users-mobile.png`
- `dashboard-settings-desktop.png`
- `dashboard-owner-add-car-desktop.png`, `dashboard-owner-add-car-mobile.png`
- `dashboard-mobile-nav.png` (mobile sidebar Sheet)
- `dashboard-permission-desktop.png` (renter blocked from Users)
- `dashboard-empty-desktop.png` (empty owner fleet)

Full-page variants are written as `<label>-full.png` for the overview and
add-car captures.

## Public shell (preserved)

- `zen-home-desktop.png`, `zen-home-mobile.png`
- `zen-cars-desktop.png`, `zen-signin-desktop.png`
- `nav-desktop.png`, `nav-mobile-sheet.png`

## Validate

`report.json` is the checkable evidence record:

```sh
node ../.opencode/skills/frontend-design-direction/scripts/check-evidence.js report.json
```

## Recapture

Install `playwright-core` somewhere resolvable, point `EVIDENCE_DIR` at this
folder, start the app on port 3000, then run:

```sh
node capture-dashboard.mjs   # role dashboards, both viewports
node capture-states.mjs      # permission + empty states
node verify-functional.mjs   # add-car flow + mobile drawer
node verify-routing.mjs      # public shell, sign-in, legacy redirects
```

The scripts use the local Microsoft Edge executable.
