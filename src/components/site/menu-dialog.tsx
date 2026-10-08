"use client";

import { useEffect, useRef, useState } from "react";
import { sectionLinks } from "@/components/site/sections";
import { SiteClock } from "@/components/site/site-clock";
import { siteCopy } from "@/content/stretch/site-copy";

/** Where the phone header gives way to the desktop one; stretch-shell.css uses the same width. */
const DESKTOP = "(min-width: 761px)";

/**
 * The phone menu: a Menu button and the full-screen dialog it opens, with the
 * big section names and the London clock inside. The dialog is a native modal,
 * so the browser traps focus, makes the page behind inert and closes it on
 * Escape; Close and Escape both end in the same close event, which gives focus
 * back to Menu. Tab wraps from the last link to Close and back, because a
 * native modal would otherwise let it leave for the browser's own controls. The section links are in the server HTML, and the clock is
 * mounted only while the dialog is open.
 */
export function MenuDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // A dialog left open when the window grows to the desktop layout would cover it.
  useEffect(() => {
    const media = window.matchMedia(DESKTOP);
    const onChange = () => media.matches && dialog.current?.close();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const close = () => dialog.current?.close();

  function wrapTab(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const stops = [...event.currentTarget.querySelectorAll<HTMLElement>("a[href], button")];
    const edge = event.shiftKey ? stops[0] : stops[stops.length - 1];
    if (document.activeElement !== edge) return;
    event.preventDefault();
    (event.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
  }

  return (
    <>
      <button
        ref={opener}
        type="button"
        className="stretch-pill stretch-menu-button"
        aria-haspopup="dialog"
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
          closer.current?.focus();
        }}
      >
        {siteCopy.header.menu}
      </button>
      <dialog
        ref={dialog}
        className="stretch-menu"
        aria-label={siteCopy.header.menu}
        onKeyDown={wrapTab}
        onClose={() => {
          setOpen(false);
          opener.current?.focus({ preventScroll: true });
        }}
      >
        <div className="stretch-menu__top">
          {open && <SiteClock />}
          <button ref={closer} type="button" className="stretch-pill stretch-menu__close" onClick={close}>
            {siteCopy.header.close}
          </button>
        </div>
        <nav aria-label="Primary navigation" className="stretch-menu__nav">
          <ul>
            {sectionLinks.map(({ id, label }, index) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={index === sectionLinks.length - 1 ? "stretch-menu__cta" : undefined}
                  onClick={close}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}
