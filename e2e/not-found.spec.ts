import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { notFound, siteCopy } from "../src/content/stretch/site-copy";
import { renderedContrast } from "./support/rendered-contrast";

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

  test("shows the shared header: the name leading home, the greeting, the links to the homepage's sections and the theme control", async ({ page }) => {
    await page.goto("/nothing-here");
    const header = page.locator("[data-site-header]");
    const home = header.getByRole("link", { name: "Elias Bennett", exact: true });
    await expect(home).toHaveAttribute("href", "/");
    expect((await home.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(header.locator("img")).toHaveCount(0);
    await expect(header.locator("[data-eclipse]")).toBeVisible();
    expect(await header.getByRole("navigation", { includeHidden: true }).locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(
      ["work", "things-i-make", "how-i-work", "off-the-clock", "say-hello"].map((id) => `/#${id}`),
    );
    await home.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("on a wide screen London's time never paints over the links or the theme control", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 900, "London's time hangs beside the greeting from 900 px");
    await page.goto("/nothing-here");
    const greeting = page.locator("[data-greeting]");
    // The greeting is a tab stop once it has hydrated for a wide screen, which is also when it can read London's time.
    await expect(greeting).toHaveAttribute("tabindex", "0");
    await greeting.hover();
    const more = page.locator(".greeting__more");
    await expect(more).toHaveCSS("opacity", "1");
    const [time, nav, eclipse, header] = await Promise.all(
      [more, page.locator(".site-nav"), page.locator("[data-eclipse]"), page.locator("[data-site-header]")].map(async (locator) => (await locator.boundingBox())!),
    );
    expect(time.x + time.width).toBeLessThanOrEqual(eclipse.x);
    const linksShown = await page.locator(".site-header__links").evaluate((element) => getComputedStyle(element).opacity === "1");
    if (linksShown) expect(time.x + time.width).toBeLessThanOrEqual(nav.x);
    // The theme control is the header's last item, at the page's right gutter.
    expect(Math.abs(eclipse.x + eclipse.width - (header.x + header.width - 32))).toBeLessThanOrEqual(1);
  });

  test("the missing line shows the address asked for, struck through, with Not on file and 404 in cobalt, and is not a link", async ({ page }) => {
    await page.goto("/nothing-here/at-all");
    const missing = page.locator("[data-missing]");
    await expect(missing.locator("s")).toHaveText("/nothing-here/at-all");
    await expect(missing.locator("s")).toHaveCSS("text-decoration-line", "line-through");
    await expect(missing.locator("span:not(.missing__address)")).toHaveText(notFound.missing.line);
    const status = missing.locator("b");
    await expect(status).toHaveText(notFound.missing.meta);
    await expect(status).toBeVisible();
    const cobalt = await page.evaluate(() => {
      const probe = document.body.appendChild(document.createElement("i"));
      probe.style.color = "var(--cobalt)";
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });
    await expect(status).toHaveCSS("color", cobalt);
    await expect(missing.locator("a")).toHaveCount(0);
  });

  test("the prerendered HTML never names a wrong address", async ({ request }) => {
    const html = await (await request.get("/nothing-here/at-all")).text();
    // The page is built once for every missing address, so the row fills its address in the browser.
    expect(html).not.toContain("_not-found</span>");
    expect(html).toContain("missing__address");
  });

  test("a 100-character address is shortened in the middle and stays readable", async ({ page }) => {
    const long = `/${"a-very-long-lost-address-".repeat(5)}end`.slice(0, 100);
    expect(long).toHaveLength(100);
    await page.goto(long);
    const address = page.locator(".missing__address");
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
    await expect(page.locator(".missing__address")).toHaveText(`/${"a".repeat(21)}😀…${"b".repeat(23)}`);
  });

  test("says what to try: the five homepage sections as rows, in the page's order, with the copy deck's lines", async ({ page }) => {
    await page.goto("/nothing-here");
    await expect(page.getByRole("heading", { level: 2, name: notFound.tryTitle })).toBeVisible();
    await expect(page.getByText(notFound.tryNote)).toBeVisible();
    const rows = page.locator("main .rows a.row");
    await expect(rows).toHaveCount(5);
    await expect(rows.locator(".row__name")).toHaveText(siteCopy.menu.map(({ label }) => label));
    await expect(rows.locator(".row__line")).toHaveText(siteCopy.menu.map(({ id }) => notFound.tryLines[id]));
    for (const [index, { id }] of siteCopy.menu.entries()) {
      await expect(rows.nth(index)).toHaveAttribute("href", `/#${id}`);
      expect((await rows.nth(index).boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await rows.nth(2).click();
    await expect(page).toHaveURL(/\/#how-i-work$/);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`every text pair passes AA on the rendered page, and nothing is under 13 px (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto("/nothing-here/at-all");
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator(".missing__address")).toHaveText("/nothing-here/at-all");
      const texts = await page.locator(".not-found").innerText();
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of [notFound.heading, "/nothing-here/at-all", notFound.missing.line, notFound.missing.meta, notFound.tryLines.work]) {
        expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll(".not-found *")]
          .filter((element) => [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim()))
          .filter((element) => !element.closest("[aria-hidden='true'], .sr-only") && parseFloat(getComputedStyle(element).fontSize) < 13)
          .map((element) => element.textContent),
      );
      expect(small).toEqual([]);
    });
  }

  test("the keyboard reaches each row in order, each with a visible ring", async ({ page }, testInfo) => {
    await page.goto("/nothing-here");
    const tab = testInfo.project.name.startsWith("webkit") ? "Alt+Tab" : "Tab";
    const reached: string[] = [];
    await page.locator("body").focus();
    for (let step = 0; step < 30 && reached.length < 5; step++) {
      await page.keyboard.press(tab);
      const focused = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element?.closest(".not-found")) return null;
        const style = getComputedStyle(element);
        return { href: element.getAttribute("href") ?? "", ring: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2 };
      });
      if (!focused) continue;
      expect(focused.ring, focused.href).toBe(true);
      reached.push(focused.href);
    }
    expect(reached).toEqual(siteCopy.menu.map(({ id }) => `/#${id}`));
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
