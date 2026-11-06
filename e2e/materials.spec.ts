import { expect, test } from "@playwright/test";

/*
 * The materials of the objects, held by picture: shadows and lit edges in both themes, the foil seal on each pass, Optegra's
 * colours and the project crops, from /fixtures/materials. Whole pages are not compared, since their live data and copy
 * change; these groups don't. One Chromium project, at 3x so a 44 px object shows its detail. Baselines come from the
 * Playwright image CI runs in, so update them with `pnpm test:visual:update` (docs/runbooks/visual-baselines.md).
 */
const shots = [
  "mini-passes",
  "project-crops",
  "paper-objects",
  "full-pass-bnp-paribas",
  "full-pass-joveen",
  "full-pass-optegra",
  "project-look",
];

test.use({ deviceScaleFactor: 3 });

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} objects`, () => {
    test.use({ colorScheme: scheme });

    for (const shot of shots) {
      test(shot, async ({ page }, info) => {
        test.skip(info.project.name !== "chromium-1440-light", "Visual regression runs on one Chromium project");
        await page.goto("/fixtures/materials");
        await page.evaluate(() => document.fonts.ready);
        const group = page.locator(`[data-shot="${shot}"]`);
        await expect(group).toBeVisible();
        // Every image is decoded before the picture, or a crop would be compared half-loaded.
        await expect.poll(() => group.locator("img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
        await expect(group).toHaveScreenshot(`${shot}-${scheme}.png`, { maxDiffPixelRatio: 0.005, animations: "disabled" });
      });
    }
  });
}
