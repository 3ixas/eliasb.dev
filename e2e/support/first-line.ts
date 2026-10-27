import type { Locator } from "@playwright/test";

/**
 * A point on the first line of a word that wraps, relative to its bounding box: where a person puts the pointer
 * or a thumb. The middle of the whole box can land on other text when the word runs over two lines.
 */
export const onFirstLine = (locator: Locator) =>
  locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const first = element.getClientRects()[0];
    return { x: first.x - box.x + first.width / 2, y: first.y - box.y + first.height / 2 };
  });
