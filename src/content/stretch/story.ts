/*
 * The shapes a story page reads, whatever it tells the story of. A Case study
 * (a project) and a Role story (an employer) both open in a colour pair, run
 * through numbered sections and show an evidence strip, so those parts are
 * defined here once. Nothing in this module depends on a project or on the
 * project catalogue.
 */

/** A story's own colours: the band's field, the ink on it, and the accent swatch. */
export type StoryColours = { field: string; ink: string; swatch: string };

/**
 * A panel's own colours (docs/design/DESIGN.md "Tokens"): its field and the ink on it at full strength. A coloured
 * panel keeps them in both themes.
 */
export type PanelColours = { field: string; ink: string };

const hexColour = /^#[0-9a-f]{6}$/;

/** WCAG 2.2 contrast between two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((at) => {
      const c = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Problems with a panel's colours, naming whose they are; empty when its ink holds AA (4.5:1) on its field. */
export function panelColourProblems(owner: string, panel: PanelColours | undefined): string[] {
  if (!panel || !hexColour.test(panel.field) || !hexColour.test(panel.ink)) return [`${owner} needs its panel colours (field and ink, as lower-case #rrggbb).`];
  const ratio = contrastRatio(panel.ink, panel.field);
  return ratio >= 4.5 ? [] : [`${owner}'s panel ink is ${ratio.toFixed(2)}:1 on its field; it needs 4.5:1.`];
}

export type SectionPoint = { lead: string; text: string };

/** What every numbered section can hold. A page adds what is specific to it, such as a figure. */
export type StorySectionBody = {
  /** The bold line that opens the section. Absent where the section label is the heading. */
  heading?: string;
  paragraphs?: readonly string[];
  /** Points that open with an italic lead, such as decisions. */
  points?: readonly SectionPoint[];
};

export type EvidenceItem = { value: string; label: string };

export const MAX_EVIDENCE = 4;

/** True when a section has something to read. */
export const storySectionHasContent = (section: StorySectionBody | undefined) =>
  Boolean(section && (section.heading || section.paragraphs?.length || section.points?.length));

/** Everything a story or study says, as plain text: its sections and its evidence strip. */
export const storyText = ({ sections, evidence }: { sections: Record<string, StorySectionBody>; evidence: readonly EvidenceItem[] }) =>
  [
    ...Object.values(sections).flatMap((section) => [section.heading, ...(section.paragraphs ?? []), ...(section.points ?? []).flatMap((point) => [point.lead, point.text])]),
    ...evidence.map((item) => `${item.value} ${item.label}`),
  ]
    .filter(Boolean)
    .join(" ");
