import Link from "next/link";
import { MeasurePair, MeasureSide } from "@/components/parts/measure";
import { OnView, Count } from "@/components/parts/on-view";
import { Arrow, Panel, PanelHead } from "@/components/parts/panel";
import { roleStories } from "@/content/stretch/role-stories";
import type { RoleStorySlug } from "@/content/stretch/role-story";
import { passRecords } from "@/content/stretch/staff-pass";
import { comparisonRow, displayFigure, workPanels, type Pair, type RolePanel } from "@/content/stretch/work-panels";

/** The panel's header: the employer's short name (as on its pass), with its role and dates at the right. */
function Head({ slug }: { slug: RoleStorySlug }) {
  const { role, dates } = roleStories[slug];
  return <PanelHead name={passRecords[slug].short} meta={[role, dates]} />;
}

/** "The Optegra story →", a pill on the employer's own panel. */
function StoryLink({ slug, outline = false }: { slug: RoleStorySlug; outline?: boolean }) {
  return (
    <Link className={outline ? "pill pill--outline work__story" : "pill work__story"} href={`/work/${slug}`}>
      {`The ${passRecords[slug].short} story`}
      <Arrow />
    </Link>
  );
}

/**
 * BNP Paribas, full width and green: its name over its role and dates, its figure and the link to its story on the left,
 * two comparisons in their own units on the right (#458); the simulation is on its Role story (#457).
 */
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
        <OnView motion="grow" className="work-bnp__comparisons">
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
        </OnView>
        <StoryLink slug={slug} />
      </Panel>
    </OnView>
  );
}

/** One before and after pair: what moved, the pair drawn in its unit, and the value written out at the right. */
function PairRow({ pair }: { pair: Pair }) {
  return (
    <li className="pair">
      <span className="pair__what">{pair.what}</span>
      <MeasurePair measure={pair} />
      <b className="pair__value">{pair.value}</b>
    </li>
  );
}

/** Joveen or Optegra: a display figure that rolls to its value once, three pairs in their units and the link to the story. */
function RolePanelView({ panel }: { panel: RolePanel }) {
  const story = roleStories[panel.slug];
  const { value, label } = displayFigure(story, panel.figure)!;
  return (
    <OnView motion="rise" className="work-role__arrival">
      <Panel id={panel.slug} colours={story.panel} className="work-role">
        <Head slug={panel.slug} />
        <p className="work-role__figure">
          <span className="figure__value"><Count value={value} from={panel.figure.from} /></span>
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
 * link to. Joveen's and Optegra's panels share their rows, so their rules and links stay level (#458).
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
        <div className="panels panels--two panels--aligned">
          {workPanels.roles.map((panel) => (
            <RolePanelView key={panel.slug} panel={panel} />
          ))}
        </div>
      </div>
    </section>
  );
}
