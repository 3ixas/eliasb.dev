import { expect, test, type Page } from "@playwright/test";
import { roleStories } from "../src/content/stretch/role-stories";
import { opening } from "../src/content/stretch/opening";
import { passName } from "../src/content/stretch/pass-name";
import { passHang, passRecords, passStatus } from "../src/content/stretch/staff-pass";
import { renderedContrast } from "./support/rendered-contrast";
import { withoutScene } from "./support/scene";

/*
 * The homepage's opening (docs/design/DESIGN.md "The homepage, in order" 2 and "The staff pass", R-11, R-12 and R-44):
 * the opening line as the page's one h1, its supporting line, primary actions (`Work` and `Say hello`), and one Staff
 * pass — the current BNP Paribas pass — hanging from the header's hairline at the right on desktop and from a quiet
 * rail hairline below the actions under 960 px. No Work panel carries a pass.
 */

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

  test("the supporting line and primary actions follow in order, with 44 px targets and no bottom metadata baseline", async ({ page }) => {
    const support = page.locator(".opening__support");
    await expect(support).toHaveText(opening.support);
    expect(parseFloat(await support.evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(18);
    const actions = page.locator(".opening__actions a");
    await expect(actions).toHaveCount(2);
    await expect(actions.nth(0)).toHaveText("Work");
    await expect(actions.nth(0)).toHaveAttribute("href", "#work");
    await expect(actions.nth(1)).toHaveText("Say hello");
    await expect(actions.nth(1)).toHaveAttribute("href", "#say-hello");
    const [h1, line, actionsBox] = await Promise.all([
      heading(page).boundingBox(),
      support.boundingBox(),
      page.locator(".opening__actions").boundingBox(),
    ]);
    expect(line!.y, "under the opening line").toBeGreaterThanOrEqual(h1!.y + h1!.height);
    expect(actionsBox!.y, "actions under supporting line").toBeGreaterThanOrEqual(line!.y + line!.height);
    for (const action of await actions.all()) {
      expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.locator(".opening__meta, .opening__scroll, .opening__baseline")).toHaveCount(0);
  });

  test("the opening line, supporting line, actions and single BNP Paribas pass are in the page with no script", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(heading(page)).toHaveText(opening.headline);
    await expect(page.locator(".opening__support")).toHaveText(opening.support);
    await expect(page.locator(".opening__actions a")).toHaveCount(2);
    await expect(passes(page)).toHaveCount(1);
    await expect(passes(page).first()).toBeVisible();
  });

  test("the old opening's reacting employer, mini pass, reveal words and hero are gone", async ({ page }) => {
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

  test("from 960 px the pass hangs from the header hairline at the right; under 960 px it hangs from a quiet rail hairline below the actions", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    const [header, text, actions, rail, section, card] = await Promise.all([
      page.locator("[data-site-header]").boundingBox(),
      page.locator(".opening__text").boundingBox(),
      page.locator(".opening__actions").boundingBox(),
      page.locator(".opening__rail").boundingBox(),
      page.locator(".opening").boundingBox(),
      passes(page).first().locator(".pass__card").boundingBox(),
    ]);
    if (width(page) >= 960) {
      expect(rail!.x).toBeGreaterThanOrEqual(text!.x + text!.width);
      expect(Math.abs(rail!.y - section!.y)).toBeLessThanOrEqual(1);
      expect(rail!.y).toBeGreaterThanOrEqual(header!.y + header!.height - 1);
    } else {
      expect(rail!.y).toBeGreaterThanOrEqual(text!.y + text!.height - 1);
      expect(rail!.y).toBeGreaterThanOrEqual(actions!.y + actions!.height);
      expect(card!.y, "card sits cleanly below the rail hairline").toBeGreaterThan(rail!.y);
      await expect(page.locator(".opening__rail")).toHaveCSS("border-top-width", "1px");
    }
    await expect(page.locator(".opening__rail")).toHaveCSS("clip-path", /^inset\(0px /);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
});

test.describe("The staff pass", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("only the current BNP Paribas pass renders in the opening at every width, and no Work panel carries a pass", async ({ page }) => {
    await expect(passes(page)).toHaveCount(1);
    const bnp = passes(page).first();
    await expect(bnp).toBeVisible();
    await expect(bnp).toHaveAttribute("href", "#bnp-paribas");
    await expect(page.locator("#bnp-paribas")).toHaveCount(1);
    await expect(page.locator("#work .pass, .work__pass")).toHaveCount(0);
    const passWidth = await bnp.evaluate((element) => (element as HTMLElement).offsetWidth);
    expect(passWidth).toBeGreaterThanOrEqual(248);
    expect(passWidth).toBeLessThanOrEqual(264);
    // Work panels keep their visible header at every width, including phones.
    for (const slug of ["bnp-paribas", "joveen", "optegra"] as const) {
      const head = await page.locator(`#${slug} .panel__head`).boundingBox();
      expect(head!.width, slug).toBeGreaterThan(40);
      expect(head!.height, slug).toBeGreaterThan(20);
    }
  });

  test("it prints the band, portrait, name, role, dates, status and barcode, with no results, and its name is its print", async ({ page }) => {
    const slug = "bnp-paribas";
    const pass = passes(page).first();
    const card = pass.locator(".pass__card");
    const { short } = passRecords[slug];
    const { role, dates } = roleStories[slug];
    await expect(card.locator(".pass__band")).toHaveText(short);
    await expect(card.locator(".pass__photo")).toHaveAttribute("src", /elias-evening-pass/);
    await expect(card.locator(".pass__who")).toHaveText(`Elias Bennett${role}${dates}`);
    await expect(card.locator(".pass__points")).toHaveCount(0);
    await expect(card.locator(".pass__status")).toHaveText(passStatus(passHang[slug].state));
    await expect(card.locator(".pass__holo")).toHaveCount(1);
    await expect(card.locator(".pass__status")).toHaveText("Valid · present");
    await expect(card.locator(".pass__photo")).toHaveCSS("filter", "none");
    await expect(card.locator(".pass__code")).toBeVisible();
    await expect(card).toHaveAttribute("aria-hidden", "true");
    await expect(pass).toHaveAccessibleName(passName(slug));
  });

  test("the clip's legs enter the slot and end at its lower edge, sitting cleanly below the top rail", async ({ page }) => {
    await settled(page);
    const pass = passes(page).first();
    const [rail, clip, slot] = await Promise.all([
      page.locator(".opening__rail").boundingBox(),
      pass.locator(".pass__clip").evaluate((element) => {
        const box = element.getBoundingClientRect();
        // The visible clip ends where its clip-path cuts the loop: 0.94em above the box's foot.
        return { top: box.top, bottom: box.bottom - 0.94 * parseFloat(getComputedStyle(element).fontSize), left: box.left, right: box.right };
      }),
      pass.locator(".pass__slot").boundingBox(),
    ]);
    expect(clip.top, "the clip starts below the rail hairline").toBeGreaterThan(rail!.y + 12);
    expect(clip.bottom, "the loop goes into the slot").toBeGreaterThan(slot!.y);
    expect(Math.abs(clip.bottom - (slot!.y + slot!.height)), "and ends at its lower edge").toBeLessThanOrEqual(1.5);
  });

  test("every text on the pass is at least 13 px", async ({ page }) => {
    await settled(page);
    const sizes = await passes(page)
      .locator(".pass__card")
      .evaluateAll((cards) =>
        cards.flatMap((card) =>
          [...card.querySelectorAll<HTMLElement>("*")]
            .filter((element) => [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim()))
            .map((element) => [element.textContent!.trim(), parseFloat(getComputedStyle(element).fontSize)] as const),
        ),
      );
    expect(sizes.length).toBeGreaterThanOrEqual(5);
    for (const [text, size] of sizes) expect(size, text).toBeGreaterThanOrEqual(13);
  });

  test("the printed pass swings to rest once on arrival and rests at once with reduced motion", async ({ browser }) => {
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      const context = await browser.newContext({ reducedMotion });
      // Where the 3D scene can draw, it takes the printed pass's place and swings it itself (lanyard.spec).
      await withoutScene(context);
      const page = await context.newPage();
      await page.goto("/");
      const swings = await passes(page).evaluateAll((all) =>
        all.map((pass) => {
          const style = getComputedStyle(pass);
          return [style.animationName, style.animationDelay, style.animationIterationCount];
        }),
      );
      if (reducedMotion === "reduce") expect(swings.map(([name]) => name)).toEqual(["none"]);
      else expect(swings).toEqual([["pass-swing", "0s", "1"]]);
      await context.close();
    }
  });

  test("on hover the pass leans the other way and catches the light where the pointer is", async ({ page }) => {
    test.skip(!(await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)), "Hover needs a fine pointer");
    // The suite runs with reduced motion; the hover's lean and light are motion, so the page is loaded again without it,
    // and without the 3D scene, which takes the printed pass's place wherever it can draw (lanyard.spec).
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await withoutScene(page);
    await page.reload();
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

  test("the pass is a keyboard stop with the one focus ring, and Enter goes to the BNP Paribas panel in Work", async ({ page, browserName }) => {
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
    test(`every text in the opening and on the pass passes AA (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      await settled(page);
      // The pass's print is hidden from assistive technology, which the measure skips, so it is measured with it shown.
      await page.evaluate(() => document.querySelectorAll(".opening [aria-hidden='true']").forEach((element) => element.removeAttribute("aria-hidden")));
      const texts = (await page.locator(".opening").evaluateAll((elements) => elements.map((element) => (element as HTMLElement).innerText))).join("\n");
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of [opening.support.slice(0, 20), "Work", "Say hello", "Valid · present", roleStories["bnp-paribas"].role]) {
        expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });
  }
});
