import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Opening } from "@/components/site/opening";
import { LanyardStatus } from "./status";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/*
 * The 3D staff pass check page (#448, #514): the homepage's opening with its single BNP Paribas pass hanging in 3D,
 * and a line under it saying how far the scene got, so a phone with no console can show why it fell back to the printed
 * pass. Like the other fixtures it is absent in production; unlike them it is also served on Vercel's previews, where
 * Elias judges it.
 */
export default async function LanyardFixture() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1" && process.env.VERCEL_ENV !== "preview") notFound();

  return (
    <main id="main-content" tabIndex={-1} style={{ background: "var(--page)", color: "var(--ink)" }}>
      <Opening />
      <LanyardStatus />
    </main>
  );
}
