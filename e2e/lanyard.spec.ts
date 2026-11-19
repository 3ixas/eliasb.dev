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
  test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
  test.skip(browserName !== "chromium", "Headless Chromium renders in software");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await rail(page).scrollIntoViewIfNeeded();
  await expect(rail(page)).toHaveAttribute("data-lanyard", "failed");
  await expect(rail(page)).toHaveAttribute("data-lanyard-error", /^(Software renderer|No hardware WebGL 2)/);
  await expect(scene(page)).toHaveCount(0);
});

test("headless WebKit, which draws in software in CI, keeps the printed passes", async ({ page, browserName }, info) => {
  test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
  test.skip(browserName !== "webkit" || !info.project.name.includes("-1440-light"), "WebKit, once");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await rail(page).scrollIntoViewIfNeeded();
  await expect(rail(page)).toHaveAttribute("data-lanyard", /^(failed|3d)$/);
  const state = await rail(page).evaluate((element) => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    const named = info ? gl!.getParameter(info.UNMASKED_RENDERER_WEBGL) : "(no debug info)";
    return `${element.dataset.lanyard} ${element.dataset.lanyardError ?? ""} | frame ${element.dataset.lanyardFrame ?? "-"} | renderer ${named} | ${gl?.getParameter(gl.RENDERER)} | ${gl?.getParameter(gl.VENDOR)}`;
  });
  info.annotations.push({ type: "renderer", description: state });
  console.log(`WebKit scene: ${state}`);
  // In CI, where WebKit draws in software, the printed passes stay; on a Mac it has the GPU and may draw.
  if (process.env.CI) expect(state).toMatch(/^failed /);
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
    test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
    await page.goto("/");
    await hung(page);
    await expect(scene(page)).toHaveCount(1);
    await expect(scene(page)).toHaveAttribute("aria-hidden", "true");
    // The pad a pointer takes hold through spans all the rail scrolls through, so it scrolls with the passes on a phone.
    // The canvas draws past it, so a card swung to the side is not cut at the rail's edge (#448): never past the window's
    // sides, and not at all where the rail scrolls sideways. Both read together: the scene lays itself out again when the
    // fonts or the window change the rail.
    await expect
      .poll(() =>
        rail(page).evaluate((element) => {
          const pad = element.querySelector<HTMLElement>(".lanyard__pad")!;
          const canvas = element.querySelector<HTMLCanvasElement>("canvas.lanyard__scene")!;
          // Measured as the scene measures: without the canvas, which reaches past the rail.
          const was = canvas.style.width;
          canvas.style.width = "0";
          const width = element.scrollWidth;
          canvas.style.width = was;
          return [width - pad.offsetWidth, element.clientHeight - pad.offsetHeight];
        }),
      )
      .toEqual([0, 0]);
    const reach = await rail(page).evaluate((element) => {
      const canvas = element.querySelector<HTMLCanvasElement>("canvas.lanyard__scene")!.getBoundingClientRect();
      const stage = element.getBoundingClientRect();
      return { left: Math.round(stage.left - canvas.left), right: Math.round(canvas.right - stage.right), within: canvas.right <= document.documentElement.clientWidth + 0.5, scrolls: getComputedStyle(element).overflowX !== "visible" };
    });
    // Where the rail scrolls (a phone) the canvas spans what it scrolls through and no more; elsewhere it reaches past the
    // rail's left and stays inside the window.
    if (reach.scrolls) expect(reach.left).toBe(0);
    else expect([reach.left > 0, reach.within]).toEqual([true, true]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const passes = rail(page).locator(".pass");
    await expect(passes).toHaveCount(3);
    for (const [index, slug] of slugs.entries()) {
      await expect(passes.nth(index)).toHaveAccessibleName(passName(slug));
      await expect(passes.nth(index)).toHaveAttribute("href", `#${slug}`);
    }
  });

  test("a drag on a card swings it and goes nowhere; a click follows its pass's link", async ({ page }, info) => {
    test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
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
    test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
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
    test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
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
    test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
    test.skip(!info.project.name.includes("-390-"), "From a tablet width down to the phone's");
    await page.setViewportSize({ width: 820, height: 844 });
    await page.goto("/");
    await hung(page);
    await page.setViewportSize({ width: 390, height: 844 });
    // The canvas spans the passes and no further: the rail scrolls exactly as far as without it.
    const content = () => rail(page).evaluate((element) => Math.max(...[...element.querySelectorAll<HTMLElement>(".pass")].map((pass) => pass.offsetLeft + pass.offsetWidth)) + parseFloat(getComputedStyle(element).paddingRight));
    await expect.poll(async () => Math.abs((await scene(page).evaluate((canvas: HTMLCanvasElement) => canvas.offsetWidth)) - (await content()))).toBeLessThanOrEqual(1);
  });

  test("the canvas reaches the window's sides, so a swung card is not cut, and follows the window without scrolling the page", async ({ page }, info) => {
    test.skip(!info.project.name.includes("-1440-"), "A wide window");
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto("/work/bnp-paribas");
    const stage = page.locator(".story-open__rail");
    await hung(page, stage);
    const reach = () =>
      stage.evaluate((element) => {
        const canvas = element.querySelector("canvas.lanyard__scene")!.getBoundingClientRect();
        // Within a pixel of each side (the stage sits at a fraction of a pixel), and the page does not scroll sideways.
        const near = (gap: number) => Math.abs(gap) <= 1;
        return [near(canvas.left), near(document.documentElement.clientWidth - canvas.right), document.documentElement.scrollWidth <= document.documentElement.clientWidth];
      });
    await expect.poll(reach).toEqual([true, true, true]);
    // Above 1440 px the stage keeps its size as the window narrows; the canvas still follows the window's sides.
    await page.setViewportSize({ width: 1600, height: 1000 });
    await expect.poll(reach).toEqual([true, true, true]);
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

  test("reduced motion turned on puts the printed passes back, and turned off hangs them again", async ({ page }, info) => {
    test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
    test.skip(!info.project.name.includes("-1440-"), "Once, at the desktop width");
    await page.goto("/");
    await hung(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(scene(page)).toHaveCount(0);
    await expect(rail(page)).not.toHaveAttribute("data-lanyard", /./);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(rail(page)).toHaveAttribute("data-lanyard", "3d", { timeout: 15_000 });
    await expect(scene(page)).toHaveCount(1);
  });

  test("the printed passes never show before the scene takes over", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
    // Every frame from the first paint: the print's opacity, until the scene has drawn.
    await page.addInitScript(() => {
      const seen: string[] = ((window as unknown as { printSeen: string[] }).printSeen = []);
      const sample = () => {
        const rail = document.querySelector<HTMLElement>(".opening__rail");
        const card = rail?.querySelector(".pass__card");
        if (card && rail!.dataset.lanyard !== "3d") seen.push(getComputedStyle(card).opacity);
        if (rail?.dataset.lanyard !== "3d") requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.goto("/");
    await hung(page);
    const seen = await page.evaluate(() => (window as unknown as { printSeen: string[] }).printSeen);
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.filter((opacity) => opacity !== "0")).toEqual([]);
  });

  test("the scene shifts nothing on the page", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
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
    test.skip((page.viewportSize()?.width ?? 0) < 720, "On a phone the homepage's passes hang in Work's panels, without the scene");
    test.skip(browserName !== "chromium", "Chromium");
    await page.goto("/");
    await rail(page).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(scene(page)).toHaveCount(0);
    await expect(rail(page)).not.toHaveAttribute("data-lanyard", "3d");
    await expect(rail(page).locator(".pass__card").first()).toHaveCSS("opacity", "1");
  });
});
