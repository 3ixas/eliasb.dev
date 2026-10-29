"use client";

import { Fragment, useState, type ReactNode } from "react";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import type { ProjectCategory } from "@/content/projects";
import { workArchive } from "@/content/stretch/site-copy";

/**
 * The archive's list: every project's row, already rendered by the server, with the filters above it (All,
 * Products, Systems, Experiments) once the catalogue is longer than `workArchive.filtersAfter`; before that the
 * visitor can already see everything and nothing here is a button. The list is complete in the server's HTML
 * ("All"), so the page reads the same before any script runs. The closer-look controller is keyed by the filter:
 * a filter removes rows, and a look still open for one of them would leave the controller holding a slot that is
 * gone. The filters stay outside it, so a button keeps its focus.
 */
export function WorkArchiveList({ items, looks }: { items: readonly { slug: string; category: ProjectCategory; row: ReactNode }[]; looks: Record<string, ReactNode> }) {
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
      <CloserLookRoot key={category ?? "all"} looks={looks} className="qi-archive">
        <ul className="qi-list">
          {shown.map(({ slug, row }) => (
            <Fragment key={slug}>{row}</Fragment>
          ))}
        </ul>
      </CloserLookRoot>
      {filtered && (
        <p className="sr-only" role="status">
          {workArchive.count(shown.length)}
        </p>
      )}
    </>
  );
}
