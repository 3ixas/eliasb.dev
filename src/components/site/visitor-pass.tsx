"use client";

import { useSyncExternalStore } from "react";
import { TEXT_LIMITS } from "@/content/stretch/story";
import { notFound as copy } from "@/content/stretch/site-copy";

const noSubscription = () => () => {};
const requestPath = () => window.location.pathname;
/** The static 404 page is built once, so the server cannot know the address: it sends none rather than a wrong one. */
const unknownOnServer = () => null;

/** The address as asked for. A malformed escape (a stray %) makes decodeURI throw; the address as sent is then the honest thing to show. */
function decoded(path: string) {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

/** The address shortened in the middle to the pass's text limit, counting code points so an emoji at a cut is never split. */
export function shortened(address: string) {
  const characters = Array.from(address);
  if (characters.length <= TEXT_LIMITS.passName) return address;
  const half = Math.floor((TEXT_LIMITS.passName - 1) / 2);
  return `${characters.slice(0, half).join("")}…${characters.slice(-half).join("")}`;
}

/**
 * The 404's visitor pass (docs/design/DESIGN.md "The 404", #470): a small, still printed card with no lanyard. "Visitor"
 * on a band of ink on paper, a silhouette where a portrait would be, the address asked for struck through, and "Not on
 * file". It is a picture, named by its print with the whole address. The 404 is prerendered, so the address is read in
 * the browser; without script the pass prints no address.
 */
export function VisitorPass() {
  const path = useSyncExternalStore(noSubscription, requestPath, unknownOnServer);
  const address = path === null ? null : decoded(path);
  const name = [copy.pass.band, address && `${address}, struck through`, copy.missing.line].filter(Boolean).join(". ");
  return (
    <div className="pass pass--visitor" role="img" aria-label={`${name}.`}>
      <span className="pass__card" aria-hidden="true">
        <span className="pass__band">
          <span>{copy.pass.band}</span>
        </span>
        <i className="pass__slot" />
        <svg className="pass__photo pass__silhouette" viewBox="0 0 40 48" focusable="false">
          <circle cx="20" cy="17" r="8" />
          <path d="M4 48c0-10 7-17 16-17s16 7 16 17z" />
        </svg>
        <span className="pass__who">
          <s className="pass__address">{address && shortened(address)}</s>
        </span>
        <span className="pass__foot">
          <span className="pass__status">{copy.missing.line}</span>
        </span>
      </span>
    </div>
  );
}
