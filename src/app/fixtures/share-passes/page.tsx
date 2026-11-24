import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { StaffPass } from "@/components/parts/staff-pass";
import { roleStorySlugs } from "@/content/stretch/role-stories";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/*
 * Dev-only fixture rendering each employer's hanging StaffPass so `scripts/render-share-assets.mjs` can capture
 * transparent share-card stills after Role stories switched to compact embedded passes (R-52).
 */
export default async function SharePassesFixture() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1} style={{ display: "flex", gap: 48, padding: 48, background: "transparent" }}>
      {roleStorySlugs.map((slug) => (
        <div key={slug} data-share-pass={slug}>
          <StaffPass slug={slug} lead priority />
        </div>
      ))}
    </main>
  );
}
