"use client";

import { useEffect, useRef, useState } from "react";
import { sectionLinks } from "@/components/site/sections";
import { SiteGreeting } from "@/components/site/site-greeting";
import { siteCopy } from "@/content/stretch/site-copy";

/** Where the phone header gives way to the desktop one; stretch-shell.css uses the same width. */
const DESKTOP = "(min-width: 900px)";

/**
 * The phone menu: a Menu button and the full-screen dialog it opens, with the
 * big section names and the London clock inside. The dialog is a native modal,
 * so the browser traps focus, makes the page behind inert and closes it on
 * Escape; Close and Escape both end in the same close event, which gives focus
 * back to Menu. Choosing a section closes it too, and focus then moves to that
 * section, so the next Tab starts there. Tab wraps from the last link to Close
 * and back, because a native modal would otherwise let it leave for the
 * browser's own controls. The section links are in the server HTML, and the
 * clock is mounted only while the dialog is open.
 */
export function MenuDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  /** The section a link in the menu was chosen for, so focus can follow the page to it. */
  const chosen = useRef<string | null>(null);
  /** Where the page was when the menu opened, put back on Close in case its scrollbar was dragged behind the dialog. */
  const scrolledTo = useRef(0);
  const [open, setOpen] = useState(false);

  // A dialog left open when the window grows to the desktop layout would cover it.
  useEffect(() => {
    const media = window.matchMedia(DESKTOP);
    const onChange = () => media.matches && dialog.current?.close();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Keep a classic scrollbar's width reserved, so opening the menu moves nothing. Set from here, and only
  // when scrollbars take room, because a stylesheet rule would also reserve 15 px where they are hidden or
  // overlaid, and narrow every page there. A probe measures them, since the page may not scroll yet.
  useEffect(() => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;width:50px;height:50px;overflow:scroll";
    document.body.append(probe);
    if (probe.offsetWidth > probe.clientWidth) document.documentElement.style.scrollbarGutter = "stable";
    probe.remove();
  }, []);

  // Wheel and touch do not scroll the page behind. Not overflow: hidden on html, which makes Chromium give up the
  // scrollbar width that scrollbar-gutter reserves, so opening the menu would move the page 15 px.
  useEffect(() => {
    const menu = dialog.current;
    if (!open || !menu) return;
    // A menu taller than the screen scrolls itself (stretch-shell.css keeps that from reaching the page).
    const hold = (event: Event) => menu.scrollHeight <= menu.clientHeight && event.preventDefault();
    menu.addEventListener("wheel", hold, { passive: false });
    menu.addEventListener("touchmove", hold, { passive: false });
    return () => {
      menu.removeEventListener("wheel", hold);
      menu.removeEventListener("touchmove", hold);
    };
  }, [open]);

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
          scrolledTo.current = window.scrollY;
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
          const section = chosen.current ? document.getElementById(chosen.current) : null;
          chosen.current = null;
          if (section) {
            // The page has scrolled to the section: start the next Tab there, not back at Menu.
            if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
            section.focus({ preventScroll: true });
            return;
          }
          window.scrollTo({ top: scrolledTo.current, behavior: "instant" });
          opener.current?.focus({ preventScroll: true });
        }}
      >
        <div className="stretch-menu__top">
          {open && <SiteGreeting />}
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
                  onClick={() => {
                    chosen.current = id;
                    close();
                  }}
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
