"use client";

import Link from "next/link";
import { conceptDirections, type ConceptDirection } from "@/lib/concepts";

export function ConceptToolbar({ direction }: { direction: ConceptDirection }) {
  function toggleTheme() {
    const root = document.documentElement;
    const current = root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "light" ? "dark" : "light";
    root.dataset.theme = next;
    localStorage.setItem("elias-theme", next);
  }

  function replayEntrance() {
    window.dispatchEvent(new Event("replay-concept-entrance"));
  }

  return (
    <aside className="concept-toolbar" aria-label="Concept controls">
      <Link href="/" className="toolbar-back">All directions</Link>
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
        <button type="button" onClick={toggleTheme} aria-label="Switch between light and dark theme">
          Switch theme
        </button>
      </div>
    </aside>
  );
}
