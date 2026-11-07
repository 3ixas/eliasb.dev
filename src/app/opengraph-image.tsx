import { shareCard, shareSize } from "@/app/share-card";
import { siteCopy } from "@/content/stretch/site-copy";

const { name, lead, emphasis } = siteCopy.socialImage;

export const alt = `${name}. ${lead} ${emphasis}`;
export const size = shareSize;
export const contentType = "image/png";

// The light page, ink and cobalt from stretch-tokens.css, as plain values
// because Satori can't read custom properties.
const page = "#fbfbf8";
const ink = "#111114";
const cobalt = "#2340ff";

// Satori lays out flex boxes, not inline text, so the headline wraps word by
// word; "products of my own." stays together as the cobalt phrase.
const words = [
  ...lead.split(" ").map((word) => ({ word, accent: false })),
  { word: emphasis, accent: true },
];

/** The homepage's card, and the card of every page without its own: the opening line. */
export default function OpenGraphImage() {
  return shareCard({
    field: page,
    ink,
    children: (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          columnGap: 20,
          fontSize: 98,
          lineHeight: 0.98,
          letterSpacing: -1,
          textTransform: "uppercase",
        }}
      >
        {words.map(({ word, accent }, index) => (
          <span key={index} style={accent ? { color: cobalt } : undefined}>
            {word}
          </span>
        ))}
      </div>
    ),
  });
}
