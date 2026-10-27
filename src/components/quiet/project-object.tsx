import Image from "next/image";
import type { CSSProperties } from "react";
import type { Project } from "@/content/projects";

/** The object's slot, in px (docs/design/DESIGN.md, Objects). */
const SLOT = 44;

/**
 * A project's object: the one legible detail of its own screenshot, set by the project's `crop`. The
 * screenshot is scaled to cover the 44 px slot, then zoomed by `crop.zoom`, and shifted so the crop's
 * focal point sits in the middle (never so far that the slot shows beyond the image).
 */
export function ProjectObject({ project }: { project: Project }) {
  const { screenshot, crop } = project;
  if (!screenshot || !crop) throw new Error(`"${project.slug}" is shown on the homepage, so it needs a screenshot and a crop.`);
  const aspect = screenshot.width / screenshot.height;
  const height = aspect >= 1 ? SLOT * crop.zoom : (SLOT * crop.zoom) / aspect;
  const width = height * aspect;
  const place = (focal: number, extent: number) => Math.min(0, Math.max(SLOT - extent, SLOT / 2 - focal * extent));
  return (
    <span className="qi-crop" style={projectColours(project)}>
      <Image
        src={screenshot.src}
        alt=""
        width={Math.round(width)}
        height={Math.round(height)}
        sizes={`${Math.round(width)}px`}
        style={{ left: place(crop.x, width), top: place(crop.y, height) }}
      />
    </span>
  );
}

/** The project's own colours as the properties the object, its closer look and its phone card read; a project without them takes the page's. */
export function projectColours({ colours }: Project) {
  return colours ? ({ "--project-field": colours.field, "--project-ink": colours.ink } as CSSProperties) : undefined;
}
