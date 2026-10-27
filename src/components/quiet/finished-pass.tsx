import { useId, type CSSProperties, type ReactNode } from "react";
import { CountUp } from "@/components/quiet/count-up";
import { passPhoto } from "@/content/stretch/media";
import { roleStories } from "@/content/stretch/role-stories";
import { roleStoryColours, type RoleStorySlug } from "@/content/stretch/role-story";
import { passHang, passRecords, passStatus } from "@/content/stretch/staff-pass";
import type { PinGlyph, WorkPin } from "@/content/stretch/work";

/*
 * The Staff pass as DESIGN.md's Finish section draws it: laminated card in CR80 proportions with a punched
 * slot, a woven strap and a metal clip, and enamel Pass pins. The mini pass is the 44 px object of an
 * employer's row; the full pass is its closer look. Both read the Role story's colours and the pass record,
 * so they cannot say more than the story does. The Role stories keep their own pass (staff-pass.tsx) until
 * the inner pages get the Finish.
 */

const passVars = (slug: RoleStorySlug) => {
  const { field, ink, swatch } = roleStoryColours(roleStories[slug].colours);
  return { "--pass-f": field, "--pass-i": ink, "--pass-s": swatch } as CSSProperties;
};

/** A swivel clip in metal: one SVG, so the object keeps its shape at any size. */
function Clip({ className }: { className: string }) {
  const id = useId();
  const [metal, metalV] = [`${id}-metal`, `${id}-metal-v`];
  return (
    <svg className={className} viewBox="0 0 34 30" aria-hidden="true">
      <defs>
        <linearGradient id={metal} x1="0" x2="1">
          <stop offset="0" stopColor="#5d6068" />
          <stop offset=".35" stopColor="#eef0f3" />
          <stop offset=".6" stopColor="#a3a6ad" />
          <stop offset="1" stopColor="#4f5259" />
        </linearGradient>
        <linearGradient id={metalV} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f4f5f7" />
          <stop offset="1" stopColor="#6b6e75" />
        </linearGradient>
      </defs>
      <rect x="9" y="0" width="16" height="9" rx="2" fill={`url(#${metal})`} />
      <path d="M10 3.5h14M10 6h14" stroke="rgb(0 0 0 / .25)" strokeWidth=".6" />
      <circle cx="17" cy="15" r="5.5" fill="none" stroke={`url(#${metalV})`} strokeWidth="2.4" />
      <path d="M17 20.5v6.5c0 1.5 1.2 2.5 2.6 2.5" fill="none" stroke={`url(#${metal})`} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** A barcode with a real bar rhythm (Code 128-like widths): the bars' offsets and widths, fixed so it never changes between renders. */
const barcode = (() => {
  let x = 0;
  const bars: { x: number; width: number }[] = [];
  for (const [index, digit] of [..."2112141312213212124113212121411314112131221231211231411231"].entries()) {
    const width = Number(digit) * 0.9;
    if (index % 2 === 0) bars.push({ x, width });
    x += width;
  }
  return { bars, width: x };
})();

function Barcode() {
  return (
    <svg className="qi-pass__barcode" viewBox={`0 0 ${barcode.width} 22`} preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
      {barcode.bars.map(({ x, width }) => (
        <rect key={x} x={x} y="0" width={width} height="22" />
      ))}
    </svg>
  );
}

/** The 44 px object of an employer's row: a 28 × 38 portrait pass on a short strap and clip, in the Employer colour. It has no marks of its own. */
export function MiniPass({ slug }: { slug: RoleStorySlug }) {
  return (
    <span className="qi-mini" style={passVars(slug)} data-pass-slug={slug}>
      <span className="qi-mini__strap" />
      <span className="qi-mini__clip" />
      <span className="qi-mini__card">
        <span className="qi-mini__photo" style={{ backgroundImage: `url(${passPhoto.src})` }} />
        <span className="qi-mini__lines" />
        <span className="qi-mini__bars" />
      </span>
    </span>
  );
}

/**
 * An employer's full pass: the card hangs from its strap and clip, with the employer's name as its wordmark,
 * the role and dates, its status, its headline figure and a barcode. A figure that is a number counts up from
 * `countFrom` as the pass arrives.
 */
export function FullPass({ slug, countFrom }: { slug: RoleStorySlug; countFrom?: number }) {
  const story = roleStories[slug];
  const record = passRecords[slug];
  const { value, label } = record.headline;
  const counted = /^(−?)(\d+)(%?)$/.exec(value);
  return (
    <figure className="qi-pass" style={passVars(slug)} data-pass-slug={slug}>
      <span className="qi-pass__strap" />
      <Clip className="qi-pass__clip" />
      <div className="qi-pass__card">
        <span className="qi-pass__slot" />
        <header className="qi-pass__head">
          <span className="qi-pass__wordmark stretch-display">{record.short}</span>
          <span className="qi-pass__number stretch-mono">Staff · {story.number}</span>
        </header>
        <div className="qi-pass__who">
          <span className="qi-pass__photo" style={{ backgroundImage: `url(${passPhoto.src})` }} />
          <span className="qi-pass__details">
            <strong className="qi-pass__role">{story.role}</strong>
            <span className="qi-pass__dates stretch-mono">{story.dates}</span>
            <span className="qi-pass__status stretch-mono">{passStatus(passHang[slug].state)}</span>
          </span>
        </div>
        <footer className="qi-pass__foot">
          <span className="qi-pass__figure">
            <strong className="stretch-display">
              {counted && countFrom !== undefined ? <CountUp from={countFrom} to={Number(counted[2])} prefix={counted[1]} suffix={counted[3]} /> : value}
            </strong>{" "}
            {label}
          </span>
          <Barcode />
        </footer>
        <i className="qi-pass__sheen" />
        <i className="qi-pass__holo" />
      </div>
    </figure>
  );
}

const glyphs: Record<PinGlyph, { colour: string; paths: ReactNode }> = {
  trophy: {
    colour: "#d9a521",
    paths: (
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 2.5h6v3.5a3 3 0 0 1-6 0Z" />
        <path d="M5 3.5H3a2 2 0 0 0 2 2.8M11 3.5h2a2 2 0 0 1-2 2.8M8 9v2.5M5.5 13.5h5" />
      </g>
    ),
  },
  key: {
    colour: "#3f5bff",
    paths: (
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="5.5" cy="8" r="2.8" />
        <path d="M8.3 8H14M12 8v2.2M14 8v1.6" />
      </g>
    ),
  },
  spark: { colour: "#8d63ff", paths: <path fill="currentColor" d="M8 1.5l1.5 4.2 4.2 1.5-4.2 1.5L8 13l-1.5-4.3L2.3 7.2l4.2-1.5Z" /> },
  gauge: {
    colour: "#e0742a",
    paths: (
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M2.5 11.5a5.5 5.5 0 1 1 11 0" />
        <path d="M8 11.5l3-4" />
      </g>
    ),
  },
  database: {
    colour: "#2f8f6b",
    paths: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="8" cy="4" rx="5" ry="2" />
        <path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" />
      </g>
    ),
  },
  phone: {
    colour: "#3f5bff",
    paths: (
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="4.5" y="1.5" width="7" height="13" rx="1.8" />
        <path d="M7 12.2h2" />
      </g>
    ),
  },
  tick: { colour: "#2f8f6b", paths: <path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" d="M3 8.5l3.2 3L13 4.5" /> },
  branch: {
    colour: "#8d63ff",
    paths: (
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="4.5" cy="3.5" r="1.6" />
        <circle cx="4.5" cy="12.5" r="1.6" />
        <circle cx="11.5" cy="5.5" r="1.6" />
        <path d="M4.5 5.1v5.8M11.5 7.1c0 2.4-2 3.4-5.6 4.1" />
      </g>
    ),
  },
};

/** Three enamel Pass pins with their glyphs, each with its label beside it: the same form for every employer. */
export function PassPins({ pins }: { pins: readonly WorkPin[] }) {
  return (
    <ul className="qi-pins">
      {pins.map(({ glyph, label, detail }) => (
        <li key={label} className="qi-pins__item">
          <span className="qi-pin" style={{ "--enamel": glyphs[glyph].colour } as CSSProperties}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              {glyphs[glyph].paths}
            </svg>
          </span>
          <span className="qi-pins__text">
            <strong>{label}</strong> {detail}
          </span>
        </li>
      ))}
    </ul>
  );
}
