import { createElement, Fragment, type ReactNode } from "react";
import type { PersonalSignal } from "../../integrations/types";

export type PresentedSignal = Pick<PersonalSignal, "state" | "statusLabel"> & {
  updatedAt?: string | null;
};

export type SignalSource = {
  label: string;
  href?: string | null;
};

export function formatSignalFreshness(signal: PresentedSignal) {
  if (!signal.updatedAt) return null;

  const date = new Date(signal.updatedAt);
  if (Number.isNaN(date.getTime())) return null;

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
  const freshness = formatSignalFreshness(signal);
  return freshness ? createElement("span", { className }, freshness) : null;
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
