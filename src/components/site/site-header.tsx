import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a href="#top" className="site-mark" aria-label="Elias B. home">
        E/B
      </a>
      <nav aria-label="Primary navigation">
        <a href="#work">Work</a>
        <a href="#lab">Lab</a>
        <a href="#library">Library</a>
        <a href="#about">About</a>
      </nav>
      <div className="site-header-actions">
        <ThemeToggle compact />
        <a href="#contact" className="say-hello">
          Say hello ↓
        </a>
      </div>
    </header>
  );
}
