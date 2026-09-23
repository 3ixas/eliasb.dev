import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function PageHeader() {
  return (
    <header className="page-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Link href="/" className="site-mark" aria-label="E/B — Elias B. homepage">
        E/B
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/#top">Home</Link>
        <Link href="/#work">Work</Link>
        <Link href="/#outside-work">Library</Link>
        <Link href="/#about">About</Link>
      </nav>
      <ThemeToggle compact />
    </header>
  );
}
