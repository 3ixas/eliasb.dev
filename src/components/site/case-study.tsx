import Image from "next/image";
import Link from "next/link";
import {
  Arrowed,
  StoryEvidence,
  StoryNext,
  StoryOpening,
  StorySection,
  StorySectionLinks,
  storyColours,
} from "@/components/site/story";
import { SiteFooter } from "@/components/site/site-footer";
import { SubpageHeader } from "@/components/site/subpage-header";
import { bindDots } from "@/components/site/bind-dots";
import { projects, type Project } from "@/content/projects";
import { caseStudies } from "@/content/stretch/case-studies";
import {
  caseStudyCopy,
  caseStudyOpening,
  caseStudySectionKeys,
  caseStudySectionLabels,
  type CaseStudy,
  type CaseStudyOpening,
  type CaseStudySectionKey,
} from "@/content/stretch/case-study";
import { Fastener } from "@/components/site/fastener";

/**
 * A case study (docs/specs/STRETCH-REDESIGN-SPEC.md, "Case studies and the
 * archive"): an opening band in the project's colour, a row of section links,
 * a neutral reading column about 720 px wide with the six sections in their
 * fixed order, wide figures framed in the project's colour, the PRD card with
 * the evidence strip, and the Next-project tile. It has no entrance and the
 * server renders all of it, so it is readable from the first frame. The only
 * cobalt on the page is the focus ring and selection; the spec keeps the
 * accent for Say hello.
 */
export function CaseStudyPage({ study }: { study: CaseStudy }) {
  const opening = caseStudyOpening(study, projects);
  const next = nextProject(study);

  return (
    <div data-stretch-shell data-case-study={study.slug}>
      <SubpageHeader />

      <main id="main-content" tabIndex={-1}>
        <article aria-labelledby="case-study-title">
          <Opening opening={opening} />
          <StorySectionLinks sections={caseStudySections} />
          <div className="stretch-cs-body stretch-wrap">
            {caseStudySectionKeys.map((key, position) => (
              <CaseStudySectionBlock key={key} study={study} sectionKey={key} position={position} colours={opening.colours} />
            ))}
          </div>
        </article>
        <NextProject next={next} />
      </main>

      <SiteFooter />
    </div>
  );
}

function nextProject(study: CaseStudy): { project: Project; colours: CaseStudyOpening["colours"]; number: string } {
  const project = projects.find((entry) => entry.slug === study.next);
  if (!project?.colours) throw new Error(`Case study "${study.slug}" ends with "${study.next}", which needs a project with colours.`);
  return { project, colours: project.colours, number: caseStudies[study.next].number };
}

function Opening({ opening }: { opening: CaseStudyOpening }) {
  const { links, screenshot } = opening;
  return (
    <StoryOpening
      colours={opening.colours}
      back={
        <Link className="stretch-cs-back" href="/things-i-make">
          <Arrowed label={caseStudyCopy.back} />
        </Link>
      }
      number={opening.number}
      titleId="case-study-title"
      name={opening.name}
      lead={opening.outcome}
      aside={
        <div className="stretch-cs-open__shot">
          <Image
            src={screenshot.src}
            alt={screenshot.alt}
            width={screenshot.width}
            height={screenshot.height}
            sizes="(max-width: 760px) calc(100vw - 32px), 640px"
            preload
          />
        </div>
      }
    >
      <p className="stretch-mono stretch-cs-open__meta">{bindDots(opening.metadata)}</p>
      <p className="stretch-mono stretch-cs-open__meta">{opening.stack}</p>
      <div className="stretch-cs-links">
        {links.live && (
          <a className="stretch-cs-button stretch-cs-button--solid" href={links.live} target="_blank" rel="noreferrer">
            <Arrowed label={caseStudyCopy.live} />
          </a>
        )}
        {links.code && (
          <a className="stretch-cs-button" href={links.code} target="_blank" rel="noreferrer">
            <Arrowed label={caseStudyCopy.code} />
          </a>
        )}
      </div>
      {opening.note && <p className="stretch-cs-open__note">{opening.note}</p>}
    </StoryOpening>
  );
}

const caseStudySections = caseStudySectionKeys.map((key) => ({ key, label: caseStudySectionLabels[key] }));

function CaseStudySectionBlock({
  study,
  sectionKey,
  position,
  colours,
}: {
  study: CaseStudy;
  sectionKey: CaseStudySectionKey;
  position: number;
  colours: CaseStudyOpening["colours"];
}) {
  const section = study.sections[sectionKey];

  return (
    <StorySection id={sectionKey} label={caseStudySectionLabels[sectionKey]} position={position} section={section}>
      {sectionKey === "written-down-first" && <Prd study={study} />}

      {section.figure && (
        <figure className="stretch-cs-figure" style={storyColours(colours)}>
          <div className="stretch-cs-figure__frame">
            <Image
              src={section.figure.src}
              alt={section.figure.alt}
              width={section.figure.width}
              height={section.figure.height}
              sizes="(max-width: 760px) calc(100vw - 32px), 1000px"
            />
          </div>
          <figcaption className="stretch-mono">{section.figure.caption}</figcaption>
        </figure>
      )}
    </StorySection>
  );
}

/** The line from the project's own spec, then the figures from its own records. */
function Prd({ study }: { study: CaseStudy }) {
  const { prd, evidence } = study;
  return (
    <div className="stretch-cs-prd-group">
      <figure className="stretch-prd stretch-cs-prd">
        <Fastener kind="tape" />
        {prd.lead && <p className="stretch-cs-prd__around">{prd.lead}</p>}
        <blockquote className="stretch-prd__quote">{prd.quote}</blockquote>
        {prd.after && <p className="stretch-cs-prd__around">{prd.after}</p>}
        {prd.date && <figcaption className="stretch-mono stretch-prd__caption">The spec, {prd.date}</figcaption>}
      </figure>
      {evidence.length > 0 && <StoryEvidence evidence={evidence} />}
    </div>
  );
}

function NextProject({ next }: { next: ReturnType<typeof nextProject> }) {
  const { project, colours } = next;
  const { screenshot, fastener } = project;
  if (!screenshot) throw new Error(`Case study "${project.slug}" is a next project, so it needs a screenshot.`);
  return (
    <StoryNext
      label={caseStudyCopy.nextProject}
      href={`/things-i-make/${project.slug}`}
      colours={colours}
      number={next.number}
      name={project.name}
      outcome={project.outcome}
      media={{ screenshot, fastener }}
    />
  );
}
