import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function PageHeader() {
  return (
    <header className="page-header">
      <Link href="/" className="site-mark" aria-label="Elias B. homepage">
        E/B
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/work" aria-current="page">Work</Link>
        <Link href="/#lab">Lab</Link>
        <Link href="/#library">Library</Link>
        <Link href="/#about">About</Link>
      </nav>
      <ThemeToggle compact />
    </header>
  );
}
