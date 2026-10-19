import { chromium } from "@playwright/test";
import fs from "node:fs";
const b = await chromium.launch({ ignoreDefaultArgs: ["--hide-scrollbars"] });
// 1) Short pages: does anything not overflow (where stable would add an empty gutter)?
const urls = ["/", "/this-page-does-not-exist"];
const links = await (async () => { const p = await b.newPage(); await p.goto("https://www.eliasb.dev/sitemap.xml"); const t = await p.content(); await p.close(); return [...t.matchAll(/<loc>https:\/\/www\.eliasb\.dev([^<]*)<\/loc>/g)].map((m) => m[1] || "/"); })();
for (const u of links) if (!urls.includes(u)) urls.push(u);
for (const W of process.env.SKIP ? [] : [820, 1440]) {
  const p = await b.newPage({ viewport: { width: W, height: 1000 } });
  const res = [];
  for (const u of urls) {
    await p.goto("https://www.eliasb.dev" + u, { waitUntil: "load" });
    const m = await p.evaluate(() => ({ sh: document.documentElement.scrollHeight, ih: innerHeight }));
    if (m.sh <= m.ih) res.push(`${u} (scrollHeight ${m.sh})`);
  }
  console.log(`${W}px: ${urls.length} pages checked; not scrolling: ${res.join(", ") || "none"}`);
  await p.close();
}
// 2) Composite: header strip before vs menu open, shipped vs stable, at 820.
const p = await b.newPage({ viewport: { width: 1700, height: 600 } });
const img = (f) => "data:image/png;base64," + fs.readFileSync(f).toString("base64");
const strip = (f, label) => `<figure style="margin:0"><figcaption style="color:#fff;padding:4px 0;font:14px system-ui">${label}</figcaption><div style="width:820px;height:76px;overflow:hidden;outline:1px solid #444"><img src="${img(f)}" style="display:block"></div></figure>`;
const guide = (x) => `<div style="position:absolute;top:0;bottom:0;left:${x}px;width:1px;background:red;opacity:.7"></div>`;
await p.setContent(`<body style="margin:0;background:#666;padding:12px;width:max-content;position:relative">
 <div style="display:grid;grid-template-columns:820px 820px;gap:12px 24px;position:relative">
 <div style="position:relative">${strip("menu/820-shipped-0/1-before.png", "Shipped: before (scrollbar 15 px)")}${guide(773)}</div>
 <div style="position:relative">${strip("menu/820-stable-0/1-before.png", "scrollbar-gutter: stable: before")}${guide(773)}</div>
 <div style="position:relative">${strip("menu/820-shipped-0/2-open.png", "Shipped: menu open (scrollbar gone; Close right edge at 804)")}${guide(773)}</div>
 <div style="position:relative">${strip("menu/820-stable-0/2-open.png", "stable: menu open (gutter kept; Close right edge at 789)")}${guide(773)}</div>
 </div><p style="color:#fff;font:13px system-ui;margin:8px 0 0">Red line: right edge of the Menu pill before opening (x = 773).</p></body>`);
await p.locator("body").screenshot({ path: "menu/compare-820-header.png" });
await b.close();
