import { homepageMarkdown } from "@/content/markdown";

export const dynamic = "force-static";

/** The homepage as Markdown (src/content/markdown.ts); the homepage's head points here with rel="alternate". */
export function GET() {
  return new Response(homepageMarkdown(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
