import type { ChangeEvent } from "react";
import { CopyButton } from "@/components/site/copy-button";
import { OutLink } from "@/components/site/site-link";
import {
  THRESHOLD_ORIGIN,
  thresholdCities,
  thresholdLink,
  thresholdLinkCopy as copy,
  thresholdPlaces,
  type ThresholdChoice,
} from "@/content/stretch/threshold-link";

/** The link's three parts a choice writes. */
export type LinkPart = keyof ThresholdChoice;

const ID = "threshold-link";

/**
 * Threshold's link that rewrites itself (#462, R-54, the case study's How it's built): City, District and Place,
 * Threshold's own options, over the address bar they write, Copy link and Open this scenario. The server draws it at
 * its start (`thresholdStart`) with the choices held still; the island (threshold-link-live.tsx) draws the same markup
 * with `choose`, so the working figure takes the drawing's place without a pixel moving. A changed part of the link is
 * keyed by its value, so it arrives afresh each time (story.css). The link is an `output`, announced politely as it
 * changes. Both Copy link and Open this scenario read `thresholdLink(choice)` directly.
 */
export function ThresholdLinkView({ choice, changed = [], choose }: { choice: ThresholdChoice; changed?: readonly LinkPart[]; choose?: (part: LinkPart, value: string) => void }) {
  const city = thresholdCities.find(({ id }) => id === choice.city)!;
  const href = thresholdLink(choice);
  const on = (part: LinkPart) => (choose ? (event: ChangeEvent<HTMLSelectElement>) => choose(part, event.target.value) : undefined);
  const part = (name: LinkPart) => (
    <span key={`${name}-${choice[name]}`} className="tlink__part" data-new={changed.includes(name) ? "" : undefined}>
      {choice[name]}
    </span>
  );

  return (
    <div className="tlink" data-live={choose ? "" : undefined}>
      <div className="tlink__choices">
        <Choice id={`${ID}-city`} label={copy.city} value={choice.city} onChange={on("city")} options={thresholdCities.map(({ id, name }) => [id, name] as const)} />
        <Choice id={`${ID}-district`} label={copy.district} value={choice.district} onChange={on("district")} options={city.districts} />
        <Choice id={`${ID}-place`} label={copy.place} value={choice.place} onChange={on("place")} options={thresholdPlaces} />
      </div>
      <div className="tlink__bar">
        <output id={`${ID}-address`} className="tlink__address" htmlFor={`${ID}-city ${ID}-district ${ID}-place`}>
          <span className="tlink__host">{new URL(THRESHOLD_ORIGIN).host}</span>/{part("city")}?district={part("district")}&amp;type={part("place")}
        </output>
        <div className="tlink__actions">
          <CopyButton text={href} textId={`${ID}-address`} label={copy.copy} done={copy.copied} className="working-fig__control" />
          <OutLink href={href} label={copy.open} className="button tlink__open" />
        </div>
      </div>
    </div>
  );
}

/** One choice: its label over a native select, drawn as the page's outline control. Held still until the island works it. */
function Choice({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: readonly (readonly [string, string])[]; onChange?: (event: ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <div className="tlink__choice">
      <label htmlFor={id}>{label}</label>
      <span className="tlink__select">
        <select id={id} className="working-fig__control" value={value} onChange={onChange} disabled={!onChange}>
          {options.map(([option, name]) => (
            <option key={option} value={option}>
              {name}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
}
