import { LightsPill } from "@/components/site/lights-pill";
import { MenuDialog } from "@/components/site/menu-dialog";
import { sectionLinks } from "@/components/site/sections";
import { SiteClock } from "@/components/site/site-clock";

/**
 * The header. On desktop: the London clock, Lights and the section links.
 * Below about 760 px: Lights and Menu only, with the clock and the section
 * names in the menu dialog. CSS switches between the two (stretch-shell.css).
 */
export function SiteHeader() {
  return (
    <header className="stretch-header" data-stretch-header>
      <a className="stretch-skip" href="#main-content">
        Skip to content
      </a>
      {/* Without script the menu cannot open, so the section links stay on the page. */}
      <noscript>
        <style>{".stretch-header__clock{display:inline-flex!important}.stretch-header .stretch-nav{display:block!important}.stretch-menu-button{display:none!important}"}</style>
      </noscript>
      <div className="stretch-wrap stretch-header__inner">
        <SiteClock className="stretch-header__clock" />
        <div className="stretch-header__right">
          <LightsPill />
          <nav aria-label="Primary navigation" className="stretch-nav">
            <ul>
              {sectionLinks.map(({ id, label }, index) => (
                <li key={id}>
                  <a href={`#${id}`} className={index === sectionLinks.length - 1 ? "stretch-nav__cta" : undefined}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <MenuDialog />
        </div>
      </div>
    </header>
  );
}
