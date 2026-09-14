import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type Destination = "work" | "lab" | "library" | "about";

export function PageHeader({ active }: { active?: Destination }) {
  return (
    <header className="page-header">
      <Link href="/" className="site-mark" aria-label="Elias B. homepage">
        E/B
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/work" aria-current={active === "work" ? "page" : undefined}>Work</Link>
        <Link href="/lab" aria-current={active === "lab" ? "page" : undefined}>Lab</Link>
        <Link href="/library" aria-current={active === "library" ? "page" : undefined}>Library</Link>
        <Link href="/about" aria-current={active === "about" ? "page" : undefined}>About</Link>
      </nav>
      <ThemeToggle compact />
    </header>
  );
}
