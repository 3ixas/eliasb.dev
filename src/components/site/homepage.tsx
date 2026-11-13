import { SiteHeader } from "@/components/site/site-header";
import { OffTheClock } from "@/components/site/off-the-clock";
import { Opening } from "@/components/site/opening";
import { SayHello } from "@/components/site/say-hello";
import { HowIWork } from "@/components/quiet/how-i-work";
import { ThingsIMake } from "@/components/quiet/things-i-make";
import { Work } from "@/components/quiet/work";

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

        <section id="work" className="stretch-wrap stretch-section" aria-labelledby="work-heading">
          <Work />
        </section>

        <section id="things-i-make" className="stretch-wrap stretch-section" aria-labelledby="things-i-make-heading">
          <ThingsIMake />
        </section>

        <section id="how-i-work" className="stretch-wrap stretch-section" aria-labelledby="how-i-work-heading">
          <HowIWork />
        </section>

        <section id="off-the-clock" className="stretch-wrap stretch-section" aria-labelledby="off-the-clock-heading">
          <OffTheClock />
        </section>

        <SayHello />
      </main>
    </div>
  );
}
