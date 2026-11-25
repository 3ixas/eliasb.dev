import { expect, test, type Page } from "@playwright/test";
import { roleStories } from "../src/content/stretch/role-stories";

/** Shell-wide details from the audit (#196): arrow gaps, unbreakable separators, hover-only colour, 100svh, an ink History line. */

/** Every "·" in the page's metadata lines that is the first glyph on its line, as the text around it. */
const dotsStartingALine = (page: Page) =>
  page.evaluate(() => {
    const found: string[] = [];
    for (const line of document.querySelectorAll<HTMLElement>(".stretch-mono")) {
      const glyphs: { node: Text; at: number }[] = [];
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
        for (let at = 0; at < node.length; at++) if (/\S/.test(node.data[at])) glyphs.push({ node, at });
      }
      const top = ({ node, at }: { node: Text; at: number }) => {
        const range = document.createRange();
        range.setStart(node, at);
        range.setEnd(node, at + 1);
        return range.getBoundingClientRect().top;
      };
      glyphs.forEach((glyph, index) => {
        if (glyph.node.data[glyph.at] !== "·" || index === 0 || !line.getClientRects().length) return;
        // A dot that leads a wrapped line sits in the gutter its line clips (dot-line.tsx), so nobody sees it.
        const clip = glyph.node.parentElement!.closest(".dot-line");
        if (clip && glyph.node.parentElement!.getBoundingClientRect().left + 1 < clip.getBoundingClientRect().left) return;
        if (top(glyph) > top(glyphs[index - 1]) + 2) found.push(line.textContent!.trim());
      });
    }
    return found;
  });

/** A link whose arrow is a decorative span: the gap between the arrow and the words next to it, in px. */
const arrowGap = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((link) => {
    const arrow = link.querySelector("[aria-hidden='true']")!;
    const words = document.createRange();
    // The words a screen reader alone hears (where a link opens) take no room, so they are not the neighbour.
    const shown = (node: ChildNode | null) => (node instanceof Element && node.classList.contains("sr-only") ? null : node);
    const after = shown(arrow.nextSibling);
    if (after) words.selectNodeContents(after);
    else words.selectNodeContents(arrow.previousSibling!);
    const arrowBox = arrow.getBoundingClientRect();
    const wordsBox = words.getBoundingClientRect();
    return after ? wordsBox.left - arrowBox.right : arrowBox.left - wordsBox.right;
  });

test.describe("Shell details: arrows", () => {
  test("the case study's back link and its Live site and Code keep a gap between label and arrow, with no literal space", async ({ page }) => {
    await page.goto("/things-i-make/threshold");
    for (const selector of [".case-header .story-back", ".case-header__links .pill", ".tlink__open"]) {
      await expect.poll(() => arrowGap(page, selector)).toBeGreaterThanOrEqual(3);
      expect(await page.locator(selector).first().evaluate((link) => [...link.childNodes].filter((node) => !(node instanceof Element && node.classList.contains("sr-only"))).map((node) => node.textContent).join(""))).not.toMatch(/[←↗]\s|\s[←↗]/);
    }
  });

  test("a Role story's back link has the gap too", async ({ page }) => {
    await page.goto(`/work/${Object.keys(roleStories)[0]}`);
    await expect.poll(() => arrowGap(page, ".story-back")).toBeGreaterThanOrEqual(3);
    expect(await page.locator(".story-back").textContent()).not.toMatch(/[←↗]\s|\s[←↗]/);
  });
});

test.describe("Shell details: separators", () => {
  for (const route of ["/", "/things-i-make", "/things-i-make/threshold", `/work/${Object.keys(roleStories)[0]}`]) {
    test(`no metadata line on ${route} starts with the dot`, async ({ page }) => {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => dotsStartingALine(page)).toEqual([]);
    });
  }

  test("a row's line stays inside its row, even at the narrowest width", async ({ page }) => {
    await page.goto("/nothing-here");
    await page.evaluate(() => document.fonts.ready);
    // The quiet index's metadata lines and rows retired with the 404's in #419; its rows are the shared part now.
    const rows = page.locator("main .row");
    await expect(rows.first()).toBeVisible();
    await expect.poll(() => rows.evaluateAll((all) => all.filter((row) => row.scrollWidth > row.clientWidth).length)).toBe(0);
  });
});

test.describe("Shell details: hover and height", () => {
  test("no colour or underline hover applies outside @media (hover: hover)", async ({ page }) => {
    await page.goto("/");
    const stuck = await page.evaluate(() => {
      const found: string[] = [];
      for (const sheet of document.styleSheets) {
        for (const rule of sheet.cssRules) {
          // Top-level rules only: a rule inside @media (hover: hover) arrives as a CSSMediaRule.
          if (!(rule instanceof CSSStyleRule) || !rule.selectorText.includes(":hover")) continue;
          const { color, textDecorationLine, textDecoration } = rule.style;
          if (color || textDecorationLine || textDecoration) found.push(rule.selectorText);
        }
      }
      return found;
    });
    expect(stuck).toEqual([]);
  });

  test("the shell's minimum height is 100svh", async ({ page }) => {
    await page.goto("/");
    const declared = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        for (const rule of sheet.cssRules) {
          if (rule instanceof CSSStyleRule && rule.selectorText === "[data-site]" && rule.style.minHeight) return rule.style.minHeight;
        }
      }
      return null;
    });
    expect(declared).toBe("100svh");
  });
});

test.describe("Shell details: skip link and greeting", () => {
  for (const route of ["/", "/work/bnp-paribas", "/things-i-make"]) {
    test(`the skip link on ${route} is at least 44 px tall once focused`, async ({ page, browserName }) => {
      test.skip(browserName === "webkit", "Safari's Tab skips links unless the visitor has turned that on");
      await page.goto(route);
      await page.keyboard.press("Tab");
      const skip = page.locator("a.skip-link");
      await expect(skip).toBeFocused();
      expect((await skip.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    });
  }

  test("the greeting keeps its tab stop after the name, has a role, a 44 px hit area and says London's time in a status", async ({ page, browserName }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 400, "The greeting hides under 400 px");
    await page.goto("/");
    const greeting = page.locator(".greeting");
    const wide = await page.evaluate(() => matchMedia("(hover: hover) and (min-width: 900px)").matches);
    // Script sets the role for the visitor's screen; the server renders the button.
    await expect(greeting).toHaveAttribute("role", wide ? "group" : "button");
    await expect(greeting).toHaveRole(wide ? "group" : "button");
    if (wide) await expect(greeting).toHaveAccessibleName("Greeting");
    else await expect(greeting).toHaveAttribute("aria-expanded", "false");

    // The skip link, the name, then the greeting; Safari's Tab passes over links, so there it is the first stop.
    for (let tab = 0; tab < (browserName === "webkit" ? 1 : 3); tab++) await page.keyboard.press("Tab");
    await expect(greeting).toBeFocused();

    // Taller than its words: a point 21 px above and below its centre still lands on it.
    const box = (await greeting.boundingBox())!;
    const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    for (const dy of [-21, 21]) {
      expect(await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest(".greeting"), { x: centre.x, y: centre.y + dy }), `${dy} px from the centre`).toBe(true);
    }

    // Where it is a button, a key opens London's time; where it is not, focus has already said it.
    if (!wide) await page.keyboard.press("Enter");
    await expect(page.locator("[data-site-header]").getByRole("status")).toHaveText(/\d{2}:\d{2}/);
  });
});
