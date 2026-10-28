import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CycleTrigger } from "@/components/quiet/cycle";
import { bindDots } from "@/components/site/bind-dots";
import { hostLabel } from "@/components/site/host-label";

/**
 * A row's closer look: its id (the key of the controller's `looks`) and what it says beyond the row, as the row's
 * accessible description. A row with `cycle` (what each step of the cycle says, for the live region) steps through
 * its look's pages when clicked instead of opening it; on phones its first tap opens the look and each one after
 * steps it on, and its object button opens and closes it.
 */
export type RowLook = { id: string; description: string; cycle?: string[] };

/** The object button of a link row, or a cycling row, is named for its title, so that title is text. */
function nameOf(title: ReactNode) {
  if (typeof title !== "string") throw new Error("A row with a link or a cycle, and a closer look, needs a text title to name its object button");
  return title;
}

/**
 * The Row (GLOSSARY.md): the quiet index's only list shape. A 44 px object, a title, one line and optional
 * metadata. A row with a destination is a link; a plain row takes focus only when it has a closer look,
 * and then the controller (closer-look-root.tsx) shows that look when the pointer or focus arrives.
 * A link to another site (`href` starting with http) opens in a new tab, is marked ↗ and says so to assistive
 * technology. A row given a `card` also has a phone shape: the card is an extra element shown only there (a
 * featured project's screenshot), in a list that CSS turns into swipeable cards. `after` is decoration drawn
 * over the row's item but outside the row (How I work's pen arrows between habits). `attrs` puts data attributes on
 * the item. A row whose look has a `cycle` is a button that steps the look on (cycle.tsx). A title that is not a string is for a row whose words wait on the visitor's clock (the training row).
 * Rendered by the server in full: the description is hidden text the row points to with `aria-describedby`,
 * and sits beside the row so it is not part of a link's name. The markup is the same on every screen and CSS
 * decides which presentation shows: on phones a link row's object gets its own button beside the link (a button
 * inside a link is invalid), and the empty slot under the row is where the controller opens the inline closer look.
 * A row that leaves the site opens its look when tapped on a phone, and the look is the link (`data-look-href`).
 */
export function Row({ object, title, line, meta, href, look, card, after, style, attrs }: { object: ReactNode; title: ReactNode; line: ReactNode; meta?: string; href?: string; look?: RowLook; card?: ReactNode; after?: ReactNode; style?: CSSProperties; attrs?: Record<`data-${string}`, string> }) {
  const external = href?.startsWith("http") ?? false;
  const descriptionId = look && `${look.id}-description`;
  const props = look ? { "data-look": look.id, "aria-describedby": descriptionId } : {};
  const titleId = look && `${look.id}-title`;
  const content = (
    <>
      {card}
      <span className="qi-row__object" aria-hidden="true">
        {object}
      </span>
      <span className="qi-row__text">
        <span id={titleId} className="qi-row__title">{title}</span>
        <span className="qi-row__line">{typeof line === "string" ? bindDots(line) : line}</span>
      </span>
      <span className="qi-row__end">
        {meta && <span className="qi-row__meta stretch-mono">{meta}</span>}
        {href && (
          <span className="qi-row__arrow" aria-hidden="true">
            {external ? "↗" : "→"}
          </span>
        )}
        {external && href && <span className="sr-only"> opens {hostLabel(href)} in a new tab</span>}
      </span>
    </>
  );
  return (
    <li className="qi-list__item" data-card={card ? "" : undefined} style={style} {...attrs}>
      <div className="qi-row-box">
        {external ? (
          <a className="qi-row" href={href} target="_blank" rel="noreferrer" data-look-tap={look?.id} {...props}>
            {content}
          </a>
        ) : href ? (
          <Link className="qi-row" href={href} {...props}>
            {content}
          </Link>
        ) : look?.cycle ? (
          <CycleTrigger id={look.id} announcements={look.cycle} labelledBy={titleId!} describedBy={descriptionId!}>
            {content}
          </CycleTrigger>
        ) : (
          // A plain row is the whole tap target on phones (data-look-tap); a link row's is the object button beside it.
          <div className="qi-row" tabIndex={look ? 0 : undefined} role={look ? "group" : undefined} aria-labelledby={titleId} data-look-tap={look?.id} {...props}>
            {content}
          </div>
        )}
        {(href || look?.cycle) && look && <button type="button" className="qi-row__tap" data-look-tap={look.id} aria-expanded="false" aria-label={`A closer look at ${nameOf(title)}`} />}
      </div>
      {after}
      {look && (
        <>
          <p id={descriptionId} hidden>
            {look.description}
          </p>
          <div className="qi-inline" data-look-slot={look.id} data-look-href={external ? href : undefined} data-look-cycle={look.cycle?.length} aria-hidden="true" />
        </>
      )}
    </li>
  );
}
