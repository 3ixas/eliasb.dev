import { expect, test, type Page } from "@playwright/test";
import { profile } from "../src/content/site";
import { sayHello } from "../src/content/stretch/site-copy";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * Say hello, which ends every page (docs/design/DESIGN.md "Say hello", R-10): under a 1 px ink rule, the title; the
 * email in Newsreader 300 with a cobalt underline, and Copy; then Résumé, GitHub and LinkedIn in Newsreader 21 px.
 * If the browser refuses the clipboard, Copy selects the address. No page has any other footer.
 */

const section = (page: Page) => page.locator("section#say-hello");
const address = profile.links.email.replace(/^mailto:/, "");
/** Found by class, not name: its name changes to "Copied". */
const copyButton = (page: Page) => section(page).locator(".copy-button");
const links = (page: Page) => section(page).locator(".say-hello__links a");
const hydrated = (page: Page) => expect(copyButton(page)).toBeVisible();

test.describe("Say hello", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("is the title under an ink rule, then the email and Copy, then Résumé, GitHub and LinkedIn", async ({ page }) => {
    const heading = section(page).getByRole("heading", { level: 2, name: "Say hello", exact: true });
    await expect(heading).toHaveCount(1);
    await expect(section(page)).toHaveAttribute("aria-labelledby", (await heading.getAttribute("id"))!);
    const ink = await page.evaluate(() => getComputedStyle(document.body).color);
    await expect(heading).toHaveCSS("border-top", `1px solid ${ink}`);
    // Nothing is written under the heading: the email and its button are the line.
    await expect(section(page).locator("p:visible")).toHaveCount(0);
    expect(await section(page).locator("a[href]").evaluateAll((all) => all.map((link) => link.getAttribute("href")))).toEqual([
      profile.links.email,
      profile.links.resume,
      profile.links.github,
      profile.links.linkedin,
    ]);
    const email = section(page).getByRole("link", { name: address, exact: true });
    await expect(email).toHaveCSS("font-weight", "300");
    expect(await email.evaluate((element) => getComputedStyle(element).fontFamily)).toMatch(/^Newsreader/);
    // The underline is cobalt.
    const cobalt = await page.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.color = getComputedStyle(document.documentElement).getPropertyValue("--cobalt");
      document.body.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });
    await expect(email).toHaveCSS("text-decoration-line", "underline");
    await expect(email).toHaveCSS("text-decoration-color", cobalt);
    for (const [index, { label }] of sayHello.links.entries()) {
      await expect(links(page).nth(index)).toContainText(label);
      await expect(links(page).nth(index)).toHaveCSS("font-size", "21px");
    }
  });

  test("Copy puts the address on the clipboard and says Copied in the same width, then goes back", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Only Chromium can grant clipboard reads");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = copyButton(page);
    await hydrated(page);
    await expect(copy).toHaveAccessibleName(sayHello.copy);
    const quiet = await copy.evaluate((element) => getComputedStyle(element).backgroundColor);
    const quietWidth = (await copy.boundingBox())!.width;
    await copy.click();
    // Away from the button, so the fill is Copied's own and not hover's.
    await page.mouse.move(0, 0);
    await expect(copy).toHaveAccessibleName(sayHello.copied);
    expect((await copy.boundingBox())!.width).toBe(quietWidth);
    await expect(section(page).getByRole("status")).toHaveText(sayHello.copied);
    // It fills with ink while it says so.
    const ink = await page.evaluate(() => getComputedStyle(document.body).color);
    await expect.poll(() => copy.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(ink);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(address);
    await expect(copy).toHaveAccessibleName(sayHello.copy, { timeout: 5000 });
    await expect.poll(() => copy.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(quiet);
  });

  test("when the browser refuses the clipboard, Copy selects the address instead", async ({ page }) => {
    await hydrated(page);
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new DOMException("Denied", "NotAllowedError")) } });
    });
    await copyButton(page).click();
    await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe(address);
    await expect(copyButton(page)).toHaveAccessibleName(sayHello.copy);
  });

  test("without script the email is still a working link and there is no dead button", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(section(page).getByRole("link", { name: address, exact: true })).toHaveAttribute("href", profile.links.email);
    await expect(copyButton(page)).toBeHidden();
    await expect(links(page)).toHaveCount(3);
  });

  test("Résumé opens /resume on this site, with the internal arrow", async ({ page }) => {
    const link = links(page).filter({ hasText: "Résumé" });
    await expect(link).toHaveAttribute("href", "/resume");
    await expect(link).not.toHaveAttribute("target", /.*/);
    await expect(link.locator(".arrow")).toHaveText("→");
    await expect(link).toHaveAccessibleName("Résumé");
    await link.click();
    await expect(page).toHaveURL(/\/resume$/);
  });

  test("GitHub and LinkedIn go where the profile says, in a new tab, marked ↗", async ({ page }) => {
    for (const { id, label } of sayHello.links.filter(({ id }) => id !== "resume")) {
      const link = links(page).filter({ hasText: label });
      await expect(link).toHaveAttribute("href", profile.links[id]);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noreferrer/);
      await expect(link.locator(".arrow")).toHaveText("↗");
      await expect(link).toHaveAccessibleName(new RegExp(`^${label} opens .+ in a new tab$`));
    }
  });

  test("the header's Say hello link lands on this section", async ({ page }) => {
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    if (await menu.isVisible()) {
      await expect.poll(() => menu.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
      await menu.click();
    }
    await page.locator("[data-site-header]").getByRole("link", { name: "Say hello", exact: true }).click();
    await expect(page).toHaveURL(/#say-hello$/);
    await expect(section(page)).toBeInViewport();
  });

  test("every target is at least 44 px and nothing overflows", async ({ page }) => {
    await hydrated(page);
    const width = page.viewportSize()?.width ?? 0;
    for (const target of await section(page).locator("a, button:visible").all()) {
      const box = (await target.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("focus is the one ring, 2 px cobalt at 3 px offset, on the email, Copy and each link", async ({ page, browserName }) => {
    await hydrated(page);
    // Safari does not Tab to links by default, so there only Copy is reached from the keyboard.
    for (const target of await section(page).locator(browserName === "webkit" ? "button:visible" : "a, button:visible").all()) {
      await target.focus();
      // Focus from script is not keyboard focus in Chromium; Tab back and forth makes it so. WebKit has no tab stop on the
      // email before Copy, and shows the ring on focus from script after no pointer use.
      if (browserName !== "webkit") {
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
      }
      await expect(target).toBeFocused();
      const ring = await target.evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.outlineStyle, style.outlineWidth, style.outlineOffset];
      });
      expect(ring).toEqual(["solid", "2px", "3px"]);
    }
  });
});

test.describe("The shell's text", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`every text in the header and Say hello passes AA and is at least 13 px (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto("/resume");
      await hydrated(page);
      const sizes = await page.locator("[data-site-header], .say-hello").evaluateAll((parts) =>
        parts.flatMap((part) =>
          [...part.querySelectorAll<HTMLElement>("*")]
            .filter((element) => [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim()) && element.getClientRects().length > 0)
            .map((element) => [element.textContent!.trim(), parseFloat(getComputedStyle(element).fontSize)] as const),
        ),
      );
      expect(sizes.length).toBeGreaterThan(5);
      for (const [text, size] of sizes) expect(size, text).toBeGreaterThanOrEqual(13);
      const shellTexts = new Set(sizes.map(([text]) => text));
      const readings = (await renderedContrast(page)).filter((reading) => [...shellTexts].some((text) => reading.text.includes(text) || text.includes(reading.text)));
      expect(readings.some((reading) => reading.text.includes(address))).toBe(true);
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });
  }
});

// Say hello is the last thing on every page, and no page has any other footer.
test.describe("No footer", () => {
  for (const path of ["/", "/things-i-make", "/things-i-make/threshold", "/work/joveen", "/resume", "/this-page-does-not-exist"]) {
    test(`${path} ends on Say hello`, async ({ page }, testInfo) => {
      test.skip(!/-(390|1440)-light$/.test(testInfo.project.name), "Sweeps its own pages: once per engine and width");
      await page.goto(path);
      await expect(page.getByRole("contentinfo")).toHaveCount(0);
      await expect(page.locator(".stretch-footer")).toHaveCount(0);
      await expect(section(page)).toHaveCount(1);
      const last = await page.evaluate(() => {
        const content = [...document.querySelectorAll("[data-stretch-shell] *")].filter((element) => element.getClientRects().length > 0);
        const bottom = Math.max(...content.map((element) => element.getBoundingClientRect().bottom));
        return document.querySelector("section#say-hello")!.getBoundingClientRect().bottom >= bottom - 0.5;
      });
      expect(last).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
});
