"use client";

import { useId, useState, useSyncExternalStore } from "react";

type Trip = { id: number; lane: "live" | "new"; cached: boolean };

/** Nothing to subscribe to: hydration is the only change, and React reads the client snapshot then. */
const never = () => () => {};

/**
 * The flag you can flip (#461, BNP Paribas, under Decisions): today's path and the new one, and the switch between them.
 * It starts off, as it shipped. Switched on, the new path is the one taken: a request travels it, then a second request
 * is served from the cache, a short trip. Switched off, a request takes today's path again. Each trip is one value
 * arriving; nothing loops, and a switch mid-trip starts the new trip at once. Without script it is the still figure
 * (the switch drawn off); with reduced motion the switch and the lanes change and no request travels. Styles are in
 * story.css.
 */
export function FlagLanes({ live, toggled, state }: { live: string; toggled: string; state: string }) {
  const id = useId();
  // Drawn off on the server and without script; a working switch once the page has hydrated.
  const ready = useSyncExternalStore(never, () => true, () => false);
  const [on, setOn] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);

  const flip = () => {
    const next = !on;
    setOn(next);
    setTrip((last) => ({ id: (last?.id ?? 0) + 1, lane: next ? "new" : "live", cached: false }));
  };
  // The first request on the new path fetches; the next is served from the cache.
  const arrived = () => setTrip((last) => (last && last.lane === "new" && !last.cached ? { id: last.id + 1, lane: "new", cached: true } : last));

  const request = (lane: Trip["lane"]) =>
    trip?.lane === lane ? <span key={trip.id} className="lane__request" data-cached={trip.cached ? "" : undefined} onAnimationEnd={arrived} aria-hidden="true" /> : null;

  return (
    <div className="lanes" data-on={on ? "" : undefined}>
      <p className="lane">
        <span>{live}</span>
        <i aria-hidden="true">{request("live")}</i>
      </p>
      <p className="lane lane--new">
        <span id={`${id}-name`}>{toggled}</span>
        {ready ? (
          <button type="button" role="switch" className="lane__flip" aria-checked={on} aria-labelledby={`${id}-name`} aria-describedby={`${id}-state`} onClick={flip}>
            <span className="lane__switch" />
          </button>
        ) : (
          <span className="lane__switch" aria-hidden="true" />
        )}
        <i aria-hidden="true">{request("new")}</i>
        <b id={`${id}-state`}>{state}</b>
      </p>
    </div>
  );
}
