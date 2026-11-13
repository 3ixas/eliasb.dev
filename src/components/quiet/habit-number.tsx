/**
 * The 404's object for How I work: a number ringed by the pen, drawn in full (quiet-index.css, "the pen"). How I work's own
 * cards no longer use it; it goes with the 404's rows in #419.
 */
export function HabitNumber({ position }: { position: number }) {
  return (
    <span className="qi-number">
      {String(position + 1).padStart(2, "0")}
      <svg className="qi-ink qi-ink--circle" viewBox="0 0 100 100" aria-hidden="true">
        <path pathLength={1} d="M52 6 C 20 4, 4 30, 8 56 C 12 84, 44 98, 70 90 C 94 82, 98 50, 90 30 C 82 12, 60 2, 40 8" />
      </svg>
    </span>
  );
}
