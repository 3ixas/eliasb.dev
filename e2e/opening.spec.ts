import { expect, test, type Page } from "@playwright/test";
import { roleStories } from "../src/content/stretch/role-stories";
import { opening } from "../src/content/stretch/opening";
import { passName } from "../src/content/stretch/pass-name";
import { passHang, passRecords, passStatus } from "../src/content/stretch/staff-pass";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * The homepage's opening (docs/design/DESIGN.md "The homepage, in order" 2 and "The staff pass", R-11 and R-12): the
 * opening line as the page's one h1, its supporting line, and the three employers' staff passes, BNP Paribas first and
 * largest, each printed with its three points and linking to its employer in Work.
 */

const slugs = ["bnp-paribas", "joveen", "optegra"] as const;
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const passes = (page: Page) => page.locator(".opening .pass");
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const settled = (page: Page) => page.evaluate(() => document.fonts.ready.then(() => true));

test.describe("The opening line", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("the page has one h1, the approved opening line, with BNP Paribas underlined in green and its tail in cobalt", async ({ page }) => {
    await expect(heading(page)).toHaveCount(1);
    await expect(heading(page)).toHaveAccessibleName(opening.headline);
    await expect(heading(page)).toHaveText(opening.headline);
    const employer = heading(page).locator(".opening__employer");
    await expect(employer).toHaveText("BNP Paribas");
    await expect(employer).toHaveCSS("background-image", /linear-gradient/);
    await expect(heading(page).locator(".opening__own")).toHaveText("products of my own.");
    const cobalt = await page.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.color = getComputedStyle(document.documentElement).getPropertyValue("--cobalt");
      document.body.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });
    await expect(heading(page).locator(".opening__own")).toHaveCSS("color", cobalt);
    expect(await heading(page).evaluate((element) => getComputedStyle(element).fontFamily)).toMatch(/^Newsreader/);
  });

  test("the supporting line follows it in Newsreader, muted, and is the approved copy", async ({ page }) => {
    const support = page.locator(".opening__support");
    await expect(support).toHaveText(opening.support);
    expect(parseFloat(await support.evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(19);
    const [h1, line] = await Promise.all([heading(page).boundingBox(), support.boundingBox()]);
    expect(line!.y, "under the opening line").toBeGreaterThanOrEqual(h1!.y + h1!.height);
  });

  test("the opening line, its supporting line and the passes are in the page with no script", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(heading(page)).toHaveText(opening.headline);
    await expect(page.locator(".opening__support")).toHaveText(opening.support);
    await expect(passes(page)).toHaveCount(3);
    for (const pass of await passes(page).all()) await expect(pass).toBeVisible();
  });

  test("the old opening's reacting employer, mini pass, reveal words and hero are gone", async ({ page }) => {
    await expect(page.locator(".opening .qi-bnp, .opening .qi-mini, .opening .qi-word, .opening [data-look-slot]")).toHaveCount(0);
    await expect(page.locator(".stretch-hero, .stretch-name, .stretch-portrait, .stretch-hero__role")).toHaveCount(0);
    await expect(page.getByText("Based in London")).toHaveCount(0);
  });

  test("a visitor's wider letter spacing does not push the page sideways", async ({ page }) => {
    // WCAG 1.4.12: letter spacing 0.12em, word spacing 0.16em, line height 1.5, paragraph spacing 2em.
    await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

test.describe("The first screen", () => {
  for (const [w, h] of [[1440, 900], [1280, 720]] as const) {
    test(`at ${w} × ${h} nothing of Work shows before a scroll`, async ({ browser }, testInfo) => {
      test.skip(!/-1440-light$/.test(testInfo.project.name), "Sized here, once per engine");
      const context = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await context.newPage();
      await page.goto("/");
      await settled(page);
      await expect.poll(() => page.locator("#work").evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(h);
      await context.close();
    });
  }

  test("the text is beside the passes from 1260 px, above them under it, and the passes hang from the top of the section", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    const [text, rail, section] = await Promise.all([page.locator(".opening__text").boundingBox(), page.locator(".opening__rail").boundingBox(), page.locator(".opening").boundingBox()]);
    if (width(page) >= 1260) {
      expect(rail!.x).toBeGreaterThanOrEqual(text!.x + text!.width);
      expect(Math.abs(rail!.y - section!.y)).toBeLessThanOrEqual(1);
    } else {
      expect(rail!.y).toBeGreaterThanOrEqual(text!.y + text!.height - 1);
      await expect(page.locator(".opening__rail")).toHaveCSS("border-top-width", "1px");
    }
  });

  test("under 900 px the passes scroll sideways inside their rail, BNP Paribas first, and the page does not", async ({ page }) => {
    test.skip(width(page) >= 900, "The rail scrolls under 900 px");
    await page.goto("/");
    await settled(page);
    const rail = page.locator(".opening__rail");
    await expect(rail).toHaveCSS("overflow-x", "auto");
    expect(await rail.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    await expect(passes(page).first()).toHaveAttribute("href", "#bnp-paribas");
    const first = (await passes(page).first().boundingBox())!;
    expect(first.x).toBeLessThan(width(page) / 2);
  });
});

test.describe("The staff passes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("three passes, BNP Paribas first and largest, each linking to its employer in Work", async ({ page }) => {
    expect(await passes(page).evaluateAll((all) => all.map((pass) => pass.getAttribute("href")))).toEqual(slugs.map((slug) => `#${slug}`));
    for (const slug of slugs) await expect(page.locator(`#${slug}`)).toHaveCount(1);
    const widths = await passes(page).evaluateAll((all) => all.map((pass) => (pass as HTMLElement).offsetWidth));
    expect(widths).toEqual([264, 248, 248]);
    // BNP Paribas hangs lowest.
    const tops = await page.locator(".opening .pass__card").evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().top));
    expect(tops[0]).toBeGreaterThan(Math.max(tops[1], tops[2]));
  });

  test("each prints the band, portrait, name, role, dates, three points, status and barcode, and its name is its print", async ({ page }) => {
    for (const [index, slug] of slugs.entries()) {
      const pass = passes(page).nth(index);
      const card = pass.locator(".pass__card");
      const { short, points } = passRecords[slug];
      const { role, dates } = roleStories[slug];
      await expect(card.locator(".pass__band")).toHaveText(short);
      await expect(card.locator(".pass__photo")).toHaveAttribute("src", /elias-evening-pass/);
      await expect(card.locator(".pass__who")).toHaveText(`Elias Bennett${role}${dates}`);
      await expect(card.locator(".pass__points > span")).toHaveText(points.map(({ lead, detail }) => `${lead}${detail}`));
      await expect(card.locator(".pass__status")).toHaveText(passStatus(passHang[slug].state));
      await expect(card.locator(".pass__code")).toBeVisible();
      await expect(card).toHaveAttribute("aria-hidden", "true");
      await expect(pass).toHaveAccessibleName(passName(slug));
      for (const { lead, detail } of points) expect(passName(slug)).toContain(`${lead}, ${detail}`);
    }
  });

  test("the current pass is in colour with the hologram and Valid · present; the returned ones are greyscale", async ({ page }) => {
    const [bnp, joveen, optegra] = await passes(page).all();
    await expect(bnp.locator(".pass__holo")).toHaveCount(1);
    await expect(bnp.locator(".pass__status")).toHaveText("Valid · present");
    await expect(bnp.locator(".pass__photo")).toHaveCSS("filter", "none");
    for (const pass of [joveen, optegra]) {
      await expect(pass.locator(".pass__holo")).toHaveCount(0);
      await expect(pass.locator(".pass__status")).toHaveText("Returned");
      await expect(pass.locator(".pass__photo")).toHaveCSS("filter", /grayscale\(1\)/);
    }
  });

  test("the clip's legs enter the slot and end at its lower edge", async ({ page }) => {
    await settled(page);
    for (const pass of await passes(page).all()) {
      const [clip, slot] = await Promise.all([
        pass.locator(".pass__clip").evaluate((element) => {
          const box = element.getBoundingClientRect();
          // The visible clip ends where its clip-path cuts the loop: 0.94em above the box's foot.
          return { bottom: box.bottom - 0.94 * parseFloat(getComputedStyle(element).fontSize), left: box.left, right: box.right };
        }),
        pass.locator(".pass__slot").boundingBox(),
      ]);
      expect(clip.bottom, "the loop goes into the slot").toBeGreaterThan(slot!.y);
      expect(Math.abs(clip.bottom - (slot!.y + slot!.height)), "and ends at its lower edge").toBeLessThanOrEqual(1.5);
    }
  });

  test("every text on a pass is at least 13 px", async ({ page }) => {
    await settled(page);
    const sizes = await page.locator(".opening .pass__card").evaluateAll((cards) =>
      cards.flatMap((card) =>
        [...card.querySelectorAll<HTMLElement>("*")]
          .filter((element) => [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim()))
          .map((element) => [element.textContent!.trim(), parseFloat(getComputedStyle(element).fontSize)] as const),
      ),
    );
    expect(sizes.length).toBeGreaterThan(20);
    for (const [text, size] of sizes) expect(size, text).toBeGreaterThanOrEqual(13);
  });

  test("passes swing to rest once on arrival, each 80 ms after the last, and rest at once with reduced motion", async ({ browser }) => {
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      await page.goto("/");
      const swings = await passes(page).evaluateAll((all) =>
        all.map((pass) => {
          const style = getComputedStyle(pass);
          return [style.animationName, style.animationDelay, style.animationIterationCount];
        }),
      );
      if (reducedMotion === "reduce") expect(swings.map(([name]) => name)).toEqual(["none", "none", "none"]);
      else expect(swings).toEqual([["pass-swing", "0s", "1"], ["pass-swing", "0.08s", "1"], ["pass-swing", "0.16s", "1"]]);
      await context.close();
    }
  });

  test("on hover a pass leans the other way and catches the light where the pointer is", async ({ page }) => {
    test.skip(!(await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)), "Hover needs a fine pointer");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const pass = passes(page).first();
    await expect.poll(() => pass.evaluate((element) => element.getAnimations().length)).toBe(0);
    await expect.poll(() => page.locator(".opening__rail").evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
    const rest = await pass.evaluate((element) => getComputedStyle(element).transform);
    const card = pass.locator(".pass__card");
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.3);
    await expect.poll(() => card.evaluate((element) => element.style.getPropertyValue("--light-x"))).toMatch(/^7\d(\.\d+)?%$/);
    await expect.poll(() => pass.evaluate((element) => getComputedStyle(element).transform)).not.toBe(rest);
    await expect(pass.locator(".pass__sheen")).toHaveCSS("opacity", "1");
  });

  test("a pass is a keyboard stop with the one focus ring, and Enter goes to its employer in Work", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Safari does not Tab to links by default");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const pass = passes(page).first();
    await pass.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(pass).toBeFocused();
    expect(await pass.evaluate((element) => [getComputedStyle(element).outlineStyle, getComputedStyle(element).outlineWidth, getComputedStyle(element).outlineOffset])).toEqual(["solid", "2px", "3px"]);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#bnp-paribas$/);
    await expect(page.locator("#bnp-paribas")).toBeInViewport();
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`every text in the opening and on the passes passes AA (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      await settled(page);
      // The passes' print is hidden from assistive technology, which the measure skips, so it is measured with it shown.
      await page.evaluate(() => document.querySelectorAll(".opening [aria-hidden='true']").forEach((element) => element.removeAttribute("aria-hidden")));
      const texts = await page.locator(".opening").evaluate((element) => (element as HTMLElement).innerText);
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of [opening.support.slice(0, 20), "Valid · present", "Returned", "Key API p95"]) {
        expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });
  }
});
