/*
 * Case studies as opened case-file folders, filed in the work drawer. Copy
 * approved in docs/content/copy/03-threshold.md and
 * docs/content/copy/04-case-files-and-drawer.md.
 */

export type CaseFileSlug = "threshold" | "argus-risk" | "flowtime";

export type CaseFileSectionId = "problem" | "decisions" | "how-its-built" | "what-id-change";

type Image = { src: string; alt: string; width: number; height: number };

export type CaseFileSection = {
  id: CaseFileSectionId;
  heading: string;
  paragraphs?: readonly string[];
  /** Points that open with a bold lead, such as decisions or changes. */
  points?: readonly { lead: string; text: string }[];
  figure?: Image & { caption: string };
};

export type CaseFile = {
  slug: CaseFileSlug;
  /** The number on the "Case file Nº" stamp. */
  number: string;
  name: string;
  kicker: string;
  thesis: string;
  /** The thesis note's paper, matching the project's note on Work. */
  noteStock: "ochre" | "blueprint" | "sage";
  summary: string;
  labelTape: readonly string[];
  liveUrl?: string;
  codeUrl: string;
  /** Said beside the Code button, for example why there is no live site. */
  codeNote?: string;
  /** The paperclipped screenshot, with the pencil note beneath it. */
  screenshot: Image & { note: string };
  sections: readonly CaseFileSection[];
  /** The page's meta description. */
  description: string;
};

/** The divider tabs, in order, each on its own paper stock. */
export const caseFileTabs: readonly { id: CaseFileSectionId; label: string; stock: "terracotta" | "sage" | "blueprint" | "ochre" }[] = [
  { id: "problem", label: "Problem", stock: "terracotta" },
  { id: "decisions", label: "Decisions", stock: "sage" },
  { id: "how-its-built", label: "How it’s built", stock: "blueprint" },
  { id: "what-id-change", label: "What I’d change", stock: "ochre" },
];

export const caseFileCopy = {
  stamp: "Case file Nº",
  backToDrawer: "Back to the drawer",
  backToDrawerHref: "/work",
  tabsLabel: "Sections",
  builtWith: "Built with",
  live: "Live site",
  code: "Code",
} as const;

export const caseFiles: Record<CaseFileSlug, CaseFile> = {
  threshold: {
    slug: "threshold",
    number: "01",
    name: "Threshold",
    kicker: "Product engineering · Data visualisation · 2026",
    thesis: "A clearer view of what moving could cost.",
    noteStock: "ochre",
    summary:
      "Rent calculators tell you the rent. Threshold tells you what it takes to move: the money you need on day one, what you’ll spend each month after, and how long it would take to save the difference. It covers London, Basel, and Zurich.",
    labelTape: ["React 19", "TypeScript", "MapLibre"],
    liveUrl: "https://threshold-beta.vercel.app",
    codeUrl: "https://github.com/3ixas/threshold",
    screenshot: {
      src: "/work/threshold/landing.webp",
      alt: "Threshold landing page introducing the real cost of moving out",
      width: 2294,
      height: 1750,
      note: "the first thing you see when you open it",
    },
    sections: [
      {
        id: "problem",
        heading: "The rent is the easy part.",
        paragraphs: [
          "Most rent calculators stop at the monthly figure. That’s the number everyone asks about, but it isn’t what decides whether you can move. Before you get the keys you might need five weeks’ deposit in London, or three months’ in Switzerland, plus the first month’s rent, moving costs, and furniture.",
          "The monthly picture is muddled too. Council tax in London, health insurance in Switzerland, transport that depends on which zone you live in. Each of these is easy to find on its own; the hard part is seeing them together for one flat in one district.",
          "So the question I wanted to answer was simple: can I afford to move, and if not, how long until I can?",
        ],
      },
      {
        id: "decisions",
        heading: "Two totals and a straight answer.",
        points: [
          {
            lead: "Upfront and monthly stay separate.",
            text: "Adding them together hides the real problem. You can often afford the monthly costs long before you’ve saved the upfront ones, so Threshold shows both totals side by side.",
          },
          {
            lead: "The answer is one of three.",
            text: "You can move now; not yet, and here’s how many months of saving it would take; or your income doesn’t cover the monthly costs. I’d rather give a clear answer than a score you have to interpret.",
          },
          {
            lead: "Each city keeps its own rules.",
            text: "London, Basel, and Zurich have different deposits, local charges, and transport passes. Threshold doesn’t use one set of assumptions for all three, and every default can be changed.",
          },
          {
            lead: "Suggestions show what would help.",
            text: "If a cheaper district nearby, a smaller place, or a flatmate would save a meaningful amount each month, Threshold says so and shows how much.",
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
      {
        id: "how-its-built",
        heading: "The link is the save file.",
        paragraphs: [
          "Everything you choose lives in the URL: the district, the home, the household, and your income and savings. There’s no account and no backend. Copy the link and someone else sees exactly the same scenario, and you can add a second scenario to compare two moves.",
          "The calculations are plain functions with no state of their own, so each one is easy to test. The project has 182 tests, mostly against those functions.",
          "The maps use MapLibre with real boundaries: 33 London boroughs, Zurich’s 12 Kreise, and Basel grouped into seven areas. London transport costs follow the TfL zone for each borough.",
          "The cost data is a snapshot from April 2026, taken from sources like the ONS, Numbeo, and the transport operators. Each city shows when its figures were last updated.",
        ],
        figure: {
          src: "/work/threshold/calculator.webp",
          alt: "Threshold calculator with a district map and scenario controls",
          width: 2296,
          height: 1748,
          caption: "The district map and the choices that drive the estimate.",
        },
      },
      {
        id: "what-id-change",
        heading: "What I’d do next.",
        points: [
          {
            lead: "Keep the data fresh.",
            text: "The figures are a hand-collected snapshot from April 2026, so they start going stale straight away. I’d move them to a scheduled refresh where the sources allow it.",
          },
          {
            lead: "Show the sources in the app.",
            text: "Each city shows a date, but not where each figure came from. I’d link every default to its source so you can check it.",
          },
          {
            lead: "Finer areas in Basel.",
            text: "Basel is grouped into seven areas rather than its 19 Wohnviertel, which hides real differences in rent.",
          },
        ],
      },
    ],
    description:
      "A rental calculator for London, Basel, and Zurich that shows what a move really costs: upfront, monthly, and how long until you can afford it.",
  },
  "argus-risk": {
    slug: "argus-risk",
    number: "02",
    name: "Argus Risk",
    kicker: "Event-driven systems · Financial simulation · 2026",
    thesis: "Every number shows where it came from and how old it is.",
    noteStock: "blueprint",
    summary:
      "A risk dashboard shows you a total and expects you to believe it. Argus is a local simulator for a multi-currency risk platform where you can follow a simulated trade through an event stream, into the risk calculations, and onto the dashboard, with the age of every figure in view.",
    labelTape: [".NET 8", "Kafka", "PostgreSQL", "SignalR"],
    codeUrl: "https://github.com/3ixas/argus-risk",
    codeNote: "Runs locally with one Docker command.",
    screenshot: {
      src: "/work/argus/overview.webp",
      alt: "Argus Risk dashboard showing portfolio value, profit and loss, exposure, and system status",
      width: 2854,
      height: 1716,
      note: "portfolio value, P&L, and how fresh each feed is",
    },
    sections: [
      {
        id: "problem",
        heading: "A total doesn’t say how old it is.",
        paragraphs: [
          "A portfolio’s value is only as good as the prices and trades behind it. Most dashboards show the total, but not how old it is, which feed it came from, or whether the system is still keeping up.",
          "I wanted to understand that path end to end, so I built a small version of it: simulated prices and trades in five currencies, a risk engine that turns them into portfolio snapshots, and a dashboard that shows them live.",
          "Argus is a simulator. It doesn’t use real market data, and it runs on your machine rather than in production.",
        ],
      },
      {
        id: "decisions",
        heading: "Show the number with its history.",
        points: [
          {
            lead: "Every change is an event.",
            text: "Each position change is stored as an event: opened, increased, decreased, reversed, or closed. Replay them and you can see how a position looked at any point in time.",
          },
          {
            lead: "Freshness sits next to the value.",
            text: "Each portfolio value shows connection status, price age, and alerts. If a feed stalls, you can see what failed and how old the number is.",
          },
          {
            lead: "The maths is plain functions.",
            text: "FIFO cost basis, P&L, and Value at Risk take inputs and return results, nothing else. The same inputs always give the same answer, which makes them easy to test and to replay.",
          },
          {
            lead: "Check the answer.",
            text: "A reconciliation run replays the event history and compares checksums with the live state, so drift shows up as a failed check rather than a quietly wrong number.",
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
      {
        id: "how-its-built",
        heading: "Four services and a stream.",
        paragraphs: [
          "Two simulators publish prices, FX rates, and trades to Kafka topics, using Redpanda locally. The risk engine aggregates positions and publishes a snapshot every second, and an ASP.NET Core API pushes each one to a Next.js dashboard over SignalR.",
          "Marten stores the position events in PostgreSQL. Replay plays the history back at 1, 5, 10, or 60 times speed.",
          "OpenTelemetry traces, Prometheus metrics, and Grafana dashboards show what happens when data arrives late. Circuit breakers and staleness checks handle a feed that stops.",
          "One docker compose up starts the whole stack. There are 126 .NET tests, and CI runs them alongside the dashboard’s type checks and Vitest.",
        ],
      },
      {
        id: "what-id-change",
        heading: "What I’d do next.",
        points: [
          {
            lead: "Measure the latency.",
            text: "I designed for under 500 ms from a price change to the dashboard, but I haven’t measured it under load. I’d add a benchmark and publish the result.",
          },
          {
            lead: "Make it easier to see.",
            text: "Argus only runs locally, so looking at it means cloning the repo and starting Docker. A recorded replay or a hosted read-only demo would fix that.",
          },
          {
            lead: "Stress testing.",
            text: "I’d add user-defined shocks, so you can see how the portfolio would react to a sudden move in a currency or a sector.",
          },
        ],
      },
    ],
    description:
      "A local simulator for a multi-currency risk platform, where every number on the dashboard shows where it came from and how old it is.",
  },
  flowtime: {
    slug: "flowtime",
    number: "03",
    name: "Flowtime",
    kicker: "Offline-first interaction · State design · 2026",
    thesis: "Breaks that match how long you actually focused.",
    noteStock: "sage",
    summary:
      "A Pomodoro timer decides when you stop. Flowtime counts up while you focus and sets your break in proportion to the time you put in. It keeps accurate time in a background tab, saves everything on your device, and asks what you want to do if you close the tab mid-session.",
    labelTape: ["Next.js", "TypeScript", "Service Worker"],
    liveUrl: "https://flowtime-focus-timer.vercel.app",
    codeUrl: "https://github.com/3ixas/flowtime-focus-timer",
    screenshot: {
      src: "/work/flowtime/timer.jpg",
      alt: "Flowtime focus timer interface",
      width: 1280,
      height: 640,
      note: "the timer, counting up",
    },
    sections: [
      {
        id: "problem",
        heading: "A timer that interrupts you, or loses track.",
        paragraphs: [
          "A Pomodoro timer stops you after 25 minutes whether you’re stuck or in the middle of something good. The Flowtime technique flips that: you work until you stop, then take a break that fits.",
          "Building that in a browser has two catches. Browsers slow down timers in background tabs, so a timer that counts ticks drifts. And if you close the tab mid-session, the session is gone.",
        ],
      },
      {
        id: "decisions",
        heading: "Count from a fixed point, and ask instead of guessing.",
        points: [
          {
            lead: "Time comes from a timestamp.",
            text: "Flowtime stores when the session started and works out the elapsed time from that, so a sleeping tab never loses minutes.",
          },
          {
            lead: "The break follows the focus.",
            text: "By default the break is a fifth of your focus time, rounded up to the minute. You can set the ratio anywhere from a third to an eighth.",
          },
          {
            lead: "Every state has a name.",
            text: "The timer is always in one of six states: stopped, running, paused, results, break, or break complete. Each is its own type, so the interface always knows what to show.",
          },
          {
            lead: "Ask, don’t assume.",
            text: "If you come back to an unfinished session, Flowtime asks what to do rather than deciding for you. After a few minutes away you can pick up where you left off; after longer, you can end the session or discard it.",
          },
        ],
      },
      {
        id: "how-its-built",
        heading: "Everything stays in your browser.",
        paragraphs: [
          "Sessions, tags, notes, and settings live in your browser’s storage. There’s no account and no backend, and a CSV export lets you take your history with you.",
          "A service worker caches the app, so you can install it and it keeps working offline.",
          "Your history shows a 52-week heatmap, personal records, and week, month, and year views.",
          "The timer works from the keyboard, announces state changes to screen readers, and respects reduced motion. 189 unit tests cover the timer, the break maths, storage, and export.",
        ],
      },
      {
        id: "what-id-change",
        heading: "What I’d do next.",
        points: [
          {
            lead: "Move between devices.",
            text: "Your history lives in one browser. I’d add a way to carry it to another device while keeping local storage as the default.",
          },
          {
            lead: "Show when you focus best.",
            text: "The history shows what you did, not the pattern behind it. I’d add simple insights, like the time of day you tend to focus longest.",
          },
        ],
      },
    ],
    description:
      "A focus timer that counts up, sets breaks in proportion to your focus, and keeps your history on your device.",
  },
};

export const caseFileSlugs = Object.keys(caseFiles) as CaseFileSlug[];

export function isCaseFileSlug(value: string): value is CaseFileSlug {
  return Object.hasOwn(caseFiles, value);
}

/** The work drawer on /work. */
export const drawer = {
  kicker: (count: number) => `Work archive · ${count} case files`,
  heading: { lead: "Everything I’ve built,", emphasis: "filed." },
  intro: "Each folder is a case study: what was confusing, what I made clear, and how I built it.",
  backToBoard: "Back to the Board",
  backToBoardHref: "/#work",
  /** The card in the drawer front's label holder, from the signed-off canvas. */
  label: "All my work",
  folderNumber: (number: string) => `Nº ${number}`,
  openFolder: "Open the folder",
  folderLabel: (name: string) => `Open the ${name} folder`,
  description: "Case studies of the products I’ve built: what was confusing, what I made clear, and how.",
} as const;
