import Link from "next/link";
import type { CSSProperties } from "react";
import { OnView, Count } from "@/components/parts/on-view";
import { Arrow, Panel, PanelHead } from "@/components/parts/panel";
import { simulation } from "@/components/site/simulation-model";
import { SimulationPlot } from "@/components/site/simulation-plot";
import { HeadedRows } from "@/components/quiet/headed-rows";
import { roleStories } from "@/content/stretch/role-stories";
import type { RoleStorySlug } from "@/content/stretch/role-story";
import { passRecords } from "@/content/stretch/staff-pass";
import { comparisonRow, countable, displayFigure, workPanels, type Pair, type RolePanel } from "@/content/stretch/work-panels";

/** A bar's length as a share of the longer of its pair, so both are drawn to one scale. */
const share = (amount: number, longest: number) => ({ "--share": amount / longest }) as CSSProperties;

/** The panel's header: the employer's short name (as on its pass), with its role and dates at the right. */
function Head({ slug }: { slug: RoleStorySlug }) {
  const { role, dates } = roleStories[slug];
  return <PanelHead name={passRecords[slug].short} meta={[role, dates]} />;
}

/** "The Optegra story →", a pill on the employer's own panel. */
function StoryLink({ slug, outline = false }: { slug: RoleStorySlug; outline?: boolean }) {
  return (
    <Link className={outline ? "pill pill--outline work__story" : "pill work__story"} href={`/work/${slug}`}>
      The {passRecords[slug].short} story
      <Arrow />
    </Link>
  );
}

/** The illustrative paths, the histogram of where they end, and a dashed line at their mean labelled "One price". */
function Simulation() {
  const { start, end, price, caption, description } = workPanels.bnp.simulation;
  const { bins, meanBin, mean } = simulation();
  const most = Math.max(...bins);
  return (
    <figure className="sim" aria-describedby="sim-description">
      <SimulationPlot>
        <div className="sim__hist" aria-hidden="true">
          {bins.map((count, index) => (
            <i
              key={index}
              className="sim__bin"
              data-count={count}
              data-mean={index === meanBin ? "" : undefined}
              style={{ "--share": count ? Math.max(count / most, 0.06) : 0 } as CSSProperties}
            />
          ))}
        </div>
        <span className="sim__price" style={{ "--at": mean } as CSSProperties}>
          <b>{price}</b>
        </span>
        <span className="sim__x sim__x--start" aria-hidden="true">
          {start}
        </span>
        <span className="sim__x sim__x--end" aria-hidden="true">
          {end}
        </span>
      </SimulationPlot>
      {/* Read as the figure's description and shown nowhere: the caption says what the engines do, this says what is drawn. */}
      <p id="sim-description" hidden>
        {description}
      </p>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** BNP Paribas, full width and green: its figure, the simulation, two comparisons to scale and the link to its story. */
function BnpPanel() {
  const { slug, figure, comparisons } = workPanels.bnp;
  const story = roleStories[slug];
  return (
    <OnView motion="rise">
      <Panel id={slug} colours={story.panel} className="work-bnp">
        <Head slug={slug} />
        <p className="work-bnp__figure">
          <span className="figure__words">{figure.value}</span>
          <span className="figure__label">{figure.label}</span>
        </p>
        <Simulation />
        <OnView motion="grow" className="work-bnp__comparisons">
          <ul>
            {comparisons.map((comparison) => {
              const row = comparisonRow(story, comparison)!;
              const longest = Math.max(row.before.amount, row.after.amount);
              return (
                <li key={row.what}>
                  <h4>{row.what}</h4>
                  <p className="cmp">
                    <span>{comparison.before.name}</span>
                    <b>{comparison.before.value}</b>
                    <i className="bar" style={share(row.before.amount, longest)} aria-hidden="true" />
                  </p>
                  <p className="cmp cmp--after">
                    <span>{comparison.after.name}</span>
                    <b>{comparison.after.value}</b>
                    <i className="bar bar--after" style={share(row.after.amount, longest)} aria-hidden="true" />
                  </p>
                </li>
              );
            })}
          </ul>
        </OnView>
        <StoryLink slug={slug} />
      </Panel>
    </OnView>
  );
}

/** One before and after pair: what moved, its two bars from one left edge, and the value written out at the right. */
function PairRow({ pair }: { pair: Pair }) {
  const longest = Math.max(pair.before, pair.after);
  return (
    <li className="pair">
      <span className="pair__what">{pair.what}</span>
      <i className="bar" style={share(pair.before, longest)} aria-hidden="true" />
      <i className="bar bar--after" style={share(pair.after, longest)} aria-hidden="true" />
      <b className="pair__value">{pair.value}</b>
    </li>
  );
}

/** Joveen or Optegra: a display figure that counts to its value once, three pairs to scale and the link to the story. */
function RolePanelView({ panel }: { panel: RolePanel }) {
  const story = roleStories[panel.slug];
  const { value, label } = displayFigure(story, panel.figure)!;
  const counted = countable(value);
  return (
    <OnView motion="rise" className="work-role__arrival">
      <Panel id={panel.slug} colours={story.panel} className="work-role">
        <Head slug={panel.slug} />
        <p className="work-role__figure">
          <span className="figure__value">{counted ? <Count from={panel.figure.from} to={counted.to} prefix={counted.prefix} suffix={counted.suffix} /> : value}</span>
          <span className="figure__label">{label}</span>
        </p>
        <OnView motion="grow">
          <ul className="pairs">
            {panel.pairs.map((pair) => (
              <PairRow key={pair.what} pair={pair} />
            ))}
          </ul>
        </OnView>
        <StoryLink slug={panel.slug} outline />
      </Panel>
    </OnView>
  );
}

/**
 * Work (DESIGN.md "The homepage, in order" 3, R-13 to R-15): the title and its subheading, BNP Paribas full width,
 * then Joveen and Optegra side by side. Each panel carries its employer's slug as its id, which the opening's passes
 * link to. Where I'm headed's rows follow until it becomes its own panel (#414).
 */
export function Work() {
  return (
    <section id="work" className="frame section work" aria-labelledby="work-heading">
      <h2 id="work-heading" className="section__title">
        {workPanels.heading}
      </h2>
      <p className="work__subheading">{workPanels.subheading}</p>
      <div className="panels">
        <BnpPanel />
        <div className="panels panels--two">
          {workPanels.roles.map((panel) => (
            <RolePanelView key={panel.slug} panel={panel} />
          ))}
        </div>
      </div>
      <HeadedRows />
    </section>
  );
}
