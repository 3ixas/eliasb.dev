import { Panel } from "@/components/parts/panel";
import { projectPanelTransition, projectTitleTransition, titleLinkTypes, TitleTransition } from "@/components/parts/title-transition";
import { WorkingFigure } from "@/components/parts/working-figure";
import { LongForm } from "@/components/site/long-form";
import { OutLink } from "@/components/site/site-link";
import { EvidenceFigures, NextPanel, StoryBack, StoryChapters, StoryImage, StorySection, StoryText } from "@/components/site/story-parts";
import { ArgusProvenanceView } from "@/components/site/argus-provenance";
import { ArgusProvenanceIsland } from "@/components/site/argus-provenance-island";
import { FlowtimeBreakView } from "@/components/site/flowtime-break";
import { FlowtimeBreakIsland } from "@/components/site/flowtime-break-island";
import { ThresholdLinkView } from "@/components/site/threshold-link";
import { ThresholdLinkIsland } from "@/components/site/threshold-link-island";
import { ZoomableImage } from "@/components/site/zoomable-image";
import { projects, type Project } from "@/content/projects";
import { caseStudyCopy, caseStudySectionKeys, caseStudySectionLabels, type CaseStudy, type CaseStudySection } from "@/content/stretch/case-study";
import type { PanelColours } from "@/content/stretch/story";
import { argusPositions, argusProvenanceCopy } from "@/content/stretch/argus-provenance";
import { flowtimeBreakCopy, focusRange } from "@/content/stretch/flowtime-break";
import { thresholdLinkCopy, thresholdStart } from "@/content/stretch/threshold-link";

/**
 * A case study (GLOSSARY.md; DESIGN.md "Long-form pages", R-22, R-54): a lifted open-ground header holding "← Things I
 * make", the name as the `h1`, the outcome lede, the stack as chips, Live site and Code actions, and four bordered
 * evidence cards; directly beneath, a full-width project-colour exhibition stage holding the whole uncropped screenshot
 * in a concentric optical bezel (zoomable into the lightbox); then the shared sticky chapter rail beside the six
 * sections, structured Decision cards, working figures and PRD card; then the next project panel and Say hello.
 */
export function CaseStudyPage({ study }: { study: CaseStudy }) {
  const project = projectFor(study.slug);
  const next = projectFor(study.next);
  const chapters = caseStudySectionKeys.map((key) => ({ id: key, title: caseStudySectionLabels[key] }));

  return (
    <LongForm attrs={{ "data-case-study": study.slug }}>
      <article className="frame story" aria-labelledby="case-study-title">
        <CaseHeader study={study} project={project} />
        <CaseStage project={project} />
        <StoryChapters items={chapters} label="Case study sections">
          {caseStudySectionKeys.map((key) => {
            const { heading, figure, working, ...body } = study.sections[key];
            return (
              <StorySection key={key} id={key} title={heading ?? caseStudySectionLabels[key]}>
                <StoryText body={body} />
                {key === "written-down-first" && <PrdCard study={study} />}
                {(figure || working) && <SectionFigure figure={figure} working={working} colours={project.panel} />}
              </StorySection>
            );
          })}
        </StoryChapters>
      </article>
      <NextPanel label={caseStudyCopy.nextProject} href={`/things-i-make/${next.slug}`} name={next.name} line={next.outcome} colours={next.panel!} transition={projectPanelTransition(next.slug)} />
    </LongForm>
  );
}

/** The working figures, each drawn at its start for the server and taken over by its island (#462). */
const workingFigures = {
  "threshold-link": {
    caption: thresholdLinkCopy.caption,
    drawn: (
      <ThresholdLinkIsland>
        <ThresholdLinkView choice={thresholdStart} />
      </ThresholdLinkIsland>
    ),
  },
  "argus-provenance": {
    caption: argusProvenanceCopy.caption,
    drawn: (
      <ArgusProvenanceIsland>
        <ArgusProvenanceView positions={argusPositions} />
      </ArgusProvenanceIsland>
    ),
  },
  "flowtime-break": {
    caption: flowtimeBreakCopy.caption,
    drawn: (
      <FlowtimeBreakIsland>
        <FlowtimeBreakView focus={focusRange.start} />
      </FlowtimeBreakIsland>
    ),
  },
} as const;

/**
 * A section's screenshot, or the working figure that takes its place with the screenshot kept for a visitor without
 * script. A working figure with no screenshot behind it (Flowtime's break) is its own still, drawn at its start.
 */
function SectionFigure({ figure, working, colours }: Pick<CaseStudySection, "figure" | "working"> & { colours: PanelColours }) {
  const still = figure && <StoryImage src={figure.src} alt={figure.alt} width={figure.width} height={figure.height} caption={figure.caption} />;
  if (!working) return still;
  const { caption, drawn } = workingFigures[working];
  return (
    <WorkingFigure caption={caption} colours={colours} still={still}>
      {drawn}
    </WorkingFigure>
  );
}

/** A case study's project: the catalogue holds its name, links, screenshot and panel colours (`assertCatalogue` checks them). */
function projectFor(slug: string): Project & Required<Pick<Project, "panel" | "screenshot">> {
  const project = projects.find((entry) => entry.slug === slug);
  if (!project?.panel || !project.screenshot) throw new Error(`Case study "${slug}" needs its project's panel and screenshot.`);
  return project as Project & Required<Pick<Project, "panel" | "screenshot">>;
}

/** The open-ground header (R-54): back link, h1, outcome lede, stack chips, Live site / Code actions, and four bordered evidence cards. */
function CaseHeader({ study, project }: { study: CaseStudy; project: ReturnType<typeof projectFor> }) {
  const { links } = project;
  const titleName = projectTitleTransition(study.slug);
  return (
    <header className="case-header">
      <StoryBack href="/things-i-make" label={caseStudyCopy.back} transitionTypes={titleLinkTypes(titleName)} />
      <TitleTransition name={titleName}>
        <h1 id="case-study-title" className="case-header__title">
          {project.name}
        </h1>
      </TitleTransition>
      <p className="case-header__lede">{study.description}</p>
      <ul className="chips case-header__stack" aria-label="Stack">
        {study.stack.map((item) => (
          <li key={item} className="chip">
            {item}
          </li>
        ))}
      </ul>
      {(links.live || links.code || study.note) && (
        <div className="case-header__links">
          {links.live && <OutLink href={links.live} label={caseStudyCopy.live} className="pill" />}
          {links.code && <OutLink href={links.code} label={caseStudyCopy.code} className="pill pill--outline" />}
          {study.note && <p className="case-header__note">{study.note}</p>}
        </div>
      )}
      <EvidenceFigures evidence={study.evidence} />
    </header>
  );
}

/** Full-width project-colour exhibition stage holding the whole uncropped screenshot in an optical bezel (R-54). */
function CaseStage({ project }: { project: ReturnType<typeof projectFor> }) {
  const { screenshot } = project;
  return (
    <Panel as="div" colours={project.panel} className="case-stage">
      <div className="optical-bezel case-stage__bezel">
        <ZoomableImage
          src={screenshot.src}
          alt={screenshot.alt}
          width={screenshot.width}
          height={screenshot.height}
          sizes="(min-width: 1260px) 1080px, (min-width: 720px) 90vw, 94vw"
          preload
        />
      </div>
    </Panel>
  );
}

/** The line from the project's own spec on a paper card: the quote in Newsreader, its opening mark hanging in cobalt, then its source and date. */
function PrdCard({ study }: { study: CaseStudy }) {
  const { lead, quote, after, date } = study.prd;
  return (
    <figure className="prd surface surface--paper">
      {lead && <p className="prd__around">{lead}</p>}
      <blockquote className="prd__quote">
        <span className="prd__mark">“</span>
        {quote}”
      </blockquote>
      {after && <p className="prd__around">{after}</p>}
      <figcaption>{date ? `${caseStudyCopy.fromPrd} · ${date}` : caseStudyCopy.fromPrd}</figcaption>
    </figure>
  );
}
