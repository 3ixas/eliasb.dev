import { sectionLabel } from "@/components/site/sections";
import { Hero } from "@/components/site/hero";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteHeader } from "@/components/site/site-header";
import { FeaturedTiles } from "@/components/site/featured-tiles";
import { HowIWork } from "@/components/site/how-i-work";
import { OffTheClock } from "@/components/site/off-the-clock";
import { ProjectIndex } from "@/components/site/project-index";
import { featuredProjects, featuredSlugs, projectIndex, projects } from "@/content/projects";
import { careerLog } from "@/content/stretch/career";
import { howIWork } from "@/content/stretch/how-i-work";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { siteCopy, workSection } from "@/content/stretch/site-copy";

/**
 * The Stretch homepage shell: the header, the hero and five anchored sections
 * with their headings, notes and true counts, and the footer. The section
 * bodies are empty until their own tickets fill them.
 */
export function Homepage() {
  return (
    <div data-stretch-shell>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />

        <section id="work" className="stretch-wrap stretch-section" aria-labelledby="work-heading">
          <SectionHeading
            id="work-heading"
            heading={workSection.heading}
            note={workSection.note(projects.length, featuredSlugs.length)}
          />
          <FeaturedTiles projects={featuredProjects(projects, featuredSlugs)} />
          <ProjectIndex
            rows={projectIndex(projects, featuredSlugs)}
            firstNumber={featuredProjects(projects, featuredSlugs).length + 1}
            total={projects.length}
          />
        </section>

        <section id="how-i-work" className="stretch-wrap stretch-section" aria-labelledby="how-i-work-heading">
          <SectionHeading id="how-i-work-heading" heading={howIWork.heading} note={howIWork.note} />
          <HowIWork />
        </section>

        <section id="where-ive-been" className="stretch-wrap stretch-section" aria-labelledby="where-ive-been-heading">
          <SectionHeading id="where-ive-been-heading" heading={careerLog.heading} note={careerLog.note} />
        </section>

        <section id="off-the-clock" className="stretch-wrap stretch-section" aria-labelledby="off-the-clock-heading">
          <SectionHeading id="off-the-clock-heading" heading={offTheClock.heading} note={offTheClock.note} />
          <OffTheClock />
        </section>

        <section id="say-hello" className="stretch-wrap stretch-section" aria-labelledby="say-hello-heading">
          <SectionHeading id="say-hello-heading" heading={sectionLabel["say-hello"]} />
        </section>
      </main>

      <footer className="stretch-wrap stretch-footer">
        <p className="stretch-mono">{siteCopy.footer}</p>
      </footer>
    </div>
  );
}
