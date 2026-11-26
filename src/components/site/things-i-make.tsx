import Image from "next/image";
import Link from "next/link";
import { OnView } from "@/components/parts/on-view";
import { Arrow, OUT } from "@/components/parts/panel";
import { ProjectPanel, projectHref } from "@/components/parts/project-panel";
import { hostLabel } from "@/components/site/host-label";
import { isInternalHref, SiteLink } from "@/components/site/site-link";
import { ThresholdCitySwitcher, type ThresholdCityPreview } from "@/components/site/threshold-city-switcher";
import { featuredProjects, featuredSlugs, HOMEPAGE_INDEX_ROWS, projectIndex, projects, type Project } from "@/content/projects";
import { thingsIMake } from "@/content/stretch/site-copy";
import { thresholdCities, thresholdCityChoice, thresholdDisplayLink, thresholdLink, thresholdLinkCopy, thresholdStart } from "@/content/stretch/threshold-link";

/** A row's line: the shorter one the homepage gives a project, else its own outcome. */
const rowOutcomes: Readonly<Partial<Record<string, string>>> = thingsIMake.rowOutcomes;
const rowLine = (project: Project) => rowOutcomes[project.slug] ?? project.outcome;

/** Canonical Threshold URLs for each city, serialized once on the server so the client switcher stays tiny. */
const thresholdCityPreviews = thresholdCities.map(({ id, name }) => {
  const choice = thresholdCityChoice(id);
  const href = thresholdLink(choice);
  return {
    id,
    name,
    href,
    displayUrl: thresholdDisplayLink(choice),
    host: hostLabel(href),
  };
}) as [ThresholdCityPreview, ...ThresholdCityPreview[]];

/** One of the other projects: bordered paper strip with a visible 60 × 40 px thumbnail, name, line and year, marked ↗ when it leaves the site. */
export function ProjectRow({ project }: { project: Project }) {
  const href = projectHref(project);
  const external = !isInternalHref(href);
  return (
    <li>
      <SiteLink href={href} className="row">
        {project.screenshot && (
          <span className="row__thumb" aria-hidden="true">
            <Image src={project.screenshot.src} alt="" width={120} height={80} sizes="60px" />
          </span>
        )}
        <span className="row__name">{project.name}</span>
        <span className="row__line">{rowLine(project)}</span>
        <span className="row__meta">
          {project.year}
          {external && (
            <>
              {" "}
              <span className="arrow arrow--out" aria-hidden="true">
                {OUT}
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
 * Things I make (DESIGN.md "The homepage, in order" 4, R-17, R-46, R-47): Threshold wide with its inline city URL
 * switcher and concentric optical bezel, Argus Risk and Flowtime side by side, then the secondary projects as bordered
 * paper strips with visible 60 × 40 px thumbnails newest first (at most ten), then the archive link with the true count.
 */
export function ThingsIMake() {
  const [wide, ...pair] = featuredProjects(projects, featuredSlugs);
  const others = projectIndex(projects, featuredSlugs).slice(0, HOMEPAGE_INDEX_ROWS);
  return (
    <section id="things-i-make" className="frame section things" aria-labelledby="things-i-make-heading">
      <div className="section__head">
        <h2 id="things-i-make-heading" className="section__title">
          {thingsIMake.heading}
        </h2>
        <p className="section__note">{thingsIMake.note}</p>
      </div>
      <div className="panels">
        {wide && (
          <OnView motion="rise">
            <ProjectPanel
              project={wide}
              line={rowLine(wide)}
              wide
              titleTransition
              controls={<ThresholdCitySwitcher cities={thresholdCityPreviews} initialCity={thresholdStart.city} label={thresholdLinkCopy.city} />}
            />
          </OnView>
        )}
        {pair.length > 0 && (
          <div className="panels panels--two panels--level">
            {pair.map((project) => (
              <OnView key={project.slug} motion="rise">
                <ProjectPanel project={project} line={rowLine(project)} titleTransition />
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
