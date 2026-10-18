import Link from "next/link";
import type { CSSProperties } from "react";
import { StaffPass } from "@/components/site/staff-pass";
import { bindDots } from "@/components/site/bind-dots";
import { shownSource, work } from "@/content/stretch/work";

/**
 * The body of the Work section (GLOSSARY.md): the Staff passes hanging from one
 * rail, newest first with the current one largest, History as a dashed note
 * under them, then Where I'm headed as the self-issued pass. The server renders all of it. Each pass
 * is one link to its Role story, and the Take Ownership pin on the current
 * pass leads to the certificate inside it.
 */
export function Work() {
  const { headed, history, rail } = work;
  return (
    <div className="stretch-work">
      <div className="stretch-work__rail">
        {rail.map((pass) => {
          const { slug, state, tilt, strap } = pass;
          const current = state === "current";
          return (
            <div key={slug} className="stretch-work__hang" data-slug={slug} data-hang={state} style={strap ? ({ "--pass-strap-rest": `${strap}px` } as CSSProperties) : undefined}>
              <StaffPass slug={slug} state={state} size={current ? "lg" : "sm"} tilt={tilt} linked pins={current} lean>
                {pass.state === "current" && (
                  <ul className="stretch-pass__proofs">
                    {pass.proofs.map((proof) => (
                      <li key={proof}>{proof}</li>
                    ))}
                  </ul>
                )}
              </StaffPass>
            </div>
          );
        })}
        <p className="stretch-mono stretch-work__history">
          <span className="stretch-work__history-dates">{history.dates}</span>
          {bindDots(` · ${history.role} · ${history.note}`)}
        </p>
      </div>

      <StaffPass state="self-issued" title={headed.heading} line={headed.line}>
        <ol className="stretch-work__bars">
          {headed.bars.map((bar) => {
            const source = shownSource(bar.source);
            return (
              <li key={bar.label} className="stretch-work__bar" style={{ "--thread": source.thread } as CSSProperties}>
                <span className="stretch-work__bar-label stretch-mono">{bar.label}</span>
                <p className="stretch-work__bar-title">{bar.title}</p>
                <p className="stretch-work__so-far">
                  <span className="stretch-work__tag stretch-mono">
                    {headed.soFar} · {source.name}
                  </span>
                  {bar.soFar.text}
                </p>
                <Link className="stretch-mono stretch-work__link" href={source.link.href}>
                  {source.link.label}
                </Link>
              </li>
            );
          })}
        </ol>
      </StaffPass>
    </div>
  );
}
