"use client";

import { lazyIsland } from "@/components/parts/lazy-island";

/** Threshold's link figure (#462): the server's drawing until the figure nears the viewport, then the working one. */
export const ThresholdLinkIsland = lazyIsland(() => import("@/components/site/threshold-link-live"));
