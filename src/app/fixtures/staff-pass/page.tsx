import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { StaffPass } from "@/components/site/staff-pass";
import { work } from "@/content/stretch/work";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Every state of the Staff pass, for the end-to-end suite and for looking at
 * before a section uses it: the current pass (largest, linking, wearing its
 * pins, leaning), two returned passes, the same pass as the opening object of
 * its own Role story (no link, no lean), and the self-issued pass. It exists
 * only when the server is started with BOARD_FIXTURES=1.
 */
export default async function StaffPassFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <div data-stretch-shell>
      <main id="main-content" tabIndex={-1} className="stretch-wrap">
        <h1 className="sr-only">Staff pass fixtures</h1>
        <div style={{ display: "grid", gap: 56, justifyItems: "center", padding: "48px 0" }}>
          <div data-fixture="current" style={{ width: "100%", maxWidth: 440 }}>
            <StaffPass slug="bnp-paribas" state="current" size="lg" tilt={-1} linked pins lean />
          </div>
          <div data-fixture="returned-joveen" style={{ width: "100%", maxWidth: 250 }}>
            <StaffPass slug="joveen" state="returned" size="sm" tilt={1.5} linked pins={false} lean />
          </div>
          <div data-fixture="returned-optegra" style={{ width: "100%", maxWidth: 250 }}>
            <StaffPass slug="optegra" state="returned" size="sm" tilt={-1.2} linked pins={false} lean />
          </div>
          <div data-fixture="opening" style={{ width: "100%", maxWidth: 440 }}>
            <StaffPass slug="bnp-paribas" state="current" size="lg" tilt={-1} linked={false} pins lean={false} />
          </div>
          <div data-fixture="self-issued" style={{ width: "100%", maxWidth: 440 }}>
            <StaffPass state="self-issued" title={work.headed.heading} line={work.headed.line} />
          </div>
        </div>
      </main>
    </div>
  );
}
