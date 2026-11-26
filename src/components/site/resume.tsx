import Link from "next/link";
import "@/app/resume.css";
import { SiteLink } from "@/components/site/site-link";
import { SayHello } from "@/components/site/say-hello";
import { SiteHeader } from "@/components/site/site-header";
import { resumeCopy, resumePdf, resumeSheet } from "@/content/resume";

/**
 * The Résumé (GLOSSARY.md): an A4 sheet lying on the desk, which is also what
 * prints. The desk holds the Download PDF Button on the sheet's top edge, at its right (DESIGN.md "The Résumé", R-24),
 * between the shared header and Say hello, which do not print; the
 * sheet holds only what the PDF holds. It is light paper in either theme (resume.css), set in the site's
 * own Newsreader and Instrument Sans, and the server renders all of it.
 */
export function ResumePage() {
  const sheet = resumeSheet();
  return (
    <div data-site data-resume>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="resume__desk">
        <a className="button resume__download" href={resumePdf.href} download>
          {resumeCopy.download}
        </a>
        <article className="resume__sheet" aria-labelledby="resume-name">
          <header className="resume__head">
            <div className="resume__identity">
              <h1 id="resume-name" className="resume__name">
                {sheet.name}
              </h1>
              <p className="resume__role">
                <span>{sheet.role}</span>
                <span>{sheet.location}</span>
              </p>
            </div>
            <ul className="resume__contacts">
              {sheet.contacts.map(({ label, href }) => (
                <li key={href}>
                  <SiteLink href={href}>
                    {label}
                    {href.startsWith("http") && <span className="resume__away" aria-hidden="true"> ↗</span>}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </header>
          <p className="resume__summary">{sheet.summary}</p>

          <section className="resume__section" aria-labelledby="resume-experience">
            <h2 id="resume-experience" className="resume__heading">
              {resumeCopy.sections.experience}
            </h2>
            <div className="resume__body">
              {sheet.experience.map((entry) => (
                <div key={entry.story.href} className="resume__entry" data-resume-entry>
                  <h3 className="resume__line">
                    <span className="resume__who">
                      <strong data-resume="role">{entry.role}</strong>
                      <span className="resume__sep">, </span>
                      <span data-resume="employer">{entry.employer}</span>
                    </span>
                    <span className="resume__dates" data-resume="dates">
                      {entry.dates}
                    </span>
                  </h3>
                  <ul className="resume__results">
                    {entry.results.map((result) => (
                      <li key={result}>{result}</li>
                    ))}
                  </ul>
                  <p className="resume__link">
                    <Link href={entry.story.href}>{entry.story.label}</Link>
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="resume__section" aria-labelledby="resume-projects">
            <h2 id="resume-projects" className="resume__heading">
              {resumeCopy.sections.projects}
            </h2>
            <div className="resume__body">
              <ul className="resume__projects">
                {sheet.projects.map((project) => (
                  <li key={project.study.href}>
                    <p className="resume__project-head">
                      <strong>{project.name}</strong> <span className="resume__project-outcome">{project.outcome}</span>
                    </p>
                    <p className="resume__link">
                      <span className="resume__meta">{project.meta}</span> <Link href={project.study.href}>{project.study.label}</Link>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="resume__section" aria-labelledby="resume-awards">
            <h2 id="resume-awards" className="resume__heading">
              {resumeCopy.sections.awards}
            </h2>
            <div className="resume__body">
              <ul className="resume__awards">
                {sheet.awards.map(({ label, detail }) => (
                  <li key={label}>
                    <strong>{label}</strong> <span className="resume__award-detail">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="resume__section" aria-labelledby="resume-skills">
            <h2 id="resume-skills" className="resume__heading">
              {resumeCopy.sections.skills}
            </h2>
            <div className="resume__body">
              <dl className="resume__skills">
                {sheet.skills.map(({ group, items }) => (
                  <div key={group}>
                    <dt>{group}</dt>
                    <dd>{items}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="resume__section" aria-labelledby="resume-education">
            <h2 id="resume-education" className="resume__heading">
              {resumeCopy.sections.education}
            </h2>
            <div className="resume__body">
              <ul className="resume__education">
                {sheet.education.map(({ school, course, dates }) => (
                  <li key={school} className="resume__line">
                    <span>
                      <strong>{school}</strong>
                      <span className="resume__sep">, </span>
                      <span className="resume__course">{course}</span>
                    </span>
                    <span className="resume__dates">{dates}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </article>
      </main>
      <SayHello includeResume={false} />
    </div>
  );
}
