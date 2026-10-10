import Image from "next/image";
import { heroPortrait } from "@/content/stretch/media";
import { hero } from "@/content/stretch/site-copy";

/**
 * The first screen: the name at display size in cobalt, the real h1 headline,
 * the supporting line and two actions, and the portrait with its label. On
 * desktop the portrait sits right of the name; on phones it is stacked below
 * the actions (stretch-shell.css). The name is plain text, so it reads as
 * "Elias Bennett" whatever the layout. The data-entrance marks are the parts
 * the signature entrance holds and releases (entrance.ts); the underline is
 * the hand-drawn highlight the entrance draws.
 */
export function Hero() {
  return (
    <section className="stretch-wrap stretch-hero" aria-label="Introduction">
      <p className="stretch-display stretch-name" data-entrance="name">
        <span>{hero.name.first}</span> <span>{hero.name.last}</span>
      </p>

      <div className="stretch-hero__lede">
        <h1 data-entrance="headline">
          {hero.headline.lead}{" "}
          <em>
            {hero.headline.emphasis}
            <svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M6 26 C 80 17, 170 31, 250 21 S 360 15, 394 25" />
            </svg>
          </em>
        </h1>
        <p className="stretch-hero__support" data-entrance="support">
          {hero.support}
        </p>
        <div className="stretch-hero__actions" data-entrance="support">
          <a className="stretch-button" href="#work">
            {hero.actions.work}
          </a>
          <a className="stretch-button stretch-button--primary" href="#say-hello">
            {hero.actions.hello}
          </a>
        </div>
      </div>

      <figure className="stretch-portrait" data-entrance="portrait">
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
