/*
 * PROTOTYPE, throwaway (#195, How I work as a process diagram). Lives only on
 * the prototype/how-i-work-diagram branch. Three variants of the homepage's
 * How I work section, switched by ?variant= on `/` (today's section when absent):
 *
 *   A  Route         – axis: a track. A horizontal line that draws itself; the PRD hangs under station 02 as what it produces.
 *   B  Margin notes  – axis: the hand. Today's reading order, marked up in pen: circled numbers, a scrawled arrow, underlined proof.
 *   C  Loop          – axis: shape (stretch). The habits as a cycle around the PRD, measuring feeding back into the next problem.
 *
 * Ink only: Cobalt stays Elias's own, and colour belongs to Work and Things I make.
 */
import type { ReactNode } from "react";
import { caseStudies } from "@/content/stretch/case-studies";
import { howIWork } from "@/content/stretch/how-i-work";
import { PrototypeSwitcher } from "./prototype-switcher.prototype";
import "../../app/how-i-work.prototype.css";

export const HOW_VARIANTS = ["A", "B", "C"] as const;
export type HowVariant = (typeof HOW_VARIANTS)[number];
const names: Record<HowVariant, string> = { A: "Route", B: "Margin notes", C: "Loop" };

const { beats, prdCaption } = howIWork;
const quote = caseStudies.threshold.prd.quote;
const number = (index: number) => String(index + 1).padStart(2, "0");

/** The phrase in each proof that a pen would underline (B). */
const marked = ["no clear idea", "57 user stories", "under 5"];

function Prd({ className = "" }: { className?: string }) {
  return (
    <figure className={`stretch-prd hp-prd ${className}`}>
      <span className="stretch-fastener stretch-fastener--tape" aria-hidden="true" />
      <blockquote className="stretch-prd__quote">{quote}</blockquote>
      <figcaption className="stretch-mono stretch-prd__caption">{prdCaption}</figcaption>
    </figure>
  );
}

/* ---------------- A · Route ---------------- */
function VariantA() {
  return (
    <ol className="hp hp-a" aria-label="Three habits, in order">
      <span className="hp-a__track" aria-hidden="true">
        <span className="hp-a__drawn" />
      </span>
      {beats.map((beat, index) => (
        <li key={beat.habit} className="hp-a__stop" style={{ "--i": index } as React.CSSProperties}>
          <span className="hp-a__dot stretch-display" aria-hidden="true">
            {number(index)}
          </span>
          <h3 className="hp-habit">{beat.habit}</h3>
          <p className="hp-proof">{beat.proof}</p>
          {index === 1 && <Prd className="hp-a__prd" />}
        </li>
      ))}
    </ol>
  );
}

/* ---------------- B · Margin notes ---------------- */
function Underline({ text, mark }: { text: string; mark: string }): ReactNode {
  const at = text.indexOf(mark);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="hp-b__mark">
        {mark}
        <svg className="hp-b__ink hp-b__under" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength={1} d="M1 5 C 20 2, 40 7, 60 4 S 90 3, 99 5" />
        </svg>
      </span>
      {text.slice(at + mark.length)}
    </>
  );
}

function VariantB() {
  return (
    <div className="hp hp-b">
      <ol className="hp-b__list">
        {beats.map((beat, index) => (
          <li key={beat.habit} className="hp-b__beat">
            <span className="hp-b__num stretch-display" aria-hidden="true">
              {number(index)}
              <svg className="hp-b__ink hp-b__circle" viewBox="0 0 100 100" aria-hidden="true">
                <path pathLength={1} d="M52 6 C 20 4, 4 30, 8 56 C 12 84, 44 98, 70 90 C 94 82, 98 50, 90 30 C 82 12, 60 2, 40 8" />
              </svg>
            </span>
            <h3 className="hp-habit">{beat.habit}</h3>
            <p className="hp-proof">
              <Underline text={beat.proof} mark={marked[index]} />
            </p>
            {index < beats.length - 1 && (
              <svg className="hp-b__ink hp-b__arrow" viewBox="0 0 40 120" aria-hidden="true">
                <path pathLength={1} d="M20 4 C 10 30, 30 60, 18 104 M8 92 L18 106 L30 94" />
              </svg>
            )}
            {index === 1 && (
              <svg className="hp-b__ink hp-b__to-prd" viewBox="0 0 160 60" aria-hidden="true">
                <path pathLength={1} d="M4 40 C 40 50, 90 52, 150 14 M134 10 L152 12 L146 30" />
              </svg>
            )}
          </li>
        ))}
      </ol>
      <Prd className="hp-b__prd" />
    </div>
  );
}

/* ---------------- C · Loop (stretch) ---------------- */
function VariantC() {
  return (
    <div className="hp hp-c">
      <svg className="hp-c__loop" viewBox="0 0 1000 480" aria-hidden="true">
        <path pathLength={1} className="hp-c__arc" d="M330 70 C 450 20, 550 20, 670 60 M650 44 L670 60 L646 70" />
        <path pathLength={1} className="hp-c__arc" d="M860 230 C 880 320, 800 380, 670 390 M688 374 L670 390 L690 404" />
        <path pathLength={1} className="hp-c__arc" d="M330 390 C 200 380, 130 320, 150 225 M136 244 L150 225 L164 244" />
      </svg>
      <ol className="hp-c__stations">
        {beats.map((beat, index) => (
          <li key={beat.habit} className={`hp-c__station hp-c__station--${index + 1}`}>
            <span className="hp-c__n stretch-display" aria-hidden="true">
              {number(index)}
            </span>
            <h3 className="hp-habit">{beat.habit}</h3>
            <p className="hp-proof">{beat.proof}</p>
          </li>
        ))}
      </ol>
      <Prd className="hp-c__prd" />
      <span className="hp-c__return" aria-hidden="true" />
    </div>
  );
}

export function HowIWorkPrototype({ variant }: { variant: HowVariant | null }) {
  return (
    <>
      {variant === "A" && <VariantA />}
      {variant === "B" && <VariantB />}
      {variant === "C" && <VariantC />}
      <PrototypeSwitcher current={variant} variants={HOW_VARIANTS} names={names} anchor="how-i-work" />
    </>
  );
}
