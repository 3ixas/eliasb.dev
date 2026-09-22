import Image from "next/image";
import Link from "next/link";
import type { CaseStudy } from "@/content/case-studies";
import { featuredProjects } from "@/content/site";
import type { HomepageProject } from "@/content/site";

export type WorkArchiveCardProps = Pick<
  CaseStudy,
  "slug" | "index" | "name" | "kind" | "headline" | "hero"
>;

function caseStudyHref(project: HomepageProject) {
  return `/work/${project.slug}`;
}

function ProjectLinks({ project }: { project: HomepageProject }) {
  return (
    <div className="project-links">
      <Link href={caseStudyHref(project)}>
        Read case study <span className="arrow-mark" aria-hidden="true">→</span>
      </Link>
      {project.liveUrl && (
        <a href={project.liveUrl} target="_blank" rel="noreferrer">
          Open project <span className="arrow-mark" aria-hidden="true">↗︎</span>
        </a>
      )}
      <a href={project.codeUrl} target="_blank" rel="noreferrer">
        View code <span className="arrow-mark" aria-hidden="true">↗︎</span>
      </a>
    </div>
  );
}

function LeadProject({ project }: { project: HomepageProject }) {
  return (
    <article className="project-feature">
      <Link
        className="project-visual"
        href={caseStudyHref(project)}
        aria-label={`${project.index} — Read the ${project.name} case study`}
      >
        <Image
          src={project.image}
          alt={project.imageAlt}
          width={project.imageWidth}
          height={project.imageHeight}
          sizes="(max-width: 800px) calc(100vw - 56px), 65vw"
          priority
        />
        <span className="project-index">{project.index}</span>
      </Link>
      <div className="project-copy">
        <p className="project-type">{project.eyebrow}</p>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        {project.qualities && (
          <ul aria-label={`${project.name} qualities`}>
            {project.qualities.map((quality) => <li key={quality}>{quality}</li>)}
          </ul>
        )}
        <ProjectLinks project={project} />
      </div>
    </article>
  );
}

function RailProject({ project }: { project: HomepageProject }) {
  return (
    <article>
      <span>{project.index}</span>
      <Image
        src={project.image}
        alt={project.imageAlt}
        width={project.imageWidth}
        height={project.imageHeight}
        sizes="(max-width: 800px) calc(100vw - 68px), 40vw"
      />
      <div>
        <p>{project.eyebrow}</p>
        <h3>{project.name}</h3>
      </div>
      <p>{project.detail ?? project.description}</p>
      <div className="rail-links">
        <Link href={caseStudyHref(project)}>
          Read case study <span className="arrow-mark" aria-hidden="true">→</span>
        </Link>
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            Visit <span className="arrow-mark" aria-hidden="true">↗︎</span>
          </a>
        )}
        <a href={project.codeUrl} target="_blank" rel="noreferrer">
          Code <span className="arrow-mark" aria-hidden="true">↗︎</span>
        </a>
      </div>
    </article>
  );
}

export function WorkArchiveCard({ study }: { study: WorkArchiveCardProps }) {
  return (
    <li className={`work-index-card work-card-${study.slug}`}>
      <Link href={`/work/${study.slug}`}>
        <span className="work-card-number">{study.index}</span>
        <div className="work-card-copy">
          <p>{study.kind}</p>
          <h2>{study.name}</h2>
          <span>{study.headline}</span>
        </div>
        <Image
          src={study.hero.src}
          alt={study.hero.alt}
          width={study.hero.width}
          height={study.hero.height}
          sizes="(max-width: 800px) calc(100vw - 56px), 55vw"
        />
        <span className="work-card-arrow">Read case study <span className="arrow-mark" aria-hidden="true">↗︎</span></span>
      </Link>
    </li>
  );
}

export function FeaturedWork() {
  const [lead, ...rail] = featuredProjects;

  return (
    <section className="work-section" id="work" aria-labelledby="work-title">
      <div className="section-heading">
        <p>01 / Featured work</p>
        <h2 id="work-title">
          A few projects I want to put <em>first.</em>
        </h2>
      </div>
      {lead && <LeadProject project={lead} />}
      {rail.length > 0 && (
        <div className="project-rail" role="region" aria-label="More featured work">
          {rail.map((project) => <RailProject key={project.slug} project={project} />)}
        </div>
      )}
      <Link className="section-link" href="/work">
        View all work <span className="arrow-mark" aria-hidden="true">↗︎</span>
      </Link>
    </section>
  );
}
