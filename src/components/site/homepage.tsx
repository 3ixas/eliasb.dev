import Image from "next/image";
import Link from "next/link";
import { LocalTime } from "@/components/local-time";
import { ClosableDetails } from "@/components/site/closable-details";
import { FeaturedWork } from "@/components/site/featured-work";
import { SignatureLine } from "@/components/signature-line";
import { SiteHeader } from "@/components/site/site-header";
import { journey, labItems } from "@/content/collections";
import { integrationConfig } from "@/content/integration-config";
import { profile } from "@/content/site";
import { getHomepageSignals } from "@/integrations/homepage";
import type { PersonalSignal } from "@/integrations/types";

const interests = [
  ["01", "Lift", "Strength, repetition, patience."],
  ["02", "Run", "Distance and a clearer head."],
  ["03", "Muay Thai", "Technique under pressure."],
  ["04", "Football", "Watching, arguing, modelling."],
  ["05", "Reading", "Stories and ideas kept within reach."],
  ["06", "History", "Patterns, people, and the details that stay useful."],
] as const;
function SignalStatus({ signal }: { signal: Pick<PersonalSignal, "state" | "statusLabel"> }) {
  return <span className="signal-status" data-state={signal.state}>{signal.statusLabel}</span>;
}

function activityLevel(count: number) {
  if (count >= 4) return "4";
  if (count >= 3) return "3";
  if (count >= 2) return "2";
  if (count >= 1) return "1";
  return "0";
}

function freshnessLabel(updatedAt: string | null) {
  if (!updatedAt) return "Stable fallback";
  return `Updated ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(updatedAt))}`;
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
  const signals = await getHomepageSignals();

  return (
    <div className="prototype prototype-cabinet-of-curiosities selected-experience" id="top">
      <SiteHeader />
      <main id="main-content">
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

        <section className="outside-work-section" id="outside-work" aria-label="Outside work">
          <section className="currently-section" aria-labelledby="currently-title">
            <div className="section-heading compact">
              <p>02 / Now, approximately</p>
              <h2 id="currently-title">
                A few signals from <em>outside the résumé.</em>
              </h2>
            </div>
            <div className="signal-grid">
              <article className="signal signal-building">
                <p>Recent building</p>
                <SignalStatus signal={signals.github} />
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
                <div className="signal-footnote">
                  <a href={signals.github.href} target="_blank" rel="noreferrer">GitHub <span className="arrow-mark" aria-hidden="true">↗︎</span></a>
                  <span>{freshnessLabel(signals.github.updatedAt)}</span>
                </div>
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
              <article className="signal signal-reading">
                <p>On the shelf</p>
                <SignalStatus signal={signals.reading} />
                <div className="mini-book" aria-hidden="true">
                  {signals.reading.coverUrl ? (
                    <Image src={signals.reading.coverUrl} alt="" fill sizes="96px" />
                  ) : (
                    <><span>Current read</span><i /></>
                  )}
                </div>
                <strong>{signals.reading.headline}</strong>
                <span>{signals.reading.description}</span>
                {signals.reading.href && <a className="signal-source-link" href={signals.reading.href} target="_blank" rel="noreferrer">Goodreads <span className="arrow-mark" aria-hidden="true">↗︎</span></a>}
              </article>
              <article className="signal signal-training">
                <p>Training</p>
                <SignalStatus signal={signals.training} />
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
                <div className="signal-footnote">
                  {signals.training.href && <a href={signals.training.href} target="_blank" rel="noreferrer">Strava <span className="arrow-mark" aria-hidden="true">↗︎</span></a>}
                  <span>{freshnessLabel(signals.training.updatedAt)}</span>
                </div>
              </article>
              <article className="signal signal-fantasy">
                <p>Fantasy football</p>
                <SignalStatus signal={signals.fantasy} />
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
                {signals.fantasy.href && <a className="signal-source-link" href={signals.fantasy.href} target="_blank" rel="noreferrer">Sleeper <span className="arrow-mark" aria-hidden="true">↗︎</span></a>}
              </article>
              <article className="signal signal-culture">
                <p>Watching</p>
                <SignalStatus signal={signals.culture} />
                <strong>{signals.culture.headline}</strong>
                {signals.culture.filmPosterUrl && (
                  <Image
                    className="culture-poster"
                    src={signals.culture.filmPosterUrl}
                    alt=""
                    width={240}
                    height={360}
                    sizes="120px"
                  />
                )}
                {signals.culture.filmYear && (
                  <span className="culture-meta">
                    {signals.culture.filmYear}{signals.culture.filmRating ? ` · ${signals.culture.filmRating} ★` : ""}
                  </span>
                )}
                <span>{signals.culture.description}</span>
                <span className="culture-freshness">{freshnessLabel(signals.culture.updatedAt)}</span>
                <div className="signal-source-links">
                  {signals.culture.filmHref && <a className="signal-source-link" href={signals.culture.filmHref} target="_blank" rel="noreferrer">Letterboxd <span className="arrow-mark" aria-hidden="true">↗︎</span></a>}
                </div>
              </article>
              <article className="signal signal-playlist">
                <p>Currently listening</p>
                <SignalStatus signal={{ state: "curated", statusLabel: "Spotify" }} />
                <strong>A playlist with the aux cable.</strong>
                <p className="playlist-description">Kept by hand, played through Spotify, and allowed to change.</p>
                <iframe
                  className="spotify-embed"
                  title="Elias’s current Spotify playlist"
                  src={`https://open.spotify.com/embed/playlist/${integrationConfig.spotify.playlistId}?utm_source=generator&theme=0`}
                  height="152"
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                />
                <a className="playlist-open-link" href={integrationConfig.spotify.playlistUrl} target="_blank" rel="noreferrer">
                  Open playlist in Spotify <span className="arrow-mark" aria-hidden="true">↗︎</span>
                </a>
              </article>
            </div>
          </section>



          <section className="library-section" aria-labelledby="library-title">
            <div className="section-heading compact">
              <p>Library</p>
              <h2 id="library-title">
                Ideas I keep <em>within reach.</em>
              </h2>
            </div>
            <div className="library-stage">
              <div className="shelf-note">
                <p>
                  Books, films, history, science fiction, and music I’m spending time with.
                </p>
              </div>
              <ClosableDetails
                className="book-object"
                contentClassName="book-pages"
                summary={(
                  <>
                    <span className="book-spine">
                      FIELD NOTES <i>001</i>
                    </span>
                    <span className="book-cover">
                      <small>From the Library</small>
                      <strong>What makes a system feel human?</strong>
                      <em>Open the object <span className="arrow-mark" aria-hidden="true">→</span></em>
                    </span>
                  </>
                )}
              >
                <p className="page-number">01—02</p>
                <blockquote>Clarity is a form of care.</blockquote>
                <p>
                  A recurring thread in the things I make: complex state becomes useful only when a person can see what happened and decide what to do next.
                </p>
                <span>A short note about clarity and useful software.</span>
              </ClosableDetails>
            </div>
            <Link className="section-link" href="/library">
              Enter the Library <span className="arrow-mark" aria-hidden="true">↗︎</span>
            </Link>
          </section>
        </section>

        <section className="lab-section experiments-section" id="experiments" aria-labelledby="experiments-title">
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

        <section className="about-section" id="about" aria-labelledby="about-title">
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

        <section id="contact" className="contact-block contact-section" aria-labelledby="contact-title">
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
