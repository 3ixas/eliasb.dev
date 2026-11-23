"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** True once the page has hydrated: the Copy button needs script, so the server renders it hidden and the text stays as it is. */
const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

/** ✓ with the text-presentation selector: iOS draws a bare ✓ as an emoji in some fonts. */
const CHECK = "\u2713\uFE0E";

type CopyStatus = "idle" | "copying" | "copied";

/**
 * Copy, the page's Button (docs/design/DESIGN.md "Controls", "Say hello"; R-51): Say hello's email and Threshold's link
 * (#462). Pressing it morphs synchronously to "✓ Copied" at a fixed width (both states share one grid cell, so the
 * button never shifts) before the clipboard resolves, announces "Copied" politely once confirmed, and returns after two
 * seconds. If the browser refuses the clipboard, it reverts and selects the text as shown (`textId`) instead, with no
 * new words.
 */
export function CopyButton({ text, textId, label, done, className }: { text: string; textId: string; label: string; done: string; className?: string }) {
  const ready = useHydrated();
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef(0);
  const attempt = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const scheduleReset = (id: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (attempt.current === id) setStatus("idle");
    }, 2000);
  };

  const fail = (id: number) => {
    if (attempt.current !== id) return;
    window.clearTimeout(timer.current);
    setStatus("idle");
    const target = document.getElementById(textId);
    const selection = window.getSelection();
    if (target && selection) selection.setBaseAndExtent(target, 0, target, target.childNodes.length);
  };

  const copy = () => {
    const id = ++attempt.current;
    const clipboard = navigator.clipboard;
    if (!clipboard?.writeText) {
      fail(id);
      return;
    }

    // Call writeText synchronously within the click gesture (Safari requires it), and morph before it resolves.
    let write: Promise<void>;
    try {
      write = clipboard.writeText(text);
    } catch {
      fail(id);
      return;
    }

    setStatus("copying");
    scheduleReset(id);

    void write.then(
      () => {
        if (attempt.current !== id) return;
        setStatus("copied");
        scheduleReset(id);
      },
      () => fail(id),
    );
  };

  const morphed = status !== "idle";

  return (
    <>
      <button
        type="button"
        className={className ? `button copy-button ${className}` : "button copy-button"}
        hidden={!ready}
        data-copied={morphed ? "" : undefined}
        onClick={copy}
      >
        <span className="copy-button__word">
          {morphed ? (
            <>
              <span className="copy-button__check" aria-hidden="true">
                {CHECK}
              </span>{" "}
              {done}
            </>
          ) : (
            label
          )}
        </span>
        <span className="copy-button__room" aria-hidden="true">
          {label}
        </span>
        <span className="copy-button__room" aria-hidden="true">
          <span className="copy-button__check">{CHECK}</span> {done}
        </span>
      </button>
      <span className="sr-only" role="status">
        {status === "copied" ? done : ""}
      </span>
    </>
  );
}
