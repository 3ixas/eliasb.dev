export type Point = { x: number; y: number };

/** How far short of the next pin each stretch of string stops, so its arrowhead shows. */
export const ARROW_GAP = 14;

/**
 * The red string through the stops, one stretch per pair of pins. Each runs
 * from a pin to just short of the next, where its arrowhead points at it, and
 * bows out sideways, alternating sides. Measured from where the pins really
 * are, so it follows the stops at any width; it runs behind the objects
 * (journey.tsx), so it never crosses their words.
 */
export function stringStretches(points: Point[]) {
  return points.slice(1).map((to, index) => {
    const from = points[index];
    const bow = Math.max(24, Math.abs(to.y - from.y) * 0.35) * (index % 2 ? -1 : 1);
    const control = { x: (from.x + to.x) / 2 + bow, y: (from.y + to.y) / 2 };
    // Stop short along the curve's last direction, from the control point to the pin.
    const dx = to.x - control.x;
    const dy = to.y - control.y;
    const length = Math.hypot(dx, dy) || 1;
    const end = { x: to.x - (dx / length) * ARROW_GAP, y: to.y - (dy / length) * ARROW_GAP };
    const at = ({ x, y }: Point) => `${x.toFixed(1)} ${y.toFixed(1)}`;
    return `M ${at(from)} Q ${at(control)} ${at(end)}`;
  });
}
