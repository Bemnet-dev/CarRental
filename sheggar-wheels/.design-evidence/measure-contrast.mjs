import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";
const sessions = {
  renter: { userId: "renter-1", email: "renter1@sheggar.com", role: "renter", roles: ["renter"], firstName: "Dawit", lastName: "Alemayehu" },
  admin: { userId: "admin-1", email: "admin@sheggar.com", role: "admin", roles: ["admin"], firstName: "Admin", lastName: "User" },
};

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
for (const [role, session] of Object.entries(sessions)) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((s) => localStorage.setItem("sw_session_v1", JSON.stringify(s)), session);
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1");
  await page.waitForTimeout(700);
  const data = await page.evaluate(() => {
    const parse = (v) => {
      const m = v.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
    };
    const lum = (c) => {
      const f = (x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const bgOf = (el) => {
      let n = el;
      while (n) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0.95) return c; n = n.parentElement; }
      return { r: 255, g: 255, b: 255, a: 1 };
    };
    const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return Number(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)); };
    const m = (sel) => { const el = document.querySelector(sel); if (!el) return null; return { text: el.textContent.trim().slice(0, 30), ratio: ratio(parse(getComputedStyle(el).color), bgOf(el)) }; };
    return {
      heading: m("h1"),
      body: m(".text-muted-foreground"),
      navLabel: m('[data-sidebar="group-label"]'),
      navItem: m('[data-sidebar="menu-button"] span'),
      sidebarText: m('[data-sidebar="menu-button"][data-size="lg"] span'),
      pageBg: getComputedStyle(document.body).backgroundColor,
    };
  });
  console.log(role, JSON.stringify(data));
  await context.close();
}
await browser.close();
