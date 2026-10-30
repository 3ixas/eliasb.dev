import type { GreetingKey } from "@/content/stretch/greeting";

/**
 * The greeting's small scene, drawn for 30 × 22 px, one object for each line: a terminal prompt for "Hello", a kettle
 * for the morning, a clock a few minutes short of five for the afternoon, a desk lamp for the evening and the moon
 * and stars for late. Each is at rest in the markup, finished; quiet-header.css plays it (steam curls, the minute
 * hand ticks up, the lamp's pool fades in, the cursor blinks, the moon rocks) on load, and on hover or focus.
 * The bulb, the lamp's pool and the clock's pivot are the only amber on the site (--sun); everything else takes
 * the greeting's own colour, and the prompt's cursor is cobalt.
 */
export function GreetingScene({ period }: { period: GreetingKey }) {
  return (
    <svg className="qi-scene" viewBox="0 0 30 22" aria-hidden="true" focusable="false">
      {period === "hello" && (
        <>
          <path className="qi-scene__ink" d="M5.5 5.8 12 11 5.5 16.2" />
          <path className="qi-scene__cursor" d="M15 17.2h9.5" />
        </>
      )}
      {period === "morning" && (
        <>
          <path className="qi-scene__horizon" d="M0 20.5h30" />
          <path className="qi-scene__ink" d="M8.5 20.5h10.5v-6.5q0-3.6-5.2-3.6T8.5 14z" />
          <path className="qi-scene__ink" d="M8.5 15 4.5 12M19 13q4.5 0 4.5 3.6T19 20" />
          <circle className="qi-scene__dot" cx="13.8" cy="8.6" r="1.1" />
          <path className="qi-scene__steam" pathLength={1} d="M3.6 9c-1.2-1.2 1.2-2.4 0-4" />
        </>
      )}
      {period === "afternoon" && (
        <>
          <circle className="qi-scene__ink" cx="15" cy="11" r="8" />
          <path className="qi-scene__tick" d="M15 4v1.4M15 16.6V18M8 11h1.4M20.6 11H22" />
          <path className="qi-scene__ink" d="M15 11l2.3 3.2" />
          <path className="qi-scene__ink qi-scene__minute" d="M15 11 11.7 5.3" />
          <circle className="qi-scene__lit" cx="15" cy="11" r="1.1" />
        </>
      )}
      {period === "evening" && (
        <>
          <path className="qi-scene__horizon" d="M0 20.5h30" />
          <path className="qi-scene__pool" d="M9.2 11 2.5 20.5H17z" />
          <path className="qi-scene__ink" d="M11 20.5h9M15.5 20.5V13.5L9.6 8.4" />
          <path className="qi-scene__ink" d="M6.4 4.4 12.4 8.2 9.6 12.2 3.8 8.4z" />
          <circle className="qi-scene__lit" cx="9.2" cy="9.4" r="1.9" />
        </>
      )}
      {period === "late" && (
        <>
          <path className="qi-scene__moon" d="M17 3.5a7.5 7.5 0 1 0 6.5 11.2A6 6 0 0 1 17 3.5Z" />
          <circle className="qi-scene__star" cx="4" cy="5" r="1.2" />
          <circle className="qi-scene__star" cx="27" cy="3" r="1" />
          <circle className="qi-scene__star" cx="26" cy="17" r="1.1" />
        </>
      )}
    </svg>
  );
}
