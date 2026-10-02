/**
 * A mounted light. Lights are scenery: hidden from assistive technology and
 * never interactive. By day each is switched off and the window lights the
 * room; at night it is on and casts a pool of light. Its section names the
 * light's side with data-light, which turns the shadows away from it.
 *
 * Each section adds its own kind of light when it moves to the Board.
 */
export type LightKind = "desk-lamp";

export function Light({ kind }: { kind: LightKind }) {
  switch (kind) {
    case "desk-lamp":
      return <DeskLamp />;
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
