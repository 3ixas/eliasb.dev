/*
 * PROTOTYPE, throwaway (map #190, fog: does Where I'm headed need a light
 * visual layer?). Lives only on prototype/where-im-headed, built on the Rail
 * (A) from prototype/work-passes. ?variant= picks how Where I'm headed sits
 * beneath the rail; with none, it is today's three columns of text.
 *
 *   A  Tight     – restraint: trimmed copy as Project index rows, no new material.
 *   B  Threads   – wayfinding: each strand keyed in the hue of where its proof lives.
 *   C  Unissued  – the object: the direction as a blank pass (stretch).
 *
 * A, B and C share one trimmed copy (facts unchanged), so the comparison is
 * about the visual layer, not the word count.
 */
import type { CSSProperties } from "react";
import Link from "next/link";
import { projects } from "@/content/projects";
import { roleStories } from "@/content/stretch/role-stories";
import { roleStoryColours } from "@/content/stretch/role-story";
import { shownLink, work } from "@/content/stretch/work";
import "../../app/where-im-headed.prototype.css";

export const HEADED_VARIANTS = ["A", "B", "C"] as const;
export type HeadedVariant = (typeof HEADED_VARIANTS)[number];
export const headedVariantNames: Record<HeadedVariant, string> = { A: "Tight", B: "Threads", C: "Unissued pass" };

const bnp = roleStoryColours(roleStories["bnp-paribas"].colours).swatch;
const threshold = projects.find((project) => project.slug === "threshold")?.colours?.swatch ?? "currentColor";

/** Trimmed copy: same facts and proofs, fewer words. */
const trimmed = {
  line: "Systems that hold up at work, and products worth building on my own. I want to be genuinely good at both.",
  strands: [
    {
      title: "Systems that hold up.",
      proof: "Shipped a live pricing change behind a flag, off by default, with an end-to-end test nobody asked for.",
      source: { name: "BNP Paribas", hue: bnp },
    },
    {
      title: "Deciding what’s worth building.",
      proof: "Wrote 57 user stories, and what was out of scope, before building Threshold.",
      source: { name: "Threshold", hue: threshold },
    },
    {
      title: "Building with AI, and bringing people with me.",
      proof: "Built a phase-gated workflow and showed it across the department. Several teams now use it.",
      source: { name: "BNP Paribas", hue: bnp },
    },
  ],
};

const strands = trimmed.strands.map((strand, index) => ({
  ...strand,
  n: `0${index + 1}`,
  link: shownLink(work.headed.strands[index].link),
}));

function Heading({ line = trimmed.line }: { line?: string }) {
  return (
    <>
      <h3 id="wp-headed-heading" className="stretch-work__h3">
        {work.headed.heading}
      </h3>
      <p className="stretch-work__line">{line}</p>
    </>
  );
}

/* ---------------- A · Tight ---------------- */
function Tight() {
  return (
    <article className="wh wh-a" aria-labelledby="wp-headed-heading">
      <Heading />
      <ol className="stretch-index__list wh-a__list">
        {strands.map((strand) => (
          <li key={strand.n} className="stretch-index__row">
            <Link className="stretch-index__link wh-a__link" href={strand.link.href}>
              <span className="stretch-mono stretch-index__number" aria-hidden="true">
                {strand.n}
              </span>
              <span className="stretch-index__text">
                <span className="stretch-index__name">{strand.title}</span>
                <span className="stretch-index__outcome">{strand.proof}</span>
              </span>
              <span className="stretch-mono stretch-index__meta">{strand.link.label.replace(/ [→↓]$/, "")}</span>
              <span className="stretch-index__arrow" aria-hidden="true">
                {strand.link.label.endsWith("↓") ? "↓" : "→"}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}

/* ---------------- B · Threads ---------------- */
function Threads() {
  return (
    <article className="wh wh-b" aria-labelledby="wp-headed-heading">
      <Heading />
      <ol className="wh-b__strands">
        {strands.map((strand) => (
          <li key={strand.n} className="wh-b__strand" style={{ "--thread": strand.source.hue } as CSSProperties}>
            <p className="wh-b__source stretch-mono">
              <span className="wh-b__swatch" aria-hidden="true" />
              {strand.n} · from {strand.source.name}
            </p>
            <p className="stretch-work__strand">{strand.title}</p>
            <p className="stretch-work__proof">{strand.proof}</p>
            <Link className="stretch-mono stretch-work__link" href={strand.link.href}>
              {strand.link.label}
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}

/* ---------------- C · Unissued pass (stretch) ---------------- */
function Unissued() {
  return (
    <article className="wh wh-c" aria-labelledby="wp-headed-heading">
      <div className="wh-c__hang">
        <span className="wh-c__strap" aria-hidden="true" />
        <span className="wp-clip" aria-hidden="true" />
        <div className="wh-c__pass">
          <span className="wp-slot" aria-hidden="true" />
          <div className="wh-c__top stretch-mono">
            <span>Staff pass · Elias Bennett</span>
            <span>Not yet issued</span>
          </div>
          <div className="wh-c__id">
            <span className="wh-c__photo stretch-mono" aria-hidden="true">
              2–3 yrs
            </span>
            <div>
              <h3 id="wp-headed-heading" className="wh-c__title">
                {work.headed.heading}
              </h3>
              <p className="wh-c__line">{trimmed.line}</p>
            </div>
          </div>
          <ol className="wh-c__fields">
            {strands.map((strand) => (
              <li key={strand.n}>
                <span className="wh-c__label stretch-mono">Field {strand.n}</span>
                <p className="wh-c__strand">{strand.title}</p>
                <p className="wh-c__proof">{strand.proof}</p>
                <Link className="stretch-mono wh-c__link" href={strand.link.href}>
                  {strand.link.label}
                </Link>
              </li>
            ))}
          </ol>
          <div className="wh-c__foot stretch-mono">
            <span>Valid from: —</span>
            <span className="wp-barcode" aria-hidden="true" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function HeadedPrototype({ variant }: { variant: HeadedVariant }) {
  if (variant === "A") return <Tight />;
  if (variant === "B") return <Threads />;
  return <Unissued />;
}
