// Renders the committed PNG assets for share cards under public/share/:
// 1. Each employer's StaffPass captured from its live Role story page (transparent background, punched slot
//    kept transparent behind the metal clip so the pass sits cleanly on both the page colour and its employer field).
// 2. Crisp PNG copies of each featured case study's WebP screenshot (Satori/resvg drops image/webp silently).
// Run against a running site: `SHARE_BASE_URL=http://127.0.0.1:3115 pnpm share:assets`.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import {
  RENDER_VERSION,
  SHARE_ASSET_DIR,
  SHARE_MANIFEST_PATH,
  expectedShareAssets,
  pngDimensions,
} from "./share-assets-fingerprint.mjs";

const base = process.env.SHARE_BASE_URL ?? "http://127.0.0.1:3100";
const expected = expectedShareAssets();
const assetsOut = {};

async function saveSharePng(name, spec, png, extra = {}) {
  const { width, height } = pngDimensions(png, spec.path);
  await writeFile(new URL(`../${spec.path}`, import.meta.url), png);
  assetsOut[name] = { width, height, ...extra, fingerprint: spec.fingerprint };
  console.log(`Wrote ${spec.path} (${width}×${height}, ${(png.length / 1024).toFixed(0)} KB).`);
}

await mkdir(new URL(`../${SHARE_ASSET_DIR}`, import.meta.url), { recursive: true });

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    colorScheme: "light",
    reducedMotion: "reduce",
    deviceScaleFactor: 2,
    viewport: { width: 1280, height: 1000 },
  });
  const page = await context.newPage();

  for (const [name, spec] of Object.entries(expected)) {
    if (spec.kind !== "pass") continue;
    await page.goto(`${base}/work/${spec.slug}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    // Isolate the printed StaffPass at a uniform crisp size with generous lanyard drop above the card.
    const metrics = await page.evaluate(async () => {
      const pass = document.querySelector(".pass");
      if (!pass) throw new Error("No .pass element found on page.");

      const photo = pass.querySelector(".pass__photo");
      if (photo instanceof HTMLImageElement) {
        photo.loading = "eager";
        await photo.decode().catch(() => {});
      }

      const stage = document.createElement("div");
      stage.id = "share-pass-stage";
      stage.style.cssText = [
        "position: fixed",
        "inset: 0",
        "z-index: 99999",
        "display: flex",
        "justify-content: center",
        "align-items: flex-start",
        "background: transparent",
        "pointer-events: none",
      ].join(";");

      const clone = pass.cloneNode(true);
      clone.style.setProperty("--card", "264px");
      clone.style.setProperty("--drop", "280px");
      clone.style.margin = "0";
      clone.style.animation = "none";
      clone.style.transition = "none";
      const clonePhoto = clone.querySelector(".pass__photo");
      if (clonePhoto instanceof HTMLImageElement) {
        clonePhoto.loading = "eager";
        await clonePhoto.decode().catch(() => {});
      }

      for (const child of [...document.body.children]) {
        if (child instanceof HTMLElement) child.style.visibility = "hidden";
      }
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";
      stage.appendChild(clone);
      document.body.appendChild(stage);

      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const card = clone.querySelector(".pass__card").getBoundingClientRect();
      const slotEl = clone.querySelector(".pass__slot");
      const slot = slotEl.getBoundingClientRect();
      const tiltDeg = Number.parseFloat(getComputedStyle(clone).getPropertyValue("--tilt")) || 0;
      const padX = 28;
      const padBottom = 42;
      const clip = {
        x: Math.max(0, Math.floor(card.left - padX)),
        y: 0,
        width: Math.ceil(card.width + padX * 2),
        height: Math.ceil(card.bottom + padBottom),
      };
      return {
        clip,
        padX,
        slot: {
          cx: slot.left + slot.width / 2 - clip.x,
          cy: slot.top + slot.height / 2 - clip.y,
          width: slotEl.offsetWidth,
          height: slotEl.offsetHeight,
          tiltRad: (tiltDeg * Math.PI) / 180,
        },
      };
    });

    // 1. Capture card + lanyard without the metal clip, so we can punch the slot hole cleanly to transparent.
    await page.evaluate(() => {
      const clip = document.querySelector("#share-pass-stage .pass__clip");
      if (clip) clip.style.visibility = "hidden";
    });
    const basePng = await page.screenshot({ clip: metrics.clip, omitBackground: true });

    // 2. Capture the metal clip alone at the exact same clip rectangle.
    await page.evaluate(() => {
      const stage = document.querySelector("#share-pass-stage");
      const pass = stage.querySelector(".pass");
      for (const el of pass.querySelectorAll(".pass__lanyard, .pass__card")) el.style.visibility = "hidden";
      const clip = pass.querySelector(".pass__clip");
      if (clip) clip.style.visibility = "visible";
    });
    const clipPng = await page.screenshot({ clip: metrics.clip, omitBackground: true });

    // 3. Punch the inner slot pill transparent on the base layer, then composite the clip back on top.
    const combinedBase64 = await page.evaluate(
      async ({ base64Base, base64Clip, slot, scale }) => {
        const load = (b64) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = `data:image/png;base64,${b64}`;
          });
        const [baseImg, clipImg] = await Promise.all([load(base64Base), load(base64Clip)]);
        const canvas = document.createElement("canvas");
        canvas.width = baseImg.naturalWidth;
        canvas.height = baseImg.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(baseImg, 0, 0);

        const inset = 1.5 * scale;
        const sw = Math.max(0, slot.width * scale - inset * 2);
        const sh = Math.max(0, slot.height * scale - inset * 2);
        const sr = sh / 2;
        ctx.save();
        ctx.translate(slot.cx * scale, slot.cy * scale);
        ctx.rotate(slot.tiltRad);
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.roundRect(-sw / 2, -sh / 2, sw, sh, sr);
        ctx.fill();
        ctx.restore();

        ctx.drawImage(clipImg, 0, 0);
        return canvas.toDataURL("image/png").split(",")[1];
      },
      {
        base64Base: basePng.toString("base64"),
        base64Clip: clipPng.toString("base64"),
        slot: metrics.slot,
        scale: 2,
      },
    );

    await saveSharePng(name, spec, Buffer.from(combinedBase64, "base64"), { shadowPadX: metrics.padX * 2 });
  }

  // Convert each featured case study's WebP screenshot to a crisp 2x PNG for Satori/resvg.
  await page.setContent("<!doctype html><html><body></body></html>");
  for (const [name, spec] of Object.entries(expected)) {
    if (spec.kind !== "screenshot") continue;
    const webpBytes = await readFile(new URL(`../${spec.source}`, import.meta.url));
    const pngBase64 = await page.evaluate(
      async ({ b64, maxWidth }) => {
        const img = await new Promise((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = `data:image/webp;base64,${b64}`;
        });
        const scale = Math.min(1, maxWidth / img.naturalWidth);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/png").split(",")[1];
      },
      { b64: webpBytes.toString("base64"), maxWidth: 1080 },
    );

    await saveSharePng(name, spec, Buffer.from(pngBase64, "base64"));
  }

  const manifest = { version: RENDER_VERSION, assets: assetsOut };
  await writeFile(new URL(`../${SHARE_MANIFEST_PATH}`, import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${SHARE_MANIFEST_PATH}.`);
} finally {
  await browser.close();
}
