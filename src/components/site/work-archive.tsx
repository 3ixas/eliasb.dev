"use client";

import { useState } from "react";
import { ProjectIndex } from "@/components/site/project-index";
import { projectIndex, type Project, type ProjectCategory } from "@/content/projects";
import { workArchive } from "@/content/stretch/site-copy";

/**
 * The archive's list: every project in the catalogue, newest first, as Project
 * index rows. The filters (All, Products, Systems, Experiments) exist only once
 * the catalogue is longer than `workArchive.filtersAfter`; before that the
 * visitor can already see everything. Rows are server-rendered for "All", so
 * the full list is on the page before any script runs.
 */
export function WorkArchive({ catalogue }: { catalogue: readonly Project[] }) {
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const ordered = projectIndex(catalogue, []);
  const filtered = catalogue.length > workArchive.filtersAfter;
  const rows = category ? ordered.filter((project) => project.category === category) : ordered;

  return (
    <>
      {filtered && (
        <div className="stretch-archive__filters" role="group" aria-label="Filter projects">
          {workArchive.filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              className="stretch-archive__filter stretch-mono"
              aria-pressed={category === filter.category}
              onClick={() => setCategory(filter.category)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
      <ProjectIndex rows={rows} firstNumber={1} limit={Infinity} />
      {filtered && (
        <p className="stretch-archive__count" role="status">
          {workArchive.count(rows.length)}
        </p>
      )}
    </>
  );
}
