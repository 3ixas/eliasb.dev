import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import "@/app/pass.css";
import { Panel, PanelHead } from "@/components/parts/panel";
import { PassCard } from "@/components/parts/staff-pass";
import { ProjectPanel } from "@/components/parts/project-panel";
import { WorkingFigure } from "@/components/parts/working-figure";
import { ArgusProvenanceView } from "@/components/site/argus-provenance";
import { hostLabel } from "@/components/site/host-label";
import { HowIWork } from "@/components/site/how-i-work";
import { EvidenceFigures, NextPanel, StoryText } from "@/components/site/story-parts";
import { ProjectRow } from "@/components/site/things-i-make";
import { ThresholdCitySwitcher } from "@/components/site/threshold-city-switcher";
import { ThresholdLinkView } from "@/components/site/threshold-link";
import { WhereImHeaded } from "@/components/site/where-im-headed";
import { RolePanelView } from "@/components/site/work";
import { projects, type Project } from "@/content/projects";
import { argusProvenanceCopy, type ArgusPosition } from "@/content/stretch/argus-provenance";
import { howIWork, type Beat, type BeatProof } from "@/content/stretch/how-i-work";
import { roleStories } from "@/content/stretch/role-stories";
import { passHang, passRecords } from "@/content/stretch/staff-pass";
import { MAX_EVIDENCE, TEXT_LIMITS, type EvidenceItem } from "@/content/stretch/story";
import { thresholdDisplayLink, thresholdLink, thresholdLinkCopy, type ThresholdChoice } from "@/content/stretch/threshold-link";
import { work, type HeadedProof } from "@/content/stretch/work";
import { workPanels, type RolePanel } from "@/content/stretch/work-panels";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/*
 * The worst plausible value for each printed field, plus empty, one and huge, put through the same parts as the real
 * data (R-35). "Limit" values are the longest the content checks accept (TEXT_LIMITS); "huge" goes past them, to show the
 * layout bends before it breaks. A spaced name wraps; an unbroken one breaks anywhere.
 */
const spaced = (length: number) => "Meridian Atlantic Continental Banking and Settlement Group of Companies International".slice(0, length).trimEnd();
const unbroken = (length: number) => "Pneumonoultramicroscopicsilicovolcanoconiosis-Supercalifragilistic".slice(0, length);
const figure = "−40,000%";
const evidence = (count: number, value = figure): EvidenceItem[] => Array.from({ length: count }, (_, index) => ({ value, label: `measured thing number ${index + 1} with a label of some length` }));

const template = projects[0];
const project = (overrides: Partial<Project>): Project => ({ ...template, ...overrides });
const noShot = { screenshot: undefined };
const field = roleStories.joveen.panel;

/* The parts the refinement added (#544). No content check limits these values, so each is well past what the site prints. */
const sentence = "Reconciling intraday settlement exposure across counterparties, venues and currencies before the cut-off";
const identifier = "PricingEngineConfigurationDependencyInjection";

/** Joveen's and Optegra's trays, their figures still their stories' own. */
const longMetrics = [
  { what: "Key partner-facing API p95 latency at peak", value: "12,500 ms → 2,300 ms" },
  { what: "Time to deploy to every production region", value: "45 min → under 12 min" },
  { what: "Consultation conversion on mobile devices", value: "+1,300%" },
] as const;
const trays: readonly RolePanel[] = workPanels.roles.map((panel) => {
  const [first, second, third] = panel.pairs;
  return { ...panel, pairs: [{ ...first, ...longMetrics[0] }, { ...second, ...longMetrics[1] }, { ...third, ...longMetrics[2] }] };
});

const longDrawn = (drawn: HeadedProof): HeadedProof =>
  drawn.kind === "months-to-prod" ? { ...drawn, months: 12 } : drawn.kind === "count-to-live" ? { ...drawn, value: 200 } : drawn;
const bars = work.headed.bars.map((bar) => ({ ...bar, title: `${sentence}.`, soFar: { ...bar.soFar, text: `${sentence}, ${sentence.toLowerCase()}.` }, drawn: longDrawn(bar.drawn) }));

const longProof = (drawn: BeatProof): BeatProof => {
  switch (drawn.kind) {
    case "projects":
      return { ...drawn, projects: ["threshold", "argus-risk", "flowtime"] };
    case "count":
      return { ...drawn, value: 1000 };
    case "switch":
      return { ...drawn, off: "Switched off", on: "Switched on", currentPath: "Today’s synchronous reference data path", newPath: "New cached asynchronous path behind the flag" };
    case "change":
      return { ...drawn, value: "+1,000%", before: "Last year", after: "This year" };
  }
};
const beats: readonly Beat[] = howIWork.beats.map((beat) => ({ ...beat, habit: `${sentence}.`, proof: `${sentence}: ${beat.highlight}. ${beat.proof}`, drawn: longProof(beat.drawn) }));

/** Threshold's longest real link: the choices come from Threshold's own lists. */
const longChoice: ThresholdChoice = { city: "london", district: "hammersmith-fulham", place: "studio" };
const longHref = thresholdLink(longChoice);
const longUrl = thresholdDisplayLink(longChoice);
const longHost = hostLabel(longHref);
const cities = [
  { id: "london", name: "Newcastle upon Tyne", href: longHref, displayUrl: longUrl, host: longHost },
  { id: "basel", name: "La Chaux-de-Fonds", href: longHref, displayUrl: longUrl, host: longHost },
  { id: "zurich", name: "Affoltern am Albis", href: longHref, displayUrl: longUrl, host: longHost },
] as const;
const threshold = projects.find(({ slug }) => slug === "threshold")!;

/** Long symbols, seven-figure values either way and an old price; every row opens, so its source shows. */
const positions: readonly ArgusPosition[] = [
  { symbol: "NOVO-B.CO", currency: "USD", quantity: 1_000, cost: 112.5, price: 1234.56, age: 3600 },
  { symbol: "ASML.AS", currency: "EUR", quantity: 12_000, cost: 987.65, price: 876.54, age: 7 },
  { symbol: "ULVR.L", currency: "GBP", quantity: 250_000, cost: 41.2, price: 49.87, age: 1 },
];
const argus = projects.find(({ slug }) => slug === "argus-risk")!;

const row = (key: string, overrides: Partial<Project>) => <ProjectRow key={key} project={project({ slug: key, ...overrides })} />;

/** The pass for an employer of this name, in the current pass's colours. */
const pass = (name: string, id: string) => (
  <PassCard id={id} name={`Staff pass: ${name}`} record={{ ...passRecords["bnp-paribas"], short: name }} hang={passHang["bnp-paribas"]} role="Software engineer" dates="Jul 2025 – now" panel={roleStories["bnp-paribas"].panel} />
);

export default async function WorstCaseFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1} style={{ minHeight: "100vh", background: "var(--page)", color: "var(--ink)", fontFamily: "var(--sans)", paddingBottom: 144 }}>
      <div className="frame">
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "var(--type-title)", lineHeight: 0.95, letterSpacing: "-0.04em", paddingBlock: "96px 0" }}>Worst case</h1>

        <section className="section" aria-labelledby="passes" data-case="passes" style={{ paddingTop: 64 }}>
          <h2 id="passes" className="section__title">
            Passes
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
            {pass(spaced(TEXT_LIMITS.passName), "limit")}
            {pass(spaced(78), "huge")}
            {pass(unbroken(TEXT_LIMITS.name), "unbroken")}
            {pass("", "empty")}
          </div>
        </section>

        <section className="section" aria-labelledby="heads" data-case="heads">
          <h2 id="heads" className="section__title">
            Panel names
          </h2>
          <div className="panels panels--two">
            <Panel colours={field}>
              <PanelHead name={spaced(TEXT_LIMITS.name)} meta={[spaced(TEXT_LIMITS.name), "Jul 2025 – now"]} />
            </Panel>
            <Panel colours={field}>
              <PanelHead name={unbroken(TEXT_LIMITS.name)} meta={[unbroken(TEXT_LIMITS.name)]} />
            </Panel>
            <Panel colours={field}>
              <PanelHead name={spaced(78)} meta={[spaced(78), unbroken(50)]} />
            </Panel>
            <Panel colours={field}>
              <PanelHead name="" />
            </Panel>
          </div>
        </section>

        <section className="section" aria-labelledby="projects" data-case="projects">
          <h2 id="projects" className="section__title">
            Projects
          </h2>
          <div className="panels panels--two">
            <ProjectPanel project={project({ name: spaced(TEXT_LIMITS.name), outcome: spaced(78), ...noShot })} line={spaced(78)} />
            <ProjectPanel project={project({ name: unbroken(TEXT_LIMITS.name), ...noShot })} line={spaced(78)} />
            <ProjectPanel project={project({ name: spaced(78) })} line={spaced(78)} meta />
            <ProjectPanel project={project({ name: "", outcome: "", links: { live: "https://example.com" }, ...noShot, panel: undefined })} line="" />
          </div>
          <div style={{ marginTop: 32 }}>
            <ProjectPanel project={project({ name: spaced(TEXT_LIMITS.name) })} line={spaced(78)} wide />
          </div>
        </section>

        <section className="section" aria-labelledby="figures" data-case="figures">
          <h2 id="figures" className="section__title">
            Evidence figures
          </h2>
          <div style={{ display: "grid", gap: 32 }}>
            {[0, 1, MAX_EVIDENCE, 6].map((count) => (
              <EvidenceFigures key={count} evidence={evidence(count)} />
            ))}
          </div>
        </section>

        <div className="section work" data-case="trays">
          <h2 className="section__title">Role trays</h2>
          <div className="panels panels--two panels--aligned">
            {trays.map((panel) => (
              <RolePanelView key={panel.slug} panel={panel} />
            ))}
          </div>
        </div>

        <div className="section" data-case="headed">
          <WhereImHeaded bars={bars} />
        </div>

        <div data-case="how">
          <HowIWork beats={beats} />
        </div>

        <section className="section" aria-labelledby="switcher" data-case="switcher">
          <h2 id="switcher" className="section__title">
            City switcher
          </h2>
          <ProjectPanel project={threshold} line={spaced(78)} wide controls={<ThresholdCitySwitcher cities={cities} initialCity="london" label={thresholdLinkCopy.city} />} />
        </section>

        <section className="section" aria-labelledby="figures-working" data-case="working">
          <h2 id="figures-working" className="section__title">
            Working figures
          </h2>
          <WorkingFigure caption={thresholdLinkCopy.caption} colours={threshold.panel!}>
            <ThresholdLinkView choice={longChoice} />
          </WorkingFigure>
          <WorkingFigure caption={argusProvenanceCopy.caption} colours={argus.panel!}>
            <ArgusProvenanceView positions={positions} open={positions.map(({ symbol }) => symbol)} />
          </WorkingFigure>
        </section>

        <section className="section" aria-labelledby="cards" data-case="cards">
          <h2 id="cards" className="section__title">
            Problem and Decision cards
          </h2>
          <StoryText
            body={{
              points: [
                { lead: `${sentence}.`, text: `${sentence}, ${sentence.toLowerCase()}.` },
                { lead: `Replace ${identifier}.`, text: `${identifier} resolved every dependency at start-up.` },
              ],
            }}
          />
        </section>

        <section className="section" aria-labelledby="rows" data-case="rows">
          <h2 id="rows" className="section__title">
            Project rows
          </h2>
          <ul className="rows things__rows">
            {row("long", { name: spaced(TEXT_LIMITS.name), outcome: `${sentence}.`, links: { code: "https://example.com" } })}
            {row("unbroken", { name: unbroken(TEXT_LIMITS.name), outcome: `${sentence}.` })}
          </ul>
        </section>

        <div data-case="next">
          <NextPanel label="Next role" href="#next" name={spaced(TEXT_LIMITS.name)} line={spaced(78)} colours={field} />
          <NextPanel label="Next project" href="#next" name={unbroken(TEXT_LIMITS.name)} line="" colours={field} />
        </div>
      </div>
    </main>
  );
}
