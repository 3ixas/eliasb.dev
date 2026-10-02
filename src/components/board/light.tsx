/**
 * A mounted light. Lights are scenery: hidden from assistive technology and
 * never interactive. By day each is switched off and the window lights the
 * room; at night it is on and casts a pool of light. Its section names the
 * light's side with data-light, which turns the shadows away from it.
 *
 * Each section adds its own kind of light when it moves to the Board.
 */
export type LightKind = "desk-lamp" | "picture-light";

export function Light({ kind }: { kind: LightKind }) {
  switch (kind) {
    case "desk-lamp":
      return <DeskLamp />;
    case "picture-light":
      return <PictureLight />;
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
