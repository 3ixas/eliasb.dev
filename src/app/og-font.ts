import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Newsreader at weight 400 and optical size 72 (docs/design/DESIGN.md "Share cards"), pinned as a static TrueType file
 * because Satori can't read woff2 or variable axes. Read from disk, so a card never depends on Google Fonts being
 * reachable. The licence sits beside it.
 */
export async function newsreader() {
  const data = await readFile(join(process.cwd(), "src/app/fonts/newsreader/og-400-opsz72.ttf"));
  return { name: "Newsreader", data, style: "normal" as const, weight: 400 as const };
}
