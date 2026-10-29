import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { notFound, siteCopy } from "../src/content/stretch/site-copy";

test.describe("The 404", () => {
  test("shows the approved copy with a 404 status and no indexing", async ({ page }) => {
    const response = await page.goto("/nothing-here");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(`${notFound.title} · Elias Bennett`);
    await expect(page.getByRole("heading", { level: 1, name: notFound.heading })).toBeVisible();
    await expect(page.getByText(notFound.line)).toBeVisible();
    const robots = await page.locator('meta[name="robots"]').evaluateAll((tags) => tags.map((tag) => tag.getAttribute("content")));
    expect(robots.length).toBeGreaterThan(0);
    for (const content of robots) expect(content).toMatch(/noindex/);
  });

  test("shows the new header: the portrait, the name leading home, the greeting and the Eclipse, and no section links", async ({ page }) => {
    await page.goto("/nothing-here");
    const header = page.locator("[data-stretch-header]");
    const home = header.getByRole("link", { name: "Elias Bennett, home" });
    await expect(home).toHaveAttribute("href", "/");
    await expect(header.locator(".qi-header__face")).toBeVisible();
    await expect(home).toHaveText("Elias Bennett");
    expect((await home.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(header.locator("[data-greeting]")).toBeVisible();
    await expect(header.locator("[data-eclipse]")).toBeVisible();
    // The 404 has no sections of its own, so the header has no links and no menu.
    await expect(header.getByRole("navigation")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Menu", exact: true })).toHaveCount(0);
    await home.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("on a wide screen the Eclipse stays at the right edge, and London's time never paints over it", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 900, "The header's single row starts at 900 px");
    await page.goto("/nothing-here");
    const greeting = page.locator("[data-greeting]");
    // The greeting is a tab stop once it has hydrated for a wide screen, which is also when it can read London's time.
    await expect(greeting).toHaveAttribute("tabindex", "0");
    await greeting.hover();
    const more = page.locator(".qi-greeting__more");
    await expect(more).toHaveCSS("opacity", "1");
    const [time, eclipse, inner] = await Promise.all(
      [more, page.locator("[data-eclipse]"), page.locator(".qi-header__inner")].map(async (locator) => (await locator.boundingBox())!),
    );
    expect(time.x + time.width).toBeLessThanOrEqual(eclipse.x);
    // The Eclipse's own margin pulls its icon in line with the column's edge; it is the header's last item.
    expect(Math.abs(eclipse.x + eclipse.width - (inner.x + inner.width))).toBeLessThanOrEqual(12);
  });

  test("the missing row shows the address asked for, struck through, and is not a link", async ({ page }) => {
    await page.goto("/nothing-here/at-all");
    const row = page.locator("[data-missing] .qi-row");
    await expect(row.locator(".qi-missing__address")).toHaveText("/nothing-here/at-all");
    await expect(row.locator(".qi-missing__address")).toHaveCSS("text-decoration-line", "line-through");
    await expect(row.locator(".qi-empty")).toBeVisible();
    await expect(row.locator(".qi-row__line")).toHaveText(notFound.missing.line);
    // The status is cobalt metadata, kept on a phone too.
    const status = row.locator(".qi-row__meta");
    await expect(status).toHaveText(notFound.missing.meta);
    await expect(status).toBeVisible();
    // Not a link, and not a tab stop.
    await expect(page.locator("[data-missing] a")).toHaveCount(0);
    await expect(row).not.toHaveAttribute("tabindex", /.*/);
  });

  test("the prerendered HTML never names a wrong address", async ({ request }) => {
    const html = await (await request.get("/nothing-here/at-all")).text();
    // The page is built once for every missing address, so the row fills its address in the browser.
    expect(html).not.toContain("_not-found</span>");
    expect(html).toContain("qi-missing__address");
  });

  test("a 100-character address is shortened in the middle and stays readable", async ({ page }) => {
    const long = `/${"a-very-long-lost-address-".repeat(5)}end`.slice(0, 100);
    expect(long).toHaveLength(100);
    await page.goto(long);
    const address = page.locator(".qi-missing__address");
    // The first 23 and last 23 characters around one ellipsis.
    await expect(address).toHaveText(`${long.slice(0, 23)}…${long.slice(-23)}`);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    // The whole row stays on screen, so no part of the address is cut off.
    await expect
      .poll(async () => {
        const box = (await address.boundingBox())!;
        return box.x >= 0 && box.x + box.width <= page.viewportSize()!.width;
      })
      .toBe(true);
  });

  test("shortening never splits an emoji at the cut", async ({ page }) => {
    // The 23rd character is an emoji: two UTF-16 units that must stay together.
    const address = `/${"a".repeat(21)}😀${"b".repeat(60)}`;
    await page.goto(encodeURI(address));
    await expect(page.locator(".qi-missing__address")).toHaveText(`/${"a".repeat(21)}😀…${"b".repeat(23)}`);
  });

  test("says what to try: the five homepage sections as rows, in the page's order, each with its object", async ({ page }) => {
    await page.goto("/nothing-here");
    await expect(page.getByRole("heading", { level: 2, name: notFound.tryTitle })).toBeVisible();
    await expect(page.getByText(notFound.tryNote)).toBeVisible();
    const rows = page.locator("main a.qi-row");
    await expect(rows).toHaveCount(5);
    // The object is a picture; the words are the row's title and line.
    await expect(rows.locator(".qi-row__text")).toHaveText(siteCopy.menu.map(({ id, label }) => `${label}${notFound.tryLines[id]}`));
    for (const [index, { id }] of siteCopy.menu.entries()) {
      await expect(rows.nth(index)).toHaveAttribute("href", `/#${id}`);
      await expect.poll(async () => (await rows.nth(index).locator(".qi-row__object").boundingBox())?.width).toBe(44);
    }
    for (const index of [0, 4]) await expect.poll(async () => (await rows.nth(index).boundingBox())?.height).toBeGreaterThanOrEqual(44);
    // The objects: the BNP mini pass, Threshold's crop, the ringed number, today's tile and the Sheet.
    for (const object of [".qi-mini", ".qi-crop", ".qi-number .qi-ink", ".qi-tile[data-today]", ".qi-sheet"]) await expect(page.locator(`main a.qi-row ${object}`)).toHaveCount(1);
    await rows.nth(2).click();
    await expect(page).toHaveURL(/\/#how-i-work$/);
  });

  test("today's tile shows the visitor's own day", async ({ page }) => {
    await page.goto("/nothing-here");
    await expect(page.locator(".qi-tile[data-today] .qi-tile__number")).toHaveText(await page.evaluate(() => String(new Date().getDate())));
  });

  test("the lost-property tag and the numbered rows are gone, and there is one h1", async ({ page }) => {
    await page.goto("/nothing-here");
    await expect(page.locator("[data-lost-property], .stretch-404, .stretch-index")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("has no sideways scroll and no axe violations", async ({ page }) => {
    await page.goto("/nothing-here");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Redirects from the old routes", () => {
  for (const [from, anchor] of [
    ["/about", "#work"],
    ["/lab", "#off-the-clock"],
    ["/library", "#off-the-clock"],
  ] as const) {
    test(`${from} redirects permanently to /${anchor}`, async ({ request, page }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      expect(response.headers()["location"]).toBe(`/${anchor}`);
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`/${anchor}$`));
      await expect(page.locator(anchor)).toHaveCount(1);
    });
  }
});
