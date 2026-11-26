import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { hostLabel } from "@/components/site/host-label";
import { isInternalHref, SiteLink } from "@/components/site/site-link";
import { Arrow, OUT, panelSurface } from "@/components/parts/panel";
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
  /** Threshold on the homepage: text and inline controls at the left, the uncropped screenshot in its optical bezel at the right. */
  wide?: boolean;
  /** The archive prints its type and year. */
  meta?: boolean;
  /** On the first screen, so the screenshot loads at once. */
  eager?: boolean;
  /** "low" for a first-screen screenshot that a phone shows below the first one, which then loads ahead of it. */
  fetchPriority?: "low";
  /** Opts this panel's title into the shared route view transition to its case study h1 (#472). */
  titleTransition?: boolean;
  /** Inline interactive controls (e.g. Threshold's homepage city switcher); renders an article with a case-study pill so controls never nest inside a link. */
  controls?: ReactNode;
};

/**
 * A project as a panel (DESIGN.md "The panel", R-17, R-23, R-46, R-47), shared by the homepage and the archive.
 * Without inline `controls`, the whole panel is the link: to its case study in its own field and ink, or on paper
 * to wherever it lives, marked ↗ and opening in a new tab. With `controls`, the panel is an `<article>` carrying the
 * controls and a solid case-study pill. Every screenshot sits whole and uncropped inside a concentric optical bezel
 * tuned per surface. Styles are in projects.css.
 */
export function ProjectPanel({
  project,
  line,
  level = 3,
  wide = false,
  meta = false,
  eager = false,
  fetchPriority,
  titleTransition = false,
  controls,
}: ProjectPanelProps) {
  const href = projectHref(project);
  const external = !isInternalHref(href);
  const coloured = Boolean(project.links.caseStudy && project.panel);
  const surface = panelSurface(coloured ? project.panel : undefined);
  const classes = [surface.className, "project", wide ? "project--wide" : null, project.screenshot ? null : "project--text"].filter(Boolean).join(" ");
  const Heading = level === 2 ? "h2" : "h3";
  const { screenshot } = project;
  const transition = titleTransition && project.links.caseStudy ? projectPanelTransition(project.slug) : undefined;
  const transitionTypes = transition ? titleLinkTypes(transition.name) : undefined;
  const sizes = wide ? "(max-width: 1259px) 90vw, 640px" : "(max-width: 719px) 90vw, (max-width: 1259px) 45vw, 520px";
  const TextTag = controls ? "div" : "span";
  const LineTag = controls ? "p" : "span";
  const ShotTag = controls ? "div" : "span";

  const content = (
    <>
      <TextTag className="project__text">
        <TitleTransition name={transition?.name} share={transition?.share}>
          <Heading className="project__name">{project.name}</Heading>
        </TitleTransition>
        <LineTag className="project__line">{line}</LineTag>
        {(meta || (!controls && external)) && (
          <span className="project__meta">
            {meta && projectMeta(project)}
            {!controls && external && (
              <>
                {meta && " "}
                <span aria-hidden="true">{OUT}</span>
                <span className="sr-only"> opens {hostLabel(href)} in a new tab</span>
              </>
            )}
          </span>
        )}
        {controls}
        {controls && (
          <div className="project__actions">
            <SiteLink href={href} className="pill project__cta" transitionTypes={transitionTypes}>
              {`The ${project.name} case study`}
              <Arrow />
            </SiteLink>
          </div>
        )}
      </TextTag>
      {screenshot && (
        <ShotTag className="optical-bezel project__shot" style={{ "--shot-ratio": screenshot.width / screenshot.height } as CSSProperties}>
          <Image src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} sizes={sizes} loading={eager ? "eager" : "lazy"} fetchPriority={fetchPriority} />
        </ShotTag>
      )}
    </>
  );

  if (controls) {
    return (
      <article className={classes} style={surface.style}>
        {content}
      </article>
    );
  }

  return (
    <SiteLink href={href} className={classes} style={surface.style} transitionTypes={transitionTypes}>
      {content}
    </SiteLink>
  );
}
