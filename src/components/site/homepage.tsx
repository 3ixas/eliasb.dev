import Image from "next/image";
import { ContributionCalendar } from "@/components/site/contribution-calendar";
import { SignalPresentation } from "@/components/site/signal-presentation";
import { Board } from "@/components/board/board";
import { BoardHeader } from "@/components/board/board-header";
import { Hero } from "@/components/board/hero";
import { Work } from "@/components/board/work";
import { careerTimeline, labItems } from "@/content/collections";
import { profile } from "@/content/site";
import { getHomepageSignals } from "@/integrations/homepage";

export async function Homepage() {
  const signals = await getHomepageSignals();

  return (
    <div className="prototype prototype-cabinet-of-curiosities selected-experience" id="top" tabIndex={-1}>
      <BoardHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />

        <Work />

        <Board />

        {/* GitHub, not yet on the Board; it moves onto it in #87. */}
        <div className="outside-work-section">
          <div className="currently-section">
            <div className="signal-grid">
              <article className="signal signal-building" data-motion-reveal>
                <p>Recent building</p>
                <SignalPresentation
                  signal={signals.github}
                  source={{
                    label: signals.github.state === "unavailable" ? "GitHub activity" : "GitHub",
                    href: signals.github.href,
                  }}
                >
                  <strong>{signals.github.headline}</strong>
                  {signals.github.description && <span>{signals.github.description}</span>}
                  {signals.github.totalContributions !== undefined ? (
                    <ContributionCalendar activity={signals.github.activity} label={signals.github.activityLabel} />
                  ) : signals.github.state !== "unavailable" ? (
                    <p className="contribution-calendar-empty">
                      I can’t show the full-year calendar just now.
                    </p>
                  ) : null}
                </SignalPresentation>
              </article>
            </div>
          </div>
        </div>

        <section className="lab-section experiments-section" id="experiments" tabIndex={-1} aria-labelledby="experiments-title">
          <div className="section-heading compact" data-motion-reveal>
            <p>03 / Experiments</p>
            <div>
              <h2 id="experiments-title">
                Things I’m trying <em>out.</em>
              </h2>
              <p className="section-supporting-copy">
                A few side projects and small experiments with how software feels to use.
              </p>
            </div>
          </div>
          <div className="lab-grid">
            {labItems.map((note) => {
              const externalHref = note.liveUrl ?? note.codeUrl;
              const actionLabel = note.liveUrl ? "Open experiment" : note.codeUrl ? "View source" : "Read experiment note";
              const content = (
                <>
                  <span className="lab-index">{note.index}</span>
                  <span className={`lab-card-visual lab-card-visual-${note.treatment}`}>
                    <Image
                      src={note.image}
                      alt={note.imageAlt}
                      fill
                      sizes="(max-width: 800px) calc(100vw - 100px), 30vw"
                    />
                  </span>
                  <p>{note.kind}</p>
                  <h3>{note.title}</h3>
                  <span className="lab-description">{note.description}</span>
                  <span className="lab-arrow">{actionLabel} <span className="arrow-mark" aria-hidden="true">{externalHref ? "↗︎" : "→"}</span></span>
                </>
              );

              if (!externalHref) {
                return (
                  <details key={note.index} className="lab-card lab-card-disclosure" data-motion-reveal>
                    <summary>
                      <span className="lab-index">{note.index}</span>
                      <span className={`lab-card-visual lab-card-visual-${note.treatment}`}>
                        <Image
                          src={note.image}
                          alt={note.imageAlt}
                          fill
                          sizes="(max-width: 800px) calc(100vw - 100px), 30vw"
                        />
                      </span>
                      <span className="lab-kind">{note.kind}</span>
                      <h3>{note.title}</h3>
                      <span className="lab-description">{note.description}</span>
                      <span className="lab-arrow">{actionLabel} <span className="arrow-mark" aria-hidden="true">→</span></span>
                    </summary>
                    <div className="lab-note">
                      <p>{note.note}</p>
                    </div>
                  </details>
                );
              }

              return (
                <a
                  key={note.index}
                  className="lab-card"
                  data-motion-reveal
                  href={externalHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {content}
                </a>
              );
            })}
          </div>
        </section>

        <section className="about-section" id="about" tabIndex={-1} aria-labelledby="about-title">
          <p>04 / About</p>
          <h2 id="about-title" data-motion-reveal>A bit about <em>me.</em></h2>
          <div className="about-copy" data-motion-reveal>
            <div className="about-prose">
              <p>{profile.about}</p>
              <p className="about-supporting-copy">
                I want to make products that solve a recurring problem well enough to become part of someone’s day. I care about making them beautiful, easy to understand, and a pleasure to use.
              </p>
              <a className="about-contact-cta" href="#contact">
                Start a conversation <span className="arrow-mark" aria-hidden="true">↓</span>
              </a>
            </div>
            <figure className="portrait-frame">
              <Image
                src="/profile/elias-evening.webp"
                alt="Elias Bennett smiling in a white dinner jacket"
                width={1200}
                height={1500}
                sizes="(max-width: 800px) calc(100vw - 56px), 45vw"
              />
              <figcaption>Off duty, approximately</figcaption>
            </figure>
          </div>
          <div className="about-career-path">
            <div className="about-career-heading" data-motion-reveal>
              <p>Career path</p>
              <div>
                <h3 id="about-career-title">My career <em>so far.</em></h3>
                <span>I started in marketing and data, then moved into software. I still like figuring out what a product needs and helping to build it.</span>
              </div>
            </div>
            <ol className="career-timeline" role="list" aria-labelledby="about-career-title">
              {careerTimeline.map((entry, index) => (
                <li className="career-entry" key={entry.employer} data-motion-reveal>
                  <div className="career-entry-topline">
                    <span className="career-entry-index">0{index + 1}</span>
                    <p className="career-period">
                      <time dateTime={entry.dates.start.dateTime}>{entry.dates.start.label}</time>
                      <span aria-hidden="true">–</span>
                      {entry.dates.end.dateTime ? (
                        <time dateTime={entry.dates.end.dateTime}>{entry.dates.end.label}</time>
                      ) : (
                        <span>{entry.dates.end.label}</span>
                      )}
                    </p>
                  </div>
                  <h4>
                    {entry.role}
                    {"roleFocus" in entry && entry.roleFocus && (
                      <span className="career-role-focus"> working on {entry.roleFocus}</span>
                    )}
                  </h4>
                  <p className="career-employer">{entry.employer}</p>
                  {entry.context && <p className="career-entry-context">{entry.context}</p>}
                  {entry.story && <p className="career-entry-story">{entry.story}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="contact" tabIndex={-1} className="contact-block contact-section" aria-labelledby="contact-title">
          <p>05 / Contact</p>
          <h2 id="contact-title" data-motion-reveal>Let’s <em>talk.</em></h2>
          <div className="contact-actions" data-motion-reveal>
            <div className="contact-primary-action">
              <a className="contact-link" href={profile.links.email}>
                Email me <span className="arrow-mark" aria-hidden="true">↗︎</span>
              </a>
              <span className="contact-email">eliasthebennett@gmail.com</span>
            </div>
            <div className="contact-aside">
              <nav className="contact-profile-links" aria-label="Other ways to connect">
                <a
                  className="contact-profile-link contact-profile-link--github"
                  href={profile.links.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub <span className="arrow-mark" aria-hidden="true">↗︎</span>
                </a>
                <a
                  className="contact-profile-link contact-profile-link--linkedin"
                  href={profile.links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn <span className="arrow-mark" aria-hidden="true">↗︎</span>
                </a>
                {profile.links.resume && (
                  <a
                    className="contact-profile-link contact-profile-link--resume"
                    href={profile.links.resume}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Résumé <span className="arrow-mark" aria-hidden="true">↗︎</span>
                  </a>
                )}
              </nav>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Made by {profile.shortName}.</p>
        <div>
          <a href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub <span className="arrow-mark" aria-hidden="true">↗︎</span>
          </a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
