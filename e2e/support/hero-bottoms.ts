import type { Page } from "@playwright/test";

/**
 * Where the tilted portrait is painted to and where the text column ends, as
 * page-y coordinates. The portrait's bottom is its bounding box (its lowest
 * painted corner, tilt included); the column ends where the actions, the last
 * thing in the lede, end. Read it with expect.poll: the layout moves while the
 * font loads.
 */
export const heroBottoms = (page: Page) =>
  page.evaluate(() => {
    const bottom = (element: Element) => element.getBoundingClientRect().bottom + scrollY;
    const lede = document.querySelector(".stretch-hero__lede")!;
    const last = lede.lastElementChild!;
    if (!last.matches(".stretch-hero__actions")) throw new Error("The actions are no longer the last thing in the lede");
    return { portrait: bottom(document.querySelector(".stretch-portrait")!), column: bottom(last) };
  });
