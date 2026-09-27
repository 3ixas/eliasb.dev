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
    headline: "Working out what a move might cost.",
    summary:
      "Rent is only part of moving. Threshold puts upfront costs, monthly spending, and the savings gap in one place, so you can work out what a move might take.",
    role: "I worked on the product direction, data model, and interface.",
    stack: [
      "React 19",
      "TypeScript",
      "Vite",
      "React Router",
      "React Map GL",
      "MapLibre GL JS",
      "URLSearchParams",
      "Vitest",
    ],
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
        title: "Rent isn’t the only cost of moving.",
        body: [
          "Before you move, you may also need to cover a deposit, the first month’s rent, moving costs, and furniture.",
          "Threshold separates what you’ll need upfront from what you’ll pay each month. It also shows the savings gap and an estimate of how long it could take to cover it.",
        ],
        notes: ["Upfront total", "Monthly total", "Savings gap", "Time to move"],
      },
      {
        eyebrow: "02 / Make assumptions visible",
        title: "The estimate depends on where you’re moving.",
        body: [
          "London, Basel, and Zurich each have their own districts, rent bands, transport rules, deposits, and local charges. Threshold keeps those differences in view instead of using the same assumptions for all three.",
          "You can change costs, income, and savings to see how the estimate changes. Each city’s figures also show when they were last refreshed.",
        ],
        notes: ["London", "Basel", "Zurich", "Editable defaults"],
      },
      {
        eyebrow: "03 / Share a scenario",
        title: "Open the same scenario later or share it.",
        body: [
          "The link stores your choices: district, home, household, lifestyle, and budget. Open it again and the same scenario is there.",
          "There’s no account to set up. Copy the link to share it, then change a few costs to compare another move.",
        ],
        notes: ["No account", "No backend", "Reproducible scenarios", "Pure calculations"],
      },
    ],
    takeaway:
      "I wanted each estimate to be easy to check and change. In Threshold, you can adjust one and see how the numbers move.",
  },
  "argus-risk": {
    slug: "argus-risk",
    index: "02",
    name: "Argus Risk",
    kind: "Distributed systems · Financial simulation",
    year: "2026",
    headline: "How a simulated trade reaches the dashboard.",
    summary:
      "I built Argus as a local simulator for a multi-currency risk platform. It follows simulated prices and trades through an event stream, into risk calculations, and onto a dashboard.",
    role: "I built the simulator, backend services, and dashboard.",
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
        title: "Follow a trade from Kafka to the dashboard.",
        body: [
          "Simulated prices, FX rates, and trades arrive on separate Kafka topics. The risk engine rolls them into portfolio snapshots, and SignalR streams those to the Next.js dashboard. Marten keeps the event history, so I can replay what happened.",
          "Events connect the services. I can inspect or restart any of them on their own in Docker.",
        ],
        notes: ["Market data", "Trade events", "Risk engine", "SignalR dashboard"],
      },
      {
        eyebrow: "02 / Reconstruct positions",
        title: "Rewind a position to see how it got there.",
        body: [
          "Every position change becomes a Marten event: opened, increased, decreased, reversed, or closed. Replay the events and you can see how the position changed at any point in time.",
          "FIFO cost basis and risk calculations live in pure functions. Given the same inputs, I can test and replay the same result.",
        ],
        notes: ["Append-only history", "FIFO cost basis", "Deterministic calculations", "Point-in-time state"],
      },
      {
        eyebrow: "03 / Make stale data visible",
        title: "Know when a risk number has gone stale.",
        body: [
          "Each portfolio value sits alongside connection status, price age, alerts, and reconciliation. If a feed stalls, you can see what failed and how old the number is.",
          "I added replay, checksums, metrics, and traces to see what happens when data arrives late or out of order.",
        ],
        notes: ["Staleness", "Reconciliation", "Circuit breaking", "Observability"],
      },
    ],
    takeaway:
      "In Argus, each risk value comes with its age and a view of whether the system is keeping up. That makes it easier to read the number in context.",
  },
  flowtime: {
    slug: "flowtime",
    index: "03",
    name: "Flowtime",
    kind: "State design · Offline-first interaction",
    year: "2026",
    headline: "A timer that keeps accurate time in the background.",
    summary:
      "Flowtime saves sessions on your device and sets breaks in proportion to your focus time. The timer keeps up when its tab is in the background. If you close the browser, it asks what you’d like to do when you return.",
    role: "I worked on the product and its interactions, then built the frontend with accessibility in mind.",
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
        title: "The timer keeps its place when the tab sleeps.",
        body: [
          "Browsers throttle background tabs, so a timer that counts each second drifts. Flowtime stores when your session started and works out elapsed time from that timestamp instead.",
          "When the tab wakes, Flowtime checks the clock again. The display can sleep without losing track.",
        ],
        notes: ["Absolute start time", "Derived elapsed time", "Background-safe", "No server clock"],
      },
      {
        eyebrow: "02 / Recover interrupted sessions",
        title: "Choose what to do when you return.",
        body: [
          "If you leave mid-session, Flowtime keeps your task and tags on your device. When you come back, you choose whether to pick up where you left off or call it a day.",
          "Resume, finish the session, skip the break, or start again: Flowtime makes the next step clear.",
        ],
        notes: ["Resume", "End honestly", "Skip break", "Start again"],
      },
      {
        eyebrow: "03 / Keep data on your device",
        title: "Your history stays in your browser.",
        body: [
          "Sessions, tags, notes, and settings live in your browser. Flowtime works offline, and a CSV export lets you take your data with you.",
          "The timer works without a mouse, too: keyboard controls, clear screen-reader updates, and focus you can see.",
        ],
        notes: ["Offline shell", "CSV export", "Keyboard control", "Screen-reader state"],
      },
    ],
    takeaway:
      "If you leave mid-session, Flowtime saves your work on your device and asks what you’d like to do when you return.",
  },
} as const satisfies Record<CaseStudySlug, CaseStudy>;

export function isCaseStudySlug(value: string): value is CaseStudySlug {
  return value in caseStudies;
}
