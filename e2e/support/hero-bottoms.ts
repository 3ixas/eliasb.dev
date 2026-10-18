import type { Page } from "@playwright/test";

/**
 * Where the portrait's layout box and the text column (the lede, which ends with
 * the actions) end, measured without the portrait's tilt so that "meets the
 * bottom" means the grid placed them together. Read it with expect.poll: the
 * layout moves while the font loads and the entrance settles.
 */
export const heroBottoms = (page: Page) =>
  page.evaluate(() => {
    const bottom = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector)!;
      return element.offsetTop + element.offsetHeight;
    };
    return { portrait: bottom(".stretch-portrait"), column: bottom(".stretch-hero__lede") };
  });
