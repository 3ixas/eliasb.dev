import { sectionLinks } from "@/components/site/sections";
import { SayHello } from "@/components/site/say-hello";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { FeaturedTiles } from "@/components/site/featured-tiles";
import { HowIWork } from "@/components/site/how-i-work";
import { OffTheClock } from "@/components/site/off-the-clock";
import { ProjectIndex } from "@/components/site/project-index";
import { Opening } from "@/components/quiet/opening";
import { Work } from "@/components/quiet/work";
import { featuredProjects, featuredSlugs, projectIndex, projects } from "@/content/projects";
import { howIWork } from "@/content/stretch/how-i-work";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { thingsIMake } from "@/content/stretch/site-copy";

const sayHelloHeadingId = "say-hello-heading";

/**
 * The Stretch homepage shell: the header, the opening line and five anchored sections
 * (Work first) with their headings, notes and true counts, and the footer. The
 * page is complete from its first frame: nothing is held, faded or played in.
 */
export function Homepage() {
  return (
    <div data-stretch-shell>
      <SiteHeader sections={sectionLinks} />
      <main id="main-content" tabIndex={-1}>
        <Opening />

        <section id="work" className="stretch-wrap stretch-section" aria-labelledby="work-heading">
          <Work />
        </section>

        <section id="things-i-make" className="stretch-wrap stretch-section" aria-labelledby="things-i-make-heading">
          <SectionHeading
            id="things-i-make-heading"
            heading={thingsIMake.heading}
            note={thingsIMake.note(projects.length, featuredSlugs.length)}
          />
          <div className="stretch-intro">
            <p className="stretch-intro__lead">{thingsIMake.intro.lead}</p>
            <p>{thingsIMake.intro.support}</p>
          </div>
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

        <section id="off-the-clock" className="stretch-wrap stretch-section" aria-labelledby="off-the-clock-heading">
          <SectionHeading id="off-the-clock-heading" heading={offTheClock.heading} note={offTheClock.note} />
          <OffTheClock />
        </section>

        <section id="say-hello" className="stretch-wrap stretch-section" aria-labelledby={sayHelloHeadingId}>
          <SayHello headingId={sayHelloHeadingId} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
