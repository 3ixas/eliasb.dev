/*
 * PROTOTYPE (#493), throwaway: three ways to stop the staff passes and the Work panels telling the same story.
 * Switch with ?v=a, ?v=b or ?v=c, or the bar at the bottom. Nothing here is production code; the chosen variant is
 * rebuilt properly in its own ticket and this route is deleted. The passes are drawn flat (no 3D lanyard) in all three.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MeasurePair, MeasureSide } from "@/components/parts/measure";
import { Arrow, Panel, PanelHead } from "@/components/parts/panel";
import { StaffPass } from "@/components/parts/staff-pass";
import { SiteHeader } from "@/components/site/site-header";
import { WhereImHeaded } from "@/components/site/where-im-headed";
import { opening, type Run } from "@/content/stretch/opening";
import { roleStories } from "@/content/stretch/role-stories";
import type { RoleStorySlug } from "@/content/stretch/role-story";
import { passRecords } from "@/content/stretch/staff-pass";
import { comparisonRow, displayFigure, workPanels, type Pair } from "@/content/stretch/work-panels";
import "./prototype.css";

export const metadata: Metadata = { title: "Prototype: passes and Work", robots: { index: false, follow: false } };

const variants = {
  a: { name: "A · The pass says who", note: "The passes print who and when, no numbers. The numbers live once, drawn in Work." },
  b: { name: "B · The pass hangs in its panel", note: "The opening is words only. Each Work panel carries its pass, printing who and when; the panel holds what changed." },
  c: { name: "C · The passes are the summary", note: "The passes keep their three points up top. Work becomes three quiet rows into the stories." },
} as const;
type Variant = keyof typeof variants;

const slugs: RoleStorySlug[] = ["bnp-paribas", "joveen", "optegra"];

function RunView({ run }: { run: Run }) {
  if (run.mark === "employer") return <span className="opening__employer">{run.text}</span>;
  if (run.mark === "emphasis") return <span className="opening__own">{run.text}</span>;
  return run.text;
}

function OpeningWords() {
  return (
    <div className="opening__text">
      <h1 id="opening-line" className="opening__line">
        {opening.headlineRuns.map((run, index) => (
          <RunView key={index} run={run} />
        ))}
      </h1>
      <p className="opening__support">{opening.support}</p>
    </div>
  );
}

/** The opening with its three passes hanging at the right (A and C), drawn flat. */
function OpeningWithPasses() {
  return (
    <section className="frame opening" aria-labelledby="opening-line">
      <OpeningWords />
      <div className="opening__rail">
        <StaffPass slug="bnp-paribas" href="#bnp-paribas" lead priority />
        <StaffPass slug="joveen" href="#joveen" drop={0.7} />
        <StaffPass slug="optegra" href="#optegra" drop={0.85} />
      </div>
    </section>
  );
}

function StoryLink({ slug, outline = false }: { slug: RoleStorySlug; outline?: boolean }) {
  return (
    <Link className={outline ? "pill pill--outline work__story" : "pill work__story"} href={`/work/${slug}`}>
      {`The ${passRecords[slug].short} story`}
      <Arrow />
    </Link>
  );
}

function BnpEvidence() {
  const { slug, comparisons } = workPanels.bnp;
  const story = roleStories[slug];
  return (
    <ul>
      {comparisons.map((comparison) => {
        const row = comparisonRow(story, comparison)!;
        return (
          <li key={row.what}>
            <h4>{row.what}</h4>
            <p className="cmp">
              <span>{comparison.before.name}</span>
              <b>{comparison.before.value}</b>
              <MeasureSide measure={row} side="before" />
            </p>
            <p className="cmp cmp--after">
              <span>{comparison.after.name}</span>
              <b>{comparison.after.value}</b>
              <MeasureSide measure={row} side="after" />
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function Pairs({ pairs }: { pairs: readonly Pair[] }) {
  return (
    <ul className="pairs">
      {pairs.map((pair) => (
        <li key={pair.what} className="pair">
          <span className="pair__what">{pair.what}</span>
          <MeasurePair measure={pair} />
          <b className="pair__value">{pair.value}</b>
        </li>
      ))}
    </ul>
  );
}

/** Today's Work section, unchanged (A). */
function WorkAsToday() {
  return (
    <section id="work" className="frame section work" aria-labelledby="work-heading">
      <h2 id="work-heading" className="section__title">{workPanels.heading}</h2>
      <p className="work__subheading">{workPanels.subheading}</p>
      <div className="panels">
        <Panel id="bnp-paribas" colours={roleStories["bnp-paribas"].panel} className="work-bnp">
          <PanelHead name={passRecords["bnp-paribas"].short} meta={[roleStories["bnp-paribas"].role, roleStories["bnp-paribas"].dates]} />
          <p className="work-bnp__figure">
            <span className="figure__words">{workPanels.bnp.figure.value}</span>
            <span className="figure__label">{workPanels.bnp.figure.label}</span>
          </p>
          <div className="work-bnp__comparisons"><BnpEvidence /></div>
          <StoryLink slug="bnp-paribas" />
        </Panel>
        <div className="panels panels--two panels--aligned">
          {workPanels.roles.map((panel) => {
            const story = roleStories[panel.slug];
            const { value, label } = displayFigure(story, panel.figure)!;
            return (
              <Panel key={panel.slug} id={panel.slug} colours={story.panel} className="work-role">
                <PanelHead name={passRecords[panel.slug].short} meta={[story.role, story.dates]} />
                <p className="work-role__figure">
                  <span className="figure__value">{value}</span>
                  <span className="figure__label">{label}</span>
                </p>
                <Pairs pairs={panel.pairs} />
                <StoryLink slug={panel.slug} outline />
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** B: each employer's panel, full width, with its pass hanging from the panel's top edge at the right. */
function WorkWithPassInside() {
  return (
    <section id="work" className="frame section work" aria-labelledby="work-heading">
      <h2 id="work-heading" className="section__title">{workPanels.heading}</h2>
      <p className="work__subheading">{workPanels.subheading}</p>
      <div className="panels">
        {slugs.map((slug) => {
          const story = roleStories[slug];
          const role = workPanels.roles.find((panel) => panel.slug === slug);
          const figure = role ? displayFigure(story, role.figure)! : workPanels.bnp.figure;
          return (
            <Panel key={slug} id={slug} colours={story.panel} className="proto-b__panel">
              <div className="proto-b__body">
                <h3 className="sr-only">{passRecords[slug].short}</h3>
                <p className="proto-b__figure">
                  <span className={role ? "figure__value" : "figure__words"}>{figure.value}</span>
                  <span className="figure__label">{figure.label}</span>
                </p>
                <div className="proto-b__evidence">{role ? <Pairs pairs={role.pairs} /> : <div className="work-bnp__comparisons"><BnpEvidence /></div>}</div>
                <StoryLink slug={slug} outline={Boolean(role)} />
              </div>
              <div className="proto-b__hang">
                <StaffPass slug={slug} lead={slug === "bnp-paribas"} />
              </div>
            </Panel>
          );
        })}
      </div>
    </section>
  );
}

/** C: Work as three rows, each into its Role story; the passes above carry the numbers. */
function WorkAsRows() {
  return (
    <section id="work" className="frame section work" aria-labelledby="work-heading">
      <h2 id="work-heading" className="section__title">{workPanels.heading}</h2>
      <p className="work__subheading">{workPanels.subheading}</p>
      <ul className="rows proto-c__rows">
        {slugs.map((slug) => {
          const story = roleStories[slug];
          return (
            <li key={slug} id={slug}>
              <Link className="row" href={`/work/${slug}`}>
                <span className="row__name">{passRecords[slug].short}</span>
                <span className="row__line">{story.role}</span>
                <span className="row__meta">
                  {story.dates}
                  <Arrow />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default async function PassAndWorkPrototype({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1" && process.env.VERCEL_ENV !== "preview") notFound();
  const asked = (await searchParams).v;
  const v: Variant = asked === "b" || asked === "c" ? asked : "a";
  return (
    <div data-site className={`proto proto--${v}`}>
      <SiteHeader home />
      <main id="main-content" tabIndex={-1}>
        {v === "b" ? (
          <section className="frame opening proto-b__opening" aria-labelledby="opening-line">
            <OpeningWords />
          </section>
        ) : (
          <OpeningWithPasses />
        )}
        {v === "a" && <WorkAsToday />}
        {v === "b" && <WorkWithPassInside />}
        {v === "c" && <WorkAsRows />}
        <WhereImHeaded />
      </main>
      <nav className="proto-bar" aria-label="Prototype variants">
        <p>{variants[v].note}</p>
        <div>
          {(Object.keys(variants) as Variant[]).map((key) => (
            <a key={key} href={`?v=${key}`} aria-current={key === v ? "page" : undefined}>
              {variants[key].name}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
