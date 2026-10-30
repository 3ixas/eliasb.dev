"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { flipLights, readPreference, systemTheme, watchSystemTheme } from "@/components/site/theme";
import { siteCopy } from "@/content/stretch/site-copy";

/** The page is dark when the visitor chose dark, or chose nothing and the device is dark. */
function darkIsOn() {
  const preference = readPreference();
  return (preference === "system" ? systemTheme() : preference) === "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-lights"] });
  return () => observer.disconnect();
}

/** The icon turns over as it is pressed: it starts turned back and small, and springs upright. */
const TURN_OVER = [{ transform: "rotate(-120deg) scale(0.6)" }, { transform: "none" }];
const TURN_OVER_TIMING = { duration: 600, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" };

/**
 * The Eclipse: an icon-only theme button, named "Dark theme" and pressed while
 * the dark theme is in force. Which icon shows comes from the theme in CSS, so
 * it is right from the first paint; the pressed state follows once script runs.
 * Pressing it also turns the whole icon over (not with reduced motion).
 */
export function EclipseToggle() {
  const dark = useSyncExternalStore(subscribe, darkIsOn, () => null);
  const icon = useRef<SVGSVGElement>(null);

  function press() {
    flipLights();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) icon.current?.animate(TURN_OVER, TURN_OVER_TIMING);
  }

  useEffect(() => watchSystemTheme(), []);

  return (
    <button
      type="button"
      data-eclipse
      aria-label={siteCopy.header.darkTheme}
      aria-pressed={dark ?? undefined}
      onClick={press}
      className="stretch-eclipse"
    >
      <svg ref={icon} viewBox="0 0 24 24" aria-hidden="true">
        <mask id="stretch-eclipse-bite">
          <rect x="-4" y="-4" width="32" height="32" fill="#fff" />
          <circle className="stretch-eclipse__shadow" cx="12" cy="12" r="6.8" fill="#000" />
        </mask>
        <circle className="stretch-eclipse__disc" cx="12" cy="12" r="8.2" fill="currentColor" mask="url(#stretch-eclipse-bite)" />
        <g className="stretch-eclipse__rays" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="12" y1="1.5" x2="12" y2="3.5" />
          <line x1="12" y1="20.5" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="3.5" y2="12" />
          <line x1="20.5" y1="12" x2="22.5" y2="12" />
          <line x1="4.6" y1="4.6" x2="6" y2="6" />
          <line x1="18" y1="18" x2="19.4" y2="19.4" />
          <line x1="4.6" y1="19.4" x2="6" y2="18" />
          <line x1="18" y1="6" x2="19.4" y2="4.6" />
        </g>
      </svg>
    </button>
  );
}
