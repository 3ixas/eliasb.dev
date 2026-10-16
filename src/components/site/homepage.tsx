import { EntranceGuard, EntrancePlayer } from "@/components/site/entrance-scripts";
import { Hero } from "@/components/site/hero";
import { SayHello } from "@/components/site/say-hello";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteHeader } from "@/components/site/site-header";
import { FeaturedTiles } from "@/components/site/featured-tiles";
import { HowIWork } from "@/components/site/how-i-work";
import { OffTheClock } from "@/components/site/off-the-clock";
import { ProjectIndex } from "@/components/site/project-index";
import { Work } from "@/components/site/work";
import type { HeadedVariant } from "@/components/site/where-im-headed.prototype";
import { WorkPassesPrototype } from "@/components/site/work-passes.prototype";
import { featuredProjects, featuredSlugs, projectIndex, projects } from "@/content/projects";
import { howIWork } from "@/content/stretch/how-i-work";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { siteCopy, thingsIMake } from "@/content/stretch/site-copy";
import { work } from "@/content/stretch/work";

const sayHelloHeadingId = "say-hello-heading";

/**
 * The Stretch homepage shell: the header, the hero and five anchored sections
 * (Work first) with their headings, notes and true counts, and the footer. The signature
 * entrance (entrance.ts) holds all of it for about 4.6 seconds on a fresh
 * load; the server renders the finished page.
 */
export function Homepage({ workVariant }: { workVariant?: HeadedVariant | null }) {
  return (
    <div data-stretch-shell>
      <EntranceGuard />
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />

        <section id="work" className="stretch-wrap stretch-section" data-entrance="rest" aria-labelledby="work-heading">
          <SectionHeading id="work-heading" heading={work.heading} />
          {workVariant === undefined ? <Work /> : <WorkPassesPrototype variant={workVariant} />}
        </section>

        <section id="things-i-make" className="stretch-wrap stretch-section" data-entrance="rest" aria-labelledby="things-i-make-heading">
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

        <section id="how-i-work" className="stretch-wrap stretch-section" data-entrance="rest" aria-labelledby="how-i-work-heading">
          <SectionHeading id="how-i-work-heading" heading={howIWork.heading} note={howIWork.note} />
          <HowIWork />
        </section>

        <section id="off-the-clock" className="stretch-wrap stretch-section" data-entrance="rest" aria-labelledby="off-the-clock-heading">
          <SectionHeading id="off-the-clock-heading" heading={offTheClock.heading} note={offTheClock.note} />
          <OffTheClock />
        </section>

        <section id="say-hello" className="stretch-wrap stretch-section" data-entrance="rest" aria-labelledby={sayHelloHeadingId}>
          <SayHello headingId={sayHelloHeadingId} />
        </section>
      </main>

      <footer className="stretch-wrap stretch-footer" data-entrance="rest">
        <p className="stretch-mono">{siteCopy.footer}</p>
      </footer>
      <EntrancePlayer />
    </div>
  );
}
