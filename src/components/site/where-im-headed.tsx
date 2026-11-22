import type { CSSProperties } from "react";
import { DrawnTicks } from "@/components/parts/drawn-ticks";
import { OnView } from "@/components/parts/on-view";
import { Panel } from "@/components/parts/panel";
import { shownSource, work, type HeadedProof } from "@/content/stretch/work";

/**
 * Each part's proof drawn in the language of How I work's proof feet (#459): hidden from assistive technology because
 * its "So far" line already states it, and drawn in its source's thread colour where that holds 3:1, else cobalt.
 */
function Drawn({ proof, colour }: { proof: HeadedProof; colour: string }) {
  return (
    <div className="headed__proof" style={{ "--drawn": colour } as CSSProperties} aria-hidden="true" data-proof={proof.kind}>
      {proof.kind === "split" ? (
        <svg className="headed__split" viewBox="0 0 82 20" width="82" height="20" focusable="false">
          {/* Control variant: dashed outline and muted layout lines, left behind. */}
          <g className="headed__split-off" data-variant="other">
            <rect x="1" y="2" width="24" height="16" rx="3" fill="none" strokeWidth="1.25" strokeDasharray="2.5 2" />
            <rect className="headed__split-bar" x="5" y="6.5" width="11" height="2" rx="1" />
            <rect className="headed__split-bar" x="5" y="11.5" width="15" height="2" rx="1" />
          </g>
          {/* Split divider between the two variants. */}
          <line className="headed__split-rule" x1="31" y1="4" x2="31" y2="16" strokeWidth="1" />
          {/* Chosen variant: solid outline, soft tint, stronger bars, and an arrow showing it went on. */}
          <g className="headed__split-on" data-variant="chosen">
            <rect className="headed__split-box" x="37" y="2" width="24" height="16" rx="3" strokeWidth="1.5" />
            <rect className="headed__split-bar" x="41" y="6.5" width="16" height="2.25" rx="1.125" />
            <rect className="headed__split-bar" x="41" y="11.5" width="10" height="2.25" rx="1.125" />
            <path className="headed__split-arrow" d="M66 10h12m-4-4 4 4-4 4" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      ) : proof.kind === "count" ? (
        <DrawnTicks count={proof.value} />
      ) : (
        <>
          <DrawnTicks count={proof.value} />
          <span className="headed__live-trail">
            <svg className="headed__live-arrow" viewBox="0 0 14 10" width="14" height="10" focusable="false">
              <path d="M1 5h11m-3.5-3.5L12 5 8.5 8.5" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <i className="headed__live" />
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Where I'm headed (DESIGN.md "The homepage, in order" 4, R-16, #459): its own section, one paper panel with the title
 * and lead at the left and three parts at the right. Each part starts from a chip naming where its evidence comes from,
 * in that source's colour, then its heading, its one line, and its drawn proof. No destination label and no job title.
 */
export function WhereImHeaded() {
  const { heading, line, bars } = work.headed;
  return (
    <section className="frame section" aria-labelledby="headed-heading">
      <OnView motion="rise">
        <Panel className="headed">
          <div className="headed__lead">
            <h2 id="headed-heading" className="headed__title">
              {heading}
            </h2>
            <p>{line}</p>
          </div>
          <ol className="headed__parts">
            {bars.map((bar) => {
              const source = shownSource(bar.source);
              return (
                <li key={bar.label}>
                  <span className="chip chip--source" style={{ "--source": source.thread } as CSSProperties}>
                    {source.name}
                  </span>
                  <div>
                    <h3>{bar.title}</h3>
                    <p>{bar.soFar.text}</p>
                    <Drawn proof={bar.drawn} colour={source.drawn} />
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>
      </OnView>
    </section>
  );
}
