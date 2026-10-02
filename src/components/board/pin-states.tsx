import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { board } from "@/content/board";
import type { PinStatus } from "@/integrations/pin-rules";

/**
 * A pin's place on the Board, shown according to its status from the pin
 * rules: a pin with nothing current is taken down, leaving no gap; a stale pin
 * is sun-faded, with its "as of" date pencilled on a scrap of paper tucked
 * under it.
 */
export function PinSlot({
  status,
  className,
  style,
  children,
  ...data
}: {
  status: PinStatus;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Partial<Record<`data-${string}`, string>>) {
  if (status.kind === "removed") return null;

  return (
    <div {...data} data-pin-state={status.kind} className={`${status.kind === "stale" ? "board-stale" : ""} ${className ?? ""}`} style={style}>
      {children}
      {status.kind === "stale" && (
        <p className="board-as-of">
          <time dateTime={status.asOf.iso}>
            <span aria-hidden="true">{board.states.asOf(status.asOf.short)}</span>
            <span className="sr-only">{board.states.asOf(status.asOf.long)}</span>
          </time>
        </p>
      )}
    </div>
  );
}

/**
 * A pin's photo, or a blank polaroid saying "photo coming" when the photo is
 * missing. The placeholder keeps the photo's shape, so nothing shifts.
 */
export function PinPhoto({
  src,
  alt,
  width,
  height,
  sizes,
  className,
}: {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div data-photo="missing" className={`board-photo-coming ${className ?? ""}`} style={{ aspectRatio: `${width} / ${height}` }}>
        <p className="m-0 font-display text-lead italic">{board.states.photoComing}</p>
      </div>
    );
  }
  return <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className={`block h-auto w-full ${className ?? ""}`} />;
}
