"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { margin as marginSpacing, placeMargin } from "@/components/quiet/margin-placement";

/** The margin hides this long after the pointer leaves a row or focus leaves it, so crossing the gap between two rows does not flash. */
const HIDE_MS = 140;
/** Fired on `window` when a controller shows a look, so the others hide theirs: only one look is showing on the page. */
const SHOWING = "qi-closer-look-showing";
/** The margin is for wide screens with a hovering pointer; below that, or on touch, a closer look opens inline instead. */
const WIDE = "(min-width: 1180px) and (hover: hover)";

/**
 * The one value that says which closer look is showing: nothing, or one look and what asked for it. The margin
 * shows a look the pointer or focus asked for; a tap opens it inline, in the `slot` under its row or paragraph.
 */
type Active = { id: string; source: "pointer" | "focus" } | { id: string; source: "tap"; slot: HTMLElement } | null;

/**
 * A root that is not a column: its looks hang in the margin below the ancestor matching `selector`, at the edge
 * of a `column` of that width from the root's left. The header uses it, because its row is wider than the
 * column and its links and Eclipse sit where a look beside the row would land.
 */
type Under = { selector: string; column: number };

/**
 * The closer-look controller (GLOSSARY.md, Closer look). It owns the single `active` value and shows it in the
 * Margin. Rows and words are server-rendered and carry `data-look="<id>"`; this component listens for the
 * pointer and focus arriving at one, so no row holds state of its own. `looks` maps each id to its visual closer
 * look, which renders in one aria-hidden layer: what it says beyond the row is the row's `aria-describedby`.
 *
 * Two presentations, one state. From 1180 px with a hovering pointer, the pointer and focus show the Margin.
 * Below that, or on touch, nothing shows until a trigger (`data-look-tap="<id>"`) is tapped: the look then opens
 * in the `data-look-slot="<id>"` the server rendered under its row, and tapping the same trigger closes it.
 */
export function CloserLookRoot({ looks, className, under, children }: { looks: Record<string, ReactNode>; className?: string; under?: Under; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const margin = useRef<HTMLDivElement>(null);
  const hideTimer = useRef(0);
  /** The look the margin last placed itself for: a new one while it is showing glides there. */
  const placedFor = useRef<string | null>(null);
  const [active, setActive] = useState<Active>(null);
  /** The tapped trigger and where it sat, so it can be put back after a look above it closes. */
  const held = useRef<{ trigger: HTMLElement; top: number } | null>(null);

  const cancelHide = () => window.clearTimeout(hideTimer.current);
  const announce = () => window.dispatchEvent(new CustomEvent(SHOWING, { detail: root.current }));
  const hideSoon = () => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => setActive(null), HIDE_MS);
  };
  const show = (id: string, source: "pointer" | "focus") => {
    cancelHide();
    announce();
    // A row that already holds focus keeps owning its look when the pointer arrives at it, so leaving the column cannot hide it.
    setActive((now) => (now?.id === id && (now.source === source || now.source === "focus") ? now : { id, source }));
  };
  const lookOf = (target: EventTarget) => {
    const row = (target as Element).closest<HTMLElement>("[data-look]");
    return row && root.current?.contains(row) ? row.dataset.look : undefined;
  };

  /** Tapping a trigger opens its inline look, or closes it if it is the one showing; opening one closes any other. */
  const toggle = (trigger: HTMLElement) => {
    const id = trigger.dataset.lookTap;
    const slot = id && root.current?.querySelector<HTMLElement>(`[data-look-slot="${CSS.escape(id)}"]`);
    if (!id || !slot) return;
    // Closing a look above the trigger moves it; the browser's own scroll anchoring would fight the correction below.
    document.documentElement.style.overflowAnchor = "none";
    held.current = { trigger, top: trigger.getBoundingClientRect().top };
    // Opening a look closes one in another controller in the same batch, so the correction below sees both moves.
    if (!(active?.source === "tap" && active.id === id)) announce();
    setActive((now) => (now?.source === "tap" && now.id === id ? null : { id, source: "tap", slot }));
  };
  const onClick = (event: MouseEvent) => {
    // Following a link closes an inline look: it can sit in a sticky header, and an anchor would land behind it.
    if (active?.source === "tap" && (event.target as Element).closest("a[href]")) setActive(null);
    const trigger = (event.target as Element).closest<HTMLElement>("[data-look-tap]");
    if (trigger && root.current?.contains(trigger) && !window.matchMedia(WIDE).matches) toggle(trigger);
  };
  /** A plain row is a focusable group, not a button, so Enter and Space tap it. */
  const onKeyDown = (event: KeyboardEvent) => {
    const trigger = (event.target as Element).closest<HTMLElement>("[data-look-tap]");
    if (!trigger || trigger !== event.target || trigger.tagName === "BUTTON" || (event.key !== "Enter" && event.key !== " ")) return;
    if (window.matchMedia(WIDE).matches) return;
    event.preventDefault();
    toggle(trigger);
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
    const onShowing = (event: Event) => {
      if ((event as CustomEvent<HTMLElement | null>).detail === root.current) return;
      cancelHide();
      setActive(null);
    };
    window.addEventListener(SHOWING, onShowing);
    return () => window.removeEventListener(SHOWING, onShowing);
  }, []);

  useEffect(() => {
    const wide = window.matchMedia(WIDE);
    // The two presentations never mix: crossing the breakpoint either way closes whatever is showing.
    const onChange = () => setActive(null);
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
    if (!active || active.source === "tap" || !element || !row || !root.current) {
      placedFor.current = null;
      return;
    }
    const place = () => {
      const box = root.current!.getBoundingClientRect();
      const hang = under && root.current!.closest(under.selector)?.getBoundingClientRect();
      const { top, left } = placeMargin({
        row: hang ? { top: hang.bottom + marginSpacing.rowLift + marginSpacing.inset } : row.getBoundingClientRect(),
        column: under ? { right: box.left + under.column } : box,
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
  }, [active, under]);

  // After a tap changes the page, put the tapped trigger back where it was on screen: the page would otherwise jump when a look above it closes.
  useLayoutEffect(() => {
    const hold = held.current;
    held.current = null;
    if (!hold) return;
    const shift = hold.trigger.getBoundingClientRect().top - hold.top;
    if (shift) window.scrollBy({ top: shift, behavior: "instant" });
    requestAnimationFrame(() => document.documentElement.style.removeProperty("overflow-anchor"));
  }, [active]);

  // The object button (or reveal word) says what is open to assistive technology (CSS styles an open row from its filled slot).
  useEffect(() => {
    if (active?.source !== "tap") return;
    const buttons = root.current?.querySelectorAll(`[data-look-tap="${CSS.escape(active.id)}"][aria-expanded]`) ?? [];
    buttons.forEach((button) => button.setAttribute("aria-expanded", "true"));
    return () => {
      buttons.forEach((button) => button.setAttribute("aria-expanded", "false"));
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
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {children}
      {active?.source === "tap" &&
        createPortal(
          <div className="qi-inline__in">
            <div className="qi-look">{looks[active.id]}</div>
          </div>,
          active.slot,
        )}
      {active && active.source !== "tap" && (
        <div ref={margin} className="qi-margin" aria-hidden="true" data-margin="">
          <div key={active.id} className="qi-look">
            {looks[active.id]}
          </div>
        </div>
      )}
    </div>
  );
}
