import type { Locator } from "@playwright/test";

/**
 * What a figure shows (`Count`, #456): each rolling digit read from where its strip stands in its window, the other
 * characters as written, and nothing that is unseen. A figure that does not roll is its text.
 */
export const shown = (figure: Locator) =>
  figure.evaluate((element) => {
    const face = element.querySelector(".roll__face");
    if (!face) return element.textContent ?? "";
    return [...face.children]
      .filter((glyph) => getComputedStyle(glyph).opacity !== "0")
      .map((glyph) => {
        const strip = glyph.querySelector(".roll__strip");
        if (!strip) return glyph.textContent;
        const window = glyph.getBoundingClientRect();
        const top = window.top + parseFloat(getComputedStyle(glyph).paddingTop);
        // The digit whose box sits nearest the window's top is the one in view.
        const digits = [...strip.children];
        const nearest = digits.reduce((best, digit) => (Math.abs(digit.getBoundingClientRect().top - top) < Math.abs(best.getBoundingClientRect().top - top) ? digit : best));
        return nearest.textContent;
      })
      .join("");
  });

/** Each element's text as a screen reader is given it: a rolling figure's value, without the digit columns it is drawn with. */
export const spoken = (elements: Locator) =>
  elements.evaluateAll((nodes) =>
    nodes.map((node) => {
      const copy = node.cloneNode(true) as Element;
      copy.querySelectorAll("[aria-hidden='true']").forEach((hidden) => hidden.remove());
      return (copy.textContent ?? "").replace(/\s+/g, " ").trim();
    }),
  );
