"use client";

import "@/app/pass.css";
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

/** East Asian wide and full-width characters and emoji take about an em: twice a Latin letter's width. */
const wide = /[\p{Extended_Pictographic}\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6\u{20000}-\u{3FFFD}]/u;
const units = (character: string) => (wide.test(character) ? 2 : 1);

/** The characters from one end of `characters` that fit in `budget` units, never splitting a code point. */
function fit(characters: string[], budget: number) {
  const kept: string[] = [];
  for (const character of characters) {
    budget -= units(character);
    if (budget < 0) break;
    kept.push(character);
  }
  return kept;
}

/**
 * The address shortened in the middle to the pass's text limit, counted in units of a Latin letter's width (a wide
 * character is two), so both its ends always fit the pass's three lines. Counting code points keeps an emoji whole.
 */
export function shortened(address: string) {
  const characters = Array.from(address);
  if (characters.reduce((total, character) => total + units(character), 0) <= TEXT_LIMITS.passName) return address;
  const half = Math.floor((TEXT_LIMITS.passName - 1) / 2);
  return `${fit(characters, half).join("")}…${fit([...characters].reverse(), half).reverse().join("")}`;
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
