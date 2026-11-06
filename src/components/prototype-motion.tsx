"use client";
// PROTOTYPE, ticket "How should motion feel?". Never merge.
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const options = {
  spring: [["shipped", "Overshoot, as shipped"], ["tamed", "Small overshoot"], ["none", "No overshoot"]],
  sweep: [["shipped", "Full arrival, spring"], ["calm", "Full arrival, calm glide"], ["first", "First arrival only"], ["rest", "First only, waits for rest"]],
  react: [["shipped", "Snaps on leave"], ["finish", "Plays through"], ["return", "Eases back"]],
  fold: [["shipped", "Quick, long tail"], ["soft", "Soft"], ["scaled", "Soft, by distance"]],
  low: [["hold", "Row holds still"], ["reveal", "Gentle scroll"]],
  route: [["none", "No motion"], ["fade", "Page fades in"]],
  slow: [["1", "Real speed"], ["4", "Four times slower"]],
} as const;
const labels: Record<Name, string> = { spring: "Spring", sweep: "Sweep", react: "Reaction", fold: "Fold", low: "Low look", route: "Route", slow: "Speed" };
type Name = keyof typeof options;
const names = Object.keys(options) as Name[];
type Picks = Record<Name, string>;
const shipped: Picks = { spring: "shipped", sweep: "shipped", react: "shipped", fold: "shipped", low: "hold", route: "none", slow: "1" };
const proposed: Picks = { spring: "tamed", sweep: "first", react: "finish", fold: "scaled", low: "reveal", route: "none", slow: "1" };
const KEY = "proto-motion";

let picks: Picks | null = null;
function read(): Picks {
  if (picks) return picks;
  const q = new URLSearchParams(location.search);
  const stored = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Picks>;
  const next = { ...shipped };
  names.forEach((n) => {
    next[n] = q.get(n) ?? stored[n] ?? shipped[n];
  });
  picks = next;
  return next;
}
function apply(next: Picks) {
  picks = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  names.forEach((n) => {
    document.documentElement.setAttribute(`data-p-${n}`, next[n]);
  });
  const url = new URL(location.href);
  names.forEach((n) => url.searchParams.set(n, next[n]));
  history.replaceState(history.state, "", url);
}

/** What the switcher says right now; read by the closer-look controller. */
export const protoPick = (name: Name) => (typeof window === "undefined" ? shipped[name] : read()[name]);
export const protoSlow = () => Number(protoPick("slow"));
/** How long a fold takes, so a look is unmounted only once it has folded. */
export const protoCloseMs = () => ({ shipped: 300, soft: 340, scaled: 440 })[protoPick("fold") as "shipped"] * protoSlow();
/** Scaled folds take longer the further they travel. */
export const protoFoldMs = (height: number) => Math.round(Math.min(420, Math.max(220, 180 + height * 0.35)));

/** A gentle scroll, cancelled by the visitor's own. */
export function protoScrollBy(delta: number) {
  const start = window.scrollY;
  const began = performance.now();
  const span = 320 * protoSlow();
  let stopped = false;
  const stop = () => {
    stopped = true;
  };
  window.addEventListener("touchstart", stop, { once: true, passive: true });
  window.addEventListener("wheel", stop, { once: true, passive: true });
  const step = (now: number) => {
    if (stopped) return;
    const t = Math.min((now - began) / span, 1);
    window.scrollTo({ top: start + delta * (1 - (1 - t) ** 3), behavior: "instant" });
    if (t < 1) requestAnimationFrame(step);
    else stop();
  };
  requestAnimationFrame(step);
}

function targets(from: Element, related: EventTarget | null): Element[] {
  const groups: [string, string][] = [[".qi-row", ".qi-mini, .qi-tile"], [".qi-opening__tail", ".qi-letter, path"], [".qi-bnp", ".qi-bnp__pass"]];
  for (const [owner, inner] of groups) {
    const box = from.closest(owner);
    if (box && !(related instanceof Node && box.contains(related))) return [...box.querySelectorAll(inner)];
  }
  return [];
}

function useReactions() {
  useEffect(() => {
    const over = (event: PointerEvent) => {
      if (event.pointerType === "touch" || read().react === "shipped" || !(event.target instanceof Element)) return;
      targets(event.target, event.relatedTarget).forEach((el) => {
        if (el.classList.contains("p-play")) return;
        el.classList.add("p-play");
        el.addEventListener("animationend", () => el.classList.remove("p-play"), { once: true });
      });
    };
    const out = (event: PointerEvent) => {
      if (event.pointerType === "touch" || read().react !== "return" || !(event.target instanceof Element)) return;
      targets(event.target, event.relatedTarget).forEach((el) => {
        if (!el.classList.contains("p-play")) return;
        const style = getComputedStyle(el);
        const letter = el.classList.contains("qi-letter");
        const from = letter ? style.top : style.transform;
        el.classList.remove("p-play");
        if (el.tagName === "path" || el.classList.contains("qi-bnp__pass")) return;
        el.animate(letter ? { top: [from, "0px"] } : { transform: [from, "none"] }, { duration: 240, easing: "cubic-bezier(.2,.8,.2,1)" });
      });
    };
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
    };
  }, []);
}

/** Slows every CSS and Web Animations clock on the page, for watching an interruption. */
function useSlow(slow: string) {
  useEffect(() => {
    const rate = 1 / Number(slow);
    let frame = 0;
    const step = () => {
      document.getAnimations().forEach((a) => {
        if (a.playbackRate !== rate) a.playbackRate = rate;
      });
      frame = requestAnimationFrame(step);
    };
    if (rate !== 1) frame = requestAnimationFrame(step);
    else document.getAnimations().forEach((a) => (a.playbackRate = 1));
    return () => cancelAnimationFrame(frame);
  }, [slow]);
}

function useRouteFade() {
  const path = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (read().route === "fade") document.querySelector("main")?.animate({ opacity: [0, 1] }, { duration: 180, easing: "ease-out" });
  }, [path]);
}

export function ProtoBar() {
  const [state, setState] = useState<Picks | null>(null);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const next = read();
    apply(next);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(next);
    setOpen(!matchMedia("(max-width: 700px)").matches);
  }, []);
  useReactions();
  useSlow(state?.slow ?? "1");
  useRouteFade();
  if (!state) return null;
  const set = (next: Picks) => {
    apply(next);
    setState(next);
  };
  if (!open) return <div className="proto-bar" data-closed=""><button onClick={() => setOpen(true)}>Motion</button></div>;
  return (
    <div className="proto-bar" role="group" aria-label="Prototype motion switcher">
      {names.map((name) => {
        const list = options[name] as readonly (readonly [string, string])[];
        const at = Math.max(0, list.findIndex(([v]) => v === state[name]));
        const go = (by: number) => set({ ...state, [name]: list[(at + by + list.length) % list.length][0] });
        return (
          <div className="proto-bar__row" key={name}>
            <small>{labels[name]}</small>
            <button aria-label={`Previous ${labels[name]}`} onClick={() => go(-1)}>‹</button>
            <span>{list[at][1]}</span>
            <button aria-label={`Next ${labels[name]}`} onClick={() => go(1)}>›</button>
          </div>
        );
      })}
      <div className="proto-bar__foot">
        <button onClick={() => set({ ...shipped, slow: state.slow })}>As shipped</button>
        <button onClick={() => set({ ...proposed, slow: state.slow })}>Proposed</button>
        <button onClick={() => setOpen(false)}>Hide</button>
      </div>
    </div>
  );
}
