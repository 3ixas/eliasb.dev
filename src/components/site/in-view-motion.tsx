"use client";

import { useEffect, type ReactNode } from "react";

export function InViewMotion({ children }: { children: ReactNode }) {
  return <div className="signal-motion" data-motion-reveal>{children}</div>;
}

export function SiteMotionObserver() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-motion-reveal]");
    if (!targets.length || !("IntersectionObserver" in window)) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-motion-entered", "true");
          currentObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const syncMotionPreference = () => {
      if (motionPreference.matches) {
        observer.disconnect();
        return;
      }

      targets.forEach((target) => {
        if (target.dataset.motionEntered !== "true") observer.observe(target);
      });
    };

    syncMotionPreference();
    motionPreference.addEventListener("change", syncMotionPreference);

    return () => {
      motionPreference.removeEventListener("change", syncMotionPreference);
      observer.disconnect();
    };
  }, []);

  return null;
}
