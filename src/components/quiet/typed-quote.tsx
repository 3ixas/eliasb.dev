"use client";

import { useEffect, useRef } from "react";

const CHARACTERS_PER_SECOND = 45;

/**
 * A quote that types itself with a caret when its closer look arrives. Typing is time-based: each animation frame
 * shows as many characters as the elapsed time allows, so the rate is steady whatever the frame rate and there is
 * never a timer per character. The not-yet-typed rest stays in the layout, hidden, so the look does not grow as
 * it types. A visitor who prefers reduced motion gets the whole quote and no caret.
 */
export function TypedQuote({ text }: { text: string }) {
  const typed = useRef<HTMLSpanElement>(null);
  const rest = useRef<HTMLSpanElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const [typedText, restText, caretMark] = [typed.current, rest.current, caret.current];
    if (!typedText || !restText || !caretMark) return;
    const show = (count: number) => {
      typedText.textContent = text.slice(0, count);
      restText.textContent = text.slice(count);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show(text.length);
      caretMark.hidden = true;
      return;
    }
    let frame = 0;
    const started = performance.now();
    const step = (now: number) => {
      const count = Math.min(text.length, Math.floor(((now - started) / 1000) * CHARACTERS_PER_SECOND));
      show(count);
      if (count < text.length) frame = requestAnimationFrame(step);
      else caretMark.dataset.done = "";
    };
    show(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text]);
  return (
    <>
      <span ref={typed} />
      <span ref={caret} className="qi-caret" />
      <span ref={rest} className="qi-untyped">
        {text}
      </span>
    </>
  );
}
