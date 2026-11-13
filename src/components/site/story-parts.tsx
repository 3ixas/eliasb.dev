import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Arrow } from "@/components/parts/panel";
import { Arrowed } from "@/components/site/long-form";
import type { PanelColours, StorySectionBody } from "@/content/stretch/story";

/*
 * The passes and panels long-form parts (docs/design/DESIGN.md "Long-form pages", R-21 and R-22): what a Role story and
 * a case study share once they are on the new design. The back link, a section with its heading at the left and its
 * text at the right, the text itself (paragraphs and points), and the panel that leads to the next page. Styles are in
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
