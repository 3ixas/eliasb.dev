// Cold-load font swap probe for www.eliasb.dev (ticket #245).
// usage: node fontswap.mjs <width> <profile> <display: swap|block|optional> <outdir>
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const [width, profileName, display, outdir, motion] = process.argv.slice(2);
const W = Number(width);
const H = W < 760 ? 844 : 900;
const PROFILES = {
  // Chrome DevTools presets (Chrome 125+ renamed old "Fast 3G" to "Slow 4G").
  slow4g: { latency: 562.5, downloadThroughput: 180000, uploadThroughput: 84375 },
  none: { latency: 0, downloadThroughput: -1, uploadThroughput: -1 },
  "3g": { latency: 2000, downloadThroughput: 50000, uploadThroughput: 50000 },
};
const prof = PROFILES[profileName];
fs.mkdirSync(outdir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  isMobile: W < 760,
  hasTouch: W < 760,
  reducedMotion: motion === "rm" ? "reduce" : "no-preference",
});
const page = await context.newPage();
page.on("pageerror", e => console.error("pageerror", e.message)); 
const cdp = await context.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
await cdp.send("Network.emulateNetworkConditions", { offline: false, ...prof });

const fd = display.replace("-routed", "");
if (display !== "swap") {
  // Change font-display on the Bricolage faces only; JetBrains Mono stays swap.
  await page.route(/\.css$/, async (route) => {
    const res = await route.fetch();
    let body = await res.text();
    body = body.replace(
      /(@font-face\{font-family:Bricolage Grotesque;[^}]*?)font-display:swap/g,
      `$1font-display:${fd}`,
    );
    console.error("rewrote", (body.match(new RegExp("font-display:" + fd, "g")) || []).length, "faces to", fd);
    await route.fulfill({ response: res, body });
  });
}

await page.addInitScript(() => {
  const t0 = performance.timeOrigin;
  const log = (window.__probe = { samples: [], shifts: [], fontEvents: [], paints: [] });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries())
      log.shifts.push({
        t: e.startTime,
        value: e.value,
        hadRecentInput: e.hadRecentInput,
        sources: (e.sources || []).map((s) => ({
          node: s.node ? (s.node.className || s.node.nodeName).toString().slice(0, 60) : null,
          prev: [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height],
          curr: [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height],
        })),
      });
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) log.paints.push({ name: e.name, t: e.startTime });
  }).observe({ type: "paint", buffered: true });
  document.fonts.addEventListener("loadingdone", (ev) =>
    log.fontEvents.push({
      t: performance.now(),
      faces: ev.fontfaces.map((f) => `${f.family} ${f.status}`),
    }),
  );
  const targets = {
    name: ".stretch-name",
    headline: "h1",
    support: ".stretch-hero__support",
    workHeading: "#work-heading",
    navLink: "header a",
  };
  const sample = () => {
    const s = { t: performance.now(), els: {} };
    for (const [k, sel] of Object.entries(targets)) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      s.els[k] = {
        x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1),
        opacity: cs.opacity,
        transform: cs.transform,
        fontLoaded: (() => { try { return document.fonts.check(`${cs.fontWeight} 16px ${cs.fontFamily.split(",")[0]}`); } catch { return "err"; } })(),
      };
    }
    log.samples.push(s);
    if (performance.now() < 12000) requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
});

// Screencast frames with timestamps.
const frames = [];
cdp.on("Page.screencastFrame", async (f) => {
  frames.push({ ts: f.metadata.timestamp, data: f.data });
  await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});
const fontReqs = [];
cdp.on("Network.requestWillBeSent", (e) => {
  if (/\.woff2/.test(e.request.url)) fontReqs.push({ id: e.requestId, url: e.request.url.split("/").pop(), start: e.timestamp });
});
cdp.on("Network.loadingFinished", (e) => {
  const r = fontReqs.find((x) => x.id === e.requestId);
  if (r) { r.end = e.timestamp; r.bytes = e.encodedDataLength; }
});
let navStart;
cdp.on("Network.requestWillBeSent", (e) => {
  if (e.type === "Document" && navStart === undefined) navStart = e.timestamp;
});

await cdp.send("Page.startScreencast", { format: "jpeg", quality: 70, everyNthFrame: 1 });
await page.goto("https://www.eliasb.dev/", { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(4000);
await cdp.send("Page.stopScreencast");
const probe = await page.evaluate(() => window.__probe); console.error("probe keys", probe && Object.keys(probe), probe && probe.samples.length, probe && JSON.stringify(probe.paints));
await browser.close();

// Save frames relative to navigation start (screencast ts are wall-clock seconds).
const firstTs = frames.length ? frames[0].ts : 0;
const frameIdx = frames.map((f, i) => {
  const file = `frame-${String(i).padStart(3, "0")}.jpg`;
  fs.writeFileSync(path.join(outdir, file), Buffer.from(f.data, "base64"));
  return { file, ts: f.ts };
});
const out = {
  motion: motion || "full",
  width: W, profile: profileName, display,
  fontReqs: fontReqs.map((r) => ({ url: r.url, bytes: r.bytes, startMs: navStart ? Math.round((r.start - navStart) * 1000) : null, endMs: r.end && navStart ? Math.round((r.end - navStart) * 1000) : null })),
  paints: probe.paints, fontEvents: probe.fontEvents, shifts: probe.shifts,
  frames: frameIdx,
  samples: probe.samples,
};
fs.writeFileSync(path.join(outdir, "probe.json"), JSON.stringify(out, null, 1));

// Summary: element boxes at first sample where visible vs last sample; when each changed.
const summ = {};
const first = probe.samples.find((s) => s.els.name) || probe.samples[0];
const last = probe.samples[probe.samples.length - 1];
for (const k of Object.keys(last.els)) {
  const changes = [];
  let prev = null;
  for (const s of probe.samples) {
    const e = s.els[k];
    if (!e) continue;
    const sig = `${e.w}x${e.h}@${e.x},${e.y} op${e.opacity} f${e.fontLoaded}`;
    if (sig !== prev) changes.push({ t: Math.round(s.t), sig });
    prev = sig;
  }
  summ[k] = changes;
}
if (process.env.VERBOSE) console.log(JSON.stringify({
  W, profileName, display,
  fcp: probe.paints, fonts: out.fontReqs, fontEvents: probe.fontEvents.map((f) => ({ t: Math.round(f.t), n: f.faces.length, faces: f.faces })),
  cls: probe.shifts.reduce((a, s) => a + (s.hadRecentInput ? 0 : s.value), 0),
  shifts: probe.shifts.map((s) => ({ t: Math.round(s.t), v: +s.value.toFixed(4), src: s.sources })),
  changes: summ, frames: frames.length,
}, null, 1));
