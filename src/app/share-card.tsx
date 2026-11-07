import { bricolage } from "@/app/og-font";
import { siteCopy } from "@/content/stretch/site-copy";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

export const shareSize = { width: 1200, height: 630 };

/**
 * The one share card template (docs/design/DESIGN.md, "Share cards"): a field, the page's own words at the top in
 * Bricolage 800, and Elias's name at the foot. A page chooses its field, its ink and its words; the frame, the
 * margins, the type and the name never change. Satori can't read custom properties or light-dark(), so colours are
 * plain values (the light pair).
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
        fontFamily: "Bricolage",
        fontWeight: 800,
        backgroundColor: field,
      }}
    >
      {children}
      <div style={{ display: "flex", fontSize: 40, letterSpacing: 4 }}>{siteCopy.socialImage.name}</div>
    </div>,
    { ...shareSize, fonts: [await bricolage()] },
  );
}
