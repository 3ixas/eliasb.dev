import { EclipseToggle } from "@/components/site/eclipse-toggle";
import { MenuDialog } from "@/components/site/menu-dialog";
import { sectionLinks } from "@/components/site/sections";
import { SiteGreeting } from "@/components/site/site-greeting";

/**
 * The header. On desktop: the greeting, Lights and the section links.
 * Below about 760 px: Lights and Menu only, with the greeting and the section
 * names in the menu dialog. CSS switches between the two (stretch-shell.css).
 */
export function SiteHeader() {
  return (
    <header className="stretch-header" data-stretch-header data-entrance="header">
      <a className="stretch-skip" href="#main-content">
        Skip to content
      </a>
      {/* Without script the menu cannot open, so the section links stay on the page. */}
      <noscript>
        <style>{".stretch-header__greeting{display:inline-flex!important}.stretch-header .stretch-nav{display:block!important}.stretch-menu-button{display:none!important}"}</style>
      </noscript>
      <div className="stretch-wrap stretch-header__inner">
        <SiteGreeting className="stretch-header__greeting" />
        <div className="stretch-header__right">
          <EclipseToggle />
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
