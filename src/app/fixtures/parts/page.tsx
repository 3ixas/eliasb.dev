import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Count, OnView } from "@/components/parts/on-view";
import { Arrow, Panel, PanelHead } from "@/components/parts/panel";
import { featuredSlugs, projects } from "@/content/projects";
import { caseStudies } from "@/content/stretch/case-studies";
import { roleStories, roleStorySlugs } from "@/content/stretch/role-stories";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const featured = featuredSlugs.map((slug) => projects.find((project) => project.slug === slug)!);
const others = projects.filter((project) => !(featuredSlugs as readonly string[]).includes(project.slug));

/**
 * The shared parts (parts.css; DESIGN.md "The panel", "Controls" and "Motion") on the page and on every panel field,
 * as the prototype's parts.html shows them, for the end-to-end suite and its pictures. Its groups carry `data-shot`
 * for e2e/materials.spec.ts. Below the fold it holds a panel that rises, a figure that counts and bars that grow.
 * It exists only when the server is started with BOARD_FIXTURES=1.
 */
export default async function PartsFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1} style={{ minHeight: "100vh", background: "var(--page)", color: "var(--ink)", fontFamily: "var(--sans)", paddingBottom: 144 }}>
      <div className="frame">
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "var(--type-title)", lineHeight: 0.95, letterSpacing: "-0.04em", paddingBlock: "96px 0" }}>Parts</h1>

        <section className="section" aria-labelledby="controls" style={{ paddingTop: 64 }}>
          <h2 id="controls" className="section__title">
            Controls
          </h2>
          <div data-shot="controls" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 16px", padding: 16, background: "var(--page)" }}>
            <button className="button" type="button">
              Copy
            </button>
            <a className="button" href="#controls">
              Download PDF
            </a>
            <div role="group" aria-label="Filter projects" style={{ display: "flex", gap: 8 }}>
              <button className="button" type="button" aria-pressed="true">
                All
              </button>
              <button className="button" type="button" aria-pressed="false">
                Products
              </button>
            </div>
            <a className="text-link" href="#controls">
              Everything I’ve built ({String(projects.length).padStart(2, "0")})
              <Arrow />
            </a>
            <ul className="chips" aria-label="Stack">
              {caseStudies.threshold.stack.map((item) => (
                <li key={item} className="chip">
                  {item}
                </li>
              ))}
            </ul>
            <span className="chip chip--source" style={{ ["--source" as string]: "var(--green)" }}>
              BNP Paribas
            </span>
          </div>
        </section>

        <section className="section" aria-labelledby="panels">
          <h2 id="panels" className="section__title">
            Panels
          </h2>
          <div data-shot="panels" className="panels panels--three" style={{ background: "var(--page)" }}>
            {roleStorySlugs.map((slug) => {
              const story = roleStories[slug];
              return (
                <Panel key={slug} as="article" colours={story.panel} data-panel={slug}>
                  <PanelHead name={story.employer} meta={[story.role, story.dates]} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40 }}>
                    <a className="pill" href={`#${slug}`}>
                      The {story.employer} story <Arrow />
                    </a>
                    <a className="pill pill--outline" href={`#${slug}`}>
                      Code <Arrow out />
                    </a>
                  </div>
                </Panel>
              );
            })}
            {featured.map((project) => (
              <Panel key={project.slug} as="article" colours={project.panel} glow data-panel={project.slug}>
                <PanelHead name={project.name} meta={[project.type, String(project.year)]} />
                <ul className="chips" aria-label="Stack" style={{ marginTop: 24 }}>
                  {caseStudies[project.slug as keyof typeof caseStudies]?.stack.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
                  <a className="pill" href={`#${project.slug}`}>
                    Live site <Arrow out />
                  </a>
                  <a className="pill pill--outline" href={`#${project.slug}`}>
                    Code <Arrow out />
                  </a>
                </div>
              </Panel>
            ))}
          </div>
        </section>

        <section className="section" aria-labelledby="rows">
          <h2 id="rows" className="section__title">
            Rows on paper
          </h2>
          <div data-shot="rows" style={{ background: "var(--page)" }}>
            <Panel as="div" data-panel="paper">
              <PanelHead name="Things I make" />
              <ul className="rows" style={{ marginTop: 24 }}>
                {others.map((project) => (
                  <li key={project.slug}>
                    <a className="row" href={`#${project.slug}`}>
                      <span className="row__name">{project.name}</span>
                      <span className="row__line">{project.outcome}</span>
                      <span className="row__meta">
                        {project.year} <Arrow />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </section>

        {/* Below the fold on every screen this fixture is tested at, so each arrival is armed and plays once. */}
        <section className="section" aria-labelledby="arrivals" style={{ paddingTop: "max(144px, 110vh)" }}>
          <h2 id="arrivals" className="section__title">
            Arrivals
          </h2>
          <OnView motion="rise">
            <Panel colours={roleStories.joveen.panel} data-panel="rise">
              <PanelHead name={roleStories.joveen.employer} meta={[roleStories.joveen.role, roleStories.joveen.dates]} />
              <p data-count style={{ marginTop: 40, fontFamily: "var(--serif)", fontWeight: 500, fontSize: "var(--type-figure)", lineHeight: 1, fontVariantNumeric: "lining-nums tabular-nums" }}>
                <Count to={40} prefix="−" suffix="%" />
              </p>
              <p style={{ fontFamily: "var(--serif)", fontSize: "var(--type-prose)" }}>page load</p>
              <OnView motion="grow">
                <dl data-bars style={{ display: "grid", gap: 8, marginTop: 32, fontSize: "var(--type-small)" }}>
                  <dt>Key API p95</dt>
                  <dd style={{ margin: 0, display: "grid", gap: 6 }}>
                    <span>520 ms → 230 ms</span>
                    <i className="bar" style={{ display: "block", width: "100%", height: 6, borderRadius: 3, background: "var(--line)" }} />
                    <i className="bar bar--after" style={{ display: "block", width: `${(230 / 520) * 100}%`, height: 12, borderRadius: 6, background: "var(--panel-ink)" }} />
                  </dd>
                </dl>
              </OnView>
            </Panel>
          </OnView>
        </section>
      </div>
    </main>
  );
}
