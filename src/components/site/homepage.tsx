import { EntranceGuard, EntrancePlayer } from "@/components/site/entrance-scripts";
import { sectionLabel } from "@/components/site/sections";
import { CareerRuler } from "@/components/site/career-ruler";
import { Hero } from "@/components/site/hero";
import { SayHello } from "@/components/site/say-hello";
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
 * with their headings, notes and true counts, and the footer. The signature
 * entrance (entrance.ts) holds all of it for about five seconds on a fresh
 * load; the server renders the finished page.
 */
export function Homepage() {
  return (
    <div data-stretch-shell>
      <EntranceGuard />
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />

        <section id="work" className="stretch-wrap stretch-section" data-entrance="rest" aria-labelledby="work-heading">
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

        <section id="how-i-work" className="stretch-wrap stretch-section" data-entrance="rest" aria-labelledby="how-i-work-heading">
          <SectionHeading id="how-i-work-heading" heading={howIWork.heading} note={howIWork.note} />
          <HowIWork />
        </section>

        <section id="where-ive-been" className="stretch-wrap stretch-section" data-entrance="rest" aria-labelledby="where-ive-been-heading">
          <SectionHeading id="where-ive-been-heading" heading={careerLog.heading} note={careerLog.note} />
          <CareerRuler />
        </section>

        <section id="off-the-clock" className="stretch-wrap stretch-section" data-entrance="rest" aria-labelledby="off-the-clock-heading">
          <SectionHeading id="off-the-clock-heading" heading={offTheClock.heading} note={offTheClock.note} />
          <OffTheClock />
        </section>

        <section id="say-hello" className="stretch-wrap stretch-section" data-entrance="rest" aria-labelledby="say-hello-heading">
          <SectionHeading id="say-hello-heading" heading={sectionLabel["say-hello"]} />
          <SayHello />
        </section>
      </main>

      <footer className="stretch-wrap stretch-footer" data-entrance="rest">
        <p className="stretch-mono">{siteCopy.footer}</p>
      </footer>
      <EntrancePlayer />
    </div>
  );
}
