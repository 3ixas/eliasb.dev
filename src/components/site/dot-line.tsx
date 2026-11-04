import type { ReactNode } from "react";

/**
 * A line of parts with a dot between them. A part stays whole where it fits, so a date range never breaks in half,
 * and the line wraps between parts. Each dot leads its part, in a gutter the line clips at its left edge, so a part
 * that starts a new line loses its dot and no line ever ends or starts on one (quiet-index.css, `.qi-dots`).
 */
export function DotLine({ parts }: { parts: readonly ReactNode[] }) {
  const shown = parts.filter(Boolean);
  if (shown.length < 2) return shown[0];
  return (
    <span className="qi-dots">
      <span className="qi-dots__in">
        {shown.map((part, index) => (
          <span key={index} className="qi-dots__part">
            {index > 0 && <span className="qi-dots__dot">{"\u00a0· "}</span>}
            {part}
          </span>
        ))}
      </span>
    </span>
  );
}
