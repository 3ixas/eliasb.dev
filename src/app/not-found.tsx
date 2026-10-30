import type { Metadata } from "next";
import { MiniPass } from "@/components/quiet/finished-pass";
import { HabitNumber } from "@/components/quiet/how-i-work";
import { ProjectObject } from "@/components/quiet/project-object";
import { Row } from "@/components/quiet/row";
import { Sheet } from "@/components/quiet/sheet";
import { TodayTile } from "@/components/quiet/today-tile";
import { LongForm, LongFormOpening } from "@/components/site/long-form";
import { MissingAddress } from "@/components/site/missing-address";
import { pageTitle } from "@/content/site";
import { projects } from "@/content/projects";
import { notFound as copy, siteCopy } from "@/content/stretch/site-copy";

export const metadata: Metadata = {
  title: { absolute: pageTitle(copy.title) },
  description: null,
  alternates: { canonical: null },
  // Not the home page's share card.
  openGraph: null,
  twitter: null,
  // Next.js adds its own noindex to a 404; this overrides the layout's robots,
  // so the two agree.
  robots: { index: false, follow: true },
};

const threshold = projects.find(({ slug }) => slug === "threshold");
if (!threshold) throw new Error("The 404 shows Threshold's object, so Threshold has to be in the catalogue");

/** Each homepage section's own object, by its anchor (docs/design/DESIGN.md, Objects). */
const objects = {
  work: <MiniPass slug="bnp-paribas" />,
  "things-i-make": <ProjectObject project={threshold} />,
  "how-i-work": <HabitNumber position={0} />,
  "off-the-clock": <TodayTile />,
  "say-hello": <Sheet />,
} as const;

/**
 * The 404 (docs/design/DESIGN.md, "The 404"): it says what didn't work, then what to try. The shared header with no
 * links, "This page doesn't exist." as the opening line, the missing row (the address asked for, struck through,
 * with an empty slot as its object; not a link), then the homepage's five sections as rows with their own objects.
 */
export default function NotFound() {
  return (
    <LongForm attrs={{ "data-not-found": "" }}>
      <section className="stretch-wrap qi-long" aria-labelledby="not-found-title">
        <div className="qi-column">
          <LongFormOpening titleId="not-found-title" title={copy.heading} line={copy.line} />
          <div className="qi-long__section">
            <ul className="qi-list" data-missing="">
              <Row object={<span className="qi-empty" />} title={<MissingAddress />} line={copy.missing.line} meta={copy.missing.meta} />
            </ul>
          </div>
          <section className="qi-long__section" aria-labelledby="try-title">
            <h2 id="try-title" className="qi-title">
              {copy.tryTitle}
            </h2>
            <p className="qi-note-line">{copy.tryNote}</p>
            <ul className="qi-list">
              {siteCopy.menu.map(({ id, label }) => (
                <Row key={id} href={`/#${id}`} object={objects[id]} title={label} line={copy.tryLines[id]} />
              ))}
            </ul>
          </section>
        </div>
      </section>
    </LongForm>
  );
}
