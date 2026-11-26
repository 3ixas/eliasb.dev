"use client";

import Image from "next/image";
import { ArrivalImage } from "@/components/site/arrival-image";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type TouchEvent } from "react";
import { flushSync } from "react-dom";

/** How long opening waits for the large image to be ready to paint. Past this it opens anyway: nothing waits long on an image. */
const DECODE_WAIT_MS = 400;

/** Two taps on the image within this time and distance count as a double tap to zoom to the point tapped. */
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_PX = 40;
/** Movement past this turns a touch from a tap into a pan. */
const TAP_DRAG_PX = 10;

type ActiveTransition = {
  owner: object;
  vt: ViewTransition;
  cancel: () => void;
  cleanup: () => void;
};

/** Only one screenshot may hold `view-transition-name: zoom-shot` at a time across the whole document. */
let activeTransition: ActiveTransition | null = null;

function clearActiveTransition(owner?: object) {
  if (!activeTransition) return;
  if (owner && activeTransition.owner !== owner) return;
  const current = activeTransition;
  activeTransition = null;
  current.cancel();
  current.vt.skipTransition();
  current.cleanup();
}

function canUseViewTransition() {
  return typeof document.startViewTransition === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isInViewport(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
}

function siteOutEasing() {
  return getComputedStyle(document.documentElement).getPropertyValue("--out").trim() || "cubic-bezier(0.22, 1, 0.36, 1)";
}

/**
 * A screenshot on a long-form page that opens large in the same window (docs/design/DESIGN.md, "Figures" and "Motion"):
 * the inline image is the button, and it grows into the modal dialog via a same-document view transition around
 * `showModal()`, then returns to its live position in the page around `close()`. Focus goes back to the button
 * explicitly, since Safari does not focus a button on click and so has nothing to return to; pointer closes suppress
 * the focus ring while keyboard closes keep it.
 *
 * On touch devices the large view sits in a scrollable, pinch-zoomable stage: native `touch-action` and
 * `overscroll-behavior` handle pinch, pan and scroll containment, a double tap zooms to the point tapped, single taps
 * on the image do not dismiss it, and Close or a tap outside the image closes it while the page behind stays still.
 * Without View Transitions support or with reduced motion, the dialog opens and closes at once.
 */
export function ZoomableImage({ src, alt, width, height, sizes, preload }: { src: string; alt: string; width: number; height: number; sizes: string; preload?: boolean }) {
  const owner = useRef({});
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const large = useRef<HTMLImageElement>(null);
  const [wanted, setWanted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const want = () => setWanted(true);
  /** One opening at a time: extra clicks while it waits on the image are the same click. */
  const opening = useRef(false);
  /** True while a closing view transition owns teardown, so native `onClose` skips its fallback teardown. */
  const closing = useRef(false);
  /** Last input kind on the dialog ("keyboard" | pointerType): pointer closes hide the ring, and touch taps on the image stay open. */
  const lastInput = useRef<string>("keyboard");
  const touchGesture = useRef<{ x: number; y: number; moved: boolean; multi: boolean } | null>(null);
  const lastTap = useRef<{ x: number; y: number; time: number } | null>(null);
  /** Swallows the trailing synthetic click after a double-tap zoom shrinks the image out from under the finger. */
  const suppressClick = useRef(false);

  const inlineImage = () => trigger.current?.querySelector("img") ?? null;

  const restoreFocus = (preventScroll: boolean) => {
    const button = trigger.current;
    if (!button) return;
    if (lastInput.current !== "keyboard") button.dataset.pointer = "";
    else delete button.dataset.pointer;
    button.focus({ preventScroll });
  };

  const resetZoomState = () => {
    lastTap.current = null;
    touchGesture.current = null;
    suppressClick.current = false;
    large.current?.getAnimations().forEach((animation) => animation.finish());
    setZoomed(false);
    if (stage.current) {
      stage.current.scrollLeft = 0;
      stage.current.scrollTop = 0;
    }
  };

  const finishDialogClose = (preventScroll: boolean) => {
    const inlineImg = inlineImage();
    if (inlineImg) delete inlineImg.dataset.zoomHidden;
    flushSync(resetZoomState);
    restoreFocus(preventScroll);
  };

  /** Runs a same-document view transition scoped to this screenshot, cleaning up if skipped or finished. */
  const runTransition = (kind: "open" | "close", prepareOld: () => void, applyNew: () => void, cleanup: () => void) => {
    clearActiveTransition();
    document.documentElement.dataset.zoomTransition = kind;
    prepareOld();
    let cancelled = false;
    const finish = () => {
      cleanup();
      if (!activeTransition) delete document.documentElement.dataset.zoomTransition;
    };
    const vt = document.startViewTransition(() => {
      applyNew();
      if (cancelled) finish();
    });
    const entry: ActiveTransition = {
      owner: owner.current,
      vt,
      cancel: () => {
        cancelled = true;
      },
      cleanup: finish,
    };
    activeTransition = entry;
    const settle = () => {
      if (activeTransition !== entry) return;
      activeTransition = null;
      finish();
    };
    vt.finished.then(settle, settle);
  };

  const open = async () => {
    if (opening.current || dialog.current?.open) return;
    opening.current = true;
    // Escape cancels the open until `showModal()` has run: the listener outlives the decode wait and the transition's gap before it.
    let cancelled = false;
    const cancelPending = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancelled = true;
    };
    const stopListening = () => window.removeEventListener("keydown", cancelPending);
    window.addEventListener("keydown", cancelPending);
    try {
      // A click with no pointer or focus before it (assistive technology) still gets an image to wait for.
      flushSync(want);
      await Promise.race([large.current?.decode().catch(() => undefined), new Promise((resolve) => window.setTimeout(resolve, DECODE_WAIT_MS))]);
    } finally {
      opening.current = false;
    }
    const dialogEl = dialog.current;
    if (cancelled || !dialogEl || dialogEl.open) {
      stopListening();
      return;
    }

    const inlineImg = inlineImage();
    const largeImg = large.current;

    // Keep initial dialog focus on Close rather than letting a scrollable .zoom__stage steal it.
    const showModal = () => {
      flushSync(resetZoomState);
      dialogEl.showModal();
      closeButton.current?.focus({ preventScroll: true });
    };

    if (!canUseViewTransition() || !inlineImg || !largeImg) {
      showModal();
      stopListening();
      return;
    }

    runTransition(
      "open",
      () => {
        largeImg.style.viewTransitionName = "";
        inlineImg.dataset.zooming = "";
        inlineImg.style.viewTransitionName = "zoom-shot";
      },
      () => {
        stopListening();
        if (!dialogEl.isConnected || cancelled) return;
        inlineImg.style.viewTransitionName = "";
        delete inlineImg.dataset.zooming;
        inlineImg.dataset.zoomHidden = "";
        showModal();
        largeImg.style.viewTransitionName = "zoom-shot";
      },
      () => {
        stopListening();
        inlineImg.style.viewTransitionName = "";
        delete inlineImg.dataset.zooming;
        largeImg.style.viewTransitionName = "";
        if (!dialogEl.open) delete inlineImg.dataset.zoomHidden;
      },
    );
  };

  const close = () => {
    const dialogEl = dialog.current;
    if (!dialogEl?.open || closing.current) return;

    const inlineImg = inlineImage();
    const largeImg = large.current;

    if (!canUseViewTransition() || !inlineImg || !largeImg) {
      clearActiveTransition(owner.current);
      dialogEl.close();
      return;
    }

    closing.current = true;
    largeImg.getAnimations().forEach((animation) => animation.finish());

    runTransition(
      "close",
      () => {
        inlineImg.style.viewTransitionName = "";
        largeImg.dataset.zooming = "";
        largeImg.style.viewTransitionName = "zoom-shot";
      },
      () => {
        largeImg.style.viewTransitionName = "";
        delete largeImg.dataset.zooming;
        dialogEl.close();
        delete inlineImg.dataset.zoomHidden;
        flushSync(resetZoomState);
        // If the page moved while the dialog was open and carried the thumbnail out of view, bring it back before the new snapshot.
        if (!isInViewport(inlineImg)) inlineImg.scrollIntoView({ block: "nearest", behavior: "instant" });
        inlineImg.dataset.zooming = "";
        inlineImg.style.viewTransitionName = "zoom-shot";
        restoreFocus(true);
      },
      () => {
        closing.current = false;
        largeImg.style.viewTransitionName = "";
        delete largeImg.dataset.zooming;
        inlineImg.style.viewTransitionName = "";
        delete inlineImg.dataset.zooming;
        delete inlineImg.dataset.zoomHidden;
      },
    );
  };

  const toggleZoomAt = (clientX: number, clientY: number) => {
    const img = large.current;
    const scroller = stage.current;
    if (!img || !scroller) return;

    img.getAnimations().forEach((animation) => animation.finish());
    const before = img.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const fx = before.width > 0 ? clamp((clientX - before.left) / before.width, 0, 1) : 0.5;
    const fy = before.height > 0 ? clamp((clientY - before.top) / before.height, 0, 1) : 0.5;
    const nextZoomed = !zoomed;

    flushSync(() => setZoomed(nextZoomed));

    if (nextZoomed) {
      const targetLeft = img.offsetLeft + fx * img.offsetWidth - (clientX - scrollerRect.left);
      const targetTop = img.offsetTop + fy * img.offsetHeight - (clientY - scrollerRect.top);
      scroller.scrollLeft = clamp(targetLeft, 0, Math.max(0, scroller.scrollWidth - scroller.clientWidth));
      scroller.scrollTop = clamp(targetTop, 0, Math.max(0, scroller.scrollHeight - scroller.clientHeight));
    } else {
      scroller.scrollLeft = 0;
      scroller.scrollTop = 0;
    }

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const after = img.getBoundingClientRect();
      if (after.width > 0 && before.width > 0) {
        const dx = before.left - after.left;
        const dy = before.top - after.top;
        const sx = before.width / after.width;
        const sy = before.height / after.height;
        img.animate(
          [
            { transformOrigin: "0 0", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
            { transformOrigin: "0 0", transform: "none" },
          ],
          { duration: 220, easing: siteOutEasing() },
        );
      }
    }
  };

  useEffect(() => {
    const currentOwner = owner.current;
    return () => {
      clearActiveTransition(currentOwner);
    };
  }, []);

  const onStageTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    suppressClick.current = false;
    if (event.touches.length > 1) {
      if (touchGesture.current) touchGesture.current.multi = true;
      lastTap.current = null;
      return;
    }
    const touch = event.touches[0];
    if (touch) touchGesture.current = { x: touch.clientX, y: touch.clientY, moved: false, multi: false };
  };

  const onStageTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchGesture.current;
    if (!start) return;
    if (event.touches.length > 1) {
      start.multi = true;
      return;
    }
    const touch = event.touches[0];
    if (touch && Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > TAP_DRAG_PX) {
      start.moved = true;
    }
  };

  const onStageTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length > 0) return;
    const gesture = touchGesture.current;
    touchGesture.current = null;
    if (!gesture || gesture.multi || gesture.moved) {
      lastTap.current = null;
      return;
    }
    if (event.target !== large.current) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const now = Date.now();
    const prev = lastTap.current;
    if (prev && now - prev.time <= DOUBLE_TAP_MS && Math.hypot(touch.clientX - prev.x, touch.clientY - prev.y) <= DOUBLE_TAP_PX) {
      lastTap.current = null;
      if (event.cancelable) event.preventDefault();
      suppressClick.current = true;
      toggleZoomAt(touch.clientX, touch.clientY);
    } else {
      lastTap.current = { x: touch.clientX, y: touch.clientY, time: now };
    }
  };

  const onStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (event.target === stage.current) close();
  };

  const onImageClick = () => {
    // On touch, tapping the image stays open so it never fights panning or double-tap zoom.
    if (lastInput.current === "touch") return;
    close();
  };

  const onDialogClose = () => {
    if (closing.current) return;
    finishDialogClose(false);
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="zoom"
        aria-haspopup="dialog"
        onBlur={(event) => delete event.currentTarget.dataset.pointer}
        onKeyDown={(event) => delete event.currentTarget.dataset.pointer}
        onPointerEnter={want}
        onPointerDown={want}
        onFocus={want}
        onClick={open}
      >
        <ArrivalImage src={src} alt={alt} width={width} height={height} sizes={sizes} preload={preload} />
        <span className="sr-only"> (view larger)</span>
      </button>
      <dialog
        ref={dialog}
        className="zoom__dialog"
        aria-label="Larger view"
        onCancel={(event) => {
          if (closing.current) return;
          event.preventDefault();
          lastInput.current = "keyboard";
          close();
        }}
        onPointerDown={(event) => {
          suppressClick.current = false;
          lastInput.current = event.pointerType || "mouse";
        }}
        onKeyDown={() => {
          lastInput.current = "keyboard";
        }}
        onClose={onDialogClose}
      >
        <div
          ref={stage}
          className="zoom__stage"
          data-zoomed={zoomed ? "" : undefined}
          onClick={onStageClick}
          onTouchStart={onStageTouchStart}
          onTouchMove={onStageTouchMove}
          onTouchEnd={onStageTouchEnd}
        >
          {wanted && (
            <Image
              ref={large}
              className="zoom__img"
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes="(min-width: 1200px) 1100px, 96vw"
              loading="eager"
              style={{ "--w": width, "--ar": width / height } as CSSProperties}
              onClick={onImageClick}
            />
          )}
        </div>
        <form
          method="dialog"
          className="zoom__bar"
          onSubmit={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <button
            ref={closeButton}
            className="zoom__close"
            onClick={(event) => {
              if (event.detail === 0) lastInput.current = "keyboard";
            }}
          >
            Close
          </button>
        </form>
      </dialog>
    </>
  );
}
