"use client";

import { useEffect } from "react";
import { flipLights, watchSystemTheme } from "@/components/site/theme";

/**
 * The header light switch, modelled on a UK MK Logic Plus one-gang rocker:
 * an all-cream plate with slotted screws and a slightly lighter rocker in a
 * shadow gap. With the lights off the top is pressed; with them on, the
 * bottom. Its position and its name come from the theme in CSS, so both are
 * right from the first paint, before this script runs.
 */
export function LightSwitch() {
  useEffect(() => watchSystemTheme(), []);

  return (
    <button
      type="button"
      data-light-switch
      onClick={flipLights}
      className="board-focus inline-flex h-14 w-11 shrink-0 cursor-pointer items-center justify-center rounded-board shadow-(--switch-glow) focus-visible:shadow-(--shadow-focus)"
    >
      <span className="sr-only">
        <span className="board-label-day">Turn the lights on</span>
        <span className="board-label-night">Turn the lights off</span>
      </span>
      <svg aria-hidden="true" width="32" height="52" viewBox="0 0 32 52" className="[filter:var(--shadow-switch)]">
        <defs>
          <linearGradient id="switch-plate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--switch-plate-top)" }} />
            <stop offset="1" style={{ stopColor: "var(--switch-plate-bottom)" }} />
          </linearGradient>
          <linearGradient id="switch-rocker" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--switch-rocker-pressed)" }} />
            <stop offset=".46" style={{ stopColor: "var(--switch-rocker-mid)" }} />
            <stop offset=".54" style={{ stopColor: "var(--switch-rocker-face)" }} />
            <stop offset="1" style={{ stopColor: "var(--switch-rocker-proud)" }} />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="50" rx="6" fill="url(#switch-plate)" stroke="var(--switch-edge)" />
        <rect x="2.6" y="2.6" width="26.8" height="46.8" rx="4.8" fill="none" stroke="var(--switch-bevel)" />
        {[6.5, 45.5].map((y) => (
          <g key={y}>
            <circle cx="16" cy={y} r="2.4" fill="var(--switch-screw)" stroke="var(--switch-screw-edge)" strokeWidth=".8" />
            <line x1="14.4" y1={y} x2="17.6" y2={y} stroke="var(--switch-slot)" strokeWidth=".9" />
          </g>
        ))}
        <rect x="9.3" y="13.3" width="13.4" height="25.4" rx="2" fill="var(--switch-gap)" />
        <g data-rocker className="board-rocker">
          <rect x="10" y="14" width="12" height="24" rx="1.6" fill="url(#switch-rocker)" />
          <rect x="10" y="37.2" width="12" height="2.2" rx="1" fill="var(--switch-rocker-shadow)" />
          <line x1="10.6" y1="26.4" x2="21.4" y2="26.4" stroke="var(--switch-bevel)" strokeWidth=".7" />
          <rect x="10" y="14" width="12" height="4" rx="1.6" fill="var(--switch-rocker-shade)" />
        </g>
      </svg>
    </button>
  );
}
