import { siteCopy } from "@/content/stretch/site-copy";

const { name, lead, emphasis } = siteCopy.socialImage;

/**
 * The homepage's share card, for the pages that take it (the archive and the Résumé) in their own `openGraph` and
 * `twitter` metadata, which would otherwise drop the card Next links for the root (docs/design/DESIGN.md, "Share cards").
 */
export const headlineCard = { url: "/opengraph-image", width: 1200, height: 630, alt: `${name}. ${lead} ${emphasis}` };
