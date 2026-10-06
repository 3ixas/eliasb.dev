import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const headline = "I build everyday software, and make complicated things feel simple.";

test.describe("Board foundation", () => {
  test("the headline is one server-rendered heading", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveAccessibleName(headline);
    await expect(heading).toBeVisible();
  });

  test("the header offers Work, Library, and About and stays visible", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(nav.getByRole("link")).toHaveText(["Work", "Library", "About"]);
    await page.mouse.wheel(0, 2400);
    await expect(page.locator("[data-board-header]")).toBeInViewport();
  });

  test("the nav pin marks the section in view", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-nav-pin]")).toHaveCount(0);
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.evaluate(() => document.getElementById("work")?.scrollIntoView({ block: "start" }));
    const work = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Work" });
    await expect(work).toHaveAttribute("aria-current", "location");
    await expect(page.locator("[data-nav-pin]")).toHaveCount(1);
  });

  test("other routes mark the section they belong to", async ({ page }) => {
    await page.goto("/work/threshold");
    const work = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Work" });
    await expect(work).toHaveAttribute("aria-current", "location");
    await expect(work).toHaveAttribute("href", "/#work");
  });

  test("the skip link is reachable and visible on focus", async ({ page, browserName }) => {
    await page.goto("/");
    // WebKit only tabs to links when the platform setting is on; focus directly.
    if (browserName === "webkit") await page.getByRole("link", { name: "Skip to content" }).focus();
    else await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    const outline = await skip.evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(outline).toBe("solid");
  });

  for (const route of ["/", "/work/threshold", "/work/argus-risk", "/work/flowtime", "/fixtures/pins", "/fixtures/board"]) {
    test(`every fixing is attached to a visible surface on ${route}`, async ({ page }) => {
      await page.goto(route);
      const fixings = await page.locator("[data-fixing]").evaluateAll((pins) =>
        pins.map((pin) => {
          const surface = pin.getAttribute("data-surface");
          const holder =
            surface === "paper"
              ? pin.parentElement?.closest('[data-pin], [data-board-surface="paper"]')
              : pin.closest(`[data-board-surface="${surface}"]`);
          const box = holder?.getBoundingClientRect();
          return { surface, attached: Boolean(holder && box && box.width > 0 && box.height > 0) };
        }),
      );
      expect(fixings.length).toBeGreaterThan(0);
      for (const fixing of fixings) expect(fixing, `fixing on ${fixing.surface}`).toEqual({ surface: fixing.surface, attached: true });
    });
  }

  test("the fixtures render every fixing", async ({ page }) => {
    await page.goto("/fixtures/pins");
    const kinds = await page.locator("[data-fixing]").evaluateAll((pins) => [...new Set(pins.map((pin) => pin.getAttribute("data-fixing")))].sort());
    expect(kinds).toEqual(["adhesive", "clip", "clipboard", "pushpin", "shelf", "string", "tape"]);
    for (const kind of kinds) await expect(page.locator(`[data-fixing-mark="${kind}"]`).first()).toBeVisible();
  });

  test("pins respect their tilt limits", async ({ page }) => {
    await page.goto("/fixtures/pins");
    const narrow = (page.viewportSize()?.width ?? 1440) < 900;
    const pins = await page.locator("[data-pin], [data-pin-mount]").evaluateAll((elements) =>
      elements.map((element) => ({
        looseness: element.getAttribute("data-looseness") ?? element.querySelector("[data-pin]")?.getAttribute("data-looseness"),
        angle: Math.abs(parseFloat(getComputedStyle(element).rotate) || 0),
      })),
    );
    for (const { looseness, angle } of pins) {
      const limit = narrow ? Math.min(1.5, looseness === "careful" ? 0.5 : 3) : looseness === "careful" ? 0.5 : 3;
      expect(angle).toBeLessThanOrEqual(limit + 0.001);
    }
  });

  test("the site uses the self-hosted fonts", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const families = await page.evaluate(() => ({
      display: getComputedStyle(document.querySelector("h1")!).fontFamily,
      body: getComputedStyle(document.querySelector("[data-board-header] nav a")!).fontFamily,
      mono: getComputedStyle(document.querySelector("#main-content p")!).fontFamily,
    }));
    expect(families.display).toMatch(/Newsreader/);
    expect(families.body).toMatch(/Hanken Grotesk/);
    expect(families.mono).toMatch(/JetBrains Mono/);
    const external = await page.evaluate(() =>
      performance.getEntriesByType("resource").filter((entry) => /fonts\.(googleapis|gstatic)\.com/.test(entry.name)).length,
    );
    expect(external).toBe(0);
  });

  for (const route of ["/", "/work", "/work/threshold", "/work/argus-risk", "/work/flowtime", "/fixtures/pins", "/nothing-pinned-here"]) {
    test(`nothing scrolls sideways on ${route}`, async ({ page }) => {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("the header fits after a theme has been chosen", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("elias-theme", "dark"));
    await page.goto("/work");
    const row = page.locator("[data-board-header] > div");
    const overflow = await row.evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("pin shadows fall away from the light", async ({ page }) => {
    await page.goto("/");
    const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    const offset = await page.locator('[data-fixing-mark="pushpin"]').first().evaluate((pin) => {
      const head = pin.querySelector("circle")!.getBoundingClientRect();
      const shadow = pin.querySelector("ellipse")!.getBoundingClientRect();
      return shadow.left + shadow.width / 2 - (head.left + head.width / 2);
    });
    // Daylight comes from the window on the left; at night the lamp is on the right.
    if (scheme === "dark") expect(offset).toBeLessThan(0);
    else expect(offset).toBeGreaterThan(0);
  });

  test("a string stays tied to its pin's needle", async ({ page }) => {
    await page.goto("/fixtures/pins");
    const gaps = await page.locator('[data-fixing-mark="string"]').evaluateAll((pins) =>
      pins.map((pin) => {
        const needle = pin.querySelector("line")!.getBoundingClientRect();
        const knot = pin.querySelector("[data-knot]")!.getBoundingClientRect();
        // The knot must overlap the needle's horizontal span, whichever way it leans.
        return Math.max(0, knot.left - needle.right, needle.left - knot.right);
      }),
    );
    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) expect(gap).toBe(0);
  });

  test("fonts load without shifting the layout", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Layout-shift entries are a Chromium API");
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const shift = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
              if (!entry.hadRecentInput) total += entry.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 500);
        }),
    );
    expect(shift).toBeLessThan(0.01);
  });

  test("the header and hero pass axe", async ({ page }) => {
    await page.goto("/");
    // Sections that have not moved to the Board yet are scanned when they do.
    const results = await new AxeBuilder({ page })
      .include("[data-board-header]")
      .include("#main-content > [data-board-surface]")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("legacy routes land on their sections and retired ones are gone", async ({ page, request }) => {
    for (const [from, hash] of [["/about", "#about"], ["/library", "#outside-work"], ["/lab", "#outside-work"]] as const) {
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`/${hash}$`));
    }
    expect((await request.get("/concepts", { maxRedirects: 0 })).status()).toBe(404);
    await page.goto("/");
    await expect(page.locator(".scroll-progress")).toHaveCount(0);
  });
});
