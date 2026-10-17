"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { tagSwing } from "@/components/site/signature-springs";
import { notFound as copy } from "@/content/stretch/site-copy";

/** Addresses longer than this are shortened in the middle. */
const SHORTEN_AT = 48;

/** The tag swings in on the same spring from the first paint; the keyframes live in stretch-shell.css. */
const springStyle = { "--tag-ease": tagSwing.easing, "--tag-ms": `${tagSwing.duration}ms` } as CSSProperties;

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
  if (address.length <= SHORTEN_AT) return address;
  const half = Math.floor((SHORTEN_AT - 1) / 2);
  return `${address.slice(0, half)}…${address.slice(-half)}`;
}

/**
 * The 404's lost-property tag (docs/content/redesign-copy.md): the address
 * asked for, found at eliasb.dev, stamped "Not on file". It swings in on its
 * string and settles at its resting tilt (`tagSwing`, a spring of bounce 0.4
 * and visual duration 0.6 s, which takes about 1.6 s to come to rest). The swing is CSS, played on the individual `rotate` property
 * from the hole the tag hangs by, so it starts at first paint and reduced
 * motion shows the tag at rest. The address is the request path, read from the
 * URL, so the server renders it too.
 */
export function LostPropertyTag() {
  const path = shortened(usePathname());
  const { tag: words } = copy;
  return (
    <div className="stretch-404__hang">
      <svg className="stretch-404__string" viewBox="0 0 120 90" aria-hidden="true">
        <path d="M60 0 C 58 30, 30 50, 22 88" fill="none" />
      </svg>
      <div className="stretch-404__tag" style={springStyle} data-lost-property>
        <span className="stretch-404__hole" aria-hidden="true" />
        <p className="stretch-mono stretch-404__tag-title">{words.title}</p>
        <dl className="stretch-404__fields">
          <div>
            <dt className="stretch-mono">{words.item}</dt>
            <dd className="stretch-404__address">{path}</dd>
          </div>
          <div>
            <dt className="stretch-mono">{words.foundAt}</dt>
            <dd>{words.foundAtValue}</dd>
          </div>
          <div>
            <dt className="stretch-mono">{words.returnTo}</dt>
            <dd>{words.returnToValue}</dd>
          </div>
        </dl>
        <span className="stretch-404__stamp stretch-display">{words.stamp}</span>
      </div>
    </div>
  );
}
