import { expect, test } from "@playwright/test";
import { resumeCopy, resumePdf } from "../src/content/resume";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories";
import { work } from "../src/content/stretch/work";

// The Résumé is an A4 sheet on the desk (GLOSSARY.md). The page is hydrated and laid out after load,
// so every reading polls rather than trusting the first one.
const sheet = (page: import("@playwright/test").Page) => page.locator(".stretch-resume__sheet");

test.describe("The Résumé", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/resume");
  });

  test("is titled through pageTitle and indexed like the other pages", async ({ page }) => {
    await expect(page).toHaveTitle(`${resumeCopy.title} · Elias Bennett`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", resumeCopy.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/resume$/);
  });

  test("lists the Role stories' employers, roles and dates, newest first", async ({ page }) => {
    // Work's rail is the order the site calls newest first, and the Résumé must follow it.
    expect(roleStorySlugs).toEqual(work.rail.map(({ slug }) => slug));
    const entries = page.locator("[data-resume-entry]");
    await expect
      .poll(() =>
        entries.evaluateAll((all) =>
          all.map((entry) => ({
            role: entry.querySelector('[data-resume="role"]')?.textContent,
            employer: entry.querySelector('[data-resume="employer"]')?.textContent,
            dates: entry.querySelector('[data-resume="dates"]')?.textContent,
            story: entry.querySelector("a")?.getAttribute("href"),
          })),
        ),
      )
      .toEqual(
        roleStorySlugs.map((slug) => {
          const { role, employer, dates } = roleStories[slug];
          return { role, employer, dates, story: `/work/${slug}` };
        }),
      );
  });

  test("gives each role the Role story's own Résumé lines", async ({ page }) => {
    for (const [index, slug] of roleStorySlugs.entries()) {
      await expect(page.locator("[data-resume-entry]").nth(index).locator(".stretch-resume__results li")).toHaveText([...roleStories[slug].resume]);
    }
  });

  test("is light paper with no Fastener, in either theme", async ({ page }) => {
    await expect(sheet(page)).toBeVisible();
    await expect
      .poll(() => sheet(page).evaluate((el) => ({ paper: getComputedStyle(el).backgroundColor, ink: getComputedStyle(el).color })))
      .toEqual({ paper: "rgb(255, 255, 255)", ink: "rgb(17, 17, 20)" });
    await expect(sheet(page).locator("[class*='fastener']")).toHaveCount(0);
  });

  test("fits the screen: no sideways scroll, and nothing clipped", async ({ page }) => {
    await expect(sheet(page)).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const clipped = [...document.querySelectorAll(".stretch-resume__sheet *")].filter((element) => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).display !== "inline");
          const sheetBox = document.querySelector(".stretch-resume__sheet")!.getBoundingClientRect();
          return {
            pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            clipped: clipped.map((element) => element.className || element.tagName),
            sheetFits: sheetBox.left >= 0 && sheetBox.right <= document.documentElement.clientWidth,
          };
        }),
      )
      .toEqual({ pageOverflow: false, clipped: [], sheetFits: true });
  });

  test("keeps Download PDF on the desk, off the sheet and out of print", async ({ page }) => {
    const download = page.getByRole("link", { name: resumeCopy.download });
    await expect(download).toHaveAttribute("href", resumePdf.href);
    await expect(download).toHaveAttribute("download", "");
    await expect(sheet(page).getByRole("link", { name: resumeCopy.download })).toHaveCount(0);
    expect((await download.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const response = await page.request.get(resumePdf.href);
    expect(response.headers()["content-type"]).toContain("application/pdf");

    await page.emulateMedia({ media: "print" });
    await expect(download).toBeHidden();
    await expect(page.locator("header.stretch-header")).toBeHidden();
    await expect(page.locator("footer")).toBeHidden();
    await expect(sheet(page)).toBeVisible();
    await expect
      .poll(() => sheet(page).evaluate((el) => ({ paper: getComputedStyle(el).backgroundColor, ink: getComputedStyle(el).color })))
      .toEqual({ paper: "rgb(255, 255, 255)", ink: "rgb(17, 17, 20)" });
  });
});

test("Say hello is the only way in: the header and the hero do not link /resume", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(`header a[href="/resume"], .stretch-hero a[href="/resume"]`)).toHaveCount(0);
});
