import type { Metadata } from "next";
import Image from "next/image";
import { LocalTime } from "@/components/local-time";
import { PageHeader } from "@/components/site/page-header";
import { journey } from "@/content/collections";
import { profile } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: "About Elias Bennett, a London-based software engineer working across product, interface, and systems.",
};

export default function AboutPage() {
  return (
    <div className="collection-page about-page">
      <PageHeader active="about" />
      <main id="main-content">
        <header className="about-hero">
          <div>
            <p>About · Elias Bennett</p>
            <h1>Engineer by trade.<br /><em>Curious by default.</em></h1>
          </div>
          <figure>
            <Image
              src="/profile/elias-coast.webp"
              alt="Elias Bennett standing on a boat with the coastline behind him"
              width={1200}
              height={1600}
              sizes="(max-width: 800px) 92vw, 42vw"
              priority
            />
            <figcaption>Based in London · <LocalTime /></figcaption>
          </figure>
        </header>

        <section className="about-statement" aria-labelledby="about-statement-title">
          <p>What I care about</p>
          <h2 id="about-statement-title">
            I like software that respects the person using it: clear enough to understand, resilient when things go wrong, and considered down to the awkward states.
          </h2>
          <div>
            <p>{profile.about}</p>
            <p>
              Outside work, I’m usually reading, watching films, training, following football, or turning one of those interests into another small data problem.
            </p>
          </div>
        </section>

        <section className="journey-section" aria-labelledby="journey-title">
          <div className="journey-heading"><p>A short path here</p><h2 id="journey-title">Different work, one recurring question.</h2></div>
          <ol>
            {journey.map((step, index) => (
              <li key={step.label}>
                <span>0{index + 1}</span>
                <p>{step.label}</p>
                <h3>{step.title}</h3>
                <div>{step.description}</div>
              </li>
            ))}
          </ol>
        </section>

        <section className="life-texture" aria-labelledby="life-title">
          <div><p>Outside the editor</p><h2 id="life-title">A few other ways I measure a week.</h2></div>
          <ul>
            <li><span>01</span><strong>Lift</strong><p>Strength, repetition, patience.</p></li>
            <li><span>02</span><strong>Run</strong><p>Distance and a clearer head.</p></li>
            <li><span>03</span><strong>Muay Thai</strong><p>Technique under pressure.</p></li>
            <li><span>04</span><strong>Football</strong><p>Watching, arguing, modelling.</p></li>
          </ul>
        </section>

        <section className="about-contact" id="contact" aria-labelledby="about-contact-title">
          <p>Have a complex problem worth making simpler?</p>
          <h2 id="about-contact-title">Let’s talk.</h2>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer">Start a conversation <span>↗</span></a>
          <div>
            <span>Public email pending</span>
            <a href={profile.links.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href={profile.links.resume} target="_blank" rel="noreferrer">Résumé ↗</a>
          </div>
        </section>
      </main>
    </div>
  );
}
