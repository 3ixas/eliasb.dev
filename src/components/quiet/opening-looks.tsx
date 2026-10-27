import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { PassPins } from "@/components/quiet/finished-pass";
import { opening, type RevealId } from "@/content/stretch/opening";

/*
 * The closer looks of the opening's reveal words (docs/design/DESIGN.md, "Closer looks"). Each shows a real
 * thing the sentence only names, and says nothing the Role story does not. They are server-rendered into the
 * controller's `looks`, so only the one being shown is in the page, and the cores' loop runs only while it is.
 */

/** A small seeded generator, so the illustrative paths are the same on every render and for every visitor. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PATHS = 13;
const STEPS = 24;
const SIM = { width: 280, height: 150 } as const;
/** The one path drawn in BNP green; the others are the fan around it. */
const HIGHLIGHT = 5;

/** Random walks from one starting level, fanning out as they go: simulated paths, nothing priced. */
const paths = (() => {
  const random = seeded(7);
  return Array.from({ length: PATHS }, () => {
    let y = SIM.height / 2;
    const points = Array.from({ length: STEPS + 1 }, (_, step) => {
      if (step > 0) y += (random() + random() - 1) * (7 + step * 0.9);
      y = Math.min(SIM.height - 8, Math.max(8, y));
      return `${((step / STEPS) * SIM.width).toFixed(1)} ${y.toFixed(1)}`;
    });
    return `M${points.join(" L")}`;
  });
})();

/** "pricing and risk engines": simulated paths on graph paper, fanning out from one level, with the caption that says they are illustrative. */
function Simulation() {
  const { caption, note } = opening.looks.engines;
  return (
    <figure className="qi-sim">
      <svg viewBox={`0 0 ${SIM.width} ${SIM.height}`} aria-hidden="true">
        {paths.map((d, index) => (
          <path key={d} d={d} className="qi-sim__path" data-highlight={index === HIGHLIGHT ? "" : undefined} style={{ "--i": index } as CSSProperties} />
        ))}
      </svg>
      <figcaption>
        {caption} <em>{note}</em>
      </figcaption>
    </figure>
  );
}

const CPU_CORES = 4;
const GPU_CORES = 24;

/** One chip package with its pins: a CPU with a few cores that take turns, a GPU with many that light at once. */
function Chip({ name, cores, kind }: { name: string; cores: number; kind: "cpu" | "gpu" }) {
  return (
    <div className={`qi-chip qi-chip--${kind}`}>
      <span className="qi-chip__name stretch-mono">{name}</span>
      <div className="qi-chip__cores">
        {Array.from({ length: cores }, (_, index) => (
          <i key={index} className="qi-core" style={{ "--i": index } as CSSProperties} />
        ))}
      </div>
    </div>
  );
}

/** "CPU and GPU": the two chips side by side, with the line about running the same tests on both. */
function Cores() {
  return (
    <figure className="qi-cores">
      <div className="qi-cores__chips">
        <Chip name="CPU" cores={CPU_CORES} kind="cpu" />
        <Chip name="GPU" cores={GPU_CORES} kind="gpu" />
      </div>
      <figcaption>{opening.looks.cores.caption}</figcaption>
    </figure>
  );
}

/** "digitisation competition": its Winner pin, the Résumé line, and the data load's two bars to scale, the longer shrinking to the shorter. */
function Competition() {
  const { pin, line, bars } = opening.looks.digitisation;
  const longest = Math.max(...bars.map((bar) => bar.amount));
  return (
    <div className="qi-competition">
      <PassPins pins={[pin]} />
      <p className="qi-competition__line">{line}</p>
      <div className="qi-bars">
        {bars.map(({ label, amount }, index) => (
          <div key={label} className="qi-bar" data-after={index > 0 ? "" : undefined}>
            <span className="qi-bar__fill" style={{ "--w": amount / longest } as CSSProperties} />
            <strong>{label}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

/** "Take Ownership award": the certificate, sliding up like a sheet of paper. */
function Certificate() {
  const { src, alt, width, height, caption } = opening.looks.ownership.certificate;
  return (
    <figure className="qi-certificate">
      <Image src={src} alt={alt} width={width} height={height} sizes="300px" loading="eager" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** The closer looks of the opening, keyed by the ids the reveal words carry. */
export function openingLooks(): Record<RevealId, ReactNode> {
  return { engines: <Simulation />, cores: <Cores />, digitisation: <Competition />, ownership: <Certificate /> };
}
