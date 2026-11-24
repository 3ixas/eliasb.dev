import { SiteHeader } from "@/components/site/site-header";
import { OffTheClock } from "@/components/site/off-the-clock";
import { Opening } from "@/components/site/opening";
import { SayHello } from "@/components/site/say-hello";
import { HowIWork } from "@/components/site/how-i-work";
import { WhereImHeaded } from "@/components/site/where-im-headed";
import { ThingsIMake } from "@/components/site/things-i-make";
import { Work } from "@/components/site/work";

/**
 * The homepage shell (DESIGN.md "The homepage, in order"): header, opening, Work, Things I make, the full-bleed
 * `--band` section holding Where I'm headed and How I work, Off the clock, and Say hello. No footer; complete from its
 * first frame.
 */
export function Homepage() {
  return (
    <div data-site>
      <SiteHeader home />
      <main id="main-content" tabIndex={-1}>
        <Opening />

        <Work />

        <ThingsIMake />

        <section className="headed-how-band">
          <div className="frame">
            <WhereImHeaded />
            <HowIWork />
          </div>
        </section>

        <OffTheClock />

        <SayHello />
      </main>
    </div>
  );
}
