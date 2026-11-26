import { PassLight } from "@/components/parts/pass-light";
import { StaffPass } from "@/components/parts/staff-pass";
import { opening, type Run } from "@/content/stretch/opening";
import { siteCopy } from "@/content/stretch/site-copy";

/** A run of the opening line: BNP Paribas takes its green underline and "products of my own." its cobalt; the rest is plain. */
function RunView({ run }: { run: Run }) {
  if (run.mark === "employer") return <span className="opening__employer">{run.text}</span>;
  if (run.mark === "emphasis") return <span className="opening__own">{run.text}</span>;
  return run.text;
}

type MenuItem = (typeof siteCopy.menu)[number];
const menuById = Object.fromEntries(siteCopy.menu.map((item) => [item.id, item])) as Record<MenuItem["id"], MenuItem>;
const workAction = menuById.work;
const sayHelloAction = menuById["say-hello"];

/**
 * The homepage's opening (docs/design/DESIGN.md "The homepage, in order" 2, R-11 and R-44): the opening line as the
 * page's one `h1`, its supporting line, primary actions (`Work` and `Say hello`), and one Staff pass — the current
 * BNP Paribas pass — hanging from the header's hairline at the right (and from a quiet rail hairline beneath the
 * actions under 960 px). Server-rendered in full; script only lets the pass hang in 3D or catch the light.
 */
export function Opening() {
  return (
    <section className="frame opening" aria-labelledby="opening-line">
      <div className="opening__text">
        <h1 id="opening-line" className="opening__line">
          {opening.headlineRuns.map((run, index) => (
            <RunView key={index} run={run} />
          ))}
        </h1>
        <p className="opening__support">{opening.support}</p>
        <div className="opening__actions">
          <a className="pill" href={`#${workAction.id}`}>
            {workAction.label}
          </a>
          <a className="pill pill--outline" href={`#${sayHelloAction.id}`}>
            {sayHelloAction.label}
          </a>
        </div>
      </div>
      <PassLight className="opening__rail">
        {/* Omit priority so the homepage does not preload the portrait in <head> ahead of LCP; the pass is above the fold so the browser still loads it promptly where the printed pass shows (reduced motion, no WebGL, no script). */}
        <StaffPass slug="bnp-paribas" href="#bnp-paribas" lead />
      </PassLight>
    </section>
  );
}
