"use client";

import { useMemo } from "react";
import { useSectionInView } from "@/components/site/use-section-in-view";

export type StoryChapter = {
  id: string;
  title: string;
};

/**
 * Shared sticky left chapter rail for Role stories and Case studies (DESIGN.md "Long-form pages", R-52, R-54).
 * Renders plain jump links with zero numbers on the server (so no-JS works cleanly), then tracks the active chapter
 * via `useSectionInView` without layout shift.
 */
export function ChapterRail({ items, label }: { items: readonly StoryChapter[]; label: string }) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const activeId = useSectionInView(ids, true, true);

  return (
    <nav className="chapter-rail" aria-label={label}>
      {items.map((item) => (
        <a key={item.id} href={`#${item.id}`} aria-current={activeId === item.id ? "location" : undefined}>
          {item.title}
        </a>
      ))}
    </nav>
  );
}
