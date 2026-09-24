import Image from "next/image";
import Link from "next/link";
import { LocalTime } from "@/components/local-time";
import { ClosableDetails } from "@/components/site/closable-details";
import { FeaturedWork } from "@/components/site/featured-work";
import { FantasyMatchup } from "@/components/site/fantasy-matchup";
import { InViewMotion } from "@/components/site/in-view-motion";
import {
  SignalFreshness,
  SignalPresentation,
  SignalStatus,
} from "@/components/site/signal-presentation";
import { SignatureLine } from "@/components/signature-line";
import { SiteHeader } from "@/components/site/site-header";
import { journey, labItems } from "@/content/collections";
import { integrationConfig } from "@/content/integration-config";
import { profile } from "@/content/site";
import { getHomepageSignals } from "@/integrations/homepage";
import { getHistorySignal } from "@/integrations/history";

function activityLevel(count: number) {
  if (count >= 4) return "4";
  if (count >= 3) return "3";
  if (count >= 2) return "2";
  if (count >= 1) return "1";
  return "0";
}

export async function Homepage() {
  const [signals, history] = await Promise.all([getHomepageSignals(), getHistorySignal()]);
  const hasAuthoredTrainingSchedule = signals.training.state === "curated" && Boolean(signals.training.schedule);

  return (
    <div className="prototype prototype-cabinet-of-curiosities selected-experience" id="top" tabIndex={-1}>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-kicker">
          <p className="hero-kicker" id="hero-kicker">
            {profile.shortName} · {profile.role} · {profile.location}
          </p>
          <SignatureLine direction="selected-homepage" statement={profile.statement} />
          <div className="hero-lower">
            <div className="hero-introduction">
              <p className="hero-introduction-label">How I work</p>
              <p className="hero-copy">{profile.introduction}</p>
            </div>
            <p className="concept-thesis">
              <span>Here</span>
              My projects, a few experiments, and some things I enjoy.
            </p>
          </div>
          <a className="scroll-cue" href="#work">
            Selected work <span>↓</span>
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
                  <span>{signals.github.description}</span>
                  {signals.github.privateContributions !== undefined && (
                    <div className="signal-metrics" role="group" aria-label="Private contribution count">
                      <b>{signals.github.privateContributions}</b>
                      <span>private</span>
                    </div>
                  )}
                  <div className="activity-trace" role="img" aria-label={signals.github.activityLabel}>
                    {signals.github.activity.map((day) => (
                      <i key={day.date} data-level={activityLevel(day.count)} aria-hidden="true" />
                    ))}
                  </div>
                </SignalPresentation>
              </article>
              <article className="signal signal-presence">
                <p>Local signal</p>
                <SignalStatus signal={signals.status} />
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
                <span>{signals.status.headline}</span>
              </article>
              <article className="signal signal-training">
                <p>Training</p>
                <SignalPresentation
                  signal={signals.training}
                  authoredLabel={hasAuthoredTrainingSchedule ? "Maintained by hand" : undefined}
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
                  {!hasAuthoredTrainingSchedule && <span>{signals.training.description}</span>}
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
                  <span>{signals.fantasy.description}</span>
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
                <p>{signals.reading.state === "live" ? "Currently reading" : "Reading"}</p>
                <h3>{signals.reading.headline}</h3>
                <span>
                  {signals.reading.bookDescription ?? `${signals.reading.author ? `By ${signals.reading.author}. ` : ""}${signals.reading.description}`}
                </span>
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
                <p>{signals.culture.state === "live" ? "Most recent film in my Letterboxd diary" : "Last known film in my Letterboxd diary"}</p>
                <h3>{signals.culture.filmTitle ?? signals.culture.headline}</h3>
                <span>{signals.culture.filmDescription ?? signals.culture.description}</span>
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
                  <span>{history.dateLabel}</span>
                  <div className="history-events">
                    {history.events.map((event) => (
                      <p key={`${event.year}-${event.text}`}>
                        <strong>{event.year}</strong> {event.text}
                        <a href={event.sourceUrl} target="_blank" rel="noreferrer">Source <span className="arrow-mark" aria-hidden="true">↗︎</span></a>
                      </p>
                    ))}
                  </div>
                  <small>{history.description}</small>
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
                I like software that respects the person using it: clear about what’s happening, dependable when things go wrong, and careful with the details.
              </p>
              <nav className="profile-links" aria-label="Profile links">
                <a href="#contact">Start a conversation <span className="arrow-mark" aria-hidden="true">↓</span></a>
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
                <span>I started in marketing and data, moved into AI model training, and now work in software engineering.</span>
              </div>
            </div>
            <ol aria-labelledby="about-career-title">
              {journey.map((step, index) => (
                <li key={step.label}>
                  <span>0{index + 1}</span>
                  <p>{step.label}</p>
                  <h4>{step.title}</h4>
                  <div>{step.description}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="contact" tabIndex={-1} className="contact-block contact-section" aria-labelledby="contact-title">
          <p>05 / Contact</p>
          <h2 id="contact-title">Get in touch.</h2>
          <a className="contact-link" href={profile.links.email}>
            Email me <span className="arrow-mark" aria-hidden="true">↗︎</span>
          </a>
          <span>eliasthebennett@gmail.com</span>
        </section>
      </main>

      <footer className="site-footer">
        <p>Designed and built by {profile.shortName}</p>
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
