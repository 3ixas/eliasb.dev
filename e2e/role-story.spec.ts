import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories";
import {
  roleStoryBack,
  roleStoryCopy,
  roleStoryDescription,
  roleStoryMetadata,
  roleStoryName,
  roleStorySectionKeys,
  roleStorySectionLabels,
} from "../src/content/stretch/role-story";
import { passRecords } from "../src/content/stretch/staff-pass";
import { pageTitle } from "../src/content/site";
import { contrastOnPaper } from "./support/contrast";

const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const schemes = ["light", "dark"] as const;

for (const slug of roleStorySlugs) {
  const story = roleStories[slug];
  const next = story.next ? roleStories[story.next] : null;

  test.describe(`Role story: ${story.employer}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/work/${slug}`);
    });

    test("the opening band carries the number, employer, role, metadata and back link", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(story.employer);
      const band = page.getByRole("region", { name: "Overview" });
      await expect(band.locator(".stretch-cs-open__number")).toHaveText(story.number);
      await expect(band).toContainText(story.role);
      await expect(band).toContainText(roleStoryMetadata(story));
      await expect(band.getByRole("link", { name: "Work", exact: true })).toHaveAttribute("href", roleStoryBack.href);
      // The only picture in the band is the pass's ID photo, never a screenshot as on a Case study.
      await expect(band.locator("img")).toHaveCount(1);
      await expect(band.locator(".stretch-pass img")).toHaveCount(1);
    });

    for (const scheme of schemes) {
      test(`the band's Staff pass is not a link and wears the other theme's pair, ${scheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        const other = story.colours[scheme === "light" ? "dark" : "light"];
        const band = page.getByRole("region", { name: "Overview" });
        const pass = band.locator(".stretch-pass");
        await expect(pass).toHaveCount(1);
        await expect(pass.locator(".stretch-pass__card")).toHaveJSProperty("tagName", "DIV");
        await expect(pass.locator(".stretch-pass__card")).toHaveCSS("background-color", rgb(other.field));
        await expect(pass.locator(".stretch-pass__card")).toHaveCSS("color", rgb(other.ink));
        await expect(pass.locator(".stretch-pass__strap")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        // A faint edge: the on-band shadow is a 1 px ring (spread, no blur) and then a deep drop, which no other pass has.
        await expect
          .poll(() => pass.locator(".stretch-pass__card").evaluate((card) => getComputedStyle(card).boxShadow))
          .toMatch(/0px 0px 0px 1px.*0px 24px 48px -16px/);
        // It is the same pass as on Work: this employer's, and not a link to the page it opens.
        await expect(pass.locator(".stretch-pass__title")).toHaveText(passRecords[slug].short);
        await expect(pass.locator(`a[href="/work/${slug}"]`)).toHaveCount(0);
        await expect(pass.locator(".stretch-pass__foot")).not.toContainText("story →");
      });
    }

    if (slug === "joveen" || slug === "optegra") {
      test("its screenshots sit under their sections, captioned with their source", async ({ page }) => {
        for (const [key, figure] of Object.entries(story.figures ?? {})) {
          if (figure.kind !== "screens") throw new Error(`${slug}'s figures are screenshots`);
          const block = page.locator(`section#${key} figure`);
          await expect(block.locator("figcaption")).toContainText(figure.caption);
          await expect(block.locator("figcaption a")).toHaveAttribute("href", figure.source.href);
          await expect(block.locator("figcaption a")).toHaveText(`${figure.source.label} ↗`);
          await expect(block.locator("img")).toHaveCount(figure.images.length);
          for (const [index, image] of figure.images.entries()) {
            const img = block.locator("img").nth(index);
            await img.scrollIntoViewIfNeeded();
            await expect(img).toHaveAttribute("alt", image.alt);
            await expect.poll(() => img.evaluate((el: HTMLImageElement) => (el.complete ? el.naturalWidth : 0))).toBeGreaterThan(0);
            expect((await page.request.get(image.src)).status()).toBe(200);
          }
        }
      });
    }

    if (slug === "joveen") {
      test("the Joveen hero sits desktop beside phone, and is captioned as the live site today", async ({ page }) => {
        const shots = page.locator("section#the-role .stretch-role-screens__shot");
        await expect(shots).toHaveCount(2);
        const desktop = shots.first();
        const phone = shots.last();
        await expect(desktop).toHaveClass(/--desktop/);
        await expect(phone).toHaveClass(/--phone/);
        await expect(page.locator("section#the-role figcaption")).toContainText("the live site, not my UI");
        await expect.poll(async () => {
          const [a, b] = [await desktop.boundingBox(), await phone.boundingBox()];
          return a && b ? a.x + a.width <= b.x && Math.abs(a.y + a.height - (b.y + b.height)) < 2 : false;
        }).toBe(true);
      });
    }

    if (slug === "optegra") {
      test("the Optegra captions give their Wayback URL and June 2024 date", async ({ page }) => {
        for (const [key, date] of [["the-role", "5 June 2024"], ["what-changed", "13 June 2024"]]) {
          const caption = page.locator(`section#${key} figcaption`);
          await expect(caption).toContainText(date);
          await expect(caption.locator("a")).toHaveAttribute("href", /^https:\/\/web\.archive\.org\/web\/202406\d{8}\/https:\/\/www\.optegra\.com\//);
        }
      });
    }

    if (slug === "bnp-paribas") {
      test("its three figures sit under their sections with their captions", async ({ page }) => {
        const flag = page.locator("section#decisions figure");
        await expect(flag.locator(".stretch-role-flag__on")).toHaveText("on");
        await expect(flag.locator(".stretch-role-flag__toggle")).toHaveCount(1);
        await expect(flag).toContainText("off by default");
        await expect(flag.locator("figcaption")).toHaveText("Protect the blast radius");
        const scale = page.locator("section#what-changed figure");
        await expect(scale.locator("figcaption")).toHaveText("Bars to scale. Two weeks is taken as ten working days.");
        await expect(scale).toContainText("Before · about two weeks, experienced");
        await expect(scale).toContainText("After · under 5 min");
        const certificate = page.locator("section#what-i-took-with-me figure");
        await expect(certificate.locator("figcaption")).toHaveText("Take Ownership · _nology · Q1 2026 · awarded May 2026");
        await expect(certificate).toHaveAttribute("id", "take-ownership-certificate");
      });

      test("the before-and-after bars are to scale", async ({ page }) => {
        const rows = page.locator("section#what-changed .stretch-role-scale__row");
        await expect(rows).toHaveCount(2);
        // About ten working days against a couple (2 in 10); 30–40 min drawn at 40 against under 5 (5 in 40).
        for (const [index, ratio] of [0.2, 0.125].entries()) {
          const before = rows.nth(index).locator(".stretch-role-scale__bar--before .stretch-role-scale__fill");
          const after = rows.nth(index).locator(".stretch-role-scale__bar--after .stretch-role-scale__fill");
          await expect.poll(async () => (await after.boundingBox())!.width / (await before.boundingBox())!.width).toBeCloseTo(ratio, 2);
        }
      });

      test("the certificate is shown whole and untinted, from a committed asset", async ({ page }) => {
        const figure = story.figures!["what-i-took-with-me"];
        if (figure?.kind !== "certificate") throw new Error("BNP's last figure is the certificate");
        const image = page.locator("#take-ownership-certificate img");
        await image.scrollIntoViewIfNeeded();
        await expect(image).toBeVisible();
        // The optimiser may resize it for the screen, but the picture stays whole: the same 16:9 at any size.
        await expect.poll(() => image.evaluate((img: HTMLImageElement) => (img.complete ? img.naturalWidth / img.naturalHeight : 0))).toBeCloseTo(16 / 9, 2);
        // Layout size, which the frame's slight tilt does not change: shown at its own proportions, so not cropped.
        await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.offsetWidth / img.offsetHeight)).toBeCloseTo(16 / 9, 1);
        await expect(image).toHaveCSS("filter", "none");
        await expect(image).toHaveCSS("object-fit", "fill");
        await expect(image).toHaveCSS("opacity", "1");
        await expect(image).toHaveCSS("mix-blend-mode", "normal");
        expect((await page.request.get(figure.src)).status()).toBe(200);
      });

      test("BNP's three award pins hang on its pass, and the ones that lead into this story arrive there", async ({ page }) => {
        const pins = page.getByRole("region", { name: "Overview" }).getByRole("list", { name: "Awards" });
        const items = pins.getByRole("listitem");
        await expect(items).toHaveCount(3);
        for (const [index, pin] of (passRecords[slug].pins ?? []).entries()) {
          await expect(items.nth(index)).toContainText(pin.label);
          await expect(items.nth(index)).toContainText(pin.detail);
          if (pin.href) await expect(items.nth(index).getByRole("link")).toHaveAttribute("href", pin.href);
        }
        // Each pin that has a target takes focus and scroll to its evidence.
        for (const [index, id] of [[0, "what-changed"], [1, "take-ownership-certificate"], [2, "what-i-took-with-me"]] as const) {
          await page.goto(`/work/${slug}`);
          const pin = items.nth(index).getByRole("link");
          // The certificate pin by keyboard, the others by pointer: both land focus on the evidence.
          if (index === 1) {
            await pin.focus();
            await page.keyboard.press("Enter");
          } else await pin.click();
          await expect(page).toHaveURL(new RegExp(`#${id}$`));
          await expect(page.locator(`#${id}`)).toBeInViewport();
          await expect(page.locator(`#${id}`)).toBeFocused();
        }
      });

      test("Back and Forward between pin targets carry focus with them", async ({ page }) => {
        const links = page.getByRole("region", { name: "Overview" }).getByRole("list", { name: "Awards" }).getByRole("link");
        await links.first().click();
        await expect(page.locator("#what-changed")).toBeFocused();
        await links.last().click();
        await expect(page.locator("#what-i-took-with-me")).toBeFocused();
        await page.goBack();
        await expect(page.locator("#what-changed")).toBeFocused();
      });
    } else {
      test("the pass wears no pins", async ({ page }) => {
        await expect(page.getByRole("region", { name: "Overview" }).getByRole("list", { name: "Awards" })).toHaveCount(0);
      });
    }

    test("the pass sits under the text on a phone and beside it from 761 px", async ({ page }) => {
      const text = await page.locator(".stretch-cs-open__text").boundingBox();
      const pass = await page.locator(".stretch-cs-open .stretch-pass").boundingBox();
      if ((page.viewportSize()?.width ?? 0) < 761) expect(pass!.y, "under the text").toBeGreaterThanOrEqual(text!.y + text!.height - 1);
      else expect(pass!.x, "beside the text").toBeGreaterThanOrEqual(text!.x + text!.width - 1);
    });

    test("it is titled and described for search and sharing", async ({ page }) => {
      await expect(page).toHaveTitle(pageTitle(roleStoryName(story)));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", roleStoryDescription(story));
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.eliasb.dev/work/${slug}`);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", pageTitle(roleStoryName(story)));
      const card = await page.locator('meta[property="og:image"]').getAttribute("content");
      const response = await page.request.get(new URL(card!).pathname);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toBe("image/png");
    });

    for (const scheme of schemes) {
      test(`the band is in the employer's ${scheme} colours`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        const colours = story.colours[scheme];
        const band = page.locator(".stretch-cs-open");
        await expect(band).toHaveCSS("background-color", rgb(colours.field));
        await expect(band).toHaveCSS("color", rgb(colours.ink));
        await expect(page.locator(".stretch-cs-evidence__value").first()).toHaveCSS("color", rgb(colours.swatch));
      });
    }

    test("a remembered theme beats the device setting for the band", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
      await expect(page.locator(".stretch-cs-open")).toHaveCSS("background-color", rgb(story.colours.dark.field));
      await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
      await page.emulateMedia({ colorScheme: "dark" });
      await expect(page.locator(".stretch-cs-open")).toHaveCSS("background-color", rgb(story.colours.light.field));
    });

    test("six sections in the keyed order, each reachable from the row of section links", async ({ page }) => {
      const links = page.getByRole("navigation", { name: "Sections" }).getByRole("link");
      await expect(links).toHaveText(roleStorySectionKeys.map((key, index) => `0${index + 1} ${roleStorySectionLabels[key]}`));
      const ids = await page.locator("article section[id]").evaluateAll((sections) => sections.map((section) => section.id));
      expect(ids).toEqual([...roleStorySectionKeys]);
      for (const key of roleStorySectionKeys) {
        await expect(page.locator(`section#${key} h2`)).toHaveCount(1);
        await expect(links.filter({ hasText: roleStorySectionLabels[key] })).toHaveAttribute("href", `#${key}`);
      }
      await links.last().click();
      await expect(page).toHaveURL(/#what-i-took-with-me$/);
      await expect(page.locator("section#what-i-took-with-me")).toBeInViewport();
    });

    // #219: the title and the section links share the case study's rules, so a long employer name (Optegra's) must not split mid-word either.
    for (const width of [320, 390, 820]) {
      test(`the title and the section links break only between words at ${width} px`, async ({ page }, testInfo) => {
        test.skip(!/-1440-light$/.test(testInfo.project.name), "Sweeps its own widths: once per engine");
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/work/${slug}`);
        await page.evaluate(() => document.fonts.ready);
        // A word never splits if no word is wider than the box that holds it (a link is inline, so its list item is the box).
        const widestWordFits = (element: Element) => {
          const holder = getComputedStyle(element).display === "inline" ? element.parentElement! : element;
          const widest = Math.max(
            ...element.textContent!.trim().split(/\s+/).map((word) => {
              const probe = document.createElement("span");
              probe.textContent = word;
              probe.style.cssText = "position:absolute;white-space:nowrap;visibility:hidden";
              element.appendChild(probe);
              const wide = probe.getBoundingClientRect().width;
              probe.remove();
              return wide;
            }),
          );
          return widest <= holder.clientWidth + 0.5;
        };
        await expect.poll(() => page.getByRole("heading", { level: 1 }).evaluate(widestWordFits)).toBe(true);
        const links = page.getByRole("navigation", { name: "Sections" }).getByRole("link");
        await expect(links).toHaveCount(roleStorySectionKeys.length);
        for (const link of await links.all()) await expect.poll(() => link.evaluate(widestWordFits)).toBe(true);
      });
    }

    test("section copy is the approved copy", async ({ page }) => {
      for (const key of roleStorySectionKeys) {
        const { heading, paragraphs, points } = story.sections[key];
        const section = page.locator(`section#${key}`);
        await expect(section.getByRole("heading", { level: 2 })).toHaveText(heading ?? roleStorySectionLabels[key]);
        for (const paragraph of paragraphs ?? []) await expect(section).toContainText(paragraph);
        for (const { lead, text } of points ?? []) await expect(section).toContainText(`${lead} ${text}`);
      }
    });

    test("the evidence strip, at most four, sits under What changed", async ({ page }) => {
      expect(story.evidence.length).toBeLessThanOrEqual(4);
      await expect(page.getByRole("list", { name: "Evidence" })).toHaveCount(1);
      const items = page.locator("section#what-changed").getByRole("list", { name: "Evidence" }).getByRole("listitem");
      await expect(items).toHaveText(story.evidence.map(({ value, label }) => `${value}${label}`));
    });

    if (slug === "bnp-paribas") {
      test("the evidence strip leaves out the awards the pins already show", async ({ page }) => {
        const items = page.locator("section#what-changed").getByRole("list", { name: "Evidence" }).getByRole("listitem");
        await expect(items).toHaveText(["Nov 2025won the bank’s digitisation competition", "6months from zero C# to production code"]);
      });
    }

    test(next ? "it ends on the next role, in that role's colours" : "it ends on the way back to Work", async ({ page }) => {
      if (next) {
        const tile = page.getByRole("region", { name: roleStoryCopy.nextRole }).getByRole("link");
        await expect(tile).toHaveAttribute("href", `/work/${next.slug}`);
        await expect(tile).toContainText(next.employer);
        await expect(tile).toContainText(next.role);
        await expect(tile).toContainText(next.number);
        for (const scheme of schemes) {
          await page.emulateMedia({ colorScheme: scheme });
          await expect(tile, scheme).toHaveCSS("background-color", rgb(next.colours[scheme].field));
          await expect(tile, scheme).toHaveCSS("color", rgb(next.colours[scheme].ink));
        }
        expect((await tile.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        await tile.click();
        await expect(page).toHaveURL(new RegExp(`/work/${next.slug}$`));
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(next.employer);
        return;
      }
      await expect(page.getByRole("region", { name: roleStoryCopy.nextRole })).toHaveCount(0);
      const end = page.getByRole("navigation", { name: "More" }).getByRole("link", { name: "Work", exact: true });
      await expect(end).toHaveAttribute("href", roleStoryBack.href);
      expect((await end.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    });

    test("cobalt is used only by focus, selection and the pass's award pins", async ({ page }) => {
      const cobalt = await page.evaluate(() => {
        const probe = document.createElement("span");
        probe.style.color = "var(--stretch-cobalt)";
        document.body.appendChild(probe);
        const colour = getComputedStyle(probe).color;
        probe.remove();
        return colour;
      });
      const used = await page.locator("[data-stretch-shell] *").evaluateAll((elements, colour) => {
        return elements.filter((element) => {
          // The skip link is cobalt, but only when focused; it waits off-screen.
          if (element.classList.contains("stretch-skip")) return false;
          // The award pins are the one approved exception (docs/design/DESIGN.md, Colour rules).
          if (element.closest(".stretch-pass__pins")) return false;
          const style = getComputedStyle(element);
          return [style.color, style.backgroundColor, style.borderTopColor].includes(colour) && element.checkVisibility();
        }).length;
      }, cobalt);
      expect(used).toBe(0);
    });

    test("opens at once: no entrance holds the page, even with motion on", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`/work/${slug}`);
      expect(await page.evaluate(() => document.documentElement.hasAttribute("data-entering"))).toBe(false);
      await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
      expect(await page.evaluate(() => Number(getComputedStyle(document.querySelector("main")!).opacity))).toBe(1);
    });

    test("it is in the server-rendered page", async ({ page }) => {
      await page.route("**/*.js", (route) => route.abort());
      await page.reload();
      await expect(page.locator("article section[id]")).toHaveCount(6);
      await expect(page.getByRole("list", { name: "Evidence" }).getByRole("listitem")).toHaveCount(story.evidence.length);
    });

    for (const scheme of schemes) {
      test(`text passes WCAG 2.2 AA contrast over the employer's colours and the page, ${scheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        const selectors = [
          ".stretch-cs-back",
          ".stretch-cs-open__name",
          ".stretch-cs-open__outcome",
          ".stretch-cs-open__meta",
          ".stretch-cs-links-row a",
          ".stretch-cs-h2",
          ".stretch-cs-p",
          ".stretch-cs-lead",
          ".stretch-cs-evidence__value",
          ".stretch-cs-evidence__label",
          ".stretch-pass__title",
          ".stretch-pass__role",
          ".stretch-pass__value",
          ...(next ? [".stretch-cs-next__label", ".stretch-cs-next__name", ".stretch-cs-next__outcome"] : []),
        ];
        for (const selector of selectors) {
          const readings = await contrastOnPaper(page, selector);
          expect(readings.length, selector).toBeGreaterThan(0);
          for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
        }
      });

      test(`has no axe violations, ${scheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }

    test("renders without sideways scroll, and every link is at least 44 px tall", async ({ page }) => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const width = page.viewportSize()?.width ?? 0;
      for (const box of await Promise.all((await page.locator("[data-role-story] main *").all()).map((item) => item.boundingBox()))) {
        if (box) expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      }
      for (const target of await page.locator("[data-role-story] a:visible, [data-role-story] button:visible").all()) {
        if (await target.evaluate((element) => element.classList.contains("stretch-skip"))) continue;
        expect((await target.boundingBox())!.height, (await target.textContent()) ?? "").toBeGreaterThanOrEqual(44);
      }
    });
  });
}

