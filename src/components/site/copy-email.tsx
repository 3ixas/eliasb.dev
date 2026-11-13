"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** True once the page has hydrated: the Copy button needs script, so the server renders it hidden and the email stays a plain link. */
const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

/**
 * Say hello's Copy, the page's Button (docs/design/DESIGN.md "Controls", "Say hello"): it copies the address and
 * fills with ink, saying "Copied" for two seconds. Both words are laid out in the same cell, so the button is the
 * width of the longer and never moves. The change is announced politely. If the browser refuses the clipboard,
 * the button selects the address (the element `addressId` names) instead, ready to copy by hand, with no new words.
 */
export function CopyEmail({ address, addressId, label, done }: { address: string; addressId: string; label: string; done: string }) {
  const ready = useHydrated();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const shown = document.getElementById(addressId);
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
      <button type="button" className="button copy-button" hidden={!ready} data-copied={copied ? "" : undefined} onClick={copy}>
        <span className="copy-button__word">{copied ? done : label}</span>
        <span className="copy-button__room" aria-hidden="true">
          {label}
        </span>
        <span className="copy-button__room" aria-hidden="true">
          {done}
        </span>
      </button>
      <span className="sr-only" role="status">
        {copied ? done : ""}
      </span>
    </>
  );
}
