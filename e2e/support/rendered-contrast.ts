import type { Page } from "@playwright/test";

export type ContrastReading = {
  text: string;
  color: string;
  background: string;
  /** Against the median background pixel. */
  median: number;
  /** Against the 10th or 90th percentile background pixel, whichever is worse. */
  worst: number;
  /** 3 for large text, 4.5 otherwise (WCAG 2.2 AA). */
  needs: number;
  /**
   * The text sits under a blend mode, so its colour on screen depends on the
   * backdrop and the reading can't be trusted.
   */
  blended: boolean;
};

/**
 * WCAG contrast measured from rendered pixels. Axe can't judge text over the
 * plaster grain (a ::before), the linen weave, or the night Board's
 * multiply-blended dim, and reports it as incomplete. This finds every
 * visible text run, renders the page with all text transparent, and compares
 * each run's colour with the pixels actually behind it, so overlays below the
 * text (the night dim included) are measured as drawn. Its ancestors' CSS
 * filters are applied to its colour; a blend mode can't be, so a run under one
 * is marked `blended`.
 *
 * It samples the middle of each run's box, so a rotated stamp's own border
 * stays out of the background. Text hidden from assistive technology, or
 * visually hidden for it, is skipped.
 */
export async function renderedContrast(page: Page): Promise<ContrastReading[]> {
  // A full-page capture is now and then not a faithful picture of the layout it
  // was measured against (a few runs in a hundred, always the content far below
  // the top), which reads as a contrast failure. A real failure shows on every
  // attempt, so a failing reading is measured again before it is believed.
  let readings = await measureOnce(page);
  for (let retry = 0; retry < 3 && readings.some((reading) => reading.median < reading.needs || reading.worst < reading.needs); retry++) {
    readings = await measureOnce(page);
  }
  return readings;
}

async function measureOnce(page: Page): Promise<ContrastReading[]> {
  // Let lazy images and in-view objects settle before measuring.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    scrollTo(0, 0);
    // A web font that swaps in after the boxes are measured moves them off the
    // pixels they are compared with.
    await document.fonts.ready;
  });
  await page.waitForTimeout(600);

  const runs = await page.evaluate(() => {
    // Any CSS colour (rgb(), color(srgb …), color-mix() results) to 0–255 RGBA,
    // through the ancestors' filters, innermost first, as the browser draws it.
    const swatch = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      return canvas.getContext("2d", { willReadFrequently: true })!;
    };
    const rgba = (colour: string, filters: string[]) => {
      let current = swatch();
      current.fillStyle = colour;
      current.fillRect(0, 0, 1, 1);
      for (const filter of filters) {
        const next = swatch();
        next.filter = filter;
        next.drawImage(current.canvas, 0, 0);
        current = next;
      }
      const [r, g, b, a] = current.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };

    const found: { text: string; color: string; rgba: number[]; opacity: number; blended: boolean; large: boolean; x: number; y: number; w: number; h: number }[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const element = node.parentElement;
      if (!node.textContent?.trim() || !element) continue;
      if (element.closest("[aria-hidden='true'], .sr-only, script, style, noscript, [hidden]")) continue;
      if (!element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const box = range.getBoundingClientRect();
      if (box.width < 4 || box.height < 4 || box.bottom + scrollY <= 0) continue;
      const style = getComputedStyle(element);
      const size = parseFloat(style.fontSize);
      let opacity = 1;
      let blended = false;
      const filters: string[] = [];
      for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
        const own = getComputedStyle(ancestor);
        opacity *= Number(own.opacity);
        if (own.filter !== "none") filters.push(own.filter);
        if (own.mixBlendMode !== "normal") blended = true;
      }
      found.push({
        text: node.textContent.trim().slice(0, 60),
        color: style.color,
        rgba: rgba(style.color, filters),
        opacity,
        blended,
        large: size >= 24 || (Number(style.fontWeight) >= 700 && size >= 18.66),
        x: box.left + scrollX + box.width * 0.2,
        y: box.top + scrollY + box.height * 0.25,
        w: box.width * 0.6,
        h: box.height * 0.5,
      });
    }
    return found;
  });

  const hidden = await page.addStyleTag({
    content: "*, *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; text-decoration-color: transparent !important; }",
  });
  await page.waitForTimeout(200);
  const screenshot = await page.screenshot({ fullPage: true });
  await hidden.evaluate((tag) => (tag as HTMLStyleElement).remove());

  return page.evaluate(async ({ png, runs }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d", { willReadFrequently: true })!;
    context.drawImage(image, 0, 0);
    // The screenshot is in device pixels; the boxes are in CSS pixels.
    const scale = devicePixelRatio;

    const linear = (channel: number) => {
      const c = channel / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const luminance = ([r, g, b]: number[]) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

    return runs.flatMap((run) => {
      const left = Math.max(0, Math.round(run.x * scale));
      const top = Math.max(0, Math.round(run.y * scale));
      const right = Math.min(canvas.width, Math.round((run.x + run.w) * scale));
      const bottom = Math.min(canvas.height, Math.round((run.y + run.h) * scale));
      if (right - left < 1 || bottom - top < 1) return [];
      const data = context.getImageData(left, top, right - left, bottom - top).data;
      const pixels: number[][] = [];
      for (let i = 0; i < data.length; i += 4) pixels.push([data[i], data[i + 1], data[i + 2]]);
      pixels.sort((p, q) => luminance(p) - luminance(q));
      const [r, g, b, a] = run.rgba;
      const alpha = a * run.opacity;
      const against = (quantile: number) => {
        const background = pixels[Math.min(pixels.length - 1, Math.floor(pixels.length * quantile))];
        const text = [r, g, b].map((channel, i) => channel * alpha + background[i] * (1 - alpha));
        return ratio(luminance(text), luminance(background));
      };
      const median = pixels[Math.floor(pixels.length / 2)];
      return [{
        text: run.text,
        color: run.color,
        background: `rgb(${median.join(", ")})`,
        median: Number(against(0.5).toFixed(2)),
        worst: Number(Math.min(against(0.1), against(0.9)).toFixed(2)),
        needs: run.large ? 3 : 4.5,
        blended: run.blended,
      }];
    });
  }, { png: screenshot.toString("base64"), runs });
}
