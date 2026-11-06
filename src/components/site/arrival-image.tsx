"use client";

import Image, { type ImageProps } from "next/image";
import { useLayoutEffect, useRef } from "react";

/**
 * A screenshot that arrives on its Project colour (docs/design/DESIGN.md, "Craft bar"): while the file loads and
 * decodes the image is clear, and once it can paint it fades in over 150 ms (stretch-shell.css). An image the
 * browser already has when it comes into view, cached or loaded before hydration, never fades. One that is hidden
 * (a phone card's screenshot on a wide screen) or far off screen is not held at all: it is judged when it first
 * shows, so nothing out of sight is ever left clear. The server renders the image plain, so without script it
 * shows as soon as it loads; `data-arriving` is set only by this effect.
 */
export function ArrivalImage({ alt, ...props }: ImageProps) {
  const image = useRef<HTMLImageElement>(null);
  useLayoutEffect(() => {
    const element = image.current;
    if (!element) return;
    let live = true;
    const arrive = () => {
      if (live) delete element.dataset.arriving;
    };
    const hold = () => {
      if (element.complete && element.naturalWidth > 0) return;
      element.dataset.arriving = "";
      // A file that fails to decode still ends the wait: the broken-image state is the browser's to show.
      element.decode().then(arrive, arrive);
    };
    const watch = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      watch.disconnect();
      hold();
    });
    watch.observe(element);
    return () => {
      live = false;
      watch.disconnect();
      delete element.dataset.arriving;
    };
  }, []);
  return <Image ref={image} alt={alt} data-arrival="" {...props} />;
}
