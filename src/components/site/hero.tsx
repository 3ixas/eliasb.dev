import Image from "next/image";
import { heroPortrait } from "@/content/stretch/media";
import { hero } from "@/content/stretch/site-copy";

/**
 * The first screen: the name at display size in cobalt, the real h1 headline,
 * the supporting line and two actions, and the portrait with its label. On
 * desktop the portrait sits right of the name; on phones it is stacked below
 * the actions (stretch-shell.css). The name is plain text, so it reads as
 * "Elias Bennett" whatever the layout.
 */
export function Hero() {
  return (
    <section className="stretch-wrap stretch-hero" aria-label="Introduction">
      <p className="stretch-display stretch-name">
        <span>{hero.name.first}</span> <span>{hero.name.last}</span>
      </p>

      <div className="stretch-hero__lede">
        <h1>
          {hero.headline.lead} <em>{hero.headline.emphasis}</em>
        </h1>
        <p className="stretch-hero__support">{hero.support}</p>
        <div className="stretch-hero__actions">
          <a className="stretch-button" href="#work">
            {hero.actions.work}
          </a>
          <a className="stretch-button stretch-button--primary" href="#say-hello">
            {hero.actions.hello}
          </a>
        </div>
      </div>

      <figure className="stretch-portrait">
        <Image
          src={heroPortrait.src}
          alt={heroPortrait.alt}
          width={heroPortrait.width}
          height={heroPortrait.height}
          sizes="(max-width: 760px) 80vw, 290px"
          priority
        />
        <figcaption className="stretch-portrait__label">{hero.portraitLabel}</figcaption>
      </figure>
    </section>
  );
}
