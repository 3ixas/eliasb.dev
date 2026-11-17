import { chromium } from "@playwright/test";
const [url, out, ...clicks] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
for (const c of clicks) {
  if (c.startsWith("select:")) { const [, sel, val] = c.split(":"); await page.locator(sel).selectOption({ label: val }); await page.waitForTimeout(600); continue; }
  if (c.startsWith("fill:")) { const [, sel, val] = c.split(":"); await page.locator(sel).first().fill(val); continue; }
  if (c.startsWith("role:")) { await page.getByRole("button", { name: new RegExp(c.slice(5), "i") }).or(page.getByRole("link", { name: new RegExp(c.slice(5), "i") })).first().click(); }
  else await page.getByText(c, { exact: true }).first().click();
  await page.waitForTimeout(1000);
}
await page.screenshot({ path: out, fullPage: true });
console.log(page.url());
console.log((await page.locator("body").innerText()).slice(0, 3000));
console.log("INPUTS", await page.locator("input,select").evaluateAll((els) => els.map((e) => `${e.tagName} ${e.type} name=${e.name} id=${e.id} aria=${e.getAttribute("aria-label")} ph=${e.placeholder}`)));
await browser.close();
