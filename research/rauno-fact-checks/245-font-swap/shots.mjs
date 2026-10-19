import { chromium } from "@playwright/test";
import fs from "node:fs";
const b = await chromium.launch();
for (const W of [390, 1440]) {
  for (const mode of ["fallback", "final"]) {
    const ctx = await b.newContext({ viewport: { width: W, height: W < 760 ? 844 : 900 }, deviceScaleFactor: 1, isMobile: W < 760, hasTouch: W < 760, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    if (mode === "fallback") {
      // Hold the Bricolage file so the page stays in its fallback face.
      const bricolage = ["74effe3e2193102a", "3d51db290a6a25f3", "f7054824cbb51795"];
      await p.route(/\.woff2/, (r) => bricolage.some((h) => r.request().url().includes(h)) ? r.abort() : r.continue());
    }
    await p.goto("https://www.eliasb.dev/", { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    await p.screenshot({ path: `shots/${W}-${mode}.png` });
    if (W === 390) { await p.evaluate(() => document.querySelector("#work-heading").scrollIntoView({ block: "center" })); await p.waitForTimeout(300); await p.screenshot({ path: `shots/${W}-${mode}-work.png` }); }
    await ctx.close();
  }
}
// Side-by-side composites.
const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
for (const [name, a, c, w] of [["compare-390", "390-fallback.png", "390-final.png", 390], ["compare-390-work", "390-fallback-work.png", "390-final-work.png", 390], ["compare-1440", "1440-fallback.png", "1440-final.png", 1440]]) {
  const img = (f) => "data:image/png;base64," + fs.readFileSync("shots/" + f).toString("base64");
  const scale = w > 1000 ? 0.5 : 1;
  const dir = w > 1000 ? "column" : "row";
  await p.setContent(`<body style="margin:0;background:#888;font:16px system-ui;display:flex;flex-direction:${dir};gap:12px;padding:12px;width:max-content">
    <figure style="margin:0"><figcaption style="color:#fff;padding:4px 0">Fallback (Bricolage not yet loaded)</figcaption><img src="${img(a)}" style="width:${w*scale}px;display:block"></figure>
    <figure style="margin:0"><figcaption style="color:#fff;padding:4px 0">After swap (Bricolage Grotesque)</figcaption><img src="${img(c)}" style="width:${w*scale}px;display:block"></figure></body>`);
  await p.locator("body").screenshot({ path: `shots/${name}.png` });
}
await b.close();
