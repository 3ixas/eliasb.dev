import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { revealDescription } from "../src/content/stretch/opening";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories";
import {
  evidenceBeyondPass,
  roleStoryBack,
  roleStoryCopy,
  roleStoryDescription,
  roleStoryName,
  roleStoryReveals,
  roleStorySectionKeys,
  roleStorySectionLabels,
} from "../src/content/stretch/role-story";
import { passRecords } from "../src/content/stretch/staff-pass";
import { work } from "../src/content/stretch/work";
import { pageTitle } from "../src/content/site";
import { contrastOnPaper } from "./support/contrast";

const schemes = ["light", "dark"] as const;
/** From this width the header carries the section links, and a closer look arrives in the margin. */
const LINKS_FROM = 980;
const MARGIN_FROM = 1180;

for (const slug of roleStorySlugs) {
  const story = roleStories[slug];
  const next = story.next ? roleStories[story.next] : null;
  const employer = work.employers.find((entry) => entry.slug === slug)!;
  const reveals = roleStoryReveals[slug] ?? [];

  test.describe(`Role story: ${story.employer}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/work/${slug}`);
    });

    test("the opening has the employer as the one h1, its role and dates, and the back link to Work", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(story.employer);
      const opening = page.locator("article > div > header");
      await expect(opening).toContainText(story.role);
      if (story.setting) await expect(opening).toContainText(story.setting);
      await expect(opening).toContainText(story.dates);
      await expect(page.getByRole("link", { name: "Work", exact: true }).first()).toHaveAttribute("href", roleStoryBack.href);
      // The old opening band, its number and the numbered section bar are gone.
      await expect(page.locator(".stretch-cs-open, .stretch-cs-links-row")).toHaveCount(0);
    });

    test("the header is the shared one, and its links are this page's six sections", async ({ page }) => {
      const width = page.viewportSize()?.width ?? 0;
      await expect(page.locator("header.qi-header")).toHaveCount(1);
      await expect(page.locator(".stretch-header")).toHaveCount(0);
      await expect(page.locator('nav[aria-label="On this page"]')).toHaveCount(1);
      const links = page.locator(".qi-header__links a");
      await expect(links).toHaveText(roleStorySectionKeys.map((key) => roleStorySectionLabels[key]));
      for (const key of roleStorySectionKeys) await expect(links.filter({ hasText: roleStorySectionLabels[key] })).toHaveAttribute("href", `#${key}`);
      const ids = await page.locator("article section[id]").evaluateAll((sections) => sections.map((section) => section.id));
      expect(ids).toEqual([...roleStorySectionKeys]);
      if (width < LINKS_FROM) {
        await expect(links.first()).toBeHidden();
        return;
      }
      await expect(links.first()).toBeVisible();
      // The links fit on one row beside the name, the greeting's object and the Eclipse, and nothing scrolls sideways.
      await expect
        .poll(async () => {
          const [last, eclipse] = [await links.last().boundingBox(), await page.locator("[data-eclipse]").boundingBox()];
          return eclipse!.x - (last!.x + last!.width);
        }, { message: "the last link ends before the Eclipse" })
        .toBeGreaterThanOrEqual(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await links.last().click();
      await expect(page).toHaveURL(/#what-i-took-with-me$/);
      await expect(page.locator("section#what-i-took-with-me")).toBeInViewport();
      // The link of the section in view is marked, and underlined.
      await expect(links.last()).toHaveAttribute("aria-current", "location");
    });

    test("the employer's pass hangs in the column with its three Pass pins, and is not a link", async ({ page }) => {
      const pass = page.locator(".qi-long .qi-pass");
      await expect(pass).toHaveCount(1);
      await expect(pass.locator(".qi-pass__wordmark")).toHaveText(passRecords[slug].short);
      await expect(pass.locator(".qi-pass__role")).toHaveText(story.role);
      await expect(pass.locator("a")).toHaveCount(0);
      const pins = page.locator(".qi-long .qi-pins li");
      await expect(pins).toHaveCount(3);
      for (const [index, pin] of employer.pins.entries()) {
        await expect(pins.nth(index)).toContainText(pin.label);
        await expect(pins.nth(index)).toContainText(pin.detail);
      }
    });

    test("the title has the opening line's treatment, sections are 17 px, and the evidence is 17 px / 600 over 13 px mono", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveClass(/qi-opening__line/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-weight", "650");
      for (const heading of await page.locator("article h2").all()) {
        await expect(heading).toHaveCSS("font-size", "17px");
        await expect(heading).toHaveCSS("font-weight", "650");
      }
      const value = page.locator(".qi-long__evidence strong").first();
      if (await value.count()) {
        await expect(value).toHaveCSS("font-size", "17px");
        await expect(value).toHaveCSS("font-weight", "600");
        await expect(page.locator(".qi-long__evidence span").first()).toHaveCSS("font-size", "13px");
      }
    });

    test("a section's address opens on that section, below the header, and focuses it", async ({ page }) => {
      await page.goto(`/work/${slug}#decisions`);
      await expect(page.locator("section#decisions")).toBeInViewport();
      await expect(page.locator("section#decisions")).toBeFocused();
      const headerBottom = await page.locator("header.qi-header").evaluate((header) => header.getBoundingClientRect().bottom);
      await expect.poll(() => page.locator("section#decisions h2").evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headerBottom - 1);
    });

    test("the pass drops on its strap once on arrival, and not at all with reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`/work/${slug}`);
      const animation = () => page.locator(".qi-long .qi-pass").evaluate((pass) => pass.getAnimations().map((a) => `${(a as CSSAnimation).animationName}:${a.effect?.getComputedTiming().iterations}`));
      await expect.poll(animation).toEqual(["qi-drop:1"]);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await expect.poll(animation).toEqual([]);
    });

    test("the pins fill the room under the title beside the pass from 640 px, and follow the pass on a phone", async ({ page }) => {
      const beside = (page.viewportSize()?.width ?? 0) >= 640;
      await expect
        .poll(async () => {
          const [title, pass, pins] = [await page.getByRole("heading", { level: 1 }).boundingBox(), await page.locator(".qi-long .qi-pass").boundingBox(), await page.locator(".qi-long .qi-pins").boundingBox()];
          // Beside: left of the pass, in the title's column, below the title. Phone: below the pass.
          return beside ? pins!.x + pins!.width <= pass!.x + 1 && Math.abs(pins!.x - title!.x) <= 6 && pins!.y >= title!.y + title!.height : pins!.y >= pass!.y + pass!.height - 1;
        })
        .toBe(true);
    });

    test("the pass sits under the title on a phone and beside it from 640 px", async ({ page }) => {
      const beside = (page.viewportSize()?.width ?? 0) >= 640;
      await expect
        .poll(async () => {
          const [title, pass] = [await page.getByRole("heading", { level: 1 }).boundingBox(), await page.locator(".qi-long .qi-pass").boundingBox()];
          return beside ? pass!.x - (title!.x + title!.width) : pass!.y - (title!.y + title!.height);
        }, { message: beside ? "beside the title" : "under the title" })
        .toBeGreaterThanOrEqual(-1);
    });

    test("the evidence sits beneath Summary and leaves out what the pass's pins already show", async ({ page }) => {
      const onPass = [passRecords[slug].headline.value, passRecords[slug].headline.label, ...employer.pins.flatMap(({ label, detail }) => [label, detail])];
      const shown = evidenceBeyondPass(story.evidence, onPass);
      expect(shown.length).toBeLessThanOrEqual(4);
      const list = page.locator("section#summary").getByRole("list", { name: "Evidence" });
      await expect(page.getByRole("list", { name: "Evidence" })).toHaveCount(shown.length ? 1 : 0);
      if (shown.length) await expect(list.getByRole("listitem")).toHaveText(shown.map(({ value, label }) => `${value}${label}`));
    });

    if (slug === "bnp-paribas") {
      test("the evidence is what the pins do not say: the six months, not the competition they already show", async ({ page }) => {
        await expect(page.locator("section#summary").getByRole("listitem")).toHaveText(["6months from zero C# to production code"]);
      });

      test("its flag and its to-scale bars sit inline under their sections with their captions, and the certificate is not drawn inline", async ({ page }) => {
        const flag = page.locator("section#decisions figure");
        await expect(flag.locator(".qi-flag__on")).toHaveText("on");
        await expect(flag.locator(".qi-flag__toggle")).toHaveCount(1);
        await expect(flag).toContainText("off by default");
        await expect(flag.locator("figcaption")).toHaveText("Protect the blast radius");
        const scale = page.locator("section#what-changed figure");
        await expect(scale.locator("figcaption")).toHaveText("Bars to scale. Two weeks is taken as ten working days.");
        await expect(scale).toContainText("Before · about two weeks, experienced");
        await expect(scale).toContainText("After · under 5 min");
        await expect(page.locator("section#what-i-took-with-me figure")).toHaveCount(0);
      });

      test("the before-and-after bars are to scale, and drawn at their share once they have come into view", async ({ page }) => {
        const rows = page.locator("section#what-changed .qi-scale__row");
        await expect(rows).toHaveCount(2);
        await rows.first().scrollIntoViewIfNeeded();
        // About ten working days against a couple (2 in 10); 30–40 min drawn at 40 against under 5 (5 in 40).
        for (const [index, ratio] of [0.2, 0.125].entries()) {
          const before = rows.nth(index).locator('[data-kind="before"] .qi-scale__fill');
          const after = rows.nth(index).locator('[data-kind="after"] .qi-scale__fill');
          await expect.poll(async () => (await after.boundingBox())!.width / (await before.boundingBox())!.width).toBeCloseTo(ratio, 2);
        }
      });

      test("the bars are drawn at their share, not shrunk, with reduced motion", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.reload();
        const after = page.locator('section#what-changed [data-kind="after"] .qi-scale__fill').first();
        const before = page.locator('section#what-changed [data-kind="before"] .qi-scale__fill').first();
        await expect.poll(async () => (await after.boundingBox())!.width / (await before.boundingBox())!.width).toBeCloseTo(0.2, 2);
      });
    }

    if (slug === "joveen" || slug === "optegra") {
      test("its screenshots sit under their sections, captioned with their source", async ({ page }) => {
        for (const [key, figure] of Object.entries(story.figures ?? {})) {
          if (figure.kind !== "screens") throw new Error(`${slug}'s figures are screenshots`);
          const block = page.locator(`section#${key} figure`);
          // No caption of its own: just the link, in plain words.
          await expect(block.locator("figcaption")).toHaveText(`${figure.source.label} ↗`);
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
      test("the Joveen hero sits desktop beside phone, with only the link to the live site beneath", async ({ page }) => {
        const shots = page.locator("section#the-role .qi-screens__shot");
        await expect(shots).toHaveCount(2);
        const desktop = shots.first();
        const phone = shots.last();
        await expect(desktop).toHaveAttribute("data-device", "desktop");
        await expect(phone).toHaveAttribute("data-device", "phone");
        await expect(page.locator("section#the-role figcaption")).toHaveText("joveen.com ↗");
        await expect
          .poll(async () => {
            const [a, b] = [await desktop.boundingBox(), await phone.boundingBox()];
            return a && b ? a.x + a.width <= b.x && Math.abs(a.y + a.height - (b.y + b.height)) < 2 : false;
          })
          .toBe(true);
      });
    }

    if (slug === "optegra") {
      test("the Optegra links say in plain words what and when, and go to their Wayback snapshot", async ({ page }) => {
        for (const key of ["the-role", "what-changed"]) {
          const link = page.locator(`section#${key} figcaption a`);
          await expect(link).toContainText("June 2024");
          await expect(link).toContainText("Wayback Machine");
          await expect(link).not.toContainText("web.archive.org");
          await expect(link).toHaveAttribute("href", /^https:\/\/web\.archive\.org\/web\/202406\d{8}\/https:\/\/www\.optegra\.com\//);
        }
      });
    }

    if (reveals.length === 0) {
      test("it names nothing it cannot show, so it has no reveal words", async ({ page }) => {
        await expect(page.locator(".qi-word")).toHaveCount(0);
      });
    }

    for (const { id, phrase, section } of reveals) {
      test(`"${phrase}" shows its closer look: in the margin on a wide screen, inline when tapped`, async ({ page }) => {
        const word = page.locator(`section#${section} .qi-word[data-look="${id}"]`);
        await expect(word).toHaveText(phrase);
        await word.scrollIntoViewIfNeeded();
        const width = page.viewportSize()?.width ?? 0;
        const hovers = await page.evaluate(() => matchMedia("(hover: hover)").matches);
        const look = hovers && width >= MARGIN_FROM ? page.locator(".qi-margin .qi-look") : page.locator(`[data-look-slot="${id}"] .qi-look`);
        if (hovers && width >= MARGIN_FROM) await word.hover();
        else await word.click();
        await expect(look).toBeVisible();
        if (id === "cores") await expect(look).toContainText("CPU");
        else await expect(look.locator("img")).toHaveCount(1);
        // What it says beyond the sentence is also the word's accessible description.
        await expect(page.locator(`#${id}-description`)).toHaveText(revealDescription[id]);
        await expect(word).toHaveAttribute("aria-describedby", `${id}-description`);
      });
    }

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

    // #219: a long employer name (Optegra's) must not split mid-word, and neither may the section links.
    for (const width of [320, 390, 820, 1440]) {
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
        const links = page.locator(".qi-header__links a");
        await expect(links).toHaveCount(roleStorySectionKeys.length);
        if (width >= LINKS_FROM) for (const link of await links.all()) await expect.poll(() => link.evaluate(widestWordFits)).toBe(true);
      });
    }

    test("section copy is the approved copy", async ({ page }) => {
      for (const key of roleStorySectionKeys) {
        const { paragraphs, points } = story.sections[key];
        const section = page.locator(`section#${key}`);
        await expect(section.getByRole("heading", { level: 2 })).toHaveText(roleStorySectionLabels[key]);
        for (const paragraph of paragraphs ?? []) await expect(section).toContainText(paragraph);
        for (const { lead, text } of points ?? []) await expect(section).toContainText(`${lead} ${text}`);
      }
    });

    test(next ? "it ends on one row to the next role, and following it opens that story" : "it ends on the way back to Work", async ({ page }) => {
      if (next) {
        const row = page.getByRole("region", { name: roleStoryCopy.nextRole }).getByRole("link");
        await expect(page.getByRole("region", { name: roleStoryCopy.nextRole }).getByRole("link")).toHaveCount(1);
        await expect(row).toHaveAttribute("href", `/work/${next.slug}`);
        await expect(row).toContainText(passRecords[next.slug].short);
        await expect(row).toContainText(next.role);
        await expect(row).toContainText(next.dates);
        // The old coloured Next tile is gone.
        await expect(page.locator(".stretch-cs-next")).toHaveCount(0);
        expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        await row.click();
        await expect(page).toHaveURL(new RegExp(`/work/${next.slug}$`));
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(next.employer);
        return;
      }
      await expect(page.getByRole("region", { name: roleStoryCopy.nextRole })).toHaveCount(0);
      const end = page.getByRole("navigation", { name: "More" }).getByRole("link", { name: "Work", exact: true });
      await expect(end).toHaveAttribute("href", roleStoryBack.href);
      expect((await end.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    });

    test("there is no footer, and the page ends on its last row or link with room beneath it", async ({ page }) => {
      // The pass has a foot of its own; the page has none.
      await expect(page.locator("[data-role-story] > footer, main > footer")).toHaveCount(0);
    });

    test("opens at once, even with motion on", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`/work/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
      await expect(page.locator("main")).toHaveCSS("opacity", "1");
    });

    test("it is in the server-rendered page", async ({ page }) => {
      await page.route("**/*.js", (route) => route.abort());
      await page.reload();
      await expect(page.locator("article section[id]")).toHaveCount(roleStorySectionKeys.length);
      await expect(page.locator('nav[aria-label="On this page"] a')).toHaveCount(roleStorySectionKeys.length);
      await expect(page.locator(".qi-long .qi-pass")).toHaveCount(1);
      for (const { phrase } of reveals) await expect(page.locator("article")).toContainText(phrase);
    });

    for (const scheme of schemes) {
      test(`text passes WCAG 2.2 AA contrast, ${scheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        const selectors = [
          ".qi-long__back",
          ".qi-long__title",
          ".qi-long__line",
          ".qi-long__meta",
          ".qi-title",
          ".qi-long__p",
          ".qi-long__p strong",
          ".qi-pins__text",
          ...(next ? [".qi-row__title", ".qi-row__line"] : []),
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

    test("renders without sideways scroll, and every link in the column is at least 44 px tall", async ({ page }) => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const width = page.viewportSize()?.width ?? 0;
      for (const box of await Promise.all((await page.locator("[data-role-story] main *").all()).map((item) => item.boundingBox()))) {
        if (box) expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      }
      for (const target of await page.locator("[data-role-story] main a:visible, [data-role-story] main button:visible").all()) {
        expect((await target.boundingBox())!.height, (await target.textContent()) ?? "").toBeGreaterThanOrEqual(44);
      }
    });
  });
}

// A touch screen wide enough for the links (an iPad on its side): tapping the greeting shows its words, which take the links' room.
test.describe("The greeting on a wide touch screen", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 1100, height: 800 } });

  test("tapping it shows its words and steps the section links aside, and tapping again brings them back", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Touch emulation, Chromium");
    await page.goto("/work/bnp-paribas");
    const greeting = page.locator("[data-greeting]");
    const links = page.locator(".qi-header__links");
    await expect(greeting).toHaveAttribute("role", "button");
    await expect(links).toHaveCSS("opacity", "1");
    await greeting.tap();
    await expect(greeting).toHaveAttribute("aria-expanded", "true");
    await expect(links).toHaveCSS("opacity", "0");
    await expect(links).toHaveCSS("pointer-events", "none");
    // Nothing runs past the Eclipse while it shows.
    await expect.poll(async () => (await greeting.boundingBox())!.x + (await greeting.boundingBox())!.width).toBeLessThanOrEqual((await page.locator("[data-eclipse]").boundingBox())!.x);
    await greeting.tap();
    await expect(links).toHaveCSS("opacity", "1");
  });
});
