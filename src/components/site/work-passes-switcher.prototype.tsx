"use client";
/*
 * PROTOTYPE, throwaway (#194). The variant picker and the pass swing.
 * Never reaches production: the page only mounts this outside production.
 */
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function PrototypeSwitcher<V extends string>({
  current,
  variants,
  names,
}: {
  current: V | null;
  variants: readonly V[];
  names: Record<V, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const keys: (V | null)[] = [null, ...variants];
  const index = keys.indexOf(current);

  useEffect(() => {
    const go = (step: number) => {
      const next = keys[(index + step + keys.length) % keys.length];
      router.replace(next ? `${pathname}?variant=${next}#work` : `${pathname}#work`, { scroll: false });
    };
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable]")) return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const label = current ? `${current} · ${names[current]}` : "Today";
  const step = (by: number) => {
    const next = keys[(index + by + keys.length) % keys.length];
    router.replace(next ? `${pathname}?variant=${next}#work` : `${pathname}#work`, { scroll: false });
  };
  return (
    <div className="wp-switcher" role="toolbar" aria-label="Prototype variants">
      <button type="button" onClick={() => step(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>{label}</span>
      <button type="button" onClick={() => step(1)} aria-label="Next variant">
        →
      </button>
    </div>
  );
}

/**
 * The swing: on a fine pointer, a pass leans away from where the pointer
 * entered and settles back with an overshoot. Only a CSS variable changes, and
 * a CSS transition carries it, so a new entry retargets from wherever the
 * pass is rather than restarting.
 */
export function PassSwing() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;
    const hangs = Array.from(document.querySelectorAll<HTMLElement>("[data-pass]:not([data-flat])"));
    const cleanups = hangs.map((hang) => {
      let settle = 0;
      const onEnter = (event: PointerEvent) => {
        const box = hang.getBoundingClientRect();
        const from = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
        hang.style.setProperty("--pass-swing", `${(-from * 4).toFixed(2)}deg`);
        window.clearTimeout(settle);
        settle = window.setTimeout(() => hang.style.setProperty("--pass-swing", "0deg"), 180);
      };
      const onLeave = () => {
        window.clearTimeout(settle);
        hang.style.setProperty("--pass-swing", "0deg");
      };
      hang.addEventListener("pointerenter", onEnter);
      hang.addEventListener("pointerleave", onLeave);
      return () => {
        hang.removeEventListener("pointerenter", onEnter);
        hang.removeEventListener("pointerleave", onLeave);
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  });
  return null;
}
