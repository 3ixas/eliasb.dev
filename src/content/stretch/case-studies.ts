/*
 * The three case studies in the Stretch shape. Copy is from
 * docs/content/redesign-copy.md ("Case studies"); the figures and their alt
 * text and captions are carried over from the Board's old case files.
 */
import type { CaseStudySlug } from "../projects";
import type { CaseStudy } from "./case-study";

/** One study for every project that links to one: a missing or misspelt key does not compile. */
export const caseStudies: Record<CaseStudySlug, CaseStudy> = {
  threshold: {
    slug: "threshold",
    number: "01",
    stack: ["React 19", "TypeScript", "MapLibre"],
    sections: {
      "where-it-started": {
        heading: "The rent is the easy part.",
        paragraphs: [
          "My friends had no clear idea what renting would cost by area, and one of them was about to move to Switzerland. Most rent calculators stop at the monthly figure. Before you get the keys you might need five weeks’ deposit in London, or three months’ in Switzerland, plus the first month’s rent, moving costs, and furniture. Can I afford to move, and if not, how long until I can?",
        ],
      },
      "written-down-first": { heading: "The problem, on paper." },
      decisions: {
        heading: "Two totals and a straight answer.",
        points: [
          {
            lead: "Upfront and monthly stay separate.",
            text: "You can often afford the monthly costs long before you’ve saved the upfront ones.",
          },
          {
            lead: "The answer is one of three.",
            text: "Move now; not yet, and how many months of saving; or your income doesn’t cover the monthly costs.",
          },
          {
            lead: "Each city keeps its own rules.",
            text: "Different deposits, local charges, and transport passes, and every default can be changed.",
          },
          {
            lead: "Suggestions show what would help.",
            text: "A cheaper district, a smaller place, or a flatmate, and how much each would save.",
          },
        ],
        figure: {
          src: "/work/threshold/costs.webp",
          alt: "Threshold results showing upfront and monthly cost breakdowns",
          width: 2298,
          height: 1750,
          caption: "Upfront and monthly totals, kept apart.",
        },
      },
      "how-its-built": {
        heading: "The link is the save file.",
        paragraphs: [
          "Everything you choose lives in the URL: no account, no backend. The calculations are plain functions with no state of their own, covered by 182 tests. The maps use real boundaries: 33 London boroughs, Zurich’s 12 Kreise, and Basel in seven areas.",
        ],
        figure: {
          src: "/work/threshold/calculator.webp",
          alt: "Threshold calculator with a district map and scenario controls",
          width: 2296,
          height: 1748,
          caption: "The district map and the choices that drive the estimate.",
        },
      },
      "where-it-stands": {
        heading: "Used, not launched.",
        paragraphs: [
          "I used it during my own flat hunt, and friends have used it too. I didn’t record what changed from what they told me, and it isn’t launched or measured yet.",
        ],
      },
      "whats-next": {
        points: [
          {
            lead: "Keep the data fresh.",
            text: "Move the April 2026 snapshot to a scheduled refresh where the sources allow it.",
          },
          { lead: "Show the sources in the app.", text: "Link every default to its source." },
          { lead: "Finer areas in Basel.", text: "Use its 19 Wohnviertel rather than seven areas." },
        ],
      },
    },
    prd: {
      quote:
        "People in their 20s and 30s make the decision to move out … without a clear, honest view of what it will actually cost.",
      date: "16 April 2026",
    },
    evidence: [
      { value: "57", label: "user stories" },
      { value: "13", label: "slices, built in a day" },
      { value: "182", label: "tests" },
      { value: "3", label: "cities" },
    ],
    next: "argus-risk",
    description:
      "A rental calculator for London, Basel, and Zurich that shows what a move really costs: upfront, monthly, and how long until you can afford it.",
  },
  "argus-risk": {
    slug: "argus-risk",
    number: "02",
    stack: [".NET 8", "Kafka", "PostgreSQL", "SignalR"],
    note: "Runs locally with one Docker command.",
    sections: {
      "where-it-started": {
        heading: "A total doesn’t say how old it is.",
        paragraphs: [
          "I built this one on purpose. I work on pricing and risk systems, and I wanted to build a small version of that world end to end, with a front end that makes it easy to see. Most risk dashboards show a portfolio’s value, but not how old it is, which feed it came from, or whether the system is keeping up. Argus is a simulator: no real market data, and it runs on your machine.",
        ],
      },
      "written-down-first": { heading: "Two users, on paper." },
      decisions: {
        heading: "Show the number with its history.",
        points: [
          {
            lead: "Every change is an event.",
            text: "Replay them and you can see any position at any point in time.",
          },
          {
            lead: "Freshness sits next to the value.",
            text: "If a feed stalls, you see what failed and how old the number is.",
          },
          {
            lead: "The maths is plain functions.",
            text: "FIFO cost basis, P&L, and Value at Risk: same inputs, same answer.",
          },
          {
            lead: "Check the answer.",
            text: "A reconciliation run replays history and compares it with the live state.",
          },
        ],
        figure: {
          src: "/work/argus/positions.webp",
          alt: "Argus Risk positions table with live price and freshness data",
          width: 2854,
          height: 1716,
          caption: "Open positions, each with its live price and how fresh it is.",
        },
      },
      "how-its-built": {
        heading: "Four services and a stream.",
        paragraphs: [
          "Two simulators publish prices, FX rates, and trades to Kafka (Redpanda locally). The risk engine publishes a snapshot every second, and SignalR pushes it to a Next.js dashboard. Marten keeps position events in PostgreSQL, so history replays at up to 60 times speed.",
        ],
      },
      "where-it-stands": {
        heading: "Runs locally, not measured yet.",
        paragraphs: [
          "It only runs locally, so looking at it means cloning the repo. I designed for under 500 ms from a price change to the dashboard, but I haven’t measured it.",
        ],
      },
      "whats-next": {
        points: [
          { lead: "Measure the latency.", text: "Add a benchmark and publish the result." },
          { lead: "Make it easier to see.", text: "A recorded replay or a hosted read-only demo." },
          {
            lead: "Stress testing.",
            text: "Let you shock a currency or a sector and watch the portfolio react.",
          },
        ],
      },
    },
    prd: {
      lead: "The spec names the simulated user, a risk or portfolio manager, and the real audience:",
      quote: "hiring managers and engineers at banks, hedge funds, and trading firms",
    },
    evidence: [
      { value: "5", label: "currencies" },
      { value: "4", label: "services" },
      { value: "126", label: ".NET tests" },
      { value: "1", label: "command to run it" },
    ],
    next: "flowtime",
    description:
      "A local simulator for a multi-currency risk platform, where every number on the dashboard shows where it came from and how old it is.",
  },
  flowtime: {
    slug: "flowtime",
    number: "03",
    stack: ["Next.js", "TypeScript", "Service Worker"],
    sections: {
      "where-it-started": {
        heading: "Pomodoro kept cutting me off.",
        paragraphs: [
          "Twenty-five minutes in, the timer would cut me off mid-flow. Flowtime counts up while you focus, then sets a break in proportion. In a browser that has two catches: background tabs slow timers down, and closing the tab loses the session.",
        ],
      },
      "written-down-first": { heading: "The problem, on paper." },
      decisions: {
        heading: "Count from a fixed point, and ask instead of guessing.",
        points: [
          { lead: "Time comes from a timestamp,", text: "so a sleeping tab never loses minutes." },
          {
            lead: "The break follows the focus:",
            text: "a fifth by default, adjustable from a third to an eighth.",
          },
          {
            lead: "Every state has a name:",
            text: "six of them, so the interface always knows what to show.",
          },
          {
            lead: "Ask, don’t assume:",
            text: "come back to an unfinished session and Flowtime asks what to do.",
          },
        ],
      },
      "how-its-built": {
        heading: "Everything stays in your browser.",
        paragraphs: [
          "Sessions, tags, notes, and settings live on your device, with a CSV export. A service worker keeps it working offline. It works from the keyboard and announces changes to screen readers.",
        ],
      },
      "where-it-stands": {
        heading: "Used, not launched.",
        paragraphs: [
          "I use it for my own focused work, and friends have used it too. I didn’t record what changed from what they said, and it isn’t launched or measured yet.",
        ],
      },
      "whats-next": {
        points: [
          { lead: "Move between devices,", text: "keeping local storage as the default." },
          { lead: "Show when you focus best,", text: "like the time of day you tend to focus longest." },
        ],
      },
    },
    prd: {
      quote: "Practitioners manually time sessions with phone stopwatches, calculate break durations mentally.",
      after: "The spec’s test: finish a first full cycle within two minutes of landing.",
      date: "3 January 2026",
    },
    evidence: [
      { value: "6", label: "timer states" },
      { value: "189", label: "unit tests" },
      { value: "⅕", label: "default break" },
      { value: "2-minute", label: "first cycle (the target)" },
    ],
    next: "threshold",
    description:
      "A focus timer that counts up, sets breaks in proportion to your focus, and keeps your history on your device.",
  },
};

export const caseStudySlugs = Object.keys(caseStudies) as CaseStudySlug[];

/** The one checked lookup for a slug that comes from a URL, which is untrusted text. */
export function caseStudyFor(slug: string): CaseStudy | undefined {
  return Object.hasOwn(caseStudies, slug) ? caseStudies[slug as CaseStudySlug] : undefined;
}
