import type { PinKey } from "@/integrations/pin-rules";

/** The Board: the personal section's copy, approved in docs/content/copy/05-board.md. */
export const board = {
  kicker: "02 / Library",
  heading: { lead: "Some of what I’m into", emphasis: "lately." },
  /** Every pin says what it is to a stranger. */
  labels: {
    clipping: "The Weekly Curiosity",
    making: "Now making",
    github: "GitHub · the past year",
    training: "Training this week · via Strava",
    fantasy: "NFL fantasy",
    london: "Home, London",
    reading: "Now reading",
    film: "Last watched",
    playlist: "On repeat",
  } satisfies Record<PinKey, string>,
  fantasyWeek: (week: number) => `NFL fantasy · Week ${week}`,
  cultureCorner: "The culture corner",
  london: {
    src: "/signals/london-st-pauls.jpg",
    alt: "London skyline from the Thames, with St Paul’s Cathedral and the City beyond",
    width: 1280,
    height: 867,
    clockName: "The time in London",
    clockLabel: (time: string) => `The time in London: ${time}`,
  },
  states: {
    asOf: (date: string) => `as of ${date}`,
    photoComing: "photo coming",
  },
} as const;
