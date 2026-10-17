import { sectionLabel } from "@/components/site/sections";
import { profile } from "@/content/site";
import { sayHello } from "@/content/stretch/site-copy";

/**
 * The closing section, and the biggest thing on the page (#216): the one cobalt
 * action (an email to Elias) at display size, the approved line, the address in
 * words, and a plain row of Résumé, GitHub and LinkedIn links.
 */
const address = profile.links.email.replace(/^mailto:/, "");

export function SayHello({ headingId }: { headingId: string }) {
  return (
    <div className="stretch-hello">
      <h2 id={headingId} aria-label={sectionLabel["say-hello"]} className="stretch-display stretch-hello__heading">
        <a className="stretch-hello__big" href={profile.links.email}>
          {sayHello.bigLink}
        </a>
      </h2>
      <div className="stretch-hello__reach">
        <p className="stretch-hello__line">{sayHello.line}</p>
        <a className="stretch-mono stretch-hello__address" href={profile.links.email}>
          {address}
        </a>
      </div>
      <ul className="stretch-hello__links">
        {sayHello.links.map(({ id, label }) => (
          <li key={id}>
            <a className="stretch-hello__link" href={profile.links[id]} target="_blank" rel="noreferrer">
              {label} <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
