"use client";

import { useState } from "react";
import type { ThresholdCity } from "@/content/stretch/threshold-link";

export type ThresholdCityPreview = {
  readonly id: ThresholdCity;
  readonly name: string;
  readonly displayUrl: string;
};

/**
 * Compact inline city switcher for Threshold's homepage wide panel (DESIGN.md "The homepage, in order" 4, R-46):
 * cycles London / Basel / Zurich and previews the canonical Threshold URL built on the server by `thresholdDisplayLink`.
 * Renders `initialCity` (London) immediately on the server and without JavaScript; updates the `<output>` live region on interaction.
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
        {current.displayUrl}
      </output>
    </div>
  );
}
