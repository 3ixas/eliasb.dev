import Link from "next/link";
import { OnView } from "@/components/parts/on-view";
import { Arrow } from "@/components/parts/panel";
import { ProjectPanel, projectHref } from "@/components/parts/project-panel";
import { hostLabel } from "@/components/site/host-label";
import { isInternalHref, SiteLink } from "@/components/site/site-link";
import { featuredProjects, featuredSlugs, HOMEPAGE_INDEX_ROWS, projectIndex, projects, type Project } from "@/content/projects";
import { caseStudies } from "@/content/stretch/case-studies";
import { thingsIMake } from "@/content/stretch/site-copy";

/** A row's line: the shorter one the homepage gives a project, else its own outcome. */
const rowLine = (project: Project) => thingsIMake.rowOutcomes[project.slug] ?? project.outcome;

/** One of the other projects: its name, line and year, the whole row a link, marked ↗ when it leaves the site. */
function ProjectRow({ project }: { project: Project }) {
  const href = projectHref(project);
  const external = !isInternalHref(href);
  return (
    <li>
      <SiteLink href={href} className="row">
        <span className="row__name">{project.name}</span>
        <span className="row__line">{rowLine(project)}</span>
        <span className="row__meta">
          {project.year}
          {external && (
            <>
              {" "}
              <span className="arrow arrow--out" aria-hidden="true">
                ↗
              </span>
              <span className="sr-only"> opens {hostLabel(href)} in a new tab</span>
            </>
          )}
        </span>
      </SiteLink>
    </li>
  );
}

/**
 * Things I make (DESIGN.md "The homepage, in order" 5, R-17): the first featured project as a wide panel with three of its
 * figures, the other two side by side, then the rest as rows newest first (at most ten), then the archive link with the
 * true count.
 */
export function ThingsIMake() {
  const [wide, ...pair] = featuredProjects(projects, featuredSlugs);
  const others = projectIndex(projects, featuredSlugs).slice(0, HOMEPAGE_INDEX_ROWS);
  const study = wide && caseStudies[wide.slug as keyof typeof caseStudies];
  const figures = study ? thingsIMake.wideFigures.map((index) => study.evidence[index]).filter(Boolean) : [];
  return (
    <section id="things-i-make" className="frame section things" aria-labelledby="things-i-make-heading">
      <h2 id="things-i-make-heading" className="section__title">
        {thingsIMake.heading}
      </h2>
      <div className="panels">
        {wide && (
          <OnView motion="rise">
            <ProjectPanel project={wide} line={rowLine(wide)} wide figures={figures} />
          </OnView>
        )}
        {pair.length > 0 && (
          <div className="panels panels--two">
            {pair.map((project) => (
              <OnView key={project.slug} motion="rise" className="things__arrival">
                <ProjectPanel project={project} line={rowLine(project)} />
              </OnView>
            ))}
          </div>
        )}
      </div>
      {others.length > 0 && (
        <ul className="rows things__rows">
          {others.map((project) => (
            <ProjectRow key={project.slug} project={project} />
          ))}
        </ul>
      )}
      <Link className="text-link things__all" href="/things-i-make">
        {thingsIMake.allThings(projects.length)}
        <Arrow />
      </Link>
    </section>
  );
}
