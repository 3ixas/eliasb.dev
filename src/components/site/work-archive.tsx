"use client";

import { Fragment, useState, type ReactNode } from "react";
import type { ProjectCategory } from "@/content/projects";
import { workArchive } from "@/content/stretch/site-copy";

/**
 * The archive's panels, already rendered by the server, with the filters above them (All, Products, Systems,
 * Experiments) once the catalogue is longer than `workArchive.filtersAfter`; before that the visitor can already see
 * everything and nothing here is a button. The grid is complete in the server's HTML ("All"), so the page reads the
 * same before any script runs.
 */
export function WorkArchiveList({ items }: { items: readonly { slug: string; category: ProjectCategory; panel: ReactNode }[] }) {
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const filtered = items.length > workArchive.filtersAfter;
  const shown = category ? items.filter((item) => item.category === category) : items;

  return (
    <>
      {filtered && (
        <div className="archive__filters" role="group" aria-label="Filter projects">
          {workArchive.filters.map((filter) => (
            <button key={filter.label} type="button" className="pill pill--outline" aria-pressed={category === filter.category} onClick={() => setCategory(filter.category)}>
              {filter.label}
            </button>
          ))}
        </div>
      )}
      <ul className="panels panels--three archive__grid">
        {shown.map(({ slug, panel }) => (
          <Fragment key={slug}>{panel}</Fragment>
        ))}
      </ul>
      {filtered && (
        <p className="sr-only" role="status">
          {workArchive.count(shown.length)}
        </p>
      )}
    </>
  );
}
