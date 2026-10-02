import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const tabs = [
  { name: "Problem", id: "problem" },
  { name: "Decisions", id: "decisions" },
  { name: "How it’s built", id: "how-its-built" },
  { name: "What I’d change", id: "what-id-change" },
];

const files = [
  {
    slug: "threshold",
    name: "Threshold",
    number: "01",
    thesis: "A clearer view of what moving could cost.",
    tape: ["React 19", "TypeScript", "MapLibre"],
    live: "https://threshold-beta.vercel.app",
    code: "https://github.com/3ixas/threshold",
    description: /what a move really costs/,
    image: /\/work\/threshold\/landing\.webp/,
  },
  {
    slug: "argus-risk",
    name: "Argus Risk",
    number: "02",
    thesis: "Every number shows where it came from and how old it is.",
    tape: [".NET 8", "Kafka", "PostgreSQL", "SignalR"],
    code: "https://github.com/3ixas/argus-risk",
    codeNote: "Runs locally with one Docker command.",
    description: /where it came from and how old it is/,
    image: /\/work\/argus\/overview\.webp/,
  },
  {
    slug: "flowtime",
    name: "Flowtime",
    number: "03",
    thesis: "Breaks that match how long you actually focused.",
    tape: ["Next.js", "TypeScript", "Service Worker"],
    live: "https://flowtime-focus-timer.vercel.app",
    code: "https://github.com/3ixas/flowtime-focus-timer",
    description: /sets breaks in proportion to your focus/,
    image: /\/work\/flowtime\/timer\.jpg/,
  },
];

for (const file of files) {
  test.describe(`Case file: ${file.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/work/${file.slug}`);
    });

    test("opens as a stamped folder with the thesis and a clipped screenshot", async ({ page }) => {
      const folder = page.getByRole("article", { name: file.name });
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(file.name);
      await expect(folder.getByText(`Case file Nº ${file.number}`)).toBeVisible();
      await expect(folder.locator("[data-fixing='adhesive'][data-surface='paper']")).toContainText(file.thesis);
      const screenshot = folder.locator("[data-fixing='clip'] img").first();
      await expect(screenshot).toHaveAttribute("alt", /.{20,}/);
      await expect(folder.locator("[data-fixing='clip'] [data-fixing-mark='clip']").first()).toBeVisible();
      await expect(folder.getByRole("list", { name: "Built with" }).getByRole("listitem")).toHaveText(file.tape);
      await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link")).toHaveText(tabs.map(({ name }) => name));
      for (const { id } of tabs) await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
    });

    test("Live and Code are clear buttons to the project", async ({ page }) => {
      const live = page.getByRole("link", { name: "Live site", exact: true });
      const code = page.getByRole("link", { name: "Code", exact: true });
      if (file.live) await expect(live).toHaveAttribute("href", file.live);
      else await expect(live).toHaveCount(0);
      await expect(code).toHaveAttribute("href", file.code);
      for (const link of file.live ? [live, code] : [code]) {
        await expect(link).toBeVisible();
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      if (file.codeNote) await expect(page.getByText(file.codeNote)).toBeVisible();
    });

    test("leads back to the drawer", async ({ page }) => {
      const back = page.getByRole("link", { name: "Back to the drawer" });
      await expect(back).toHaveCount(2);
      await expect(back.first()).toBeInViewport();
      await back.first().click();
      await expect(page).toHaveURL(/\/work$/);
      await expect(page.getByRole("link", { name: `Open the ${file.name} folder` })).toBeVisible();
    });

    test("describes itself for search and sharing", async ({ page }) => {
      await expect(page).toHaveTitle(`${file.name} · Elias B.`);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", file.description);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", file.image);
    });

    test("on phones it is one column with gentle tilts", async ({ page }) => {
      test.skip((page.viewportSize()?.width ?? 1440) >= 900, "Phone layout only");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const sheet = (await page.locator("[data-board-surface='paper']").boundingBox())!;
      for (const pin of await page.locator("main [data-pin]").all()) {
        const angle = await pin.evaluate((element) => Math.abs(parseFloat(getComputedStyle(element).rotate) || 0));
        expect(angle).toBeLessThanOrEqual(1.5);
        const box = (await pin.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(sheet.x);
        expect(box.x + box.width).toBeLessThanOrEqual(sheet.x + sheet.width + 1);
      }
      // The divider tabs sit inside the sheet, not off its edge.
      const nav = (await page.getByRole("navigation", { name: "Sections" }).boundingBox())!;
      expect(nav.x + nav.width).toBeLessThanOrEqual(sheet.x + sheet.width);
    });

    test("passes axe, including contrast, in this colour scheme", async ({ page }) => {
      const results = await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}

// The divider tabs are one template; Threshold stands in for all three.
test.describe("Case-file divider tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work/threshold");
  });

  test("each divider tab jumps to its section", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Sections" });
    // On the folder's edge the labels run sideways, apostrophes and all.
    if ((page.viewportSize()?.width ?? 1440) >= 900) {
      for (const tab of await nav.getByRole("link").all()) await expect(tab).toHaveCSS("text-orientation", "sideways");
    }
    for (const { name, id } of tabs) {
      // Jumps scroll smoothly; let the last one settle so the click lands on the tab.
      await expect.poll(async () => {
        const before = await page.evaluate(() => scrollY);
        await page.waitForTimeout(100);
        return (await page.evaluate(() => scrollY)) === before;
      }).toBe(true);
      const tab = nav.getByRole("link", { name });
      const box = (await tab.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await tab.click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      const section = page.getByRole("region", { name: await page.locator(`#${id} h2`).innerText() });
      await expect(section).toBeInViewport();
      // The heading clears the sticky header.
      const header = (await page.locator("[data-board-header]").boundingBox())!;
      const heading = (await section.getByRole("heading", { level: 2 }).boundingBox())!;
      expect(heading.y).toBeGreaterThanOrEqual(header.y + header.height);
    }
  });

  test("the divider tabs are reachable by keyboard", async ({ page, browserName }) => {
    const nav = page.getByRole("navigation", { name: "Sections" });
    const first = nav.getByRole("link", { name: "Problem" });
    // WebKit only tabs to links when the platform setting is on; focus directly.
    if (browserName === "webkit") await first.focus();
    else {
      await page.getByRole("link", { name: "Code" }).focus();
      await page.keyboard.press("Tab");
    }
    await expect(first).toBeFocused();
    await expect(first).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#problem$/);
  });
});
