import { SiteHeader } from "@/components/site/site-header";
import { OffTheClock } from "@/components/site/off-the-clock";
import { Opening } from "@/components/site/opening";
import { SayHello } from "@/components/site/say-hello";
import { HowIWork } from "@/components/site/how-i-work";
import { WhereImHeaded } from "@/components/site/where-im-headed";
import { ThingsIMake } from "@/components/site/things-i-make";
import { Work } from "@/components/site/work";

/**
 * The Stretch homepage shell: the header, the opening line and five anchored sections
 * (Work first) with their headings, notes and true counts. The page ends on Say hello: no footer. The
 * page is complete from its first frame: nothing is held, faded or played in.
 */
export function Homepage() {
  return (
    <div data-stretch-shell>
      <SiteHeader home />
      <main id="main-content" tabIndex={-1}>
        <Opening />

        <Work />
        <WhereImHeaded />

        <ThingsIMake />

        <HowIWork />

        <section id="off-the-clock" className="stretch-wrap stretch-section" aria-labelledby="off-the-clock-heading">
          <OffTheClock />
        </section>

        <SayHello />
      </main>
    </div>
  );
}
