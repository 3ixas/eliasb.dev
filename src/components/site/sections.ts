import { siteCopy } from "@/content/stretch/site-copy";

/** The homepage's anchored sections after the hero, in order: the menu copy, which pairs each anchor with its label. */
export const sectionLinks = siteCopy.menu;

export type SectionAnchor = (typeof siteCopy.menu)[number]["id"];

/** A section's label, by anchor, so nothing depends on its position in the menu. */
export const sectionLabel = Object.fromEntries(sectionLinks.map(({ id, label }) => [id, label])) as Record<SectionAnchor, string>;
