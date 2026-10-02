import type { CSSProperties, ReactNode } from "react";

/**
 * Where a fixing can hold an object. Nothing pinned, clipped, or taped floats:
 * each fixing only accepts surfaces it could physically attach to, so an
 * unattached fixing is a type error rather than a review comment.
 */
export type FixingSurfaces = {
  pushpin: "wall" | "linen";
  tape: "wall" | "linen" | "paper";
  clip: "paper";
  clipboard: "wall";
  string: "wall" | "linen";
  shelf: "wall";
  /** A sticky note's own adhesive strip. */
  adhesive: "wall" | "paper";
};

export type Fixing = keyof FixingSurfaces;
export type Surface = FixingSurfaces[Fixing];

export type PinObject = "card" | "photo" | "note" | "sheet" | "clipping" | "ticket" | "object";
export type PinStock = "paper" | "photo" | "ochre" | "blueprint" | "sage" | "terracotta" | "kraft" | "ticket" | "newsprint" | "none";

/** Careful pins (hero, Work) stay within ±0.5°; loose pins (Board, About) within ±3°. */
export type Looseness = "careful" | "loose";

const tiltLimits: Record<Looseness, number> = { careful: 0.5, loose: 3 };

const stockClasses: Record<PinStock, string> = {
  paper: "bg-paper text-ink",
  photo: "bg-paper-photo text-ink",
  ochre: "bg-stock-ochre text-ink",
  blueprint: "bg-stock-blueprint text-ink",
  sage: "bg-stock-sage text-ink",
  terracotta: "bg-stock-terracotta text-ink",
  kraft: "bg-stock-kraft text-ink",
  ticket: "bg-stock-ticket text-ink",
  newsprint: "bg-stock-newsprint text-ink",
  // An object with no paper of its own sits straight on the wall.
  none: "text-wall-ink",
};

type PinBaseProps = {
  object: PinObject;
  /** Degrees; clamped to the looseness tier, and to ±1.5° below 900 px. */
  tilt?: number;
  looseness: Looseness;
  stock?: PinStock;
  /** Horizontal position of the fixing along the top edge, as a percentage. */
  fixingAt?: number;
  /** Lifts and straightens on hover or focus, and squeezes on press. */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
};

export type PinProps = {
  [F in Fixing]: PinBaseProps & { fixing: F; surface: FixingSurfaces[F] };
}[Fixing];

export function clampTilt(tilt: number, looseness: Looseness) {
  const limit = tiltLimits[looseness];
  return Math.min(limit, Math.max(-limit, tilt));
}

export function Pin({
  object,
  fixing,
  surface,
  tilt = 0,
  looseness,
  stock = "paper",
  fixingAt = 50,
  interactive = false,
  className,
  children,
}: PinProps) {
  const lifts = interactive ? "board-lifts" : "";
  const tiltDeg = `${clampTilt(tilt, looseness)}deg`;
  // On a clipboard, the board takes the tilt and the sheet sits square on it.
  const mounted = fixing === "clipboard";
  const style = { "--pin-tilt": mounted ? "0deg" : tiltDeg } as CSSProperties;

  const pin = (
    <div
      data-pin={object}
      data-fixing={fixing}
      data-surface={surface}
      data-looseness={looseness}
      data-stock={stock}
      className={`relative rounded-paper ${stockClasses[stock]} ${mounted ? "" : lifts} ${className ?? ""}`}
      style={style}
    >
      <FixingMark fixing={fixing} at={fixingAt} />
      {children}
    </div>
  );

  // A clipboard and a shelf are surfaces in their own right: they are drawn
  // around the object rather than on top of it.
  if (mounted) return <Clipboard tilt={tiltDeg} className={lifts}>{pin}</Clipboard>;
  if (fixing === "shelf") return <Shelf>{pin}</Shelf>;
  return pin;
}

function FixingMark({ fixing, at }: { fixing: Fixing; at: number }) {
  const left = { left: `${at}%` };
  switch (fixing) {
    case "pushpin":
      return <Pushpin className="absolute -top-4 z-10 -translate-x-1/2" style={left} />;
    case "string":
      return <Pushpin className="absolute -top-4 z-10 -translate-x-1/2" style={left} knot />;
    case "tape":
      return <Tape className="absolute -top-3 z-10 w-28 -translate-x-1/2 -rotate-3" style={left} />;
    case "clip":
      return <Paperclip className="absolute -top-7 z-10" style={left} />;
    case "adhesive":
      return <span aria-hidden="true" data-fixing-mark="adhesive" className="absolute inset-x-0 top-0 h-6 rounded-t-paper bg-(--sticky-adhesive)" />;
    case "clipboard":
    case "shelf":
      return null;
  }
}

function Clipboard({ children, tilt, className }: { children: ReactNode; tilt: string; className: string }) {
  return (
    <div
      data-board-surface="clipboard"
      data-pin-mount
      className={`relative rounded-board px-4 pt-12 pb-4 ${className}`}
      style={{
        "--pin-tilt": tilt,
        backgroundColor: "var(--clipboard)",
        backgroundImage: "var(--clipboard-grain)",
      } as CSSProperties}
    >
      <svg aria-hidden="true" data-fixing-mark="clipboard" width="120" height="44" viewBox="0 0 120 44" className="absolute -top-3 left-1/2 -translate-x-1/2">
        <rect x="10" y="10" width="100" height="30" rx="5" fill="var(--metal)" stroke="var(--metal-edge)" />
        <rect x="38" y="2" width="44" height="16" rx="8" fill="none" stroke="var(--metal-edge)" strokeWidth="4" />
        <rect x="16" y="16" width="88" height="4" rx="2" fill="var(--metal-shine)" />
      </svg>
      {children}
    </div>
  );
}

function Shelf({ children }: { children: ReactNode }) {
  return (
    <div data-board-surface="shelf" className="relative inline-flex flex-col items-center px-4">
      {children}
      <svg aria-hidden="true" data-fixing-mark="shelf" viewBox="0 0 200 34" preserveAspectRatio="none" className="h-8 w-full">
        <rect x="0" y="0" width="200" height="9" rx="1.5" fill="var(--shelf-wood)" />
        <path d="M36 9 v20 h4 M40 13 l14 0" stroke="var(--iron)" strokeWidth="3" fill="none" />
        <path d="M164 9 v20 h-4 M160 13 l-14 0" stroke="var(--iron)" strokeWidth="3" fill="none" />
      </svg>
    </div>
  );
}

export function Pushpin({ className, style, knot = false }: { className?: string; style?: CSSProperties; knot?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      data-fixing-mark={knot ? "string" : "pushpin"}
      width="30"
      height="36"
      viewBox="0 0 30 36"
      className={className}
      style={style}
    >
      {/*
        The needle, its shadow, and any string tied to it lean away from the
        light, mirrored about the pin's centre so the knot stays on the needle.
      */}
      <g style={{ transformOrigin: "15px 0", scale: "var(--light-side) 1" }}>
        <ellipse cx="19" cy="24" rx="7" ry="3" style={{ fill: "var(--shadow-pushpin)" }} />
        <line x1="15" y1="14" x2="19" y2="25" stroke="var(--pushpin-needle)" strokeWidth="1.5" />
        {knot && <path data-knot d="M17 22 q3 3 7 2" stroke="var(--string)" strokeWidth="1.6" fill="none" strokeLinecap="round" />}
      </g>
      <circle cx="15" cy="11" r="8.5" fill="var(--pushpin)" />
      <circle cx="12.4" cy="8.4" r="2.6" fill="var(--pushpin-shine)" />
    </svg>
  );
}

const tapeEdge =
  "polygon(0 8%,4% 0,9% 10%,14% 2%,86% 4%,91% 0,96% 9%,100% 3%,100% 92%,95% 100%,90% 90%,85% 98%,14% 96%,9% 100%,4% 91%,0 99%)";

export function Tape({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      data-fixing-mark="tape"
      className={`block h-7 ${className ?? ""}`}
      style={{ background: "var(--tape)", boxShadow: "var(--shadow-contact)", clipPath: tapeEdge, ...style }}
    />
  );
}

export function Paperclip({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      aria-hidden="true"
      data-fixing-mark="clip"
      width="34"
      height="90"
      viewBox="0 0 34 90"
      className={className}
      style={{ filter: "var(--shadow-clip)", ...style }}
    >
      <path d="M10 60 L10 14 C10 6, 24 6, 24 14 L24 72 C24 84, 6 84, 6 72 L6 22" stroke="var(--metal-edge)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
