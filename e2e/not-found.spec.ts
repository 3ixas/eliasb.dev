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

  test("shows the new header: the portrait and name lead home, the greeting and the Eclipse, and no section links", async ({ page }) => {
    await page.goto("/nothing-here");
    const header = page.locator("[data-stretch-header]");
    const home = header.getByRole("link", { name: "Elias Bennett, home" });
    await expect(home).toHaveAttribute("href", "/");
    await expect(home.locator(".qi-header__face")).toBeVisible();
    await expect(home.locator(".qi-header__name")).toHaveText("Elias Bennett");
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

  test("the link home is a 44 px target and works", async ({ page }) => {
    await page.goto("/nothing-here");
    const back = page.getByRole("link", { name: "Back to the homepage" });
    expect((await back.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await back.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("the lost-property tag shows the address asked for", async ({ page }) => {
    await page.goto("/nothing-here/at-all");
    const tag = page.locator("[data-lost-property]");
    await expect(tag.getByText(notFound.tag.title)).toBeVisible();
    await expect(tag.locator("dt", { hasText: notFound.tag.item })).toBeVisible();
    await expect(tag.locator(".stretch-404__address")).toHaveText("/nothing-here/at-all");
    await expect(tag.getByText(notFound.tag.foundAtValue)).toBeVisible();
    await expect(tag.getByText(notFound.tag.returnToValue)).toBeVisible();
    await expect(tag.getByText(notFound.tag.stamp)).toBeVisible();
    // It hangs beside the text on a wide screen and below it on a phone.
    const phone = (page.viewportSize()?.width ?? 0) <= 760;
    await expect
      .poll(async () => {
        const copy = (await page.locator(".stretch-404__copy").boundingBox())!;
        const hang = (await page.locator(".stretch-404__hang").boundingBox())!;
        return phone ? hang.y >= copy.y + copy.height : hang.x >= copy.x + copy.width - 1;
      })
      .toBe(true);
  });

  test("the prerendered HTML never names a wrong address", async ({ request }) => {
    const html = await (await request.get("/nothing-here/at-all")).text();
    // The page is built once for every missing address, so the tag fills its address in the browser.
    expect(html).not.toContain("_not-found</dd>");
    expect(html).toContain("stretch-404__address");
  });

  test("a 100-character address is shortened in the middle and stays readable", async ({ page }) => {
    const long = `/${"a-very-long-lost-address-".repeat(5)}end`.slice(0, 100);
    expect(long).toHaveLength(100);
    await page.goto(long);
    const address = page.locator("[data-lost-property] .stretch-404__address");
    // The first 23 and last 23 characters around one ellipsis.
    await expect(address).toHaveText(`${long.slice(0, 23)}…${long.slice(-23)}`);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    // The whole tag stays on screen, so no part of the address is cut off.
    await expect
      .poll(async () => {
        const box = (await page.locator("[data-lost-property]").boundingBox())!;
        return box.x >= 0 && box.x + box.width <= page.viewportSize()!.width;
      })
      .toBe(true);
  });

  test("shortening never splits an emoji at the cut", async ({ page }) => {
    // The 23rd character is an emoji: two UTF-16 units that must stay together.
    const address = `/${"a".repeat(21)}😀${"b".repeat(60)}`;
    await page.goto(encodeURI(address));
    await expect(page.locator("[data-lost-property] .stretch-404__address")).toHaveText(`/${"a".repeat(21)}😀…${"b".repeat(23)}`);
  });

  test("five rows lead to the homepage's sections, in the page's order", async ({ page }) => {
    await page.goto("/nothing-here");
    const rows = page.getByRole("navigation", { name: notFound.orTry }).getByRole("link");
    await expect(rows).toHaveText(siteCopy.menu.map(({ label }, index) => `${String(index + 1).padStart(2, "0")}${label}→`));
    await expect(rows).toHaveCount(5);
    for (const [index, { id }] of siteCopy.menu.entries()) await expect(rows.nth(index)).toHaveAttribute("href", `/#${id}`);
    for (const index of [0, 4]) await expect.poll(async () => (await rows.nth(index).boundingBox())?.height).toBeGreaterThanOrEqual(44);
    // The phone rules share a class with the Project index; the rows still lay out as a number, a name and an arrow.
    await expect(rows.first()).toHaveCSS("grid-template-columns", /^\S+ \S+ \S+$/);
    await rows.nth(2).click();
    await expect(page).toHaveURL(/\/#how-i-work$/);
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
