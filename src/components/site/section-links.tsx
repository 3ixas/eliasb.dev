"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useSectionInView } from "@/components/site/use-section-in-view";

/** Where the links stop hiding behind Menu (shell.css). */
const WIDE = "(min-width: 900px)";

type Props = { home: boolean; label: string; menuLabel: string; sections: readonly { id: string; label: string }[] };

/**
 * The header's links to the homepage's sections, and Menu, which holds them under 900 px (DESIGN.md "The header").
 * The links are in the server HTML and show without script (shell.css hides them only once the boot script has
 * marked the page `data-script`). Menu reports `aria-expanded`; Escape closes it and gives focus back to it, and
 * choosing a link closes it. It comes before the links, so Tab goes from Menu into the list it opened.
 */
export function SectionLinks({ home, label, menuLabel, sections }: Props) {
  const [ids] = useState(() => sections.map(({ id }) => id));
  const current = useSectionInView(ids, home);
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const navId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    // Widening past the phone layout shows the links anyway; the list should not be found open on the way back.
    const wide = window.matchMedia(WIDE);
    const onWide = () => wide.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <div className="site-header__links">
      <button ref={button} type="button" className="menu-button" aria-expanded={open} aria-controls={navId} onClick={() => setOpen(!open)}>
        {menuLabel}
      </button>
      <nav id={navId} aria-label={label} className="site-nav" data-open={open || undefined}>
        <ul>
          {sections.map(({ id, label: name }) => (
            <li key={id}>
              <a href={home ? `#${id}` : `/#${id}`} aria-current={current === id ? "location" : undefined} onClick={() => setOpen(false)}>
                {name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
