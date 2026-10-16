/*
 * PROTOTYPE, throwaway (#198, Visual material for a Role story). Lives only on
 * prototype/role-story-visuals. Three variants of the BNP Paribas Role story,
 * switched by ?variant= on /work/bnp-paribas (today's page when absent):
 *
 *   A  Pass       – the staff pass from Work is the opening object; two figures in the body.
 *   B  Exhibits   – today's opening; every section earns one figure, and the evidence strip becomes pins.
 *   C  Timeline   – stretch: the story told along its dates, the evidence strip becomes the time axis.
 *
 * The axis they differ on: where the visual material lives (the opening, the
 * sections, or a line through time). The copy is the story's own, trimmed
 * only where a figure now says it. The certificate image is local only
 * (public/prototype-private/, excluded from git), as #193 asks.
 */
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import {
  Arrowed,
  StoryEvidence,
  StoryNext,
  StorySection,
  StorySectionLinks,
  storyColours,
} from "@/components/site/story";
import { SubpageHeader } from "@/components/site/subpage-header";
import { roleStories } from "@/content/stretch/role-stories";
import {
  roleStoryBack,
  roleStoryColours,
  roleStoryCopy,
  roleStoryMetadata,
  roleStorySectionKeys,
  roleStorySectionLabels,
  type RoleStory,
  type RoleStorySectionKey,
} from "@/content/stretch/role-story";
import { siteCopy } from "@/content/stretch/site-copy";
import { PassSwing } from "./work-passes-switcher.prototype";
import { RoleStorySwitcher } from "./role-story-switcher.prototype";
import "../../app/work-passes.prototype.css";
import "../../app/role-story-visuals.prototype.css";

export const ROLE_VARIANTS = ["A", "B", "C"] as const;
export type RoleVariant = (typeof ROLE_VARIANTS)[number];
const names: Record<RoleVariant, string> = { A: "Pass", B: "Exhibits", C: "Timeline" };

export const isRoleVariant = (value: string | undefined): value is RoleVariant =>
  ROLE_VARIANTS.includes(value as RoleVariant);

const CERT = "/prototype-private/take-ownership.png";
const sections = roleStorySectionKeys.map((key) => ({ key, label: roleStorySectionLabels[key] }));

/** The pins, as on the Work pass. Take Ownership opens the certificate. */
const pins = [
  { label: "Winner", detail: "Digitisation · Nov 2025", href: "#what-changed" },
  { label: "Take Ownership", detail: "Q1 2026", href: "#certificate" },
  { label: "AI Champion", detail: "Spring 2026", href: "#what-i-took-with-me" },
];

/* ---------------- shared pieces ---------------- */

function Shell({ story, variant, children }: { story: RoleStory; variant: RoleVariant; children: ReactNode }) {
  return (
    <div data-stretch-shell data-role-story={story.slug} data-rsv={variant}>
      <SubpageHeader />
      <main id="main-content" tabIndex={-1}>
        {children}
        <StoryNext
          label={roleStoryCopy.nextRole}
          href={`/work/${roleStories.joveen.slug}`}
          colours={roleStoryColours(roleStories.joveen.colours)}
          number={roleStories.joveen.number}
          name={roleStories.joveen.employer}
          outcome={roleStories.joveen.role}
        />
      </main>
      <footer className="stretch-wrap stretch-footer">
        <p className="stretch-mono">{siteCopy.footer}</p>
      </footer>
      <RoleStorySwitcher current={variant} variants={ROLE_VARIANTS} names={names} />
      <PassSwing />
    </div>
  );
}

function Back() {
  return (
    <Link className="stretch-cs-back" href={roleStoryBack.href}>
      <Arrowed label={roleStoryBack.label} />
    </Link>
  );
}

/** The pass from Work, hung in the band. Not a link here: you are already on its story. */
function BandPass({ story, pinsAsLinks = true }: { story: RoleStory; pinsAsLinks?: boolean }) {
  // The pass wears the other theme's pair, so it stands off a band in its own colour.
  const { light, dark } = story.colours;
  const field = `light-dark(${dark.field}, ${light.field})`;
  const ink = `light-dark(${dark.ink}, ${light.ink})`;
  const swatch = `light-dark(${dark.swatch}, ${light.swatch})`;
  const style = { "--pass-field": field, "--pass-ink": ink, "--pass-swatch": swatch, "--pass-tilt": "-2deg" } as CSSProperties;
  return (
    <div className="rsv-passhang">
      <div className="wp-hang wp-hang--lg" data-strap="lg" style={style} data-pass>
        <div className="wp-strap" aria-hidden="true" />
        <span className="wp-clip" aria-hidden="true" />
        <div className="wp-pass rsv-pass">
          <span className="wp-slot" aria-hidden="true" />
          <span className="wp-pass__top stretch-mono">
            <span>Staff · {story.number}</span>
            <span className="wp-pass__status" data-current>
              Valid · present
            </span>
          </span>
          <span className="wp-pass__id">
            {/* eslint-disable-next-line @next/next/no-img-element -- prototype */}
            <img className="wp-pass__photo" src="/profile/elias.webp" alt="" width={968} height={968} />
            <span className="wp-pass__who">
              <span className="wp-pass__employer stretch-display">{story.employer}</span>
              <span className="wp-pass__role">{story.role}</span>
              <span className="wp-pass__dates stretch-mono">{story.dates}</span>
            </span>
          </span>
          <span className="wp-pass__stat">
            <span className="wp-pass__value stretch-display">Only</span>
            <span className="wp-pass__label">C# engineer on the team</span>
          </span>
          <span className="wp-pass__foot stretch-mono">
            <span className="wp-barcode" aria-hidden="true" />
            <span>{story.setting}</span>
          </span>
        </div>
      </div>
      <ul className="rsv-pins" aria-label="Awards">
        {pins.map((pin) => (
          <li key={pin.label}>
            {pinsAsLinks ? (
              <a className="rsv-pin" href={pin.href}>
                <span className="rsv-pin__label">{pin.label}</span>
                <span className="rsv-pin__detail stretch-mono">{pin.detail}</span>
              </a>
            ) : (
              <span className="rsv-pin">
                <span className="rsv-pin__label">{pin.label}</span>
                <span className="rsv-pin__detail stretch-mono">{pin.detail}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Two measured before/afters, drawn to scale from the story's own numbers. */
function BeforeAfter() {
  const rows = [
    { what: "Integrating a pricer", before: { w: 100, label: "about two weeks, experienced" }, after: { w: 20, label: "a couple of days, new to it" } },
    { what: "The competition dashboard’s data load", before: { w: 100, label: "30–40 min" }, after: { w: 14, label: "under 5 min" } },
  ];
  return (
    <figure className="rsv-ba">
      {rows.map((row) => (
        <div key={row.what} className="rsv-ba__row">
          <p className="rsv-ba__what">{row.what}</p>
          <div className="rsv-ba__bar rsv-ba__bar--before" style={{ "--w": `${row.before.w}%` } as CSSProperties}>
            <span className="stretch-mono">Before · {row.before.label}</span>
          </div>
          <div className="rsv-ba__bar rsv-ba__bar--after" style={{ "--w": `${row.after.w}%` } as CSSProperties}>
            <span className="stretch-mono">After · {row.after.label}</span>
          </div>
        </div>
      ))}
      <figcaption className="stretch-mono rsv-cap">Bars to scale. Two weeks taken as ten working days.</figcaption>
    </figure>
  );
}

function Certificate({ compact = false }: { compact?: boolean }) {
  return (
    <figure id="certificate" className={`rsv-cert${compact ? " rsv-cert--compact" : ""}`}>
      <div className="rsv-cert__frame">
        <span className="stretch-fastener stretch-fastener--tape" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element -- prototype, local-only asset */}
        <img
          src={CERT}
          width={1600}
          height={900}
          alt="_nology’s Q1 2026 Take Ownership award certificate for Elias Bennett, citing his move into a C# role with no prior experience, production C# in pricing and risk systems, onboarding documentation and a winning digitisation project."
        />
      </div>
      <figcaption className="stretch-mono rsv-cap">Take Ownership · _nology · Q1 2026 · awarded May 2026</figcaption>
    </figure>
  );
}

/* ---------------- A · Pass (chosen) ---------------- */

/** Evidence the award pins already carry, left out of A's strip. */
const pinned = new Set(["Q1 2026", "Spring 2026"]);

function VariantA({ story }: { story: RoleStory }) {
  const colours = roleStoryColours(story.colours);
  return (
    <Shell story={story} variant="A">
      <article aria-labelledby="role-story-title">
        <section className="stretch-cs-open rsv-a-open" style={storyColours(colours)} aria-label="Overview">
          <div className="stretch-wrap stretch-cs-open__inner">
            <Back />
            <div className="stretch-cs-open__text">
              <p className="stretch-display stretch-cs-open__number" aria-hidden="true">
                {story.number}
              </p>
              <h1 id="role-story-title" className="stretch-display stretch-cs-open__name">
                {story.employer}
              </h1>
              <p className="stretch-cs-open__outcome">{story.role}</p>
              <p className="stretch-mono stretch-cs-open__meta">{roleStoryMetadata(story)}</p>
            </div>
            <BandPass story={story} />
          </div>
        </section>
        <StorySectionLinks sections={sections} />
        <div className="stretch-cs-body stretch-wrap">
          {roleStorySectionKeys.map((key, position) => (
            <StorySection key={key} id={key} label={roleStorySectionLabels[key]} position={position} section={story.sections[key]}>
              {/* Chosen (#198): B's flag figure joins A, and the strip drops the awards the pins already show. */}
              {key === "decisions" && (
                <div className="rsv-a-figure" style={storyColours(colours)}>
                  <FlagSketch />
                </div>
              )}
              {key === "what-changed" && (
                <>
                  <BeforeAfter />
                  <div className="stretch-role-evidence rsv-a-evidence" style={storyColours(colours)}>
                    <StoryEvidence evidence={story.evidence.filter((item) => !pinned.has(item.value))} />
                  </div>
                </>
              )}
              {key === "what-i-took-with-me" && <Certificate />}
            </StorySection>
          ))}
        </div>
      </article>
    </Shell>
  );
}

/* ---------------- B · Exhibits ---------------- */

/** The role: one engine, two execution paths, drawn from the story's facts. */
function EngineSketch() {
  return (
    <figure className="rsv-ex rsv-engine">
      <div className="rsv-engine__box">
        <span className="stretch-display rsv-engine__n">~70</span>
        <span className="stretch-mono">projects · one C# engine</span>
      </div>
      <div className="rsv-engine__paths">
        <span className="rsv-engine__path">CPU</span>
        <span className="rsv-engine__path">GPU · translated C#</span>
      </div>
      <figcaption className="stretch-mono rsv-cap">Exhibit 1 · the engines</figcaption>
    </figure>
  );
}

/** The problems: Java loaders become one C# loader that checks on the way in. */
function LoaderSketch() {
  return (
    <figure className="rsv-ex rsv-loader">
      <ul className="rsv-loader__sources">
        <li>Several sources</li>
        <li>Loaders in Java</li>
      </ul>
      <span className="rsv-loader__arrow" aria-hidden="true">→</span>
      <div className="rsv-loader__one">
        <span>Ported to C#, one place</span>
        <span className="stretch-mono rsv-loader__gate">checked on the way in</span>
      </div>
      <figcaption className="stretch-mono rsv-cap">Exhibit 2 · several sources, one place</figcaption>
    </figure>
  );
}

/** The decision: a new path behind a flag that defaults to off. */
function FlagSketch() {
  return (
    <figure className="rsv-ex rsv-flag">
      <div className="rsv-flag__row">
        <span className="rsv-flag__path">Live pricing · today’s path</span>
        <span className="rsv-flag__on stretch-mono">on</span>
      </div>
      <div className="rsv-flag__row rsv-flag__row--new">
        <span className="rsv-flag__path">New path · no stale file · cached</span>
        <span className="rsv-flag__toggle" aria-hidden="true">
          <span />
        </span>
        <span className="stretch-mono">off by default</span>
      </div>
      <figcaption className="stretch-mono rsv-cap">Exhibit 3 · protect the blast radius</figcaption>
    </figure>
  );
}

function ExhibitPins() {
  return (
    <ul className="rsv-b-pins" aria-label="Evidence">
      {roleStories["bnp-paribas"].evidence.map((item) => (
        <li key={item.label} className="rsv-b-pin">
          <span className="stretch-display rsv-b-pin__value">{item.value}</span>
          <span className="stretch-mono rsv-b-pin__label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

const exhibits: Partial<Record<RoleStorySectionKey, () => ReactNode>> = {
  "the-role": () => <EngineSketch />,
  "the-problems": () => <LoaderSketch />,
  decisions: () => <FlagSketch />,
  "what-changed": () => (
    <>
      <BeforeAfter />
      <ExhibitPins />
    </>
  ),
  "what-i-took-with-me": () => <Certificate compact />,
};

function VariantB({ story }: { story: RoleStory }) {
  const colours = roleStoryColours(story.colours);
  return (
    <Shell story={story} variant="B">
      <article aria-labelledby="role-story-title">
        <section className="stretch-cs-open" style={storyColours(colours)} aria-label="Overview">
          <div className="stretch-wrap stretch-cs-open__inner">
            <Back />
            <div className="stretch-cs-open__text">
              <p className="stretch-display stretch-cs-open__number" aria-hidden="true">
                {story.number}
              </p>
              <h1 id="role-story-title" className="stretch-display stretch-cs-open__name">
                {story.employer}
              </h1>
              <p className="stretch-cs-open__outcome">{story.role}</p>
              <p className="stretch-mono stretch-cs-open__meta">{roleStoryMetadata(story)}</p>
            </div>
          </div>
        </section>
        <StorySectionLinks sections={sections} />
        <div className="stretch-cs-body stretch-wrap rsv-b-body" style={storyColours(colours)}>
          {roleStorySectionKeys.map((key, position) => (
            <div key={key} className="rsv-b-row" data-has-exhibit={exhibits[key] ? "" : undefined}>
              <StorySection id={key} label={roleStorySectionLabels[key]} position={position} section={story.sections[key]} />
              {exhibits[key] && <div className="rsv-b-exhibit">{exhibits[key]()}</div>}
            </div>
          ))}
        </div>
      </article>
    </Shell>
  );
}

/* ---------------- C · Timeline (stretch) ---------------- */

/** Stops along the dates. Only dates the story already states; "six months in" stays relative. */
const stops: { when: string; what: string; detail: string; cert?: boolean; now?: boolean }[] = [
  { when: "Jul 2025", what: "Joined, never having written C#", detail: "The team’s only C# engineer, on engines that price and risk-manage trades" },
  { when: "Nov 2025", what: "Won the Early Careers digitisation competition", detail: "Led four; a 30–40 minute data load cut to under 5. Presented to the Head of Risk Systems" },
  { when: "Six months in", what: "Shipping production C# independently", detail: "A pricer integrated in a couple of days, against about two weeks" },
  { when: "Q1 2026", what: "Take Ownership award", detail: "_nology’s Tech Consultant of the quarter", cert: true },
  { when: "Spring 2026", what: "Nominated AI Champion", detail: "The phased AI workflow is now used by several teams" },
  { when: "Now", what: "Owns implementation and delivery on the C# side", detail: "From planning through review", now: true },
];

function VariantC({ story }: { story: RoleStory }) {
  const colours = roleStoryColours(story.colours);
  return (
    <Shell story={story} variant="C">
      <article aria-labelledby="role-story-title">
        <section className="stretch-cs-open rsv-c-open" style={storyColours(colours)} aria-label="Overview">
          <div className="stretch-wrap stretch-cs-open__inner">
            <Back />
            <div className="stretch-cs-open__text">
              <p className="stretch-display stretch-cs-open__number" aria-hidden="true">
                {story.number}
              </p>
              <h1 id="role-story-title" className="stretch-display stretch-cs-open__name">
                {story.employer}
              </h1>
              <p className="stretch-cs-open__outcome">{story.role}</p>
              <p className="stretch-mono stretch-cs-open__meta">{roleStoryMetadata(story)}</p>
            </div>
          </div>
          <ol className="stretch-wrap rsv-c-line" aria-label="Timeline">
            {stops.map((stop) => (
              <li key={stop.when} className="rsv-c-stop" data-now={stop.now || undefined}>
                <span className="rsv-c-dot" aria-hidden="true" />
                <span className="stretch-mono rsv-c-when">{stop.when}</span>
                <span className="rsv-c-what">{stop.what}</span>
                <span className="rsv-c-detail">{stop.detail}</span>
                {stop.cert && (
                  <a className="rsv-c-cert" href="#certificate">
                    {/* eslint-disable-next-line @next/next/no-img-element -- prototype */}
                    <img src={CERT} alt="" width={1600} height={900} />
                    <span className="stretch-mono">See the certificate ↓</span>
                  </a>
                )}
              </li>
            ))}
          </ol>
        </section>
        <StorySectionLinks sections={sections} />
        <div className="stretch-cs-body stretch-wrap">
          {roleStorySectionKeys.map((key, position) => (
            <StorySection key={key} id={key} label={roleStorySectionLabels[key]} position={position} section={story.sections[key]}>
              {key === "what-i-took-with-me" && <Certificate />}
            </StorySection>
          ))}
        </div>
      </article>
    </Shell>
  );
}

export function RoleStoryVariant({ story, variant }: { story: RoleStory; variant: RoleVariant }) {
  if (variant === "A") return <VariantA story={story} />;
  if (variant === "B") return <VariantB story={story} />;
  return <VariantC story={story} />;
}

export function TodaySwitcher() {
  return <RoleStorySwitcher current={null} variants={ROLE_VARIANTS} names={names} />;
}
