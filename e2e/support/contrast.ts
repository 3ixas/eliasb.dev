import type { Page } from "@playwright/test";

/**
 * WCAG contrast between each visible element's text and the first opaque
 * surface behind it, such as a pin's paper.
 */
export const contrastOnPaper = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((elements) => {
    const parse = (colour: string) => colour.match(/[\d.]+/g)!.slice(0, 4).map(Number);
    const luminance = ([r, g, b]: number[]) => {
      const [lr, lg, lb] = [r, g, b].map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
    };
    const paperBehind = (element: Element) => {
      for (let node: Element | null = element; node; node = node.parentElement) {
        const background = getComputedStyle(node).backgroundColor;
        const [r, g, b, a = 1] = parse(background);
        if (background !== "rgba(0, 0, 0, 0)" && a === 1) return [r, g, b];
      }
      return [255, 255, 255];
    };
    return elements
      .filter((element) => element.checkVisibility() && element.textContent?.trim())
      .map((element) => {
        const text = luminance(parse(getComputedStyle(element).color));
        const paper = luminance(paperBehind(element));
        return { text: element.textContent, ratio: (Math.max(text, paper) + 0.05) / (Math.min(text, paper) + 0.05) };
      });
  });
