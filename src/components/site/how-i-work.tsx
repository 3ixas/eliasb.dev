import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { OnView } from "@/components/parts/on-view";
import { Arrow } from "@/components/parts/panel";
import { caseStudies } from "@/content/stretch/case-studies";
import { howIWork, type Beat, type BeatProof } from "@/content/stretch/how-i-work";
import { projects } from "@/content/projects";

/** A story with its proof phrase highlighted by a cobalt tint, never an underline. The phrase is in the story word for word (verify:copy). */
function Highlighted({ story, phrase }: { story: string; phrase: string }): ReactNode {
  const at = story.indexOf(phrase);
  if (at < 0) throw new Error(`How I work: the story does not contain the phrase to highlight: "${phrase}"`);
  return (
    <>
      {story.slice(0, at)}
      <mark>{phrase}</mark>
      {story.slice(at + phrase.length)}
    </>
  );
}

/** The proof drawn in a card's foot: the projects as coloured dots, a count as ticks, a switch that is off, a bar that much longer. */
function Drawn({ proof }: { proof: BeatProof }) {
  switch (proof.kind) {
    case "projects":
      return proof.projects.map((slug) => {
        const project = projects.find((entry) => entry.slug === slug)!;
        return (
          <span key={slug} className="drawn__dot" style={{ "--dot": project.colours!.swatch } as CSSProperties}>
            {project.name}
          </span>
        );
      });
    case "count":
      return (
        <>
          <b>{proof.value}</b>
          <span className="drawn__ticks" aria-hidden="true">
            {Array.from({ length: proof.value }, (_, index) => (
              <i key={index} />
            ))}
          </span>
        </>
      );
    case "switch":
      return (
        <>
          <span className="drawn__switch" aria-hidden="true" />
          {proof.label}
        </>
      );
    case "change":
      return (
        <>
          <b>{proof.value}</b>
          <OnView motion="grow" className="drawn__bars">
            <i className="bar" style={{ "--share": 100 / (100 + proof.percent) } as CSSProperties} aria-hidden="true" />
            <i className="bar bar--after" style={{ "--share": 1 } as CSSProperties} aria-hidden="true" />
          </OnView>
        </>
      );
  }
}

/** One card, in three steps: the habit above its cobalt rule, the story with its proof highlighted, the proof drawn in the foot. */
function Card({ beat }: { beat: Beat }) {
  return (
    <li>
      <OnView motion="rise" className="card">
        <h3>{beat.habit}</h3>
        <p>
          <Highlighted story={beat.proof} phrase={beat.highlight} />
        </p>
        <div className="card__proof">
          <Drawn proof={beat.drawn} />
        </div>
      </OnView>
    </li>
  );
}

/**
 * How I work (DESIGN.md "How I work's cards", R-18): four upright cards on paper, then the link to Threshold's PRD on its
 * case study. The PRD's date is the case study's own, so the two cannot drift apart.
 */
export function HowIWork() {
  const { date } = caseStudies.threshold.prd;
  if (!date) throw new Error("The Threshold PRD has no date for How I work's link to show");
  return (
    <section id="how-i-work" className="frame section how" aria-labelledby="how-i-work-heading">
      <h2 id="how-i-work-heading" className="section__title">
        {howIWork.heading}
      </h2>
      <ol className="cards">
        {howIWork.beats.map((beat) => (
          <Card key={beat.habit} beat={beat} />
        ))}
      </ol>
      <Link className="text-link how__prd" href="/things-i-make/threshold#written-down-first">
        {`${howIWork.prd.title}, ${date}`}
        <Arrow />
      </Link>
    </section>
  );
}
