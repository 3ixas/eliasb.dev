"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useCycleAdvance } from "@/components/quiet/cycle";
import { margin as marginSpacing, placeMargin, WIDE } from "@/components/quiet/margin-placement";

/** The margin hides this long after the pointer leaves a row or focus leaves it, so crossing the gap between two rows does not flash. */
const HIDE_MS = 140;
/** Fired on `window` when a controller shows a look, so the others hide theirs: only one look is showing on the page. */
const SHOWING = "qi-closer-look-showing";
/** An inline look folds away over this long (quiet-index.css, `qi-close`); it is unmounted once it has. */
const CLOSE_MS = 220;
/** After a tap the tapped trigger is held in place, frame by frame, for as long as the looks above or below it are still moving. */
const HOLD_MS = 400;

/**
 * The one value that says which closer look is showing: nothing, or one look and what asked for it. The margin
 * shows a look the pointer or focus asked for; a tap opens it inline, in the `slot` under its row or paragraph.
 */
type Active = { id: string; source: "pointer" | "focus" } | { id: string; source: "tap"; slot: HTMLElement } | null;

/** An inline look that has been closed and is folding away before it is unmounted. */
type Leaving = { id: string; slot: HTMLElement };

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
 * in the `data-look-slot="<id>"` the server rendered under its row. Tapping the same trigger, or the look itself,
 * closes it, and both fold away rather than vanish. Two kinds of look answer a tap on themselves differently, as
 * the slot says: one with `data-look-href` is a link to the row's destination (a row that leaves the site opens
 * its look first), and one with `data-look-cycle` steps its cycling row on.
 */
export function CloserLookRoot({ looks, className, under, children }: { looks: Record<string, ReactNode>; className?: string; under?: Under; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const margin = useRef<HTMLDivElement>(null);
  const hideTimer = useRef(0);
  /** The look the margin last placed itself for: a new one while it is showing glides there. */
  const placedFor = useRef<string | null>(null);
  const [active, setActive] = useState<Active>(null);
  /** The same value, readable between renders: handlers decide from it before React has committed their change. */
  const now = useRef<Active>(null);
  const [leaving, setLeaving] = useState<Leaving[]>([]);
  const advance = useCycleAdvance();
  /** The tapped trigger and where it sat, so it can be put back after a look above it closes. */
  const held = useRef<{ trigger: HTMLElement; top: number } | null>(null);
  const holding = useRef(0);

  const cancelHide = () => window.clearTimeout(hideTimer.current);
  const announce = () => window.dispatchEvent(new CustomEvent(SHOWING, { detail: root.current }));
  /** The one way the showing look changes. A tapped look that goes (or gives way to another) folds away first. */
  const change = (next: Active) => {
    const before = now.current;
    if (before === next) return;
    now.current = next;
    setActive(next);
    if (next?.source === "tap") setLeaving((all) => all.filter(({ id }) => id !== next.id));
    if (before?.source !== "tap" || (next?.source === "tap" && next.id === before.id)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gone = { id: before.id, slot: before.slot };
    setLeaving((all) => [...all.filter(({ id }) => id !== gone.id), gone]);
    window.setTimeout(() => setLeaving((all) => all.filter((one) => one.slot !== gone.slot)), CLOSE_MS + 40);
  };
  const hideSoon = () => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => change(null), HIDE_MS);
  };
  const show = (id: string, source: "pointer" | "focus") => {
    cancelHide();
    announce();
    // A row that already holds focus keeps owning its look when the pointer arrives at it, so leaving the column cannot hide it.
    const before = now.current;
    change(before?.id === id && (before.source === source || before.source === "focus") ? before : { id, source });
  };
  const lookOf = (target: EventTarget) => {
    const row = (target as Element).closest<HTMLElement>("[data-look]");
    return row && root.current?.contains(row) ? row.dataset.look : undefined;
  };

  /** Keeps the tapped trigger where it was on screen while the looks around it open and fold, frame by frame, until the user takes over the scroll. */
  const hold = (trigger: HTMLElement) => {
    // Closing a look above the trigger moves it; the browser's own scroll anchoring would fight the correction below.
    document.documentElement.style.overflowAnchor = "none";
    held.current = { trigger, top: trigger.getBoundingClientRect().top };
    window.cancelAnimationFrame(holding.current);
    const until = performance.now() + HOLD_MS;
    let taken = false;
    const take = () => {
      taken = true;
    };
    window.addEventListener("touchstart", take, { once: true, passive: true });
    window.addEventListener("wheel", take, { once: true, passive: true });
    const step = () => {
      const place = held.current;
      if (place) {
        const shift = place.trigger.getBoundingClientRect().top - place.top;
        if (Math.abs(shift) >= 0.5) window.scrollBy({ top: shift, behavior: "instant" });
      }
      if (!taken && performance.now() < until) {
        holding.current = window.requestAnimationFrame(step);
        return;
      }
      window.removeEventListener("touchstart", take);
      window.removeEventListener("wheel", take);
      held.current = null;
      document.documentElement.style.removeProperty("overflow-anchor");
    };
    holding.current = window.requestAnimationFrame(step);
  };

  /** Tapping a trigger opens its inline look, or closes it if it is the one showing; opening one closes any other. */
  const toggle = (trigger: HTMLElement) => {
    const id = trigger.dataset.lookTap;
    const slot = id && root.current?.querySelector<HTMLElement>(`[data-look-slot="${CSS.escape(id)}"]`);
    if (!id || !slot) return;
    hold(trigger);
    const open = now.current?.source === "tap" && now.current.id === id;
    // Opening a look closes one in another controller in the same batch, so the correction sees both moves.
    if (!open) announce();
    change(open ? null : { id, source: "tap", slot });
  };
  /** A cycling row opens its look on the first tap and steps it on with every tap after; its object button opens and closes. */
  const press = (trigger: HTMLElement) => {
    const id = trigger.dataset.lookTap;
    const steps = Number(trigger.dataset.lookCycle);
    if (id && steps && trigger.tagName !== "BUTTON" && now.current?.source === "tap" && now.current.id === id) advance?.(id, steps);
    else toggle(trigger);
  };
  /** A tap on an open look: a cycling look steps on, a look that is a link follows its link, any other closes. */
  const pressLook = (open: HTMLElement) => {
    const slot = open.closest<HTMLElement>("[data-look-slot]");
    const id = slot?.dataset.lookSlot;
    if (!slot || !id || open.hasAttribute("data-leaving")) return;
    const steps = Number(slot.dataset.lookCycle);
    if (steps) advance?.(id, steps);
    else if (!slot.dataset.lookHref) {
      const row = root.current?.querySelector<HTMLElement>(`[data-look-tap="${CSS.escape(id)}"]`);
      if (row) hold(row);
      change(null);
    }
  };
  const onClick = (event: MouseEvent) => {
    const target = event.target as Element;
    const wide = window.matchMedia(WIDE).matches;
    const open = target.closest<HTMLElement>(".qi-inline__in");
    if (open && !wide) return pressLook(open);
    const trigger = target.closest<HTMLElement>("[data-look-tap]");
    // Following a link closes an inline look: it can sit in a sticky header, and an anchor would land behind it.
    const link = target.closest<HTMLAnchorElement>("a[href]");
    if (now.current?.source === "tap" && link && link !== trigger && link.target !== "_blank") change(null);
    if (!trigger || !root.current?.contains(trigger) || wide) return;
    // A row that leaves the site opens its look when tapped, and the look is the link. Enter on the link still follows it.
    if (trigger.tagName === "A") {
      if (event.detail === 0) return;
      event.preventDefault();
    }
    press(trigger);
  };
  /** A plain row is a focusable group, not a button, so Enter and Space tap it. */
  const onKeyDown = (event: KeyboardEvent) => {
    const trigger = (event.target as Element).closest<HTMLElement>("[data-look-tap]");
    if (!trigger || trigger !== event.target || trigger.tagName === "BUTTON" || trigger.tagName === "A" || (event.key !== "Enter" && event.key !== " ")) return;
    if (window.matchMedia(WIDE).matches) return;
    event.preventDefault();
    press(trigger);
  };

  const onPointerOver = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !window.matchMedia(WIDE).matches) return;
    const id = lookOf(event.target);
    if (id) show(id, "pointer");
    else if (now.current?.source === "pointer") hideSoon();
  };
  /** Leaving the column hides a look the pointer opened; a focused row keeps its own until it blurs. */
  const onPointerLeave = () => {
    if (now.current?.source === "pointer") hideSoon();
  };
  const onBlur = () => {
    if (now.current?.source === "focus") hideSoon();
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
      change(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useEffect(() => {
    const onShowing = (event: Event) => {
      if ((event as CustomEvent<HTMLElement | null>).detail === root.current) return;
      cancelHide();
      change(null);
    };
    window.addEventListener(SHOWING, onShowing);
    return () => window.removeEventListener(SHOWING, onShowing);
  }, []);

  useEffect(() => {
    const wide = window.matchMedia(WIDE);
    // The two presentations never mix: crossing the breakpoint either way closes whatever is showing.
    const onChange = () => change(null);
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

  // After a tap changes the page, put the tapped trigger back where it was on screen straight away; `hold` keeps it there while the looks move.
  useLayoutEffect(() => {
    const place = held.current;
    if (!place) return;
    const shift = place.trigger.getBoundingClientRect().top - place.top;
    if (shift) window.scrollBy({ top: shift, behavior: "instant" });
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

  /** The open tapped look and any folding away, keyed by id so a look keeps its place, and its animation, as it changes from one to the other. */
  const tapped = active?.source === "tap" ? { id: active.id, slot: active.slot, folding: false } : null;
  const looksInline = [...(tapped ? [tapped] : []), ...leaving.filter(({ id }) => id !== tapped?.id).map((one) => ({ ...one, folding: true }))];

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
      {looksInline.map(({ id, slot, folding }) =>
        createPortal(
          <div key={id} className="qi-inline__in" data-leaving={folding ? "" : undefined}>
            <InlineLook href={slot.dataset.lookHref}>{looks[id]}</InlineLook>
          </div>,
          slot,
          id,
        ),
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

/** A look that is a link (a row that leaves the site) is wrapped in it; the look is aria-hidden, and the row's own link is the one for assistive technology. */
function InlineLook({ href, children }: { href?: string; children: ReactNode }) {
  const look = <div className="qi-look">{children}</div>;
  return href ? (
    <a className="qi-look-link" href={href} target="_blank" rel="noreferrer" tabIndex={-1}>
      {look}
    </a>
  ) : (
    look
  );
}
