"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRef } from "react";

type ClosableDetailsProps = {
  className: string;
  contentClassName?: string;
  summary: ReactNode;
  children: ReactNode;
};

export function ClosableDetails({ className, contentClassName, summary, children }: ClosableDetailsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeFromContent(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;
    detailsRef.current?.removeAttribute("open");
  }

  return (
    <details ref={detailsRef} className={className}>
      <summary>{summary}</summary>
      <div className={contentClassName} onClick={closeFromContent}>
        {children}
        <button type="button" data-close-object onClick={() => detailsRef.current?.removeAttribute("open")}>
          Close object
        </button>
      </div>
    </details>
  );
}
