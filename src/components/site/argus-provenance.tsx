import {
  ageText,
  argusProvenanceCopy as copy,
  convertedAt,
  formatUsd,
  pricedAt,
  isStale,
  unrealisedUsd,
  type ArgusPosition,
} from "@/content/stretch/argus-provenance";

const ID = "argus-provenance";
const panelId = (symbol: string) => `${ID}-${symbol.replace(/\W/g, "-")}`;

/**
 * Argus Risk's numbers with their history (#463, the case study's Decisions): three positions' unrealised P&L, each a
 * disclosure that opens the price tick it came from and how old that price is, and New event, which brings a new price
 * for the oldest. The server draws it closed with the controls held still; the island (argus-provenance-live.tsx) draws
 * the same markup with its handlers, so the working figure takes the drawing's place without a pixel moving. A changed
 * value is keyed by itself, so it arrives afresh (story.css). The age is text that the island updates once a second
 * while its number is open and on screen; it never animates.
 */
export function ArgusProvenanceView({
  positions,
  open = [],
  changed,
  announcement = "",
  toggle,
  newEvent,
}: {
  positions: readonly ArgusPosition[];
  open?: readonly string[];
  changed?: string;
  announcement?: string;
  toggle?: (symbol: string) => void;
  newEvent?: () => void;
}) {
  return (
    <div className="argus" data-live={toggle ? "" : undefined}>
      <p id={`${ID}-label`} className="argus__label">
        {copy.label}
      </p>
      <p id={`${ID}-description`} hidden>
        {copy.description}
      </p>
      <ul className="argus__rows" aria-labelledby={`${ID}-label`} aria-describedby={`${ID}-description`}>
        {positions.map((position) => {
          const { symbol, currency, age } = position;
          const value = formatUsd(unrealisedUsd(position));
          const isOpen = open.includes(symbol);
          const converted = convertedAt(currency);
          return (
            <li key={symbol} className="argus__row">
              <span className="argus__symbol">{symbol}</span>
              <button
                type="button"
                className="argus__value"
                aria-expanded={isOpen}
                aria-controls={panelId(symbol)}
                disabled={!toggle}
                onClick={toggle ? () => toggle(symbol) : undefined}
              >
                <span className="sr-only">{symbol} </span>
                <span key={value} data-new={changed === symbol ? "" : undefined}>
                  {value}
                </span>
                <span className="argus__chevron" aria-hidden="true" />
              </button>
              <dl id={panelId(symbol)} className="argus__source" hidden={!isOpen}>
                <div>
                  <dt>{copy.from}</dt>
                  <dd>
                    {copy.topic}
                    <span key={position.price} data-new={changed === symbol ? "" : undefined}>
                      {pricedAt(position)}
                    </span>
                    {converted && <span>{converted}</span>}
                  </dd>
                </div>
                <div>
                  <dt>{copy.age}</dt>
                  <dd>
                    <span>{ageText(age)}</span>
                    {isStale(age) && <b className="argus__stale">{copy.stale}</b>}
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
      <div className="argus__foot">
        <button type="button" className="button" disabled={!newEvent} onClick={newEvent}>
          {copy.newEvent}
        </button>
        <span className="sr-only" role="status">
          {announcement}
        </span>
      </div>
    </div>
  );
}
