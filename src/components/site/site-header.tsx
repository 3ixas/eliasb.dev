import Link from "next/link";
import { EclipseToggle } from "@/components/site/eclipse-toggle";
import { SectionLinks } from "@/components/site/section-links";
import { sectionLinks } from "@/components/site/sections";
import { SiteGreeting } from "@/components/site/site-greeting";
import { siteCopy } from "@/content/stretch/site-copy";

/**
 * The header on every page (docs/design/DESIGN.md "The header", R-08): the name, a link home; the greeting; the
 * homepage's five sections; and the theme control, over a 1 px ink rule, 64 px tall and not sticky (shell.css).
 * On the homepage the links are the page's own anchors and mark the section in view; on any other page they lead
 * to the homepage's sections. Under 900 px they sit behind Menu (section-links.tsx); without script they show.
 */
export function SiteHeader({ home = false }: { home?: boolean }) {
  return (
    <header className="frame site-header" data-site-header>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Link className="site-header__name" href="/">
        Elias Bennett
      </Link>
      <SiteGreeting />
      <SectionLinks home={home} label={siteCopy.header.linksLabel} menuLabel={siteCopy.header.menuButton} sections={sectionLinks} />
      <EclipseToggle />
    </header>
  );
}
