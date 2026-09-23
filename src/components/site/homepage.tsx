import Image from "next/image";
import Link from "next/link";
import { LocalTime } from "@/components/local-time";
import { ClosableDetails } from "@/components/site/closable-details";
import { FeaturedWork } from "@/components/site/featured-work";
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

const interests = [
  ["01", "Lift", "Strength, repetition, patience."],
  ["02", "Run", "Distance and a clearer head."],
  ["03", "Muay Thai", "Technique under pressure."],
  ["04", "Football", "Watching, arguing, modelling."],
  ["05", "Reading", "Stories and ideas kept within reach."],
  ["06", "History", "Patterns, people, and the details that stay useful."],
] as const;
function activityLevel(count: number) {
  if (count >= 4) return "4";
  if (count >= 3) return "3";
  if (count >= 2) return "2";
  if (count >= 1) return "1";
  return "0";
}

function scoreWidth(left?: number, right?: number) {
  if (!left && !right) return { left: "50%", right: "50%" };
  const total = (left ?? 0) + (right ?? 0);
  if (!total) return { left: "50%", right: "50%" };
  return {
    left: `${Math.max(12, Math.round(((left ?? 0) / total) * 100))}%`,
    right: `${Math.max(12, Math.round(((right ?? 0) / total) * 100))}%`,
  };
}

export async function Homepage() {
  const [signals, history] = await Promise.all([getHomepageSignals(), getHistorySignal()]);

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
            <p className="hero-copy">{profile.introduction}</p>
            <p className="concept-thesis">
              <span>Now</span>
              Building a more personal corner of the internet.
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
                    label: signals.github.state === "unavailable" ? "GitHub fallback" : "GitHub",
                    href: signals.github.href,
                  }}
                >
                  <strong>{signals.github.headline}</strong>
                  <span>{signals.github.description}</span>
                  {signals.github.totalContributions !== undefined && (
                    <div className="signal-metrics" aria-label="GitHub contribution totals">
                      <b>{signals.github.totalContributions}</b>
                      <span>contributions</span>
                      {signals.github.privateContributions !== undefined && (
                        <>
                          <b>{signals.github.privateContributions}</b>
                          <span>private</span>
                        </>
                      )}
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
                  source={{
                    label: signals.training.href ? "Strava" : "Authored schedule",
                    href: signals.training.href,
                  }}
                >
                  <strong>{signals.training.headline}</strong>
                  {signals.training.schedule ? (
                    <div className="training-schedule" role="group" aria-label={`${signals.training.windowLabel} training schedule`}>
                      {signals.training.schedule.map((day) => (
                        <div className="training-day" key={day.day}>
                          <b>{day.day}</b>
                          <span>{day.activity}</span>
                        </div>
                      ))}
                    </div>
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
                  <span>{signals.training.description}</span>
                </SignalPresentation>
              </article>
              <article className="signal signal-fantasy">
                <p>Fantasy football</p>
                <SignalPresentation
                  signal={signals.fantasy}
                  source={{
                    label: signals.fantasy.href ? "Sleeper" : "Sleeper pending",
                    href: signals.fantasy.href,
                  }}
                >
                  <figure className="fantasy-field">
                    <Image
                      src="/signals/football-stadium.jpg"
                      alt=""
                      fill
                      sizes="(max-width: 800px) calc(100vw - 100px), 30vw"
                    />
                    <figcaption>NFL · week 1</figcaption>
                  </figure>
                  <strong>{signals.fantasy.headline}</strong>
                  <span className="matchup">
                    <b>{signals.fantasy.leftLabel}</b>
                    <i>{signals.fantasy.matchupLabel}</i>
                    <b>{signals.fantasy.rightLabel}</b>
                  </span>
                  <div className="matchup-bars" aria-hidden="true">
                    <i style={{ width: scoreWidth(signals.fantasy.leftScore, signals.fantasy.rightScore).left }} />
                    <i style={{ width: scoreWidth(signals.fantasy.leftScore, signals.fantasy.rightScore).right }} />
                  </div>
                  <span>{signals.fantasy.description}</span>
                </SignalPresentation>
              </article>
            </div>
          </div>



          <section className="library-section outside-work-culture" aria-labelledby="culture-title">
            <div className="section-heading compact">
              <p>Culture and curiosities</p>
              <h2 id="culture-title">
                Things I keep <em>within reach.</em>
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
                <p>{signals.culture.state === "live" ? "Most recently watched" : "Last film I watched and logged"}</p>
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
                <SignalStatus signal={{ state: "curated", statusLabel: "Curated playlist" }} />
                <h3>What I’m listening to</h3>
                <span>A playlist I update by hand and listen to on Spotify.</span>
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
              <p>History · a small weekly note</p>
              <h2 id="history-title">A few things that happened this week.</h2>
              <div>
                <article className="history-card">
                  <span>{history.dateLabel}</span>
                  <h3>{history.headline}</h3>
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
                    {history.statusLabel} <span className="arrow-mark" aria-hidden="true">↗︎</span>
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
                Small bets, unfinished ideas, and <em>useful mistakes.</em>
              </h2>
              <p className="section-supporting-copy">
                Occasional work in progress, interface studies, and notes from making things. No schedule, just ideas worth keeping.
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
          <h2 id="about-title">
            Engineer by trade.
            <br />
            <em>Curious by default.</em>
          </h2>
          <div className="about-copy">
            <div className="about-prose">
              <p>{profile.about}</p>
              <p className="about-supporting-copy">
                I like software that respects the person using it: clear enough to understand, resilient when things go wrong, and considered down to the awkward states.
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
          <div className="about-thread">
            <div className="about-thread-heading">
              <p>Connecting thread</p>
              <div>
                <h3 id="about-thread-title">The thread through all of it.</h3>
                <span>How do you make complicated things easier to understand?</span>
              </div>
            </div>
            <ol aria-labelledby="about-thread-title">
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
          <div className="about-interests">
            <div>
              <p>Outside the editor</p>
              <h3 id="about-interests-title">A few other ways I measure a week.</h3>
            </div>
            <ul aria-labelledby="about-interests-title">
              {interests.map(([index, title, description]) => (
                <li key={index}>
                  <span>{index}</span>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" tabIndex={-1} className="contact-block contact-section" aria-labelledby="contact-title">
          <p>05 / Contact</p>
          <h2 id="contact-title">Have a complex problem worth making simpler?</h2>
          <a className="contact-link" href={profile.links.email}>
            Start a conversation <span className="arrow-mark" aria-hidden="true">↗︎</span>
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
