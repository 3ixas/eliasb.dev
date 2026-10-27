import Image from "next/image";
import Link from "next/link";
import { HOMEPAGE_INDEX_ROWS, type Project } from "@/content/projects";
import { thingsIMake } from "@/content/stretch/site-copy";
import { bindDots } from "@/components/site/bind-dots";
import { hostLabel } from "@/components/site/host-label";

const number = (position: number) => String(position).padStart(2, "0");

/** A project opens at its case study, else its live site, else its code. */
const destination = ({ links }: Project) => links.caseStudy ?? links.live ?? links.code ?? "/things-i-make";

/**
 * The Project index: every non-featured project as a typographic row, newest
 * first. On the homepage it is capped at ten with "Everything I’ve built (n)" after it:
 * `rows` is the whole index and `total` is the catalogue's count for the link.
 * The archive passes `limit` of `Infinity` and no `total`, so it lists every
 * row and has no link to itself. Hover and focus
 * are CSS only: the screenshot follows its row on desktop (bounded by the list edges) and is
 * the thumbnail inside the row on phones, so it needs no script and a row
 * without a screenshot simply has none. An external row says so to assistive
 * technology with sr-only text after its arrow (the arrow itself is aria-hidden). The screenshot is decorative here: the
 * row's own text already names the project.
 */
export function ProjectIndex({
  rows,
  firstNumber,
  total,
  limit = HOMEPAGE_INDEX_ROWS,
}: {
  rows: readonly Project[];
  firstNumber: number;
  total?: number;
  limit?: number;
}) {
  const shown = rows.slice(0, limit);
  const resting = shown.findIndex((project) => project.screenshot);
  return (
    <div className="stretch-index">
      <ol className="stretch-index__list">
        {shown.map((project, position) => {
          const { screenshot } = project;
          const href = destination(project);
          const external = href.startsWith("http");
          const content = (
            <>
              <span className="stretch-mono stretch-index__number" aria-hidden="true">
                {number(firstNumber + position)}
              </span>
              <span className="stretch-index__text">
                <span className="stretch-index__name">{project.name}</span>
                <span className="stretch-index__outcome">{project.outcome}</span>
              </span>
              <span className="stretch-mono stretch-index__meta">
                {bindDots(`${project.type} · ${project.year}`)}
              </span>
              <span className="stretch-index__arrow" aria-hidden="true">
                {external ? "↗" : "→"}
              </span>
              {external && <span className="sr-only"> opens {hostLabel(href)} in a new tab</span>}
              {screenshot && (
                <span className="stretch-index__shot" data-resting={position === resting ? "" : undefined}>
                  <Image
                    src={screenshot.src}
                    alt=""
                    width={screenshot.width}
                    height={screenshot.height}
                    sizes="(max-width: 760px) 96px, 420px"
                  />
                </span>
              )}
            </>
          );
          return (
            <li key={project.slug} className="stretch-index__row">
              {external ? (
                <a className="stretch-index__link" href={href} target="_blank" rel="noreferrer">
                  {content}
                </a>
              ) : (
                <Link className="stretch-index__link" href={href}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      {total !== undefined && (
        <p className="stretch-index__all">
          <Link className="stretch-mono" href="/things-i-make">
            {thingsIMake.allThings(total)}
          </Link>
        </p>
      )}
    </div>
  );
}
