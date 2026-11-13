import type { ReactNode } from "react";
import { FocusHashTarget } from "@/components/site/focus-hash-target";
import { SayHello } from "@/components/site/say-hello";
import { SiteHeader } from "@/components/site/site-header";

/*
 * The long-form page (docs/design/DESIGN.md, "Long-form pages"): the shared header, the page's own content and Say hello,
 * around a Role story, a case study and the 404. Their parts are story-parts.tsx's. Server-rendered in full, so it
 * reads the same with no script.
 */

/** "Live site ↗" as a visible label and a decorative arrow: the link's name is the words. */
export function Arrowed({ label }: { label: string }) {
  const [, before, words, after] = label.match(/^(?:([←↗]) )?(.*?)(?: ([←↗]))?$/) ?? [];
  return (
    <>
      {before && <span aria-hidden="true">{before}</span>}
      {words}
      {after && <span aria-hidden="true">{after}</span>}
    </>
  );
}

/** The page: the shared header, the page's own content, Say hello to end it, and the skip link's target. */
export function LongForm({ attrs, children }: { attrs: Record<`data-${string}`, string>; children: ReactNode }) {
  return (
    <div data-stretch-shell {...attrs}>
      <SiteHeader />
      <FocusHashTarget />
      <main id="main-content" tabIndex={-1}>
        {children}
        <SayHello />
      </main>
    </div>
  );
}
