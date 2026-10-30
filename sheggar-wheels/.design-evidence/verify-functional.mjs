import { chromium } from "playwright-core";
import path from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";
const out = process.env.EVIDENCE_DIR ?? process.cwd();

const ownerSession = {
  userId: "owner-1",
  email: "owner1@sheggar.com",
  role: "owner",
  roles: ["owner"],
  firstName: "Tadesse",
  lastName: "Bekele",
};

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

// 1) Add-car form submits, persists, and redirects to listings.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((s) => localStorage.setItem("sw_session_v1", JSON.stringify(s)), ownerSession);
  await page.goto(`${BASE}/owner/cars/new`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1");

  await page.getByLabel("Listing name").fill("Kia Rio 2022");
  await page.getByLabel("Brand").fill("Kia");
  await page.getByLabel("Model").fill("Rio");
  await page.getByLabel("Neighbourhood").fill("Bole");
  await page.getByLabel("Address").fill("Bole Road");
  await page.getByLabel("Features").fill("Bluetooth, Air conditioning");

  await Promise.all([
    page.waitForURL("**/dashboard/listings", { timeout: 15000 }),
    page.getByRole("button", { name: /submit for review/i }).click(),
  ]);
  await page.waitForTimeout(800);

  const result = await page.evaluate(() => {
    const cars = JSON.parse(localStorage.getItem("sw_cars_v1") || "[]");
    const car = cars.find((c) => c.name === "Kia Rio 2022");
    return {
      url: location.pathname,
      saved: !!car,
      status: car?.status,
      features: car?.features,
      visible: document.body.innerText.includes("Kia Rio 2022"),
    };
  });
  console.log("ADD_CAR", JSON.stringify({ ...result, errors }));
  await context.close();
}

// 2) Mobile sidebar drawer opens and exposes role navigation.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((s) => localStorage.setItem("sw_session_v1", JSON.stringify(s)), ownerSession);
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1");

  await page.getByRole("button", { name: /toggle sidebar/i }).click();
  await page.waitForTimeout(700);

  const drawer = await page.evaluate(() => {
    const sheet = document.querySelector('[data-mobile="true"]');
    const dialog = document.querySelector('[role="dialog"]');
    const target = sheet ?? dialog;
    return {
      open: !!target,
      text: target?.innerText.replace(/\s+/g, " ").slice(0, 220) ?? null,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  await page.screenshot({ path: path.join(out, "dashboard-mobile-nav.png") });
  console.log("MOBILE_NAV", JSON.stringify({ ...drawer, errors }));
  await context.close();
}

await browser.close();
