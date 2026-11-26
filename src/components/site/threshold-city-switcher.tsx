"use client";

import { useState } from "react";
import { Arrow } from "@/components/parts/panel";
import type { ThresholdCity } from "@/content/stretch/threshold-link";

export type ThresholdCityPreview = {
  readonly id: ThresholdCity;
  readonly name: string;
  readonly href: string;
  readonly displayUrl: string;
  readonly host: string;
};

/**
 * Compact inline city switcher for Threshold's homepage wide panel (DESIGN.md "The homepage, in order" 4, R-46, #568):
 * cycles London / Basel / Zurich and links the canonical Threshold URL built on the server by `thresholdLink` and
 * `thresholdDisplayLink` so each city opens that scenario on Threshold in a new tab. Renders `initialCity` (London)
 * as a working link immediately on the server and without JavaScript; updates one `<output>` live region on interaction.
 */
export function ThresholdCitySwitcher({
  cities,
  initialCity,
  label,
}: {
  cities: readonly [ThresholdCityPreview, ...ThresholdCityPreview[]];
  initialCity: ThresholdCity;
  label: string;
}) {
  const [selectedId, setSelectedId] = useState<ThresholdCity>(initialCity);
  const current = cities.find((city) => city.id === selectedId) ?? cities[0];

  return (
    <div className="project-city">
      <div className="project-city__row" role="group" aria-label={label}>
        {cities.map((city) => (
          <button
            key={city.id}
            type="button"
            className="project-city__btn"
            aria-pressed={city.id === current.id}
            onClick={() => setSelectedId(city.id)}
          >
            {city.name}
          </button>
        ))}
      </div>
      <output className="project-city__url" aria-live="polite" aria-atomic="true">
        <a className="project-city__link" href={current.href} target="_blank" rel="noopener noreferrer">
          <span className="project-city__address">{current.displayUrl}</span>
          <Arrow out />
          <span className="sr-only"> opens {current.host} in a new tab</span>
        </a>
      </output>
    </div>
  );
}
