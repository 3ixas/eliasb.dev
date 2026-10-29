"use client";

import { Fragment, useState, type ReactNode } from "react";
import type { ProjectCategory } from "@/content/projects";
import { workArchive } from "@/content/stretch/site-copy";

/**
 * The archive's list: every project's row, already rendered by the server, with the filters above it (All,
 * Products, Systems, Experiments) once the catalogue is longer than `workArchive.filtersAfter`; before that the
 * visitor can already see everything and nothing here is a button. The list is complete in the server's HTML
 * ("All"), so the page reads the same before any script runs.
 */
export function WorkArchiveList({ items }: { items: readonly { slug: string; category: ProjectCategory; row: ReactNode }[] }) {
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const filtered = items.length > workArchive.filtersAfter;
  const shown = category ? items.filter((item) => item.category === category) : items;

  return (
    <>
      {filtered && (
        <div className="qi-filters" role="group" aria-label="Filter projects">
          {workArchive.filters.map((filter) => (
            <button key={filter.label} type="button" className="qi-filters__button stretch-mono" aria-pressed={category === filter.category} onClick={() => setCategory(filter.category)}>
              {filter.label}
            </button>
          ))}
        </div>
      )}
      <ul className="qi-list">
        {shown.map(({ slug, row }) => (
          <Fragment key={slug}>{row}</Fragment>
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
