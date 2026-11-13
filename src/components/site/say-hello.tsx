import Link from "next/link";
import { CopyEmail } from "@/components/site/copy-email";
import { hostLabel } from "@/components/site/host-label";
import { sectionLabel } from "@/components/site/sections";
import { profile } from "@/content/site";
import { sayHello } from "@/content/stretch/site-copy";

const address = profile.links.email.replace(/^mailto:/, "");
const addressId = "say-hello-email";
const headingId = "say-hello-heading";

/**
 * Say hello, which ends every page (docs/design/DESIGN.md "Say hello", R-10): under a 1 px ink rule, the title;
 * the email large with a cobalt underline, and Copy; then Résumé, GitHub and LinkedIn. The Résumé is this site's
 * page (same tab); the others leave it, marked ↗. Rendered by the server in full: without script the email is still
 * a working link, and Copy, which needs script, is not shown. No page has any other footer.
 */
export function SayHello() {
  return (
    <section id="say-hello" className="frame section say-hello" aria-labelledby={headingId} tabIndex={-1}>
      <h2 id={headingId} className="section__title say-hello__title">
        {sectionLabel["say-hello"]}
      </h2>
      <div className="say-hello__email">
        <a id={addressId} className="say-hello__address" href={profile.links.email}>
          {address}
        </a>
        <CopyEmail address={address} addressId={addressId} label={sayHello.copy} done={sayHello.copied} />
      </div>
      <ul className="say-hello__links">
        {sayHello.links.map(({ id, label }) =>
          id === "resume" ? (
            <li key={id}>
              <Link href={profile.links[id]}>
                {label}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ) : (
            <li key={id}>
              <a href={profile.links[id]} target="_blank" rel="noreferrer">
                {label}
                <span className="arrow arrow--out" aria-hidden="true">
                  ↗
                </span>
                <span className="sr-only"> opens {hostLabel(profile.links[id])} in a new tab</span>
              </a>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
