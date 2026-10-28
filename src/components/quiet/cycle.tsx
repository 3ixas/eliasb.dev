"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

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

/**
 * The row that cycles (docs/design/DESIGN.md, "The history row cycles"): clicking it, or pressing Enter or Space,
 * moves to the next of its `announcements` and says so politely; nothing opens or closes. The text of the row is
 * the same server-rendered markup as any plain row, so `children` is the row's content. The live region says
 * nothing until the first change, so a page load announces nothing.
 */
export function CycleTrigger({ id, announcements, labelledBy, describedBy, children }: { id: string; announcements: string[]; labelledBy: string; describedBy: string; children: ReactNode }) {
  const [position, advance] = useCycle(id, announcements.length);
  const [cycled, setCycled] = useState(false);
  const next = () => {
    advance();
    setCycled(true);
  };
  return (
    <>
      <div
        className="qi-row"
        role="button"
        tabIndex={0}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        data-look={id}
        data-cycle=""
        onClick={next}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          next();
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
