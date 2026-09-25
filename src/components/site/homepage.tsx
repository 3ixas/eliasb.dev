import Image from "next/image";
import Link from "next/link";
import { LocalTime } from "@/components/local-time";
import { ClosableDetails } from "@/components/site/closable-details";
import { ContributionCalendar } from "@/components/site/contribution-calendar";
import { FeaturedWork } from "@/components/site/featured-work";
import { FantasyMatchup } from "@/components/site/fantasy-matchup";
import { InViewMotion } from "@/components/site/in-view-motion";
import { ScrollProgress } from "@/components/site/scroll-progress";
import {
  SignalFreshness,
  SignalPresentation,
  SignalStatus,
} from "@/components/site/signal-presentation";
import { HomepageSignature } from "@/components/homepage-opening";
import { SiteHeader } from "@/components/site/site-header";
import { careerTimeline, labItems } from "@/content/collections";
import { integrationConfig } from "@/content/integration-config";
import { profile } from "@/content/site";
import { getHomepageSignals } from "@/integrations/homepage";
import { getHistorySignal } from "@/integrations/history";

export async function Homepage() {
  const [signals, history] = await Promise.all([getHomepageSignals(), getHistorySignal()]);

  return (
    <div className="prototype prototype-cabinet-of-curiosities selected-experience" id="top" tabIndex={-1}>
      <ScrollProgress />
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-kicker">
          <p className="hero-kicker" id="hero-kicker">
            {profile.shortName} · {profile.role} · {profile.location}
          </p>
          <HomepageSignature statement={profile.statement} />
          <div className="hero-lower">
            <div className="hero-introduction">
              <p className="hero-introduction-label">How I work</p>
              <p className="hero-copy">{profile.introduction}</p>
            </div>
            <div className="concept-thesis">
              <figure className="concept-thesis-photo">
                <Image
                  src="/profile/elias-coast.webp"
                  alt="Elias standing aboard a boat, with water and a rocky coastline behind him"
                  fill
                  sizes="(max-width: 700px) 100px, 120px"
                />
                <figcaption>Out on the water</figcaption>
              </figure>
              <p>
                <span>Here</span>{" "}
                Things I’ve built, things I’m trying, and a few things I enjoy.
              </p>
            </div>
          </div>
          <a className="scroll-cue" href="#work">
            Selected work <span aria-hidden="true">↓</span>
          </a>
        </section>

        <FeaturedWork />

        <section className="outside-work-section" id="outside-work" tabIndex={-1} aria-labelledby="outside-work-title">
          <div className="currently-section">
            <div className="section-heading compact">
              <p>02 / Outside work</p>
              <h2 id="outside-work-title">
                Some of what I’m into <em>lately.</em>
              </h2>
            </div>
            <div className="signal-grid">
              <article className="signal signal-building">
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
                  {signals.github.privateContributions !== undefined && (
                    <div className="signal-metrics" role="group" aria-label="Private contribution count">
                      <b>{signals.github.privateContributions}</b>
                      <span>private</span>
                    </div>
                  )}
                  {signals.github.totalContributions !== undefined ? (
                    <ContributionCalendar activity={signals.github.activity} label={signals.github.activityLabel} />
                  ) : signals.github.state !== "unavailable" ? (
                    <p className="contribution-calendar-empty">
                      The full-year calendar isn’t available from the public snapshot.
                    </p>
                  ) : null}
                </SignalPresentation>
              </article>
              <article className="signal signal-presence">
                <p>Around here</p>
                <figure className="london-signal-visual">
                  <Image
                    src="/signals/london-st-pauls.jpg"
                    alt="London skyline from the Thames, with St Paul’s Cathedral and the City beyond"
                    fill
                    sizes="(max-width: 800px) calc(100vw - 100px), 22vw"
                  />
                  <figcaption>London · home base</figcaption>
                </figure>
                <strong>
                  <LocalTime />
                </strong>
              </article>
              <article className="signal signal-training">
                <p>Training</p>
                <SignalPresentation
                  signal={signals.training}
                  source={{
                    label: signals.training.href ? "Strava" : "My weekly plan",
                    href: signals.training.href,
                  }}
                >
                  <strong>{signals.training.headline}</strong>
                  {signals.training.schedule ? (
                    <InViewMotion>
                      <div className="training-schedule" role="group" aria-label={`${signals.training.windowLabel} training schedule`}>
                        {signals.training.schedule.map((day) => (
                          <div className="training-day" key={day.day}>
                            <b>{day.day}</b>
                            <span>{day.activity}</span>
                          </div>
                        ))}
                      </div>
                    </InViewMotion>
                  ) : (
                    <div className="training-rhythm" aria-label={`${signals.training.windowLabel} training by type`}>
                      {signals.training.weekly.map((category) => (
                        <div className="training-metric" key={category.label}>
                          <i style={{ height: `${Math.max(8, Math.min(100, category.count * 24 + 8))}%` }} aria-hidden="true" />
                          <b>{category.count}</b>
                          <span>{category.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {signals.training.description && <span>{signals.training.description}</span>}
                </SignalPresentation>
              </article>
              <article className="signal signal-fantasy">
                <p>Fantasy football</p>
                <SignalPresentation
                  signal={signals.fantasy}
                  source={{
                    label: "Sleeper",
                    href: signals.fantasy.href,
                  }}
                >
                  <InViewMotion>
                    <FantasyMatchup signal={signals.fantasy} />
                  </InViewMotion>
                  {signals.fantasy.state === "live" && (
                    <strong className="fantasy-season-record">{signals.fantasy.headline}</strong>
                  )}
                  {signals.fantasy.description && <span>{signals.fantasy.description}</span>}
                </SignalPresentation>
              </article>
            </div>
          </div>



          <section className="library-section outside-work-culture" aria-labelledby="culture-title">
            <div className="section-heading compact">
              <p>Books, films, music and history</p>
              <h2 id="culture-title">
                A few things I enjoy <em>outside work.</em>
              </h2>
            </div>
            <div className="library-objects">
              <ClosableDetails
                className="library-object library-object-book"
                contentClassName="library-object-pages"
                summary={(
                  <>
                    <span>Goodreads</span>
                    <SignalStatus signal={signals.reading} />
                    {signals.reading.coverUrl && (
                      <span className="library-book-cover" aria-hidden="true">
                        <Image src={signals.reading.coverUrl} alt="" fill sizes="180px" />
                      </span>
                    )}
                    <strong>{signals.reading.headline}</strong>
                    <i>001</i>
                  </>
                )}
              >
                <h3>{signals.reading.headline}</h3>
                {signals.reading.bookDescription ? (
                  <span>{signals.reading.bookDescription}</span>
                ) : signals.reading.author ? (
                  <span>By {signals.reading.author}</span>
                ) : null}
                <SignalFreshness signal={signals.reading} className="library-freshness" />
                {signals.reading.href && <a href={signals.reading.href} target="_blank" rel="noreferrer">View on Goodreads <span className="arrow-mark" aria-hidden="true">↗︎</span></a>}
              </ClosableDetails>
              <ClosableDetails
                className="library-object library-object-poster"
                contentClassName="library-object-pages"
                summary={(
                  <>
                    <span>Letterboxd</span>
                    <SignalStatus signal={signals.culture} />
                    {signals.culture.filmPosterUrl && (
                      <Image src={signals.culture.filmPosterUrl} alt="" fill sizes="(max-width: 800px) 88vw, 30vw" />
                    )}
                    <strong>{signals.culture.filmTitle ?? signals.culture.headline}</strong>
                    <i>002</i>
                  </>
                )}
              >
                <h3>{signals.culture.filmTitle ?? signals.culture.headline}</h3>
                {signals.culture.filmDescription && <span>{signals.culture.filmDescription}</span>}
                {signals.culture.filmYear && (
                  <span>{signals.culture.filmYear}{signals.culture.filmRating ? ` · ${signals.culture.filmRating} out of 5` : ""}</span>
                )}
                <SignalFreshness signal={signals.culture} className="library-freshness" />
                {signals.culture.filmHref && <a href={signals.culture.filmHref} target="_blank" rel="noreferrer">View on Letterboxd <span className="arrow-mark" aria-hidden="true">↗︎</span></a>}
              </ClosableDetails>
            </div>

            <div className="playlist-room outside-work-playlist">
              <div>
                <p>Music · Spotify</p>
                <SignalStatus signal={{ state: "curated", statusLabel: "My playlist" }} />
                <h3>What I’m listening to</h3>
                <span>I add songs as I find them.</span>
                <a className="playlist-open-link" href={integrationConfig.spotify.playlistUrl} target="_blank" rel="noreferrer">
                  Open playlist in Spotify <span className="arrow-mark" aria-hidden="true">↗︎</span>
                </a>
              </div>
              <iframe
                title="Elias’s current Spotify playlist"
                src={`https://open.spotify.com/embed/playlist/${integrationConfig.spotify.playlistId}?utm_source=generator&theme=0`}
                width="100%"
                height="480"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              />
            </div>

            <div className="library-index outside-work-history" aria-labelledby="history-title">
              <p>History</p>
              <h2 id="history-title">{history.headline}</h2>
              <div>
                <article className="history-card">
                  {history.dateLabel && <span>{history.dateLabel}</span>}
                  <ol className="history-events" aria-label="Historical moments">
                    {history.events.map((event) => (
                      <li className={`history-event${event.image ? " history-event--illustrated" : ""}`} key={`${event.year}-${event.kind}-${event.text}`}>
                        <div className="history-event-meta">
                          <span className="history-event-kind">{event.kind === "birth" ? "Born" : "On this day"}</span>
                          <strong>{event.year}</strong>
                        </div>
                        {event.image && (
                          <figure className="history-event-visual">
                            <div className="history-event-image-frame">
                              <Image
                                src={event.image.src}
                                alt={event.image.alt}
                                fill
                                sizes="(max-width: 700px) calc(100vw - 100px), 22vw"
                              />
                            </div>
                            <figcaption>
                              <span>Image: {event.image.creator}</span>
                              <span className="history-event-credit-links">
                                <a href={event.image.sourceUrl} target="_blank" rel="noreferrer">Commons</a>
                                <a href={event.image.licenseUrl ?? event.image.sourceUrl} target="_blank" rel="noreferrer">{event.image.licenseName}</a>
                              </span>
                            </figcaption>
                          </figure>
                        )}
                        <p>{event.text}</p>
                        <a href={event.sourceUrl} target="_blank" rel="noreferrer">Read the record <span className="arrow-mark" aria-hidden="true">↗︎</span></a>
                      </li>
                    ))}
                  </ol>
                  {history.description && <small>{history.description}</small>}
                  <a className="history-source" href={history.sourceUrl} target="_blank" rel="noreferrer">
                    {history.state === "live" ? "View this week’s Wikimedia events" : "Browse Wikipedia history"} <span className="arrow-mark" aria-hidden="true">↗︎</span>
                  </a>
                </article>
              </div>
            </div>
          </section>
        </section>

        <section className="lab-section experiments-section" id="experiments" tabIndex={-1} aria-labelledby="experiments-title">
          <div className="section-heading compact">
            <p>03 / Experiments</p>
            <div>
              <h2 id="experiments-title">
                Things I’m trying <em>out.</em>
              </h2>
              <p className="section-supporting-copy">
                Side projects, interface studies, and notes from things I’m making.
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
                  <details key={note.index} className="lab-card lab-card-disclosure">
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
          <h2 id="about-title">A bit about me.</h2>
          <div className="about-copy">
            <div className="about-prose">
              <p>{profile.about}</p>
              <p className="about-supporting-copy">
                I like software that tells you what it’s doing, holds up when things go wrong, and gets the small details right.
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
            <div className="about-career-heading">
              <p>Career path</p>
              <div>
                <h3 id="about-career-title">My career so far.</h3>
                <span>I like getting under the surface of a product. I started by using data to improve websites, then moved into building software.</span>
              </div>
            </div>
            <ol className="career-timeline" role="list" aria-labelledby="about-career-title">
              {careerTimeline.map((entry, index) => (
                <li className="career-entry" key={entry.employer}>
                  <div className="career-entry-topline">
                    <span className="career-entry-index">0{index + 1}</span>
                    <p className="career-period">
                      <time dateTime={entry.dates.start.dateTime}>{entry.dates.start.label}</time>
                      <span aria-hidden="true">—</span>
                      {entry.dates.end.dateTime ? (
                        <time dateTime={entry.dates.end.dateTime}>{entry.dates.end.label}</time>
                      ) : (
                        <span>{entry.dates.end.label}</span>
                      )}
                    </p>
                  </div>
                  <h4>{entry.role}</h4>
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
          <h2 id="contact-title">Let’s talk.</h2>
          <div className="contact-actions">
            <div className="contact-primary-action">
              <a className="contact-link" href={profile.links.email}>
                Email me <span className="arrow-mark" aria-hidden="true">↗︎</span>
              </a>
              <span className="contact-email">eliasthebennett@gmail.com</span>
            </div>
            <div className="contact-aside">
              <figure className="contact-photo">
                <Image
                  src="/profile/elias.webp"
                  alt="Elias smiling outside in a grey jumper"
                  fill
                  sizes="(max-width: 420px) 130px, (max-width: 560px) 160px, (max-width: 800px) 250px, (max-width: 1100px) 110px, 180px"
                />
              </figure>
              <nav className="contact-profile-links" aria-label="Other ways to connect">
                <a href={profile.links.github} target="_blank" rel="noreferrer">
                  GitHub <span className="arrow-mark" aria-hidden="true">↗︎</span>
                </a>
                <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn <span className="arrow-mark" aria-hidden="true">↗︎</span>
                </a>
                {profile.links.resume && (
                  <a href={profile.links.resume} target="_blank" rel="noreferrer">
                    Résumé <span className="arrow-mark" aria-hidden="true">↗︎</span>
                  </a>
                )}
              </nav>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Made by {profile.shortName}, in London.</p>
        <div>
          <Link href="/concepts">Design study <span className="arrow-mark" aria-hidden="true">↗︎</span></Link>
          <a href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub <span className="arrow-mark" aria-hidden="true">↗︎</span>
          </a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
