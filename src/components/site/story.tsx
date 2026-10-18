import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { EvidenceItem, StoryColours, StorySectionBody } from "@/content/stretch/story";
import { FastenerProp, TileShot } from "@/components/site/featured-tiles";
import type { Fastener, ProjectImage } from "@/content/projects";

/*
 * The parts of a story page that a Case study and a Role story share: the
 * opening band in a colour pair, the section links, a numbered section and the
 * evidence strip, and the tile that ends a story. What belongs to one page (the
 * screenshot, links, back link) is passed in or rendered by the page itself.
 * Nothing here knows about a project.
 */

/** The characters in a name's longest word: the opening band sizes the title so that word fits its column. */
const longestWord = (name: string) => Math.max(...name.split(/\s+/).map((word) => word.length));

export const storyNumber = (position: number) => String(position + 1).padStart(2, "0");

/** "Live site ↗" as a visible label and a decorative arrow: the link's name is the words. */
export function Arrowed({ label }: { label: string }) {
  const arrow = label.match(/^(?:([←↗]) )?(.*?)(?: ([←↗]))?$/);
  const [, before, words, after] = arrow ?? [];
  return (
    <>
      {before && <span aria-hidden="true">{before} </span>}
      {words}
      {after && <span aria-hidden="true"> {after}</span>}
    </>
  );
}

/** A story's colours arrive as --cs-* on the element that owns them. */
export const storyColours = ({ field, ink, swatch }: StoryColours) =>
  ({ "--cs-field": field, "--cs-ink": ink, "--cs-swatch": swatch }) as CSSProperties;

/**
 * The opening band: the back link, then the number, name and lead, then
 * whatever the page adds under the lead (metadata, links, a note), with the
 * page's own aside (a screenshot) beside it.
 */
export function StoryOpening({
  colours,
  back,
  number,
  titleId,
  name,
  nameClassName,
  lead,
  aside,
  children,
}: {
  colours: StoryColours;
  back: ReactNode;
  number: string;
  titleId: string;
  name: string;
  /** An extra class on the name, for a page whose name needs a different size. */
  nameClassName?: string;
  lead: string;
  aside: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="stretch-cs-open" style={storyColours(colours)} aria-label="Overview">
      <div className="stretch-wrap stretch-cs-open__inner">
        {back}
        <div className="stretch-cs-open__text" style={{ "--cs-name-chars": longestWord(name) } as CSSProperties}>
          <p className="stretch-display stretch-cs-open__number" aria-hidden="true">
            {number}
          </p>
          <h1 id={titleId} className={`stretch-display stretch-cs-open__name${nameClassName ? ` ${nameClassName}` : ""}`}>
            {name}
          </h1>
          <p className="stretch-cs-open__outcome">{lead}</p>
          {children}
        </div>
        {aside}
      </div>
    </section>
  );
}

export function StorySectionLinks({ sections }: { sections: readonly { key: string; label: string }[] }) {
  return (
    <nav aria-label="Sections" className="stretch-cs-links-row">
      <ul className="stretch-wrap">
        {sections.map(({ key, label }, position) => (
          <li key={key}>
            <a href={`#${key}`}>
              <span className="stretch-mono" aria-hidden="true">
                {storyNumber(position)}
              </span>{" "}
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A numbered section: its text, then whatever the page attaches (a card, a figure). */
export function StorySection({
  id,
  label,
  position,
  section,
  children,
}: {
  id: string;
  label: string;
  position: number;
  section: StorySectionBody;
  children?: ReactNode;
}) {
  // The bold line is the heading; a section without one is headed by its label.
  const heading = section.heading ?? label;
  const titleId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} className="stretch-cs-section" tabIndex={-1}>
      <div className="stretch-cs-section__text">
        {section.heading && (
          <p className="stretch-mono stretch-cs-kicker" aria-hidden="true">
            {storyNumber(position)} · {label}
          </p>
        )}
        <h2 id={titleId} className="stretch-cs-h2">
          {heading}
        </h2>
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph} className="stretch-cs-p">
            {paragraph}
          </p>
        ))}
        {section.points && (
          <ul className="stretch-cs-points">
            {section.points.map((point) => (
              <li key={point.lead}>
                <span className="stretch-cs-lead">{point.lead}</span> {point.text}
              </li>
            ))}
          </ul>
        )}
      </div>
      {children}
    </section>
  );
}

export function StoryEvidence({ evidence }: { evidence: readonly EvidenceItem[] }) {
  return (
    <ul className="stretch-cs-evidence" aria-label="Evidence">
      {evidence.map(({ value, label }) => (
        <li key={label}>
          <span className="stretch-display stretch-cs-evidence__value">{value}</span>
          <span className="stretch-mono stretch-cs-evidence__label">{label}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The tile that ends a story, in the next story's colours: a number, a name, a
 * one-line outcome and an arrow. A story whose next has a picture passes it as
 * `media`: the screenshot, tilted on the right, and the project's Fastener if it has one.
 */
export function StoryNext({
  label,
  href,
  colours,
  number,
  name,
  outcome,
  media,
}: {
  label: string;
  href: string;
  colours: StoryColours;
  number: string;
  name: string;
  outcome: string;
  media?: { screenshot: ProjectImage; fastener?: Fastener };
}) {
  return (
    <section className="stretch-wrap stretch-cs-next" aria-label={label}>
      <Link className="stretch-cs-next__tile" href={href} style={storyColours(colours)}>
        {media?.fastener && <FastenerProp kind={media.fastener} />}
        <span className="stretch-cs-next__text">
          <span className="stretch-mono stretch-cs-next__label">{label}</span>
          <span className="stretch-display stretch-cs-next__number" aria-hidden="true">
            {number}
          </span>
          <span className="stretch-cs-next__name">{name}</span>
          <span className="stretch-cs-next__outcome">{outcome}</span>
          <span className="stretch-cs-next__arrow" aria-hidden="true">
            →
          </span>
        </span>
        {media && <TileShot screenshot={media.screenshot} sizes="(max-width: 760px) calc(100vw - 80px), 520px" />}
      </Link>
    </section>
  );
}
