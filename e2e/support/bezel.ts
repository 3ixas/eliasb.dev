import { expect, type Locator } from "@playwright/test";

export type BezelReading = {
  inside: boolean;
  renderedRatio: number;
  naturalRatio: number;
  panelRadius: number;
  bezelRadius: number;
  imgRadius: number;
  bezelBorderWidth: number;
  fieldLuminance: number;
  matLuminance: number;
  borderLuminance: number;
};

/**
 * Waits for a project panel's screenshot to finish loading and measures its concentric optical bezel geometry and
 * composited luminance separation against the panel field (DESIGN.md "The panel", R-46, R-47).
 */
export async function readOpticalBezel(panel: Locator, bezelSelector = ".project__shot"): Promise<BezelReading> {
  const img = panel.locator(`${bezelSelector} img`);
  await img.scrollIntoViewIfNeeded();
  await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);

  return panel.evaluate((el, selector) => {
    const panelBox = el.getBoundingClientRect();
    const bezelEl = el.querySelector<HTMLElement>(selector)!;
    const imgEl = bezelEl.querySelector<HTMLImageElement>("img")!;
    const bezelBox = bezelEl.getBoundingClientRect();
    const imgBox = imgEl.getBoundingClientRect();
    const panelStyle = getComputedStyle(el);
    const bezelStyle = getComputedStyle(bezelEl);
    const imgStyle = getComputedStyle(imgEl);

    const canvas = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const compositeLuminance = (...layers: string[]) => {
      canvas.clearRect(0, 0, 1, 1);
      for (const colour of layers) {
        canvas.fillStyle = colour;
        canvas.fillRect(0, 0, 1, 1);
      }
      const [r, g, b] = canvas.getImageData(0, 0, 1, 1).data;
      const [x, y, z] = [r, g, b].map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * x + 0.7152 * y + 0.0722 * z;
    };

    const field = panelStyle.backgroundColor;
    const mat = bezelStyle.backgroundColor;
    const border = bezelStyle.borderTopColor;

    return {
      inside:
        bezelBox.left >= panelBox.left - 0.5 &&
        bezelBox.right <= panelBox.right + 0.5 &&
        bezelBox.top >= panelBox.top - 0.5 &&
        bezelBox.bottom <= panelBox.bottom + 0.5,
      renderedRatio: imgBox.width / imgBox.height,
      naturalRatio: imgEl.naturalWidth / imgEl.naturalHeight,
      panelRadius: parseFloat(panelStyle.borderTopLeftRadius),
      bezelRadius: parseFloat(bezelStyle.borderTopLeftRadius),
      imgRadius: parseFloat(imgStyle.borderTopLeftRadius),
      bezelBorderWidth: parseFloat(bezelStyle.borderTopWidth),
      fieldLuminance: compositeLuminance(field),
      matLuminance: compositeLuminance(field, mat),
      borderLuminance: compositeLuminance(field, mat, border),
    };
  }, bezelSelector);
}

/** Asserts whole uncropped framing, concentric radii (`28/22 -> 16 -> 10`), and measurable optical separation from the field. */
export function expectOpticalBezel(reading: BezelReading, label: string, phone: boolean) {
  expect(reading.inside, `${label} bezel stays inside panel`).toBe(true);
  expect(Math.abs(reading.renderedRatio - reading.naturalRatio), `${label} screenshot is uncropped`).toBeLessThan(0.03);
  expect(reading.panelRadius, `${label} outer panel radius`).toBe(phone ? 22 : 28);
  expect(reading.bezelRadius, `${label} bezel radius`).toBe(16);
  expect(reading.imgRadius, `${label} image radius`).toBe(10);
  expect(reading.bezelBorderWidth, `${label} bezel hairline`).toBe(1);
  // Measurable optical separation: both the inset mat and the 1 px hairline border must shift luminance from the panel field.
  expect(Math.abs(reading.matLuminance - reading.fieldLuminance), `${label} mat separates from field`).toBeGreaterThan(0.006);
  expect(Math.abs(reading.borderLuminance - reading.fieldLuminance), `${label} hairline separates from field`).toBeGreaterThan(0.015);
}

/**
 * Panels set beside each other (#541): every bezel has one 8:5 shape with its screenshot inside it, and the bezels in a
 * row of `across` panels start and end level.
 */
export async function expectLevelBezels(panels: Locator, across: number) {
  await expect
    .poll(() =>
      panels.evaluateAll((all, perRow) => {
        const bezels = all.map((panel) => {
          const bezel = panel.querySelector(".project__shot")!.getBoundingClientRect();
          const image = panel.querySelector(".project__shot > img")!.getBoundingClientRect();
          const inside = image.left >= bezel.left && image.right <= bezel.right && image.top >= bezel.top && image.bottom <= bezel.bottom;
          return { top: bezel.top, bottom: bezel.bottom, shape: bezel.width / bezel.height, inside: inside && image.width > 0 };
        });
        return bezels.flatMap((bezel, index) => {
          const first = bezels[index - (index % perRow)];
          return [
            Math.abs(bezel.shape - 1.6) > 0.02 && `bezel ${index} is ${bezel.shape.toFixed(2)}:1`,
            !bezel.inside && `screenshot ${index} leaves its bezel`,
            Math.abs(bezel.top - first.top) > 0.5 && `bezel ${index} starts ${bezel.top - first.top} px off its row`,
            Math.abs(bezel.bottom - first.bottom) > 0.5 && `bezel ${index} ends ${bezel.bottom - first.bottom} px off its row`,
          ].filter(Boolean);
        });
      }, across),
    )
    .toEqual([]);
}
