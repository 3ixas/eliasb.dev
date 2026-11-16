"use client";

import { useEffect, useState } from "react";

/** Prints how far the scene got on this page (lanyard.ts's `data-lanyard`), for judging on a phone with no console. */
export function LanyardStatus() {
  const [status, setStatus] = useState("waiting");
  useEffect(() => {
    const read = () => {
      const stage = document.querySelector<HTMLElement>(".lanyard");
      const state = stage?.dataset.lanyard ?? "not started";
      const error = stage?.dataset.lanyardError;
      const motion = matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced motion" : "motion on";
      setStatus(`${state}${error ? `: ${error}` : ""} · ${motion} · ${navigator.userAgent}`);
    };
    read();
    const watch = new MutationObserver(read);
    watch.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["data-lanyard", "data-lanyard-error"] });
    return () => watch.disconnect();
  }, []);
  return <p style={{ padding: "16px", font: "13px/1.4 var(--sans)", color: "var(--muted)" }}>{status}</p>;
}
