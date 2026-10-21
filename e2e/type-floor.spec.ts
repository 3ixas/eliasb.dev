import { expect, test } from "@playwright/test";

// Nothing a visitor reads is smaller than 13 px (docs/design/STRETCH.md, "Type"). The pages are
// hydrated and laid out after load, so the reading polls rather than trusting the first one.
const routes = ["/", "/things-i-make/threshold", "/work/bnp-paribas", "/things-i-make", "/nothing-pinned-here"];

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
          const lines = (selector: string) => {
            const element = pass.querySelector(selector)!;
            return Math.round(element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight || "0") || 1);
          };
          const clipped = [...pass.querySelectorAll(".stretch-pass__card *")].filter((element) => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).display !== "inline");
          return [lines(".stretch-pass__dates") > 1 ? "dates wrap" : "", lines(".stretch-pass__foot") > 1 ? "foot wraps" : "", clipped.length ? "overflow" : ""].filter(Boolean);
        }),
      ),
    )
    .toEqual([]);
  await expect(passes.locator(".stretch-pass__status")).toHaveCount(0);
});
