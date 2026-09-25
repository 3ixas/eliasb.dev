"use client";

import Link from "next/link";
import { conceptDirections, type ConceptDirection } from "@/lib/concepts";
import { ThemeToggle } from "@/components/theme-toggle";

export function ConceptToolbar({ direction }: { direction: ConceptDirection }) {
  function replayEntrance() {
    window.dispatchEvent(new Event("replay-concept-entrance"));
  }

  return (
    <aside className="concept-toolbar" aria-label="Concept controls">
      <Link href="/concepts" className="toolbar-back">All directions</Link>
      <div className="toolbar-directions" aria-label="Visual directions">
        {Object.entries(conceptDirections).map(([slug, concept]) => (
          <Link
            key={slug}
            href={`/concepts/${slug}`}
            aria-current={direction === slug ? "page" : undefined}
          >
            {concept.number}
            <span>{concept.shortName}</span>
          </Link>
        ))}
      </div>
      <div className="toolbar-actions">
        <button type="button" onClick={replayEntrance}>Replay intro</button>
        <ThemeToggle />
      </div>
    </aside>
  );
}
