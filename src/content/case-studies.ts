export type CaseStudySlug = "threshold" | "argus-risk" | "flowtime";

export type CaseStudy = {
  slug: CaseStudySlug;
  index: string;
  name: string;
  kind: string;
  year: string;
  headline: string;
  summary: string;
  role: string;
  stack: readonly string[];
  liveUrl?: string;
  codeUrl: string;
  hero: { src: string; alt: string; width: number; height: number };
  gallery: readonly { src: string; alt: string; width: number; height: number }[];
  facts: readonly { value: string; label: string }[];
  chapters: readonly {
    eyebrow: string;
    title: string;
    body: readonly string[];
    notes?: readonly string[];
  }[];
  takeaway: string;
};

export const caseStudies = {
  threshold: {
    slug: "threshold",
    index: "01",
    name: "Threshold",
    kind: "Product engineering · Data visualisation",
    year: "2026",
    headline: "Affordability starts before the first month’s rent.",
    summary:
      "Threshold gathers the costs of moving into one scenario: cash needed upfront, monthly spending, and the gap between current savings and a chosen move.",
    role: "Independent product, design, data modelling, and frontend engineering",
    stack: ["React 19", "TypeScript", "MapLibre", "URLSearchParams", "Vitest"],
    liveUrl: "https://threshold-beta.vercel.app",
    codeUrl: "https://github.com/3ixas/threshold",
    hero: {
      src: "/work/threshold/landing.webp",
      alt: "Threshold landing page introducing the real cost of moving out",
      width: 2294,
      height: 1750,
    },
    gallery: [
      {
        src: "/work/threshold/calculator.webp",
        alt: "Threshold calculator with a district map and scenario controls",
        width: 2296,
        height: 1748,
      },
      {
        src: "/work/threshold/costs.webp",
        alt: "Threshold results showing upfront and monthly cost breakdowns",
        width: 2298,
        height: 1750,
      },
    ],
    facts: [
      { value: "3", label: "city models" },
      { value: "2", label: "cost horizons" },
      { value: "URL", label: "owns the scenario" },
      { value: "Apr ’26", label: "data snapshot" },
    ],
    chapters: [
      {
        eyebrow: "01 / Frame the decision",
        title: "Monthly affordability can hide the cost that stops a move.",
        body: [
          "A move can still be out of reach even when the monthly rent looks affordable. There’s also the deposit, first month’s rent, moving costs, and furniture to consider.",
          "Threshold separates upfront and monthly costs, then estimates how much more you’d need to save and how long that might take.",
        ],
        notes: ["Upfront total", "Monthly total", "Savings gap", "Time to move"],
      },
      {
        eyebrow: "02 / Make assumptions visible",
        title: "Every estimate should expose its assumptions.",
        body: [
          "Each city is a typed configuration of districts, rent bands, transport rules, deposits, utilities, and local charges. London and the Swiss cities can share a calculation engine without pretending their costs work the same way.",
          "The default figures are only a starting point. You can change food, transport, broadband, moving, furniture, health insurance, income, and savings; the page also shows when the data was last updated.",
        ],
        notes: ["London", "Basel", "Zurich", "Editable defaults"],
      },
      {
        eyebrow: "03 / Share a scenario",
        title: "Share the full scenario with a link.",
        body: [
          "Every meaningful input serialises into URL parameters. Opening the link reconstructs the same district, property, household, lifestyle, and affordability scenario.",
          "There’s no account or backend to set up. You can copy a link to share the scenario, then change it to compare a different set of costs.",
        ],
        notes: ["No account", "No backend", "Reproducible scenarios", "Pure calculations"],
      },
    ],
    takeaway:
      "With Threshold, I wanted people to check the numbers for themselves and change any estimate that didn’t fit.",
  },
  "argus-risk": {
    slug: "argus-risk",
    index: "02",
    name: "Argus Risk",
    kind: "Distributed systems · Financial simulation",
    year: "2026",
    headline: "How simulated market data reaches the dashboard.",
    summary:
      "Argus is a local educational simulator for a multi-currency equity risk platform. It follows simulated prices and trades through an event-driven system, calculates portfolio risk, and shows data freshness, failures, and replay in a browser dashboard.",
    role: "Independent system architecture, backend, simulation, observability, and dashboard engineering",
    stack: [".NET 8", "Kafka / Redpanda", "PostgreSQL / Marten", "SignalR", "Next.js"],
    codeUrl: "https://github.com/3ixas/argus-risk",
    hero: {
      src: "/work/argus/overview.webp",
      alt: "Argus Risk dashboard showing portfolio value, profit and loss, exposure, and system status",
      width: 2854,
      height: 1716,
    },
    gallery: [
      {
        src: "/work/argus/positions.webp",
        alt: "Argus Risk positions table with live price and freshness data",
        width: 2854,
        height: 1716,
      },
    ],
    facts: [
      { value: "4", label: ".NET services" },
      { value: "1 Hz", label: "risk snapshots" },
      { value: "5", label: "position events" },
      { value: "1–60×", label: "replay speed" },
    ],
    chapters: [
      {
        eyebrow: "01 / Follow the event",
        title: "How a trade reaches the dashboard.",
        body: [
          "Simulated prices, FX rates, and trades arrive through separate Kafka topics. The risk engine combines them into portfolio snapshots, which the API sends to the Next.js dashboard with SignalR. Marten stores the event history for replay.",
          "The services communicate through events, so I can inspect or restart each one independently in the local Docker environment.",
        ],
        notes: ["Market data", "Trade events", "Risk engine", "SignalR dashboard"],
      },
      {
        eyebrow: "02 / Reconstruct positions",
        title: "Rebuild position state from the events that changed it.",
        body: [
          "Position changes are appended as immutable Marten events: opened, increased, decreased, reversed, or closed. Replaying them rebuilds the position at any point in time and shows which changes produced it.",
          "FIFO cost basis and the risk calculations stay in pure functions with no infrastructure dependencies. The same inputs produce the same result, which makes correctness testable and replay meaningful.",
        ],
        notes: ["Append-only history", "FIFO cost basis", "Deterministic calculations", "Point-in-time state"],
      },
      {
        eyebrow: "03 / Make stale data visible",
        title: "Make stale numbers obvious.",
        body: [
          "The dashboard pairs each portfolio value with connection status, price freshness, alerts, and reconciliation. If a source stalls, it shows how old the data is and what has failed, so the operator can judge what is still usable.",
          "The simulator also includes replay, checksums, metrics, traces, and degraded states. These show how the system behaves when data is late or inconsistent.",
        ],
        notes: ["Staleness", "Reconciliation", "Circuit breaking", "Observability"],
      },
    ],
    takeaway:
      "A risk number needs context. Argus shows how recent each value is and whether the system is keeping up.",
  },
  flowtime: {
    slug: "flowtime",
    index: "03",
    name: "Flowtime",
    kind: "State design · Offline-first interaction",
    year: "2026",
    headline: "A timer that stays accurate when the tab goes to sleep.",
    summary:
      "Flowtime keeps session history on your device and adjusts break length to the time you worked. It keeps the timer accurate when a tab sleeps and lets you decide what to do with a session after the browser closes.",
    role: "Independent product, interaction design, frontend engineering, and accessibility",
    stack: ["Next.js", "TypeScript", "localStorage", "Service Worker", "Vitest"],
    liveUrl: "https://flowtime-focus-timer.vercel.app",
    codeUrl: "https://github.com/3ixas/flowtime-focus-timer",
    hero: {
      src: "/work/flowtime/timer.jpg",
      alt: "Flowtime focus timer interface",
      width: 1280,
      height: 640,
    },
    gallery: [],
    facts: [
      { value: "6", label: "explicit timer states" },
      { value: "÷3–8", label: "break ratios" },
      { value: "52 wk", label: "focus heatmap" },
      { value: "Local", label: "data ownership" },
    ],
    chapters: [
      {
        eyebrow: "01 / Keep time accurate",
        title: "Calculate elapsed time from timestamps.",
        body: [
          "Long intervals drift, and browsers slow down background tabs. Flowtime stores the session’s start time and calculates elapsed time from that timestamp.",
          "The tab can sleep while the display is paused. When it wakes, Flowtime recalculates the elapsed time so the session stays accurate.",
        ],
        notes: ["Absolute start time", "Derived elapsed time", "Background-safe", "No server clock"],
      },
      {
        eyebrow: "02 / Recover interrupted sessions",
        title: "Decide what to do when a session is interrupted.",
        body: [
          "An active session is stored locally with its start time, task, and tags. When Flowtime opens again, it detects unfinished work and lets you choose what happens next instead of silently resuming or discarding it.",
          "The timer has distinct stopped, running, results, break, paused-break, and complete states, with a defined set of actions in each.",
        ],
        notes: ["Resume", "End honestly", "Skip break", "Start again"],
      },
      {
        eyebrow: "03 / Keep data on your device",
        title: "Your session history stays on your device.",
        body: [
          "Completed sessions, tags, notes, settings, and the active session stay in localStorage. A service worker keeps the app shell available offline, and CSV export lets people take their data with them.",
          "I built keyboard shortcuts, timer announcements, visible focus, reduced motion, labelled charts, and recoverable dialogs into the interaction.",
        ],
        notes: ["Offline shell", "CSV export", "Keyboard control", "Screen-reader state"],
      },
    ],
    takeaway:
      "If you leave mid-session, Flowtime keeps it on your device and asks what you want to do when you return.",
  },
} as const satisfies Record<CaseStudySlug, CaseStudy>;

export function isCaseStudySlug(value: string): value is CaseStudySlug {
  return value in caseStudies;
}
