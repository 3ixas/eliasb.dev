import { LightsPill } from "@/components/site/lights-pill";
import { sectionLinks } from "@/components/site/sections";
import { SiteClock } from "@/components/site/site-clock";

/**
 * The desktop header: the London clock, Lights and the section links. The
 * phone header (Lights and Menu, with the clock in a menu dialog) is #121.
 */
export function SiteHeader() {
  return (
    <header className="stretch-header" data-stretch-header>
      <a className="stretch-skip" href="#main-content">
        Skip to content
      </a>
      <div className="stretch-wrap stretch-header__inner">
        <SiteClock />
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
        </div>
      </div>
    </header>
  );
}
