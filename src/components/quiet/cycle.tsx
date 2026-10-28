"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { WIDE } from "@/components/quiet/margin-placement";

type Cycles = { positions: Record<string, number>; advance: (id: string, total: number) => void };

const CycleContext = createContext<Cycles | null>(null);

/**
 * Where each cycling row is in its list. A row and its closer look sit in different places (the row in the list, the
 * look in the margin or the inline slot) but both are inside this scope, so a click on the row moves the look.
 */
export function CycleScope({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<Record<string, number>>({});
  const advance = useCallback((id: string, total: number) => setPositions((now) => ({ ...now, [id]: ((now[id] ?? 0) + 1) % total })), []);
  return <CycleContext value={{ positions, advance }}>{children}</CycleContext>;
}

/** The position of the cycling row `id` (counting from 0) and the function that moves it to the next. */
export function useCycle(id: string, total: number): [number, () => void] {
  const cycles = useContext(CycleContext);
  if (!cycles) throw new Error("A cycling row or look must be inside a CycleScope");
  return [(cycles.positions[id] ?? 0) % total, () => cycles.advance(id, total)];
}

/** The function that steps a cycling row on, for a closer-look controller inside a CycleScope; null outside one. */
export function useCycleAdvance() {
  return useContext(CycleContext)?.advance ?? null;
}

/**
 * The row that cycles (docs/design/DESIGN.md, "The history row cycles"): on a wide screen with a pointer, clicking it, or
 * pressing Enter or Space, moves to the next of its `announcements` and says so politely; nothing opens or closes. On a
 * phone the closer-look controller owns the taps (the row has `data-look-tap`): the row opens and closes its look like any
 * other row, and only a tap on the look itself steps it on. The text of the row is the
 * same server-rendered markup as any plain row, so `children` is the row's content. The live region says nothing until
 * the position changes, so a page load announces nothing, and it says it however the step was made.
 */
export function CycleTrigger({ id, announcements, labelledBy, describedBy, children }: { id: string; announcements: string[]; labelledBy: string; describedBy: string; children: ReactNode }) {
  const [position, advance] = useCycle(id, announcements.length);
  const [cycled, setCycled] = useState(false);
  const last = useRef(position);
  useEffect(() => {
    if (position === last.current) return;
    last.current = position;
    setCycled(true);
  }, [position]);
  const wide = () => window.matchMedia(WIDE).matches;
  return (
    <>
      <div
        className="qi-row"
        role="button"
        tabIndex={0}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        data-look={id}
        data-look-tap={id}
        data-cycle=""
        onClick={() => wide() && advance()}
        onKeyDown={(event) => {
          if ((event.key !== "Enter" && event.key !== " ") || !wide()) return;
          event.preventDefault();
          advance();
        }}
      >
        {children}
      </div>
      <span className="sr-only" aria-live="polite">
        {cycled ? announcements[position] : ""}
      </span>
    </>
  );
}
