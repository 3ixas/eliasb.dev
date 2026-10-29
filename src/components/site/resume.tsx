import Link from "next/link";
import { SiteLink } from "@/components/site/site-link";
import { SiteHeader } from "@/components/site/site-header";
import { resumeCopy, resumePdf, resumeSheet } from "@/content/resume";

/**
 * The Résumé (GLOSSARY.md): an A4 sheet lying on the desk, which is also what
 * prints. The desk holds the shared header (no links) and the Download PDF button; the
 * sheet holds only what the PDF holds. It is light paper in either theme (stretch-resume.css), and the
 * server renders all of it.
 */
export function ResumePage() {
  const sheet = resumeSheet();
  return (
    <div data-stretch-shell data-resume>
      <SiteHeader home />
      <main id="main-content" tabIndex={-1} className="stretch-resume__desk">
        <a className="stretch-pill stretch-resume__download" href={resumePdf.href} download>
          {resumeCopy.download}
        </a>
        <article className="stretch-resume__sheet" aria-labelledby="resume-name">
          <header className="stretch-resume__head">
            <h1 id="resume-name" className="stretch-resume__name">
              {sheet.name}
            </h1>
            <p className="stretch-resume__role">
              <span>{sheet.role}</span>
              <span>{sheet.location}</span>
            </p>
            <ul className="stretch-resume__contacts stretch-mono">
              {sheet.contacts.map(({ label, href }) => (
                <li key={href}>
                  <SiteLink href={href}>
                    {label}
                    {href.startsWith("http") && <span className="stretch-resume__away" aria-hidden="true"> ↗</span>}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </header>
          <p className="stretch-resume__summary">{sheet.summary}</p>

          <section aria-labelledby="resume-experience">
            <h2 id="resume-experience" className="stretch-resume__heading stretch-mono">
              {resumeCopy.sections.experience}
            </h2>
            {sheet.experience.map((entry) => (
              <div key={entry.story.href} className="stretch-resume__entry" data-resume-entry>
                <h3 className="stretch-resume__line">
                  <span>
                    <strong data-resume="role">{entry.role}</strong>, <span data-resume="employer">{entry.employer}</span>
                  </span>
                  <span className="stretch-mono" data-resume="dates">
                    {entry.dates}
                  </span>
                </h3>
                <ul className="stretch-resume__results">
                  {entry.results.map((result) => (
                    <li key={result}>{result}</li>
                  ))}
                </ul>
                <p className="stretch-resume__link stretch-mono">
                  <Link href={entry.story.href}>{entry.story.label}</Link>
                </p>
              </div>
            ))}
          </section>

          <section aria-labelledby="resume-projects">
            <h2 id="resume-projects" className="stretch-resume__heading stretch-mono">
              {resumeCopy.sections.projects}
            </h2>
            <ul className="stretch-resume__projects">
              {sheet.projects.map((project) => (
                <li key={project.study.href}>
                  <p>
                    <strong>{project.name}</strong> <span>{project.outcome}</span>
                  </p>
                  <p className="stretch-resume__link stretch-mono">
                    <span>{project.meta}</span> <Link href={project.study.href}>{project.study.label}</Link>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="resume-awards">
            <h2 id="resume-awards" className="stretch-resume__heading stretch-mono">
              {resumeCopy.sections.awards}
            </h2>
            <ul className="stretch-resume__awards">
              {sheet.awards.map(({ label, detail }) => (
                <li key={label}>
                  <strong>{label}</strong> <span className="stretch-mono">{detail}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="resume-skills">
            <h2 id="resume-skills" className="stretch-resume__heading stretch-mono">
              {resumeCopy.sections.skills}
            </h2>
            <dl className="stretch-resume__skills">
              {sheet.skills.map(({ group, items }) => (
                <div key={group}>
                  <dt>{group}</dt>
                  <dd>{items}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="resume-education">
            <h2 id="resume-education" className="stretch-resume__heading stretch-mono">
              {resumeCopy.sections.education}
            </h2>
            <ul className="stretch-resume__education">
              {sheet.education.map(({ school, course, dates }) => (
                <li key={school} className="stretch-resume__line">
                  <span>
                    <strong>{school}</strong>, <span>{course}</span>
                  </span>
                  <span className="stretch-mono">{dates}</span>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </main>
    </div>
  );
}
