import { expect, test, type Page } from "@playwright/test";
import { siteCopy } from "../src/content/stretch/site-copy";
import { tap } from "./support/tap";

/*
 * The header portrait's closer look (docs/design/DESIGN.md, "Closer looks", "Your face (header)"): the full
 * white-tux portrait and "Based in London". From 1180 px with a hovering pointer, hover or focus shows it in the
 * margin, below the header; below that, tapping the portrait opens it inline, under the header's row.
 */

const { portrait } = siteCopy.header;
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1180;
const face = (page: Page) => page.getByRole("button", { name: "A closer look at Elias" });
const margin = (page: Page) => page.locator(".qi-margin");
const inline = (page: Page) => page.locator(".qi-header .qi-inline__in");

const pages = [
  { name: "the homepage", path: "/" },
  { name: "the 404", path: "/nothing-here" },
];

for (const { name, path } of pages) {
  test.describe(`The portrait on ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      // The controller listens once the page has hydrated; the greeting's tab stop is the same moment for a wide screen.
      await expect(page.locator("[data-greeting]")).toBeVisible();
      await expect.poll(() => face(page).evaluate((button) => Object.keys(button.closest(".qi-header__inner")!).some((key) => key.startsWith("__reactProps$")))).toBe(true);
    });

    test("is a button with a name and the caption as its description, and the caption is hidden until the look shows", async ({ page }) => {
      await expect(face(page)).toHaveAccessibleName("A closer look at Elias");
      await expect(face(page)).toHaveAccessibleDescription(portrait.caption);
      await expect(face(page).locator("img")).toHaveAttribute("alt", "");
      expect((await face(page).boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await expect(page.getByText(portrait.caption)).toBeHidden();
      // A sibling of the name, never inside the home link.
      await expect(page.locator("a button, button a")).toHaveCount(0);
    });

    test.describe("on a wide screen with a hovering pointer", () => {
      test.skip(({ page }) => !wide(page), "Phones and narrow windows open the look inline");

      test("hover shows the full portrait and its caption in the margin, below the header and clear of the greeting", async ({ page }) => {
        await face(page).hover();
        await expect(margin(page)).toBeVisible();
        await expect(margin(page).locator("figcaption")).toHaveText(portrait.caption);
        const image = margin(page).locator("img");
        await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
        // The whole portrait, not the header's crop: taller than wide.
        const shown = (await image.boundingBox())!;
        expect(shown.height).toBeGreaterThan(shown.width);
        await expect(margin(page)).toHaveAttribute("aria-hidden", "true");
        await expect
          .poll(async () => {
            const [header, look, column] = await Promise.all([
              page.locator("[data-stretch-header]").boundingBox(),
              margin(page).boundingBox(),
              page.locator(".qi-header__inner").boundingBox(),
            ]);
            return { below: look!.y >= header!.y + header!.height, edge: Math.round(look!.x - (column!.x + 600)), fits: look!.y + look!.height <= page.viewportSize()!.height };
          })
          .toEqual({ below: true, edge: 40, fits: true });
        // London's time, said beside the greeting, is never painted over.
        await page.locator("[data-greeting]").hover();
        await expect(margin(page)).toBeHidden();
        await expect(page.locator(".qi-greeting__more")).toHaveCSS("opacity", "1");
      });

      test("keyboard focus shows it, Escape hides it and leaves focus on the portrait, and blur hides it", async ({ page }) => {
        await face(page).focus();
        await expect(margin(page)).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(margin(page)).toBeHidden();
        await expect(face(page)).toBeFocused();
        await page.keyboard.press("Tab");
        await face(page).focus();
        await expect(margin(page)).toBeVisible();
        await page.keyboard.press("Tab");
        await expect(margin(page)).toBeHidden();
      });

      test("slides in toward the margin, and with reduced motion only fades over 0.2 s", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await face(page).hover();
        await expect(margin(page).locator(".qi-face-look")).toHaveCSS("animation-name", "qi-face-slide");
        await page.mouse.move(0, 0);
        await expect(margin(page)).toBeHidden();
        await page.emulateMedia({ reducedMotion: "reduce" });
        await face(page).hover();
        await expect(margin(page).locator(".qi-face-look")).toHaveCSS("animation-name", "none");
        await expect(margin(page).locator(".qi-look")).toHaveCSS("animation-duration", "0.2s");
      });
    });

    test.describe("on a phone or a touch screen", () => {
      test.skip(({ page }) => wide(page), "Wide screens show the margin");

      test("tapping the portrait opens the look inline, tapping it again closes it", async ({ page }) => {
        await expect(inline(page)).toHaveCount(0);
        await tap(page, face(page));
        await expect(inline(page)).toBeVisible();
        await expect(inline(page).locator("figcaption")).toHaveText(portrait.caption);
        await expect(face(page)).toHaveAttribute("aria-expanded", "true");
        await expect(margin(page)).toHaveCount(0);
        // It stays in the window, on the header's row, and never scrolls the page sideways.
        const look = (await inline(page).boundingBox())!;
        expect(look.x + look.width).toBeLessThanOrEqual(page.viewportSize()!.width);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
        await tap(page, face(page));
        await expect(inline(page)).toHaveCount(0);
        await expect(face(page)).toHaveAttribute("aria-expanded", "false");
      });

      test("Escape closes it", async ({ page }) => {
        await tap(page, face(page));
        await expect(inline(page)).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(inline(page)).toHaveCount(0);
      });
    });
  });
}

test("on the 404 the name still leads home, and the portrait does not", async ({ page }) => {
  await page.goto("/nothing-here");
  const home = page.locator("[data-stretch-header]").getByRole("link", { name: "Elias Bennett, home" });
  await expect(home).toHaveAttribute("href", "/");
  await expect(home.locator(".qi-header__face")).toHaveCount(0);
  expect((await home.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await home.click();
  await expect(page).toHaveURL(/\/$/);
});
