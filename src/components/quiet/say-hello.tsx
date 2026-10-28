import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { CopyEmail } from "@/components/quiet/copy-email";
import { Row } from "@/components/quiet/row";
import { Sheet } from "@/components/quiet/sheet";
import { sectionLabel } from "@/components/site/sections";
import { profile } from "@/content/site";
import { sayHello } from "@/content/stretch/site-copy";
import { resumeSheet } from "@/content/resume";

const address = profile.links.email.replace(/^mailto:/, "");

/** The Résumé row's closer look: the sheet sliding up, with its real name and role over ruled lines, and the line about the PDF. */
function ResumeLook() {
  const { name, role } = resumeSheet();
  return (
    <figure className="qi-resume-look">
      <div className="qi-resume-look__sheet" aria-hidden="true">
        <strong>{name}</strong>
        <span>{role}</span>
      </div>
      <figcaption>{sayHello.resumeLook}</figcaption>
    </figure>
  );
}

/**
 * GitHub's Invertocat, unmodified (Primer's `mark-github`, GitHub's own icon set), in ink on the tile. GitHub's brand rules
 * allow it as a social link to your own profile, kept less prominent than your own name and never as this site's icon.
 */
function GitHubMark() {
  return (
    <svg className="qi-badge__mark" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

/** A GitHub or LinkedIn row's object in a quiet tile: GitHub's mark, and for LinkedIn its letters until its official [in] file is added. */
const badges = { github: <GitHubMark />, linkedin: "in" } as const;

/**
 * The Say hello section (GLOSSARY.md): its heading with no line after it, then the email (not a row) with its
 * Copy button, then Résumé, GitHub and LinkedIn as rows. The Résumé is this site's page (same tab, closer look);
 * the others leave it. Rendered by the server in full: without script the email is still a working link.
 */
export function SayHello({ headingId }: { headingId: string }) {
  return (
    <CloserLookRoot looks={{ resume: <ResumeLook /> }} className="qi-column">
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
            object={id === "resume" ? <Sheet /> : <span className="qi-badge">{badges[id]}</span>}
            title={label}
            line=""
            look={id === "resume" ? { id, description: sayHello.resumeLook } : undefined}
          />
        ))}
      </ul>
    </CloserLookRoot>
  );
}
