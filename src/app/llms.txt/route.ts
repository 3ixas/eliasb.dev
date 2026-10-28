import { llmsTxt } from "@/content/markdown";

export const dynamic = "force-static";

/** The llms.txt index (src/content/markdown.ts). */
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
