import Image from "next/image";
import Link from "next/link";
import { ConceptToolbar } from "@/components/concept-toolbar";
import { LocalTime } from "@/components/local-time";
import { SignatureLine } from "@/components/signature-line";
import { conceptDirections, type ConceptDirection } from "@/lib/concepts";

export function ConceptPrototype({ direction }: { direction: ConceptDirection }) {
  const concept = conceptDirections[direction];

  return (
    <div className={`prototype prototype-${direction}`}>
      <ConceptToolbar direction={direction} />
      <header className="site-header">
        <a href="#top" className="site-mark" aria-label="Elias B. home">E/B</a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#lab">Lab</a>
          <a href="#library">Library</a>
          <a href="#about">About</a>
        </nav>
        <a href="#about" className="say-hello">Say hello ↓</a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-kicker">
          <p className="hero-kicker" id="hero-kicker">Elias B. · Software engineer · London</p>
          <SignatureLine direction={direction} />
          <div className="hero-lower">
            <p className="hero-copy">
              I work across engineering, product, and interface design—turning
              consequential systems into tools people can understand and trust.
            </p>
            <p className="concept-thesis"><span>{concept.number}</span>{concept.thesis}</p>
          </div>
          <a className="scroll-cue" href="#work">Selected work <span>↓</span></a>
        </section>

        <section className="work-section" id="work" aria-labelledby="work-title">
          <div className="section-heading">
            <p>01 / Selected work</p>
            <h2 id="work-title">Making the cost of a decision <em>visible.</em></h2>
          </div>
          <article className="project-feature">
            <div className="project-visual">
              <Image
                src="/projects/threshold.webp"
                alt="Threshold landing page showing rental affordability choices for London, Basel, and Zurich"
                width={1804}
                height={1376}
                priority
              />
              <span className="project-index">01</span>
            </div>
            <div className="project-copy">
              <p className="project-type">Product engineering · Data visualization · 2026</p>
              <h3>Threshold</h3>
              <p>
                A rental-affordability calculator for London, Basel, and Zurich.
                It turns salary, moving costs, and local assumptions into a clear,
                shareable picture of what independent living really costs.
              </p>
              <ul aria-label="Threshold qualities">
                <li>Shareable URL state</li>
                <li>Typed city configuration</li>
                <li>Accessible visual reasoning</li>
              </ul>
              <a href="https://threshold-beta.vercel.app" target="_blank" rel="noreferrer">Visit project ↗</a>
            </div>
          </article>
          <div className="project-rail" aria-label="More selected work">
            <article>
              <span>02</span>
              <div><p>Event-driven systems</p><h3>Argus Risk</h3></div>
              <p>Kafka · PostgreSQL · SignalR · Next.js</p>
            </article>
            <article>
              <span>03</span>
              <div><p>Offline-first interaction</p><h3>Flowtime</h3></div>
              <Image src="/projects/flowtime.jpg" alt="Flowtime focus timer interface" width={1280} height={640} />
            </article>
          </div>
        </section>

        <section className="currently-section" id="lab" aria-labelledby="currently-title">
          <div className="section-heading compact">
            <p>02 / Now, approximately</p>
            <h2 id="currently-title">A few live signals from <em>outside the résumé.</em></h2>
          </div>
          <div className="signal-grid">
            <article className="signal signal-building">
              <p>Building</p>
              <strong>Personal site 2.0</strong>
              <span>Three visual directions in progress</span>
              <div className="activity-trace" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} />)}</div>
            </article>
            <article className="signal signal-presence">
              <p>Local signal</p>
              <strong><LocalTime /></strong>
              <span>Probably thinking through an interface.</span>
            </article>
            <article className="signal signal-reading">
              <p>On the shelf</p>
              <div className="mini-book" aria-hidden="true"><span>Current title</span><i /></div>
              <strong>Reading selection pending</strong>
              <span>Real title and cover needed from Elias</span>
            </article>
            <article className="signal signal-training">
              <p>Training</p>
              <strong>Lift · Run · Muay Thai</strong>
              <div className="training-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
              <span>Site-owned summary + official Strava presence</span>
            </article>
            <article className="signal signal-fantasy">
              <p>Fantasy football</p>
              <strong>Main redraft league</strong>
              <span className="matchup"><b>EB</b><i>in season</i><b>—</b></span>
              <span>Sleeper connection pending</span>
            </article>
            <article className="signal signal-culture">
              <p>Listening / watching</p>
              <strong>Public signals pending</strong>
              <span>Spotify playlist · Letterboxd feed</span>
            </article>
          </div>
        </section>

        <section className="library-section" id="library" aria-labelledby="library-title">
          <div className="section-heading compact">
            <p>03 / Library</p>
            <h2 id="library-title">Ideas I keep <em>within reach.</em></h2>
          </div>
          <div className="library-stage">
            <div className="shelf-note">
              <p>Books · cinema · history · science fiction · music</p>
              <p>This sample tests the tactile interaction. The final object will use a real current book.</p>
            </div>
            <details className="book-object">
              <summary>
                <span className="book-spine">FIELD NOTES <i>001</i></span>
                <span className="book-cover">
                  <small>Library prototype</small>
                  <strong>What makes a system feel human?</strong>
                  <em>Open the object →</em>
                </span>
              </summary>
              <div className="book-pages">
                <p className="page-number">01—02</p>
                <blockquote>Clarity is a form of care.</blockquote>
                <p>
                  A provisional note about the thread running through Threshold,
                  Argus Risk, and Flowtime: complex state becomes useful only when
                  a person can see what happened and decide what to do next.
                </p>
                <span>Replace with an authored Library entry</span>
              </div>
            </details>
          </div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <p>04 / About</p>
          <h2 id="about-title">Engineer by trade.<br /><em>Curious by default.</em></h2>
          <div className="about-copy">
            <p>
              I’m Elias, a London-based software engineer interested in the point
              where systems thinking, product judgment, and visual craft meet.
            </p>
            <p className="photo-placeholder">Real portrait to be tested here</p>
          </div>
          <span className="contact-link contact-pending">Email address pending <span>↗</span></span>
        </section>
      </main>

      <footer className="site-footer">
        <p>Designed and built by Elias B. · Concept {concept.number}</p>
        <div><Link href="https://github.com/3ixas">GitHub ↗</Link><a href="#top">Back to top ↑</a></div>
      </footer>
    </div>
  );
}
