import { hero, socialImage } from "@/content/site";
import { ImageResponse } from "next/og";

export const alt = socialImage.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const { mark } = socialImage;

// Satori lays out flex boxes, not inline text, so the headline wraps word by
// word; "feel simple." stays together, as on the page.
const words = [
  ...hero.headline.lead.split(" ").map((word) => ({ word, emphasis: false })),
  { word: hero.headline.emphasis, emphasis: true },
];

/**
 * Newsreader, subset to the glyphs the card uses. The image is built once at
 * build time; if Google Fonts can't be reached, it falls back to the default
 * face rather than failing the build.
 */
async function newsreader(style: "normal" | "italic", text: string) {
  try {
    const axis = style === "italic" ? "1" : "0";
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@${axis},6..72,400&text=${encodeURIComponent(text)}`,
    ).then((response) => response.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    const response = url ? await fetch(url) : null;
    if (response?.ok) return { name: "Newsreader", data: await response.arrayBuffer(), style, weight: 400 as const };
  } catch {}
  console.warn(`opengraph-image: Newsreader (${style}) couldn't be loaded; the social image falls back to the default face.`);
  return null;
}

export default async function OpenGraphImage() {
  const fonts = (await Promise.all([
    newsreader("normal", `${hero.headline.lead} ${mark.before}${mark.slash}${mark.after}`),
    newsreader("italic", hero.headline.emphasis),
  ])).filter((font) => font !== null);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        color: "#1d1a16",
        fontFamily: "Newsreader",
        backgroundColor: "#efe8dc",
        backgroundImage:
          "radial-gradient(rgba(120, 90, 60, 0.07) 1px, transparent 1.2px), linear-gradient(118deg, #f5efe5 0%, #efe8dc 48%, #e7decf 100%)",
        backgroundSize: "7px 7px, 100% 100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 120,
          width: 820,
          display: "flex",
          flexWrap: "wrap",
          columnGap: 18,
          padding: "58px 60px 64px",
          backgroundColor: "#fbf7f0",
          borderRadius: 2,
          boxShadow: "4px 8px 8px rgba(70, 45, 20, 0.1), 32px 48px 80px -24px rgba(70, 45, 20, 0.3)",
          fontSize: 72,
          lineHeight: 1.05,
          letterSpacing: -1,
          transform: "rotate(-0.8deg)",
        }}
      >
        {words.map(({ word, emphasis }, index) => (
          <span key={index} style={emphasis ? { fontStyle: "italic", color: "#c94a22" } : undefined}>
            {word}
          </span>
        ))}
      </div>
      <svg width="60" height="72" viewBox="0 0 30 36" style={{ position: "absolute", left: 476, top: 86 }}>
        <ellipse cx="19" cy="24" rx="7" ry="3" fill="rgba(40, 25, 10, 0.3)" />
        <line x1="15" y1="14" x2="19" y2="25" stroke="#8c8276" strokeWidth="1.5" />
        <circle cx="15" cy="11" r="8.5" fill="#d9542c" />
        <circle cx="12.4" cy="8.4" r="2.6" fill="rgba(255, 255, 255, 0.55)" />
      </svg>
      <div style={{ position: "absolute", right: 64, bottom: 44, display: "flex", fontSize: 56 }}>
        {mark.before}
        <span style={{ color: "#c94a22" }}>{mark.slash}</span>
        {mark.after}
      </div>
    </div>,
    { ...size, fonts },
  );
}
