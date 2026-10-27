import type { GreetingKey } from "@/content/stretch/greeting";

/**
 * The greeting's small scene, drawn for 30 × 22 px. It is at rest in the markup; quiet-index.css moves its
 * parts when the greeting plays (on load, and on hover or focus), so the same shapes serve every state.
 * Before the browser has read its clock ("hello") there is no scene, only the room it will take.
 * The sun is the only amber on the site (--sun); the moon and stars take the greeting's own colour.
 */
export function GreetingScene({ period }: { period: GreetingKey }) {
  return (
    <svg className="qi-scene" viewBox="0 0 30 22" aria-hidden="true" focusable="false">
      {period === "late" && (
        <>
          <path className="qi-scene__moon" d="M17 3.5a7.5 7.5 0 1 0 6.5 11.2A6 6 0 0 1 17 3.5Z" />
          <circle className="qi-scene__star" cx="4" cy="5" r="1.2" />
          <circle className="qi-scene__star" cx="27" cy="3" r="1" />
          <circle className="qi-scene__star" cx="26" cy="17" r="1.1" />
        </>
      )}
      {(period === "morning" || period === "afternoon" || period === "evening") && (
        <>
          {/* Morning and evening happen at the horizon, so the sun is cut off by it. */}
          <clipPath id="qi-scene-sky">
            <rect x="-4" y="-4" width="38" height={period === "afternoon" ? 30 : 21} />
          </clipPath>
          <g clipPath="url(#qi-scene-sky)">
            <g className="qi-scene__rays">
              <path d="M15 1.5v2.5M15 18v2.5M4.5 11H7M23 11h2.5M7.6 3.6l1.8 1.8M20.6 16.6l1.8 1.8M7.6 18.4l1.8-1.8M20.6 5.4l1.8-1.8" />
            </g>
            <circle className="qi-scene__sun" cx="15" cy="11" r="5" />
          </g>
          {period !== "afternoon" && <path className="qi-scene__horizon" d="M0 17.5h30" />}
        </>
      )}
    </svg>
  );
}
