import Image from "next/image";
import Link from "next/link";
import { LocalTime } from "@/components/local-time";
import { ClosableDetails } from "@/components/site/closable-details";
import { SignatureLine } from "@/components/signature-line";
import { SiteHeader } from "@/components/site/site-header";
import { integrationConfig } from "@/content/integration-config";
import { labNotes, profile, projects } from "@/content/site";
import { getHomepageSignals } from "@/integrations/homepage";
import type { PersonalSignal } from "@/integrations/types";

const [threshold, argus, flowtime] = projects;

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
      <SiteHeader active="home" />
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

        <section className="work-section" id="work" aria-labelledby="work-title">
          <div className="section-heading">
            <p>01 / Selected work</p>
            <h2 id="work-title">
              Making the cost of a decision <em>visible.</em>
            </h2>
          </div>
          <article className="project-feature">
            <Link
              className="project-visual"
              href="/work/threshold"
              aria-label={`${threshold.index} — Read the Threshold case study`}
            >
              <Image
                src={threshold.image}
                alt={threshold.imageAlt}
                width={1804}
                height={1376}
                sizes="(max-width: 800px) calc(100vw - 56px), 65vw"
                priority
              />
              <span className="project-index">{threshold.index}</span>
            </Link>
            <div className="project-copy">
              <p className="project-type">{threshold.eyebrow}</p>
              <h3>{threshold.name}</h3>
              <p>{threshold.description}</p>
              <ul aria-label="Threshold qualities">
                {threshold.qualities.map((quality) => (
                  <li key={quality}>{quality}</li>
                ))}
              </ul>
              <div className="project-links">
                <Link href="/work/threshold">Read case study <span className="arrow-mark" aria-hidden="true">→</span></Link>
                <a href={threshold.liveUrl} target="_blank" rel="noreferrer">
                  Open project <span className="arrow-mark" aria-hidden="true">↗︎</span>
                </a>
                <a href={threshold.codeUrl} target="_blank" rel="noreferrer">
                  View code <span className="arrow-mark" aria-hidden="true">↗︎</span>
                </a>
              </div>
            </div>
          </article>

          <div className="project-rail" role="region" aria-label="More selected work">
            <article>
              <span>{argus.index}</span>
              <Image
                src={argus.image}
                alt={argus.imageAlt}
                width={1280}
                height={770}
                sizes="(max-width: 800px) calc(100vw - 68px), 40vw"
              />
              <div>
                <p>{argus.eyebrow}</p>
                <h3>{argus.name}</h3>
              </div>
              <p>{argus.detail}</p>
              <a href={argus.codeUrl} target="_blank" rel="noreferrer">
                Source <span className="arrow-mark" aria-hidden="true">↗︎</span>
              </a>
              <Link href="/work/argus-risk">Read case study <span className="arrow-mark" aria-hidden="true">→</span></Link>
            </article>
            <article>
              <span>{flowtime.index}</span>
              <Image
                src={flowtime.image}
                alt={flowtime.imageAlt}
                width={1280}
                height={640}
                sizes="(max-width: 800px) calc(100vw - 68px), 40vw"
              />
              <div>
                <p>{flowtime.eyebrow}</p>
                <h3>{flowtime.name}</h3>
              </div>
              <p>{flowtime.detail}</p>
              <div className="rail-links">
                <Link href="/work/flowtime">Case study <span className="arrow-mark" aria-hidden="true">→</span></Link>
                <a href={flowtime.liveUrl} target="_blank" rel="noreferrer">
                  Visit <span className="arrow-mark" aria-hidden="true">↗︎</span>
                </a>
                <a href={flowtime.codeUrl} target="_blank" rel="noreferrer">
                  Code <span className="arrow-mark" aria-hidden="true">↗︎</span>
                </a>
              </div>
            </article>
          </div>
        </section>

        <section className="currently-section" id="now" aria-labelledby="currently-title">
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
            </article>
          </div>
        </section>

        <section className="lab-section" id="lab" aria-labelledby="lab-title">
          <div className="section-heading compact">
            <p>03 / Lab</p>
            <h2 id="lab-title">
              Small bets, unfinished ideas, and <em>useful mistakes.</em>
            </h2>
          </div>
          <div className="lab-grid">
            {labNotes.map((note) => {
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
                  <span className="lab-arrow">{note.href ? <>Open <span className="arrow-mark" aria-hidden="true">↗︎</span></> : <>In the lab <span className="arrow-mark" aria-hidden="true">→</span></>}</span>
                </>
              );

              return (
                <Link key={note.index} className="lab-card" href={note.href}>
                  {content}
                </Link>
              );
            })}
          </div>
          <Link className="section-link" href="/lab">
            Explore the Lab <span className="arrow-mark" aria-hidden="true">↗︎</span>
          </Link>
        </section>

        <section className="library-section" id="library" aria-labelledby="library-title">
          <div className="section-heading compact">
            <p>04 / Library</p>
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

        <section className="about-section" id="about" aria-labelledby="about-title">
          <p>05 / About</p>
          <h2 id="about-title">
            Engineer by trade.
            <br />
            <em>Curious by default.</em>
          </h2>
          <div className="about-copy">
            <div className="about-prose">
              <p>{profile.about}</p>
              <nav className="profile-links" aria-label="Profile links">
                <Link href="/about">More about me <span className="arrow-mark" aria-hidden="true">→</span></Link>
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
          <div id="contact" className="contact-block">
            <p>Have a complex problem worth making simpler?</p>
            <a className="contact-link" href={profile.links.email}>
              Start a conversation <span className="arrow-mark" aria-hidden="true">↗︎</span>
            </a>
            <span>eliasthebennett@gmail.com</span>
          </div>
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
