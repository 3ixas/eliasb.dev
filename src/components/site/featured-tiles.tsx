import type { CSSProperties } from "react";
import Image from "next/image";
import type { Fastener, Project } from "@/content/projects";

/** Alternate the screenshot's tilt, inside the spec's ±1 to 1.5 degrees. */
const tilts = ["-1.5deg", "1deg", "-1deg"] as const;

const number = (position: number) => String(position + 1).padStart(2, "0");

/** The one small prop on a tile's edge; decorative, so hidden from assistive technology. */
function FastenerProp({ kind }: { kind: Fastener }) {
  if (kind === "paperclip") {
    return (
      <svg className="stretch-fastener stretch-fastener--paperclip" aria-hidden="true" width="34" height="86" viewBox="0 0 34 86" fill="none" stroke="#b8babd" strokeWidth="3" strokeLinecap="round">
        <path d="M10 30 V70 a7 7 0 0 0 14 0 V16 a11 11 0 0 0 -22 0 V64" />
      </svg>
    );
  }
  return <span className={`stretch-fastener stretch-fastener--${kind}`} aria-hidden="true" />;
}

/**
 * The featured Work tiles, in the order of the curated list. Each carries its
 * project's own colours; the first spans two columns. The caller passes only
 * projects the catalogue check has already vouched for, so a missing colour or
 * screenshot is a build failure, not something to render around.
 */
export function FeaturedTiles({ projects }: { projects: readonly Project[] }) {
  return (
    <ol className="stretch-tiles">
      {projects.map((project, position) => {
        const { colours, screenshot, links } = project;
        if (!colours || !screenshot || !links.caseStudy) {
          throw new Error(`Featured project "${project.slug}" needs colours, a screenshot and a case study.`);
        }
        const style = {
          "--tile-field": colours.field,
          "--tile-ink": colours.ink,
          "--tile-swatch": colours.swatch,
          "--tile-tilt": tilts[position % tilts.length],
        } as CSSProperties;
        return (
          <li key={project.slug} className="stretch-tiles__item" data-wide={position === 0 ? "" : undefined}>
            <a className="stretch-tile" href={links.caseStudy} style={style}>
              {project.fastener && <FastenerProp kind={project.fastener} />}
              <div className="stretch-tile__text">
                <p className="stretch-display stretch-tile__number" aria-hidden="true">
                  {number(position)}
                </p>
                <h3 className="stretch-tile__name">{project.name}</h3>
                <p className="stretch-tile__outcome">{project.outcome}</p>
                <p className="stretch-mono stretch-tile__meta">
                  {project.type} · {project.year}
                </p>
              </div>
              <div className="stretch-tile__shot">
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  width={screenshot.width}
                  height={screenshot.height}
                  sizes="(max-width: 760px) 90vw, (max-width: 1400px) 50vw, 640px"
                />
              </div>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
