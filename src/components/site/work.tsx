import Link from "next/link";
import type { CSSProperties } from "react";
import { StaffPass } from "@/components/site/staff-pass";
import { shownLink, work, type ShownLink } from "@/content/stretch/work";

/**
 * The body of the Work section (GLOSSARY.md): the Staff passes hanging from one
 * rail, newest first with the current one largest, History as a dashed note
 * under them, then Where I'm headed. The server renders all of it. Each pass
 * is one link to its Role story, and the Take Ownership pin on the current
 * pass leads to the certificate inside it.
 */
export function Work() {
  const { headed, history, proofs, rail } = work;
  return (
    <div className="stretch-work">
      <div className="stretch-work__rail">
        {rail.map(({ slug, state, tilt, strap }) => {
          const current = state === "current";
          return (
            <div key={slug} className="stretch-work__hang" data-slug={slug} data-hang={state} style={strap ? ({ "--pass-strap-rest": `${strap}px` } as CSSProperties) : undefined}>
              <StaffPass slug={slug} state={state} size={current ? "lg" : "sm"} tilt={tilt} linked pins={current} lean>
                {current && (
                  <ul className="stretch-pass__proofs">
                    {proofs.map((proof) => (
                      <li key={proof}>{proof}</li>
                    ))}
                  </ul>
                )}
              </StaffPass>
            </div>
          );
        })}
        <p className="stretch-mono stretch-work__history">
          <span className="stretch-work__history-dates">{history.dates}</span> · {history.role} · {history.note}
        </p>
      </div>

      <article aria-labelledby="work-headed-heading">
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
