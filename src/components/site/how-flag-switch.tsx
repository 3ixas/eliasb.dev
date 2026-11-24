"use client";

import { useId, useState, useSyncExternalStore } from "react";

/** Nothing to subscribe to: hydration is the only change, and React reads the client snapshot then. */
const never = () => () => {};

/**
 * Compact interactive feature-flag switch for How I work card 3 (DESIGN.md "The flag" & "How I work's cards", R-49):
 * named by the new path's words and described by the card's "defaults to off" phrase. Renders as a still Off figure
 * on the server and without script, matching FlagLanes, then upgrades to a working `role="switch"` on hydration.
 */
export function HowFlagSwitch({
  off,
  on,
  currentPath,
  newPath,
  describedBy,
}: {
  off: string;
  on: string;
  currentPath: string;
  newPath: string;
  describedBy: string;
}) {
  const id = useId();
  const ready = useSyncExternalStore(never, () => true, () => false);
  const [enabled, setEnabled] = useState(false);

  const label = (
    <>
      <span className="flag-switch__track" aria-hidden="true">
        <span className="flag-switch__knob" />
      </span>
      <span className="flag-switch__label" aria-hidden={ready || undefined}>
        {enabled ? on : off}
      </span>
    </>
  );

  return (
    <div className="flag-route">
      {ready ? (
        <button
          type="button"
          role="switch"
          className="flag-switch"
          aria-checked={enabled}
          aria-labelledby={`${id}-new`}
          aria-describedby={describedBy}
          onClick={() => setEnabled((prev) => !prev)}
        >
          {label}
        </button>
      ) : (
        <span className="flag-switch">{label}</span>
      )}
      <span className="route-chip" data-live={enabled ? "false" : "true"}>
        {currentPath}
      </span>
      <span id={`${id}-new`} className="route-chip" data-live={enabled ? "true" : "false"}>
        {newPath}
      </span>
    </div>
  );
}
