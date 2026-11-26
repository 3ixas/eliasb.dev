import AxeBuilder from "@axe-core/playwright";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import nextConfig from "../next.config";
import { renderedContrast } from "./support/rendered-contrast";

// The mechanical half of Rauno's portfolio checklist and the passes and panels standing checks (R-28, R-29), held on
// every page (#249, #264, #424): one h1, the skip link, content without script, axe, AA contrast, focus rings,
// external links and no sideways scroll. Pages come
// from the sitemap when the spec runs, so a new page is covered the moment it ships; the 404 is
// added by hand because the sitemap leaves it out.
const notFoundRoute = "/nothing-pinned-here";
// An absolute link to the live site is still internal, and is requested here by its path.
const siteHosts = new Set(["eliasb.dev", "www.eliasb.dev"]);
/** The one project the width-independent checks run on. */
const linkProject = "chromium-1440-light";

async function pages(request: APIRequestContext) {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url).pathname);
  expect(routes.length, "the sitemap lists pages").toBeGreaterThan(0);
  return [...routes, notFoundRoute];
}

/** Loads a page and waits for its fonts, which set every width the checks read. */
async function open(page: Page, route: string) {
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

// Soft, so one run reports every page that fails rather than stopping at the first.
const soft = expect.configure({ soft: true });

// Each page is one step, so a test's time grows with the sitemap rather than hitting the default.
const perPage = 20_000;

test("every page fits its width with no sideways scroll and no visible text under 13 px", async ({ page, request }) => {
  const routes = await pages(request);
  test.setTimeout(routes.length * perPage);
  for (const route of routes) {
    await test.step(route, async () => {
      await open(page, route);
      await soft
        // Below zero is fine: a reserved scrollbar gutter (scrollbar-gutter: stable) leaves the document narrower than the viewport.
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), {
          message: `${route} scrolls sideways (px past the viewport)`,
        })
        .toBeLessThanOrEqual(0);
      // Nothing a visitor reads is smaller than 13 px (docs/design/DESIGN.md, "Type").
      await soft
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
          { message: `${route} has visible text under 13 px` },
        )
        .toEqual([]);
    });
  }
});

/** Every http(s) link on the page, absolute, with its text. Mail links neither leave nor stay. */
const anchors = (page: Page) =>
  page.locator("a[href]").evaluateAll((links) =>
    links
      .map((link) => ({ href: (link as HTMLAnchorElement).href, text: link.textContent ?? "" }))
      .filter(({ href }) => /^https?:/.test(href)),
  );
const isInternal = (href: string, origin: string) => {
  const url = new URL(href);
  return url.origin === origin || siteHosts.has(url.hostname);
};

test("every page has one h1, a skip link to its content, and its content without script", async ({ page, request, browser, baseURL }) => {
  const routes = await pages(request);
  test.setTimeout(routes.length * perPage);
  for (const route of routes) {
    await test.step(route, async () => {
      await open(page, route);
      await soft(page.getByRole("heading", { level: 1 }), `${route}: one h1`).toHaveCount(1);
      const skip = page.locator("a.skip-link");
      await soft(skip, `${route}: the skip link`).toHaveAttribute("href", "#main-content");
      await soft(page.locator("#main-content"), `${route}: the skip link's target`).toHaveCount(1);
    });
  }
  // Without script: the same pages in a context with JavaScript off, so the inline boot script does not run either.
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const plain = await context.newPage();
  for (const route of routes) {
    await test.step(`${route} without script`, async () => {
      await plain.goto(route);
      await soft(plain.getByRole("heading", { level: 1 }), `${route}: the h1 without script`).toBeVisible();
      await soft(plain.locator(`nav[aria-label="${route === "/" ? "On this page" : "Site"}"] a`).first(), `${route}: the header's links without script`).toBeVisible();
      await soft.poll(() => plain.locator("#main-content").evaluate((main) => (main as HTMLElement).innerText.trim().length), { message: `${route}: content without script` }).toBeGreaterThan(200);
    });
  }
  await context.close();
});

/** WCAG 2.2 AA tags held on every public route and open state (F-26). */
const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function axeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  return violations.map(({ id, nodes }) => `${id} (${nodes.length})`);
}

async function waitForHydration(locator: ReturnType<Page["locator"]>) {
  await expect.poll(() => locator.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
}

test.describe("axe on every page and open state", () => {
  // Axe runs at phone and desktop widths in both schemes (F-26).
  test.beforeEach(({}, testInfo) => {
    test.skip(!/^chromium-(390|1440)-/.test(testInfo.project.name), "Read in Chromium at 390 and 1440 px, in both schemes");
  });

  test("every page has no axe violations", async ({ page, request }) => {
    const routes = await pages(request);
    test.setTimeout(routes.length * perPage);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of routes) {
      await test.step(route, async () => {
        await open(page, route);
        soft(await axeViolations(page), `${route}: axe`).toEqual([]);
      });
    }
  });

  test("open states (Menu, lightbox, Argus disclosures and switches) have no axe violations", async ({ page }) => {
    test.setTimeout(perPage * 4);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const isNarrow = (page.viewportSize()?.width ?? 0) < 900;

    await test.step("/: Menu and How I work switch", async () => {
      await open(page, "/");
      const howSwitch = page.locator("#how-i-work [role='switch']");
      await expect(howSwitch).toHaveCount(1);
      await howSwitch.click();
      await expect(howSwitch).toHaveAttribute("aria-checked", "true");

      if (isNarrow) {
        const menu = page.locator("button.menu-button");
        await expect(menu).toBeVisible();
        await waitForHydration(menu);
        await menu.click();
        await expect(menu).toHaveAttribute("aria-expanded", "true");
      }

      soft(await axeViolations(page), "/ (Menu and switch): axe").toEqual([]);

      if (isNarrow) {
        await page.keyboard.press("Escape");
        await expect(page.locator("button.menu-button")).toHaveAttribute("aria-expanded", "false");
      }
    });

    await test.step("/: lightbox", async () => {
      const trigger = page.locator("#off-the-clock [data-otc='training'] .zoom").first();
      await trigger.scrollIntoViewIfNeeded();
      await waitForHydration(trigger);
      await trigger.click();
      const dialog = page.locator("dialog.zoom__dialog[open]");
      await expect(dialog).toBeVisible();
      soft(await axeViolations(page), "/ (lightbox): axe").toEqual([]);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    });

    await test.step("/work/bnp-paribas: flag switch", async () => {
      await open(page, "/work/bnp-paribas");
      const flagSwitch = page.locator("section#decisions [role='switch']");
      await expect(flagSwitch).toHaveCount(1);
      await flagSwitch.click();
      await expect(flagSwitch).toHaveAttribute("aria-checked", "true");
      soft(await axeViolations(page), "/work/bnp-paribas (flag switch): axe").toEqual([]);
    });

    await test.step("/things-i-make/argus-risk: Argus disclosures", async () => {
      await open(page, "/things-i-make/argus-risk");
      const figure = page.locator("section#decisions figure.working-fig");
      await figure.scrollIntoViewIfNeeded();
      await expect(figure.locator(".argus[data-live]")).toHaveCount(1);
      const disclosures = figure.locator("button[aria-expanded]");
      const count = await disclosures.count();
      expect(count, "Argus disclosures").toBeGreaterThan(0);
      for (let index = 0; index < count; index++) {
        const button = disclosures.nth(index);
        await button.click();
        await expect(button).toHaveAttribute("aria-expanded", "true");
      }
      soft(await axeViolations(page), "/things-i-make/argus-risk (Argus disclosures): axe").toEqual([]);
    });
  });
});

test.describe("contrast and focus rings on every page", () => {
  // Rendered contrast reads the page as drawn, which changes with the scheme but not the engine: Chromium at 1440 px, in both schemes.
  test.beforeEach(({}, testInfo) => {
    test.skip(!/^chromium-1440-/.test(testInfo.project.name), "Read once per scheme, in Chromium at 1440 px");
  });

  test("every text pair passes AA on the rendered page", async ({ page, request }) => {
    const routes = await pages(request);
    test.setTimeout(routes.length * perPage * 2);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of routes) {
      await test.step(route, async () => {
        await open(page, route);
        const failing = (await renderedContrast(page)).filter((reading) => reading.median < reading.needs || reading.worst < reading.needs);
        soft(failing.map(({ text, median }) => `${text.slice(0, 40)}: ${median.toFixed(2)}`), `${route}: contrast`).toEqual([]);
      });
    }
  });

  test("every focusable thing on every page shows a ring at least 2 px wide from the keyboard", async ({ page, request }) => {
    const routes = await pages(request);
    test.setTimeout(routes.length * perPage);
    for (const route of routes) {
      await test.step(route, async () => {
        await open(page, route);
        await page.locator("body").focus();
        const missing: string[] = [];
        for (let step = 0; step < 40; step++) {
          await page.keyboard.press("Tab");
          const focused = await page.evaluate(() => {
            const element = document.activeElement as HTMLElement | null;
            if (!element || element === document.body) return null;
            const style = getComputedStyle(element);
            const ring = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2;
            return { name: (element.getAttribute("aria-label") ?? element.textContent ?? element.tagName).trim().slice(0, 40), ring };
          });
          if (!focused) break;
          if (!focused.ring) missing.push(focused.name);
        }
        soft(missing, `${route}: focus rings`).toEqual([]);
      });
    }
  });
});

test.describe("links", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== linkProject, `links do not change with width or scheme; checked on ${linkProject} only`);
  });

  test("every link that leaves the site carries ↗, no internal link does, and every internal one answers 200", async ({ page, request, baseURL }) => {
    const routes = await pages(request);
    test.setTimeout(routes.length * perPage);
    const origin = new URL(baseURL!).origin;
    // Each same-site target once, with the pages that link to it.
    const linkedFrom = new Map<string, Set<string>>();
    for (const route of routes) {
      await test.step(`${route}: ↗ marking`, async () => {
        await open(page, route);
        // The links the check last read, once the page has settled: the targets below come from them.
        let settled: Awaited<ReturnType<typeof anchors>> = [];
        await soft
          .poll(
            async () => {
              settled = await anchors(page);
              return settled.flatMap(({ href, text }) => {
                const internal = isInternal(href, origin);
                const marked = text.includes("↗");
                if (internal && marked) return [`internal link marked ↗: ${text.trim()} → ${href}`];
                if (!internal && !marked) return [`external link without ↗: ${text.trim() || "(no text)"} → ${href}`];
                return [];
              });
            },
            { message: `${route} marks its links wrongly` },
          )
          .toEqual([]);
        for (const { href } of settled) {
          if (!isInternal(href, origin)) continue;
          const url = new URL(href);
          const target = `${url.pathname}${url.search}`;
          // A jump within the page (the skip link, the section nav) is not a page to request; the 404 has one too.
          if (url.hash && target === route) continue;
          linkedFrom.set(target, (linkedFrom.get(target) ?? new Set()).add(route));
        }
      });
    }
    await test.step("same-site links answer 200", async () => {
      expect(linkedFrom.size, "the pages link to each other").toBeGreaterThan(0);
      // Only the moves next.config.ts declares may redirect, and only to where it says.
      const moved = new Map((await nextConfig.redirects!()).map(({ source, destination }) => [source, destination]));
      for (const [target, from] of linkedFrom) {
        const linked = `${target} (linked from ${[...from].join(", ")})`;
        const response = await request.get(target, { maxRedirects: 0 });
        // Followed by path, so an absolute Location never sends the check to the live site.
        const location = response.headers().location && new URL(response.headers().location, origin).pathname;
        const end = location ? await request.get(location, { maxRedirects: 0 }) : response;
        if (location) soft(location, `${linked} redirects only as next.config.ts declares`).toBe(moved.get(new URL(target, origin).pathname));
        soft(end.status(), `${linked} ends at ${end.url()}`).toBe(200);
      }
    });
  });
});
