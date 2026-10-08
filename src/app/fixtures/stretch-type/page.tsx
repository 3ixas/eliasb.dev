import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Stretch display, body and mono text, for the end-to-end suite. The second
 * display line is the same text with the width axis reset, so the suite can
 * tell a condensed face from a fallback. It exists only when the server is
 * started with BOARD_FIXTURES=1.
 */
export default async function StretchTypeFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 className="stretch-display" data-sample="display" style={{ display: "inline-block", fontSize: 64 }}>
        Elias Bennett
      </h1>
      <p>
        <span className="stretch-display" data-sample="display-normal-width" style={{ display: "inline-block", fontSize: 64, fontStretch: "100%" }}>
          Elias Bennett
        </span>
      </p>
      <p data-sample="body">Body text in the page face.</p>
      <p className="stretch-mono" data-sample="mono">
        Metadata in mono, 2026
      </p>
    </main>
  );
}
