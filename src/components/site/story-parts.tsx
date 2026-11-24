import Link from "next/link";
import type { ReactNode } from "react";
import { Count } from "@/components/parts/on-view";
import { Arrow, panelSurface } from "@/components/parts/panel";
import { titleLinkTypes, TitleTransition, type PanelTitleTransition } from "@/components/parts/title-transition";
import { ChapterRail, type StoryChapter } from "@/components/site/chapter-rail";
import { Arrowed } from "@/components/site/long-form";
import { ZoomableImage } from "@/components/site/zoomable-image";
import type { EvidenceItem, PanelColours, StorySectionBody } from "@/content/stretch/story";

/*
 * The passes and panels long-form parts (docs/design/DESIGN.md "Long-form pages", R-21, R-22, R-52, R-54): what a Role
 * story and a case study share. The back link, the sticky chapter rail and reading stream, a section with its heading
 * and body, structured Problem/Decision cards, the evidence figures, a screenshot or archival-matted artefact with its
 * caption, and the panel that leads to the next page. Styles are in story.css.
 */

/** Shared two-column long-form container: sticky left chapter rail from 960 px beside the right reading column. */
export function StoryChapters({ items, label, children }: { items: readonly StoryChapter[]; label: string; children: ReactNode }) {
  return (
    <div className="story-layout">
      <ChapterRail items={items} label={label} />
      <div className="story-stream">{children}</div>
    </div>
  );
}

function StoryPoints({ points }: { points: NonNullable<StorySectionBody["points"]> }) {
  if (points.length === 0) return null;
  return (
    <ul className="story-cards">
      {points.map(({ lead, text }) => (
        <li key={lead} className="story-card surface surface--paper">
          <b>{lead}</b> <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

/** "← Work" or "← Things I make": the first thing on the page. */
export function StoryBack({ href, label, transitionTypes }: { href: string; label: string; transitionTypes?: string[] }) {
  return (
    <Link className="story-back" href={href} transitionTypes={transitionTypes}>
      <Arrowed label={label} />
    </Link>
  );
}

/** A section: its id is a focus target for an address that names it. */
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

/** A section's words: its paragraphs in Newsreader, then its structured points as bordered paper cards. */
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
      {points && points.length > 0 && <StoryPoints points={points} />}
    </>
  );
}

/** The evidence figures: each value large in Newsreader over its words, wrapping cleanly at every width; a number rolls to its value once. */
export function EvidenceFigures({ evidence }: { evidence: readonly EvidenceItem[] }) {
  if (evidence.length === 0) return null;
  return (
    <ul className="story-figures" aria-label="Evidence">
      {evidence.map(({ value, label }) => (
        <li key={label}>
          <b>
            <Count value={value} />
          </b>{" "}
          {label}
        </li>
      ))}
    </ul>
  );
}

/** Desktop column widths for an image in the text column: at most 760 px, 8 of 12 columns, or the page on a phone. */
export const columnImageSizes = "(min-width: 1260px) 840px, (min-width: 720px) 64vw, 100vw";

/** A screenshot or printed artefact in the text column; with `mat`, framed on a neutral archival paper mat so printed documents separate cleanly in both themes (R-52). */
export function StoryImage({ id, src, alt, width, height, caption, mat = false }: { id?: string; src: string; alt: string; width: number; height: number; caption: ReactNode; mat?: boolean }) {
  const shot = (
    <div className="story-fig__shot">
      <ZoomableImage src={src} alt={alt} width={width} height={height} sizes={columnImageSizes} />
    </div>
  );
  return (
    <figure id={id} className={mat ? "story-fig story-fig--mat" : "story-fig"}>
      {mat ? <div className="story-fig__mat surface surface--paper">{shot}</div> : shot}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** The page's end before Say hello: the next page as a panel (in its own colour, or paper when omitted), its label and line at the left and its name large at the right. */
export function NextPanel({
  label,
  href,
  name,
  line,
  colours,
  transition,
}: {
  label: string;
  href: string;
  name: string;
  line: string;
  colours?: PanelColours;
  transition?: PanelTitleTransition;
}) {
  const surface = panelSurface(colours);
  return (
    <nav className="frame story-next" aria-label={label}>
      <Link className={`${surface.className} next-panel`} href={href} style={surface.style} transitionTypes={transition ? titleLinkTypes(transition.name) : undefined}>
        <span className="next-panel__line">
          <span>{label}</span> <span>{line}</span>
        </span>
        <span className="next-panel__name">
          {transition ? (
            <TitleTransition name={transition.name} share={transition.share}>
              <span className="vt-title">{name}</span>
            </TitleTransition>
          ) : (
            name
          )}
          <Arrow />
        </span>
      </Link>
    </nav>
  );
}
