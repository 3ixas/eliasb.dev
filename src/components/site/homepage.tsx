import { About } from "@/components/board/about";
import { Board } from "@/components/board/board";
import { BoardHeader } from "@/components/board/board-header";
import { Hero } from "@/components/board/hero";
import { Work } from "@/components/board/work";
import { profile } from "@/content/site";

export async function Homepage() {
  return (
    <div className="prototype prototype-cabinet-of-curiosities selected-experience" id="top" tabIndex={-1}>
      <BoardHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />

        <Work />

        <Board />

        <About />

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
