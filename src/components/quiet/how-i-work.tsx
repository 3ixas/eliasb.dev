import type { ReactNode } from "react";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { Row } from "@/components/quiet/row";
import { Sheet } from "@/components/quiet/sheet";
import { TypedQuote } from "@/components/quiet/typed-quote";
import { caseStudies } from "@/content/stretch/case-studies";
import { howIWork } from "@/content/stretch/how-i-work";

const prdId = "threshold-prd";

/**
 * One pen stroke. Every drawn path is normalised with `pathLength`, so the CSS can run a single dash offset from
 * 1 to 0 on the scroll timeline whatever the stroke's real length (quiet-index.css, "How I work's pen").
 */
function Ink({ shape, viewBox, d, preserveAspectRatio }: { shape: string; viewBox: string; d: string; preserveAspectRatio?: string }) {
  return (
    <svg className={`qi-ink qi-ink--${shape}`} viewBox={viewBox} preserveAspectRatio={preserveAspectRatio} aria-hidden="true">
      <path pathLength={1} d={d} />
    </svg>
  );
}

/** A proof with its strongest phrase underlined in pen. The phrase is part of the proof word for word (verify:copy). */
function Underlined({ proof, phrase }: { proof: string; phrase: string }): ReactNode {
  const at = proof.indexOf(phrase);
  if (at < 0) throw new Error(`The proof does not contain the phrase to underline: "${phrase}"`);
  return (
    <>
      {proof.slice(0, at)}
      <span className="qi-mark">
        {phrase}
        <Ink shape="under" viewBox="0 0 100 8" preserveAspectRatio="none" d="M1 5 C 20 2, 40 7, 60 4 S 90 3, 99 5" />
      </span>
      {proof.slice(at + phrase.length)}
    </>
  );
}

/** A habit's object: its number, ringed by the pen. */
export function HabitNumber({ position }: { position: number }) {
  return (
    <span className="qi-number">
      {String(position + 1).padStart(2, "0")}
      <Ink
        shape="circle"
        viewBox="0 0 100 100"
        d="M52 6 C 20 4, 4 30, 8 56 C 12 84, 44 98, 70 90 C 94 82, 98 50, 90 30 C 82 12, 60 2, 40 8"
      />
    </span>
  );
}

/** The PRD's closer look: its quote typing itself, with the caption beneath. */
function PrdLook({ quote, caption }: { quote: string; caption: string }) {
  return (
    <figure className="qi-prd">
      <blockquote>
        <TypedQuote text={quote} />
      </blockquote>
      <figcaption className="stretch-mono">{caption}</figcaption>
    </figure>
  );
}

/**
 * The body of the How I work section (GLOSSARY.md): a row for each habit with its proof, then Threshold's PRD.
 * The pen rings the numbers, runs an arrow from each habit to the next and underlines each proof's strongest
 * phrase; the CSS draws it with the scroll and leaves it fully drawn without scroll-driven animation or with
 * reduced motion. The PRD quote comes from the Threshold case study so the two pages cannot drift apart, and it
 * is in the server HTML as the PRD row's accessible description.
 */
export function HowIWork() {
  const { beats, prd } = howIWork;
  const { quote, date } = caseStudies.threshold.prd;
  if (!date) throw new Error("The Threshold PRD has no date for the PRD row to show");
  const caption = `${prd.title}, ${date}`;
  return (
    <CloserLookRoot looks={{ [prdId]: <PrdLook quote={quote} caption={caption} /> }} className="qi-column">
      <h2 id="how-i-work-heading" className="qi-title">
        {howIWork.heading}
      </h2>
      <p className="qi-note-line">{howIWork.note}</p>
      <ul className="qi-list" data-habits="">
        {beats.map((beat, position) => (
          <Row
            key={beat.habit}
            object={<HabitNumber position={position} />}
            title={beat.habit}
            line={<Underlined proof={beat.proof} phrase={beat.underline} />}
            after={position < beats.length - 1 ? <Ink shape="next" viewBox="0 0 40 60" d="M20 3 C 12 16, 28 30, 19 50 M9 40 L19 52 L31 41" /> : undefined}
          />
        ))}
        <Row object={<Sheet />} title={prd.title} line={date} look={{ id: prdId, description: `${quote} ${caption}` }} />
      </ul>
    </CloserLookRoot>
  );
}
