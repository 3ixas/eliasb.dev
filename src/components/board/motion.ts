/**
 * Shared Motion timings. Durations mirror the CSS tokens in board.css
 * (--duration-quick 120 ms, --duration-ui 200 ms, --duration-settle 320 ms).
 */
export const duration = { quick: 0.12, ui: 0.2, settle: 0.32 } as const;

export const springs = {
  /** The nav pin hopping between links. */
  navPin: { type: "spring", bounce: 0.3, visualDuration: duration.settle },
} as const;
