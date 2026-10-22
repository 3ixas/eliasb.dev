// Renders /resume to public/Elias-Bennett-Resume.pdf, which is committed. Run it after changing anything
// the sheet shows, against a running site: `pnpm resume:pdf` (default http://127.0.0.1:3100, or RESUME_BASE_URL).
// Playwright and its Chromium are dev tools only, so the Vercel build never needs them; verify:resume
// fails when the committed file no longer matches the sheet.
import { writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { resumeOrigin, resumePdf } from "../src/content/resume.ts";

const base = process.env.RESUME_BASE_URL ?? "http://127.0.0.1:3100";
const browser = await chromium.launch();
try {
  // The sheet is light paper in either theme and prints light; asking for the light scheme keeps the desk's own colours out of it.
  const page = await browser.newPage({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto(`${base}/resume`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // The page links to its own paths; the PDF travels, so its links point at the public site.
  await page.evaluate((origin) => {
    for (const link of document.querySelectorAll('a[href^="/"]')) link.setAttribute("href", new URL(link.getAttribute("href"), origin).href);
  }, resumeOrigin);
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  await writeFile(new URL(`../${resumePdf.file}`, import.meta.url), pdf);
  console.log(`Wrote ${resumePdf.file} (${(pdf.length / 1024).toFixed(0)} KB) from ${base}/resume.`);
} finally {
  await browser.close();
}
