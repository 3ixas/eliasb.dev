import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { featuredProjects, featuredSlugs, HOMEPAGE_INDEX_ROWS, projectIndex, projects } from "../src/content/projects";
import { thingsIMake } from "../src/content/stretch/site-copy";
import { thresholdCities, thresholdCityChoice, thresholdDisplayLink, thresholdLinkCopy } from "../src/content/stretch/threshold-link";
import { expectOpticalBezel, readOpticalBezel } from "./support/bezel";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * Things I make (docs/design/DESIGN.md "The homepage, in order" 4, R-17, R-46, R-47): Threshold wide with its inline
 * London / Basel / Zurich URL switcher and concentric optical bezel, Argus Risk and Flowtime side by side in their
 * signature colours and bezels, the others as bordered paper strips with visible 60 × 40 px thumbnails newest first
 * (at most ten), then the archive link with the true count.
 */

const featured = featuredProjects(projects, featuredSlugs);
const others = projectIndex(projects, featuredSlugs).slice(0, HOMEPAGE_INDEX_ROWS);
const section = (page: Page) => page.locator("section#things-i-make");
const panels = (page: Page) => section(page).locator(".project");
const rows = (page: Page) => section(page).locator(".things__rows .row");
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(", ")})`;
const line = (slug: string, outcome: string) => thingsIMake.rowOutcomes[slug] ?? outcome;
const expectedCityUrls = {
  london: "threshold-beta.vercel.app/london?district=hackney&type=room",
  basel: "threshold-beta.vercel.app/basel?district=altstadt&type=room",
  zurich: "threshold-beta.vercel.app/zurich?district=kreis-1&type=room",
} as const;

test.describe("Things I make", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
  });

  test("the featured three are panels in order, each in its field and ink, named one level below the section, linking to its case study", async ({ page }) => {
    await expect(section(page).getByRole("heading", { level: 2 })).toHaveText(thingsIMake.heading);
    await expect(panels(page)).toHaveCount(featured.length);
    for (const [index, project] of featured.entries()) {
      const panel = panels(page).nth(index);
      await expect(panel.getByRole("heading", { level: 3 })).toHaveText(project.name);
      await expect(panel.locator(".project__line")).toHaveText(line(project.slug, project.outcome));
      if (index === 0) {
        const cta = panel.locator(`a[href="${project.links.caseStudy!}"]`);
        await expect(cta).toHaveCount(1);
        await expect(cta).toContainText(`The ${project.name} case study`);
        expect((await boxOf(cta)).height).toBeGreaterThanOrEqual(44);
      } else {
        await expect(panel).toHaveAttribute("href", project.links.caseStudy!);
      }
      await expect(panel).toHaveCSS("background-color", rgb(project.panel!.field));
      await expect(panel).toHaveCSS("color", rgb(project.panel!.ink));
    }
  });

  test("Threshold is wide with its bezel at the right; Argus Risk and Flowtime sit side by side from 720 px", async ({ page }) => {
    const wide = panels(page).first();
    await expect(wide).toHaveClass(/project--wide/);
    await expect(wide.locator("b")).toHaveCount(0);
    const [text, shot] = await Promise.all([boxOf(wide.locator(".project__text")), boxOf(wide.locator(".project__shot"))]);
    if (width(page) >= 1260) expect(shot.x).toBeGreaterThan(text.x + text.width - 1);
    else expect(shot.y).toBeGreaterThan(text.y + text.height - 1);
    const [a, b] = await Promise.all([boxOf(panels(page).nth(1)), boxOf(panels(page).nth(2))]);
    if (width(page) >= 720) expect(Math.abs(a.y - b.y)).toBeLessThan(1);
    else expect(b.y).toBeGreaterThan(a.y + a.height);
  });

  test("featured screenshots sit whole and uncropped inside concentric optical bezels with measurable dark-theme separation", async ({ page }) => {
    const phone = width(page) < 720;
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      for (const [index, project] of featured.entries()) {
        const reading = await readOpticalBezel(panels(page).nth(index));
        expectOpticalBezel(reading, `${project.slug} (${scheme})`, phone);
        // On Flowtime (#2a211b) the bezel mat lifts lighter; on bright fields (Threshold, Argus) it deepens darker.
        if (project.slug === "flowtime") expect(reading.matLuminance, `flowtime mat lifts (${scheme})`).toBeGreaterThan(reading.fieldLuminance);
        else expect(reading.matLuminance, `${project.slug} mat deepens (${scheme})`).toBeLessThan(reading.fieldLuminance);
      }
    }
  });

  test("Threshold's inline city switcher uses the canonical serializer, updates politely, has 44 px targets and works by keyboard", async ({ page }) => {
    for (const { id } of thresholdCities) {
      expect(thresholdDisplayLink(thresholdCityChoice(id))).toBe(expectedCityUrls[id]);
    }
    const wide = panels(page).first();
    const group = wide.getByRole("group", { name: thresholdLinkCopy.city });
    const output = wide.locator("output.project-city__url");

    await expect(group.getByRole("button")).toHaveText(thresholdCities.map((c) => c.name));
    await expect(output).toHaveAttribute("aria-live", "polite");
    await expect(output).toHaveAttribute("aria-atomic", "true");
    await expect(output).toHaveText(expectedCityUrls.london);
    await expect(group.getByRole("button", { name: "London" })).toHaveAttribute("aria-pressed", "true");

    for (const button of await group.getByRole("button").all()) {
      const box = await boxOf(button);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }

    await expect
      .poll(() => group.getByRole("button", { name: "Basel" }).evaluate((el) => Object.keys(el).some((key) => key.startsWith("__reactProps$"))))
      .toBe(true);

    // Click Basel and verify canonical URL (never the prototype's ?city= format).
    await group.getByRole("button", { name: "Basel" }).click();
    await expect(group.getByRole("button", { name: "Basel" })).toHaveAttribute("aria-pressed", "true");
    await expect(group.getByRole("button", { name: "London" })).toHaveAttribute("aria-pressed", "false");
    await expect(output).toHaveText(expectedCityUrls.basel);
    await expect(output).not.toContainText("?city=");

    // Keyboard activation on Zurich.
    const zurich = group.getByRole("button", { name: "Zurich" });
    await zurich.focus();
    await page.keyboard.press("Enter");
    await expect(zurich).toHaveAttribute("aria-pressed", "true");
    await expect(output).toHaveText(expectedCityUrls.zurich);

    // Space returns to London (Hackney default).
    const london = group.getByRole("button", { name: "London" });
    await london.focus();
    await page.keyboard.press("Space");
    await expect(london).toHaveAttribute("aria-pressed", "true");
    await expect(output).toHaveText(expectedCityUrls.london);
  });

  test("the others are bordered paper strips newest first with visible 60 × 40 px thumbnails, marked ↗ when leaving the site", async ({ page }) => {
    await expect(rows(page)).toHaveCount(others.length);
    expect(others.length).toBeLessThanOrEqual(HOMEPAGE_INDEX_ROWS);
    const paperColor = await page.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.backgroundColor = "var(--paper)";
      document.body.append(probe);
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    });

    for (const [index, project] of others.entries()) {
      const row = rows(page).nth(index);
      await expect(row).toHaveCSS("background-color", paperColor);
      await expect(row).toHaveCSS("border-top-width", "1px");
      await expect(row.locator(".row__name")).toHaveText(project.name);
      await expect(row.locator(".row__line")).toHaveText(line(project.slug, project.outcome));
      await expect(row.locator(".row__meta")).toContainText(String(project.year));
      const href = (project.links.caseStudy ?? project.links.live ?? project.links.code)!;
      await expect(row).toHaveAttribute("href", href);
      if (href.startsWith("http")) {
        await expect(row).toHaveAttribute("target", "_blank");
        await expect(row.locator(".arrow--out")).toHaveText("\u2197\uFE0E");
        await expect(row).toHaveAccessibleName(/opens .+ in a new tab/);
      }
      expect((await boxOf(row)).height).toBeGreaterThanOrEqual(44);
      expect(await row.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), `${project.slug} row fits width`).toBe(true);

      // Visible-at-rest 60 × 40 px micro-thumbnail (no hover needed).
      const thumb = row.locator(".row__thumb");
      const thumbImg = thumb.locator("img");
      await expect(thumb).toBeVisible();
      await thumbImg.scrollIntoViewIfNeeded();
      await expect.poll(() => thumbImg.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
      const thumbBox = await boxOf(thumb);
      expect(Math.round(thumbBox.width)).toBe(60);
      expect(Math.round(thumbBox.height)).toBe(40);
    }
  });

  test("the archive link has the true count", async ({ page }) => {
    const all = section(page).getByRole("link", { name: thingsIMake.allThings(projects.length) });
    await expect(all).toHaveAttribute("href", "/things-i-make");
    await expect(all).toContainText("(6)");
  });

  test("every panel casts its own colour in light; in dark it casts black and nothing glows (#493)", async ({ page }) => {
    const shadows = () => panels(page).evaluateAll((all) => all.map((panel) => getComputedStyle(panel).boxShadow));
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.reload();
    for (const shadow of await shadows()) {
      expect(shadow).toMatch(/0px 6px 14px -6px/);
      expect(shadow).not.toContain("90px");
    }
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.reload();
    for (const shadow of await shadows()) expect(shadow).toMatch(/^rgba\(0, 0, 0, 0\.5\) 0px 1px 2px 0px, rgba\(0, 0, 0, 0\.55\) 0px 6px 14px -6px, rgba\(0, 0, 0, 0\.55\) 0px 28px 56px -28px$/);
    // A bright field (its ink darker than it) takes the stronger rim in dark; a dark field keeps its subtle white rim.
    const rims = await panels(page).evaluateAll((all) => all.map((panel) => [panel.classList.contains("surface--bright"), getComputedStyle(panel, "::after").boxShadow] as const));
    expect(rims.filter(([bright]) => bright).length).toBeGreaterThan(0);
    for (const [bright, edges] of rims) {
      expect(edges).toContain(`rgba(255, 255, 255, ${bright ? "0.42" : "0.16"}) 0px 0px 0px 1px inset`);
    }
  });

  test("it is complete without script and Threshold defaults cleanly to London", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(panels(page)).toHaveCount(featured.length);
    await expect(rows(page)).toHaveCount(others.length);
    await expect(panels(page).first().locator("output.project-city__url")).toHaveText(expectedCityUrls.london);
    await expect(panels(page).first().getByRole("button", { name: "London" })).toHaveAttribute("aria-pressed", "true");
  });

  test("a linked panel is one keyboard stop with the page's cobalt ring outside it, and Enter opens its case study", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Safari does not Tab to links by default");
    const panel = panels(page).nth(1);
    await panel.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(panel).toBeFocused();
    // The ring sits outside the panel, on the page, so it is the page's cobalt: a panel's own ink can be close to the page.
    const [outline, cobalt] = await panel.evaluate((element) => {
      const probe = document.createElement("i");
      probe.style.color = "var(--cobalt)";
      document.body.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return [getComputedStyle(element).outline, colour];
    });
    expect(outline).toContain(cobalt);
    expect(outline).toContain("2px");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${featured[1].links.caseStudy}$`));
  });

  test("nothing scrolls sideways and nothing is under 13 px", async ({ page }) => {
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const sizes = await section(page).evaluate((element) => [...element.querySelectorAll("*")].filter((node) => node.childElementCount === 0 && node.textContent?.trim()).map((node) => parseFloat(getComputedStyle(node).fontSize)));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(13);
  });

  test("project colours pass contrast: each panel's ink on its field reads at 4.5:1", async () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((start) => {
        const c = parseInt(hex.slice(start, start + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
    for (const { slug, panel } of featured) expect(ratio(panel!.ink, panel!.field), slug).toBeGreaterThanOrEqual(4.5);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`every text in the section passes AA, measured on the rendered page (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      await page.evaluate(() => document.fonts.ready);
      const texts = await section(page).innerText();
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of ["Threshold", "London", "Basel", "Zurich", "threshold-beta.vercel.app", "The Threshold case study", "Argus Risk", "Flowtime", "Home Secretary", "Everything I’ve built"]) {
        expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });

    test(`has no axe violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      const results = await new AxeBuilder({ page }).include("#things-i-make").analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("Things I make: hover", () => {
  test("a screenshot lifts 10 px and a secondary strip tints on fine-pointer hover", async ({ page, browserName }) => {
    test.skip(width(page) < 1180, "A hovering fine pointer");
    test.skip(browserName === "webkit", "Hover emulation, Chromium");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const panel = panels(page).nth(1);
    await panel.scrollIntoViewIfNeeded();
    await panel.hover();
    await expect.poll(() => panel.locator(".project__shot").evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42)).toBe(-10);

    const row = rows(page).first();
    await row.scrollIntoViewIfNeeded();
    const restBg = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
    await row.hover();
    await expect.poll(() => row.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(restBg);
  });
});
