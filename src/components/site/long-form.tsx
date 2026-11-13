import Link from "next/link";
import type { ReactNode } from "react";
import { Row } from "@/components/quiet/row";
import { DotLine } from "@/components/site/dot-line";
import { FocusHashTarget } from "@/components/site/focus-hash-target";
import { SayHello } from "@/components/site/say-hello";
import { SiteHeader } from "@/components/site/site-header";

/*
 * The long-form template (docs/design/DESIGN.md, "Long-form pages"): the page around a Role story, a case study and
 * the 404. Until #418 and #419 move them onto story-parts.tsx, the pieces below it are the case study's and the 404's.
 * The shared header, then one 600 px column: a back link, an opening,
 * sections at 17 px, and one row to the next page. The pieces here know nothing about either page; what belongs
 * to one (the pass, the screenshot, the figures) is passed in. Server-rendered in full, so it reads the same
 * with no script.
 */

/** "Live site ↗" as a visible label and a decorative arrow: the link's name is the words. */
export function Arrowed({ label }: { label: string }) {
  const [, before, words, after] = label.match(/^(?:([←↗]) )?(.*?)(?: ([←↗]))?$/) ?? [];
  return (
    <>
      {before && <span aria-hidden="true">{before}</span>}
      {words}
      {after && <span aria-hidden="true">{after}</span>}
    </>
  );
}

/** The page: the shared header, the page's own content, Say hello to end it, and the skip link's target. */
export function LongForm({ attrs, children }: { attrs: Record<`data-${string}`, string>; children: ReactNode }) {
  return (
    <div data-stretch-shell {...attrs}>
      <SiteHeader />
      <FocusHashTarget />
      <main id="main-content" tabIndex={-1}>
        {children}
        <SayHello />
      </main>
    </div>
  );
}

/** "← Work": 15 px, muted, the first thing in the column. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="qi-long__back" href={href}>
      <Arrowed label={label} />
    </Link>
  );
}

/** The opening: the title as the page's one `h1` in the opening line's treatment, its line, quiet metadata, and what the page puts beneath. */
export function LongFormOpening({ titleId, title, line, meta, below }: { titleId: string; title: string; line: string; meta?: readonly string[]; below?: ReactNode }) {
  return (
    <header className="qi-long__open">
      <div className="qi-long__heading">
        <h1 id={titleId} className="qi-opening__line qi-long__title">
          {title}
        </h1>
        <p className="qi-long__line">{line}</p>
        {meta && (
          <p className="qi-long__meta stretch-mono">
            <DotLine parts={meta.flatMap((part) => part.split(" · "))} />
          </p>
        )}
      </div>
      {below}
    </header>
  );
}

/** A section: its title (an `h2` at 17 px), then its text and whatever the page attaches. It is a focus target for the header's link. */
export function LongFormSectionBlock({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className="qi-long__section" tabIndex={-1}>
      <h2 id={titleId} className="qi-title">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** The row that ends a page, under "Next role" or "Next project": the next page's object, name and one line. */
export function NextRow({ label, href, object, title, line }: { label: string; href: string; object: ReactNode; title: string; line: string }) {
  return (
    <section className="qi-long__section" aria-labelledby="next-title">
      <h2 id="next-title" className="qi-title">
        {label}
      </h2>
      <ul className="qi-list">
        <Row href={href} object={object} title={title} line={line} />
      </ul>
    </section>
  );
}
