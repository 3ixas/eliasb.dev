import Image from "next/image";
import type { CSSProperties } from "react";
import { hostLabel } from "@/components/site/host-label";
import { isInternalHref, SiteLink } from "@/components/site/site-link";
import type { Project } from "@/content/projects";
import type { EvidenceItem } from "@/content/stretch/story";

/** A project opens at its case study, else its live site, else its code. */
export const projectHref = ({ links }: Project) => (links.caseStudy ?? links.live ?? links.code)!;

/** Its type and year, as the archive prints them under its line. */
export const projectMeta = ({ type, year }: Project) => `${type} · ${year}`;

type ProjectPanelProps = {
  project: Project;
  /** Its line: the project's outcome, or the shorter one a homepage row gives it. */
  line: string;
  /** The homepage's sections are h2, so its panels are h3; the archive's h1 makes its panels h2. */
  level?: 2 | 3;
  /** Threshold on the homepage: the text and its figures at the left, the screenshot bleeding off the right. */
  wide?: boolean;
  /** Figures on the wide panel, from its case study's evidence. */
  figures?: readonly EvidenceItem[];
  /** The archive prints its type and year. */
  meta?: boolean;
  /** On the first screen, so the screenshot loads at once. */
  eager?: boolean;
};

/**
 * A project as a panel (DESIGN.md "The panel", R-17 and R-23), the one part the homepage and the archive share. The whole
 * panel is the link: to its case study in its own field and ink, which glows in its own colour in the dark theme; or, for a
 * project with no case study, on paper to wherever it lives, marked ↗ and opening in a new tab. A project with no
 * screenshot is a complete panel of text. Styles are in projects.css.
 */
export function ProjectPanel({ project, line, level = 3, wide = false, figures, meta = false, eager = false }: ProjectPanelProps) {
  const href = projectHref(project);
  const external = !isInternalHref(href);
  const coloured = Boolean(project.links.caseStudy && project.panel);
  const style = coloured ? ({ "--field": project.panel!.field, "--panel-ink": project.panel!.ink } as CSSProperties) : undefined;
  const classes = ["panel", "project", coloured ? "panel--glow" : "panel--paper", wide ? "project--wide" : null, project.screenshot ? null : "project--text"].filter(Boolean).join(" ");
  const Heading = level === 2 ? "h2" : "h3";
  const { screenshot } = project;
  return (
    <SiteLink href={href} className={classes} style={style}>
      <span className="project__text">
        <Heading className="project__name">{project.name}</Heading>
        <span className="project__line">{line}</span>
        {figures && figures.length > 0 && (
          <span className="project__figures">
            {figures.map(({ value, label }) => (
              <span key={label}>
                <b>{value}</b> {label}
              </span>
            ))}
          </span>
        )}
        {(meta || external) && (
          <span className="project__meta">
            {meta && projectMeta(project)}
            {external && (
              <>
                {meta && " "}
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> opens {hostLabel(href)} in a new tab</span>
              </>
            )}
          </span>
        )}
      </span>
      {screenshot && (
        <span className="project__shot">
          <Image src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} sizes={wide ? "(max-width: 1259px) 90vw, 760px" : "(max-width: 719px) 90vw, (max-width: 1259px) 45vw, 600px"} loading={eager ? "eager" : "lazy"} />
        </span>
      )}
    </SiteLink>
  );
}
