"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type ComponentProps } from "react";

/*
 * One signal for every link on the page: "the page has loaded and the browser
 * is idle". It is scheduled once, when the first link subscribes, and each
 * link then reads it, rather than every link queueing an idle callback.
 */
let pageIdle = false;
let scheduled = false;
const listeners = new Set<() => void>();

function markIdle() {
  pageIdle = true;
  listeners.forEach((listener) => listener());
}

function whenPageIdle() {
  if (scheduled) return;
  scheduled = true;
  const afterLoad = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(markIdle, { timeout: 2000 });
    // Safari has no requestIdleCallback.
    else window.setTimeout(markIdle, 500);
  };
  if (document.readyState === "complete") afterLoad();
  else window.addEventListener("load", afterLoad, { once: true });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  whenPageIdle();
  return () => {
    listeners.delete(listener);
  };
}

/**
 * A Link that holds back its prefetch until the page has loaded, so a page
 * load doesn't fetch every route it links to while it is still painting (the
 * mobile Lighthouse bar). It prefetches as soon as someone shows intent (a
 * pointer over it, keyboard focus, or a touch), or once the page is loaded and
 * the browser is idle, so on a phone the next page is still ready before the
 * tap. The intent pattern is from Next.js's prefetching guide.
 */
export function LazyPrefetchLink({ onPointerEnter, onFocus, onTouchStart, ...props }: Omit<ComponentProps<typeof Link>, "prefetch">) {
  const idle = useSyncExternalStore(subscribe, () => pageIdle, () => false);
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      prefetch={idle || intent ? null : false}
      onPointerEnter={(event) => {
        setIntent(true);
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        setIntent(true);
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        setIntent(true);
        onTouchStart?.(event);
      }}
    />
  );
}
