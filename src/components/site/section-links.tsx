"use client";

import { useEffect, useState } from "react";

/** How far down the window a section's top may be and still count as the one in view: a third of the way. */
const READING_LINE = 3;

/**
 * The id of the last section whose top has passed the reading line, or none above the first. At the foot of the
 * page the last section counts as in view, since a short one never reaches the line.
 */
function sectionInView(ids: readonly string[]): string | null {
  const atFoot = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atFoot) return ids[ids.length - 1] ?? null;
  const line = window.innerHeight / READING_LINE;
  let current: string | null = null;
  for (const id of ids) {
    const top = document.getElementById(id)?.getBoundingClientRect().top;
    if (top !== undefined && top <= line) current = id;
  }
  return current;
}

/**
 * The header's links to the sections of the page: quiet text, with the one whose section is in view underlined
 * and marked `aria-current`. The links are in the server HTML; the mark follows once script runs.
 */
export function SectionLinks({ label, sections }: { label: string; sections: readonly { id: string; label: string }[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const ids = sections.map(({ id }) => id);
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCurrent(sectionInView(ids)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  return (
    <nav aria-label={label} className="qi-header__links">
      <ul>
        {sections.map(({ id, label: name }) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={current === id ? "location" : undefined}>
              {name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
