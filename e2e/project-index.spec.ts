import { expect, test, type Page } from "@playwright/test";
import { thingsIMake } from "../src/content/stretch/site-copy";

const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 761;
const rows = (page: Page) => page.locator(".stretch-index__row");

test.describe("Work: external rows say they open in a new tab", () => {
  for (const path of ["/things-i-make"]) {
    test(`on ${path}, an external row's name keeps the project and adds where it goes; an internal row's name is unchanged`, async ({ page }) => {
      await page.goto(path);
      await expect(rows(page).first()).toBeVisible();
      const links = rows(page).getByRole("link");
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
      for (let index = 0; index < count; index++) {
        const link = links.nth(index);
        const href = (await link.getAttribute("href"))!;
        const name = (await link.locator(".stretch-index__name").textContent())!;
        if (href.startsWith("http")) {
          const where = new URL(href).hostname === "github.com" ? "GitHub" : new URL(href).hostname.replace(/^www\./, "");
          await expect(link).toHaveAccessibleName(new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}.* opens ${where} in a new tab$`));
        } else {
          await expect(link).not.toHaveAccessibleName(/new tab/);
        }
      }
    });
  }
});

test.describe("Work: Project index with a long catalogue", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/project-index");
  });

  test("stops at ten rows and the archive link shows the true count", async ({ page }) => {
    await expect(rows(page)).toHaveCount(10);
    await expect(page.getByRole("link", { name: thingsIMake.allThings(14) })).toHaveAttribute("href", "/things-i-make");
    await expect(rows(page).first().locator(".stretch-index__number")).toHaveText("01");
    await expect(rows(page).nth(9).locator(".stretch-index__number")).toHaveText("10");
  });

  test("desktop previews follow the hovered or focused row and stay inside the list", async ({ page, browserName }) => {
    test.skip(phone(page), "Phones use inline thumbnails");
    const list = page.locator(".stretch-index__list");
    const tops: number[] = [];
    for (const index of [0, 4, 9]) {
      const row = rows(page).nth(index);
      const link = row.getByRole("link");
      const shot = row.locator(".stretch-index__shot");
      await link.hover();
      await expect(shot).toBeVisible();
      const [rowBox, shotBox, listBox] = await Promise.all([row.boundingBox(), shot.boundingBox(), list.boundingBox()]);
      const relativeTop = shotBox!.y - listBox!.y;
      tops.push(relativeTop);
      expect(relativeTop).toBeGreaterThanOrEqual(0);
      expect(shotBox!.y + shotBox!.height).toBeLessThanOrEqual(listBox!.y + listBox!.height);
      if (index === 0) expect(shotBox!.y - rowBox!.y).toBeCloseTo(20, 0);
      if (index === 4) expect(shotBox!.y + shotBox!.height / 2).toBeCloseTo(rowBox!.y + rowBox!.height / 2, 0);
      if (index === 9) expect(rowBox!.y + rowBox!.height - shotBox!.y - shotBox!.height).toBeCloseTo(20, 0);
      if (browserName === "chromium") {
        await page.mouse.move(0, 0);
        await link.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        await expect(shot).toBeVisible();
        const focusedBox = (await shot.boundingBox())!;
        const focusedList = (await list.boundingBox())!;
        expect(focusedBox.y - focusedList.y).toBeCloseTo(relativeTop, 0);
      }
    }
    expect(tops[0]).toBeLessThan(tops[1]);
    expect(tops[1]).toBeLessThan(tops[2]);
  });

  test("the resting screenshot sits at the top of the right column even when the first rows have none", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 761, "Phones use inline thumbnails");
    // Make a later row the first with a screenshot, as a catalogue whose leading rows lack one would.
    await page.evaluate(() => {
      document.querySelectorAll(".stretch-index__shot[data-resting]").forEach((shot) => shot.removeAttribute("data-resting"));
      const later = document.querySelectorAll(".stretch-index__row")[4].querySelector(".stretch-index__shot");
      later?.setAttribute("data-resting", "");
    });
    const resting = page.locator(".stretch-index__shot[data-resting]");
    await expect(resting).toBeVisible();
    await expect
      .poll(async () => {
        const [list, box] = await Promise.all([page.locator(".stretch-index__list").boundingBox(), resting.boundingBox()]);
        return box!.y - list!.y;
      })
      .toBeLessThan(40);
  });

  test("a row with a screenshot previews it on hover or shows a thumbnail on phones", async ({ page }) => {
    const shot = rows(page).first().locator(".stretch-index__shot");
    if (phone(page)) {
      await expect(shot).toBeVisible();
      const box = await shot.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(100);
    } else {
      await rows(page).nth(1).getByRole("link").hover();
      await expect(shot).toBeHidden();
      await rows(page).first().getByRole("link").hover();
      await expect(shot).toBeVisible();
      const list = await page.locator(".stretch-index__list").boundingBox();
      const box = await shot.boundingBox();
      expect(box!.x).toBeGreaterThan(list!.x + list!.width * 0.55);
    }
  });

  test("desktop shows the first screenshot at rest, hands over to a hovered or focused row and returns", async ({ page, browserName }) => {
    test.skip(phone(page), "Phones use inline thumbnails");
    const resting = page.locator(".stretch-index__shot[data-resting]");
    const other = rows(page).nth(4).locator(".stretch-index__shot");
    await expect(resting).toHaveCount(1);
    await expect(rows(page).first().locator(".stretch-index__shot")).toHaveAttribute("data-resting", "");
    await expect(resting).toBeVisible();
    await rows(page).nth(4).getByRole("link").hover();
    await expect(other).toBeVisible();
    await expect(resting).toBeHidden();
    await page.mouse.move(0, 0);
    await expect(other).toBeHidden();
    await expect(resting).toBeVisible();
    test.skip(browserName !== "chromium", "WebKit does not Tab to links");
    const link = rows(page).nth(4).getByRole("link");
    await link.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(other).toBeVisible();
    await expect(resting).toBeHidden();
  });
});
