import Link from "next/link";

const concepts = [
  {
    slug: "living-editorial",
    number: "01",
    title: "Living Editorial",
    note: "Assured · warm · authored",
    description:
      "An editorial canvas led by language, proportion, and quiet surprises. Closest to the Commissioner reference.",
  },
  {
    slug: "cabinet-of-curiosities",
    number: "02",
    title: "Cabinet of Curiosities",
    note: "Tactile · inviting · personal",
    description:
      "A collection of projects, books, posters, and signals treated as objects worth picking up and exploring.",
  },
  {
    slug: "signals-and-systems",
    number: "03",
    title: "Signals & Systems",
    note: "Precise · alive · technical",
    description:
      "A living field of traces, states, and diagrams that makes complex systems understandable without becoming a dashboard.",
  },
] as const;

export default function ConceptIndex() {
  return (
    <main className="concept-index">
      <header className="index-header">
        <Link href="/" className="index-mark" aria-label="Elias B. concept study home">
          EB<span>26</span>
        </Link>
        <p>Private design study · September 2026</p>
      </header>

      <section className="index-intro" aria-labelledby="concept-title">
        <p className="eyebrow">Personal site 2.0</p>
        <h1 id="concept-title">
          Three ways into
          <br />
          <em>the same story.</em>
        </h1>
        <div className="index-intro-copy">
          <p>
            Each prototype uses the same entrance, project, current-life signals,
            and Library artifact. The comparison is about feeling and behavior,
            not different amounts of content.
          </p>
          <p className="index-instruction">Open each direction. Try both themes and a narrow window.</p>
        </div>
      </section>

      <ol className="concept-list">
        {concepts.map((concept) => (
          <li key={concept.slug}>
            <Link href={`/concepts/${concept.slug}`} className={`concept-card card-${concept.slug}`}>
              <span className="concept-number">{concept.number}</span>
              <span className="concept-card-main">
                <span className="concept-note">{concept.note}</span>
                <strong>{concept.title}</strong>
                <span className="concept-description">{concept.description}</span>
              </span>
              <span className="concept-arrow" aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ol>

      <footer className="index-footer">
        <p>Decision gate: evaluate each direction before combining them.</p>
        <Link href="https://github.com/3ixas/eliasb.dev">Repository ↗</Link>
      </footer>
    </main>
  );
}
