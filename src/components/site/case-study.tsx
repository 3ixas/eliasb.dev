import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { SubpageHeader } from "@/components/site/subpage-header";
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
import { siteCopy } from "@/content/stretch/site-copy";

const number = (position: number) => String(position + 1).padStart(2, "0");

/** "Live site ↗" as a visible label and a decorative arrow: the link's name is the words. */
function Arrowed({ label }: { label: string }) {
  const arrow = label.match(/^(?:([←↗]) )?(.*?)(?: ([←↗]))?$/);
  const [, before, words, after] = arrow ?? [];
  return (
    <>
      {before && <span aria-hidden="true">{before} </span>}
      {words}
      {after && <span aria-hidden="true"> {after}</span>}
    </>
  );
}

/** The project's own colours arrive as --cs-* on the element that owns them. */
const projectColours = ({ field, ink, swatch }: CaseStudyOpening["colours"]) =>
  ({ "--cs-field": field, "--cs-ink": ink, "--cs-swatch": swatch }) as CSSProperties;

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
          <SectionLinks />
          <div className="stretch-cs-body stretch-wrap">
            {caseStudySectionKeys.map((key, position) => (
              <Section key={key} study={study} sectionKey={key} position={position} colours={opening.colours} />
            ))}
          </div>
        </article>
        <NextProject next={next} />
      </main>

      <footer className="stretch-wrap stretch-footer">
        <p className="stretch-mono">{siteCopy.footer}</p>
      </footer>
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
    <section className="stretch-cs-open" style={projectColours(opening.colours)} aria-label="Overview">
      <div className="stretch-wrap stretch-cs-open__inner">
        <Link className="stretch-cs-back" href="/work">
          <Arrowed label={caseStudyCopy.back} />
        </Link>
        <div className="stretch-cs-open__text">
          <p className="stretch-display stretch-cs-open__number" aria-hidden="true">
            {opening.number}
          </p>
          <h1 id="case-study-title" className="stretch-display stretch-cs-open__name">
            {opening.name}
          </h1>
          <p className="stretch-cs-open__outcome">{opening.outcome}</p>
          <p className="stretch-mono stretch-cs-open__meta">{opening.metadata}</p>
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
        </div>
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
      </div>
    </section>
  );
}

function SectionLinks() {
  return (
    <nav aria-label="Sections" className="stretch-cs-links-row">
      <ul className="stretch-wrap">
        {caseStudySectionKeys.map((key, position) => (
          <li key={key}>
            <a href={`#${key}`}>
              <span className="stretch-mono" aria-hidden="true">
                {number(position)}
              </span>{" "}
              {caseStudySectionLabels[key]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Section({
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
  const label = caseStudySectionLabels[sectionKey];
  // The bold line is the heading; a section without one is headed by its label.
  const heading = section.heading ?? label;
  const titleId = `${sectionKey}-title`;

  return (
    <section id={sectionKey} aria-labelledby={titleId} className="stretch-cs-section">
      <div className="stretch-cs-section__text">
        {section.heading && (
          <p className="stretch-mono stretch-cs-kicker" aria-hidden="true">
            {number(position)} · {label}
          </p>
        )}
        <h2 id={titleId} className="stretch-cs-h2">
          {heading}
        </h2>
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph} className="stretch-cs-p">
            {paragraph}
          </p>
        ))}
        {section.points && (
          <ul className="stretch-cs-points">
            {section.points.map((point) => (
              <li key={point.lead}>
                <span className="stretch-cs-lead">{point.lead}</span> {point.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      {sectionKey === "written-down-first" && <Prd study={study} />}

      {section.figure && (
        <figure className="stretch-cs-figure" style={projectColours(colours)}>
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
    </section>
  );
}

/** The line from the project's own spec, then the figures from its own records. */
function Prd({ study }: { study: CaseStudy }) {
  const { prd, evidence } = study;
  return (
    <div className="stretch-cs-prd-group">
      <figure className="stretch-prd stretch-cs-prd">
        <span className="stretch-fastener stretch-fastener--tape" aria-hidden="true" />
        {prd.lead && <p className="stretch-cs-prd__around">{prd.lead}</p>}
        <blockquote className="stretch-prd__quote">{prd.quote}</blockquote>
        {prd.after && <p className="stretch-cs-prd__around">{prd.after}</p>}
        {prd.date && <figcaption className="stretch-mono stretch-prd__caption">The spec, {prd.date}</figcaption>}
      </figure>
      {evidence.length > 0 && (
        <ul className="stretch-cs-evidence" aria-label="Evidence">
          {evidence.map(({ value, label }) => (
            <li key={label}>
              <span className="stretch-display stretch-cs-evidence__value">{value}</span>
              <span className="stretch-mono stretch-cs-evidence__label">{label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NextProject({ next }: { next: ReturnType<typeof nextProject> }) {
  const { project, colours } = next;
  return (
    <section className="stretch-wrap stretch-cs-next" aria-label={caseStudyCopy.nextProject}>
      <Link className="stretch-cs-next__tile" href={`/work/${project.slug}`} style={projectColours(colours)}>
        <span className="stretch-mono stretch-cs-next__label">{caseStudyCopy.nextProject}</span>
        <span className="stretch-display stretch-cs-next__number" aria-hidden="true">
          {next.number}
        </span>
        <span className="stretch-cs-next__name">{project.name}</span>
        <span className="stretch-cs-next__outcome">{project.outcome}</span>
        <span className="stretch-cs-next__arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </section>
  );
}
