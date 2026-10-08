"use client";

import { useEffect, useSyncExternalStore } from "react";
import { flipLights, readPreference, systemTheme, watchSystemTheme } from "@/components/site/theme";
import { siteCopy } from "@/content/stretch/site-copy";

/** The page is light when the visitor chose light, or chose nothing and the device is light. */
function lightsAreOn() {
  const preference = readPreference();
  return (preference === "system" ? systemTheme() : preference) === "light";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-lights"] });
  return () => observer.disconnect();
}

/**
 * "Lights on / Lights off": a button whose pressed state means on, that is,
 * the light theme. Which label shows comes from the theme in CSS, so it is
 * right from the first paint; the pressed state follows once script runs.
 */
export function LightsPill() {
  const on = useSyncExternalStore(subscribe, lightsAreOn, () => null);

  useEffect(() => watchSystemTheme(), []);

  return (
    <button
      type="button"
      data-lights-pill
      aria-pressed={on ?? undefined}
      onClick={flipLights}
      className="stretch-pill stretch-mono"
    >
      <span className="stretch-lights-on">{siteCopy.header.lightsOn}</span>
      <span className="stretch-lights-off">{siteCopy.header.lightsOff}</span>
    </button>
  );
}
