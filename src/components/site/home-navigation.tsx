"use client";

import { useEffect, useState } from "react";

const navigationItems = [
  { label: "Home", href: "#top", section: "top", selectors: [".selected-experience .hero"] },
  { label: "Work", href: "#work", section: "work", selectors: ["#work"] },
  { label: "Library", href: "#outside-work", section: "outside-work", selectors: ["#outside-work"] },
  { label: "About", href: "#about", section: "about", selectors: ["#about", "#contact"] },
] as const;

type NavigationSection = (typeof navigationItems)[number]["section"];

export function HomeNavigation() {
  const [activeSection, setActiveSection] = useState<NavigationSection>("top");

  useEffect(() => {
    const sections = navigationItems.flatMap(({ selectors, section }) =>
      selectors.flatMap((selector) => {
        const target = document.querySelector(selector);
        return target ? [{ target, section }] : [];
      }),
    );

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const visibility = new Map<Element, boolean>();
    let observer: IntersectionObserver | undefined;
    const observeSections = () => {
      observer?.disconnect();
      visibility.clear();
      const headerBottom = document
        .querySelector<HTMLElement>(".selected-experience > .site-header")
        ?.getBoundingClientRect().bottom ?? 80;
      const topMargin = Math.max(0, Math.min(headerBottom, 96));
      const bandHeight = Math.min(160, Math.max(0, window.innerHeight - topMargin));
      const bottomMargin = Math.max(0, window.innerHeight - topMargin - bandHeight);
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting));
          let current: (typeof sections)[number] | undefined;
          sections.forEach((section) => {
            if (visibility.get(section.target)) current = section;
          });
          if (current) setActiveSection(current.section);
        },
        { rootMargin: `-${Math.ceil(topMargin + 16)}px 0px -${bottomMargin}px 0px` },
      );
      sections.forEach(({ target }) => observer?.observe(target));
    };

    observeSections();
    window.addEventListener("resize", observeSections);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observeSections);
    };
  }, []);

  return (
    <nav aria-label="Primary navigation">
      {navigationItems.map((item) => (
        <a
          key={item.section}
          href={item.href}
          aria-current={activeSection === item.section ? "location" : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
