import { expect, test } from "@playwright/test";
import { resumeCopy, resumePdf, resumeSheet, resumeText } from "../src/content/resume";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories";
import { siteCopy } from "../src/content/stretch/site-copy";
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
    // Work's rows are the order the site calls newest first, and the Résumé must follow it.
    expect(roleStorySlugs).toEqual(work.employers.map(({ slug }) => slug));
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

  test("shows exactly the text the PDF check expects, in that order", async ({ page }) => {
    // verify:resume holds the PDF to resumeText(); this holds the rendered sheet to it, so the page and the PDF share one source.
    // CSS capitals, the comma after a role and the screen-only ↗ on links that leave the site are decoration, so case, commas and
    // arrows are ignored; whitespace follows the layout.
    const plain = (text: string) => text.toLowerCase().replace(/[\s,↗]+/g, "");
    await expect.poll(() => sheet(page).evaluate((el) => (el as HTMLElement).innerText).then(plain)).toBe(plain(resumeText(resumeSheet()).join(" ")));
  });

  test("prints on one A4 page, with room to spare", async ({ page }) => {
    // The page is 210 mm with 8 mm top and bottom and 14 mm at the sides, so the sheet prints 182 mm wide and may be 281 mm tall.
    const mm = (n: number) => (n / 25.4) * 96;
    await page.setViewportSize({ width: Math.round(mm(182)), height: 1123 });
    await page.emulateMedia({ media: "print" });
    // 20 px (about one line) of headroom, so rewording a line does not tip the sheet onto a second page.
    await expect.poll(() => sheet(page).evaluate((el) => el.getBoundingClientRect().height)).toBeLessThanOrEqual(mm(281) - 20);
  });

  test("gives each role the Role story's own Résumé lines", async ({ page }) => {
    for (const [index, slug] of roleStorySlugs.entries()) {
      await expect(page.locator("[data-resume-entry]").nth(index).locator(".stretch-resume__results li")).toHaveText([...roleStories[slug].resume]);
    }
  });

  test("is light paper, in either theme", async ({ page }) => {
    await expect(sheet(page)).toBeVisible();
    await expect
      .poll(() => sheet(page).evaluate((el) => ({ paper: getComputedStyle(el).backgroundColor, ink: getComputedStyle(el).color })))
      .toEqual({ paper: "rgb(255, 255, 255)", ink: "rgb(17, 17, 20)" });
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

  test("takes the shared header with the way home and no section links, and Download PDF sits above the sheet", async ({ page }) => {
    await expect(page.locator("header.qi-header")).toBeVisible();
    await expect(page.getByRole("link", { name: "Elias Bennett, home" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("navigation", { name: siteCopy.header.linksLabel })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(sheet(page)).toBeVisible();
    const [download, paper] = await Promise.all([page.getByRole("link", { name: resumeCopy.download }).boundingBox(), sheet(page).boundingBox()]);
    expect(download!.y + download!.height).toBeLessThanOrEqual(paper!.y);
  });

  test("the header lines up with the sheet: its row has the paper's left and right edges", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 900, "Below 900 px the header is the narrow column, not the sheet's width");
    await expect(sheet(page)).toBeVisible();
    const edges = () =>
      page.evaluate(() => {
        const paper = document.querySelector(".stretch-resume__sheet")!.getBoundingClientRect();
        const row = document.querySelector(".qi-header__inner")!.getBoundingClientRect();
        return { left: Math.abs(row.left - paper.left), right: Math.abs(row.right - paper.right) };
      });
    await expect.poll(async () => (await edges()).left).toBeLessThanOrEqual(1);
    await expect.poll(async () => (await edges()).right).toBeLessThanOrEqual(1);
  });

  test("is complete without script: the header, its skip link, Download PDF and the sheet are in the server HTML", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(page.locator("header.qi-header")).toBeVisible();
    await expect(page.getByRole("link", { name: "Skip to content" })).toHaveCount(1);
    await expect(page.getByRole("link", { name: resumeCopy.download })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: resumeSheet().name })).toBeVisible();
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
    await expect(page.locator("header.qi-header")).toBeHidden();
    await expect(page.locator("footer")).toBeHidden();
    // The room below the content is for the screen: paper has none to leave, so it must not push a blank page.
    await expect(page.locator("[data-resume] main")).toHaveCSS("padding-bottom", "0px");
    await expect(sheet(page)).toBeVisible();
    await expect
      .poll(() => sheet(page).evaluate((el) => ({ paper: getComputedStyle(el).backgroundColor, ink: getComputedStyle(el).color })))
      .toEqual({ paper: "rgb(255, 255, 255)", ink: "rgb(17, 17, 20)" });
  });
});

test("Say hello is the only way in: the header and the opening do not link /resume", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(`header a[href="/resume"], .qi-opening a[href="/resume"]`)).toHaveCount(0);
});
