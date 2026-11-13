import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Arrow } from "@/components/parts/panel";
import { Arrowed } from "@/components/site/long-form";
import { ZoomableImage } from "@/components/site/zoomable-image";
import type { EvidenceItem, PanelColours, StorySectionBody } from "@/content/stretch/story";

/*
 * The passes and panels long-form parts (docs/design/DESIGN.md "Long-form pages", R-21 and R-22): what a Role story and
 * a case study share once they are on the new design. The back link, a section with its heading at the left and its
 * text at the right, the text itself (paragraphs and points), the evidence figures, a screenshot with its caption, and
 * the panel that leads to the next page. Styles are in
 * story.css. Server-rendered, so a page reads the same with no script.
 */

/** "← Work" or "← Things I make": the first thing on the page. */
export function StoryBack({ href, label }: { href: string; label: string }) {
  return (
    <Link className="story-back" href={href}>
      <Arrowed label={label} />
    </Link>
  );
}

/** A section: the heading at the left, the text and its figures at the right. Its id is a focus target for an address that names it. */
export function StorySection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className="story-section" aria-labelledby={titleId} tabIndex={-1}>
      <h2 id={titleId} className="story-section__title">
        {title}
      </h2>
      <div className="story-section__body">{children}</div>
    </section>
  );
}

/** A section's words: its paragraphs in Newsreader, then its points, each a serif lead over a muted line. */
export function StoryText({ body }: { body: StorySectionBody }) {
  const { paragraphs, points } = body;
  return (
    <>
      {paragraphs && paragraphs.length > 0 && (
        <div className="prose">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}
      {points && points.length > 0 && (
        <ul className="points">
          {points.map(({ lead, text }) => (
            <li key={lead}>
              <b>{lead}</b> <span>{text}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** The evidence figures: each value large in Newsreader over its words, wrapping two by two on a phone. */
export function EvidenceFigures({ evidence }: { evidence: readonly EvidenceItem[] }) {
  if (evidence.length === 0) return null;
  return (
    <ul className="story-figures" aria-label="Evidence">
      {evidence.map(({ value, label }) => (
        <li key={label}>
          <b>{value}</b> {label}
        </li>
      ))}
    </ul>
  );
}

/** Desktop column widths for an image in the text column: at most 760 px, 8 of 12 columns, or the page on a phone. */
export const columnImageSizes = "(min-width: 1260px) 760px, (min-width: 720px) 60vw, 100vw";

/** A screenshot or a certificate in the text column, as it is: 16 px corners, a hairline edge, opening large in a dialog, and its caption beneath. */
export function StoryImage({ id, src, alt, width, height, caption }: { id?: string; src: string; alt: string; width: number; height: number; caption: ReactNode }) {
  return (
    <figure id={id} className="story-fig">
      <div className="story-fig__shot">
        <ZoomableImage src={src} alt={alt} width={width} height={height} sizes={columnImageSizes} />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** The page's end before Say hello: the next page as a panel in its own colour, its label and line at the left and its name large at the right. */
export function NextPanel({ label, href, name, line, colours }: { label: string; href: string; name: string; line: string; colours: PanelColours }) {
  const style = { "--field": colours.field, "--panel-ink": colours.ink } as CSSProperties;
  return (
    <nav className="frame story-next" aria-label={label}>
      <Link className="panel next-panel" href={href} style={style}>
        <span className="next-panel__line">
          <span>{label}</span> <span>{line}</span>
        </span>
        <span className="next-panel__name">
          {name}
          <Arrow />
        </span>
      </Link>
    </nav>
  );
}
