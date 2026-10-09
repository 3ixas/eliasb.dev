import { siteCopy } from "@/content/stretch/site-copy";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const { name, lead, emphasis } = siteCopy.socialImage;

export const alt = `${name}. ${lead} ${emphasis}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The light page, ink and cobalt from stretch-tokens.css, as plain values
// because Satori can't read custom properties.
const page = "#fbfbf8";
const ink = "#111114";
const cobalt = "#2340ff";

// Satori lays out flex boxes, not inline text, so the headline wraps word by
// word; "feel simple." stays together as the cobalt phrase.
const words = [
  ...lead.split(" ").map((word) => ({ word, accent: false })),
  { word: emphasis, accent: true },
];

/**
 * Bricolage Grotesque at the site's display setting (75% width, weight 800,
 * optical size 96), pinned as a static TrueType file because Satori can't read
 * woff2 or variable axes. Read from disk, so the image never depends on
 * Google Fonts being reachable. The licence sits beside it.
 */
async function bricolage() {
  const data = await readFile(join(process.cwd(), "src/app/fonts/bricolage/og-display-800-condensed.ttf"));
  return { name: "Bricolage", data, style: "normal" as const, weight: 800 as const };
}

export default async function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px 68px",
        color: ink,
        fontFamily: "Bricolage",
        fontWeight: 800,
        backgroundColor: page,
      }}
    >
      <div style={{ display: "flex", fontSize: 40, letterSpacing: 4 }}>{name}</div>
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
    </div>,
    { ...size, fonts: [await bricolage()] },
  );
}
