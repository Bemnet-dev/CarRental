import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.setDefaultTimeout(15000);

// Public home keeps navbar + footer and no dashboard shell.
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
console.log(
  "HOME",
  JSON.stringify(
    await page.evaluate(() => ({
      path: location.pathname,
      hasNav: !!document.querySelector("nav"),
      hasFooter: !!document.querySelector("footer"),
      hasSidebar: !!document.querySelector('[data-sidebar="sidebar"]'),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    })),
  ),
);

// Sign in as owner through the real form.
await page.goto(`${BASE}/signin`, { waitUntil: "domcontentloaded" });
await page.getByPlaceholder("Email").fill("owner1@sheggar.com");
await page.getByPlaceholder("Password").fill("owner123");
await Promise.all([
  page.waitForURL("**/dashboard", { timeout: 15000 }),
  page.getByRole("button", { name: /sign in/i }).click(),
]);
await page.waitForTimeout(800);
console.log(
  "SIGNIN",
  JSON.stringify(
    await page.evaluate(() => ({
      path: location.pathname,
      h1: document.querySelector("h1")?.textContent.trim() ?? null,
      hasSidebar: !!document.querySelector('[data-sidebar="sidebar"]'),
      hasFooter: !!document.querySelector("footer"),
    })),
  ),
);

// Legacy owner route redirects into the unified dashboard.
await page.goto(`${BASE}/owner`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
console.log("OWNER_REDIRECT", JSON.stringify({ path: page.url().replace(BASE, "") }));

// Legacy admin route redirects into the unified dashboard.
await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
console.log("ADMIN_REDIRECT", JSON.stringify({ path: page.url().replace(BASE, "") }));

// Signed-out dashboard access lands on sign-in with a next param.
{
  const anon = await browser.newContext();
  const anonPage = await anon.newPage();
  await anonPage.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await anonPage.waitForTimeout(1200);
  console.log(
    "ANON_DASHBOARD",
    JSON.stringify({
      path: anonPage.url().replace(BASE, ""),
    }),
  );
  await anon.close();
}

await browser.close();
