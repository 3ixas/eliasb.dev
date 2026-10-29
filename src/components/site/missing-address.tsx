"use client";

import { useSyncExternalStore } from "react";

/** Addresses longer than this are shortened in the middle. */
const SHORTEN_AT = 48;

const noSubscription = () => () => {};
const requestPath = () => window.location.pathname;
/** The static 404 page is built once, so the server cannot know the address: it sends none rather than a wrong one. */
const unknownOnServer = () => null;

/** The address asked for, shortened in the middle when it would run on. */
function shortened(path: string) {
  // A malformed escape (a stray %) makes decodeURI throw; the address as sent is then the honest thing to show.
  const address = (() => {
    try {
      return decodeURI(path);
    } catch {
      return path;
    }
  })();
  // Count code points, not UTF-16 units, so an emoji at a cut is never split in two.
  const characters = Array.from(address);
  if (characters.length <= SHORTEN_AT) return address;
  const half = Math.floor((SHORTEN_AT - 1) / 2);
  return `${characters.slice(0, half).join("")}…${characters.slice(-half).join("")}`;
}

/**
 * The address asked for, as the 404's missing row's title (docs/design/DESIGN.md, "The 404"): struck through by
 * the row's CSS. It is the request path, read in the browser: the 404 is prerendered, so the HTML carries no
 * address until then.
 */
export function MissingAddress() {
  const path = useSyncExternalStore(noSubscription, requestPath, unknownOnServer);
  return <span className="qi-missing__address stretch-mono">{path === null ? "" : shortened(path)}</span>;
}
