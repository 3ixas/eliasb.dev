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
    const after = arrow.nextSibling;
    if (after) words.selectNodeContents(after);
    else words.selectNodeContents(arrow.previousSibling!);
    const arrowBox = arrow.getBoundingClientRect();
    const wordsBox = words.getBoundingClientRect();
    return after ? wordsBox.left - arrowBox.right : arrowBox.left - wordsBox.right;
  });

test.describe("Shell details: arrows", () => {
  test("the case study's back link and buttons keep a gap between label and arrow, with no literal space", async ({ page }) => {
    await page.goto("/things-i-make/threshold");
    for (const selector of [".stretch-cs-back", ".stretch-cs-button:has([aria-hidden='true'])"]) {
      await expect.poll(() => arrowGap(page, selector)).toBeGreaterThanOrEqual(3);
      expect(await page.locator(selector).first().textContent()).not.toMatch(/[←↗]\s|\s[←↗]/);
    }
  });

  test("a Role story's back link has the gap too", async ({ page }) => {
    await page.goto(`/work/${Object.keys(roleStories)[0]}`);
    await expect.poll(() => arrowGap(page, ".stretch-cs-back")).toBeGreaterThanOrEqual(3);
  });

  test("the 404's link home has the gap", async ({ page }) => {
    await page.goto("/nothing-here");
    await expect.poll(() => arrowGap(page, ".stretch-404__home")).toBeGreaterThanOrEqual(3);
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

  test("every dot in a metadata line is bound to the item before it", async ({ page }) => {
    for (const route of ["/", "/things-i-make/threshold"]) {
      await page.goto(route);
      const lines = await page.locator(".stretch-cs-open__meta, .stretch-index__meta, .stretch-tile__meta, .stretch-work__history").allTextContents();
      expect(lines.length).toBeGreaterThan(0);
      for (const line of lines) expect(line).not.toMatch(/[^\u00a0]·/u);
    }
  });

  test("the History line stays inside its dashed box, even at the narrowest width", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const history = page.locator(".stretch-work__history");
    await expect.poll(() => history.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(0);
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
          if (rule instanceof CSSStyleRule && rule.selectorText === "[data-stretch-shell]" && rule.style.minHeight) return rule.style.minHeight;
        }
      }
      return null;
    });
    expect(declared).toBe("100svh");
  });
});

test.describe("Shell details: the History clipping", () => {
  test("the line under its heading is ink, not cobalt", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    const label = page.locator("[data-fixture='clipping-week'] .stretch-otc__label");
    const ink = await page.locator("[data-stretch-shell]").evaluate((node) => getComputedStyle(node).color);
    await expect(label).toHaveCSS("border-bottom-color", ink);
  });
});
