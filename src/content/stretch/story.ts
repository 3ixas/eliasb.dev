/*
 * The shapes a story page reads, whatever it tells the story of. A Case study
 * (a project) and a Role story (an employer) both open in a colour pair, run
 * through numbered sections and show an evidence strip, so those parts are
 * defined here once. Nothing in this module depends on a project or on the
 * project catalogue.
 */

/** A story's own colours: the band's field, the ink on it, and the accent swatch. */
export type StoryColours = { field: string; ink: string; swatch: string };

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
