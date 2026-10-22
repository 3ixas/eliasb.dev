import type { FastenerKind } from "@/content/projects";

/**
 * The one small prop on a tile's or a sheet's edge; decorative, so hidden from assistive technology.
 *
 * Surface rule: a Fastener fastens only what would be held to a surface, a tile or a sheet of paper
 * (GLOSSARY.md, "Fastener"). A card that is simply a card gets none, and at most one per object.
 * This is the only file that may write `stretch-fastener`; `pnpm verify:fastener` fails on any other.
 */
export function Fastener({ kind }: { kind: FastenerKind }) {
  if (kind === "paperclip") {
    return (
      <svg className="stretch-fastener stretch-fastener--paperclip" aria-hidden="true" width="34" height="86" viewBox="0 0 34 86" fill="none" stroke="#b8babd" strokeWidth="3" strokeLinecap="round">
        {/* The outside leg goes behind the paper at its top edge (y=22). */}
        <path d="M2 22 V16 a11 11 0 0 1 22 0 V70 a7 7 0 0 1 -14 0 V30" />
      </svg>
    );
  }
  return <span className={`stretch-fastener stretch-fastener--${kind}`} aria-hidden="true" />;
}
