import { chromium } from "playwright-core";
import path from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";
const out = process.env.EVIDENCE_DIR ?? process.cwd();

const renter = { userId: "renter-1", email: "renter1@sheggar.com", role: "renter", roles: ["renter"], firstName: "Dawit", lastName: "Alemayehu" };
const owner = { userId: "owner-1", email: "owner1@sheggar.com", role: "owner", roles: ["owner"], firstName: "Tadesse", lastName: "Bekele" };

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function run(label, session, route, prepare) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((s) => localStorage.setItem("sw_session_v1", JSON.stringify(s)), session);
  await page
    .waitForFunction(() => !!localStorage.getItem("sw_users_v1"), { timeout: 10000 })
    .catch(() => {});
  if (prepare) await page.evaluate(prepare);
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(out, `${label}.png`) });
  const info = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent.trim() ?? null,
    body: document.body.innerText.replace(/\s+/g, " ").slice(0, 260),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  }));
  console.log(label, JSON.stringify({ ...info, errors }));
  await context.close();
}

await run("dashboard-permission-desktop", renter, "/dashboard/users");
await run("dashboard-empty-desktop", owner, "/dashboard/listings", () => {
  localStorage.setItem("sw_cars_v1", "[]");
  localStorage.setItem("sw_demo_seeded_v1", "true");
});

await browser.close();
