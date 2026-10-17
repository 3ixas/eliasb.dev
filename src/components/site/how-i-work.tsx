import type { ReactNode } from "react";
import { caseStudies } from "@/content/stretch/case-studies";
import { howIWork } from "@/content/stretch/how-i-work";

/** The phrase in each proof that the pen underlines: the strongest evidence, one per beat. */
const underlined = ["no clear idea", "57 user stories", "under 5"] as const;

/**
 * One pen stroke. Every drawn path is normalised with `pathLength`, so the CSS
 * can run a single dash offset from 1 to 0 on the scroll timeline whatever the
 * stroke's real length (stretch-shell.css, "How I work: Margin notes").
 */
function Ink({ shape, viewBox, d, ...svg }: { shape: string; viewBox: string; d: string; preserveAspectRatio?: string }) {
  return (
    <svg className={`stretch-ink stretch-ink--${shape}`} viewBox={viewBox} aria-hidden="true" {...svg}>
      <path pathLength={1} d={d} />
    </svg>
  );
}

function Underlined({ proof, phrase }: { proof: string; phrase: string }): ReactNode {
  const at = proof.indexOf(phrase);
  if (at < 0) throw new Error(`The proof does not contain the phrase to underline: "${phrase}"`);
  return (
    <>
      {proof.slice(0, at)}
      <span className="stretch-mark">
        {phrase}
        <Ink shape="under" viewBox="0 0 100 8" preserveAspectRatio="none" d="M1 5 C 20 2, 40 7, 60 4 S 90 3, 99 5" />
      </span>
      {proof.slice(at + phrase.length)}
    </>
  );
}

/**
 * The three habits, each with its one true proof, marked up in pen (Margin
 * notes): a circled number, an arrow to the next habit, a line under the proof,
 * and an arrow from "Write it down first" to the PRD card, a line from
 * Threshold's spec with its caption. The quote comes from the Threshold case
 * study so the two pages cannot drift apart.
 */
export function HowIWork() {
  const { beats, prdCaption } = howIWork;
  const quote = caseStudies.threshold.prd.quote;
  return (
    <div className="stretch-how">
      <ol className="stretch-beats">
        {beats.map((beat, position) => (
          <li key={beat.habit} className="stretch-beat">
            <p className="stretch-display stretch-beat__number" aria-hidden="true">
              {String(position + 1).padStart(2, "0")}
              <Ink
                shape="circle"
                viewBox="0 0 100 100"
                d="M52 6 C 20 4, 4 30, 8 56 C 12 84, 44 98, 70 90 C 94 82, 98 50, 90 30 C 82 12, 60 2, 40 8"
              />
            </p>
            <h3 className="stretch-beat__habit">{beat.habit}</h3>
            <p className="stretch-beat__proof">
              <Underlined proof={beat.proof} phrase={underlined[position]} />
            </p>
            {position < beats.length - 1 && (
              <Ink shape="next" viewBox="0 0 40 120" d="M20 4 C 10 30, 30 60, 18 104 M8 92 L18 106 L30 94" />
            )}
            {position === 1 && <Ink shape="to-prd" viewBox="0 0 160 60" d="M4 40 C 40 50, 90 52, 150 14 M134 10 L152 12 L146 30" />}
          </li>
        ))}
      </ol>

      <figure className="stretch-prd">
        <span className="stretch-fastener stretch-fastener--tape" aria-hidden="true" />
        <blockquote className="stretch-prd__quote">{quote}</blockquote>
        <figcaption className="stretch-mono stretch-prd__caption">{prdCaption}</figcaption>
      </figure>
    </div>
  );
}
