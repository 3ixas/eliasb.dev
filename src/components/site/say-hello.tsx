import { sectionLabel } from "@/components/site/sections";
import { profile } from "@/content/site";
import { sayHello } from "@/content/stretch/site-copy";

/**
 * The closing section: the one cobalt action (an email to Elias), the approved
 * line, and the Résumé, GitHub and LinkedIn links.
 */
export function SayHello({ headingId }: { headingId: string }) {
  return (
    <div className="stretch-hello">
      <h2 id={headingId} aria-label={sectionLabel["say-hello"]} className="stretch-display stretch-hello__heading">
        <a className="stretch-hello__big" href={profile.links.email}>
          {sayHello.bigLink}
        </a>
      </h2>
      <p className="stretch-hello__line">{sayHello.line}</p>
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
