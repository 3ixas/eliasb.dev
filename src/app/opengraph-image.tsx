import { hangingPassAside, shareCard, sharePage, shareSize } from "@/app/share-card";
import { opening } from "@/content/stretch/opening";
import { siteCopy } from "@/content/stretch/site-copy";

const { name, lead, emphasis } = siteCopy.socialImage;

export const alt = `${name}. ${lead} ${emphasis}`;
export const size = shareSize;
export const contentType = "image/png";

// Satori lays out flex boxes, not inline text, so the headline wraps chunk by chunk.
// Reuse opening.headlineRuns so marked phrases ("BNP Paribas", "products of my own.") stay unbroken,
// attaching any immediately following punctuation (e.g. the comma after BNP Paribas) to its phrase.
const chunks: { text: string; accent: boolean }[] = [];
for (const run of opening.headlineRuns) {
  if (run.mark) {
    chunks.push({ text: run.text, accent: run.mark === "emphasis" });
    continue;
  }
  const parts = run.text.split(" ").filter(Boolean);
  if (parts[0] && /^[,.;:!?]+$/.test(parts[0]) && chunks.length) {
    chunks[chunks.length - 1] = { ...chunks[chunks.length - 1], text: chunks[chunks.length - 1].text + parts.shift() };
  }
  for (const part of parts) chunks.push({ text: part, accent: false });
}

/** The homepage's card, and the card of every page without its own: the opening line with the current BNP Paribas staff pass. */
export default async function OpenGraphImage() {
  return shareCard({
    field: sharePage.field,
    ink: sharePage.ink,
    children: (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          columnGap: 16,
          rowGap: 4,
          fontSize: 58,
          lineHeight: 1.12,
          letterSpacing: -1.6,
        }}
      >
        {chunks.map(({ text, accent }, index) => (
          <span key={index} style={accent ? { color: sharePage.cobalt } : undefined}>
            {text}
          </span>
        ))}
      </div>
    ),
    aside: await hangingPassAside("pass-bnp-paribas.png"),
  });
}
