import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Work } from "@/components/site/work";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * #458's composition of the Work panels, before it reaches the homepage: Work as the homepage draws it, with the panels
 * in their composed state. It exists only when the server is started with BOARD_FIXTURES=1.
 */
export default async function WorkPanelsFixture() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();
  return (
    <main id="main-content" tabIndex={-1} style={{ minHeight: "100vh", background: "var(--page)", color: "var(--ink)", fontFamily: "var(--sans)", paddingBottom: 144 }}>
      <Work composed />
    </main>
  );
}
