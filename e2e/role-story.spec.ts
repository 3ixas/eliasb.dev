import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { pageTitle } from "../src/content/site";
import { passName } from "../src/content/stretch/pass-name";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories";
import { roleStoryBack, roleStoryCopy, roleStoryDescription, roleStoryName, roleStorySectionKeys, roleStorySectionLabels } from "../src/content/stretch/role-story";
import { passRecords } from "../src/content/stretch/staff-pass";
import { hostLabel } from "../src/components/site/host-label";
import { drawn, expectDrawn } from "./support/measure";
import { spoken } from "./support/roll";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * Role stories (docs/design/DESIGN.md "Long-form pages", R-21, R-52, R-53): a coloured employer hero banner holding
 * "← Work", the employer as h1, role, dates and setting on one line, the summary as the lede and the bordered evidence
 * strip, beside the employer's hanging Staff pass (stacked below under 960 px); then a sticky left chapter rail (from
 * 960 px) beside the reading column of sections, structured Problem and Decision cards, figures in the employer's
 * colour and the neutral archival mat for the certificate; then the next role as a panel, and Say hello.
 */

const schemes = ["light", "dark"] as const;
/** Every section after the summary, which is the opening's lede. */
const sectionKeys = roleStorySectionKeys.filter((key) => key !== "summary");
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const opening = (page: Page) => page.locator(".story-open");
const heroCard = (page: Page) => opening(page).locator(".story-open__card");
const pass = (page: Page) => opening(page).locator(".story-open__rail .pass");
/** An rgb() string for a hex colour, as getComputedStyle reports it. */
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)).join(", ")})`;

for (const slug of roleStorySlugs) {
  const story = roleStories[slug];
  const next = story.next ? roleStories[story.next] : null;

  test.describe(`Role story: ${story.employer}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/work/${slug}`);
    });

    test("the opening is a coloured employer hero banner holding the back link, h1, role, dates and setting, and the summary as the lede", async ({ page }) => {
      await expect(heroCard(page)).toHaveClass(/\bpanel surface\b/);
      await expect(heroCard(page)).toHaveCSS("background-color", rgb(story.panel.field));
      await expect(heroCard(page)).toHaveCSS("color", rgb(story.panel.ink));
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(story.employer);
      const back = opening(page).getByRole("link", { name: "Work", exact: true });
      await expect(back).toHaveAttribute("href", roleStoryBack.href);
      // The arrow and the word are two spans, spaced by the link's gap.
      await expect(back).toHaveText(roleStoryBack.label.replace(" ", ""));
      const parts = opening(page).locator(".story-open__part");
      // A setting of two facts is two parts, so every dot on the line is spaced alike (#540).
      await expect(parts).toHaveText([story.role, story.dates, ...(story.setting?.split(" · ") ?? [])]);
      await expect(opening(page).locator(".story-open__lede")).toHaveText(story.sections.summary.paragraphs[0]);
    });

    test("the opening shows the story's bordered evidence strip, each value over its words", async ({ page }) => {
      const list = opening(page).getByRole("list", { name: "Evidence" });
      expect(await spoken(list.getByRole("listitem"))).toEqual(story.evidence.map(({ value, label }) => `${value} ${label}`));
      await expect(list.locator("b").first()).toHaveCSS("font-family", /Newsreader/);
      await expect(list.getByRole("listitem").first()).toHaveCSS("border-top-width", "1px");
    });

    test("each hero figure stays on one line inside its card, and the figures in a row start level (#540)", async ({ page }, testInfo) => {
      test.skip(!/-1440-light$/.test(testInfo.project.name), "Sweeps its own widths: once per engine");
      for (const at of [320, 390, 820, 960, 1024, 1260, 1440]) {
        await page.setViewportSize({ width: at, height: 900 });
        await page.evaluate(() => document.fonts.ready);
        await expect
          .poll(
            () =>
              opening(page).locator(".story-figures li").evaluateAll((cards) => {
                const levels = new Map<number, Set<number>>();
                return cards.flatMap((card) => {
                  const figure = card.querySelector("b")!;
                  // A rolling figure is drawn by its face, whose hidden digit columns are not lines of their own.
                  const drawn = figure.querySelector(".roll__face") ?? figure;
                  const lines = figure.getBoundingClientRect().height > parseFloat(getComputedStyle(figure).fontSize) * 1.5;
                  const words = document.createRange();
                  words.selectNodeContents(drawn);
                  const right = drawn === figure ? words.getBoundingClientRect().right : drawn.getBoundingClientRect().right;
                  const spills = right > card.getBoundingClientRect().right - parseFloat(getComputedStyle(card).paddingRight) + 0.5;
                  const row = Math.round(card.getBoundingClientRect().top);
                  levels.set(row, (levels.get(row) ?? new Set()).add(Math.round(figure.getBoundingClientRect().top)));
                  return [
                    ...(lines && window.innerWidth >= 390 ? [`${figure.textContent} wraps`] : []),
                    ...(spills ? [`${figure.textContent} spills`] : []),
                    ...(levels.get(row)!.size > 1 ? [`${figure.textContent} sits off its row's level`] : []),
                  ];
                });
              }),
            { message: `at ${at} px` },
          )
          .toEqual([]);
      }
    });

    test("on a phone an odd last figure card fills its row; the others share theirs (#540)", async ({ page }) => {
      const list = opening(page).getByRole("list", { name: "Evidence" });
      const odd = width(page) < 720 && story.evidence.length % 2 === 1;
      await expect
        .poll(async () => {
          const [whole, last, first] = await Promise.all([list, list.locator("li").last(), list.locator("li").first()].map(async (box) => (await box.boundingBox())!.width));
          if (odd) return Math.abs(last - whole) < 1 && first < whole / 2;
          return Math.abs(last - first) < 1;
        })
        .toBe(true);
    });

    test("the parts of the role, dates and setting line are evenly spaced (#540)", async ({ page }) => {
      await expect
        .poll(() =>
          opening(page).locator(".story-open__part").evaluateAll((parts) => {
            const boxes = parts.map((part) => part.getBoundingClientRect());
            const gaps = boxes.slice(1).flatMap((box, index) => (Math.abs(box.top - boxes[index].top) < 2 ? [Math.round(box.left - boxes[index].right)] : []));
            return new Set(gaps).size <= 1 && parts.every((part) => !part.textContent!.includes("·"));
          }),
        )
        .toBe(true);
    });

    const screens = Object.values(story.figures ?? {}).flatMap((figure) => (figure.kind === "screens" ? [figure] : []));
    if (screens.length) {
      test("each figure's source link is a 44 px target, keeps its ↗ after its words and says it opens a new tab (#540)", async ({ page }) => {
        const links = page.locator(".story-fig__source");
        await expect(links).toHaveCount(screens.length);
        for (const [index, { source }] of screens.entries()) {
          const link = links.nth(index);
          await expect(link).toHaveAttribute("target", "_blank");
          await expect(link).toHaveAccessibleName(`${source.label} opens ${hostLabel(source.href)} in a new tab`);
          await expect.poll(async () => (await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
          await expect
            .poll(() =>
              link.evaluate((anchor) => {
                const words = document.createRange();
                words.setStart(anchor.firstChild!, 0);
                words.setEnd(anchor.firstChild!, anchor.firstChild!.textContent!.trimEnd().length);
                const end = [...words.getClientRects()].at(-1)!;
                const arrow = anchor.querySelector('[aria-hidden="true"]')!.getBoundingClientRect();
                return Math.abs(arrow.top + arrow.height / 2 - (end.top + end.height / 2)) < end.height / 2 && arrow.left - end.right >= 0 && arrow.left - end.right < 12;
              }),
            )
            .toBe(true);
        }
      });
    }

    test("the header is the shared one, and the sections are in order with their headings: no Summary heading and no numbers", async ({ page }) => {
      await expect(page.locator("[data-site-header]")).toHaveCount(1);
      const ids = await page.locator("article section[id]").evaluateAll((sections) => sections.map((section) => section.id));
      expect(ids).toEqual(sectionKeys);
      await expect(page.locator("article h2")).toHaveText(sectionKeys.map((key) => roleStorySectionLabels[key]));
      await expect(page.getByRole("heading", { name: "Summary" })).toHaveCount(0);
      for (const text of await page.locator("article h2").allTextContents()) expect(text).not.toMatch(/\d/);
    });

    test("the sticky chapter rail lists plain section titles with no numbers, sits left of the reading column from 960 px, and never overlaps a figure", async ({ page }) => {
      const rail = page.locator("nav.chapter-rail");
      const links = rail.locator("a");
      await expect(links).toHaveText(sectionKeys.map((key) => roleStorySectionLabels[key]));
      for (const text of await links.allTextContents()) expect(text).not.toMatch(/\d/);
      const stream = page.locator(".story-stream");
      await expect
        .poll(async () => {
          const [r, s] = [(await rail.boundingBox())!, (await stream.boundingBox())!];
          return width(page) >= 960 ? s.x >= r.x + r.width - 1 : s.y >= r.y + r.height - 1;
        })
        .toBe(true);
      if (width(page) >= 960) {
        await expect(rail).toHaveCSS("position", "sticky");
        const railBox = (await rail.boundingBox())!;
        for (const figure of await stream.locator(".story-fig").all()) {
          const figBox = (await figure.boundingBox())!;
          expect(figBox.x).toBeGreaterThanOrEqual(railBox.x + railBox.width - 1);
        }
      }
      // Prose and cards stay within the 640 px measure; figures stay within 760 px.
      for (const key of sectionKeys) {
        const body = page.locator(`section#${key} .story-section__body`);
        for (const text of await body.locator(":scope > :not(.story-fig)").all()) {
          expect((await text.boundingBox())!.width).toBeLessThanOrEqual(640.5);
        }
        for (const fig of await body.locator(":scope > .story-fig").all()) {
          expect((await fig.boundingBox())!.width).toBeLessThanOrEqual(760.5);
        }
      }
      // A hairline and 64 px between sections (44 px on a phone).
      const section = page.locator(`section#${sectionKeys[1]}`);
      await expect(section).toHaveCSS("padding-top", width(page) < 720 ? "44px" : "64px");
      await expect(section).toHaveCSS("border-top-width", "1px");
    });

    test("scrolling updates the chapter rail's active lifted paper pill without layout shift, and Enter on a rail link focuses its section", async ({ page }) => {
      const rail = page.locator("nav.chapter-rail");
      await expect(rail.locator('a[aria-current="location"]')).toHaveCount(1);
      await page.evaluate(() => document.fonts.ready);
      const measure = () => rail.locator("a").evaluateAll((els) => els.map((el) => ({ w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height })));
      const before = await measure();
      const target = page.locator("section#what-changed");
      await target.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60));
      const active = rail.locator('a[href="#what-changed"]');
      await expect(active).toHaveAttribute("aria-current", "location");
      await expect.poll(measure).toEqual(before);

      const decisionsLink = rail.locator('a[href="#decisions"]');
      await decisionsLink.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("section#decisions")).toBeFocused();
      await expect(decisionsLink).toHaveAttribute("aria-current", "location");
    });

    test("its paragraphs are Newsreader at 19 px (18 on a phone), and its Problem and Decision entries are bordered paper cards", async ({ page }) => {
      const paragraph = page.locator("article .prose p").first();
      await expect(paragraph).toHaveCSS("font-family", /Newsreader/);
      await expect(paragraph).toHaveCSS("font-size", width(page) < 720 ? "18px" : "19px");
      const point = page.locator("article .story-cards li.story-card").first();
      if (await point.count()) {
        await expect(point).toHaveClass(/\bsurface surface--paper\b/);
        await expect(point).toHaveCSS("border-radius", "16px");
        await expect(point.locator("b")).toHaveCSS("font-size", "20px");
        await expect(point.locator("b")).toHaveCSS("font-family", /Newsreader/);
        await expect(point.locator("span")).toHaveCSS("font-size", "16px");
      }
    });

    test("the employer's Staff pass hangs in the opening as an image named by its print, not a link", async ({ page }) => {
      await expect(pass(page)).toHaveCount(1);
      await expect(pass(page)).toHaveAttribute("role", "img");
      await expect(pass(page)).toHaveAccessibleName(passName(slug));
      await expect(pass(page).locator(".pass__band span")).toHaveText(passRecords[slug].short);
      await expect(opening(page).locator(".story-open__rail a, a.pass")).toHaveCount(0);
    });

    test("on a laptop-sized window (1024 px) the Staff pass hangs beside the hero banner with no sideways scroll", async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      const card = heroCard(page);
      await expect.poll(async () => (await pass(page).locator(".pass__card").boundingBox())!.x >= (await card.boundingBox())!.x + (await card.boundingBox())!.width - 1).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });

    test("the Staff pass sits at the right of the hero banner from 960 px, and hangs below it under that", async ({ page }) => {
      const card = heroCard(page);
      await expect
        .poll(async () => {
          const [c, p] = [(await card.boundingBox())!, (await pass(page).locator(".pass__card").boundingBox())!];
          return width(page) >= 960 ? p.x >= c.x + c.width - 1 : p.y >= c.y + c.height - 1;
        })
        .toBe(true);
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
        await expect(flag.locator("figcaption")).toHaveText("Protect the blast radius.");
        const scale = page.locator("section#what-changed figure");
        await expect(scale.locator(".panel")).toHaveCSS("background-color", rgb(story.panel.field));
        await expect(scale.locator("figcaption")).toHaveText("Bars to scale. Two weeks is taken as ten working days.");
        await expect(scale.locator("h3")).toHaveText(["Integrating a pricer", "The competition dashboard’s data load"]);
        await expect(scale).toContainText("about two weeks");
        await expect(scale).toContainText("under 5 min");
      });

      test("the flag is a switch you can flip: off as it shipped, by pointer and keyboard, its state announced, the new path taken when on", async ({ page }) => {
        const lanes = page.locator("section#decisions .lanes");
        const flag = page.getByRole("switch", { name: "New path · no stale file · cached" });
        await expect(flag).toHaveAttribute("aria-checked", "false");
        await expect(flag).toHaveAccessibleDescription("off by default");
        // A 44 px target around the drawn switch.
        const box = (await flag.boundingBox())!;
        expect([box.width, box.height]).toEqual([44, 44]);
        await flag.click();
        await expect(flag).toHaveAttribute("aria-checked", "true");
        await expect(lanes).toHaveAttribute("data-on", "");
        await expect(lanes.locator(".lane--new i")).toHaveCSS("border-top-style", "solid");
        await expect(lanes.locator(".lane:not(.lane--new) i")).toHaveCSS("border-top-style", "dashed");
        await flag.focus();
        await page.keyboard.press("Space");
        await expect(flag).toHaveAttribute("aria-checked", "false");
        await page.keyboard.press("Enter");
        await expect(flag).toHaveAttribute("aria-checked", "true");
      });

      test("switched on, one request travels the new path and a second comes from the cache; a switch mid-trip starts the new trip, and nothing loops", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "no-preference" });
        const flag = page.getByRole("switch", { name: "New path · no stale file · cached" });
        const request = page.locator("section#decisions .lane__request");
        await flag.click();
        await expect(page.locator("section#decisions .lane--new .lane__request")).toHaveCount(1);
        // Seek the first trip to its end rather than wait it out: the cached one follows on the same path, and is quicker.
        await request.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
        await expect(page.locator("section#decisions .lane--new .lane__request[data-cached]")).toHaveCount(1);
        const durations = await request.evaluate((element) => element.getAnimations().map((animation) => Number(animation.effect!.getComputedTiming().duration)));
        expect(durations[0]).toBeLessThan(400);
        await request.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
        await expect(request).toHaveCount(1);
        // Switched off mid-trip, the request is on today's path at once.
        await flag.click();
        await expect(page.locator("section#decisions .lane:not(.lane--new) .lane__request")).toHaveCount(1);
        await expect(page.locator("section#decisions .lane--new .lane__request")).toHaveCount(0);
        await request.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
        expect(await request.evaluate((element) => element.getAnimations().filter((animation) => animation.playState === "running").length)).toBe(0);
      });

      test("with reduced motion the flag still switches and no request travels; without script it is the still figure, drawn off", async ({ page, browser }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        const flag = page.getByRole("switch", { name: "New path · no stale file · cached" });
        await flag.click();
        await expect(flag).toHaveAttribute("aria-checked", "true");
        await expect(page.locator("section#decisions .lane__request")).toHaveCSS("display", "none");
        const context = await browser.newContext({ javaScriptEnabled: false });
        const still = await context.newPage();
        await still.goto(page.url());
        await expect(still.getByRole("switch")).toHaveCount(0);
        await expect(still.locator("section#decisions .lane__switch")).toHaveCount(1);
        await expect(still.locator("section#decisions .lanes")).not.toHaveAttribute("data-on");
        await context.close();
      });

      test("each comparison is drawn in its own unit: ten day squares against two, and minutes on one scale with the range and the bound drawn short", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.reload();
        const scale = story.figures!["what-changed"]!;
        if (scale.kind !== "scale") throw new Error("BNP Paribas's What changed figure is the scale");
        await expect(page.locator("section#what-changed .cmps > li")).toHaveCount(scale.rows.length);
        const drawings = await drawn(page.locator("section#what-changed"), ".cmps > li");
        for (const [index, row] of scale.rows.entries()) expectDrawn(drawings[index], row, row.what);
      });

      test("the certificate sits on a neutral archival mat under What I took with me with its caption and its own address", async ({ page }) => {
        const figure = page.locator("section#what-i-took-with-me figure#take-ownership-certificate");
        const certificate = story.figures!["what-i-took-with-me"]!;
        if (certificate.kind !== "certificate") throw new Error("BNP Paribas's last figure is the certificate");
        const mat = figure.locator(".story-fig__mat");
        await expect(mat).toHaveClass(/\bsurface surface--paper\b/);
        await expect(mat).toHaveCSS("border-radius", "20px");
        await expect(figure.locator("figcaption")).toHaveText(certificate.caption);
        const image = figure.locator(".zoom img");
        await expect(image).toHaveAttribute("alt", certificate.alt);
        await expect(image).toHaveCSS("border-radius", "12px");
        await expect(image).toHaveCSS("box-shadow", /1px/);
      });
    }

    if (slug === "joveen" || slug === "optegra") {
      test("its screenshots sit under their sections with a hairline edge, captioned with their source", async ({ page }) => {
        // Its numbers are drawn as scale figures (#461); every other figure is a screenshot.
        for (const [key, figure] of Object.entries(story.figures ?? {})) {
          if (figure.kind === "scale") continue;
          if (figure.kind !== "screens") throw new Error(`${slug}'s other figures are screenshots`);
          const block = page.locator(`section#${key} figure`);
          await expect(block.locator("figcaption")).toHaveText(`${figure.source.label} \u2197\uFE0E opens ${hostLabel(figure.source.href)} in a new tab`);
          await expect(block.locator("figcaption a")).toHaveAttribute("href", figure.source.href);
          await expect(block.locator(".zoom img")).toHaveCount(figure.images.length);
          for (const [index, image] of figure.images.entries()) {
            const img = block.locator(".zoom img").nth(index);
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
        await expect(page.locator("section#the-role figcaption")).toHaveText("joveen.com \u2197\uFE0E opens joveen.com in a new tab");
        await expect
          .poll(async () => {
            const [a, b] = [await shots.first().locator("img").boundingBox(), await shots.last().locator("img").boundingBox()];
            return a && b ? a.x + a.width <= b.x && Math.abs(a.y + a.height - (b.y + b.height)) < 2 : false;
          })
          .toBe(true);
      });
    }

    if (slug === "joveen" || slug === "optegra") {
      test("every number in its evidence is drawn once, in What changed, with its value written beside it (#461)", async ({ page }) => {
        const figure = story.figures?.["what-changed"];
        if (figure?.kind !== "scale") throw new Error(`${slug}'s What changed draws its numbers`);
        const rows = page.locator("section#what-changed .cmps > li");
        await expect(rows).toHaveCount(figure.rows.length);
        expect(figure.rows.length).toBe(story.evidence.length);
        for (const [index, row] of figure.rows.entries()) {
          await expect(rows.nth(index).locator("h3")).toHaveText(row.what);
          await expect(rows.nth(index).locator(".cmp--after b")).toHaveText(row.after.label);
        }
      });
    }

    if (slug === "optegra") {
      test("the Optegra links say in plain words what and when, and go to their Wayback snapshot", async ({ page }) => {
        for (const key of ["the-role", "decisions"]) {
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
        await expect.poll(() => pass(page).locator(".pass__band span").evaluate((org) => org.scrollWidth <= org.clientWidth + 0.5)).toBe(true);
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

    test("it is in the server-rendered page, and the chapter rail is plain jump links without script", async ({ page }) => {
      await page.route("**/*.js", (route) => route.abort());
      await page.reload();
      await expect(page.locator("article section[id]")).toHaveCount(sectionKeys.length);
      await expect(page.locator('nav[aria-label="Site"] a')).toHaveCount(5);
      await expect(page.locator("nav.chapter-rail a")).toHaveCount(sectionKeys.length);
      await expect(page.locator('nav.chapter-rail a[aria-current]')).toHaveCount(0);
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

    test("the keyboard reaches the back link, each screenshot and the next page in order, each with a visible ring", async ({ page }, testInfo) => {
      // Safari Tabs to links only with Option held, as a visitor with its default settings does.
      const tab = testInfo.project.name.startsWith("webkit") ? "Alt+Tab" : "Tab";
      // Everything focusable on the story itself, from the back link to the next page; Say hello is its own spec's.
      const scope = "[data-role-story] article, [data-role-story] nav.story-next";
      // The flag's switch exists once the page has hydrated; before it, the figure is drawn still.
      if (slug === "bnp-paribas") await expect(page.getByRole("switch")).toHaveCount(1);
      // A screenshot's Close button is in its dialog, which is closed.
      const order = await page.locator(`:is(${scope}) :is(a, button):not(dialog *)`).evaluateAll((elements) => elements.map((element) => element.textContent?.trim() ?? ""));
      expect(order.length).toBeGreaterThan(1);
      const reached: string[] = [];
      await page.locator("body").focus();
      for (let step = 0; step < 40 && reached.length < order.length; step++) {
        await page.keyboard.press(tab);
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

test.describe("Role story: Joveen latency fill", () => {
  test.use({ reducedMotion: "no-preference" });

  test("Joveen's key API p95 fills in its own time: 520 ms against 230 ms, together and at a constant rate", async ({ page }) => {
    await page.goto("/work/joveen");
    const changed = page.locator("section#what-changed");
    await expect(changed.locator("[data-grow]")).toHaveAttribute("data-armed", "");
    // Catch the fills the moment the bars are let go and pause them, so none can finish before it is read, however slow the
    // runner. A mutation observer's callback runs before the next frame; CI's WebKit does not reliably fire transitionrun.
    await changed.evaluate((element) => {
      const caught: Animation[] = [];
      (window as unknown as { fills: Animation[] }).fills = caught;
      const grow = element.querySelector("[data-grow]")!;
      const watcher = new MutationObserver(() => {
        if (grow.hasAttribute("data-armed")) return;
        watcher.disconnect();
        for (const bar of element.querySelectorAll(".measure--ms .bar")) {
          const fill = bar.getAnimations().find((animation) => (animation as CSSTransition).transitionProperty === "transform");
          fill?.pause();
          if (fill) caught.push(fill);
        }
      });
      watcher.observe(grow, { attributes: true, attributeFilter: ["data-armed"] });
    });
    await changed.locator(".measure--ms").first().evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => (window as unknown as { fills: Animation[] }).fills.filter(Boolean).length)).toBe(2);
    // Seek both fills to where the faster one ends, rather than wait them out.
    const fills = await changed.evaluate((element) =>
      (window as unknown as { fills: Animation[] }).fills.map((fill, index) => {
        const { duration, delay } = fill.effect!.getComputedTiming();
        fill.currentTime = Number(delay) + 230;
        const bar = element.querySelectorAll(".measure--ms .bar")[index];
        const scale = new DOMMatrix(getComputedStyle(bar).transform).a;
        fill.finish();
        return { duration: Number(duration), delay: Number(delay), scale };
      }),
    );
    const [before, after] = fills;
    // Each fill lasts its value, within 20 ms.
    expect(Math.abs(before.duration - 520)).toBeLessThanOrEqual(20);
    expect(Math.abs(after.duration - 230)).toBeLessThanOrEqual(20);
    expect(after.delay).toBe(before.delay);
    // At 230 ms the after bar is full and the before bar, filling at the same rate, is 230 / 520 of the way.
    expect(after.scale).toBeCloseTo(1, 2);
    expect(before.scale).toBeCloseTo(230 / 520, 2);
  });
});
