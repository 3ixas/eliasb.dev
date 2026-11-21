import Image from "next/image";
import { hostLabel } from "@/components/site/host-label";
import { isInternalHref, SiteLink } from "@/components/site/site-link";
import { OUT, panelSurface } from "@/components/parts/panel";
import { projectPanelTransition, titleLinkTypes, TitleTransition } from "@/components/parts/title-transition";
import type { Project } from "@/content/projects";

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
  /** Threshold on the homepage: the text at the left, the screenshot bleeding off the right. */
  wide?: boolean;
  /** The archive prints its type and year. */
  meta?: boolean;
  /** On the first screen, so the screenshot loads at once. */
  eager?: boolean;
  /** Opts this panel's title into the shared route view transition to its case study h1 (#472). */
  titleTransition?: boolean;
};

/**
 * A project as a panel (DESIGN.md "The panel", R-17 and R-23), the one part the homepage and the archive share. The whole
 * panel is the link: to its case study in its own field and ink; or, for a
 * project with no case study, on paper to wherever it lives, marked ↗ and opening in a new tab. A project with no
 * screenshot is a complete panel of text. Styles are in projects.css.
 */
export function ProjectPanel({ project, line, level = 3, wide = false, meta = false, eager = false, titleTransition = false }: ProjectPanelProps) {
  const href = projectHref(project);
  const external = !isInternalHref(href);
  const coloured = Boolean(project.links.caseStudy && project.panel);
  const surface = panelSurface(coloured ? project.panel : undefined);
  const classes = [surface.className, "project", wide ? "project--wide" : null, project.screenshot ? null : "project--text"].filter(Boolean).join(" ");
  const Heading = level === 2 ? "h2" : "h3";
  const { screenshot } = project;
  const transition = titleTransition && project.links.caseStudy ? projectPanelTransition(project.slug) : undefined;
  return (
    <SiteLink href={href} className={classes} style={surface.style} transitionTypes={transition ? titleLinkTypes(transition.name) : undefined}>
      <span className="project__text">
        <TitleTransition name={transition?.name} share={transition?.share}>
          <Heading className="project__name">{project.name}</Heading>
        </TitleTransition>
        <span className="project__line">{line}</span>
        {(meta || external) && (
          <span className="project__meta">
            {meta && projectMeta(project)}
            {external && (
              <>
                {meta && " "}
                <span aria-hidden="true">{OUT}</span>
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
