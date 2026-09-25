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
        <Link href="/" className="index-mark" aria-label="Elias B. homepage">
          <span className="index-mark-brand" aria-hidden="true">
            <span>E</span>
            <span className="brand-slash">/</span>
            <span>B</span>
          </span>
          <span className="index-mark-version" aria-hidden="true">26</span>
        </Link>
        <p>Private design study · September 2026</p>
      </header>

      <section className="index-intro" aria-labelledby="concept-title">
        <p className="eyebrow">Personal site 2.0 · Direction selected</p>
        <h1 id="concept-title">
          Three ways into
          <br />
          <em>the same story.</em>
        </h1>
        <div className="index-intro-copy">
          <p>
            Cabinet of Curiosities is the selected direction, grounded by Living
            Editorial&apos;s hierarchy and restraint. The original comparison remains
            here as a record of the decision.
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
                <span className="concept-note">
                  {concept.slug === "cabinet-of-curiosities" && <b>Selected</b>}
                  {concept.note}
                </span>
                <strong>{concept.title}</strong>
                <span className="concept-description">{concept.description}</span>
              </span>
              <span className="concept-arrow arrow-mark" aria-hidden="true">↗︎</span>
            </Link>
          </li>
        ))}
      </ol>

      <footer className="index-footer">
        <p>Selected: Cabinet personality with Living Editorial discipline.</p>
        <Link href="https://github.com/3ixas/eliasb.dev">Repository <span className="arrow-mark" aria-hidden="true">↗︎</span></Link>
      </footer>
    </main>
  );
}
