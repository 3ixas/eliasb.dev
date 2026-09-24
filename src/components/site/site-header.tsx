import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <a href="#top" className="site-mark" aria-label="E/B — Elias B. home">
        E/B
      </a>
      <nav aria-label="Primary navigation">
        <a href="#top">Home</a>
        <a href="#work">Work</a>
        <a href="#outside-work">Library</a>
        <a href="#about">About</a>
      </nav>
      <div className="site-header-actions">
        <ThemeToggle compact />
        <a href="#contact" className="say-hello">
          Say hello <span className="arrow-mark" aria-hidden="true">↓</span>
        </a>
      </div>
    </header>
  );
}
