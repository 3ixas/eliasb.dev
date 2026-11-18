"use client";

import { lazyIsland } from "@/components/parts/lazy-island";

/** Argus Risk's numbers with their history (#463): the server's drawing until the figure nears the viewport, then the working one. */
export const ArgusProvenanceIsland = lazyIsland(() => import("@/components/site/argus-provenance-live"));
