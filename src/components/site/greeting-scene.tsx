import type { GreetingKey } from "@/content/stretch/greeting";

/**
 * The greeting's small scene, one object for each line, drawn in a 30 × 22 box with one line weight and only as much
 * detail as reads at that size (#467): a terminal prompt for "Hello", a kettle for the morning, a clock a few minutes
 * short of five for the afternoon, a table lamp for the evening, and the moon with two stars for late. Each is at rest
 * in the markup, finished; shell.css plays its one arrival (the cursor blinks, steam rises, the minute hand ticks up,
 * the lamp's light comes on, the moon rocks as the stars come out) on load, and on hover or focus. The bulb, its
 * light and the clock's pivot are the only amber on the site (--sun); everything else takes the greeting's own
 * colour, and the prompt's cursor is cobalt.
 */
export function GreetingScene({ period }: { period: GreetingKey }) {
  return (
    <svg className="scene" viewBox="0 0 30 22" aria-hidden="true" focusable="false">
      {period === "hello" && (
        <>
          <path className="scene__ink" d="M7 6.5 12 11l-5 4.5" />
          <path className="scene__cursor" d="M15 16h8" />
        </>
      )}
      {period === "morning" && (
        <>
          <path className="scene__ink" d="M7.5 19.5h15l-2-7.4a3 3 0 0 0-2.9-2.2h-5.2a3 3 0 0 0-2.9 2.2z" />
          <path className="scene__ink" d="M8.6 15.4 4.2 10" />
          <path className="scene__ink" d="M11 9.9q4-6.4 8 0" />
          <path className="scene__steam" pathLength={1} d="M3.4 7.4c-1-1 1-2 0-3.6" />
        </>
      )}
      {period === "afternoon" && (
        <>
          <circle className="scene__ink" cx="15" cy="11" r="8.5" />
          <path className="scene__ink" d="M15 11l2.9 2.4" />
          <path className="scene__ink scene__minute" d="M15 11 12.7 5.9" />
          <circle className="scene__lit" cx="15" cy="11" r="1.3" />
        </>
      )}
      {period === "evening" && (
        <>
          <path className="scene__pool" d="M8.4 11.2h13.2L24.5 20h-19z" />
          <path className="scene__ink" d="M11.2 3.5h7.6l2.8 7.7H8.4z" />
          <path className="scene__ink" d="M15 11.2v7.3M11.5 19h7" />
          <circle className="scene__lit" cx="15" cy="12.4" r="1.5" />
        </>
      )}
      {period === "late" && (
        <>
          <path className="scene__ink scene__moon" d="M16.5 3.2a8 8 0 1 0 7.6 11.6 6.6 6.6 0 0 1-7.6-11.6Z" />
          <path className="scene__star" d="M5 3.4v4M3 5.4h4" />
          <path className="scene__star" d="M26 2.5v3M24.5 4h3" />
        </>
      )}
    </svg>
  );
}
