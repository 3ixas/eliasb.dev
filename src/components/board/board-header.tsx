"use client";

import { LazyPrefetchLink } from "@/components/board/lazy-prefetch-link";
import { LayoutGroup, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LightSwitch } from "@/components/board/light-switch";
import { springs } from "@/components/board/motion";
import { Pushpin } from "@/components/board/pin";
import { usePrefersReducedMotion } from "@/components/board/use-reduced-motion";

type Section = "work" | "outside-work" | "about";

const items: readonly { label: string; section: Section }[] = [
  { label: "Work", section: "work" },
  { label: "Library", section: "outside-work" },
  { label: "About", section: "about" },
];

// Contact belongs to About in the navigation.
const observedSections: readonly { id: string; section: Section }[] = [
  { id: "work", section: "work" },
  { id: "outside-work", section: "outside-work" },
  { id: "about", section: "about" },
  { id: "contact", section: "about" },
];

function sectionHref(id: string, isHome: boolean) {
  return isHome ? `#${id}` : `/#${id}`;
}

/**
 * The sticky header. On the home page the nav pin follows the section in view;
 * on other routes it marks the section the route belongs to, or none (`null`).
 */
export function BoardHeader({ page }: { page?: Section | null }) {
  const isHome = page === undefined;
  const reduced = usePrefersReducedMotion();
  const [inView, setInView] = useState<Section | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isHome || !("IntersectionObserver" in window)) return;
    const targets = observedSections.flatMap(({ id, section }) => {
      const element = document.getElementById(id);
      return element ? [{ element, section }] : [];
    });
    const visible = new Map<Element, boolean>();
    let observer: IntersectionObserver | undefined;

    // Watch a band just under the header; the last visible section wins.
    const observe = () => {
      observer?.disconnect();
      const top = Math.ceil(headerRef.current?.getBoundingClientRect().bottom ?? 80) + 16;
      const band = Math.min(160, Math.max(0, window.innerHeight - top));
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => visible.set(entry.target, entry.isIntersecting));
          let current: Section | null = null;
          targets.forEach(({ element, section }) => {
            if (visible.get(element)) current = section;
          });
          setInView(current);
        },
        { rootMargin: `-${top}px 0px -${Math.max(0, window.innerHeight - top - band)}px 0px` },
      );
      targets.forEach(({ element }) => observer?.observe(element));
    };

    observe();
    window.addEventListener("resize", observe);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, [isHome]);

  const current = isHome ? inView : page;

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <header
        ref={headerRef}
        data-board-header
        className="sticky top-0 z-50 border-b border-rule/60 bg-wall font-sans text-wall-ink"
      >
        <a
          className="board-focus absolute left-4 top-2 z-10 -translate-y-24 rounded-paper bg-paper px-4 py-3 text-ink shadow-pin focus:translate-y-0 focus-visible:shadow-(--shadow-focus)"
          href="#main-content"
        >
          Skip to content
        </a>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-8 lg:px-16">
          <LazyPrefetchLink
            href={isHome ? "#top" : "/"}
            aria-label="Elias Bennett, home"
            className="board-focus inline-flex min-h-11 min-w-11 items-center font-display text-title font-medium no-underline"
          >
            <span aria-hidden="true">E</span>
            <span aria-hidden="true" className="text-wall-accent">/</span>
            <span aria-hidden="true">B</span>
          </LazyPrefetchLink>

          <nav aria-label="Primary navigation">
            <LayoutGroup>
              <ul className="flex items-center gap-1 sm:gap-6">
                {items.map(({ label, section }) => {
                  const active = current === section;
                  return (
                    <li key={section} className="relative">
                      {active && (
                        <motion.span
                          layoutId="nav-pin"
                          data-nav-pin
                          aria-hidden="true"
                          className="pointer-events-none absolute -top-2 left-1/2 block -translate-x-1/2"
                          transition={springs.navPin}
                        >
                          <Pushpin className="h-4 w-auto" />
                        </motion.span>
                      )}
                      <LazyPrefetchLink
                        href={sectionHref(section, isHome)}
                        aria-current={active ? "location" : undefined}
                        className="board-focus inline-flex min-h-11 items-center px-1 text-body sm:px-2 font-medium text-wall-ink no-underline hover:underline hover:decoration-wall-accent hover:decoration-2 hover:underline-offset-4"
                      >
                        {label}
                      </LazyPrefetchLink>
                    </li>
                  );
                })}
              </ul>
            </LayoutGroup>
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <LightSwitch />
            <LazyPrefetchLink
              href={sectionHref("contact", isHome)}
              className="board-focus hidden min-h-11 items-center rounded-pill border-[1.5px] border-wall-ink px-5 text-body font-medium no-underline sm:inline-flex"
            >
              Say hello
            </LazyPrefetchLink>
          </div>
        </div>
      </header>
    </MotionConfig>
  );
}
