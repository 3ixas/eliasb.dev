"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import { placeMargin } from "@/components/quiet/margin-placement";

/** The margin hides this long after the pointer leaves a row or focus leaves it, so crossing the gap between two rows does not flash. */
const HIDE_MS = 140;
/** The margin is for wide screens with a hovering pointer; below that, or on touch, a closer look opens inline instead (#292). */
const WIDE = "(min-width: 1180px) and (hover: hover)";

/** The one value that says which closer look is showing: nothing, or one look and what asked for it. */
type Active = { id: string; source: "pointer" | "focus" } | null;

/**
 * The closer-look controller (GLOSSARY.md, Closer look). It owns the single `active` value and shows it in the
 * Margin. Rows and words are server-rendered and carry `data-look="<id>"`; this component listens for the
 * pointer and focus arriving at one, so no row holds state of its own. `looks` maps each id to its visual closer
 * look, which renders in one aria-hidden layer: what it says beyond the row is the row's `aria-describedby`.
 */
export function CloserLookRoot({ looks, className, children }: { looks: Record<string, ReactNode>; className?: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const margin = useRef<HTMLDivElement>(null);
  const hideTimer = useRef(0);
  /** The look the margin last placed itself for: a new one while it is showing glides there. */
  const placedFor = useRef<string | null>(null);
  const [active, setActive] = useState<Active>(null);

  const cancelHide = () => window.clearTimeout(hideTimer.current);
  const hideSoon = () => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => setActive(null), HIDE_MS);
  };
  const show = (id: string, source: "pointer" | "focus") => {
    cancelHide();
    // A row that already holds focus keeps owning its look when the pointer arrives at it, so leaving the column cannot hide it.
    setActive((now) => (now?.id === id && (now.source === source || now.source === "focus") ? now : { id, source }));
  };
  const lookOf = (target: EventTarget) => {
    const row = (target as Element).closest<HTMLElement>("[data-look]");
    return row && root.current?.contains(row) ? row.dataset.look : undefined;
  };

  const onPointerOver = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !window.matchMedia(WIDE).matches) return;
    const id = lookOf(event.target);
    if (id) show(id, "pointer");
    else if (active?.source === "pointer") hideSoon();
  };
  /** Leaving the column hides a look the pointer opened; a focused row keeps its own until it blurs. */
  const onPointerLeave = () => {
    if (active?.source === "pointer") hideSoon();
  };
  const onBlur = () => {
    if (active?.source === "focus") hideSoon();
  };
  const onFocus = (event: FocusEvent) => {
    const id = lookOf(event.target);
    if (id && window.matchMedia(WIDE).matches) show(id, "focus");
  };
  // Escape hides the margin wherever focus is, and leaves focus where it was.
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      cancelHide();
      setActive(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useEffect(() => {
    const wide = window.matchMedia(WIDE);
    const onChange = () => !wide.matches && setActive(null);
    wide.addEventListener("change", onChange);
    return () => {
      wide.removeEventListener("change", onChange);
      cancelHide();
    };
  }, []);

  // Place the margin for the active look, and keep it placed as images load, the page scrolls and the window resizes.
  useLayoutEffect(() => {
    const element = margin.current;
    const row = active ? root.current?.querySelector<HTMLElement>(`[data-look="${CSS.escape(active.id)}"]`) : null;
    if (!active || !element || !row || !root.current) {
      placedFor.current = null;
      return;
    }
    const place = () => {
      const { top, left } = placeMargin({
        row: row.getBoundingClientRect(),
        column: root.current!.getBoundingClientRect(),
        marginHeight: element.offsetHeight,
        viewportHeight: window.innerHeight,
      });
      element.style.top = `${top}px`;
      element.style.left = `${left}px`;
    };
    // Glide only between looks: the first placement of a showing margin must not slide in from the corner.
    if (placedFor.current && placedFor.current !== active.id) element.dataset.glide = "";
    else delete element.dataset.glide;
    place();
    placedFor.current = active.id;
    const observer = new ResizeObserver(place);
    observer.observe(element);
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [active]);

  return (
    <div
      ref={root}
      className={className}
      data-quiet-column=""
      onPointerOver={onPointerOver}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
      {active && (
        <div ref={margin} className="qi-margin" aria-hidden="true" data-margin="">
          <div key={active.id} className="qi-look">
            {looks[active.id]}
          </div>
        </div>
      )}
    </div>
  );
}
