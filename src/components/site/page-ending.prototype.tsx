/*
 * PROTOTYPE, throwaway (#200, An ending for the page). Three ways for Say hello
 * and the footer to close the homepage, mounted behind ?variant= outside
 * production only. Rough on purpose: real tokens and copy, no tests.
 *
 *   A · Headline  [scale]   Say hello set at display size across the page; the
 *                           signature is the word stretching on hover or focus.
 *   B · Envelope  [object]  an envelope addressed to Elias fills the empty right
 *                           side; the signature is its flap opening on hover or focus.
 *   C · Bookend   [footer, stretch]  the footer answers the hero: "Made by Elias"
 *                           at the name's scale, in outline; the signature is
 *                           ELIAS filling with cobalt on hover or focus.
 *
 * Every variant shows the email address in words (today it's only in the link),
 * and keeps Résumé, GitHub and LinkedIn on one row on phones (audit finding 10).
 */
import "@/app/page-ending.prototype.css";
import { PrototypeSwitcher } from "@/components/site/prototype-switcher.prototype";
import { sectionLabel } from "@/components/site/sections";
import { profile } from "@/content/site";
import { sayHello, siteCopy } from "@/content/stretch/site-copy";

export const ENDING_VARIANTS = ["A", "B", "C", "D", "E"] as const;
export type EndingVariant = (typeof ENDING_VARIANTS)[number];
const names: Record<EndingVariant, string> = {
  A: "Headline",
  B: "Envelope",
  C: "Bookend",
  D: "Bookend, Say hello as the headline",
  E: "Bookend, Say hello as a big pill",
};
/** D and E: C with the hierarchy fixed, Say hello bigger than the footer (Elias, after choosing C). */
const quietFooter = (variant: EndingVariant) => variant === "D" || variant === "E";

const address = profile.links.email.replace(/^mailto:/, "");

function Links({ plain = false }: { plain?: boolean }) {
  return (
    <ul className={plain ? "pe-links pe-links--plain" : "pe-links"}>
      {sayHello.links.map(({ id, label }) => (
        <li key={id}>
          <a className="pe-link" href={profile.links[id]} target="_blank" rel="noreferrer">
            {label} <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Headline({ headingId }: { headingId: string }) {
  return (
    <div className="pe-a">
      <h2 id={headingId} aria-label={sectionLabel["say-hello"]} className="stretch-display pe-a__heading">
        <a className="pe-a__big" href={profile.links.email}>
          <span className="pe-a__word">Say hello</span> <span className="pe-a__arrow" aria-hidden="true">↗</span>
        </a>
      </h2>
      <div className="pe-a__under">
        <p className="pe-line">{sayHello.line}</p>
        <div className="pe-a__side">
          <a className="stretch-mono pe-address" href={profile.links.email}>
            {address}
          </a>
          <Links plain />
        </div>
      </div>
    </div>
  );
}

function Envelope({ headingId }: { headingId: string }) {
  return (
    <div className="pe-b">
      <div className="pe-b__copy">
        <h2 id={headingId} aria-label={sectionLabel["say-hello"]} className="stretch-display stretch-hello__heading">
          <a className="stretch-hello__big pe-b__big" href={profile.links.email}>
            {sayHello.bigLink}
          </a>
        </h2>
        <p className="pe-line">{sayHello.line}</p>
        <Links />
      </div>
      {/* The envelope repeats the email link for the pointer; keyboard and screen readers get the one above. */}
      <a className="pe-b__envelope" href={profile.links.email} tabIndex={-1} aria-hidden="true">
        <span className="pe-b__letter">
          <span />
          <span />
          <span />
        </span>
        <span className="pe-b__pocket" />
        <span className="pe-b__flap">
          <svg viewBox="0 0 160 56" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="0,0 80,56 160,0" />
          </svg>
        </span>
        <span className="pe-b__front">
          <svg className="pe-b__folds" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="0,100 72,48" />
            <polyline points="160,100 88,48" />
          </svg>
          <span className="pe-b__stamp stretch-display">E/B</span>
          <span className="pe-b__to">
            <span className="pe-b__name">Elias Bennett</span>
            <span className="stretch-mono pe-b__address">{address}</span>
          </span>
        </span>
      </a>
    </div>
  );
}

function Bookend({ headingId, say }: { headingId: string; say: "pill" | "headline" | "big-pill" }) {
  return (
    <div className="pe-c">
      {say === "headline" ? (
        <h2 id={headingId} aria-label={sectionLabel["say-hello"]} className="stretch-display pe-a__heading">
          <a className="pe-a__big pe-a__big--still" href={profile.links.email}>
            <span className="pe-a__word">Say hello</span> <span className="pe-a__arrow" aria-hidden="true">↗</span>
          </a>
        </h2>
      ) : (
        <h2 id={headingId} aria-label={sectionLabel["say-hello"]} className="stretch-display stretch-hello__heading">
          <a className={say === "big-pill" ? "stretch-hello__big pe-e__big" : "stretch-hello__big"} href={profile.links.email}>
            {sayHello.bigLink}
          </a>
        </h2>
      )}
      <div className="pe-c__row">
        <p className="pe-line">{sayHello.line}</p>
        <a className="stretch-mono pe-address" href={profile.links.email}>
          {address}
        </a>
      </div>
      {/* Chosen with A's plain link row (#200). */}
      <Links plain />
    </div>
  );
}

export function EndingPrototype({ variant, headingId }: { variant: EndingVariant; headingId: string }) {
  if (variant === "A") return <Headline headingId={headingId} />;
  if (variant === "B") return <Envelope headingId={headingId} />;
  if (variant === "D") return <Bookend headingId={headingId} say="headline" />;
  if (variant === "E") return <Bookend headingId={headingId} say="big-pill" />;
  return <Bookend headingId={headingId} say="pill" />;
}

export function EndingFooter({ variant }: { variant: EndingVariant }) {
  if (variant === "A" || variant === "B") {
    return (
      <footer className="stretch-wrap stretch-footer pe-footer" data-entrance="rest">
        <p className="stretch-mono">{siteCopy.footer}</p>
      </footer>
    );
  }
  // "Made by Elias", at the hero name's scale. The words stay the footer's text.
  // It fills on hover, or while keyboard focus is on a Say hello link (CSS :has).
  return (
    <footer className={quietFooter(variant) ? "stretch-wrap pe-c__footer pe-c__footer--quiet" : "stretch-wrap pe-c__footer"} data-entrance="rest">
      <p className="stretch-display pe-c__sign">
        <span className="pe-c__made">Made by</span> <span className="pe-c__name">Elias</span>
      </p>
    </footer>
  );
}

export function EndingSwitcher({ current }: { current: EndingVariant | null }) {
  return <PrototypeSwitcher current={current} variants={ENDING_VARIANTS} names={names} anchor="say-hello" />;
}
