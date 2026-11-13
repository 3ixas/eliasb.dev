import type { CSSProperties, ReactNode } from "react";
import type { PanelColours } from "@/content/stretch/story";

type PanelProps = {
  /** The subject's field and ink, kept in both themes; without them the panel is paper and follows the theme. */
  colours?: PanelColours;
  /** In the dark theme, a soft glow in the panel's own colour: a project's panel. */
  glow?: boolean;
  /** Rises into view once, when it starts below the fold (R-07). The wrapper decides; this only marks it. */
  as?: "section" | "article" | "header" | "div" | "li";
  className?: string;
  children: ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children" | "style">;

/** The block that holds one subject (DESIGN.md "The panel"; GLOSSARY.md, Panel). Styles are in parts.css. */
export function Panel({ colours, glow = false, as: Tag = "div", className, children, ...rest }: PanelProps) {
  const style = colours ? ({ "--field": colours.field, "--panel-ink": colours.ink } as CSSProperties) : undefined;
  const classes = ["panel", colours ? null : "panel--paper", glow ? "panel--glow" : null, className].filter(Boolean).join(" ");
  return (
    <Tag className={classes} style={style} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * A panel's header: the name at the left and, where there are any, role and dates at the right, one to a line.
 * `level` keeps the heading order of the page it sits on.
 */
export function PanelHead({ name, meta = [], level = 3 }: { name: string; meta?: readonly string[]; level?: 2 | 3 }) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className="panel__head">
      <Heading className="panel__name">{name}</Heading>
      {meta.length > 0 && (
        <p className="panel__meta">
          {meta.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      )}
    </div>
  );
}

/** The arrow beside a control's words, hidden from assistive technology. `out` is the ↗ of a link that leaves the site. */
export function Arrow({ out = false }: { out?: boolean }) {
  return (
    <span className={out ? "arrow arrow--out" : "arrow"} aria-hidden="true">
      {out ? "↗" : "→"}
    </span>
  );
}
