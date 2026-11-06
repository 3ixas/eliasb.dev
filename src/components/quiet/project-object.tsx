import Image from "next/image";
import type { CSSProperties } from "react";
import type { Project } from "@/content/projects";

/** The object's slot, in px (docs/design/DESIGN.md, Objects). */
const SLOT = 44;
// PROTOTYPE: tighter crops, each on the one detail.
const recuts: Record<string, { x: number; y: number; zoom: number }> = {
  threshold: { x: 0.155, y: 0.245, zoom: 7 },
  flowtime: { x: 0.372, y: 0.49, zoom: 4.1 },
  "home-secretary": { x: 0.44, y: 0.46, zoom: 7 },
  "risk-event-tracker": { x: 0.03, y: 0.38, zoom: 7 },
};

/**
 * A project's object: the one legible detail of its own screenshot, set by the project's `crop`. The
 * screenshot is scaled to cover the 44 px slot, then zoomed by `crop.zoom`, and shifted so the crop's
 * focal point sits in the middle (never so far that the slot shows beyond the image). One on the first screen is
 * `eager`, so a row never arrives without its object.
 */
export function ProjectObject({ project, eager = false }: { project: Project; eager?: boolean }) {
  const { screenshot, crop } = project;
  if (!screenshot || !crop) throw new Error(`"${project.slug}" is shown on the homepage, so it needs a screenshot and a crop.`);
  const aspect = screenshot.width / screenshot.height;
  const height = aspect >= 1 ? SLOT * crop.zoom : (SLOT * crop.zoom) / aspect;
  const width = height * aspect;
  const place = (focal: number, extent: number) => Math.min(0, Math.max(SLOT - extent, SLOT / 2 - focal * extent));
  const cut = recuts[project.slug];
  const cutH = cut && (aspect >= 1 ? SLOT * cut.zoom : (SLOT * cut.zoom) / aspect);
  const cutW = cut && cutH * aspect;
  const recut = cut ? ({ "--p-left": `${place(cut.x, cutW)}px`, "--p-top": `${place(cut.y, cutH)}px`, "--p-w": `${cutW}px`, "--p-h": `${cutH}px` } as CSSProperties) : undefined;
  return (
    <span className="qi-crop" style={{ ...projectColours(project), ...recut }} data-p-recut={cut ? "" : undefined}>
      <Image
        src={screenshot.src}
        alt=""
        width={Math.round(width)}
        height={Math.round(height)}
        sizes={`${Math.round(Math.max(width, cutW ?? 0))}px`}
        loading={eager ? "eager" : undefined}
        style={{ left: place(crop.x, width), top: place(crop.y, height) }}
      />
    </span>
  );
}

/** The project's own colours as the properties the object, its closer look and its phone card read; a project without them takes the page's. */
export function projectColours({ colours }: Pick<Project, "colours">) {
  return colours ? ({ "--project-field": colours.field, "--project-ink": colours.ink } as CSSProperties) : undefined;
}
