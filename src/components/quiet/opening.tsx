import type { CSSProperties } from "react";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { MiniPass } from "@/components/quiet/finished-pass";
import { openingLooks } from "@/components/quiet/opening-looks";
import { opening, type RevealId, type Run } from "@/content/stretch/opening";

/** What each reveal word's closer look says beyond the sentence, as the text its accessible description reads. */
const descriptions: Record<RevealId, string> = {
  engines: `${opening.looks.engines.caption} ${opening.looks.engines.note}`,
  cores: opening.looks.cores.caption,
  digitisation: `${opening.looks.digitisation.pin.label}. ${opening.looks.digitisation.pin.detail}. ${opening.looks.digitisation.line}`,
  ownership: opening.looks.ownership.certificate.caption,
};

const revealIds = Object.keys(descriptions) as RevealId[];

/** The cobalt tail of the opening line: it draws its underline on arrival, and its letters lift on hover. The letters stay inline (they lift by offset, not by transform), so the line is plain text to assistive technology and keeps its kerning. */
function Tail({ text }: { text: string }) {
  return (
    <em className="qi-opening__tail">
      {[...text].map((letter, index) =>
        letter === " " ? (
          " "
        ) : (
          <span key={index} className="qi-letter" style={{ "--i": index } as CSSProperties}>
            {letter}
          </span>
        ),
      )}
      <svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path pathLength="1" d="M6 26 C 80 17, 170 31, 250 21 S 360 15, 394 25" />
      </svg>
    </em>
  );
}

/**
 * One run of a sentence. A reveal word is a button, as a span so it can wrap with its line, that shows its closer look (GLOSSARY.md, Reveal word): the
 * controller shows it in the margin when the pointer or focus arrives, and inline when it is tapped. The
 * employer shows nothing of the kind: it reacts where it stands, and its row in Work holds the closer look.
 */
function RunView({ run }: { run: Run }) {
  if (run.mark === "emphasis") return <Tail text={run.text} />;
  if (run.mark === "employer") {
    return (
      <span className="qi-bnp" tabIndex={0}>
        {/* First, because Chrome puts a space after an absolutely positioned child in a name, and that would read "BNP Paribas , and". */}
        <span className="qi-bnp__pass" aria-hidden="true">
          <MiniPass slug="bnp-paribas" />
        </span>
        {run.text}
      </span>
    );
  }
  if (run.mark) {
    return (
      <span
        className="qi-word"
        role="button"
        tabIndex={0}
        data-look={run.mark}
        data-look-tap={run.mark}
        aria-describedby={`${run.mark}-description`}
        aria-expanded="false"
      >
        {run.text}
      </span>
    );
  }
  return run.text;
}

/** The empty place under a sentence where the controller opens a tapped word's look. */
const Slot = ({ id }: { id: RevealId }) => <div className="qi-inline" data-look-slot={id} aria-hidden="true" />;

/**
 * The opening (GLOSSARY.md, Opening line): the page's one `h1`, then the supporting line, each with the words that
 * can show something. It is the loudest thing on the page and is not a row. Server-rendered in full, so it reads
 * the same with no script; the controller only shows the closer looks.
 */
export function Opening() {
  const { headlineRuns, supportRuns } = opening;
  return (
    <section className="stretch-wrap qi-opening" aria-label="Introduction">
      <CloserLookRoot looks={openingLooks()} className="qi-column">
        <h1 className="qi-opening__line">
          {headlineRuns.map((run, index) => (
            <RunView key={index} run={run} />
          ))}
        </h1>
        <Slot id="engines" />
        <p className="qi-opening__support">
          {supportRuns.map((run, index) => (
            <RunView key={index} run={run} />
          ))}
        </p>
        {revealIds
          .filter((id) => id !== "engines")
          .map((id) => (
            <Slot key={id} id={id} />
          ))}
        {revealIds.map((id) => (
          <p key={id} id={`${id}-description`} hidden>
            {descriptions[id]}
          </p>
        ))}
      </CloserLookRoot>
    </section>
  );
}
