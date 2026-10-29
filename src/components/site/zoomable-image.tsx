"use client";

import Image from "next/image";
import { useRef } from "react";

/**
 * A screenshot on a long-form page that opens large in the same window (docs/design/DESIGN.md, "Figures"): the
 * inline image is the button, and it opens the same image in a modal dialog sized to the window. The browser
 * closes the dialog on Esc; focus goes back to the button explicitly, since Safari does not focus a button on
 * click and so has nothing to return to. A click anywhere on the dialog, or its Close button, closes it too. The inline image is rendered by the server like any other; the large one loads only when first opened.
 */
export function ZoomableImage({ src, alt, width, height, sizes, preload }: { src: string; alt: string; width: number; height: number; sizes: string; preload?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={trigger} type="button" className="qi-zoom" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        <Image src={src} alt={alt} width={width} height={height} sizes={sizes} preload={preload} />
        <span className="sr-only"> (view larger)</span>
      </button>
      <dialog ref={dialog} className="qi-zoom__dialog" aria-label={alt} onClick={(event) => event.currentTarget.close()} onClose={() => trigger.current?.focus()}>
        <Image src={src} alt={alt} width={width} height={height} sizes="(min-width: 1200px) 1100px, 96vw" loading="lazy" />
        <form method="dialog">
          <button className="qi-zoom__close">Close</button>
        </form>
      </dialog>
    </>
  );
}
