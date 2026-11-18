"use client";

import { lazyIsland } from "@/components/parts/lazy-island";

/** Flowtime's break (#464): the server's drawing until the figure nears the viewport, then the working one. */
export const FlowtimeBreakIsland = lazyIsland(() => import("@/components/site/flowtime-break-live"));
