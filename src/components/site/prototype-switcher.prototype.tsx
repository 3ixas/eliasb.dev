"use client";
/*
 * PROTOTYPE, throwaway (#200). The variant picker, as on prototype/work-passes.
 * Never reaches production: the page only mounts it outside production.
 */
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function PrototypeSwitcher<V extends string>({
  current,
  variants,
  names,
  anchor,
}: {
  current: V | null;
  variants: readonly V[];
  names: Record<V, string>;
  anchor: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const keys: (V | null)[] = [null, ...variants];
  const index = keys.indexOf(current);
  const step = (by: number) => {
    const next = keys[(index + by + keys.length) % keys.length];
    router.replace(next ? `${pathname}?variant=${next}#${anchor}` : `${pathname}#${anchor}`, { scroll: false });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="hp-switcher" role="toolbar" aria-label="Prototype variants">
      <button type="button" onClick={() => step(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>{current ? `${current} · ${names[current]}` : "Today"}</span>
      <button type="button" onClick={() => step(1)} aria-label="Next variant">
        →
      </button>
    </div>
  );
}
