import { rightPaddingFor, shareAsset, shareCard, sharePage, shareSize } from "@/app/share-card";
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

// Staggered drops matching the homepage opening (BNP Paribas first, largest and lowest; Joveen highest; Optegra middle).
const homepagePasses = [
  { file: "pass-bnp-paribas.png", width: 222, lift: -4 },
  { file: "pass-joveen.png", width: 202, lift: -72 },
  { file: "pass-optegra.png", width: 202, lift: -38 },
] as const;

/** The homepage's card, and the card of every page without its own: the opening line with the three staff passes. */
export default async function OpenGraphImage() {
  const loaded = await Promise.all(homepagePasses.map((pass) => shareAsset(pass.file)));
  const lastIndex = homepagePasses.length - 1;
  const paddingRight = rightPaddingFor(loaded[lastIndex], homepagePasses[lastIndex].width);

  return shareCard({
    field: sharePage.field,
    ink: sharePage.ink,
    children: (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          columnGap: 14,
          rowGap: 4,
          fontSize: 47,
          lineHeight: 1.12,
          letterSpacing: -1.4,
        }}
      >
        {chunks.map(({ text, accent }, index) => (
          <span key={index} style={accent ? { color: sharePage.cobalt } : undefined}>
            {text}
          </span>
        ))}
      </div>
    ),
    aside: (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          paddingRight,
          height: "100%",
          flexShrink: 0,
        }}
      >
        {homepagePasses.map((pass, index) => {
          const asset = loaded[index];
          const height = Math.round((pass.width * asset.height) / asset.width);
          return (
            <img
              key={pass.file}
              src={asset.src}
              alt=""
              width={pass.width}
              height={height}
              style={{
                marginTop: pass.lift,
                marginLeft: index === 0 ? 0 : -22,
              }}
            />
          );
        })}
      </div>
    ),
  });
}
