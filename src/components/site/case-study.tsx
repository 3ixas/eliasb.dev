import { ProjectObject, projectColours } from "@/components/quiet/project-object";
import { Arrowed, BackLink, LongForm, LongFormOpening, LongFormSectionBlock, NextRow } from "@/components/site/long-form";
import { ZoomableImage } from "@/components/site/zoomable-image";
import { projects } from "@/content/projects";
import {
  caseStudyCopy,
  caseStudyOpening,
  caseStudySectionKeys,
  caseStudySectionLabels,
  type CaseStudy,
  type CaseStudyOpening,
} from "@/content/stretch/case-study";

/**
 * A case study (docs/design/DESIGN.md, "Long-form pages") on the shared template: the header with the six
 * sections as links, a back link to the Work archive, the project as the title with its outcome as the line, its
 * type, year and stack, the links it has, and its landing screenshot on its Project colour. Then the six sections
 * in their fixed order (the PRD as one inline Sheet under "On paper") and one row to the next project. The server
 * renders all of it.
 */
export function CaseStudyPage({ study }: { study: CaseStudy }) {
  const opening = caseStudyOpening(study, projects);
  const next = projects.find(({ slug }) => slug === study.next);
  if (!next) throw new Error(`Case study "${study.slug}" ends with "${study.next}", which is not a project.`);

  return (
    <LongForm
      attrs={{ "data-case-study": study.slug }}
      sections={caseStudySectionKeys.map((key) => ({ id: key, label: caseStudySectionLabels[key] }))}
    >
      <article className="stretch-wrap qi-long" aria-labelledby="case-study-title">
        <div className="qi-column">
          <BackLink href="/things-i-make" label={caseStudyCopy.back} />
          <LongFormOpening titleId="case-study-title" title={opening.name} line={opening.outcome} meta={opening.meta} below={<OpeningBelow opening={opening} />} />
          {caseStudySectionKeys.map((key) => {
            const { heading, paragraphs, points, figure } = study.sections[key];
            return (
              <LongFormSectionBlock key={key} id={key} title={heading ?? caseStudySectionLabels[key]}>
                {paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="qi-long__p">
                    {paragraph}
                  </p>
                ))}
                {points?.map(({ lead, text }) => (
                  <p key={lead} className="qi-long__p">
                    <strong>{lead}</strong> {text}
                  </p>
                ))}
                {key === "written-down-first" && <Sheet study={study} />}
                {figure && (
                  <figure className="qi-figure">
                    <div className="qi-case__shot" style={projectColours(opening)}>
                      <ZoomableImage src={figure.src} alt={figure.alt} width={figure.width} height={figure.height} sizes="(max-width: 760px) calc(100vw - 32px), 560px" />
                    </div>
                    <figcaption className="qi-figure__caption stretch-mono">{figure.caption}</figcaption>
                  </figure>
                )}
              </LongFormSectionBlock>
            );
          })}
          <NextRow label={caseStudyCopy.nextProject} href={`/things-i-make/${next.slug}`} object={<ProjectObject project={next} />} title={next.name} line={next.outcome} />
        </div>
      </article>
    </LongForm>
  );
}

/** The links the project has (a project with no live site or no code shows only the other), the note beside them, and the landing screenshot on the project's colour. */
function OpeningBelow({ opening }: { opening: CaseStudyOpening }) {
  const { links, screenshot, note } = opening;
  return (
    <div className="qi-case__below">
      {(links.live || links.code || note) && (
        <div className="qi-case__links">
          {links.live && (
            <a href={links.live} target="_blank" rel="noreferrer">
              <Arrowed label={caseStudyCopy.live} />
            </a>
          )}
          {links.code && (
            <a href={links.code} target="_blank" rel="noreferrer">
              <Arrowed label={caseStudyCopy.code} />
            </a>
          )}
          {note && <p className="qi-case__note">{note}</p>}
        </div>
      )}
      <div className="qi-case__shot" style={projectColours(opening)}>
        <ZoomableImage src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} sizes="(max-width: 760px) calc(100vw - 32px), 560px" preload />
      </div>
    </div>
  );
}

/** The line from the project's own spec on one inline Sheet, then its figures from its own records as a quiet line. */
function Sheet({ study }: { study: CaseStudy }) {
  const { prd, evidence } = study;
  return (
    <div className="qi-case__sheet">
      <figure>
        {prd.lead && <p className="qi-case__around">{prd.lead}</p>}
        <blockquote className="qi-case__quote">“{prd.quote}”</blockquote>
        {prd.after && <p className="qi-case__around">{prd.after}</p>}
        <figcaption className="qi-figure__caption stretch-mono">
          From the PRD{prd.date && ` · ${prd.date}`}
        </figcaption>
      </figure>
      {evidence.length > 0 && (
        <ul className="qi-case__evidence" aria-label="Evidence">
          {evidence.map(({ value, label }) => (
            <li key={label}>
              <strong>{value}</strong> <span className="stretch-mono">{label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
