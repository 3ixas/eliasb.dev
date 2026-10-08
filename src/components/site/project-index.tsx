import Image from "next/image";
import Link from "next/link";
import { HOMEPAGE_INDEX_ROWS, type Project } from "@/content/projects";
import { workSection } from "@/content/stretch/site-copy";

const number = (position: number) => String(position).padStart(2, "0");

/** A project opens at its case study, else its live site, else its code. */
const destination = ({ links }: Project) => links.caseStudy ?? links.live ?? links.code ?? "/work";

/**
 * The Project index: every non-featured project as a typographic row, newest
 * first, capped for the homepage with "All work (n)" after it. `rows` is the
 * whole index; `total` is the catalogue's count for the link. Hover and focus
 * are CSS only: the screenshot is the preview beside the list on desktop and
 * the thumbnail inside the row on phones, so it needs no script and a row
 * without a screenshot simply has none. The screenshot is decorative here: the
 * row's own text already names the project.
 */
export function ProjectIndex({
  rows,
  firstNumber,
  total,
}: {
  rows: readonly Project[];
  firstNumber: number;
  total: number;
}) {
  const shown = rows.slice(0, HOMEPAGE_INDEX_ROWS);
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
                {project.type} · {project.year}
              </span>
              <span className="stretch-index__arrow" aria-hidden="true">
                →
              </span>
              {screenshot && (
                <span className="stretch-index__shot">
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
                <a className="stretch-index__link" href={href}>
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
      <p className="stretch-index__all">
        <Link className="stretch-mono" href="/work">
          {workSection.allWork(total)}
        </Link>
      </p>
    </div>
  );
}
