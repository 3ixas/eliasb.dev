import { caseStudies } from "@/content/stretch/case-studies";
import { howIWork } from "@/content/stretch/how-i-work";

/**
 * The three habits, each with its one true proof, the honest line that Elias's
 * own projects are not launched or measured yet, and the PRD card: a line from
 * Threshold's spec, with its caption. The quote comes from the Threshold case
 * study so the two pages cannot drift apart.
 */
export function HowIWork() {
  const { beats, honestLine, prdCaption } = howIWork;
  const quote = caseStudies.threshold?.prd.quote;
  if (!quote) throw new Error("How I work needs Threshold's PRD quote from its case study.");
  return (
    <div className="stretch-how">
      <ol className="stretch-beats">
        {beats.map((beat, position) => (
          <li key={beat.habit} className="stretch-beat">
            <p className="stretch-display stretch-beat__number" aria-hidden="true">
              {String(position + 1).padStart(2, "0")}
            </p>
            <h3 className="stretch-beat__habit">{beat.habit}</h3>
            <p className="stretch-beat__proof">{beat.proof}</p>
          </li>
        ))}
      </ol>

      <figure className="stretch-prd">
        <span className="stretch-fastener stretch-fastener--tape" aria-hidden="true" />
        <blockquote className="stretch-prd__quote">{quote}</blockquote>
        <figcaption className="stretch-mono stretch-prd__caption">{prdCaption}</figcaption>
      </figure>

      <p className="stretch-honest">{honestLine}</p>
    </div>
  );
}
