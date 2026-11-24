import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { newsreader } from "@/app/og-font";
import { siteCopy } from "@/content/stretch/site-copy";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

export const shareSize = { width: 1200, height: 630 };

/** The outer margins of every share card (docs/design/DESIGN.md "Share cards and favicon"). */
export const shareMargins = { top: 64, side: 80, bottom: 68 } as const;

/**
 * The light page, ink and cobalt from tokens.css, as plain values: Satori can't read custom properties or light-dark().
 * A card is always drawn in the light theme.
 */
export const sharePage = { field: "#eeede9", ink: "#141416", cobalt: "#2443d6" } as const;

type ManifestAsset = { width: number; height: number; shadowPadX?: number; fingerprint: string };
type ShareManifest = { version: number; assets: Record<string, ManifestAsset> };

let manifestPromise: Promise<ShareManifest> | undefined;
function readManifest(): Promise<ShareManifest> {
  if (!manifestPromise) {
    manifestPromise = readFile(join(process.cwd(), "public/share/manifest.json"), "utf8").then(
      (text) => JSON.parse(text) as ShareManifest,
    );
  }
  return manifestPromise;
}

export type LoadedShareAsset = { src: string; width: number; height: number; shadowPadX: number };

const assetCache = new Map<string, Promise<LoadedShareAsset>>();

/** Reads a committed PNG and its manifest dimensions from public/share/ for Satori, cached per file name. */
export function shareAsset(name: string): Promise<LoadedShareAsset> {
  let pending = assetCache.get(name);
  if (!pending) {
    pending = Promise.all([readFile(join(process.cwd(), "public/share", name), "base64"), readManifest()]).then(
      ([base64, manifest]) => {
        const entry = manifest.assets[name];
        if (!entry) throw new Error(`Share asset "${name}" is missing from public/share/manifest.json.`);
        return {
          src: `data:image/png;base64,${base64}`,
          width: entry.width,
          height: entry.height,
          shadowPadX: entry.shadowPadX ?? 0,
        };
      },
    );
    assetCache.set(name, pending);
  }
  return pending;
}

/** Right padding that places a rendered asset's visual right edge on the 80 px frame margin (absorbing any transparent shadow padding). */
export function rightPaddingFor(asset: LoadedShareAsset, displayWidth: number): number {
  const scaledShadow = (asset.shadowPadX * displayWidth) / asset.width;
  return Math.max(0, Math.round(shareMargins.side - scaledShadow));
}

const hangingPassWidth = 334;

/** Single hanging Staff pass aside shared by the homepage and Role story share cards (R-26, R-44). */
export async function hangingPassAside(file: string): Promise<ReactNode> {
  const pass = await shareAsset(file);
  const passHeight = Math.round((hangingPassWidth * pass.height) / pass.width);
  const paddingRight = rightPaddingFor(pass, hangingPassWidth);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        paddingRight,
        height: "100%",
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori ImageResponse renders raw <img> elements */}
      <img
        src={pass.src}
        alt=""
        width={hangingPassWidth}
        height={passHeight}
        style={{ marginTop: -38 }}
      />
    </div>
  );
}

/**
 * The one share card template (docs/design/DESIGN.md "Share cards and favicon", R-26, #469, R-44): a field, the page's own
 * words at the top in Newsreader, "ELIAS BENNETT" at the foot, and an optional object beside the words (the current BNP
 * Paribas staff pass on the homepage, the employer's pass on a Role story, the project's screenshot on a case study), on
 * 1200 × 630 with the same 64 × 80 × 68 px margins everywhere.
 */
export async function shareCard({
  field,
  ink,
  children,
  aside,
}: {
  field: string;
  ink: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        color: ink,
        fontFamily: "Newsreader",
        fontWeight: 400,
        backgroundColor: field,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingTop: shareMargins.top,
          paddingBottom: shareMargins.bottom,
          paddingLeft: shareMargins.side,
          paddingRight: aside ? 32 : shareMargins.side,
        }}
      >
        {children}
        <div style={{ display: "flex", fontSize: 32, letterSpacing: 6 }}>{siteCopy.socialImage.name}</div>
      </div>
      {aside}
    </div>,
    { ...shareSize, fonts: [await newsreader()] },
  );
}
