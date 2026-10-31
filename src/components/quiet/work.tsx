import type { CSSProperties } from "react";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { FullPass, MiniPass, PassPins } from "@/components/quiet/finished-pass";
import { Row } from "@/components/quiet/row";
import { roleStories } from "@/content/stretch/role-stories";
import { passRecords } from "@/content/stretch/staff-pass";
import { shownSource, work, type Employer } from "@/content/stretch/work";

const strandId = (label: string) => `strand-${label.toLowerCase()}`;

/** What an employer's closer look says beyond its row, as the text the row's accessible description reads. */
const describeEmployer = ({ pins, proofs }: Employer) => [...pins.map(({ label, detail }) => `${label}. ${detail}`), ...proofs].join(" ");

/** An employer's closer look: its full pass dropping on its strap, then its three Pass pins and the proofs the deck adds. */
function EmployerLook({ employer }: { employer: Employer }) {
  return (
    <>
      <FullPass slug={employer.slug} countFrom={employer.countFrom} />
      <PassPins pins={employer.pins} />
      {employer.proofs.length > 0 && (
        <ul className="qi-proofs">
          {employer.proofs.map((proof) => (
            <li key={proof}>{proof}</li>
          ))}
        </ul>
      )}
    </>
  );
}

/** A strand's closer look: "So far" with its source, its thread drawing down from the source. */
function StrandLook({ bar }: { bar: (typeof work.headed.bars)[number] }) {
  const source = shownSource(bar.source);
  return (
    <div className="qi-strand" style={{ "--thread": source.thread } as CSSProperties}>
      <span className="qi-strand__thread" />
      <p className="qi-strand__tag stretch-mono">
        {work.headed.soFar} · {source.name}
      </p>
      <p className="qi-strand__text">{bar.soFar.text}</p>
    </div>
  );
}

/** The closer looks of the Work section, keyed by the ids its rows carry. */
function workLooks() {
  return {
    ...Object.fromEntries(work.employers.map((employer) => [employer.slug, <EmployerLook key={employer.slug} employer={employer} />])),
    ...Object.fromEntries(work.headed.bars.map((bar) => [strandId(bar.label), <StrandLook key={bar.label} bar={bar} />])),
  };
}

/**
 * The body of the Work section (GLOSSARY.md): a row for each employer, then Where I'm headed
 * with its three strand rows. The server renders all of it; the controller shows the closer looks.
 */
export function Work() {
  const { headed } = work;
  return (
    <CloserLookRoot looks={workLooks()} className="qi-column">
      <h2 id="work-heading" className="qi-title">
        {work.heading}
      </h2>
      <p className="qi-note-line">{work.note}</p>
      <ul className="qi-list">
        {work.employers.map((employer) => {
          const story = roleStories[employer.slug];
          return (
            <Row
              key={employer.slug}
              href={`/work/${employer.slug}`}
              object={<MiniPass slug={employer.slug} />}
              title={passRecords[employer.slug].short}
              line={`${story.role} · ${story.dates}`}
              look={{ id: employer.slug, description: describeEmployer(employer) }}
            />
          );
        })}
      </ul>

      <div role="group" aria-labelledby="headed-heading" className="qi-group">
        <h3 id="headed-heading" className="qi-title">
          {headed.heading}
        </h3>
        <p className="qi-note-line">{headed.line}</p>
        <ul className="qi-list">
          {headed.bars.map((bar) => {
            const source = shownSource(bar.source);
            return (
              <Row
                key={bar.label}
                object={<span className="qi-thread" style={{ "--thread": source.thread } as CSSProperties} />}
                title={bar.title}
                line={bar.label}
                look={{ id: strandId(bar.label), description: `${headed.soFar}, ${source.name}. ${bar.soFar.text}` }}
              />
            );
          })}
        </ul>
      </div>
    </CloserLookRoot>
  );
}
