"use client";
// PROTOTYPE, ticket "How far should objects and closer looks go?". Never merge.
import { useEffect, useState } from "react";

const options = {
  depth: [["shipped", "Heavy shadow, as shipped"], ["lighter", "Lighter shadow"], ["ring", "Ring, faint shadow"]],
  dark: [["shipped", "As shipped"], ["edge", "Lit edges"]],
  holo: [["shipped", "Grey disc, as shipped"], ["smaller", "Smaller, brighter"], ["foil", "Foil seal"], ["none", "None"]],
  mini: [["shipped", "As shipped"], ["hue", "Optegra's deeper logo teal"], ["initial", "Employer's initial"], ["returned", "Returned band"]],
  crops: [["shipped", "As shipped"], ["recut", "Recut, one detail"]],
} as const;
const labels: Record<Name, string> = { depth: "Light", dark: "Dark", holo: "Hologram", mini: "Mini pass", crops: "Crops" };
type Name = keyof typeof options;
const names = Object.keys(options) as Name[];
type Picks = Record<Name, string>;
const shipped: Picks = { depth: "shipped", dark: "shipped", holo: "shipped", mini: "shipped", crops: "shipped" };
const proposed: Picks = { depth: "ring", dark: "edge", holo: "foil", mini: "hue", crops: "recut" };
const KEY = "proto-materials";

let picks: Picks | null = null;
function read(): Picks {
  if (picks) return picks;
  const q = new URLSearchParams(location.search);
  const stored = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Picks>;
  const next = { ...shipped };
  names.forEach((n) => {
    next[n] = q.get(n) ?? stored[n] ?? shipped[n];
  });
  return (picks = next);
}
function apply(next: Picks) {
  picks = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  names.forEach((n) => document.documentElement.setAttribute(`data-p-${n}`, next[n]));
  const url = new URL(location.href);
  names.forEach((n) => url.searchParams.set(n, next[n]));
  history.replaceState(history.state, "", url);
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
  if (!state) return null;
  const set = (next: Picks) => {
    apply(next);
    setState(next);
  };
  if (!open) return <div className="proto-bar" data-closed=""><button onClick={() => setOpen(true)}>Materials</button></div>;
  return (
    <div className="proto-bar" role="group" aria-label="Prototype materials switcher">
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
        <button onClick={() => set(shipped)}>As shipped</button>
        <button onClick={() => set(proposed)}>Proposed</button>
        <button onClick={() => setOpen(false)}>Hide</button>
      </div>
    </div>
  );
}
