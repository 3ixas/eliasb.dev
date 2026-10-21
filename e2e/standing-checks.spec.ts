import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import nextConfig from "../next.config";

// The mechanical half of Rauno's portfolio checklist, held on every page (#249, #264). Pages come
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
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), {
          message: `${route} scrolls sideways (px past the viewport)`,
        })
        .toBe(0);
      // Nothing a visitor reads is smaller than 13 px (docs/design/STRETCH.md, "Type").
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
