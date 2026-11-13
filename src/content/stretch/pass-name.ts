/*
 * What a staff pass prints, in reading order, as one sentence of parts: its accessible name is its print (DESIGN.md
 * "The staff pass", R-12). The pass draws the same strings; this joins them for assistive technology.
 *
 * Its runtime imports carry a .ts extension, so Node can load it directly as well as Next.
 */
import { roleStories } from "./role-stories.ts";
import type { RoleStorySlug } from "./role-story.ts";
import { passHang, passRecords, passStatus } from "./staff-pass.ts";

export function passName(slug: RoleStorySlug) {
  const { short, points } = passRecords[slug];
  const { role, dates } = roleStories[slug];
  return [short, `Elias Bennett, ${role}, ${dates}`, ...points.map(({ lead, detail }) => `${lead}, ${detail}`), passStatus(passHang[slug].state)].join(". ") + ".";
}
