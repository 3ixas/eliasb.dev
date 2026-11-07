"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** True once the page has hydrated: the Copy button needs script, so the server renders it hidden and the email stays a plain link. */
const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

/**
 * The email's Copy button (docs/design/DESIGN.md, "Say hello"): it copies the address and turns cobalt, saying
 * "Copied" for two seconds. The change is announced politely. If the browser refuses the clipboard, the button
 * selects the address instead, ready to copy by hand, with no new words.
 */
export function CopyEmail({ address, label, done }: { address: string; label: string; done: string }) {
  const ready = useHydrated();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const shown = document.querySelector(".qi-email__address");
      const selection = window.getSelection();
      if (shown && selection) selection.setBaseAndExtent(shown, 0, shown, shown.childNodes.length);
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button type="button" className="qi-copy" hidden={!ready} data-copied={copied ? "" : undefined} onClick={copy}>
        {copied ? done : label}
      </button>
      <span className="sr-only" role="status">
        {copied ? done : ""}
      </span>
    </>
  );
}
