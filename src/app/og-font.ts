import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Bricolage Grotesque at the site's display setting (75% width, weight 800,
 * optical size 96), pinned as a static TrueType file because Satori can't read
 * woff2 or variable axes. Read from disk, so the image never depends on
 * Google Fonts being reachable. The licence sits beside it.
 */
export async function bricolage() {
  const data = await readFile(join(process.cwd(), "src/app/fonts/bricolage/og-display-800-condensed.ttf"));
  return { name: "Bricolage", data, style: "normal" as const, weight: 800 as const };
}
