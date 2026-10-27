import type { Locator, Page } from "@playwright/test";

const lastTap = new WeakMap<Page, number>();

/** WebKit folds a second click inside its double-click interval into the first; a person's next tap comes later, so taps are spaced like theirs. */
export const tap = async (page: Page, target: Locator, options?: Parameters<Locator["click"]>[0]) => {
  const wait = 600 - (Date.now() - (lastTap.get(page) ?? 0));
  if (wait > 0) await page.waitForTimeout(wait);
  await target.click(options);
  lastTap.set(page, Date.now());
};
