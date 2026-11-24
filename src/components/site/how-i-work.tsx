import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { MeasureSide } from "@/components/parts/measure";
import { OnView } from "@/components/parts/on-view";
import { Arrow } from "@/components/parts/panel";
import { HowFlagSwitch } from "@/components/site/how-flag-switch";
import { caseStudies } from "@/content/stretch/case-studies";
import { howIWork, shortPrdDate, type Beat, type BeatProof } from "@/content/stretch/how-i-work";
import { projects } from "@/content/projects";

/** Heights (px) for the 13-slice stepped bar representing Threshold's 13 build slices. */
const SLICE_HEIGHTS = [8, 12, 10, 15, 13, 18, 14, 16, 12, 18, 15, 17, 18] as const;

const SWITCH_DESCRIPTION_ID = "how-flag-default";

/** A story with its proof phrase highlighted by a cobalt tint, never an underline. The phrase is in the story word for word (verify:copy). */
function Highlighted({ story, phrase, markId }: { story: string; phrase: string; markId?: string }): ReactNode {
  const at = story.indexOf(phrase);
  if (at < 0) throw new Error(`How I work: the story does not contain the phrase to highlight: "${phrase}"`);
  return (
    <>
      {story.slice(0, at)}
      <mark id={markId}>{phrase}</mark>
      {story.slice(at + phrase.length)}
    </>
  );
}

/**
 * Each card's distinct inset proof tray (DESIGN.md "How I work's cards", R-49):
 * 1. Linked Threshold and Flowtime micro-screenshot pills with their signature swatches.
 * 2. The 57 numeral, 13-slice stepped bar, and direct Threshold PRD link.
 * 3. Live accessible Off / On switch moving the active highlight between Today's path and New cached path.
 * 4. Bold +15% figure over proportional Before and After bars.
 */
function ProofTray({ proof, describedBy }: { proof: BeatProof; describedBy?: string }) {
  switch (proof.kind) {
    case "projects":
      return (
        <div className="how-projects">
          {proof.projects.map((slug) => {
            const project = projects.find((entry) => entry.slug === slug);
            if (!project?.links.caseStudy || !project.colours || !project.screenshot) {
              throw new Error(`How I work: project "${slug}" needs a case study link, screenshot and colours`);
            }
            return (
              <Link key={slug} className="how-project-pill" href={project.links.caseStudy}>
                <span className="how-project-pill__thumb" aria-hidden="true">
                  <Image src={project.screenshot.src} alt="" width={68} height={48} sizes="34px" />
                </span>
                <span
                  className="how-project-pill__swatch"
                  style={{ "--dot": project.colours.swatch } as CSSProperties}
                  aria-hidden="true"
                />
                <span>{project.name}</span>
              </Link>
            );
          })}
        </div>
      );
    case "count": {
      const { date } = caseStudies.threshold.prd;
      if (!date) throw new Error("The Threshold PRD has no date for How I work's link to show");
      if (SLICE_HEIGHTS.length !== proof.slices) {
        throw new Error(`How I work: expected ${proof.slices} slice bar heights, found ${SLICE_HEIGHTS.length}`);
      }
      return (
        <div className="how-prd-tray">
          <div className="how-slices">
            <b>{proof.value}</b>
            <span className="how-slices__bars" aria-hidden="true">
              {SLICE_HEIGHTS.map((height, index) => (
                <i key={index} style={{ height: `${height}px` }} />
              ))}
            </span>
          </div>
          <Link className="text-link how__prd" href={howIWork.prd.href}>
            {`${howIWork.prd.title}, ${shortPrdDate(date)}`}
            <Arrow />
          </Link>
        </div>
      );
    }
    case "switch":
      return (
        <HowFlagSwitch
          off={proof.off}
          on={proof.on}
          currentPath={proof.currentPath}
          newPath={proof.newPath}
          describedBy={describedBy ?? SWITCH_DESCRIPTION_ID}
        />
      );
    case "change": {
      const measure = { unit: "change", before: { amount: 100 }, after: { amount: 100 + proof.percent } } as const;
      return (
        <div className="how-lift">
          <b className="how-lift__num">{proof.value}</b>
          <OnView motion="grow" className="drawn__bars how-lift__tracks">
            <div className="how-lift__row">
              <span className="how-lift__label">{proof.before}</span>
              <span className="how-lift__track">
                <MeasureSide measure={measure} side="before" />
              </span>
            </div>
            <div className="how-lift__row">
              <span className="how-lift__label">{proof.after}</span>
              <span className="how-lift__track">
                <MeasureSide measure={measure} side="after" />
              </span>
            </div>
          </OnView>
        </div>
      );
    }
  }
}

/** One card in the 2 × 2 grid: habit above its cobalt rule, story with its proof phrase highlighted, distinct inset proof tray. */
function Card({ beat }: { beat: Beat }) {
  const markId = beat.drawn.kind === "switch" ? SWITCH_DESCRIPTION_ID : undefined;
  return (
    <li>
      <OnView motion="rise" className="card surface surface--paper">
        <h3>{beat.habit}</h3>
        <p>
          <Highlighted story={beat.proof} phrase={beat.highlight} markId={markId} />
        </p>
        <div className="card__proof" data-proof={beat.drawn.kind}>
          <ProofTray proof={beat.drawn} describedBy={markId} />
        </div>
      </OnView>
    </li>
  );
}

/**
 * How I work (DESIGN.md "How I work's cards", R-18, R-49): a 2 × 2 grid of bordered paper cards inside the shared
 * `--band` section, stacking under 720 px, each with its own distinct inset proof tray. Threshold's PRD date is derived
 * from its case study so the two cannot drift apart.
 */
export function HowIWork() {
  return (
    <section id="how-i-work" className="how" aria-labelledby="how-i-work-heading">
      <div className="section__head">
        <h2 id="how-i-work-heading" className="section__title">
          {howIWork.heading}
        </h2>
        <p className="section__note">{howIWork.note}</p>
      </div>
      <ol className="cards">
        {howIWork.beats.map((beat) => (
          <Card key={beat.habit} beat={beat} />
        ))}
      </ol>
    </section>
  );
}
