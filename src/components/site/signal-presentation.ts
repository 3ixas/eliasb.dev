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

export function formatSignalFreshness(signal: PresentedSignal, authoredLabel?: string) {
  if (isCached(signal)) return "Cached for up to seven days";
  if (signal.state === "pending") return "Waiting to connect";
  if (signal.state === "unavailable") return "I couldn’t fetch a live update";
  if (!signal.updatedAt) return authoredLabel ?? "Saved details";

  const date = new Date(signal.updatedAt);
  if (Number.isNaN(date.getTime())) return "Update time unavailable";

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
  authoredLabel,
  className = "signal-freshness",
}: {
  signal: PresentedSignal;
  authoredLabel?: string;
  className?: string;
}) {
  return createElement("span", { className }, formatSignalFreshness(signal, authoredLabel));
}

export function SignalFootnote({
  signal,
  source,
  authoredLabel,
  className = "signal-footnote",
}: {
  signal: PresentedSignal;
  source: SignalSource;
  authoredLabel?: string;
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
    createElement(SignalFreshness, { signal, authoredLabel }),
  );
}

export function SignalPresentation({
  signal,
  source,
  authoredLabel,
  children,
}: {
  signal: PresentedSignal;
  source: SignalSource;
  authoredLabel?: string;
  children?: ReactNode;
}) {
  return createElement(
    Fragment,
    null,
    createElement(SignalStatus, { signal }),
    children,
    createElement(SignalFootnote, { signal, source, authoredLabel }),
  );
}
