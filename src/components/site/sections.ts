import { siteCopy } from "@/content/stretch/site-copy";

/** The homepage's anchored sections after the hero, in order. Labels are the menu copy. */
export const sectionAnchors = ["work", "how-i-work", "where-ive-been", "off-the-clock", "say-hello"] as const;

export type SectionAnchor = (typeof sectionAnchors)[number];

export const sectionLinks = sectionAnchors.map((id, index) => ({ id, label: siteCopy.menu[index] }));

/** A section's label, by anchor, so nothing depends on its position in the menu. */
export const sectionLabel = Object.fromEntries(sectionLinks.map(({ id, label }) => [id, label])) as Record<SectionAnchor, string>;
