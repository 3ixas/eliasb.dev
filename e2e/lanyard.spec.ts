import { expect, test, type Page } from "@playwright/test";
import { passName } from "../src/content/stretch/pass-name";
import { canDrawScene, withScene } from "./support/scene";

/*
 * The 3D staff passes (#448, parts/lanyard; DESIGN.md "The staff pass"): where the browser can draw them and motion is on,
 * one scene hangs the homepage's three passes, and another a Role story's pass, over the printed passes, which stay in the
 * page for their names, links and the keyboard. A click on a homepage card follows its link and a drag does not.
 * Drawn in Chromium at the phone and desktop widths; a browser without WebGL 2 keeps the printed passes (opening.spec).
 * Headless Chromium renders in software, where the scene would keep the printed passes, so these specs report a GPU.
 */

test("a software renderer keeps the printed passes", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Headless Chromium renders in software");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await rail(page).scrollIntoViewIfNeeded();
  await expect(rail(page)).toHaveAttribute("data-lanyard", "failed");
  await expect(rail(page)).toHaveAttribute("data-lanyard-error", /^Software renderer/);
  await expect(scene(page)).toHaveCount(0);
});

const slugs = ["bnp-paribas", "joveen", "optegra"] as const;
const rail = (page: Page) => page.locator(".opening__rail");
const scene = (page: Page) => page.locator("canvas.lanyard__scene");

/** Waits for the scene to take the passes' place: it loads once the rail is near the view. */
const hung = async (page: Page, stage = rail(page)) => {
  test.skip(!(await canDrawScene(page)), "No WebGL 2 in this browser");
  await expect(stage).toHaveAttribute("data-lanyard", "3d", { timeout: 15_000 });
};

/** The centre of a printed card, where its 3D card hangs at rest. */
const centreOf = async (page: Page, index: number) => {
  const box = (await rail(page).locator(".pass__card").nth(index).boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

test.describe("The 3D staff passes", () => {
  test.use({ reducedMotion: "no-preference" });

  test.beforeEach(async ({ page, browserName }, info) => {
    test.skip(browserName !== "chromium" || !/-(390|1440)-/.test(info.project.name), "Chromium at 390 and 1440 px");
    await withScene(page);
  });

  test("the homepage's three passes hang in one scene, which spans the rail, and keep their names and links", async ({ page }) => {
    await page.goto("/");
    await hung(page);
    await expect(scene(page)).toHaveCount(1);
    await expect(scene(page)).toHaveAttribute("aria-hidden", "true");
    // The canvas spans all the rail scrolls through, so it scrolls with the passes on a phone.
    await expect.poll(() => rail(page).evaluate((element) => [element.scrollWidth, element.clientHeight])).toEqual(await scene(page).evaluate((canvas: HTMLCanvasElement) => [canvas.offsetWidth, canvas.offsetHeight]));
    const passes = rail(page).locator(".pass");
    await expect(passes).toHaveCount(3);
    for (const [index, slug] of slugs.entries()) {
      await expect(passes.nth(index)).toHaveAccessibleName(passName(slug));
      await expect(passes.nth(index)).toHaveAttribute("href", `#${slug}`);
    }
  });

  test("a drag on a card swings it and goes nowhere; a click follows its pass's link", async ({ page }, info) => {
    test.skip(!info.project.name.includes("-1440-"), "A mouse, at the desktop width");
    await page.goto("/");
    await hung(page);
    const { x, y } = await centreOf(page, 0);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 60, y + 40, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    expect(new URL(page.url()).hash).toBe("");

    await page.reload();
    await hung(page);
    const rest = await centreOf(page, 0);
    await page.mouse.click(rest.x, rest.y);
    await expect(page).toHaveURL(/#bnp-paribas$/);
  });

  test("a Ctrl or Cmd click on a card opens its link in a new tab, as on the printed pass", async ({ page, context }, info) => {
    test.skip(!info.project.name.includes("-1440-"), "A mouse, at the desktop width");
    await page.goto("/");
    await hung(page);
    const { x, y } = await centreOf(page, 0);
    const opened = context.waitForEvent("page");
    await page.keyboard.down("ControlOrMeta");
    await page.mouse.click(x, y);
    await page.keyboard.up("ControlOrMeta");
    expect((await opened).url()).toMatch(/#bnp-paribas$/);
    expect(new URL(page.url()).hash).toBe("");
  });

  test("a middle press let go off the canvas leaves the cards working", async ({ page }, info) => {
    test.skip(!info.project.name.includes("-1440-"), "A mouse, at the desktop width");
    await page.goto("/");
    await hung(page);
    const { x, y } = await centreOf(page, 0);
    await page.mouse.move(x, y);
    await page.mouse.down({ button: "middle" });
    await page.mouse.move(5, 5, { steps: 4 });
    await page.mouse.up({ button: "middle" });
    await page.waitForTimeout(1500);
    const rest = await centreOf(page, 0);
    await page.mouse.click(rest.x, rest.y);
    await expect(page).toHaveURL(/#bnp-paribas$/);
  });

  test("the canvas narrows with the rail when the window does", async ({ page }, info) => {
    test.skip(!info.project.name.includes("-390-"), "From a tablet width down to the phone's");
    await page.setViewportSize({ width: 820, height: 844 });
    await page.goto("/");
    await hung(page);
    await page.setViewportSize({ width: 390, height: 844 });
    // The canvas spans the passes and no further: the rail scrolls exactly as far as without it.
    const content = () => rail(page).evaluate((element) => Math.max(...[...element.querySelectorAll<HTMLElement>(".pass")].map((pass) => pass.offsetLeft + pass.offsetWidth)) + parseFloat(getComputedStyle(element).paddingRight));
    await expect.poll(async () => Math.abs((await scene(page).evaluate((canvas: HTMLCanvasElement) => canvas.offsetWidth)) - (await content()))).toBeLessThanOrEqual(1);
  });

  test("a Role story's pass hangs in its own scene, and a click on it goes nowhere", async ({ page }, info) => {
    test.skip(!info.project.name.includes("-1440-"), "A mouse, at the desktop width");
    await page.goto("/work/joveen");
    const stage = page.locator(".story-open__rail");
    await hung(page, stage);
    await expect(stage.locator("canvas.lanyard__scene")).toHaveCount(1);
    await expect(stage.locator(".pass")).toHaveAttribute("role", "img");
    const box = (await stage.locator(".pass__card").boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);
    expect(page.url()).toMatch(/\/work\/joveen$/);
  });

  test("the scene shifts nothing on the page", async ({ page }) => {
    await page.goto("/");
    const total = page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let sum = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!entry.hadRecentInput) sum += entry.value;
          }).observe({ type: "layout-shift", buffered: true });
          // Long enough for the scene to load, take over and swing once.
          setTimeout(() => resolve(sum), 4000);
        }),
    );
    await hung(page);
    expect(await total).toBeLessThanOrEqual(0.01);
  });
});

test.describe("With reduced motion", () => {
  test("the printed passes stay, with no scene", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium");
    await page.goto("/");
    await rail(page).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(scene(page)).toHaveCount(0);
    await expect(rail(page)).not.toHaveAttribute("data-lanyard", "3d");
    await expect(rail(page).locator(".pass__card").first()).toHaveCSS("opacity", "1");
  });
});
