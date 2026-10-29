import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Row } from "@/components/quiet/row";
import { FocusHashTarget } from "@/components/site/focus-hash-target";
import { SiteHeader } from "@/components/site/site-header";
import { Arrowed } from "@/components/site/story";

/*
 * The long-form template (docs/design/DESIGN.md, "Long-form pages"): what a Role story and a case study share.
 * The shared header with the page's own sections as its links, then one 600 px column: a back link, an opening,
 * sections at 17 px, and one row to the next page. The pieces here know nothing about either page; what belongs
 * to one (the pass, the screenshot, the figures) is passed in. Server-rendered in full, so it reads the same
 * with no script.
 */

/** The header's links on a long-form page: the page's own sections, in reading order. */
export type LongFormSection = { readonly id: string; readonly label: string };

/** The page: the shared header, the column's room, and the skip link's target. */
export function LongForm({ sections, attrs, children }: { sections: readonly LongFormSection[]; attrs: Record<`data-${string}`, string>; children: ReactNode }) {
  return (
    <div data-stretch-shell {...attrs}>
      <SiteHeader sections={sections} long />
      <FocusHashTarget />
      <main id="main-content" tabIndex={-1}>
        {children}
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

/**
 * The opening: the title as the page's one `h1` in the opening line's treatment, its line, quiet metadata, and
 * the page's object beside it (below the title on a phone), and what hangs from the object under the title, in
 * the room the object leaves (after it on a phone). `long` sets a name too long for the display size smaller.
 */
export function LongFormOpening({ titleId, title, line, meta, long, aside, below }: { titleId: string; title: string; line: string; meta: readonly string[]; long?: boolean; aside?: ReactNode; below?: ReactNode }) {
  return (
    <header className="qi-long__open" data-aside={aside ? "" : undefined}>
      <div className="qi-long__heading">
        <h1 id={titleId} className="qi-opening__line qi-long__title" data-long={long ? "" : undefined}>
          {title}
        </h1>
        <p className="qi-long__line">{line}</p>
        <p className="qi-long__meta stretch-mono">
          {meta.map((part, index) => (
            <Fragment key={part}>
              {index > 0 && " · "}
              <span className="qi-long__nowrap">{part}</span>
            </Fragment>
          ))}
        </p>
      </div>
      {aside}
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
