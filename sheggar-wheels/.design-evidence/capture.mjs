import { chromium } from "playwright-core";
import path from "node:path";

const EDGE =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";
const out = process.env.EVIDENCE_DIR ?? process.cwd();

const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ["--force-color-profile=srgb"],
});

async function settleImages(page) {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight * 0.75, 400);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 250));
  });
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    const pending = [...document.images].filter((img) => !img.complete);
    await Promise.all(
      pending.map(
        (img) =>
          new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }),
      ),
    );
  });
  await page.waitForTimeout(400);
}

async function capture(width, height, label) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("response", (response) => {
    if (response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.waitForTimeout(1200);
  await settleImages(page);

  await page.screenshot({ path: path.join(out, `${label}-hero.png`) });
  await page.screenshot({
    path: path.join(out, `${label}-full.png`),
    fullPage: true,
  });

  const audit = await page.evaluate(() => {
    const headings = [...document.querySelectorAll("h1,h2,h3")].map((el) => ({
      tag: el.tagName,
      text: el.textContent.trim().slice(0, 48),
    }));
    const selects = [...document.querySelectorAll("select")].map((el) => ({
      id: el.id,
      labels: el.labels ? [...el.labels].map((l) => l.textContent.trim()) : [],
    }));
    const images = [...document.querySelectorAll("img")].map((el) => ({
      alt: el.alt,
      decorative: !!el.closest('[aria-hidden="true"]'),
    }));
    const card = document.querySelector('[class*="ish-c-"]');
    return {
      headings,
      selects,
      imageCount: images.length,
      imagesMissingAlt: images.filter((img) => !img.alt && !img.decorative).length,
      horizontalOverflow:
        document.documentElement.scrollWidth - window.innerWidth,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      cardAnimation: card
        ? {
            name: getComputedStyle(card).animationName,
            playState: getComputedStyle(card).animationPlayState,
          }
        : null,
    };
  });

  await page.focus("#hero-neighbourhood");
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    const s = getComputedStyle(el);
    return {
      tag: el.tagName,
      outline: `${s.outlineStyle} ${s.outlineWidth}`,
      boxShadow: s.boxShadow,
    };
  });
  if (label === "desktop") {
    await page.screenshot({ path: path.join(out, `${label}-focus.png`) });
  }

  const contrast = await page.evaluate(() => {
    const parse = (value) => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1]
        .split(/[ ,/]+/)
        .filter(Boolean)
        .map(Number);
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
    };
    const luminance = (c) => {
      const f = (v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const composite = (fg, bg) => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });
    const background = (el) => {
      let node = el;
      while (node) {
        const color = parse(getComputedStyle(node).backgroundColor);
        if (color && color.a > 0.95) return color;
        node = node.parentElement;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    };
    const ratio = (a, b) => {
      const l1 = luminance(a);
      const l2 = luminance(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const ownerParagraphs = [...document.querySelectorAll(".bg-ember p")];
    const targets = [
      ["fleet eyebrow", document.querySelector("#fleet p.text-clay")],
      ["fleet body", document.querySelector("#fleet p.text-muted-foreground")],
      ["step number", document.querySelector("ol span.font-display")],
      ["owner eyebrow", ownerParagraphs[0]],
      ["owner body", ownerParagraphs[1]],
      ["footer copyright", document.querySelector("footer p.text-xs")],
      ["nav link", document.querySelector("nav a")],
    ];
    return targets.map(([name, el]) => {
      if (!el) return { name, missing: true };
      const bg = background(el);
      const fg = composite(parse(getComputedStyle(el).color), bg);
      return {
        name,
        ratio: Number(ratio(fg, bg).toFixed(2)),
      };
    });
  });

  console.log(
    JSON.stringify({ label, audit, focus, contrast, errors }, null, 2),
  );

  if (label === "desktop") {
    await page.selectOption("#hero-neighbourhood", "Bole");
    await page.selectOption("#hero-category", "SUV");
    await Promise.all([
      page.waitForURL("**/cars?**"),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForTimeout(1200);
    const search = await page.evaluate(() => ({
      url: location.href,
      available: document.body.innerText.match(/\d+ cars available/)?.[0] ?? null,
      cars: [...document.querySelectorAll("h3")].map((el) =>
        el.textContent.trim(),
      ),
    }));
    console.log("SEARCH", JSON.stringify(search));
  }

  await context.close();
}

await capture(390, 844, "mobile");
await capture(1440, 900, "desktop");
await browser.close();
