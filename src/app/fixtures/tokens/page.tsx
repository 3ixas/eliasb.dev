import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { CSSProperties } from "react";
import { opening } from "@/content/stretch/opening";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** tokens.css's colours, in the order DESIGN.md's table gives them. */
const colours = ["page", "paper", "ink", "muted", "hair", "tint", "cobalt", "green"] as const;
const yearLevels = ["year-0", "year-1", "year-2", "year-3", "year-4"] as const;

/** Every text colour on each surface that follows the theme. Hair and tint are never text, and green on the page is only an underline. */
const pairs = (["page", "paper"] as const).flatMap((surface) =>
  (["ink", "muted", "cobalt"] as const).map((colour) => ({ name: `${colour}-on-${surface}`, surface, colour })),
);

const serif: CSSProperties = { fontFamily: "var(--serif)", fontOpticalSizing: "auto", fontWeight: 400 };
const sans: CSSProperties = { fontFamily: "var(--sans)" };
const figures: CSSProperties = { fontVariantNumeric: "lining-nums tabular-nums" };

/** The scale in DESIGN.md "Type", each step in its face with its notes. */
const scale: { token: string; style: CSSProperties; text: string; measure?: true }[] = [
  { token: "opening", style: { ...serif, lineHeight: 1.05, letterSpacing: "-0.028em", textWrap: "balance" }, text: opening.headline },
  { token: "title", style: { ...serif, lineHeight: 0.95, letterSpacing: "-0.04em" }, text: "BNP Paribas" },
  { token: "section", style: { ...serif, lineHeight: 1 }, text: "Work" },
  { token: "panel", style: serif, text: "Joveen" },
  { token: "figure", style: { ...serif, ...figures, fontWeight: 500, lineHeight: 1 }, text: "−40%" },
  { token: "prose", style: { ...serif, lineHeight: 1.5 }, text: opening.support, measure: true },
  { token: "row", style: { ...serif, fontWeight: 500, letterSpacing: "-0.015em" }, text: "Home Secretary" },
  { token: "link", style: serif, text: "Everything I’ve built" },
  { token: "body", style: { ...sans, lineHeight: 1.5 }, text: opening.support, measure: true },
  { token: "ui", style: { ...sans, fontWeight: 500 }, text: "The BNP Paribas story" },
  { token: "small", style: sans, text: "Software engineer · Jul 2025 – now" },
  { token: "label", style: sans, text: "Valid · present" },
];

const label: CSSProperties = { ...sans, fontSize: "var(--type-label)", color: "var(--muted)" };
const section: CSSProperties = { display: "grid", gap: 16, paddingBlock: 48, borderTop: "1px solid var(--hair)" };

/**
 * The passes and panels tokens and type scale (tokens.css), on the page and on paper, for the end-to-end suite and
 * for a look in both themes. It follows the device setting or the theme a visitor chose. It exists only when the
 * server is started with BOARD_FIXTURES=1.
 */
export default async function TokenFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1} style={{ minHeight: "100vh", background: "var(--page)", color: "var(--ink)", ...sans }}>
      <div style={{ maxWidth: 1344, marginInline: "auto", paddingInline: "clamp(16px, 4vw, 32px)", paddingBlock: 64 }}>
        <h1 style={{ ...serif, fontSize: "var(--type-title)", lineHeight: 0.95, letterSpacing: "-0.04em", marginBottom: 48 }}>Tokens</h1>

        <section style={section} aria-label="Colours">
          <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16, listStyle: "none", padding: 0, margin: 0 }}>
            {[...colours, ...yearLevels].map((name) => (
              <li key={name} data-token={name} style={{ display: "grid", gap: 8 }}>
                <span style={{ height: 64, borderRadius: 16, background: `var(--${name})`, boxShadow: "inset 0 0 0 1px var(--hair)" }} />
                <span style={{ fontSize: "var(--type-small)" }}>{name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section style={section} aria-label="Text on each surface">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 16 }}>
            {(["page", "paper"] as const).map((surface) => (
              <div key={surface} style={{ display: "grid", gap: 4, padding: 24, borderRadius: 28, background: `var(--${surface})`, boxShadow: "inset 0 0 0 1px var(--hair)" }}>
                {pairs
                  .filter((pair) => pair.surface === surface)
                  .map(({ name, colour }) => (
                    <p key={name} data-pair={name} style={{ color: `var(--${colour})`, fontSize: "var(--type-body)", margin: 0, paddingBlock: 4 }}>
                      {colour} on {surface}
                    </p>
                  ))}
              </div>
            ))}
          </div>
        </section>

        <section style={section} aria-label="Type scale">
          {scale.map(({ token, style, text, measure }) => (
            // The label sits beside its sample where there is room and above it on a phone, where a display figure needs the whole width.
            <div key={token} style={{ display: "flex", flexWrap: "wrap", columnGap: 24, rowGap: 4, alignItems: "baseline" }}>
              <span style={{ ...label, flex: "0 0 120px" }}>{token}</span>
              <p data-type={token} style={{ ...style, fontSize: `var(--type-${token})`, margin: 0, flex: "1 1 280px", minWidth: 0, maxWidth: measure ? 560 : undefined }}>
                {text}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
