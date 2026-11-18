"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

/** How far ahead of the viewport an island starts loading: far enough that it is working before it is seen. */
const AHEAD = "0px 0px 600px 0px";

const focusables = (box: HTMLElement) => [...box.querySelectorAll<HTMLElement>("a[href], button, select, input, textarea, [tabindex]:not([tabindex='-1'])")];

/**
 * Makes a working figure's island (#462): a client component that renders `children`, the figure as the server drew
 * it, until the figure is within 600 px of the viewport, then loads `load` and, once it has arrived, puts the working
 * version in its place in one swap. The drawing stays while the script arrives, so the figure is never empty and, laid
 * out the same, never moves; if focus was inside it, the same control in the working version takes it. The island's
 * code is its own chunk, outside the page's first load. Call it at the top of a "use client" module:
 * `export const ThresholdLinkIsland = lazyIsland(() => import("./threshold-link-live"));`
 */
export function lazyIsland<Props extends object>(load: () => Promise<{ default: ComponentType<Props> }>) {
  return function Island({ children, ...props }: Props & { children: ReactNode }) {
    const box = useRef<HTMLDivElement>(null);
    const refocus = useRef(-1);
    const [Live, setLive] = useState<ComponentType<Props> | null>(null);

    useEffect(() => {
      const element = box.current;
      if (!element) return;
      let gone = false;
      const watcher = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          watcher.disconnect();
          load().then(({ default: Working }) => {
            if (gone) return;
            refocus.current = focusables(element).indexOf(document.activeElement as HTMLElement);
            setLive(() => Working);
          });
        },
        { rootMargin: AHEAD },
      );
      watcher.observe(element);
      return () => {
        gone = true;
        watcher.disconnect();
      };
    }, []);

    // The drawing's nodes are gone: hand focus to the control in the same place, before the frame paints.
    useLayoutEffect(() => {
      if (!Live || refocus.current < 0 || !box.current) return;
      focusables(box.current)[refocus.current]?.focus({ preventScroll: true });
      refocus.current = -1;
    }, [Live]);

    return (
      <div ref={box} className="working-fig__island">
        {Live ? <Live {...(props as Props)} /> : children}
      </div>
    );
  };
}
