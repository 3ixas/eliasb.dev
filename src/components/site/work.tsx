import Link from "next/link";
import { shownLink, shownNow, shownRow, work, type ShownLink, type ShownRow } from "@/content/stretch/work";

/**
 * The body of the Work section (GLOSSARY.md): Now, Where I'm headed, and
 * How I got here. The server renders all of it. Now and the strands link into
 * the BNP Paribas Role story and Things I make; each earlier role is a
 * whole-row link to its own Role story, in the Project index's style, and
 * History is a row with no link.
 */
export function Work() {
  const { now, headed, gotHere } = work;
  const shown = shownNow();
  return (
    <div className="stretch-work">
      <article className="stretch-work__part stretch-work__now" aria-labelledby="work-now-heading">
        <h3 id="work-now-heading" className="stretch-work__h3">
          {now.heading}
        </h3>
        <p className="stretch-mono stretch-work__role">{[shown.role, shown.organisation, shown.dates].join(" · ")}</p>
        <ul className="stretch-work__proofs">
          {now.proofs.map((proof) => (
            <li key={proof}>{proof}</li>
          ))}
        </ul>
        <TextLink link={shown.link} />
      </article>

      <article className="stretch-work__part" aria-labelledby="work-headed-heading">
        <h3 id="work-headed-heading" className="stretch-work__h3">
          {headed.heading}
        </h3>
        <p className="stretch-work__line">{headed.line}</p>
        <ul className="stretch-work__strands">
          {headed.strands.map((strand) => (
            <li key={strand.title}>
              <p className="stretch-work__strand">{strand.title}</p>
              <p className="stretch-work__proof">{strand.proof}</p>
              <TextLink link={shownLink(strand.link)} />
            </li>
          ))}
        </ul>
      </article>

      <article className="stretch-work__part" aria-labelledby="work-got-here-heading">
        <h3 id="work-got-here-heading" className="stretch-work__h3">
          {gotHere.heading}
        </h3>
        <p className="stretch-mono stretch-work__note">{gotHere.note}</p>
        <ol className="stretch-work__rows">
          {gotHere.rows.map(shownRow).map((row) => (
            <li key={row.dates} className="stretch-work__row">
              {row.story ? (
                <Link className="stretch-work__row-link" href={`/work/${row.story}`}>
                  <RowContent row={row} linked />
                </Link>
              ) : (
                <div className="stretch-work__row-link">
                  <RowContent row={row} />
                </div>
              )}
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}

function TextLink({ link }: { link: ShownLink }) {
  return (
    <Link className="stretch-mono stretch-work__link" href={link.href}>
      {link.label}
    </Link>
  );
}

function RowContent({ row, linked = false }: { row: ShownRow; linked?: boolean }) {
  return (
    <>
      <span className="stretch-mono stretch-work__dates">{row.dates}</span>
      <span className="stretch-work__text">
        <span className="stretch-work__name">{row.role}</span>
        <span className="stretch-work__outcome">{row.note}</span>
      </span>
      {row.organisation && <span className="stretch-mono stretch-work__org">{row.organisation}</span>}
      {linked && (
        <span className="stretch-work__arrow" aria-hidden="true">
          →
        </span>
      )}
    </>
  );
}
