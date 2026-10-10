import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const pairs = [
  { name: "ink-on-page", surface: "page", colour: "ink" },
  { name: "muted-on-page", surface: "page", colour: "muted" },
  { name: "cobalt-on-page", surface: "page", colour: "cobalt" },
  { name: "ink-on-card", surface: "card", colour: "ink" },
  { name: "muted-on-card", surface: "card", colour: "muted" },
  { name: "cobalt-on-card", surface: "card", colour: "cobalt" },
  { name: "on-cobalt-on-cobalt", surface: "cobalt", colour: "on-cobalt" },
] as const;

/**
 * Every Stretch text pair on the surface it is used on, for the end-to-end
 * suite. It exists only when the server is started with BOARD_FIXTURES=1.
 */
export default async function StretchTokenFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <h1>Stretch tokens</h1>
      {pairs.map(({ name, surface, colour }) => (
        <p
          key={name}
          data-pair={name}
          style={{ background: `var(--stretch-${surface})`, color: `var(--stretch-${colour})`, padding: 16 }}
        >
          {name}
        </p>
      ))}
      <div
        data-tile-edge
        style={{ background: "var(--stretch-card)", border: "1px solid var(--stretch-tile-edge)", padding: 16 }}
      >
        A tile edge
      </div>
    </main>
  );
}
