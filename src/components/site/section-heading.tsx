/** A section's giant condensed heading with its mono note. */
export function SectionHeading({ id, heading, note }: { id: string; heading: string; note?: string }) {
  return (
    <div className="stretch-section__head">
      <h2 id={id} className="stretch-display stretch-h2">
        {heading}
      </h2>
      {note && <p className="stretch-mono stretch-note">{note}</p>}
    </div>
  );
}
