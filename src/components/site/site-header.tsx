import Image from "next/image";
import Link from "next/link";
import { EclipseToggle } from "@/components/site/eclipse-toggle";
import { SectionLinks } from "@/components/site/section-links";
import { SiteGreeting } from "@/components/site/site-greeting";
import { heroPortrait } from "@/content/stretch/media";
import { siteCopy } from "@/content/stretch/site-copy";

type Section = { readonly id: string; readonly label: string };

/** A page's own sections, or `home` on a page that leads back to the homepage (the portrait and name become the link). */
type HeaderProps = { sections: readonly Section[]; home?: never } | { sections?: never; home: true };

const name = "Elias Bennett";

/**
 * The header (docs/design/DESIGN.md "The header"): the white-tux portrait as a 40 px circle, the name, the greeting
 * with its scene, quiet links to the page's sections on a wide screen, and the Eclipse. There is no phone menu:
 * below 900 px the links are not shown and the greeting sits under the name (quiet-header.css). The links are
 * in the server HTML, so they work without script.
 */
export function SiteHeader(props: HeaderProps) {
  const who = (
    <>
      <Image className="qi-header__face" src={heroPortrait.src} alt="" width={80} height={80} sizes="40px" />
      <span className="qi-header__name">{name}</span>
    </>
  );

  return (
    <header className="qi-header" data-stretch-header>
      <a className="stretch-skip" href="#main-content">
        Skip to content
      </a>
      <div className="qi-header__inner">
        {props.home ? (
          <Link className="qi-header__who" href="/" aria-label={`${name}, home`}>
            {who}
          </Link>
        ) : (
          <div className="qi-header__who">{who}</div>
        )}
        <SiteGreeting />
        {props.sections && <SectionLinks label={siteCopy.header.linksLabel} sections={props.sections} />}
        <EclipseToggle />
      </div>
    </header>
  );
}
