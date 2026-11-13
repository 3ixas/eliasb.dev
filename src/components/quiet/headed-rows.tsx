import type { CSSProperties } from "react";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { Row } from "@/components/quiet/row";
import { shownSource, work } from "@/content/stretch/work";

const strandId = (label: string) => `strand-${label.toLowerCase()}`;

/** A strand's closer look: "So far" with its source, its thread drawing down from the source. */
function StrandLook({ bar }: { bar: (typeof work.headed.bars)[number] }) {
  const source = shownSource(bar.source);
  return (
    <div className="qi-strand" style={{ "--thread": source.thread } as CSSProperties}>
      <span className="qi-strand__thread" />
      <p className="qi-strand__tag stretch-mono">
        {work.headed.soFar} · {source.name}
      </p>
      <p className="qi-strand__text">{bar.soFar.text}</p>
    </div>
  );
}

/**
 * Where I'm headed as the quiet index drew it: its line and three strand rows, each with a closer look. It follows
 * Work's panels until it becomes its own paper panel (#414). The server renders all of it; the controller shows the
 * closer looks.
 */
export function HeadedRows() {
  const { headed } = work;
  const looks = Object.fromEntries(headed.bars.map((bar) => [strandId(bar.label), <StrandLook key={bar.label} bar={bar} />]));
  return (
    <CloserLookRoot looks={looks} className="qi-column work__headed">
      <div role="group" aria-labelledby="headed-heading" className="qi-group">
        <h3 id="headed-heading" className="qi-title">
          {headed.heading}
        </h3>
        <p className="qi-note-line">{headed.line}</p>
        <ul className="qi-list">
          {headed.bars.map((bar) => {
            const source = shownSource(bar.source);
            return (
              <Row
                key={bar.label}
                object={<span className="qi-thread" style={{ "--thread": source.thread } as CSSProperties} />}
                title={bar.title}
                line={bar.label}
                look={{ id: strandId(bar.label), description: `${headed.soFar}, ${source.name}. ${bar.soFar.text}` }}
              />
            );
          })}
        </ul>
      </div>
    </CloserLookRoot>
  );
}
