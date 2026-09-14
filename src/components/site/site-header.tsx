import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <a href="#top" className="site-mark" aria-label="E/B — Elias B. home">
        E/B
      </a>
      <nav aria-label="Primary navigation">
        <Link href="/work">Work</Link>
        <Link href="/lab">Lab</Link>
        <Link href="/library">Library</Link>
        <Link href="/about">About</Link>
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
