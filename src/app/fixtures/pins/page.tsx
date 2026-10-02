import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Pin } from "@/components/board/pin";
import { BoardSurface } from "@/components/board/surface";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Every fixing on its surfaces, for the end-to-end suite. It exists only when
 * the server is started with BOARD_FIXTURES=1, which production never sets.
 */
export default async function PinFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 className="sr-only">Pin fixtures</h1>
      <BoardSurface kind="wall" className="grid gap-16 p-16 board:grid-cols-3">
        <Pin object="card" fixing="pushpin" surface="wall" looseness="careful" tilt={-0.4} className="p-8">Pushpin on the wall</Pin>
        <Pin object="photo" fixing="tape" surface="wall" looseness="loose" tilt={3} stock="photo" className="p-8">Tape on the wall</Pin>
        <Pin object="sheet" fixing="clipboard" surface="wall" looseness="careful" tilt={0.5} className="p-8">On a clipboard</Pin>
        <Pin object="object" fixing="shelf" surface="wall" looseness="loose" stock="none" className="p-8">On a shelf</Pin>
        <Pin object="note" fixing="string" surface="wall" looseness="loose" tilt={-2} stock="ochre" className="p-8">On the string</Pin>
        <Pin object="sheet" fixing="pushpin" surface="wall" looseness="loose" tilt={1} className="p-8">
          A sheet with a clipped photo
          <Pin object="photo" fixing="clip" surface="paper" looseness="loose" tilt={2} stock="photo" fixingAt={20} className="mt-8 p-6">
            Clipped to paper
          </Pin>
        </Pin>
      </BoardSurface>
      <BoardSurface kind="linen" className="grid gap-16 p-16 board:grid-cols-3">
        <Pin object="note" fixing="pushpin" surface="linen" looseness="loose" tilt={-3} stock="sage" className="p-8">Pushpin in linen</Pin>
        <Pin object="photo" fixing="tape" surface="linen" looseness="loose" tilt={2} stock="photo" className="p-8">Tape on linen</Pin>
        <Pin object="note" fixing="string" surface="linen" looseness="loose" tilt={1} stock="blueprint" className="p-8">String on linen</Pin>
      </BoardSurface>
    </main>
  );
}
