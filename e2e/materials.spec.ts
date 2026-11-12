import { expect, test } from "@playwright/test";

/*
 * The materials of the shared parts, held by picture: each panel field with its pills, the controls on the page and
 * rows on paper, in both themes, from /fixtures/parts. Whole pages are not compared, since their live data and copy
 * change; these groups don't. One Chromium project, at 2x so a hairline and a top edge show. Baselines come from the
 * Playwright image CI runs in (docs/runbooks/visual-baselines.md).
 *
 * The quiet index's objects were pictured here until #423; their parts retire with it.
 */
const shots = ["controls", "panels", "rows"];

test.use({ deviceScaleFactor: 2 });

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} parts`, () => {
    test.use({ colorScheme: scheme });

    for (const shot of shots) {
      test(shot, async ({ page }, info) => {
        test.skip(info.project.name !== "chromium-1440-light", "Visual regression runs on one Chromium project");
        await page.goto("/fixtures/parts");
        await page.evaluate(() => document.fonts.ready);
        const group = page.locator(`[data-shot="${shot}"]`);
        await expect(group).toBeVisible();
        await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
        await expect(group).toHaveScreenshot(`${shot}-${scheme}.png`, { maxDiffPixelRatio: 0.005, animations: "disabled", scale: "device" });
      });
    }
  });
}
