import type { Metadata } from "next";
// Before the 404's own sheets, so the shared stylesheets come first in the cascade.
import { SiteDocument } from "./site-document";
import "./pass.css";
import "./story.css";
import { NotFoundView, notFoundMetadata } from "@/components/site/not-found-view";

export const metadata: Metadata = {
  ...notFoundMetadata,
  metadataBase: new URL("https://www.eliasb.dev"),
};

/**
 * The 404 for every address no route serves (`experimental.globalNotFound`, #572). A root `not-found.tsx` has its
 * stylesheets preloaded and its markup serialised on every route; this file is only loaded by the 404 itself.
 */
export default function GlobalNotFound() {
  return (
    <SiteDocument>
      <NotFoundView />
    </SiteDocument>
  );
}
