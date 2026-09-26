import { ThemeToggle } from "@/components/theme-toggle";
import { HomeNavigation } from "@/components/site/home-navigation";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <a href="#top" className="site-mark" aria-label="E/B — Elias B. home">
        <span aria-hidden="true">E</span>
        <span className="brand-slash" aria-hidden="true">/</span>
        <span aria-hidden="true">B</span>
      </a>
      <HomeNavigation />
      <div className="site-header-actions">
        <ThemeToggle compact />
        <a href="#contact" className="say-hello">
          Say hello <span className="arrow-mark" aria-hidden="true">↓</span>
        </a>
      </div>
    </header>
  );
}
