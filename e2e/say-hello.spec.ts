import { expect, test, type Page } from "@playwright/test";
import { profile } from "../src/content/site";
import { sayHello, siteCopy } from "../src/content/stretch/site-copy";
import { contrastOnPaper } from "./support/contrast";

const section = (page: Page) => page.locator("section#say-hello");

test.describe("Say hello and the footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("the copy matches the approved text", async ({ page }) => {
    const heading = section(page).getByRole("heading", { level: 2, name: "Say hello", exact: true });
    await expect(heading).toHaveCount(1);
    await expect(section(page)).toHaveAttribute("aria-labelledby", (await heading.getAttribute("id"))!);
    await expect(heading.getByRole("link", { name: sayHello.bigLink, exact: true })).toBeVisible();
    await expect(section(page).locator(".stretch-section__head")).toHaveCount(0);
    await expect(section(page).locator(".stretch-hello__line")).toHaveText(sayHello.line);
    await expect(section(page).locator(".stretch-hello__link")).toHaveCount(sayHello.links.length);
  });

  test("the big link emails Elias, and it is the one cobalt block", async ({ page }) => {
    const big = section(page).locator(".stretch-hello__big");
    await expect(big).toHaveAttribute("href", profile.links.email);
    expect(profile.links.email.startsWith("mailto:")).toBe(true);
    const [background, link] = await Promise.all([big.evaluate((el) => getComputedStyle(el).backgroundColor), section(page).locator(".stretch-hello__link").first().evaluate((el) => getComputedStyle(el).backgroundColor)]);
    expect(background).not.toBe(link);
  });

  test("GitHub and LinkedIn go where the profile says, in a new tab", async ({ page }) => {
    const outside = sayHello.links.flatMap((entry, index) => (entry.id === "resume" ? [] : [{ ...entry, index }]));
    expect(outside.length).toBe(sayHello.links.length - 1);
    for (const { id, label, index } of outside) {
      const link = section(page).locator(".stretch-hello__link").nth(index);
      await expect(link).toContainText(label);
      await expect(link).toContainText("↗");
      await expect(link).toHaveAttribute("href", profile.links[id]);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noreferrer/);
    }
  });

  test("Résumé opens /resume on this site, with the internal arrow", async ({ page }) => {
    const index = sayHello.links.findIndex(({ id }) => id === "resume");
    const link = section(page).locator(".stretch-hello__link").nth(index);
    await expect(link).toContainText("Résumé");
    await expect(link).toContainText("→");
    await expect(link).not.toContainText("↗");
    await expect(link).toHaveAttribute("href", "/resume");
    await expect(link).not.toHaveAttribute("target", "_blank");
    expect(profile.links.resume).toBe("/resume");
    await link.click();
    await expect(page).toHaveURL(/\/resume$/);
  });

  test("the hero's Say hello button lands on this section", async ({ page }) => {
    await page.getByRole("link", { name: "Say hello", exact: true }).first().click();
    await expect(page).toHaveURL(/#say-hello$/);
    await expect(section(page)).toBeInViewport();
  });

  test("the footer is there, and it is in the server-rendered page", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(page.getByRole("contentinfo")).toHaveText(siteCopy.footer);
    await expect(section(page).locator(".stretch-hello__link")).toHaveCount(3);
  });

  test("every target is at least 44 px and nothing overflows", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    for (const link of await section(page).locator("a").all()) {
      const box = (await link.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("focus is visible on each link", async ({ page }) => {
    for (const link of await section(page).locator("a").all()) {
      await link.focus();
      const outline = await link.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: parseFloat(getComputedStyle(el).outlineWidth) }));
      expect(outline.style).not.toBe("none");
      expect(outline.width).toBeGreaterThanOrEqual(2);
    }
  });

  test("text passes WCAG 2.2 AA contrast", async ({ page }) => {
    for (const selector of [".stretch-hello__big", ".stretch-hello__line", ".stretch-hello__link"]) {
      const readings = await contrastOnPaper(page, `#say-hello ${selector}`);
      expect(readings.length, selector).toBeGreaterThan(0);
      for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
    for (const selector of [".stretch-footer__made", ".stretch-footer__name", ".stretch-hello__address"]) {
      const readings = await contrastOnPaper(page, selector);
      expect(readings.length, selector).toBeGreaterThan(0);
      for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("the address appears in words, as a link that emails Elias", async ({ page }) => {
    const address = profile.links.email.replace(/^mailto:/, "");
    const link = section(page).getByRole("link", { name: address, exact: true });
    await expect(link).toHaveAttribute("href", profile.links.email);
    await expect(link).toHaveText(address);
  });

  test("Say hello is larger than the footer, and the link row stays on one line", async ({ page }) => {
    const size = (selector: string) => page.locator(selector).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const [hello, footer] = await Promise.all([size(".stretch-hello__big"), size(".stretch-footer p")]);
    expect(hello).toBeGreaterThan(footer);
    // Fonts settle after goto, so poll the row count rather than read it once.
    await expect
      .poll(async () => {
        const boxes = await Promise.all((await section(page).locator(".stretch-hello__link").all()).map((link) => link.boundingBox()));
        return new Set(boxes.map((box) => Math.round(box!.y))).size;
      }, { message: "the three links share a row" })
      .toBe(1);
  });
});

// The invariant (#216): Say hello renders larger than the footer at every width, across the breakpoint too.
// The sizes are the stylesheet's own scales: Say hello is clamp(56px, 11vw, 160px) (clamp(46px, 14.4vw, 56px) under 390 px); the footer is the smaller of 12vw (clamp(44px, 7vw, 104px) from 760 px) and 85% of Say hello.
const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);
const expectedSizes = (width: number) => {
  const hello = width < 390 ? clamp(46, width * 0.144, 56) : clamp(56, width * 0.11, 160);
  const own = width < 760 ? width * 0.12 : clamp(44, width * 0.07, 104);
  return { hello, footer: Math.min(own, hello * 0.85) };
};

test.describe("Say hello against the footer at every width", () => {
  for (const width of [320, 390, 600, 759, 760, 820, 1100, 1440, 1920]) {
    test(`at ${width} px`, async ({ page }, testInfo) => {
      test.skip(!/-1440-light$/.test(testInfo.project.name), "Sweeps its own widths: once per engine");
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const sizes = () =>
        page.evaluate(() => [".stretch-hello__big", ".stretch-footer p"].map((selector) => parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize)));
      const expected = expectedSizes(width);
      await expect.poll(async () => (await sizes()).map((size) => Math.round(size))).toEqual([Math.round(expected.hello), Math.round(expected.footer)]);
      const [hello, footer] = await sizes();
      expect(hello).toBeGreaterThan(footer);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
});

// #216: on a phone the Résumé, GitHub and LinkedIn links each stay a 44 px target, on one row.
test("the link row at 390 px is one row of 44 px targets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const links = section(page).locator(".stretch-hello__link");
  await expect(links).toHaveCount(3);
  await expect.poll(async () => {
    const boxes = await Promise.all((await links.all()).map((link) => link.boundingBox()));
    return new Set(boxes.map((box) => Math.round(box!.y))).size;
  }).toBe(1);
  for (const link of await links.all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

// #216: the footer is on every page, so it must also fit on a page that is not the homepage.
test.describe("The footer away from the homepage", () => {
  for (const path of ["/things-i-make/threshold", "/this-page-does-not-exist"]) {
    for (const width of [320, 390]) {
      test(`${path} at ${width} px`, async ({ page }, testInfo) => {
        test.skip(!/-1440-light$/.test(testInfo.project.name), "Sweeps its own widths: once per engine");
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const footer = page.getByRole("contentinfo");
        await expect(footer).toHaveText(siteCopy.footer);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect.poll(async () => {
          const box = await footer.locator("p").boundingBox();
          return box !== null && box.x >= 0 && box.x + box.width <= width;
        }).toBe(true);
      });
    }
  }
});
