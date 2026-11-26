import type { CSSProperties } from "react";
import { OnView } from "@/components/parts/on-view";
import { Panel } from "@/components/parts/panel";
import { HeadedDrawn } from "@/components/site/headed-drawn";
import { shownSource, work, type HeadedBar } from "@/content/stretch/work";

/**
 * Where I'm headed (DESIGN.md "The homepage, in order" 5, R-16, R-48, #459): sits inside the shared full-bleed `--band`
 * section as an asymmetric 4 / 7 bordered paper panel with the title and lead at the left and three parts at the right.
 * Each part starts from a chip naming where its evidence comes from, in that source's colour, then its heading, its one
 * line, and its drawn proof. No destination label and no job title.
 */
export function WhereImHeaded({ bars = work.headed.bars }: { /** The worst-case fixture passes its own. */ bars?: readonly HeadedBar[] }) {
  const { heading, line } = work.headed;
  return (
    <section aria-labelledby="headed-heading">
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
                    <HeadedDrawn proof={bar.drawn} colour={source.drawn} />
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
