# Landing page design evidence

Captured against the local dev server (`http://localhost:3000`) with Chromium
(Edge) at 390x844 and 1440x900.

- `mobile-hero.png`, `mobile-full.png`, `desktop-hero.png`, `desktop-full.png`
- `desktop-focus.png` shows the keyboard focus ring on the hero search select.
- `report.json` is the checkable evidence record; validate it with
  `node ../.opencode/skills/frontend-design-direction/scripts/check-evidence.js report.json`.

To recapture, install `playwright-core` somewhere resolvable, point
`EVIDENCE_DIR` at this folder, and run `capture.mjs`. The script uses the local
Microsoft Edge executable.
