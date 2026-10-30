/*
 * Where the Margin sits (docs/design/DESIGN.md, "The margin"): 40 px right of the column, 300 px wide, level
 * with the row's top minus 6 px, and always inside the window. It is a pure function of the row, the column,
 * the margin's own height and the viewport, so the browser seam (e2e/work.spec.ts) is the only thing that
 * needs a page to check it.
 */
/** The margin's 300 px width is in quiet-index.css (`.qi-margin`), where the layout needs it; only what placement computes lives here. */
export const margin = { gap: 40, inset: 16, rowLift: 6 } as const;

/** The margin is for wide screens with a hovering pointer; below that, or on touch, a closer look opens inline instead. */
export const WIDE = "(min-width: 1180px) and (hover: hover)";

export type MarginPlacement = { top: number; left: number };

export function placeMargin({
  row,
  column,
  marginHeight,
  viewportHeight,
}: {
  row: { top: number };
  column: { right: number };
  marginHeight: number;
  viewportHeight: number;
}): MarginPlacement {
  // Rise until the margin sits `inset` above the bottom edge, but never above `inset` from the top: a margin taller than the window keeps its top.
  const lowest = viewportHeight - margin.inset - marginHeight;
  return { top: Math.max(margin.inset, Math.min(row.top - margin.rowLift, lowest)), left: column.right + margin.gap };
}
