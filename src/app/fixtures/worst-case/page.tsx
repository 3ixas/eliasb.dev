import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Panel, PanelHead } from "@/components/parts/panel";
import { PassCard } from "@/components/parts/staff-pass";
import { ProjectPanel } from "@/components/parts/project-panel";
import { EvidenceFigures, NextPanel } from "@/components/site/story-parts";
import { projects, type Project } from "@/content/projects";
import { roleStories } from "@/content/stretch/role-stories";
import { passHang, passRecords } from "@/content/stretch/staff-pass";
import { MAX_EVIDENCE, TEXT_LIMITS, type EvidenceItem } from "@/content/stretch/story";

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
            <ProjectPanel project={project({ name: spaced(TEXT_LIMITS.name), outcome: spaced(78), ...noShot })} line={spaced(78)} figures={evidence(MAX_EVIDENCE)} />
            <ProjectPanel project={project({ name: unbroken(TEXT_LIMITS.name), ...noShot })} line={spaced(78)} />
            <ProjectPanel project={project({ name: spaced(78) })} line={spaced(78)} figures={evidence(6)} meta />
            <ProjectPanel project={project({ name: "", outcome: "", links: { live: "https://example.com" }, ...noShot, panel: undefined })} line="" />
          </div>
          <div style={{ marginTop: 32 }}>
            <ProjectPanel project={project({ name: spaced(TEXT_LIMITS.name) })} line={spaced(78)} figures={evidence(6)} wide />
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

        <div data-case="next">
          <NextPanel label="Next role" href="#next" name={spaced(TEXT_LIMITS.name)} line={spaced(78)} colours={field} />
          <NextPanel label="Next project" href="#next" name={unbroken(TEXT_LIMITS.name)} line="" colours={field} />
        </div>
      </div>
    </main>
  );
}
