import { createElement, Fragment, type ReactNode } from "react";
import type { PersonalSignal } from "../../integrations/types";

export type PresentedSignal = Pick<PersonalSignal, "state" | "statusLabel"> & {
  updatedAt?: string | null;
};

export type SignalSource = {
  label: string;
  href?: string | null;
};

function isCached(signal: PresentedSignal) {
  return /cached/i.test(signal.statusLabel);
}

export function formatSignalFreshness(signal: PresentedSignal) {
  if (isCached(signal)) return "Cached for seven days";
  if (signal.state === "pending") return "Awaiting connection";
  if (!signal.updatedAt || signal.state === "unavailable") return "Stable fallback";

  const date = new Date(signal.updatedAt);
  if (Number.isNaN(date.getTime())) return "Freshness unavailable";

  return `Updated ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date)}`;
}

export function SignalStatus({ signal }: { signal: PresentedSignal }) {
  return createElement(
    "span",
    { className: "signal-status", "data-state": signal.state },
    signal.statusLabel,
  );
}

export function SignalFreshness({
  signal,
  className = "signal-freshness",
}: {
  signal: PresentedSignal;
  className?: string;
}) {
  return createElement("span", { className }, formatSignalFreshness(signal));
}

export function SignalFootnote({
  signal,
  source,
  className = "signal-footnote",
}: {
  signal: PresentedSignal;
  source: SignalSource;
  className?: string;
}) {
  const sourceElement = source.href
    ? createElement(
        "a",
        { href: source.href, target: "_blank", rel: "noreferrer" },
        source.label,
        createElement("span", { className: "arrow-mark", "aria-hidden": true }, "↗︎"),
      )
    : createElement("span", null, source.label);

  return createElement(
    "div",
    { className },
    sourceElement,
    createElement(SignalFreshness, { signal }),
  );
}

export function SignalPresentation({
  signal,
  source,
  children,
}: {
  signal: PresentedSignal;
  source: SignalSource;
  children?: ReactNode;
}) {
  return createElement(
    Fragment,
    null,
    createElement(SignalStatus, { signal }),
    children,
    createElement(SignalFootnote, { signal, source }),
  );
}
