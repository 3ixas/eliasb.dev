import { CopyEmail } from "@/components/quiet/copy-email";
import { Row } from "@/components/quiet/row";
import { Sheet } from "@/components/quiet/sheet";
import { sectionLabel } from "@/components/site/sections";
import { profile } from "@/content/site";
import { sayHello } from "@/content/stretch/site-copy";

const address = profile.links.email.replace(/^mailto:/, "");

/** GitHub's object: a little contribution calendar, five by five, in GitHub's own levels (the pattern is authored, not data). */
const levels = [0, 1, 0, 2, 0, 1, 3, 2, 0, 1, 0, 2, 4, 3, 2, 1, 0, 3, 4, 2, 0, 1, 2, 3, 4];

function ContributionTile() {
  return (
    <span className="qi-contrib">
      {levels.map((level, index) => (
        <span key={index} data-level={level} />
      ))}
    </span>
  );
}

/** LinkedIn's object: a business card with a portrait dot and two printed lines, one with a cobalt rule. */
function NameCard() {
  return (
    <span className="qi-namecard">
      <span className="qi-namecard__face" />
      <span className="qi-namecard__line" />
      <span className="qi-namecard__line qi-namecard__line--short" />
    </span>
  );
}

const objects = { github: <ContributionTile />, linkedin: <NameCard /> } as const;

/**
 * The Say hello section (GLOSSARY.md): its heading with no line after it, then the email (not a row) with its
 * Copy button, then Résumé, GitHub and LinkedIn as rows. The Résumé is this site's page (same tab);
 * the others leave it. Rendered by the server in full: without script the email is still a working link.
 */
export function SayHello({ headingId }: { headingId: string }) {
  return (
    <div className="qi-column">
      <h2 id={headingId} className="qi-title">
        {sectionLabel["say-hello"]}
      </h2>
      <div className="qi-email">
        <a className="qi-email__address stretch-mono" href={profile.links.email}>
          {address}
        </a>
        <CopyEmail address={address} label={sayHello.copy} done={sayHello.copied} />
      </div>
      <ul className="qi-list">
        {sayHello.links.map(({ id, label }) => (
          <Row
            key={id}
            href={profile.links[id]}
            object={id === "resume" ? <Sheet /> : objects[id]}
            title={label}
            line=""
          />
        ))}
      </ul>
    </div>
  );
}
