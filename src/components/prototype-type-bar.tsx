"use client";
// PROTOTYPE, ticket "Which metadata typeface and Bricolage settings?". Never merge.
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { protoBric, protoMeta } from "@/app/prototype-type/options";


type Picks = { meta: string; bric: string; smooth: string; dots: string };
const fresh: Picks = { meta: "shipped", bric: "shipped", smooth: "off", dots: "off" };

function apply(p: Picks, on: boolean) {
  const r = document.documentElement;
  (Object.keys(p) as (keyof Picks)[]).forEach((k) => {
    if (on) r.setAttribute(`data-proto-${k}`, p[k]);
    else r.removeAttribute(`data-proto-${k}`);
  });
}

function step(list: readonly (readonly [string, string])[], key: string, by: number) {
  const i = list.findIndex(([k]) => k === key);
  return list[(i + by + list.length) % list.length][0];
}

export function PrototypeTypeBar() {
  const path = usePathname();
  const [picks, setPicks] = useState<Picks>(fresh);
  const [closed, setClosed] = useState(false);
  const [ready, setReady] = useState(false);
  // The Résumé sheet stays out of this, as the map says.
  const onResume = path.startsWith("/resume") || path.startsWith("/prototype-type");

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const stored = JSON.parse(localStorage.getItem("proto-type") ?? "{}") as Partial<Picks>;
    const seen = { ...fresh, ...stored };
    (Object.keys(fresh) as (keyof Picks)[]).forEach((k) => {
      seen[k] = q.get(k) ?? seen[k];
    });
    const t = setTimeout(() => {
      setPicks(seen);
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (ready) apply(picks, !onResume);
  }, [picks, onResume, ready]);

  const set = useCallback((next: Partial<Picks>) => {
    setPicks((p) => {
      const merged = { ...p, ...next };
      localStorage.setItem("proto-type", JSON.stringify(merged));
      const url = new URL(location.href);
      (Object.keys(merged) as (keyof Picks)[]).forEach((k) => url.searchParams.set(k, merged[k]));
      history.replaceState(history.state, "", url);
      return merged;
    });
  }, []);

  if (onResume) return null;
  if (closed) {
    return (
      <div className="proto-bar" data-closed="">
        <button type="button" onClick={() => setClosed(false)}>Type</button>
      </div>
    );
  }
  const metaLabel = protoMeta.find(([k]) => k === picks.meta)?.[1];
  const bricLabel = protoBric.find(([k]) => k === picks.bric)?.[1];
  return (
    <div className="proto-bar" aria-label="Prototype controls">
      <div className="proto-bar__row">
        <small>Metadata</small>
        <button type="button" aria-label="Previous metadata" onClick={() => set({ meta: step(protoMeta, picks.meta, -1) })}>←</button>
        <span data-proto-label="meta">{metaLabel}</span>
        <button type="button" aria-label="Next metadata" onClick={() => set({ meta: step(protoMeta, picks.meta, 1) })}>→</button>
      </div>
      <div className="proto-bar__row">
        <small>Bricolage</small>
        <button type="button" aria-label="Previous Bricolage" onClick={() => set({ bric: step(protoBric, picks.bric, -1) })}>←</button>
        <span data-proto-label="bric">{bricLabel}</span>
        <button type="button" aria-label="Next Bricolage" onClick={() => set({ bric: step(protoBric, picks.bric, 1) })}>→</button>
      </div>
      <div className="proto-bar__foot">
        <button type="button" aria-pressed={picks.smooth === "on"} onClick={() => set({ smooth: picks.smooth === "on" ? "off" : "on" })}>Dark smoothing</button>
        <button type="button" aria-pressed={picks.dots === "on"} onClick={() => set({ dots: picks.dots === "on" ? "off" : "on" })}>Solid word dots</button>
        <button type="button" onClick={() => setClosed(true)}>Hide</button>
      </div>
    </div>
  );
}
