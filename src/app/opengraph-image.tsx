import { shareCard, sharePage, shareSize } from "@/app/share-card";
import { siteCopy } from "@/content/stretch/site-copy";

const { name, lead, emphasis } = siteCopy.socialImage;

export const alt = `${name}. ${lead} ${emphasis}`;
export const size = shareSize;
export const contentType = "image/png";

// Satori lays out flex boxes, not inline text, so the headline wraps word by
// word; "products of my own." stays together as the cobalt phrase.
const words = [
  ...lead.split(" ").map((word) => ({ word, accent: false })),
  { word: emphasis, accent: true },
];

/** The homepage's card, and the card of every page without its own: the opening line. */
export default function OpenGraphImage() {
  return shareCard({
    field: sharePage.field,
    ink: sharePage.ink,
    children: (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          columnGap: 22,
          fontSize: 92,
          lineHeight: 1.04,
          letterSpacing: -2.5,
        }}
      >
        {words.map(({ word, accent }, index) => (
          <span key={index} style={accent ? { color: sharePage.cobalt } : undefined}>
            {word}
          </span>
        ))}
      </div>
    ),
  });
}
