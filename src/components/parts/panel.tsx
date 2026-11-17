import type { CSSProperties, ReactNode } from "react";
import { luminance, type PanelColours } from "@/content/stretch/story";

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

/**
 * A panel's surface, for every element that draws one (Panel, ProjectPanel, NextPanel): its classes and its colours.
 * Without colours it is paper and follows the theme. A field whose ink is darker than it is bright: parts.css never
 * deepens its foot and gives it the stronger dark rim. `glow` is a project's glow in its own colour in the dark theme.
 */
export function panelSurface(colours: PanelColours | undefined, { glow = false }: { glow?: boolean } = {}) {
  const style = colours ? ({ "--field": colours.field, "--panel-ink": colours.ink } as CSSProperties) : undefined;
  const kind = colours ? (luminance(colours.ink) < luminance(colours.field) ? "panel--dark-ink" : null) : "panel--paper";
  return { className: ["panel", kind, glow ? "panel--glow" : null].filter(Boolean).join(" "), style };
}

/** The block that holds one subject (DESIGN.md "The panel"; GLOSSARY.md, Panel). Styles are in parts.css. */
export function Panel({ colours, glow = false, as: Tag = "div", className, children, ...rest }: PanelProps) {
  const surface = panelSurface(colours, { glow });
  return (
    <Tag className={className ? `${surface.className} ${className}` : surface.className} style={surface.style} {...rest}>
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

/** ↗ with the text-presentation selector: iOS draws a bare ↗ as a colour emoji when the page's font lacks it. */
export const OUT = "\u2197\uFE0E";

/** The arrow beside a control's words, hidden from assistive technology. `out` is the ↗ of a link that leaves the site. */
export function Arrow({ out = false }: { out?: boolean }) {
  return (
    <span className={out ? "arrow arrow--out" : "arrow"} aria-hidden="true">
      {out ? OUT : "→"}
    </span>
  );
}
