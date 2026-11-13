import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { pageTitle } from "../src/content/site";
import { passName } from "../src/content/stretch/pass-name";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories";
import { roleStoryBack, roleStoryCopy, roleStoryDescription, roleStoryName, roleStorySectionKeys, roleStorySectionLabels } from "../src/content/stretch/role-story";
import { passRecords } from "../src/content/stretch/staff-pass";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * Role stories (docs/design/DESIGN.md "Long-form pages", R-21): the employer as the title, role, dates and setting on one
 * line, the summary as the lede, the evidence figures and the employer's staff pass; then each section with its heading
 * at the left and its text at the right, its figures in the employer's colour; then the next role as a panel, and Say
 * hello.
 */

const schemes = ["light", "dark"] as const;
/** Every section after the summary, which is the opening's lede. */
const sectionKeys = roleStorySectionKeys.filter((key) => key !== "summary");
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const opening = (page: Page) => page.locator(".story-open");
const pass = (page: Page) => opening(page).locator(".pass");
/** An rgb() string for a hex colour, as getComputedStyle reports it. */
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)).join(", ")})`;

for (const slug of roleStorySlugs) {
  const story = roleStories[slug];
  const next = story.next ? roleStories[story.next] : null;

  test.describe(`Role story: ${story.employer}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/work/${slug}`);
    });

    test("the opening has the back link to Work, the employer as the one h1, role, dates and setting on one line, and the summary as the lede", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(story.employer);
      const back = opening(page).getByRole("link", { name: "Work", exact: true });
      await expect(back).toHaveAttribute("href", roleStoryBack.href);
      // The arrow and the word are two spans, spaced by the link's gap.
      await expect(back).toHaveText(roleStoryBack.label.replace(" ", ""));
      const parts = opening(page).locator(".story-open__part");
      await expect(parts).toHaveText([story.role, story.dates, ...(story.setting ? [story.setting] : [])]);
      await expect(opening(page).locator(".story-open__lede")).toHaveText(story.sections.summary.paragraphs[0]);
    });

    test("the opening shows the story's evidence figures, each value over its words", async ({ page }) => {
      const list = opening(page).getByRole("list", { name: "Evidence" });
      await expect(list.getByRole("listitem")).toHaveText(story.evidence.map(({ value, label }) => `${value} ${label}`));
      await expect(list.locator("b").first()).toHaveCSS("font-family", /Newsreader/);
    });

    test("the header is the shared one, and the sections are in order with their headings: no Summary heading and no numbers", async ({ page }) => {
      await expect(page.locator("[data-site-header]")).toHaveCount(1);
      const ids = await page.locator("article section[id]").evaluateAll((sections) => sections.map((section) => section.id));
      expect(ids).toEqual(sectionKeys);
      await expect(page.locator("article h2")).toHaveText(sectionKeys.map((key) => roleStorySectionLabels[key]));
      await expect(page.getByRole("heading", { name: "Summary" })).toHaveCount(0);
      for (const text of await page.locator("article h2").allTextContents()) expect(text).not.toMatch(/\d/);
    });

    test("each section has its heading at the left and its text at the right from 720 px, and the heading above the text on a phone", async ({ page }) => {
      for (const key of sectionKeys) {
        const heading = page.locator(`section#${key} h2`);
        const body = page.locator(`section#${key} .story-section__body`);
        await expect
          .poll(async () => {
            const [h, b] = [(await heading.boundingBox())!, (await body.boundingBox())!];
            return width(page) >= 720 ? b.x >= h.x + h.width - 1 && Math.abs(b.y - h.y) < 24 : b.y >= h.y + h.height - 1;
          })
          .toBe(true);
        expect((await body.boundingBox())!.width).toBeLessThanOrEqual(760.5);
      }
      // A hairline and 64 px between sections (44 px on a phone).
      const section = page.locator(`section#${sectionKeys[1]}`);
      await expect(section).toHaveCSS("padding-top", width(page) < 720 ? "44px" : "64px");
      await expect(section).toHaveCSS("border-top-width", "1px");
    });

    test("its paragraphs are Newsreader at 20 px (19 on a phone), and its points a 23 px serif lead over a muted line", async ({ page }) => {
      const paragraph = page.locator("article .prose p").first();
      await expect(paragraph).toHaveCSS("font-family", /Newsreader/);
      await expect(paragraph).toHaveCSS("font-size", width(page) < 720 ? "19px" : "20px");
      const point = page.locator("article .points li").first();
      if (await point.count()) {
        await expect(point.locator("b")).toHaveCSS("font-size", "23px");
        await expect(point.locator("b")).toHaveCSS("font-family", /Newsreader/);
        await expect(point.locator("span")).toHaveCSS("font-size", "16px");
      }
    });

    test("the employer's staff pass hangs in the opening as an image named by its print, not a link", async ({ page }) => {
      await expect(pass(page)).toHaveCount(1);
      await expect(pass(page)).toHaveAttribute("role", "img");
      await expect(pass(page)).toHaveAccessibleName(passName(slug));
      await expect(pass(page).locator(".pass__band")).toHaveText(passRecords[slug].short);
      await expect(opening(page).locator(".pass a, a.pass")).toHaveCount(0);
    });

    test("the pass hangs at the right of the text from 1260 px, and below it under that", async ({ page }) => {
      const text = opening(page).locator(".story-open__text");
      await expect
        .poll(async () => {
          const [t, p] = [(await text.boundingBox())!, (await pass(page).locator(".pass__card").boundingBox())!];
          return width(page) >= 1260 ? p.x >= t.x + t.width - 1 : p.y >= t.y + t.height - 1;
        })
        .toBe(true);
    });

    test("the pass swings once on arrival, and not at all with reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`/work/${slug}`);
      const animations = () => pass(page).evaluate((element) => element.getAnimations().map((a) => `${(a as CSSAnimation).animationName}:${a.effect?.getComputedTiming().iterations}`));
      await expect.poll(animations).toContain("pass-swing:1");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await expect.poll(animations).toEqual([]);
    });

    test("a section's address opens on that section and focuses it", async ({ page }) => {
      await page.goto(`/work/${slug}#decisions`);
      await expect(page.locator("section#decisions")).toBeInViewport();
      await expect(page.locator("section#decisions")).toBeFocused();
      await expect.poll(() => page.locator("section#decisions h2").evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
    });

    if (slug === "bnp-paribas") {
      test("the flag and the comparisons are on panels in BNP Paribas's colour, with their captions", async ({ page }) => {
        const flag = page.locator("section#decisions figure");
        await expect(flag.locator(".panel")).toHaveCSS("background-color", rgb(story.panel.field));
        await expect(flag.locator(".lane")).toHaveText(["Live pricing · today’s path", "New path · no stale file · cachedoff by default"]);
        await expect(flag.locator(".lane__switch")).toHaveCount(1);
        await expect(flag.locator("figcaption")).toHaveText("Protect the blast radius");
        const scale = page.locator("section#what-changed figure");
        await expect(scale.locator(".panel")).toHaveCSS("background-color", rgb(story.panel.field));
        await expect(scale.locator("figcaption")).toHaveText("Bars to scale. Two weeks is taken as ten working days.");
        await expect(scale.locator("h3")).toHaveText(["Integrating a pricer", "The competition dashboard’s data load"]);
        await expect(scale).toContainText("about two weeks, experienced");
        await expect(scale).toContainText("under 5 min");
      });

      test("the comparisons' bars are to scale once they have come into view", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.reload();
        const rows = page.locator("section#what-changed .cmps > li");
        await expect(rows).toHaveCount(2);
        await rows.first().evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
        // About ten working days against a couple (2 in 10); 30–40 min drawn at 40 against under 5 (5 in 40).
        for (const [index, ratio] of [0.2, 0.125].entries()) {
          const [before, after] = [rows.nth(index).locator(".bar:not(.bar--after)"), rows.nth(index).locator(".bar--after")];
          await expect.poll(async () => (await after.boundingBox())!.width / (await before.boundingBox())!.width).toBeCloseTo(ratio, 2);
        }
      });

      test("the bars are drawn at their share at once with reduced motion", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.reload();
        const row = page.locator("section#what-changed .cmps > li").first();
        await expect.poll(async () => (await row.locator(".bar--after").boundingBox())!.width / (await row.locator(".bar:not(.bar--after)").boundingBox())!.width).toBeCloseTo(0.2, 2);
      });

      test("the certificate sits under What I took with me with a hairline edge, its caption and its own address", async ({ page }) => {
        const figure = page.locator("section#what-i-took-with-me figure#take-ownership-certificate");
        const certificate = story.figures!["what-i-took-with-me"]!;
        if (certificate.kind !== "certificate") throw new Error("BNP Paribas's last figure is the certificate");
        await expect(figure.locator("figcaption")).toHaveText(certificate.caption);
        const image = figure.locator(".qi-zoom img");
        await expect(image).toHaveAttribute("alt", certificate.alt);
        await expect(image).toHaveCSS("border-radius", "16px");
        await expect(image).toHaveCSS("box-shadow", /1px/);
      });
    }

    if (slug === "joveen" || slug === "optegra") {
      test("its screenshots sit under their sections with a hairline edge, captioned with their source", async ({ page }) => {
        for (const [key, figure] of Object.entries(story.figures ?? {})) {
          if (figure.kind !== "screens") throw new Error(`${slug}'s figures are screenshots`);
          const block = page.locator(`section#${key} figure`);
          await expect(block.locator("figcaption")).toHaveText(`${figure.source.label} ↗`);
          await expect(block.locator("figcaption a")).toHaveAttribute("href", figure.source.href);
          await expect(block.locator(".qi-zoom img")).toHaveCount(figure.images.length);
          for (const [index, image] of figure.images.entries()) {
            const img = block.locator(".qi-zoom img").nth(index);
            await img.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
            await expect(img).toHaveAttribute("alt", image.alt);
            await expect(img).toHaveCSS("border-radius", "16px");
            await expect(img).toHaveCSS("box-shadow", /1px/);
            await expect.poll(() => img.evaluate((el: HTMLImageElement) => (el.complete ? el.naturalWidth : 0))).toBeGreaterThan(0);
          }
        }
      });
    }

    if (slug === "joveen") {
      test("the Joveen hero sits desktop beside phone, bottoms aligned, with only the link to the live site beneath", async ({ page }) => {
        const shots = page.locator("section#the-role .story-fig__shot");
        await expect(shots).toHaveCount(2);
        await expect(shots.first()).toHaveAttribute("data-device", "desktop");
        await expect(shots.last()).toHaveAttribute("data-device", "phone");
        await expect(page.locator("section#the-role figcaption")).toHaveText("joveen.com ↗");
        await expect
          .poll(async () => {
            const [a, b] = [await shots.first().locator("img").boundingBox(), await shots.last().locator("img").boundingBox()];
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

    // #219: a long employer name (Optegra's) must not split mid-word, and its pass must fit beside nothing at 320 px.
    for (const at of [320, 390, 820, 1440]) {
      test(`the title breaks only between words, and the title and the pass fit, at ${at} px`, async ({ page }, testInfo) => {
        test.skip(!/-1440-light$/.test(testInfo.project.name), "Sweeps its own widths: once per engine");
        await page.setViewportSize({ width: at, height: 900 });
        await page.goto(`/work/${slug}`);
        await page.evaluate(() => document.fonts.ready);
        const widestWordFits = (element: Element) => {
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
          return widest <= element.clientWidth + 0.5;
        };
        await expect.poll(() => page.getByRole("heading", { level: 1 }).evaluate(widestWordFits)).toBe(true);
        const card = (await pass(page).locator(".pass__card").boundingBox())!;
        expect(card.x).toBeGreaterThanOrEqual(0);
        expect(card.x + card.width).toBeLessThanOrEqual(at);
        await expect.poll(() => pass(page).locator(".pass__band span").evaluate((band) => band.scrollWidth <= band.clientWidth + 0.5)).toBe(true);
        // A part of the role, dates and setting that starts a line starts at the line's edge, which clips the dot before it.
        const strays = await opening(page).locator(".story-open__meta").evaluate((meta) => {
          const left = meta.getBoundingClientRect().left;
          const parts = [...meta.children].map((part) => part.getBoundingClientRect());
          return parts.filter((part, index) => index > 0 && part.top > parts[index - 1].top + 2 && Math.abs(part.left - left) > 0.5).length + (getComputedStyle(meta).overflowX === "clip" ? 0 : 1);
        });
        expect(strays).toBe(0);
      });
    }

    test("section copy is the approved copy", async ({ page }) => {
      for (const key of sectionKeys) {
        const { paragraphs, points } = story.sections[key];
        const section = page.locator(`section#${key}`);
        for (const paragraph of paragraphs ?? []) await expect(section).toContainText(paragraph);
        for (const { lead, text } of points ?? []) await expect(section).toContainText(`${lead} ${text}`);
      }
    });

    test(next ? "it ends on the next role as a panel in that employer's colour, then Say hello" : "it ends on the way back to Work, then Say hello", async ({ page }) => {
      const sayHello = page.locator("#say-hello");
      if (next) {
        const panel = page.getByRole("navigation", { name: roleStoryCopy.nextRole }).getByRole("link");
        await expect(panel).toHaveCount(1);
        await expect(panel).toHaveAttribute("href", `/work/${next.slug}`);
        await expect(panel).toContainText(roleStoryCopy.nextRole);
        await expect(panel).toContainText(passRecords[next.slug].short);
        await expect(panel).toContainText(`${next.role} · ${next.dates}`);
        await expect(panel).toHaveCSS("background-color", rgb(next.panel.field));
        expect((await panel.boundingBox())!.y).toBeLessThan((await sayHello.boundingBox())!.y);
        await panel.click();
        await expect(page).toHaveURL(new RegExp(`/work/${next.slug}$`));
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(next.employer);
        return;
      }
      await expect(page.getByRole("navigation", { name: roleStoryCopy.nextRole })).toHaveCount(0);
      const end = page.getByRole("navigation", { name: "Back to Work" }).getByRole("link", { name: "Work", exact: true });
      await expect(end).toHaveAttribute("href", roleStoryBack.href);
      expect((await end.boundingBox())!.y).toBeLessThan((await sayHello.boundingBox())!.y);
    });

    test("there is no footer", async ({ page }) => {
      await expect(page.locator("[data-role-story] footer, main > footer")).toHaveCount(0);
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
      await expect(page.locator("article section[id]")).toHaveCount(sectionKeys.length);
      await expect(page.locator('nav[aria-label="On this page"] a')).toHaveCount(5);
      await expect(pass(page)).toHaveCount(1);
      await expect(opening(page).getByRole("list", { name: "Evidence" }).getByRole("listitem")).toHaveCount(story.evidence.length);
    });

    for (const scheme of schemes) {
      test(`every text pair passes AA on the rendered page, and nothing is under 13 px (${scheme})`, async ({ page, browserName }) => {
        test.skip(browserName !== "chromium", "Measured in Chromium");
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
        await page.reload();
        await page.evaluate(() => document.fonts.ready);
        const texts = await page.evaluate(() => [...document.querySelectorAll("[data-role-story] article, nav.story-next")].map((part) => (part as HTMLElement).innerText).join("\n"));
        const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
        for (const expected of [story.employer, story.role, story.evidence[0].label, roleStorySectionLabels["the-role"], ...(next ? [roleStoryCopy.nextRole] : [])]) {
          expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
        }
        expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
        const small = await page.evaluate(() =>
          [...document.querySelectorAll("[data-role-story] article *, nav.story-next *")]
            .filter((element) => [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim()))
            .filter((element) => !element.closest("[aria-hidden='true'], .sr-only") && parseFloat(getComputedStyle(element).fontSize) < 13)
            .map((element) => element.textContent),
        );
        expect(small).toEqual([]);
      });

      test(`has no axe violations (${scheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
        await page.reload();
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }

    test("renders without sideways scroll, and every link and button in the page is at least 44 px tall", async ({ page }) => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const target of await page.locator("[data-role-story] main a:visible, [data-role-story] main button:visible").all()) {
        expect((await target.boundingBox())!.height, (await target.textContent()) ?? "").toBeGreaterThanOrEqual(44);
      }
    });

    test("the keyboard reaches the back link, each screenshot and the next page in order, each with a visible ring", async ({ page }) => {
      // Everything focusable on the story itself, from the back link to the next page; Say hello is its own spec's.
      const scope = "[data-role-story] article, [data-role-story] nav.story-next";
      // A screenshot's Close button is in its dialog, which is closed.
      const order = await page.locator(`:is(${scope}) :is(a, button):not(dialog *)`).evaluateAll((elements) => elements.map((element) => element.textContent?.trim() ?? ""));
      expect(order.length).toBeGreaterThan(1);
      const reached: string[] = [];
      await page.locator("body").focus();
      for (let step = 0; step < 40 && reached.length < order.length; step++) {
        await page.keyboard.press("Tab");
        const focused = await page.evaluate((within) => {
          const element = document.activeElement as HTMLElement | null;
          if (!element?.closest(within)) return null;
          const style = getComputedStyle(element);
          return { text: element.textContent?.trim() ?? "", ring: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2 };
        }, scope);
        if (!focused) continue;
        expect(focused.ring, focused.text).toBe(true);
        reached.push(focused.text);
      }
      expect(reached).toEqual(order);
    });
  });
}
