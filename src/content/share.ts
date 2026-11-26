import { siteName } from "@/content/site";
import { siteCopy } from "@/content/stretch/site-copy";

const { lead, emphasis } = siteCopy.socialImage;

export const headlineCardAlt = `${siteName}: ${lead} ${emphasis}`;

/**
 * The homepage's share card named outright, for the 404: global-not-found.tsx is drawn outside the root layout, so it
 * does not inherit the card the app directory adds there (#572).
 */
export const headlineCard = { url: "/opengraph-image", width: 1200, height: 630, type: "image/png", alt: headlineCardAlt };
