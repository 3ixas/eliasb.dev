import { expect, test } from "@playwright/test";

// Nothing a visitor reads is smaller than 13 px (docs/design/STRETCH.md, "Type"). The pages are
// hydrated and laid out after load, so the reading polls rather than trusting the first one.
const routes = ["/", "/things-i-make/threshold", "/work/bnp-paribas", "/resume", "/things-i-make", "/nothing-pinned-here"];

for (const route of routes) {
  test(`${route} has no visible text under 13 px`, async ({ page }) => {
    await page.goto(route);
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const small: string[] = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              const text = node.textContent?.trim();
              const element = node.parentElement;
              if (!text || !element || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(element.tagName)) continue;
              const style = getComputedStyle(element);
              const box = element.getBoundingClientRect();
              if (style.visibility === "hidden" || style.display === "none" || box.width === 0 || box.height === 0) continue;
              if (parseFloat(style.fontSize) < 13) small.push(`${parseFloat(style.fontSize)}px ${element.className || element.tagName}: ${text.slice(0, 40)}`);
            }
            return small;
          }),
        { message: "visible text elements under 13 px" },
      )
      .toEqual([]);
  });
}

test("a returned Staff pass keeps its dates and its story link on one line, with nothing clipped", async ({ page }) => {
  await page.goto("/");
  const passes = page.locator(".stretch-pass--sm");
  await expect(passes).toHaveCount(2);
  await expect
    .poll(() =>
      passes.evaluateAll((all) =>
        all.flatMap((pass) => {
          // Counts the line boxes of the text itself (not its elements' boxes), so it holds whatever the line height resolves to.
          const lines = (selector: string) => {
            const boxes: DOMRect[] = [];
            const walker = document.createTreeWalker(pass.querySelector(selector)!, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              const range = document.createRange();
              range.selectNodeContents(node);
              boxes.push(...[...range.getClientRects()].filter((rect) => rect.width > 0));
            }
            boxes.sort((a, b) => a.top - b.top);
            let count = 0;
            let bottom = -Infinity;
            for (const box of boxes) {
              if (box.top >= bottom - 2) count += 1;
              bottom = Math.max(bottom, box.bottom);
            }
            return count;
          };
          const clipped = [...pass.querySelectorAll(".stretch-pass__card *")].filter((element) => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).display !== "inline");
          return [lines(".stretch-pass__dates") > 1 ? "dates wrap" : "", lines(".stretch-pass__foot") > 1 ? "foot wraps" : "", clipped.length ? "overflow" : ""].filter(Boolean);
        }),
      ),
    )
    .toEqual([]);
  await expect(passes.locator(".stretch-pass__status")).toHaveCount(0);
});
