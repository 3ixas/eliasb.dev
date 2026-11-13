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
        const clip = glyph.node.parentElement!.closest(".qi-dots");
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
    for (const selector of [".case-open .story-back", ".case-open__links .pill"]) {
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
