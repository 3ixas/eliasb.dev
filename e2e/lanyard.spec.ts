import { expect, test, type Page } from "@playwright/test";
import { passName } from "../src/content/stretch/pass-name";
import { canDrawScene, withScene } from "./support/scene";

/*
 * The 3D staff pass (#448, #486, #514, parts/lanyard; DESIGN.md "The staff pass"): where the browser can draw it and
 * motion is on, one scene hangs the single current BNP Paribas pass in the homepage opening (on desktop and phone),
 * and another hangs a Role story's pass, over the printed pass, which stays in the page for its name, link and keyboard
 * focus ring. A click on the homepage card follows its link to `#bnp-paribas` and a drag does not.
 * Headless Chromium renders in software, where the scene keeps the printed pass, so the scene tests report a GPU.
 */

const rail = (page: Page) => page.locator(".opening__rail");
const scene = (page: Page) => page.locator("canvas.lanyard__scene");

/** Records every `/lanyard/` texture request (and optionally only successful responses) made by `page`. */
function trackTextures(page: Page, kind: "request" | "response" = "request") {
  const paths: string[] = [];
  if (kind === "request") {
    page.on("request", (request) => {
      const path = new URL(request.url()).pathname;
      if (path.startsWith("/lanyard/")) paths.push(path);
    });
  } else {
    page.on("response", (response) => {
      const path = new URL(response.url()).pathname;
      if (path.startsWith("/lanyard/") && response.ok()) paths.push(path);
    });
  }
  return paths;
}

test("a software renderer keeps the printed pass", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Headless Chromium renders in software");
  const textures = trackTextures(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await rail(page).scrollIntoViewIfNeeded();
  await expect(rail(page)).toHaveAttribute("data-lanyard", "failed");
  await expect(rail(page)).toHaveAttribute("data-lanyard-error", /^(Software renderer|No hardware WebGL 2)/);
  await expect(scene(page)).toHaveCount(0);
  expect(textures).toEqual([]);
});

test("headless WebKit, which draws in software in CI, keeps the printed pass", async ({ page, browserName }, info) => {
  test.skip(browserName !== "webkit" || !/-(390|1440)-light$/.test(info.project.name), "WebKit at phone and desktop widths");
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
  // In CI, where WebKit draws in software, the printed pass stays; on a Mac it has the GPU and may draw.
  if (process.env.CI) expect(state).toMatch(/^failed /);
});

/**
 * Waits for the scene to take the pass's place: it loads once the rail is near the view and the visitor has arrived (the first
 * pointer move or scroll) or the page has settled. A pointer move stands in for the visitor, so a spec does not wait out
 * the settling; "waits for the page to open" below covers the wait itself.
 */
const hung = async (page: Page, stage = rail(page)) => {
  test.skip(!(await canDrawScene(page)), "No WebGL 2 in this browser");
  await page.mouse.move(2, 2);
  await expect(stage).toHaveAttribute("data-lanyard", "3d", { timeout: 15_000 });
};

/** The centre of the printed opening card, where its 3D card hangs at rest. */
const centreOf = async (page: Page) => {
  const box = (await rail(page).locator(".pass__card").first().boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

test.describe("The 3D staff pass", () => {
  test.use({ reducedMotion: "no-preference" });

  test.beforeEach(async ({ page, browserName }, info) => {
    test.skip(browserName !== "chromium" || !/-(390|1440)-/.test(info.project.name), "Chromium at 390 and 1440 px");
    await withScene(page);
  });

  test("the homepage's single BNP Paribas pass hangs in one 3D scene with real textures, unclipped at its top anchor, with no Work-panel passes", async ({ page }) => {
    const loaded = trackTextures(page, "response");
    await page.goto("/");
    await hung(page);
    await expect(scene(page)).toHaveCount(1);
    await expect(scene(page)).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#work .pass, .work__pass")).toHaveCount(0);
    expect([...new Set(loaded)].sort()).toEqual(["/lanyard/foil.webp", "/lanyard/webbing.webp"]);

    // The pad matches the rail; the canvas reaches the window's sides without overflowing sideways, and aligns with the rail's top hairline.
    await expect
      .poll(() =>
        rail(page).evaluate((element) => {
          const pad = element.querySelector<HTMLElement>(".lanyard__pad")!;
          const canvas = element.querySelector<HTMLCanvasElement>("canvas.lanyard__scene")!;
          const was = canvas.style.width;
          canvas.style.width = "0";
          const width = element.scrollWidth;
          canvas.style.width = was;
          return [width - pad.offsetWidth, element.clientHeight - pad.offsetHeight];
        }),
      )
      .toEqual([0, 0]);

    const geometry = await rail(page).evaluate((element) => {
      const canvas = element.querySelector<HTMLCanvasElement>("canvas.lanyard__scene")!.getBoundingClientRect();
      const stage = element.getBoundingClientRect();
      const card = element.querySelector<HTMLElement>(".pass__card")!.getBoundingClientRect();
      const clip = element.querySelector<HTMLElement>(".pass__clip")!.getBoundingClientRect();
      const borderTop = parseFloat(getComputedStyle(element).borderTopWidth) || 0;
      return {
        leftGap: Math.abs(canvas.left),
        rightGap: Math.abs(document.documentElement.clientWidth - canvas.right),
        topOffsetFromHairline: Math.abs(canvas.top - (stage.top + borderTop)),
        clipBelowCanvasTop: clip.top - canvas.top,
        cardBelowCanvasTop: card.top - canvas.top,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(geometry.leftGap).toBeLessThanOrEqual(1);
    expect(geometry.rightGap).toBeLessThanOrEqual(1);
    expect(geometry.topOffsetFromHairline).toBeLessThanOrEqual(1);
    expect(geometry.clipBelowCanvasTop, "strap and clip sit cleanly below the top anchor").toBeGreaterThan(12);
    expect(geometry.cardBelowCanvasTop).toBeGreaterThan(geometry.clipBelowCanvasTop);
    expect(geometry.overflow).toBeLessThanOrEqual(0);

    const passes = rail(page).locator(".pass");
    await expect(passes).toHaveCount(1);
    await expect(passes.first()).toHaveAccessibleName(passName("bnp-paribas"));
    await expect(passes.first()).toHaveAttribute("href", "#bnp-paribas");
  });

  test("resizing between phone and desktop keeps the single opening scene mounted and cleanly aligned", async ({ page }, info) => {
    test.skip(!info.project.name.includes("-390-"), "Starts at phone width and resizes to desktop and back");
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await hung(page);

    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }] as const) {
      await page.setViewportSize(viewport);
      await expect(rail(page)).toHaveAttribute("data-lanyard", "3d");
      await expect(scene(page)).toHaveCount(1);
      await expect
        .poll(() =>
          rail(page).evaluate((element) => {
            const canvas = element.querySelector<HTMLCanvasElement>("canvas.lanyard__scene")!.getBoundingClientRect();
            return [
              Math.abs(canvas.left) <= 1,
              Math.abs(document.documentElement.clientWidth - canvas.right) <= 1,
              document.documentElement.scrollWidth <= document.documentElement.clientWidth,
            ];
          }),
        )
        .toEqual([true, true, true]);
    }
    expect(errors).toEqual([]);
  });

  test("losing the WebGL context disposes the scene and restores the printed pass", async ({ page }) => {
    await page.goto("/");
    await hung(page);
    await rail(page).locator("canvas.lanyard__scene").dispatchEvent("webglcontextlost");
    await expect(rail(page)).toHaveAttribute("data-lanyard", "failed");
    await expect(rail(page)).toHaveAttribute("data-lanyard-error", "WebGL context lost");
    await expect(rail(page).locator("canvas.lanyard__scene")).toHaveCount(0);
    await expect(rail(page).locator(".pass__card").first()).toHaveCSS("opacity", "1");
  });

  test("a drag on the card swings it and goes nowhere; a click follows its link to BNP Paribas", async ({ page }) => {
    await page.goto("/");
    await hung(page);
    const { x, y } = await centreOf(page);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 60, y + 40, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    expect(new URL(page.url()).hash).toBe("");

    await page.reload();
    await hung(page);
    const rest = await centreOf(page);
    await page.mouse.click(rest.x, rest.y);
    await expect(page).toHaveURL(/#bnp-paribas$/);
  });

  test("a Ctrl or Cmd click on the card opens its link in a new tab, as on the printed pass", async ({ page, context }, info) => {
    test.skip(!info.project.name.includes("-1440-"), "A mouse, at the desktop width");
    await page.goto("/");
    await hung(page);
    const { x, y } = await centreOf(page);
    const opened = context.waitForEvent("page");
    await page.keyboard.down("ControlOrMeta");
    await page.mouse.click(x, y);
    await page.keyboard.up("ControlOrMeta");
    expect((await opened).url()).toMatch(/#bnp-paribas$/);
    expect(new URL(page.url()).hash).toBe("");
  });

  test("a middle press let go off the canvas leaves the card working", async ({ page }, info) => {
    test.skip(!info.project.name.includes("-1440-"), "A mouse, at the desktop width");
    await page.goto("/");
    await hung(page);
    const { x, y } = await centreOf(page);
    await page.mouse.move(x, y);
    await page.mouse.down({ button: "middle" });
    await page.mouse.move(5, 5, { steps: 4 });
    await page.mouse.up({ button: "middle" });
    await page.waitForTimeout(1500);
    const rest = await centreOf(page);
    await page.mouse.click(rest.x, rest.y);
    await expect(page).toHaveURL(/#bnp-paribas$/);
  });

  test("the canvas reaches the window's sides, so a swung card is not cut, and follows the window without scrolling the page", async ({ page }, info) => {
    test.skip(!info.project.name.includes("-1440-"), "A wide window");
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto("/");
    const stage = rail(page);
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
    test.skip(!info.project.name.includes("-1440-"), "Once, at the desktop width");
    const textures = trackTextures(page);
    await page.goto("/work/joveen");
    const stage = page.locator(".story-open__rail");
    await hung(page, stage);
    await expect(stage.locator("canvas.lanyard__scene")).toHaveCount(1);
    await expect(stage.locator(".pass")).toHaveAttribute("role", "img");
    // A returned pass has no hologram, so only the webbing tile loads.
    expect(textures).toEqual(["/lanyard/webbing.webp"]);
    const box = (await stage.locator(".pass__card").boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);
    expect(page.url()).toMatch(/\/work\/joveen$/);
  });

  test("a failed texture load falls back to the printed pass without leaving a canvas", async ({ page }, info) => {
    test.skip(!info.project.name.includes("-1440-"), "Once, at the desktop width");
    await page.goto("/");
    await hung(page);

    for (const url of ["**/lanyard/webbing.webp", "**/lanyard/foil.webp"]) {
      await page.route(url, (route) => route.abort());
      await page.reload();
      await expect(rail(page)).toHaveAttribute("data-lanyard", "failed", { timeout: 15_000 });
      await expect(scene(page)).toHaveCount(0);
      await expect(rail(page).locator(".pass__card").first()).toHaveCSS("opacity", "1");
      await page.unroute(url);
    }
  });

  test("reduced motion turned on puts the printed pass back, and turned off hangs it again", async ({ page }, info) => {
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

  test("the printed pass never shows before the scene takes over", async ({ page }) => {
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

  test.describe("The scene waits for the page to open", () => {
    test("its chunk and textures do not load until the first pointer move", async ({ page }) => {
      test.skip(!(await canDrawScene(page)), "No WebGL 2 in this browser");
      const textures = trackTextures(page);
      await page.goto("/");
      await rail(page).scrollIntoViewIfNeeded();
      // The page has not settled yet, and the stage stays unseen meanwhile, so the print never shows and is then swapped.
      await page.waitForTimeout(1500);
      await expect(rail(page)).toHaveAttribute("data-lanyard", "waiting");
      await expect(scene(page)).toHaveCount(0);
      await expect(rail(page).locator(".pass__card").first()).toHaveCSS("opacity", "0");
      expect(textures).toEqual([]);
      await page.mouse.move(40, 40);
      await hung(page);
      await expect(scene(page)).toHaveCount(1);
    });

    test("the first scroll starts it too", async ({ page }) => {
      test.skip(!(await canDrawScene(page)), "No WebGL 2 in this browser");
      await page.goto("/");
      await page.waitForTimeout(1000);
      await expect(rail(page)).toHaveAttribute("data-lanyard", "waiting");
      await page.evaluate(() => window.scrollBy(0, 1));
      await expect(rail(page)).toHaveAttribute("data-lanyard", "3d", { timeout: 15_000 });
    });

    test("with no input at all, it starts once the page has settled", async ({ page }) => {
      test.skip(!(await canDrawScene(page)), "No WebGL 2 in this browser");
      await page.goto("/");
      await expect(rail(page)).toHaveAttribute("data-lanyard", "3d", { timeout: 15_000 });
    });
  });

  test("the scene shifts nothing on the page", async ({ page }) => {
    await page.goto("/");
    // Layout shift from now until a moment after the scene has taken over and swung once.
    await page.evaluate(() => {
      const watch = window as unknown as { shift: number };
      watch.shift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!entry.hadRecentInput) watch.shift += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await hung(page);
    await page.waitForTimeout(2000);
    expect(await page.evaluate(() => (window as unknown as { shift: number }).shift)).toBeLessThanOrEqual(0.01);
  });
});

test.describe("With reduced motion", () => {
  test("the printed pass stays, with no scene", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium");
    const textures = trackTextures(page);
    await page.goto("/");
    await rail(page).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(scene(page)).toHaveCount(0);
    await expect(rail(page)).not.toHaveAttribute("data-lanyard", "3d");
    await expect(rail(page).locator(".pass__card").first()).toHaveCSS("opacity", "1");
    expect(textures).toEqual([]);
  });
});
