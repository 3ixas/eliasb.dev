/**
 * A mounted light. Lights are scenery: hidden from assistive technology and
 * never interactive. By day each is switched off and the window lights the
 * room; at night it is on and casts a pool of light. Its section names the
 * light's side with data-light, which turns the shadows away from it.
 *
 * Each section adds its own kind of light when it moves to the Board.
 */
export type LightKind = "desk-lamp" | "picture-light" | "festoon" | "fairy-lights" | "candle";

export function Light({ kind }: { kind: LightKind }) {
  switch (kind) {
    case "desk-lamp":
      return <DeskLamp />;
    case "picture-light":
      return <PictureLight />;
    case "festoon":
      return <Festoon />;
    case "fairy-lights":
      return <FairyLights />;
    case "candle":
      return <Candle />;
  }
}

/** A clamp desk lamp on an arm from the wall's upper right. */
function DeskLamp() {
  return (
    <div aria-hidden="true" inert data-light-fixture="desk-lamp" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute top-30 right-10 aspect-square w-[min(760px,90vw)] rounded-pill bg-(image:--lamp-pool) opacity-(--is-night)"
      />
      <svg
        width="230"
        height="210"
        viewBox="0 0 230 210"
        className="absolute top-4 right-0 origin-top-right scale-60 board:scale-100"
      >
        <path d="M230 34 L156 34 L126 76" stroke="var(--lamp-arm)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="156" cy="34" r="6" fill="var(--lamp-joint)" />
        <circle cx="126" cy="76" r="6" fill="var(--lamp-joint)" />
        <g transform="rotate(34 126 76)">
          <path d="M98 80 L154 80 L168 130 L84 130 Z" fill="var(--lamp-shade)" stroke="var(--lamp-shade-edge)" strokeWidth="2" />
          <ellipse cx="126" cy="130" rx="42" ry="7" fill="var(--lamp-bulb)" />
          <ellipse
            cx="126"
            cy="132"
            rx="60"
            ry="14"
            className="fill-(--lamp-glow) opacity-(--is-night) blur-sm"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * A brass picture light screwed to the wall above a project. At night its
 * beam falls across the screenshot and a soft wash lights the wall; the note
 * in front catches the same light on its paper (the board-lit class).
 * Its section sets data-light="above", so shadows fall straight down.
 */
function PictureLight() {
  return (
    <div aria-hidden="true" inert data-light-fixture="picture-light" className="pointer-events-none absolute inset-0">
      <div className="absolute -inset-x-[12%] top-8 -bottom-24 bg-(image:--picture-wash) opacity-(--is-night)" />
      <div className="absolute -inset-x-[5%] top-12 -bottom-16 z-20 bg-(image:--picture-beam) opacity-(--is-night) mix-blend-screen [clip-path:polygon(32%_0,68%_0,100%_100%,0_100%)]" />
      <svg width="420" height="70" viewBox="0 0 420 70" className="absolute top-0 left-1/2 z-30 w-[min(420px,80%)] -translate-x-1/2 overflow-visible">
        <line x1="210" y1="0" x2="210" y2="30" stroke="var(--brass-edge)" strokeWidth="4" />
        <circle cx="210" cy="4" r="7" fill="var(--brass)" stroke="var(--brass-edge)" />
        <rect x="20" y="30" width="380" height="18" rx="9" fill="var(--brass)" stroke="var(--brass-edge)" strokeWidth="1.5" />
        <rect x="36" y="44" width="348" height="5" rx="2.5" fill="var(--brass-lip)" />
      </svg>
    </div>
  );
}

// Festoon bulbs hang along a sagging wire, so each sits a little lower towards the middle.
const festoonBulbs = Array.from({ length: 9 }, (_, index) => {
  const along = (index + 0.5) / 9;
  return { left: `${along * 100}%`, top: 6 + Math.round(18 * Math.sin(Math.PI * along)) };
});

/**
 * The Board's two lights hang on its frame. A festoon string runs across the
 * top and pools light at the top right; at night the bulbs glow.
 */
function Festoon() {
  return (
    <div aria-hidden="true" inert data-light-fixture="festoon" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-(image:--festoon-pool) opacity-(--is-night)" />
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-x-0 -top-2 h-10 w-full overflow-visible">
        <path d="M0 2 Q50 46 100 2" fill="none" stroke="var(--light-wire)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {festoonBulbs.map(({ left, top }) => (
        <span key={left} className="board-festoon-bulb absolute -translate-x-1/2" style={{ left, top }} />
      ))}
    </div>
  );
}

// A loose wire wound down the corner, and the bulbs along it.
const fairyWire = "M97 2 C78 12 100 28 86 38 S94 62 78 70 S88 90 66 93 S36 88 22 95 S6 94 2 98";
const fairyBulbs = [
  [97, 2], [88, 18], [90, 36], [86, 52], [80, 68], [84, 82], [70, 92], [52, 91], [36, 90], [20, 95], [6, 96],
] as const;

/** Fairy lights wound down the Board's bottom-right corner. */
function FairyLights() {
  return (
    <div aria-hidden="true" inert data-light-fixture="fairy-lights" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-(image:--fairy-pool) opacity-(--is-night)" />
      <svg viewBox="0 0 100 100" className="board-fairy-lights absolute -right-2 -bottom-2 size-[min(280px,45%)] overflow-visible">
        <path d={fairyWire} fill="none" stroke="var(--light-wire)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {fairyBulbs.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" />
        ))}
      </svg>
    </div>
  );
}

/**
 * About's light: a candle on a small wall shelf on iron brackets, beside a
 * row of book spines. Unlit by day; at night the flame is lit with a soft
 * glow and a gentle flicker, which holds still with reduced motion.
 */
function Candle() {
  return (
    <div aria-hidden="true" inert data-light-fixture="candle" className="pointer-events-none relative h-[150px] w-[260px]">
      {/* Lit at night only; the inner layer flickers, so the flicker can't relight it by day. */}
      <div className="absolute -top-32 left-[30px] size-[300px] opacity-(--is-night)">
        <div className="board-candle-glow board-candle-flicker size-full rounded-pill" />
      </div>
      {/* Book spines, leaning a little at the end of the row. */}
      <div className="absolute bottom-[16px] left-0 flex items-end gap-0.5">
        <span className="board-spine h-[100px] w-[20px] bg-[#6e3b2a]" />
        <span className="board-spine h-[88px] w-[17px] bg-[#2f4b5e]" />
        <span className="board-spine h-[94px] w-[23px] bg-[#4b5e3a]" />
        <span className="board-spine h-[84px] w-[18px] origin-bottom-left rotate-[8deg] bg-[#8a6a3a]" />
      </div>
      <svg width="120" height="150" viewBox="40 30 80 180" className="absolute right-4 bottom-[16px] h-[134px] w-auto overflow-visible">
        <g className="board-candle-flame opacity-(--is-night)">
          <g className="board-candle-flicker">
            <ellipse cx="80" cy="70" rx="16" ry="30" fill="rgb(255 200 120 / 0.35)" />
            <path d="M80 44 C 92 62, 90 80, 80 88 C 70 80, 68 62, 80 44 Z" fill="#ffd27a" />
            <path d="M80 60 C 86 70, 85 80, 80 84 C 75 80, 74 70, 80 60 Z" fill="#fff3d6" />
          </g>
        </g>
        <line x1="80" y1="84" x2="80" y2="96" stroke="#2a2420" strokeWidth="2.5" />
        <rect x="62" y="96" width="36" height="104" rx="3" fill="#f3ead9" />
        <path d="M62 102 C 70 98, 76 108, 84 100 C 90 96, 94 104, 98 100 L98 96 L62 96 Z" fill="#e7dcc7" />
        <ellipse cx="80" cy="206" rx="34" ry="8" fill="#a88a58" />
        <rect x="58" y="196" width="44" height="12" rx="3" fill="#b8995f" />
      </svg>
      {/* The shelf on its iron brackets. */}
      <div className="board-shelf absolute right-0 bottom-0 left-[-8px] h-4 rounded-[2px]" />
      <svg width="40" height="54" viewBox="0 0 40 54" className="absolute top-full left-6">
        <path d="M2 0 L38 0 L2 50 Z" fill="var(--iron)" />
      </svg>
      <svg width="40" height="54" viewBox="0 0 40 54" className="absolute top-full right-6">
        <path d="M2 0 L38 0 L38 50 Z" fill="var(--iron)" />
      </svg>
    </div>
  );
}
