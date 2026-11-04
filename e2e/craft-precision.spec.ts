import { expect, test, type Page } from "@playwright/test";
import { heroPortrait } from "../src/content/stretch/media";

/*
 * What a design engineer does first: interrupt things, look for anything blank, and read a phone's line breaks.
 * Each test holds one finding of the craft review to the real page, so it stays fixed.
 */

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const wide = (page: Page) => width(page) >= 1180;

const hydrated = (page: Page) =>
  page.waitForFunction(() => {
    const columns = [...document.querySelectorAll("[data-quiet-column]")];
    return columns.length > 0 && columns.every((column) => Object.keys(column).some((key) => key.startsWith("__reactProps$")));
  });

test.describe("Interrupting", () => {
  test.use({ reducedMotion: "no-preference" });

  /** Taps the look's trigger and, in the same task, pauses its fold at `at` ms: a slow runner cannot miss a 300 ms transition. Returns the height there. */
  const tapAndPause = (page: Page, at: number) =>
    page.locator('[data-look-slot="joveen"]').evaluate(async (slot, time) => {
      document.querySelector<HTMLElement>('#work button[data-look-tap="joveen"]')!.click();
      const fold = () => slot.getAnimations().find((animation) => (animation as CSSTransition).transitionProperty === "grid-template-rows");
      while (!fold()) await new Promise(requestAnimationFrame);
      fold()!.pause();
      fold()!.currentTime = time;
      await new Promise(requestAnimationFrame);
      return slot.getBoundingClientRect().height;
    }, at);
  /** The height over the next few frames of whatever fold is now running. */
  const nextHeights = (page: Page) =>
    page.locator('[data-look-slot="joveen"]').evaluate(async (slot) => {
      const heights: number[] = [];
      for (let frame = 0; frame < 4; frame++) {
        await new Promise(requestAnimationFrame);
        heights.push(slot.getBoundingClientRect().height);
      }
      return heights;
    });

  test("an inline look reversed part way carries on from the height it reached", async ({ page }) => {
    test.skip(wide(page), "Inline looks are for phones and touch");
    await page.goto("/");
    await hydrated(page);
    await page.locator('#work button[data-look-tap="joveen"]').scrollIntoViewIfNeeded();
    // Closing never grows from where opening had got to.
    const opened = await tapAndPause(page, 100);
    expect(opened).toBeGreaterThan(0);
    await page.locator('#work button[data-look-tap="joveen"]').evaluate((button) => (button as HTMLElement).click());
    for (const height of await nextHeights(page)) expect(height).toBeLessThanOrEqual(opened + 1);
  });

  test("an inline look reopened while it folds carries on from the height it had left", async ({ page }) => {
    test.skip(wide(page), "Inline looks are for phones and touch");
    await page.goto("/");
    await hydrated(page);
    const trigger = page.locator('#work button[data-look-tap="joveen"]');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect.poll(() => page.locator('[data-look-slot="joveen"]').evaluate((slot) => slot.getAnimations().length)).toBe(0);
    const folded = await tapAndPause(page, 100);
    await trigger.evaluate((button) => (button as HTMLElement).click());
    for (const height of await nextHeights(page)) expect(height).toBeGreaterThanOrEqual(folded - 1);
  });

  test("after one glide the margin tracks its row exactly as the page scrolls", async ({ page }) => {
    test.skip(!wide(page), "The margin is for wide screens");
    await page.goto("/");
    await hydrated(page);
    const bnp = page.locator('.qi-row[data-look="bnp-paribas"]');
    const joveen = page.locator('.qi-row[data-look="joveen"]');
    const margin = page.locator(".qi-margin");
    await bnp.scrollIntoViewIfNeeded();
    await bnp.hover();
    await expect(margin).toBeVisible();
    await joveen.hover();
    await expect(margin).toHaveAttribute("data-glide", "");
    await expect.poll(() => margin.evaluate((element) => element.getAnimations().length)).toBe(0);
    // The glide is over, so a scroll moves the margin at once, with nothing left running to catch up with its row.
    await page.mouse.wheel(0, 12);
    await expect(margin).not.toHaveAttribute("data-glide", "");
    await page.mouse.wheel(0, 12);
    await page.evaluate(() => new Promise(requestAnimationFrame));
    expect(await margin.evaluate((element) => element.getAnimations().length)).toBe(0);
  });
});

test.describe("Nothing is blank", () => {
  test("the header's portrait loads with the document, on a resting fill", async ({ page }) => {
    await page.goto("/work/bnp-paribas");
    const portrait = page.locator(".qi-header__face");
    await expect(portrait).not.toHaveAttribute("loading", "lazy");
    expect(await page.locator(`link[rel="preload"][as="image"][imagesrcset*="${encodeURIComponent(heroPortrait.src)}"]`).count()).toBe(1);
    await expect(portrait).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("the first screen of the Work archive has its objects", async ({ page }) => {
    await page.goto("/things-i-make");
    const objects = page.locator(".qi-crop img");
    expect(await objects.count()).toBeGreaterThan(0);
    for (const object of await objects.all()) await expect(object).toHaveAttribute("loading", "eager");
  });

  test("an expanded screenshot has started loading before it opens, and opens on the picture", async ({ page }) => {
    await page.goto("/things-i-make/threshold");
    const button = page.locator(".qi-case__below .qi-zoom").first();
    await expect.poll(() => button.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
    const dialog = page.locator(".qi-zoom__dialog").first();
    await expect(dialog.locator("img")).toHaveCount(0);
    await button.focus();
    await expect(dialog.locator("img")).toHaveCount(1);
    await expect(dialog.locator("img")).not.toHaveAttribute("loading", "lazy");
    await expect.poll(() => dialog.locator("img").evaluate((image) => (image as HTMLImageElement).complete)).toBe(true);
    // Recorded as the dialog opens, so an empty card cannot pass by filling in afterwards.
    const atOpen = dialog.evaluate((element) => new Promise((resolve) => element.addEventListener("toggle", () => resolve(element.querySelector("img")!.naturalWidth), { once: true })));
    await button.click();
    await expect(dialog).toBeVisible();
    expect(await atOpen).toBeGreaterThan(0);
  });

  test("opening waits for the image to decode, even for a click with nothing before it", async ({ page }) => {
    await page.goto("/things-i-make/threshold");
    const button = page.locator(".qi-case__below .qi-zoom").first();
    await expect.poll(() => button.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
    // A click from assistive technology: no pointer or focus first, so nothing has asked for the large image yet.
    await button.evaluate((element) => {
      const calls: string[] = [];
      (window as unknown as { calls: string[] }).calls = calls;
      const { decode } = HTMLImageElement.prototype;
      HTMLImageElement.prototype.decode = function () {
        calls.push("decode");
        return decode.call(this);
      };
      const { showModal } = HTMLDialogElement.prototype;
      HTMLDialogElement.prototype.showModal = function () {
        calls.push("showModal");
        return showModal.call(this);
      };
      (element as HTMLElement).click();
    });
    await expect.poll(() => page.evaluate(() => (window as unknown as { calls: string[] }).calls)).toContain("showModal");
    const calls = await page.evaluate(() => (window as unknown as { calls: string[] }).calls);
    expect(calls.indexOf("decode")).toBeGreaterThanOrEqual(0);
    expect(calls.indexOf("decode")).toBeLessThan(calls.indexOf("showModal"));
  });

  test("a full-column screenshot asks for a full-column file", async ({ page }) => {
    await page.goto("/work/optegra");
    await expect(page.locator(".qi-screens .qi-zoom img").first()).toHaveAttribute("sizes", "(min-width: 761px) 600px, 100vw");
  });

  test("the site declares a touch icon", async ({ page }) => {
    await page.goto("/");
    const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
    const response = await page.request.get(href!);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
});

test.describe("Reading on a phone", () => {
  /** Every visible dot, with whether anything is printed after it, and before it, on its own line. */
  const strandedDots = (page: Page) =>
    page.locator(".qi-dots").evaluateAll((lines) =>
      lines.flatMap((line) => {
        const clipLeft = line.getBoundingClientRect().left;
        const parts = [...line.querySelectorAll<HTMLElement>(".qi-dots__part")].filter((part) => part.getClientRects().length);
        return parts.flatMap((part, index) => {
          const dot = part.querySelector(".qi-dots__dot");
          if (!dot) return [];
          const { left, top } = dot.getBoundingClientRect();
          const before = parts[index - 1]?.getBoundingClientRect();
          const visible = left + 1 >= clipLeft;
          // A dot that shows has its neighbour on the same line; one that starts a line sits in the clipped gutter.
          return visible && before && Math.abs(before.top - top) > 8 ? [line.textContent] : [];
        });
      }),
    );

  for (const route of ["/", "/work/bnp-paribas", "/work/joveen"]) {
    test(`no dot is left alone at either end of a line on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => strandedDots(page)).toEqual([]);
    });
  }

  test("a date range in a Work row stays whole", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const parts = page.locator("#work .qi-row__line .qi-dots__part");
    expect(await parts.count()).toBeGreaterThan(0);
    for (const part of await parts.all()) {
      const lines = await part.evaluate((element) => new Set([...element.getClientRects()].map((rect) => Math.round(rect.top))).size);
      expect(lines).toBe(1);
    }
  });

  test("prose and row lines avoid a lone last word", async ({ page }) => {
    await page.goto("/work/bnp-paribas");
    await expect(page.locator(".qi-long p").first()).toHaveCSS("text-wrap-style", "pretty");
    await page.goto("/");
    await expect(page.locator(".qi-row__line").first()).toHaveCSS("text-wrap-style", "pretty");
  });

  test("the portrait and project looks hold the 13 px floor", async ({ page }) => {
    test.skip(wide(page), "Inline looks are for phones and touch");
    await page.goto("/");
    await hydrated(page);
    const portrait = page.locator('.qi-header button[data-look-tap="face"]');
    await portrait.click();
    const caption = page.locator(".qi-header .qi-face-look figcaption");
    await expect(caption).toBeVisible();
    const effective = (locator: typeof caption) => locator.evaluate((element) => parseFloat(getComputedStyle(element).fontSize) * (element.closest<HTMLElement>(".qi-look") ? parseFloat(getComputedStyle(element.closest<HTMLElement>(".qi-look")!).zoom || "1") : 1));
    expect(await effective(caption)).toBeGreaterThanOrEqual(13);
    await portrait.click();
    const project = page.locator('#things-i-make .qi-list__item:not([data-card]) button[data-look-tap^="project-"]').first();
    await project.scrollIntoViewIfNeeded();
    await project.click();
    const figcaption = page.locator("#things-i-make .qi-project figcaption");
    await expect(figcaption).toBeVisible();
    expect(await effective(figcaption)).toBeGreaterThanOrEqual(13);
    // Filling its slot stops at the contract's 300 px, even on a tablet.
    expect((await page.locator("#things-i-make .qi-project").boundingBox())!.width).toBeLessThanOrEqual(300.5);
  });

  test("the header and the text share one left edge", async ({ page }) => {
    // On a phone the Résumé's sheet runs edge to edge, so its text is the edge; elsewhere the paper is.
    const resumeEdge = width(page) < 761 ? "#resume-name" : ".stretch-resume__sheet";
    for (const [route, text] of [["/work/bnp-paribas", "h1"], ["/resume", resumeEdge]]) {
      await page.goto(route);
      const face = await page.locator(".qi-header__face").boundingBox();
      const edge = await page.locator(text).boundingBox();
      expect(Math.abs(face!.x - edge!.x), route).toBeLessThanOrEqual(0.6);
    }
  });

  test("the greeting is a 44 px target on a phone", async ({ page }) => {
    test.skip(wide(page) || width(page) >= 900, "On a wide screen it is not a button");
    await page.goto("/");
    const greeting = page.locator(".qi-greeting");
    const hits = await greeting.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const inside: number[] = [];
      for (let y = box.top - 12; y <= box.bottom + 20; y++) if (document.elementFromPoint(x, y) === element) inside.push(y);
      return inside.length;
    });
    expect(hits).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Alignment and consistency", () => {
  test("a list's metadata keeps one edge, whichever arrow is beside it", async ({ page }) => {
    test.skip(width(page) < 761, "Phones hide the metadata");
    for (const route of ["/", "/things-i-make"]) {
      await page.goto(route);
      const lefts = await page.locator(":is(#things-i-make, .qi-archive) .qi-row__meta").evaluateAll((all) => all.map((element) => element.getBoundingClientRect().left));
      expect(lefts.length).toBeGreaterThan(1);
      expect(Math.max(...lefts) - Math.min(...lefts)).toBeLessThan(0.5);
    }
  });

  test("Pass pins start on the text edge", async ({ page }) => {
    await page.goto("/work/bnp-paribas");
    const pins = await page.locator(".qi-pins").first().boundingBox();
    const title = await page.locator("h1").boundingBox();
    expect(Math.abs(pins!.x - title!.x)).toBeLessThanOrEqual(0.6);
  });

  for (const route of ["/work/joveen", "/work/optegra"]) {
    test(`every link leaving the site from ${route} opens in a new tab`, async ({ page }) => {
      await page.goto(route);
      const stay = await page.locator('main a[href^="http"]').evaluateAll((links) => links.filter((link) => (link as HTMLAnchorElement).target !== "_blank").map((link) => (link as HTMLAnchorElement).href));
      expect(stay).toEqual([]);
    });
  }

  test("the page keeps a scrollbar's room, so a dialog or a short page cannot move the column", async ({ page }) => {
    test.skip(width(page) < 761, "Phones' scrollbars take no room");
    await page.goto("/things-i-make");
    await expect(page.locator("html")).toHaveCSS("scrollbar-gutter", "stable");
  });
});

test.describe("Colour", () => {
  const luminance = ([r, g, b]: number[]) => {
    const [x, y, z] = [r, g, b].map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * x + 0.7152 * y + 0.0722 * z;
  };

  test("a to-scale figure's long bar holds 3:1 on its card", async ({ page }) => {
    await page.goto("/work/bnp-paribas");
    const bar = page.locator('.qi-scale__bar[data-kind="before"] .qi-scale__fill').first();
    await bar.scrollIntoViewIfNeeded();
    const colours = await bar.evaluate((element) => {
      const canvas = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      const pixel = (colour: string) => {
        canvas.fillStyle = colour;
        canvas.fillRect(0, 0, 1, 1);
        return [...canvas.getImageData(0, 0, 1, 1).data].slice(0, 3);
      };
      return { bar: pixel(getComputedStyle(element).backgroundColor), card: pixel(getComputedStyle(element.closest(".qi-figure__card")!).backgroundColor) };
    });
    const [lighter, darker] = [luminance(colours.bar), luminance(colours.card)].sort((a, b) => b - a);
    expect((lighter + 0.05) / (darker + 0.05)).toBeGreaterThanOrEqual(3);
  });

  test("a theme change crossfades the tiles and GitHub cells with the page", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await hydrated(page);
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--gh-1").trim().startsWith("rgb"))).toBe(true);
    // The press and the read share a task, so a slow runner cannot miss the 300 ms crossfade.
    const animated = await page.locator(".stretch-eclipse").first().evaluate(async (button) => {
      (button as HTMLElement).click();
      await new Promise(requestAnimationFrame);
      return document.documentElement.getAnimations().map((animation) => (animation as CSSTransition).transitionProperty);
    });
    for (const property of ["--stretch-page", "--stretch-paper", "--stretch-stamp", "--bnp", "--gh-1", "--sun"]) expect(animated).toContain(property);
  });
});
