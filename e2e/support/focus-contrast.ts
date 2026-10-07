import type { Page } from "@playwright/test";

export type FocusReading = {
  name: string;
  /** Pixels the focus indicator changed. */
  changed: number;
  /** Share of those pixels at 3:1 or more against what was there before. */
  contrasting: number;
};

/** How far outside a control the ring reaches: 2 px offset, 8 px of bands. */
const ringReach = 10;
/** Summed RGB difference below which a pixel counts as unchanged (antialiasing). */
const unchangedBelow = 30;
/** The thinnest band's share of the ring: 2 px of 8. */
export const minimumShare = 0.25;
/** Fewer changed pixels than this and there is no visible indicator. */
export const minimumChanged = 20;

/**
 * WCAG 2.2 non-text contrast for focus indicators, measured from pixels. Tabs
 * through every control on the page; for each it captures the control with
 * its focus indicator and again with the indicator turned off, and compares
 * each pixel the indicator changed in the ring's band just outside the control
 * (so a pin lifting on focus doesn't count) with the pixel it covered. The
 * ring is two-tone (technique C40): dark bands of 2 and 3 px either side of a
 * 3 px accent. A ring passes when at least one band, `minimumShare` of the
 * changed pixels, reaches 3:1.
 *
 * `complete` is true only when focus came back round to a control already
 * measured or left the page, so a long page can't pass by running out of stops.
 */
export async function focusContrast(page: Page, maxStops = 150): Promise<{ readings: FocusReading[]; complete: boolean }> {
  const readings: FocusReading[] = [];
  const viewport = page.viewportSize()!;
  for (let stop = 0; stop < maxStops; stop++) {
    await page.keyboard.press("Tab");
    const name = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body || element.hasAttribute("data-focus-measured")) return null;
      element.setAttribute("data-focus-measured", "");
      element.scrollIntoView({ block: "center" });
      return (element.getAttribute("aria-label") ?? element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 48);
    });
    if (name === null) return { readings, complete: true };
    // Read the box once the control has settled: the skip link slides into view on focus.
    await page.waitForTimeout(120);
    const box = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement;
      const { left, top, width, height } = element.getBoundingClientRect();
      return { focused: element.matches(":focus-visible"), x: left, y: top, w: width, h: height };
    });
    if (!box.focused) throw new Error(`Focus left "${name}" before it could be measured`);
    if (box.w === 0) continue;
    const left = Math.max(0, box.x - 12);
    const top = Math.max(0, box.y - 12);
    const clip = { x: left, y: top, width: Math.min(box.w + 24, viewport.width - left), height: Math.min(box.h + 24, viewport.height - top) };
    if (clip.width < 4 || clip.height < 4) continue;
    const focused = await page.screenshot({ clip });
    const saved = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement;
      const before = { outline: element.style.getPropertyValue("outline"), boxShadow: element.style.getPropertyValue("box-shadow") };
      element.style.setProperty("outline", "none", "important");
      element.style.setProperty("box-shadow", "none", "important");
      return before;
    });
    const plain = await page.screenshot({ clip });
    await page.evaluate(({ outline, boxShadow }) => {
      const element = document.activeElement as HTMLElement;
      element.style.setProperty("outline", outline);
      element.style.setProperty("box-shadow", boxShadow);
    }, saved);
    // The control's box within the clip; the ring is drawn just outside it.
    const control = { left: box.x - left, top: box.y - top, right: box.x - left + box.w, bottom: box.y - top + box.h };
    const reading = await page.evaluate(async ({ focused, plain, control, ringReach, unchangedBelow }) => {
      const pixels = async (png: string) => {
        const image = new Image();
        image.src = `data:image/png;base64,${png}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d", { willReadFrequently: true })!;
        context.drawImage(image, 0, 0);
        return { data: context.getImageData(0, 0, canvas.width, canvas.height).data, width: canvas.width };
      };
      const [{ data: on, width }, { data: off }] = await Promise.all([pixels(focused), pixels(plain)]);
      // Screenshot pixels are CSS pixels times the device pixel ratio.
      const inRing = (index: number) => {
        const x = ((index / 4) % width) / devicePixelRatio;
        const y = Math.floor(index / 4 / width) / devicePixelRatio;
        const outside = Math.max(control.left - x, x - control.right, control.top - y, y - control.bottom);
        return outside > 0 && outside <= ringReach;
      };
      const linear = (channel: number) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (data: Uint8ClampedArray, i: number) => 0.2126 * linear(data[i]) + 0.7152 * linear(data[i + 1]) + 0.0722 * linear(data[i + 2]);
      let changed = 0;
      let contrasting = 0;
      for (let i = 0; i < on.length; i += 4) {
        if (!inRing(i)) continue;
        if (Math.abs(on[i] - off[i]) + Math.abs(on[i + 1] - off[i + 1]) + Math.abs(on[i + 2] - off[i + 2]) <= unchangedBelow) continue;
        changed += 1;
        const a = luminance(on, i);
        const b = luminance(off, i);
        if ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 3) contrasting += 1;
      }
      return { changed, contrasting: changed ? contrasting / changed : 0 };
    }, { focused: focused.toString("base64"), plain: plain.toString("base64"), control, ringReach, unchangedBelow });
    readings.push({ name, ...reading });
  }
  return { readings, complete: false };
}
