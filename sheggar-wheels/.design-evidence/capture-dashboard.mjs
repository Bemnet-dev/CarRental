import { chromium } from "playwright-core";
import path from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const out = process.env.EVIDENCE_DIR ?? process.cwd();

const sessions = {
  renter: {
    userId: "renter-1",
    email: "renter1@sheggar.com",
    role: "renter",
    roles: ["renter"],
    firstName: "Dawit",
    lastName: "Alemayehu",
  },
  owner: {
    userId: "owner-1",
    email: "owner1@sheggar.com",
    role: "owner",
    roles: ["owner"],
    firstName: "Tadesse",
    lastName: "Bekele",
  },
  admin: {
    userId: "admin-1",
    email: "admin@sheggar.com",
    role: "admin",
    roles: ["admin"],
    firstName: "Admin",
    lastName: "User",
  },
};

const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ["--force-color-profile=srgb"],
});

const results = [];

async function open(role, width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(30000);
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("response", (response) => {
    if (response.status() >= 500) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.evaluate((session) => {
    localStorage.setItem("sw_session_v1", JSON.stringify(session));
  }, sessions[role]);
  return { context, page, errors };
}

async function settle(page) {
  await page.waitForTimeout(1000);
  await page
    .evaluate(async () => {
      const pending = [...document.images].filter((img) => !img.complete);
      await Promise.race([
        Promise.all(
          pending.map(
            (img) =>
              new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              }),
          ),
        ),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    })
    .catch(() => {});
  await page.waitForTimeout(400);
}

async function audit(page) {
  return page.evaluate(() => {
    const parse = (value) => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1]
        .split(/[ ,/]+/)
        .filter(Boolean)
        .map(Number);
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
    };
    const lum = (c) => {
      const f = (v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const bgOf = (el) => {
      let node = el;
      while (node) {
        const color = parse(getComputedStyle(node).backgroundColor);
        if (color && color.a > 0.95) return color;
        node = node.parentElement;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    };
    const ratio = (a, b) => {
      const l1 = lum(a);
      const l2 = lum(b);
      return Number(
        ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2),
      );
    };
    const measure = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const bg = bgOf(el);
      const fg = parse(getComputedStyle(el).color);
      return { text: el.textContent.trim().slice(0, 40), ratio: ratio(fg, bg) };
    };

    const navLinks = [...document.querySelectorAll('[data-sidebar="menu-button"]')];
    const activeLink = navLinks.find((el) => el.dataset.active === "true");
    const navActiveStyle = activeLink
      ? {
          text: activeLink.textContent.trim(),
          color: getComputedStyle(activeLink).color,
          background: getComputedStyle(activeLink).backgroundColor,
        }
      : null;

    return {
      title: document.title,
      h1: document.querySelector("h1")?.textContent.trim() ?? null,
      navItems: navLinks.map((el) => el.textContent.trim()).filter(Boolean),
      navActiveStyle,
      horizontalOverflow:
        document.documentElement.scrollWidth - window.innerWidth,
      sidebarVisible: !!document.querySelector('[data-sidebar="sidebar"]'),
      contrast: {
        heading: measure("h1"),
        body: measure(".text-muted-foreground"),
        nav: measure('[data-sidebar="menu-button"] span'),
      },
      images: document.querySelectorAll("img").length,
      brokenImages: [...document.images].filter(
        (img) => img.complete && img.naturalWidth === 0,
      ).length,
    };
  });
}

async function shot(role, route, label, width, height, options = {}) {
  let context;
  try {
    const opened = await open(role, width, height);
    context = opened.context;
    const { page, errors } = opened;

    await page
      .goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" })
      .catch(() => {});
    await page.waitForSelector("h1", { timeout: 15000 }).catch(() => {});
    await settle(page);

    if (options.action) await options.action(page).catch(() => {});

    const info = await audit(page);
    const file = `${label}.png`;
    await page.screenshot({ path: path.join(out, file) });
    if (options.fullPage) {
      await page
        .screenshot({ path: path.join(out, `${label}-full.png`), fullPage: true })
        .catch(() => {});
    }

    let focus = null;
    if (options.focus) {
      focus = await page
        .evaluate((selector) => {
          const el = document.querySelector(selector);
          if (!el) return null;
          el.focus();
          const s = getComputedStyle(el);
          return {
            tag: el.tagName,
            outline: `${s.outlineStyle} ${s.outlineWidth}`,
            boxShadow: s.boxShadow,
          };
        }, options.focus)
        .catch(() => null);
    }

    results.push({ role, route, label, width, height, info, focus, errors });
    console.log(
      JSON.stringify(
        { label, h1: info.h1, overflow: info.horizontalOverflow, images: info.images, broken: info.brokenImages, focus, errors },
        null,
        2,
      ),
    );
  } catch (error) {
    console.log(JSON.stringify({ label, fatal: String(error) }));
  } finally {
    await context?.close().catch(() => {});
  }
}

// Renter workspace
await shot("renter", "/dashboard", "dashboard-renter-desktop", 1440, 900, {
  fullPage: true,
  focus: '[data-sidebar="trigger"]',
});
await shot("renter", "/dashboard", "dashboard-renter-mobile", 390, 844, {
  fullPage: true,
});
await shot("renter", "/dashboard/bookings", "dashboard-renter-bookings-desktop", 1440, 900);

// Owner workspace
await shot("owner", "/dashboard", "dashboard-owner-desktop", 1440, 900, {
  fullPage: true,
});
await shot("owner", "/dashboard", "dashboard-owner-mobile", 390, 844, {
  fullPage: true,
});
await shot("owner", "/dashboard/bookings", "dashboard-owner-bookings-desktop", 1440, 900);
await shot("owner", "/dashboard/listings", "dashboard-owner-listings-desktop", 1440, 900);
await shot("owner", "/owner/cars/new", "dashboard-owner-add-car-desktop", 1440, 900, {
  fullPage: true,
});
await shot("owner", "/owner/cars/new", "dashboard-owner-add-car-mobile", 390, 844, {
  fullPage: true,
});

// Admin workspace
await shot("admin", "/dashboard", "dashboard-admin-desktop", 1440, 900, {
  fullPage: true,
});
await shot("admin", "/dashboard", "dashboard-admin-mobile", 390, 844, {
  fullPage: true,
});
await shot("admin", "/dashboard/users", "dashboard-admin-users-desktop", 1440, 900);
await shot("admin", "/dashboard/users", "dashboard-admin-users-mobile", 390, 844);
await shot("admin", "/dashboard/listings", "dashboard-admin-fleet-desktop", 1440, 900);
await shot("renter", "/dashboard/settings", "dashboard-settings-desktop", 1440, 900);

// Interaction: owner confirms a requested booking and the row updates.
await shot(
  "owner",
  "/dashboard/bookings",
  "dashboard-owner-confirm-desktop",
  1440,
  900,
  {
    action: async (page) => {
      const confirm = page.getByRole("button", { name: /confirm booking/i }).first();
      if (await confirm.count()) {
        await confirm.click();
        await page.waitForTimeout(600);
      }
    },
  },
);

await browser.close();

const summary = results.map((item) => ({
  label: item.label,
  route: item.route,
  role: item.role,
  viewport: `${item.width}x${item.height}`,
  h1: item.info.h1,
  overflow: item.info.horizontalOverflow,
  images: item.info.images,
  brokenImages: item.info.brokenImages,
  errors: item.errors.length,
}));
console.log("SUMMARY", JSON.stringify(summary, null, 2));
