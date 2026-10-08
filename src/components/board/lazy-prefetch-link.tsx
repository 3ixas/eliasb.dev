"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentProps } from "react";

/**
 * A Link that holds back its prefetch until the page has loaded, so a page
 * load doesn't fetch every route it links to while it is still painting (the
 * mobile Lighthouse bar). It prefetches as soon as someone shows intent (a
 * pointer over it, keyboard focus, or a touch), or once the page is loaded and
 * the browser is idle, so on a phone the next page is still ready before the
 * tap. The intent pattern is from Next.js's prefetching guide.
 */
export function IntentLink({ onPointerEnter, onFocus, onTouchStart, ...props }: Omit<ComponentProps<typeof Link>, "prefetch">) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel = () => {};
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
        cancel = () => window.cancelIdleCallback(id);
      } else {
        // Safari has no requestIdleCallback.
        const id = window.setTimeout(() => setReady(true), 500);
        cancel = () => window.clearTimeout(id);
      }
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      window.removeEventListener("load", whenIdle);
      cancel();
    };
  }, []);

  return (
    <Link
      {...props}
      prefetch={ready ? null : false}
      onPointerEnter={(event) => {
        setReady(true);
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        setReady(true);
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        setReady(true);
        onTouchStart?.(event);
      }}
    />
  );
}
