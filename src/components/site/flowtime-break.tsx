import type { CSSProperties } from "react";
import { MinuteTicks } from "@/components/parts/measure";
import { breakMinutes, flowtimeBreakCopy as copy, focusRange, pomodoro } from "@/content/stretch/flowtime-break";

const ID = "flowtime-break";
const SCALE = focusRange.max;

/**
 * One round's line: its name and minutes over a tick a minute on the slider's scale (#456's minutes). Flowtime's round
 * is #456's "after" (solid) and a Pomodoro's its "before" (soft): the way it was against the way Flowtime does it.
 */
function Round({ name, minutes, side, moved }: { name: string; minutes: number; side: "before" | "after"; moved?: boolean }) {
  return (
    <p className={side === "after" ? "cmp cmp--after" : "cmp"}>
      <span>{name}</span>
      <b>
        {/* Keyed by the minutes, so each change replays the wash behind a number that stays put. */}
        {moved && <i key={minutes} data-wash="" aria-hidden="true" />}
        {copy.minutes(minutes)}
      </b>
      <MinuteTicks scale={SCALE} amount={minutes} side={side} />
    </p>
  );
}

/**
 * Flowtime's break that follows how long you focused (#464, the case study's Decisions): a native range for the minutes
 * of focus, and Flowtime's focus and break drawn as minutes on the slider's one scale, solid, over a Pomodoro's fixed 25
 * and 5, soft. The server draws it at the start with the slider held still; the island (flowtime-break-live.tsx) draws
 * the same markup with its handler, so nothing moves when it takes over, and without script the drawing is the figure's
 * still at that example value. Once the slider has moved (`moved`), a changed number holds still on a working figure's
 * wash, without the fade a choice arrives with (story.css). The slider's value is written as Flowtime's Focus line and announced with its break; the ticks are pictures of the words.
 */
export function FlowtimeBreakView({ focus, moved, change }: { focus: number; moved?: boolean; change?: (minutes: number) => void }) {
  const rest = breakMinutes(focus);
  const filled = (focus - focusRange.min) / (focusRange.max - focusRange.min);
  return (
    <div className="ftbreak" data-live={change ? "" : undefined}>
      {/* Held still, as the server draws it and as a visitor without script sees it, the slider is a picture: no dead control is announced. */}
      <div className="ftbreak__control" aria-hidden={change ? undefined : true}>
        <label htmlFor={`${ID}-focus`}>{copy.slider}</label>
        <input
          id={`${ID}-focus`}
          className="ftbreak__range"
          type="range"
          min={focusRange.min}
          max={focusRange.max}
          step={1}
          value={focus}
          aria-valuetext={copy.valueText(focus, rest)}
          disabled={!change}
          onChange={change ? (event) => change(Number(event.currentTarget.value)) : undefined}
          style={{ "--filled": filled } as CSSProperties}
        />
      </div>
      <div className="ftbreak__rounds">
        <div className="ftbreak__round">
          <p className="ftbreak__name">{copy.flowtime}</p>
          <Round name={copy.focus} minutes={focus} side="after" moved={moved} />
          <Round name={copy.break} minutes={rest} side="after" moved={moved} />
        </div>
        <div className="ftbreak__round">
          <p className="ftbreak__name">{copy.pomodoro}</p>
          <Round name={copy.focus} minutes={pomodoro.focus} side="before" />
          <Round name={copy.break} minutes={pomodoro.rest} side="before" />
        </div>
      </div>
    </div>
  );
}
