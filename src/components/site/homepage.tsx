import Image from "next/image";
import Link from "next/link";
import { LocalTime } from "@/components/local-time";
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

export async function Homepage() {
  const signals = await getHomepageSignals();

  return (
    <div className="prototype prototype-cabinet-of-curiosities selected-experience">
      <SiteHeader />
      <main id="top">
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
              aria-label="Read the Threshold case study"
            >
              <Image
                src={threshold.image}
                alt={threshold.imageAlt}
                width={1804}
                height={1376}
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
                <Link href="/work/threshold">Read case study →</Link>
                <a href={threshold.liveUrl} target="_blank" rel="noreferrer">
                  Open project ↗
                </a>
                <a href={threshold.codeUrl} target="_blank" rel="noreferrer">
                  View code ↗
                </a>
              </div>
            </div>
          </article>

          <div className="project-rail" aria-label="More selected work">
            <article>
              <span>{argus.index}</span>
              <div>
                <p>{argus.eyebrow}</p>
                <h3>{argus.name}</h3>
              </div>
              <p>{argus.detail}</p>
              <a href={argus.codeUrl} target="_blank" rel="noreferrer">
                Source ↗
              </a>
              <Link href="/work/argus-risk">Read case study →</Link>
            </article>
            <article>
              <span>{flowtime.index}</span>
              <div>
                <p>{flowtime.eyebrow}</p>
                <h3>{flowtime.name}</h3>
              </div>
              <Image
                src={flowtime.image}
                alt={flowtime.imageAlt}
                width={1280}
                height={640}
              />
              <div className="rail-links">
                <Link href="/work/flowtime">Case study →</Link>
                <a href={flowtime.liveUrl} target="_blank" rel="noreferrer">
                  Visit ↗
                </a>
                <a href={flowtime.codeUrl} target="_blank" rel="noreferrer">
                  Code ↗
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
              <div className="activity-trace" role="img" aria-label={signals.github.activityLabel}>
                {signals.github.activity.map((day) => (
                  <i key={day.date} data-level={activityLevel(day.count)} aria-hidden="true" />
                ))}
              </div>
              <div className="signal-footnote">
                <a href={signals.github.href} target="_blank" rel="noreferrer">GitHub ↗</a>
                <span>{freshnessLabel(signals.github.updatedAt)}</span>
              </div>
            </article>
            <article className="signal signal-presence">
              <p>Local signal</p>
              <SignalStatus signal={signals.status} />
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
                  <Image src={signals.reading.coverUrl} alt="" fill sizes="82px" />
                ) : (
                  <><span>Current read</span><i /></>
                )}
              </div>
              <strong>{signals.reading.headline}</strong>
              <span>{signals.reading.description}</span>
              {signals.reading.href && <a className="signal-source-link" href={signals.reading.href} target="_blank" rel="noreferrer">Goodreads ↗</a>}
            </article>
            <article className="signal signal-training">
              <p>Training</p>
              <SignalStatus signal={signals.training} />
              <strong>{signals.training.headline}</strong>
              <div className="strava-summary-frame">
                <iframe
                  title="Elias’s weekly running summary on Strava"
                  src={integrationConfig.strava.weeklySummaryEmbedUrl}
                  width="300"
                  height="160"
                  loading="lazy"
                  scrolling="no"
                />
              </div>
              <span>{signals.training.description}</span>
              {signals.training.href && <a className="signal-source-link" href={signals.training.href} target="_blank" rel="noreferrer">Strava ↗</a>}
            </article>
            <article className="signal signal-fantasy">
              <p>Fantasy football</p>
              <SignalStatus signal={signals.fantasy} />
              <strong>{signals.fantasy.headline}</strong>
              <span className="matchup">
                <b>{signals.fantasy.leftLabel}</b>
                <i>{signals.fantasy.matchupLabel}</i>
                <b>{signals.fantasy.rightLabel}</b>
              </span>
              <span>{signals.fantasy.description}</span>
              {signals.fantasy.href && <a className="signal-source-link" href={signals.fantasy.href} target="_blank" rel="noreferrer">Sleeper ↗</a>}
            </article>
            <article className="signal signal-culture">
              <p>Listening / watching</p>
              <SignalStatus signal={signals.culture} />
              <strong>{signals.culture.headline}</strong>
              {signals.culture.filmYear && (
                <span className="culture-meta">
                  {signals.culture.filmYear}{signals.culture.filmRating ? ` · ${signals.culture.filmRating} ★` : ""}
                </span>
              )}
              <span>{signals.culture.description}</span>
              <div className="signal-source-links">
                {signals.culture.filmHref && <a className="signal-source-link" href={signals.culture.filmHref} target="_blank" rel="noreferrer">Letterboxd ↗</a>}
                <a className="signal-source-link" href={signals.culture.playlistHref} target="_blank" rel="noreferrer">Playlist ↗</a>
              </div>
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
                  <p>{note.kind}</p>
                  <h3>{note.title}</h3>
                  <span className="lab-description">{note.description}</span>
                  <span className="lab-arrow">{note.href ? "Open ↗" : "In the lab →"}</span>
                </>
              );

              return note.href ? (
                <a key={note.index} className="lab-card" href={note.href} target="_blank" rel="noreferrer">
                  {content}
                </a>
              ) : (
                <article key={note.index} className="lab-card">
                  {content}
                </article>
              );
            })}
          </div>
          <Link className="section-link" href="/lab">
            Explore the Lab <span>↗</span>
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
              <p>Books · cinema · history · science fiction · music</p>
              <p>
                A cultural notebook for the things I’m reading, watching, and returning to—built as a shelf of objects rather than a feed.
              </p>
            </div>
            <details className="book-object">
              <summary>
                <span className="book-spine">
                  FIELD NOTES <i>001</i>
                </span>
                <span className="book-cover">
                  <small>From the Library</small>
                  <strong>What makes a system feel human?</strong>
                  <em>Open the object →</em>
                </span>
              </summary>
              <div className="book-pages">
                <p className="page-number">01—02</p>
                <blockquote>Clarity is a form of care.</blockquote>
                <p>
                  A recurring thread in the things I make: complex state becomes useful only when a person can see what happened and decide what to do next.
                </p>
                <span>The first authored Library entry will replace this field note</span>
              </div>
            </details>
          </div>
          <Link className="section-link" href="/library">
            Enter the Library <span>↗</span>
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
              <div className="profile-links" aria-label="Profile links">
                <Link href="/about">More about me →</Link>
                <a href={profile.links.github} target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
                <a href={profile.links.resume} target="_blank" rel="noreferrer">
                  Résumé ↗
                </a>
              </div>
            </div>
            <figure className="portrait-frame">
              <Image
                src="/profile/elias-evening.webp"
                alt="Elias Bennett smiling in a white dinner jacket"
                width={1200}
                height={1500}
              />
              <figcaption>Off duty, approximately</figcaption>
            </figure>
          </div>
          <div id="contact" className="contact-block">
            <p>Have a complex problem worth making simpler?</p>
            <a className="contact-link" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              Start a conversation <span>↗</span>
            </a>
            <span>Email will become the primary contact once the public address is chosen.</span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Designed and built by {profile.shortName}</p>
        <div>
          <Link href="/concepts">Design study ↗</Link>
          <a href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
