import { profile } from "@/content/site";
import { sayHello } from "@/content/stretch/site-copy";

/** The links beside the big one, in the order the approved copy lists them. */
const hrefs = [profile.links.resume, profile.links.github, profile.links.linkedin] as const;

/**
 * The closing section: the one cobalt action (an email to Elias), the approved
 * line, and the Résumé, GitHub and LinkedIn links.
 */
export function SayHello() {
  return (
    <div className="stretch-hello">
      <a className="stretch-display stretch-hello__big" href={profile.links.email}>
        {sayHello.bigLink}
      </a>
      <p className="stretch-hello__line">{sayHello.line}</p>
      <ul className="stretch-hello__links">
        {sayHello.links.map((label, index) => (
          <li key={label}>
            <a className="stretch-hello__link" href={hrefs[index]} target="_blank" rel="noreferrer">
              {label} <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
