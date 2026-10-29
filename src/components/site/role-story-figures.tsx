import Image from "next/image";
import type { CSSProperties } from "react";
import { ShrinkOnView } from "@/components/site/shrink-on-view";
import type { RoleStoryFigure } from "@/content/stretch/role-story";

/**
 * The figure a Role story argues from, inline at column width on the card surface with its caption beneath
 * (DESIGN.md rule 7): a flag, a to-scale before-and-after, or screenshots of a public page. A certificate is a
 * real thing the sentence only names, so it is a closer look on that word and is not drawn here.
 */
export function RoleStoryFigureBlock({ figure }: { figure: RoleStoryFigure }) {
  switch (figure.kind) {
    case "flag":
      return <FlagFigure figure={figure} />;
    case "scale":
      return <ScaleFigure figure={figure} />;
    case "screens":
      return <ScreensFigure figure={figure} />;
    case "certificate":
      return null;
  }
}

/** One path is live ("on"); the new one sits behind a toggle that is off. */
function FlagFigure({ figure }: { figure: Extract<RoleStoryFigure, { kind: "flag" }> }) {
  return (
    <figure className="qi-figure qi-flag">
      <div className="qi-figure__card">
        <div className="qi-flag__row">
          <span className="qi-flag__path">{figure.live}</span>
          <span className="qi-flag__on stretch-mono">on</span>
        </div>
        <div className="qi-flag__row">
          <span className="qi-flag__path">{figure.toggled}</span>
          <span className="qi-flag__toggle" aria-hidden="true" />
          <span className="qi-flag__state stretch-mono">{figure.state}</span>
        </div>
      </div>
      <figcaption className="qi-figure__caption stretch-mono">{figure.caption}</figcaption>
    </figure>
  );
}

/** Each row's bars share a unit: the before bar is the full width, the after bar is its share of it, and it shrinks to that once as it scrolls into view (ShrinkOnView). */
function ScaleFigure({ figure }: { figure: Extract<RoleStoryFigure, { kind: "scale" }> }) {
  return (
    <figure className="qi-figure qi-scale">
      <ShrinkOnView className="qi-figure__card">
        {figure.rows.map(({ what, before, after }) => (
          <div key={what} className="qi-scale__row">
            <p className="qi-scale__what">{what}</p>
            <ScaleBar kind="before" label={before.label} share={1} />
            <ScaleBar kind="after" label={after.label} share={after.amount / before.amount} />
          </div>
        ))}
      </ShrinkOnView>
      <figcaption className="qi-figure__caption stretch-mono">{figure.caption}</figcaption>
    </figure>
  );
}

function ScaleBar({ kind, label, share }: { kind: "before" | "after"; label: string; share: number }) {
  return (
    <div className="qi-scale__bar" data-kind={kind}>
      <span className="qi-scale__label stretch-mono">
        {kind === "before" ? "Before" : "After"} · {label}
      </span>
      <span className="qi-scale__track">
        <span className="qi-scale__fill" style={{ "--share": share } as CSSProperties} />
      </span>
    </div>
  );
}

/** Screenshots of a public page, never edited: the link beneath says what and when they are, and goes to where they were taken. */
function ScreensFigure({ figure }: { figure: Extract<RoleStoryFigure, { kind: "screens" }> }) {
  return (
    <figure className="qi-figure qi-screens">
      <div className="qi-screens__row">
        {figure.images.map(({ src, alt, width, height, device }) => (
          <div key={src} className="qi-screens__shot" data-device={device}>
            <Image src={src} alt={alt} width={width} height={height} sizes={device === "phone" ? "(min-width: 761px) 130px, 24vw" : "(min-width: 761px) 430px, 72vw"} />
          </div>
        ))}
      </div>
      <figcaption className="qi-figure__caption stretch-mono">
        <a className="qi-screens__source" href={figure.source.href}>
          {figure.source.label} <span aria-hidden="true">↗</span>
        </a>
      </figcaption>
    </figure>
  );
}
