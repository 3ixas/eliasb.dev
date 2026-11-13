import type { CSSProperties } from "react";
import { OnView } from "@/components/parts/on-view";
import { Panel } from "@/components/parts/panel";
import { shownSource, work } from "@/content/stretch/work";

/**
 * Where I'm headed (DESIGN.md "The homepage, in order" 4, R-16): its own section, one paper panel with the title and lead
 * at the left and three parts at the right. Each part starts from a chip naming where its evidence comes from, in that
 * source's colour, then its heading and its one line. No destination label and no job title.
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
