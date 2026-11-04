// PROTOTYPE, ticket "Which metadata typeface and Bricolage settings?". Never merge.
import { protoBric, protoMeta } from "./options";

const rows = [
  ["BNP Paribas", "Software engineer · Jul 2025 – now", "2026"],
  ["Argus Risk", "A risk simulator where every number shows its source and age.", "2026"],
  ["Risk Event Tracker", "A tested C# Web API for managing risk events.", "2025"],
];

function Rows() {
  return rows.map(([title, line, meta]) => (
    <div className="proto-sheet__row" key={title}>
      <div>
        <div className="qi-row__title">{title}</div>
        <div className="qi-row__line">{line}</div>
      </div>
      <span className="qi-row__meta stretch-mono">{meta}</span>
    </div>
  ));
}

export default function Page() {
  return (
    <main data-stretch-shell="" className="proto-sheet">
      <h2>Metadata, each with the row it sits in</h2>
      <div className="proto-sheet__grid">
        {protoMeta.map(([key, label]) => (
          <section key={key} className="proto-sheet__panel" data-proto-meta={key}>
            <span className="proto-sheet__label">{label}</span>
            <Rows />
            <p className="qi-row__meta stretch-mono">1,839 contributions in the past year · 2026 · 0123456789</p>
          </section>
        ))}
      </div>
      <h2>Bricolage: opening line, section title, rows</h2>
      <div className="proto-sheet__grid">
        {protoBric.map(([key, label]) => (
          <section key={key} className="proto-sheet__panel" data-proto-bric={key}>
            <span className="proto-sheet__label">{label}</span>
            <p className="qi-opening__line">I build pricing and risk engines at BNP Paribas, and products of my own.</p>
            <p className="qi-title" style={{ marginTop: 24 }}>Work</p>
            <Rows />
          </section>
        ))}
      </div>
    </main>
  );
}
