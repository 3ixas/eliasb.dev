import Image from "next/image";
import Link from "next/link";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { EclipseToggle } from "@/components/site/eclipse-toggle";
import { SectionLinks } from "@/components/site/section-links";
import { SiteGreeting } from "@/components/site/site-greeting";
import { heroPortrait } from "@/content/stretch/media";
import { siteCopy } from "@/content/stretch/site-copy";

type Section = { readonly id: string; readonly label: string };

/**
 * The homepage's header has its five sections and the portrait's closer look. An `inner` page (every other page)
 * leads home by its name and shows the portrait as a picture only; it has its own `sections`, or none.
 */
type HeaderProps = { sections: readonly Section[]; inner?: never } | { inner: true; sections?: readonly Section[] };

const name = "Elias Bennett";
const { portrait } = siteCopy.header;

/** The header's row is 940 px wide from 1180 px, but its column is the page's 600 px; the portrait's look hangs at the column's edge. */
const under = { selector: ".qi-header", column: 600 };

/** The portrait's closer look: the full white-tux portrait and where it was taken, sliding in. */
function FaceLook() {
  return (
    <figure className="qi-face-look">
      <Image src={heroPortrait.src} alt="" width={heroPortrait.width} height={heroPortrait.height} sizes="300px" loading="eager" />
      <figcaption>{portrait.caption}</figcaption>
    </figure>
  );
}

/**
 * The header (docs/design/DESIGN.md "The header"): the white-tux portrait as a 40 px circle, the name, the greeting
 * with its scene, quiet links to the page's sections on a wide screen, and the Eclipse. There is no phone menu:
 * below 900 px the links are not shown and the greeting sits under the name (quiet-header.css). The links are
 * in the server HTML, so they work without script. On the homepage the portrait is a button that shows its closer
 * look; on every other page it is a picture and the name is the link home. An inner page with sections (a
 * long-form page) has six links, which do not fit on the row beside the name and greeting: its header is the
 * page's 600 px column wide, with the links on a row of their own under the name.
 */
export function SiteHeader(props: HeaderProps) {
  const portraitImage = <Image className="qi-header__face" src={heroPortrait.src} alt="" width={80} height={80} sizes="40px" />;
  const row = (
    <>
      <div className="qi-header__who">
        {props.inner ? (
          <span className="qi-header__facebtn" aria-hidden="true">
            {portraitImage}
          </span>
        ) : (
          // Its own button, a sibling of the name: a button inside a link is invalid. It shows the look on hover and focus, and opens it inline when tapped.
          <button type="button" className="qi-header__facebtn" data-look="face" data-look-tap="face" aria-expanded="false" aria-label="A closer look at Elias" aria-describedby="face-description">
            {portraitImage}
          </button>
        )}
        {props.inner ? (
          <Link className="qi-header__name" href="/" aria-label={`${name}, home`}>
            {name}
          </Link>
        ) : (
          <span className="qi-header__name">{name}</span>
        )}
      </div>
      {!props.inner && (
        <p id="face-description" hidden>
          {portrait.caption}
        </p>
      )}
      <SiteGreeting />
      {props.sections && <SectionLinks label={siteCopy.header.linksLabel} sections={props.sections} />}
      <EclipseToggle />
      {!props.inner && <div className="qi-inline qi-header__slot" data-look-slot="face" aria-hidden="true" />}
    </>
  );
  return (
    <header className="qi-header" data-stretch-header data-long={props.inner && props.sections ? "" : undefined}>
      <a className="stretch-skip" href="#main-content">
        Skip to content
      </a>
      {props.inner ? (
        <div className="qi-header__inner">{row}</div>
      ) : (
        <CloserLookRoot className="qi-header__inner" looks={{ face: <FaceLook /> }} under={under}>
          {row}
        </CloserLookRoot>
      )}
    </header>
  );
}
