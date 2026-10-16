/*
 * PROTOTYPE, throwaway (#194, Work as staff passes on lanyards). Lives only on
 * the prototype/work-passes branch. Three variants of the homepage's Work
 * section, switched by ?variant= on `/` (today's Work when absent):
 *
 *   A  Rail      – every employer hangs from one rail; the passes carry Now and How I got here.
 *   B  Desk      – only today's pass hangs; past passes lie flat on their rows.
 *   C  Strap     – one strap is the timeline, oldest to newest, running on into Where I'm headed.
 *
 * Each variant diverges on one axis: where the passes sit relative to the rest of Work.
 */
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { roleStories } from "@/content/stretch/role-stories";
import { roleStoryColours, type RoleStorySlug } from "@/content/stretch/role-story";
import { shownLink, work } from "@/content/stretch/work";
import { PassSwing, PrototypeSwitcher } from "./work-passes-switcher.prototype";
import "../../app/work-passes.prototype.css";

export const WORK_VARIANTS = ["A", "B", "C"] as const;
export type WorkVariant = (typeof WORK_VARIANTS)[number];
export const workVariantNames: Record<WorkVariant, string> = { A: "Rail", B: "Desk", C: "Strap" };

/** What each pass shows beyond the story's own role and dates. */
const passes: Record<RoleStorySlug, { short: string; status: string; number: { value: string; label: string }; line: string }> = {
  "bnp-paribas": {
    short: "BNP Paribas",
    status: "Valid · present",
    number: { value: "Only", label: "C# engineer on the team" },
    line: work.now.proofs[0],
  },
  joveen: {
    short: "Joveen",
    status: "Expired · Jun 2025",
    number: roleStories.joveen.evidence[0],
    line: work.gotHere.rows[0].note,
  },
  optegra: {
    short: "Optegra",
    status: "Expired · Aug 2024",
    number: roleStories.optegra.evidence[0],
    line: work.gotHere.rows[1].note,
  },
};

/** The awards, worn as enamel pins on the BNP strap. */
const pins = [
  { label: "Winner", detail: "Digitisation · 2025" },
  { label: "Take Ownership", detail: "Q1 2026" },
  { label: "AI Champion", detail: "2026" },
];

const history = work.gotHere.rows[2];

function passStyle(slug: RoleStorySlug, tilt: string): CSSProperties {
  const { field, ink, swatch } = roleStoryColours(roleStories[slug].colours);
  return { "--pass-field": field, "--pass-ink": ink, "--pass-swatch": swatch, "--pass-tilt": tilt } as CSSProperties;
}

/** One staff pass on its lanyard. The whole card is the link to the Role story. */
function Pass({
  slug,
  size,
  tilt = "0deg",
  strap = "md",
  flat = false,
  withPins = false,
  children,
}: {
  slug: RoleStorySlug;
  size: "lg" | "sm" | "xs";
  tilt?: string;
  strap?: "none" | "sm" | "md" | "lg";
  flat?: boolean;
  withPins?: boolean;
  children?: ReactNode;
}) {
  const story = roleStories[slug];
  const pass = passes[slug];
  return (
    <div className={`wp-hang wp-hang--${size}`} data-flat={flat || undefined} data-strap={strap} style={passStyle(slug, tilt)} data-pass>
      {strap !== "none" && (
        <div className="wp-strap" aria-hidden="true">
          {withPins && (
            <ul className="wp-pins">
              {pins.map((pin) => (
                <li key={pin.label} className="wp-pin">
                  <span className="wp-pin__label">{pin.label}</span>
                  <span className="wp-pin__detail">{pin.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {strap !== "none" && <span className="wp-clip" aria-hidden="true" />}
      <Link href={`/work/${slug}`} className="wp-pass">
        <span className="wp-slot" aria-hidden="true" />
        <span className="wp-pass__top stretch-mono">
          <span>Staff · {story.number}</span>
          <span className="wp-pass__status" data-current={slug === "bnp-paribas" || undefined}>
            {pass.status}
          </span>
        </span>
        <span className="wp-pass__id">
          {size !== "xs" && (
            // eslint-disable-next-line @next/next/no-img-element -- prototype
            <img className="wp-pass__photo" src="/profile/elias.webp" alt="" width={968} height={968} />
          )}
          <span className="wp-pass__who">
            <span className="wp-pass__employer stretch-display">{pass.short}</span>
            <span className="wp-pass__role">{story.role}</span>
            <span className="wp-pass__dates stretch-mono">{story.dates}</span>
          </span>
        </span>
        {size !== "xs" && (
          <span className="wp-pass__stat">
            <span className="wp-pass__value stretch-display">{pass.number.value}</span>
            <span className="wp-pass__label">{pass.number.label}</span>
          </span>
        )}
        {children}
        <span className="wp-pass__foot stretch-mono">
          <span className="wp-barcode" aria-hidden="true" />
          <span>The {story.employer === "Optegra Eye Healthcare & Kensington Medical" ? "Optegra" : story.employer} story →</span>
        </span>
        {slug !== "bnp-paribas" && size !== "xs" && (
          <span className="wp-stamp stretch-mono" aria-hidden="true">
            Expired
          </span>
        )}
      </Link>
    </div>
  );
}

function BnpProofs() {
  return (
    <ul className="wp-pass__proofs">
      {work.now.proofs.slice(1).map((proof) => (
        <li key={proof}>{proof}</li>
      ))}
    </ul>
  );
}

function Headed({ compact = false }: { compact?: boolean }) {
  const { headed } = work;
  return (
    <article className={`wp-headed${compact ? " wp-headed--compact" : ""}`} aria-labelledby="wp-headed-heading">
      <h3 id="wp-headed-heading" className="stretch-work__h3">
        {headed.heading}
      </h3>
      <p className="stretch-work__line">{headed.line}</p>
      <ol className="wp-headed__strands">
        {headed.strands.map((strand, index) => {
          const link = shownLink(strand.link);
          return (
            <li key={strand.title}>
              <span className="wp-headed__n stretch-mono">0{index + 1}</span>
              <p className="stretch-work__strand">{strand.title}</p>
              <p className="stretch-work__proof">{strand.proof}</p>
              <Link className="stretch-mono stretch-work__link" href={link.href}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

function HistoryTag() {
  return (
    <p className="wp-history stretch-mono">
      <span>{history.story === null ? history.dates : ""}</span> {history.story === null ? history.role : ""} · {history.note}
    </p>
  );
}

/* ---------------- A · Rail ---------------- */
function VariantA() {
  return (
    <div className="wp wp-a">
      <p className="wp-a__note stretch-mono">{work.gotHere.note}</p>
      <div className="wp-a__rail">
        <span className="wp-a__bar" aria-hidden="true" />
        <Pass slug="bnp-paribas" size="lg" tilt="-1deg" strap="lg" withPins>
          <BnpProofs />
        </Pass>
        <div className="wp-a__past">
          <Pass slug="joveen" size="sm" tilt="1.5deg" strap="md" />
          <Pass slug="optegra" size="sm" tilt="-1.2deg" strap="sm" />
          <HistoryTag />
        </div>
      </div>
      <Headed />
    </div>
  );
}

/* ---------------- B · Desk ---------------- */
function VariantB() {
  const { gotHere } = work;
  return (
    <div className="wp wp-b">
      <div className="wp-b__now">
        <Pass slug="bnp-paribas" size="lg" tilt="-1.5deg" strap="lg" withPins>
          <BnpProofs />
        </Pass>
        <Headed compact />
      </div>
      <article className="wp-b__got" aria-labelledby="wp-got-heading">
        <h3 id="wp-got-heading" className="stretch-work__h3">
          {gotHere.heading}
        </h3>
        <p className="stretch-mono stretch-work__note">{gotHere.note}</p>
        <ol className="wp-b__rows">
          {(["joveen", "optegra"] as const).map((slug, index) => (
            <li key={slug} className="wp-b__row">
              <Pass slug={slug} size="xs" strap="none" flat tilt={index ? "2deg" : "-2.5deg"} />
              <div className="wp-b__row-text">
                <span className="stretch-mono stretch-work__dates">{roleStories[slug].dates}</span>
                <span className="stretch-work__name">{roleStories[slug].role}</span>
                <span className="stretch-work__outcome">{passes[slug].line}</span>
              </div>
            </li>
          ))}
          <li className="wp-b__row wp-b__row--plain">
            <span className="wp-b__nopass" aria-hidden="true" />
            <div className="wp-b__row-text">
              <span className="stretch-mono stretch-work__dates">{history.story === null && history.dates}</span>
              <span className="stretch-work__name">{history.story === null && history.role}</span>
              <span className="stretch-work__outcome">{history.note}</span>
            </div>
          </li>
        </ol>
      </article>
    </div>
  );
}

/* ---------------- C · Strap (stretch) ---------------- */
function VariantC() {
  return (
    <div className="wp wp-c">
      <p className="wp-c__note stretch-mono">{work.gotHere.note}</p>
      <div className="wp-c__line">
        <span className="wp-c__strap" aria-hidden="true" />
        <div className="wp-c__stop wp-c__stop--history">
          <HistoryTag />
        </div>
        <div className="wp-c__stop">
          <Pass slug="optegra" size="sm" tilt="1.5deg" strap="sm" />
        </div>
        <div className="wp-c__stop">
          <Pass slug="joveen" size="sm" tilt="-1deg" strap="md" />
        </div>
        <div className="wp-c__stop wp-c__stop--now">
          <Pass slug="bnp-paribas" size="lg" tilt="-0.5deg" strap="lg" withPins>
            <BnpProofs />
          </Pass>
        </div>
        <div className="wp-c__stop wp-c__stop--next">
          <span className="wp-c__next stretch-mono" aria-hidden="true">
            Next →
          </span>
          <Headed compact />
        </div>
      </div>
    </div>
  );
}

export function WorkPassesPrototype({ variant }: { variant: WorkVariant | null }) {
  return (
    <>
      {variant === "A" && <VariantA />}
      {variant === "B" && <VariantB />}
      {variant === "C" && <VariantC />}
      <PassSwing />
      <PrototypeSwitcher current={variant} variants={WORK_VARIANTS} names={workVariantNames} />
    </>
  );
}
