import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { LanyardStage } from "@/components/parts/lanyard/lanyard";
import { StaffPass } from "@/components/parts/staff-pass";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/*
 * The 3D staff pass's prototype (#448): the current pass hanging alone, to judge its weight, swing and print on a preview
 * before the homepage and the Role stories change. Like the other fixtures it is absent in production; unlike them it is
 * also served on Vercel's previews, where Elias judges each round.
 */
export default async function LanyardFixture() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1" && process.env.VERCEL_ENV !== "preview") notFound();

  return (
    <main id="main-content" tabIndex={-1} style={{ background: "var(--page)", color: "var(--ink)" }}>
      <h1 className="sr-only">Lanyard</h1>
      <LanyardStage className="lanyard--fixture">
        <StaffPass slug="bnp-paribas" lead priority />
      </LanyardStage>
    </main>
  );
}
