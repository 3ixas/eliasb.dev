import type { ReactNode } from "react";

/** A link out to another site, opening in a new tab, with a 44 px target. The arrow is decoration. */
export function ExternalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`board-focus inline-flex min-h-11 items-center font-mono text-label uppercase underline underline-offset-4 ${className ?? ""}`}
    >
      {/* One span, so a wrapped label keeps its arrow beside the last word. */}
      <span>
        {children} <span aria-hidden="true">↗</span>
      </span>
    </a>
  );
}
