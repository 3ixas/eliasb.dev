"use client";

import { useSyncExternalStore, ViewTransition, type ReactNode } from "react";
import type { TitleTransitionName, TitleTransitionShare } from "@/components/parts/title-transition";

/** Mirrors the phone breakpoint in `src/app/work.css` (`@media (max-width: 719.98px)`). */
const PHONE_QUERY = "(max-width: 719.98px)";

function subscribePhone(onChange: () => void) {
  const media = window.matchMedia(PHONE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const isPhoneClient = () => window.matchMedia(PHONE_QUERY).matches;
const isPhoneServer = () => false;

/**
 * Activates a Work panel's shared title transition on whichever copy of the employer's name is visible at the current
 * width: `.panel__name` from 720 px, and the pass band's name on a phone (where `.panel__head` is visually hidden).
 * Keeps `<ViewTransition>` mounted on both copies (toggling `name` and `share` only) so hydration and resizes never
 * remount the underlying heading or pass-band DOM nodes, and only one copy carries the shared name at a time.
 */
export function WorkTitleTransition({
  name,
  share = "route-title",
  when,
  children,
}: {
  name: TitleTransitionName;
  share?: TitleTransitionShare;
  when: "desktop" | "phone";
  children: ReactNode;
}) {
  const phone = useSyncExternalStore(subscribePhone, isPhoneClient, isPhoneServer);
  const active = phone === (when === "phone");
  return (
    <ViewTransition name={active ? name : undefined} share={active ? share : "none"} default="none">
      {children}
    </ViewTransition>
  );
}
