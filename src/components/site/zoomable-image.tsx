"use client";

import Image from "next/image";
import { ArrivalImage } from "@/components/site/arrival-image";
import { useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";

/** How long opening waits for the large image to be ready to paint. Past this it opens anyway: nothing waits long on an image. */
const DECODE_WAIT_MS = 400;

/**
 * A screenshot on a long-form page that opens large in the same window (docs/design/DESIGN.md, "Figures"): the
 * inline image is the button, and it opens the same image in a modal dialog sized to the window. The browser
 * closes the dialog on Esc; focus goes back to the button explicitly, since Safari does not focus a button on
 * click and so has nothing to return to. A click anywhere on the dialog, or its Close button, closes it too.
 * The inline image is rendered by the server like any other. The large one starts loading when the visitor shows
 * intent (the pointer arriving, focus or a touch), and opening waits briefly for it to decode, so the dialog opens
 * on the picture rather than an empty card. Its size comes from the declared width and height (CSS), never from the file the browser picks: on a dense
 * display the browser divides that file's width by the density, which would shrink the image.
 */
export function ZoomableImage({ src, alt, width, height, sizes, preload }: { src: string; alt: string; width: number; height: number; sizes: string; preload?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const large = useRef<HTMLImageElement>(null);
  const [wanted, setWanted] = useState(false);
  const want = () => setWanted(true);
  /** One opening at a time: extra clicks while it waits on the image are the same click. */
  const opening = useRef(false);
  const open = async () => {
    if (opening.current) return;
    opening.current = true;
    // A click with no pointer or focus before it (assistive technology) still gets an image to wait for.
    flushSync(want);
    await Promise.race([large.current?.decode().catch(() => undefined), new Promise((resolve) => window.setTimeout(resolve, DECODE_WAIT_MS))]);
    opening.current = false;
    if (!dialog.current?.open) dialog.current?.showModal();
  };
  return (
    <>
      <button ref={trigger} type="button" className="zoom" aria-haspopup="dialog" onPointerEnter={want} onPointerDown={want} onFocus={want} onClick={open}>
        <ArrivalImage src={src} alt={alt} width={width} height={height} sizes={sizes} preload={preload} />
        <span className="sr-only"> (view larger)</span>
      </button>
      <dialog ref={dialog} className="zoom__dialog" aria-label={alt} onClick={(event) => event.currentTarget.close()} onClose={() => trigger.current?.focus()}>
        {wanted && <Image ref={large} src={src} alt={alt} width={width} height={height} sizes="(min-width: 1200px) 1100px, 96vw" loading="eager" style={{ "--w": width, "--ar": width / height } as CSSProperties} />}
        <form method="dialog">
          <button className="zoom__close">Close</button>
        </form>
      </dialog>
    </>
  );
}
