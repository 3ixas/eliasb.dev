import { PassLight } from "@/components/parts/pass-light";
import { StaffPass } from "@/components/parts/staff-pass";
import { opening, type Run } from "@/content/stretch/opening";

/** A run of the opening line: BNP Paribas takes its green underline and "products of my own." its cobalt; the rest is plain. */
function RunView({ run }: { run: Run }) {
  if (run.mark === "employer") return <span className="opening__employer">{run.text}</span>;
  if (run.mark === "emphasis") return <span className="opening__own">{run.text}</span>;
  return run.text;
}

/**
 * The homepage's opening (docs/design/DESIGN.md "The homepage, in order" 2, R-11): the opening line as the page's one
 * `h1` and its supporting line, beside the three employers' staff passes, BNP Paribas first and largest. Each pass
 * links to its employer in Work. Server-rendered in full; script only lets the passes catch the light.
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
      </div>
      <PassLight className="opening__rail">
        <StaffPass slug="bnp-paribas" href="#bnp-paribas" lead priority />
        <StaffPass slug="joveen" href="#joveen" drop={0.7} />
        <StaffPass slug="optegra" href="#optegra" drop={0.85} />
      </PassLight>
    </section>
  );
}
