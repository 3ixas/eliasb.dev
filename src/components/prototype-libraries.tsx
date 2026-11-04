"use client";
// PROTOTYPE, ticket "Does either Libraries.dev candidate earn its place?". Never merge.
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { ImageGenerationHandle } from "img-fx";

const MetalFx = dynamic(() => import("metal-fx").then((m) => m.MetalFx), { ssr: false });
const ImageGeneration = dynamic(() => import("img-fx").then((m) => m.ImageGeneration), { ssr: false });

const passModes = [["shipped", "As shipped"], ["pins", "Metal pins, moving"], ["still", "Metal pins, still"], ["clip", "Metal clip"]] as const;
const shotModes = [["shipped", "As shipped"], ["fade", "Plain fade, no library"], ["imgfx", "img-fx mosaic"]] as const;

type Picks = { pass: string; shots: string; slow: string };
const fresh: Picks = { pass: "shipped", shots: "shipped", slow: "on" };
let picks: Picks | null = null;
const listeners = new Set<() => void>();
function read(): Picks {
  if (picks) return picks;
  const q = new URLSearchParams(location.search);
  const stored = JSON.parse(localStorage.getItem("proto-fx") ?? "{}") as Partial<Picks>;
  picks = { pass: q.get("pass") ?? stored.pass ?? fresh.pass, shots: q.get("shots") ?? stored.shots ?? fresh.shots, slow: q.get("slow") ?? stored.slow ?? fresh.slow };
  return picks;
}
function write(next: Partial<Picks>) {
  picks = { ...read(), ...next };
  localStorage.setItem("proto-fx", JSON.stringify(picks));
  const url = new URL(location.href);
  (Object.keys(picks) as (keyof Picks)[]).forEach((k) => url.searchParams.set(k, (picks as Picks)[k]));
  history.replaceState(history.state, "", url);
  listeners.forEach((l) => l());
}
function useFx() {
  return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), read, () => fresh);
}
const reduced = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const dark = () => document.documentElement.dataset.lights === "on";

function useStillAfter(ms: number, on: boolean) {
  const [still, setStill] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = setTimeout(() => setStill(true), ms);
    return () => {
      clearTimeout(t);
      setStill(false);
    };
  }, [ms, on]);
  return still;
}

/** A Pass pin. The wrapper strips the child's background, so the enamel moves up to it. */
export function ProtoPin({ enamel, children }: { enamel: string; children: ReactNode }) {
  const { pass } = useFx();
  const metal = pass === "pins" || pass === "still";
  const still = useStillAfter(900, pass === "still");
  const style = { "--enamel": enamel } as CSSProperties;
  if (!metal) return <span className="qi-pin" style={style}>{children}</span>;
  return (
    <MetalFx
      variant="circle"
      preset="gold"
      theme={dark() ? "dark" : "light"}
      strength={0.9}
      innerShadow
      paused={still || reduced()}
      disableGlow={pass === "still" || reduced()}
      style={{ ...style, background: "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--enamel) 55%, #fff), var(--enamel))", flex: "none", borderRadius: "50%", width: 26, height: 26 }}
    >
      <span className="qi-pin proto-pin" style={style}>{children}</span>
    </MetalFx>
  );
}

export function ProtoClip({ children }: { children: ReactNode }) {
  const { pass } = useFx();
  if (pass !== "clip") return children;
  return (
    <MetalFx variant="button" preset="silver" theme={dark() ? "dark" : "light"} strength={0.9} paused={reduced()} disableGlow style={{ position: "relative", zIndex: 2, background: "transparent" }}>
      <span className="proto-clip">{children}</span>
    </MetalFx>
  );
}

/** The inline screenshot. "Slow" holds the image back so every mode is seen on the wait a slow connection gives. */
export function ProtoShot({ src, alt, width, height, sizes, preload }: { src: string; alt: string; width: number; height: number; sizes: string; preload?: boolean }) {
  const { shots, slow } = useFx();
  const [arrived, setArrived] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const gen = useRef<ImageGenerationHandle>(null);
  useEffect(() => {
    const t = setTimeout(() => setArrived(true), slow === "on" ? 2500 : 0);
    return () => clearTimeout(t);
  }, [slow]);
  useEffect(() => {
    if (shots !== "imgfx" || !loaded) return;
    const t = setTimeout(() => gen.current?.triggerReveal({ hold: "manual" }), 50);
    return () => clearTimeout(t);
  }, [shots, loaded]);
  const img = arrived && (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      preload={preload}
      onLoad={() => setLoaded(true)}
      style={shots === "fade" ? { opacity: loaded ? 1 : 0, transition: "opacity 150ms ease-out" } : shots === "imgfx" ? { opacity: 0 } : undefined}
    />
  );
  const frame = { aspectRatio: `${width} / ${height}`, width: "100%", display: "block", borderRadius: 14 } as CSSProperties;
  if (shots !== "imgfx") return <span style={frame}>{img}</span>;
  return (
    <ImageGeneration ref={gen} preset="pixels-organic" images={[src]} paused={reduced() && !loaded} style={{ display: "block", width: "100%" }}>
      <span style={frame}>{img}</span>
    </ImageGeneration>
  );
}

function step(list: readonly (readonly [string, string])[], key: string, by: number) {
  const i = list.findIndex(([k]) => k === key);
  return list[(i + by + list.length) % list.length][0];
}

export function ProtoBar() {
  const { pass, shots, slow } = useFx();
  const [closed, setClosed] = useState(false);
  if (closed) return <div className="proto-bar" data-closed=""><button type="button" onClick={() => setClosed(false)}>Effects</button></div>;
  return (
    <div className="proto-bar" aria-label="Prototype controls">
      <div className="proto-bar__row">
        <small>Pass</small>
        <button type="button" aria-label="Previous pass" onClick={() => write({ pass: step(passModes, pass, -1) })}>←</button>
        <span data-proto-label="pass">{passModes.find(([k]) => k === pass)?.[1]}</span>
        <button type="button" aria-label="Next pass" onClick={() => write({ pass: step(passModes, pass, 1) })}>→</button>
      </div>
      <div className="proto-bar__row">
        <small>Screens</small>
        <button type="button" aria-label="Previous screens" onClick={() => write({ shots: step(shotModes, shots, -1) })}>←</button>
        <span data-proto-label="shots">{shotModes.find(([k]) => k === shots)?.[1]}</span>
        <button type="button" aria-label="Next screens" onClick={() => write({ shots: step(shotModes, shots, 1) })}>→</button>
      </div>
      <div className="proto-bar__foot">
        <button type="button" aria-pressed={slow === "on"} onClick={() => { write({ slow: slow === "on" ? "off" : "on" }); location.reload(); }}>Slow images (2.5 s)</button>
        <button type="button" onClick={() => setClosed(true)}>Hide</button>
      </div>
    </div>
  );
}
