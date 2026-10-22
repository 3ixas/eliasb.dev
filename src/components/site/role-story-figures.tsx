import Image from "next/image";
import type { CSSProperties } from "react";
import type { RoleStoryFigure } from "@/content/stretch/role-story";
import { Fastener } from "@/components/site/fastener";

/** The figure a Role story attaches to a section: a flag, a to-scale before-and-after, a certificate, or screenshots of a public page. */
export function RoleStoryFigureBlock({ figure }: { figure: RoleStoryFigure }) {
  switch (figure.kind) {
    case "flag":
      return <FlagFigure figure={figure} />;
    case "scale":
      return <ScaleFigure figure={figure} />;
    case "certificate":
      return <CertificateFigure figure={figure} />;
    case "screens":
      return <ScreensFigure figure={figure} />;
  }
}

/** One path is live ("on"); the new one sits behind a toggle that is off. */
function FlagFigure({ figure }: { figure: Extract<RoleStoryFigure, { kind: "flag" }> }) {
  return (
    <figure className="stretch-role-figure stretch-role-flag">
      <div className="stretch-role-flag__row">
        <span className="stretch-role-flag__path">{figure.live}</span>
        <span className="stretch-role-flag__on stretch-mono">on</span>
      </div>
      <div className="stretch-role-flag__row">
        <span className="stretch-role-flag__path">{figure.toggled}</span>
        <span className="stretch-role-flag__toggle" aria-hidden="true" />
        <span className="stretch-mono">{figure.state}</span>
      </div>
      <figcaption className="stretch-mono stretch-role-figure__caption">{figure.caption}</figcaption>
    </figure>
  );
}

/** Each row's bars share a unit: the before bar is the full width, the after bar is its share of it. */
function ScaleFigure({ figure }: { figure: Extract<RoleStoryFigure, { kind: "scale" }> }) {
  return (
    <figure className="stretch-role-figure stretch-role-scale">
      {figure.rows.map(({ what, before, after }) => (
        <div key={what} className="stretch-role-scale__row">
          <p className="stretch-role-scale__what">{what}</p>
          <ScaleBar kind="before" label={before.label} share={1} />
          <ScaleBar kind="after" label={after.label} share={after.amount / before.amount} />
        </div>
      ))}
      <figcaption className="stretch-mono stretch-role-figure__caption">{figure.caption}</figcaption>
    </figure>
  );
}

/** The fill is the bar, its share of the row; the label sits in the "before" fill and beside the short "after" one, wrapping when the column is narrow. */
function ScaleBar({ kind, label, share }: { kind: "before" | "after"; label: string; share: number }) {
  const text = (
    <span className="stretch-role-scale__label stretch-mono">
      {kind === "before" ? "Before" : "After"} · {label}
    </span>
  );
  return (
    <div className={`stretch-role-scale__bar stretch-role-scale__bar--${kind}`}>
      <span className="stretch-role-scale__fill" style={{ "--share": share } as CSSProperties}>
        {kind === "before" && text}
      </span>
      {kind === "after" && text}
    </div>
  );
}

/** The certificate whole: framed, taped, never tinted or cropped. */
function CertificateFigure({ figure }: { figure: Extract<RoleStoryFigure, { kind: "certificate" }> }) {
  return (
    <figure id={figure.id} tabIndex={-1} className="stretch-role-figure stretch-role-cert">
      <div className="stretch-role-cert__frame">
        <Fastener kind="tape" />
        <Image src={figure.src} alt={figure.alt} width={figure.width} height={figure.height} sizes="(min-width: 761px) 720px, 100vw" />
      </div>
      <figcaption className="stretch-mono stretch-role-figure__caption">{figure.caption}</figcaption>
    </figure>
  );
}

/** Screenshots of a public page, never edited: the caption says when, and links to where, they were taken. */
function ScreensFigure({ figure }: { figure: Extract<RoleStoryFigure, { kind: "screens" }> }) {
  return (
    <figure className="stretch-role-figure stretch-role-screens">
      <div className="stretch-role-screens__row">
        {figure.images.map(({ src, alt, width, height, device }) => (
          <div key={src} className={`stretch-role-screens__shot stretch-role-screens__shot--${device}`}>
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes={device === "phone" ? "(min-width: 761px) 160px, 24vw" : "(min-width: 761px) 540px, 72vw"}
            />
          </div>
        ))}
      </div>
      <figcaption className="stretch-mono stretch-role-figure__caption">
        {figure.caption} ·{" "}
        <a className="stretch-role-screens__source" href={figure.source.href}>
          {figure.source.label} <span aria-hidden="true">↗</span>
        </a>
      </figcaption>
    </figure>
  );
}
