import { newsreader } from "@/app/og-font";
import { siteCopy } from "@/content/stretch/site-copy";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

export const shareSize = { width: 1200, height: 630 };

/**
 * The light page, ink and cobalt from tokens.css, as plain values: Satori can't read custom properties or light-dark().
 * A card is always drawn in the light theme.
 */
export const sharePage = { field: "#eeede9", ink: "#141416", cobalt: "#2443d6" } as const;

/**
 * The one share card template (docs/design/DESIGN.md "Share cards", R-26): a field, the page's own words at the top in
 * Newsreader, and "ELIAS BENNETT" at the foot, on 1200 × 630 with the same margins everywhere. A page chooses its field,
 * its ink and its words; the frame, the margins, the type and the name never change.
 */
export async function shareCard({ field, ink, children }: { field: string; ink: string; children: ReactNode }) {
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
        fontFamily: "Newsreader",
        fontWeight: 400,
        backgroundColor: field,
      }}
    >
      {children}
      <div style={{ display: "flex", fontSize: 32, letterSpacing: 6 }}>{siteCopy.socialImage.name}</div>
    </div>,
    { ...shareSize, fonts: [await newsreader()] },
  );
}
