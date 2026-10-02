import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const projects = ["Threshold", "Argus Risk", "Flowtime"];

test.describe("Work", () => {
  test.beforeEach(async ({ page }) => {
    // Land on the section, so the opening stays still.
    await page.goto("/#work");
  });

  test("comes straight after the hero", async ({ page }) => {
    const sections = await page.locator("#main-content > section").evaluateAll((all) => all.slice(0, 2).map((section) => section.id || section.getAttribute("aria-labelledby")));
    expect(sections).toEqual(["hero-title", "work"]);
  });

  test("each project is a clipped screenshot with a sticky note and label tape", async ({ page }) => {
    const items = page.locator("#work li[data-light='above']");
    await expect(items).toHaveCount(projects.length);
    for (const [index, name] of projects.entries()) {
      const item = items.nth(index);
      await expect(item.getByRole("heading", { level: 3 })).toHaveText(name);
      const screenshot = item.locator("[data-board-surface='clipboard'] img");
      await expect(screenshot).toHaveAttribute("alt", /.{20,}/);
      await expect(item.getByRole("link", { name: `Open the ${name} folder` })).toBeVisible();
      await expect(item.locator("[data-fixing='adhesive']")).toHaveCount(1);
      const tape = item.getByRole("list", { name: "Built with" }).getByRole("listitem");
      expect(await tape.count()).toBeGreaterThanOrEqual(3);
    }
  });

  test("decorative lights are hidden from assistive technology", async ({ page }) => {
    const lights = page.locator("#work [data-light-fixture='picture-light']");
    await expect(lights).toHaveCount(projects.length);
    for (const light of await lights.all()) await expect(light).toHaveAttribute("aria-hidden", "true");
  });

  test("at night each picture light covers the screenshot and the note", async ({ page }) => {
    if ((await page.evaluate(() => document.documentElement.dataset.lights)) !== "on") await page.locator("[data-light-switch]").click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.lights === "on" && !("themeChanging" in document.documentElement.dataset))).toBe(true);
    for (const item of await page.locator("#work li[data-light='above']").all()) {
      const boxes = await item.evaluate((element) => {
        const beam = element.querySelector("[data-light-fixture] > div:nth-child(2)")!;
        const rect = (node: Element) => node.getBoundingClientRect();
        return {
          beamOpacity: Number(getComputedStyle(beam).opacity),
          beam: rect(beam),
          screenshot: rect(element.querySelector("[data-board-surface='clipboard']")!),
          note: rect(element.querySelector("[data-fixing='adhesive']")!),
          noteLight: (() => {
            const light = getComputedStyle(element.querySelector("[data-fixing='adhesive']")!, "::before");
            return { opacity: Number(light.opacity), image: light.backgroundImage, zIndex: light.zIndex };
          })(),
        };
      });
      expect(boxes.beamOpacity).toBe(1);
      // The note catches the light on its paper, behind its text.
      expect(boxes.noteLight.opacity).toBe(1);
      expect(boxes.noteLight.image).toMatch(/gradient/);
      expect(boxes.noteLight.zIndex).toBe("-1");
      for (const target of [boxes.screenshot, boxes.note]) {
        expect(boxes.beam.top).toBeLessThanOrEqual(target.top);
        expect(boxes.beam.bottom).toBeGreaterThanOrEqual(target.bottom);
      }
    }
  });

  test("passes axe, including contrast, in this colour scheme", async ({ page }) => {
    const results = await new AxeBuilder({ page }).include("#work").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("a note lifts and straightens on keyboard focus", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const note = page.locator("#work [data-fixing='adhesive']").first();
    const before = await note.evaluate((element) => getComputedStyle(element).rotate);
    await note.getByRole("link", { name: "Open the folder", exact: true }).focus();
    await expect(note).toHaveCSS("translate", "0px -4px");
    const after = await note.evaluate((element) => getComputedStyle(element).rotate);
    expect(Math.abs(parseFloat(after))).toBeLessThan(Math.abs(parseFloat(before)));
    await expect(note.getByRole("link", { name: "Open the folder", exact: true })).toHaveCSS("outline-style", "solid");
  });

  test("focus outlines on the notes stand out from the paper (3:1)", async ({ page }) => {
    for (const note of await page.locator("#work [data-fixing='adhesive']").all()) {
      const link = note.getByRole("link", { name: "Open the folder", exact: true });
      await link.focus();
      const ratio = await link.evaluate((element) => {
        const parse = (colour: string) => colour.match(/[\d.]+/g)!.slice(0, 3).map(Number);
        const luminance = (rgb: number[]) => {
          const [r, g, b] = rgb.map((channel) => {
            const c = channel / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const outline = luminance(parse(getComputedStyle(element).outlineColor));
        const paper = luminance(parse(getComputedStyle(element.closest("[data-pin]")!).backgroundColor));
        return (Math.max(outline, paper) + 0.05) / (Math.min(outline, paper) + 0.05);
      });
      expect(ratio).toBeGreaterThanOrEqual(3);
    }
  });

  test("on phones it is one column with gentle tilts and no overlap", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1440) >= 900, "Phone layout only");
    for (const item of await page.locator("#work li[data-light='above']").all()) {
      const layout = await item.evaluate((element) => {
        const clipboard = element.querySelector("[data-board-surface='clipboard']")!;
        const note = element.querySelector("[data-fixing='adhesive']")!;
        const tilt = (node: Element) => Math.abs(parseFloat(getComputedStyle(node).rotate) || 0);
        return { clipboardBottom: clipboard.getBoundingClientRect().bottom, noteTop: note.getBoundingClientRect().top, tilts: [tilt(clipboard), tilt(note)] };
      });
      expect(layout.noteTop).toBeGreaterThanOrEqual(layout.clipboardBottom);
      for (const angle of layout.tilts) expect(angle).toBeLessThanOrEqual(1.5);
    }
  });
});
