import type { ElementType, ReactNode } from "react";

/**
 * A surface pins can be fixed to. Every Pin names its surface, and the
 * rendered page always contains that surface around it, so tests can check
 * that nothing floats.
 */
export function BoardSurface({
  kind,
  as: Element = "div",
  className,
  children,
  ...rest
}: {
  kind: "wall" | "linen";
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Partial<Record<`aria-${string}` | "id" | "tabIndex", string | number>>) {
  return (
    <Element
      data-board-surface={kind}
      className={`board-surface board-surface-${kind} text-wall-ink ${className ?? ""}`}
      {...rest}
    >
      {children}
    </Element>
  );
}
