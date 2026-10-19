// Phone-menu layout-shift probe for www.eliasb.dev (ticket #246).
// usage: node menushift.mjs <width> <shipped|stable> <outdir> [scrollY]
import { chromium } from "@playwright/test";
import fs from "node:fs";

const [width, variant, outdir, scrollTo = "1200"] = process.argv.slice(2);
const W = Number(width);
const mobile = W < 760;
fs.mkdirSync(outdir, { recursive: true });

// Playwright hides scrollbars in headless Chromium by default; keep them so
// they render as classic (always-shown, space-taking) scrollbars.
const browser = await chromium.launch({ ignoreDefaultArgs: ["--hide-scrollbars"] });
const ctx = await browser.newContext({
  viewport: { width: W, height: mobile ? 844 : 1000 },
  deviceScaleFactor: 1,
  isMobile: mobile,
  hasTouch: mobile,
  reducedMotion: "reduce",
});
const page = await ctx.newPage();
await page.goto("https://www.eliasb.dev/", { waitUntil: "networkidle" });
if (variant === "stable") await page.addStyleTag({ content: "html { scrollbar-gutter: stable; }" });
await page.waitForTimeout(2500);
await page.evaluate((y) => window.scrollTo(0, Number(y)), scrollTo);
await page.waitForTimeout(1500);

const measure = () =>
  page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    };
    const vis = (el) => el && getComputedStyle(el).display !== "none" && el.getClientRects().length > 0;
    const header = document.querySelector(".stretch-header");
    const menuBtn = document.querySelector(".stretch-menu-button");
    return {
      innerWidth: innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollbar: innerWidth - document.documentElement.clientWidth,
      scrollY: scrollY,
      scrollHeight: document.documentElement.scrollHeight,
      header: r(header),
      themeBtn: r(header?.querySelector("button:not(.stretch-menu-button)")),
      menuBtn: vis(menuBtn) ? r(menuBtn) : null,
      closeBtn: vis(document.querySelector(".stretch-menu__close")) ? r(document.querySelector(".stretch-menu__close")) : null,
      dialog: document.querySelector(".stretch-menu[open]") ? r(document.querySelector(".stretch-menu")) : null,
      dialogScrollbar: (() => { const d = document.querySelector(".stretch-menu[open]"); return d ? d.offsetWidth - d.clientWidth : null; })(),
      workHeading: r(document.querySelector("#work-heading")),
      firstVisibleText: (() => {
        // the first heading in the viewport, to see what the reader's eye is on
        const hs = [...document.querySelectorAll("h2, h3, p")].filter((e) => { const b = e.getBoundingClientRect(); return b.top >= 80 && b.top < innerHeight; });
        return hs[0] ? { text: hs[0].textContent.slice(0, 40), ...r(hs[0]) } : null;
      })(),
    };
  });

const tap = async (sel) => {
  const b = await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
  if (mobile) await page.touchscreen.tap(b.x, b.y); else await page.mouse.click(b.x, b.y);
};
const before = await measure();
await page.screenshot({ path: `${outdir}/1-before.png` });
console.error("scrollY right before click", await page.evaluate(() => scrollY));
await tap(".stretch-menu-button");
console.error("scrollY right after click", await page.evaluate(() => scrollY));
await page.waitForTimeout(300);
const open = await measure();
await page.screenshot({ path: `${outdir}/2-open.png` });
// What is behind the dialog while it is open (the dialog hidden for the measure only).
const behind = await page.evaluate(() => {
  const d = document.querySelector(".stretch-menu");
  d.style.visibility = "hidden";
  const h = document.querySelector(".stretch-header").getBoundingClientRect();
  const wh = document.querySelector("#work-heading").getBoundingClientRect();
  const out = { headerW: h.width, workHeadingX: wh.x, workHeadingY: wh.y, clientWidth: document.documentElement.clientWidth };
  return out;
});
await page.evaluate(() => (document.querySelector(".stretch-menu").style.visibility = "hidden"));
await page.screenshot({ path: `${outdir}/2b-behind-dialog.png` });
await page.evaluate(() => (document.querySelector(".stretch-menu").style.visibility = ""));
await tap(".stretch-menu__close");
await page.waitForTimeout(300);
const after = await measure();
await page.screenshot({ path: `${outdir}/3-after.png` });

const out = { W, variant, scrollTo: Number(scrollTo), before, open, behind, after };
fs.writeFileSync(`${outdir}/menu.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
await browser.close();
