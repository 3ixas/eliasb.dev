"use client";

import { useState } from "react";
import { ProjectIndex } from "@/components/site/project-index";
import { PROJECT_CATEGORIES, projectIndex, type Project } from "@/content/projects";
import { workArchive } from "@/content/stretch/site-copy";

/**
 * The archive's list: every project in the catalogue, newest first, as Project
 * index rows. The filters (All, Products, Systems, Experiments) exist only once
 * the catalogue is longer than `workArchive.filtersAfter`; before that the
 * visitor can already see everything. Rows are server-rendered for "All", so
 * the full list is on the page before any script runs.
 */
export function WorkArchive({ catalogue }: { catalogue: readonly Project[] }) {
  const [filter, setFilter] = useState(0);
  const ordered = projectIndex(catalogue, []);
  const filtered = catalogue.length > workArchive.filtersAfter;
  const category = filter > 0 ? PROJECT_CATEGORIES[filter - 1] : undefined;
  const rows = category ? ordered.filter((project) => project.category === category) : ordered;

  return (
    <>
      {filtered && (
        <div className="stretch-archive__filters" role="group" aria-label="Filter projects">
          {workArchive.filters.map((label, index) => (
            <button
              key={label}
              type="button"
              className="stretch-archive__filter stretch-mono"
              aria-pressed={filter === index}
              onClick={() => setFilter(index)}
            >
              {label}
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
