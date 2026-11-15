import { Arrow, Panel } from "@/components/parts/panel";
import { hostLabel } from "@/components/site/host-label";
import { LongForm } from "@/components/site/long-form";
import { SiteLink } from "@/components/site/site-link";
import { EvidenceFigures, NextPanel, StoryBack, StoryImage, StorySection, StoryText } from "@/components/site/story-parts";
import { ZoomableImage } from "@/components/site/zoomable-image";
import { projects, type Project } from "@/content/projects";
import { caseStudyCopy, caseStudySectionKeys, caseStudySectionLabels, type CaseStudy } from "@/content/stretch/case-study";

/** "Live site" from "Live site ↗": the pill draws its own arrow. */
const words = (label: string) => label.replace(/ ↗$/, "");

/**
 * A case study (GLOSSARY.md; DESIGN.md "Long-form pages", R-22): a panel in the project's colour holding "← Things I
 * make", the name as the `h1`, the description, the stack as chips, Live site and Code, the evidence figures and the
 * landing screenshot; then its six sections in the Role story's layout, each under its own heading, with the PRD as a
 * paper card under "On paper"; then the next project as a panel in its colour, and Say hello. The server renders all of it.
 */
export function CaseStudyPage({ study }: { study: CaseStudy }) {
  const project = projectFor(study.slug);
  const next = projectFor(study.next);

  return (
    <LongForm attrs={{ "data-case-study": study.slug }}>
      <article className="frame story" aria-labelledby="case-study-title">
        <Opening study={study} project={project} />
        {caseStudySectionKeys.map((key) => {
          const { heading, figure, ...body } = study.sections[key];
          return (
            <StorySection key={key} id={key} title={heading ?? caseStudySectionLabels[key]}>
              <StoryText body={body} />
              {key === "written-down-first" && <PrdCard study={study} />}
              {figure && <StoryImage src={figure.src} alt={figure.alt} width={figure.width} height={figure.height} caption={figure.caption} />}
            </StorySection>
          );
        })}
      </article>
      <NextPanel label={caseStudyCopy.nextProject} href={`/things-i-make/${next.slug}`} name={next.name} line={next.outcome} colours={next.panel!} />
    </LongForm>
  );
}

/** A case study's project: the catalogue holds its name, links, screenshot and panel colours (`assertCatalogue` checks them). */
function projectFor(slug: string): Project & Required<Pick<Project, "panel" | "screenshot">> {
  const project = projects.find((entry) => entry.slug === slug);
  if (!project?.panel || !project.screenshot) throw new Error(`Case study "${slug}" needs its project's panel and screenshot.`);
  return project as Project & Required<Pick<Project, "panel" | "screenshot">>;
}

/** The opening panel: the text at the left, the landing screenshot at the right (beneath under 1260 px). */
function Opening({ study, project }: { study: CaseStudy; project: ReturnType<typeof projectFor> }) {
  const { links, screenshot } = project;
  return (
    <Panel as="header" colours={project.panel} glow className="case-open">
      <StoryBack href="/things-i-make" label={caseStudyCopy.back} />
      <div className="case-open__text">
        <h1 id="case-study-title" className="case-open__title">
          {project.name}
        </h1>
        <p className="case-open__lede">{study.description}</p>
        <ul className="chips case-open__stack" aria-label="Stack">
          {study.stack.map((item) => (
            <li key={item} className="chip">
              {item}
            </li>
          ))}
        </ul>
        {(links.live || links.code || study.note) && (
          <div className="case-open__links">
            {links.live && <OutLink href={links.live} label={words(caseStudyCopy.live)} />}
            {links.code && <OutLink href={links.code} label={words(caseStudyCopy.code)} outline />}
            {study.note && <p className="case-open__note">{study.note}</p>}
          </div>
        )}
        <EvidenceFigures evidence={study.evidence} />
      </div>
      <div className="case-open__shot story-fig__shot">
        <ZoomableImage src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} sizes="(min-width: 1260px) 720px, 92vw" preload />
      </div>
    </Panel>
  );
}

/** Live site or Code: a pill marked ↗ that opens in a new tab, saying where for a screen reader. */
function OutLink({ href, label, outline = false }: { href: string; label: string; outline?: boolean }) {
  return (
    <SiteLink href={href} className={outline ? "pill pill--outline" : "pill"}>
      {label}
      <Arrow out />
      <span className="sr-only"> opens {hostLabel(href)} in a new tab</span>
    </SiteLink>
  );
}

/** The line from the project's own spec on a paper card with a cobalt rule: the quote in Newsreader, then its source and date. */
function PrdCard({ study }: { study: CaseStudy }) {
  const { lead, quote, after, date } = study.prd;
  return (
    <figure className="prd">
      {lead && <p className="prd__around">{lead}</p>}
      <blockquote className="prd__quote">“{quote}”</blockquote>
      {after && <p className="prd__around">{after}</p>}
      <figcaption>{date ? `${caseStudyCopy.fromPrd} · ${date}` : caseStudyCopy.fromPrd}</figcaption>
    </figure>
  );
}
