"use client";

import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

/** How far ahead of the viewport an island starts loading: far enough that it is working before it is seen. */
const AHEAD = "0px 0px 600px 0px";

/**
 * Makes a working figure's island (#462): a client component that renders `children`, the figure as the server drew
 * it, until the figure is within 600 px of the viewport, then loads `load` and puts the working version in its place.
 * The server's drawing stays while the script arrives, so the figure is never empty and, laid out the same, never
 * moves. The island's code is its own chunk, outside the page's first load. Call it at the top of a "use client"
 * module: `export const ThresholdLinkIsland = lazyIsland(() => import("./threshold-link-live"));`
 */
export function lazyIsland<Props extends object>(load: () => Promise<{ default: ComponentType<Props> }>) {
  const Live = lazy(load);
  return function Island({ children, ...props }: Props & { children: ReactNode }) {
    const box = useRef<HTMLDivElement>(null);
    const [near, setNear] = useState(false);
    useEffect(() => {
      const element = box.current;
      if (!element) return;
      const watcher = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          watcher.disconnect();
          setNear(true);
        },
        { rootMargin: AHEAD },
      );
      watcher.observe(element);
      return () => watcher.disconnect();
    }, []);
    return (
      <div ref={box} className="working-fig__island">
        <Suspense fallback={children}>{near ? <Live {...(props as Props)} /> : children}</Suspense>
      </div>
    );
  };
}
