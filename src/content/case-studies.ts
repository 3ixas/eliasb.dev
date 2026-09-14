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
    kind: "Product engineering · Data visualization",
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
          "A person may be able to cover the monthly total and still be blocked by a deposit, first month’s rent, moving costs, or furnishing an empty place.",
          "Threshold separates upfront and recurring costs before calculating the savings gap and time to move. Someone can understand the result without having to audit a spreadsheet.",
        ],
        notes: ["Upfront total", "Monthly total", "Savings gap", "Time to move"],
      },
      {
        eyebrow: "02 / Make assumptions visible",
        title: "Every estimate should expose its assumptions.",
        body: [
          "Each city is a typed configuration of districts, rent bands, transport rules, deposits, utilities, and local charges. London and the Swiss cities can share a calculation engine without pretending their costs work the same way.",
          "Defaults are starting points rather than hidden truth. People can override food, transport, broadband, moving, furniture, health insurance, income, and savings, while the interface keeps the published data date visible.",
        ],
        notes: ["London", "Basel", "Zurich", "Editable defaults"],
      },
      {
        eyebrow: "03 / Let the state travel",
        title: "The URL saves the whole scenario.",
        body: [
          "Every meaningful input serialises into URL parameters. Opening the link reconstructs the same district, property, household, lifestyle, and affordability scenario.",
          "This removes account creation and global state from a product that does not need either. It also makes comparisons easy to discuss: the scenario itself can be copied, reviewed, and changed.",
        ],
        notes: ["No account", "No backend", "Reproducible scenarios", "Pure calculations"],
      },
    ],
    takeaway:
      "Building Threshold changed how I think about transparency in an interface. The assumptions stay visible, the scenario can travel, and uncertain values remain editable.",
  },
  "argus-risk": {
    slug: "argus-risk",
    index: "02",
    name: "Argus Risk",
    kind: "Distributed systems · Financial simulation",
    year: "2026",
    headline: "Live risk numbers need a visible chain of trust.",
    summary:
      "Argus is a local educational simulator for a multi-currency equity risk platform. It follows simulated market data and trades through an event-driven system, calculates portfolio state, and exposes freshness, failure, and replay in the browser.",
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
        title: "Follow a trade from event to screen.",
        body: [
          "Simulated prices, FX rates, and trades enter separate Kafka topics. The risk engine consumes them, projects position state, publishes snapshots, and persists the history needed for replay. The API then pushes each snapshot to the Next.js dashboard through SignalR.",
          "The services communicate through events instead of a chain of direct calls. That separation makes the journey visible and lets each part be restarted or inspected independently in the local Docker environment.",
        ],
        notes: ["Market data", "Trade events", "Risk engine", "SignalR dashboard"],
      },
      {
        eyebrow: "02 / Preserve the why",
        title: "Rebuild position state from the events that changed it.",
        body: [
          "Position changes are appended as immutable Marten events: opened, increased, decreased, reversed, or closed. Replaying those events reconstructs the position at a point in time and preserves the path that produced it.",
          "FIFO cost basis and the risk calculations stay in pure functions with no infrastructure dependencies. The same inputs produce the same result, which makes correctness testable and replay meaningful.",
        ],
        notes: ["Append-only history", "FIFO cost basis", "Deterministic calculations", "Point-in-time state"],
      },
      {
        eyebrow: "03 / Design for doubt",
        title: "Show when a live number is stale.",
        body: [
          "The interface pairs portfolio values with connection state, price freshness, alerts, and reconciliation. When a source stalls, the useful question is no longer only ‘what is the value?’ but ‘how old is it, what failed, and can the system recover?’",
          "Replay, checksums, metrics, traces, and degraded states are part of the product story. Argus is deliberately a simulator, but it explores the operational questions that make real-time software believable.",
        ],
        notes: ["Staleness", "Reconciliation", "Circuit breaking", "Observability"],
      },
    ],
    takeaway:
      "Argus put backend correctness and interface trust into the same design problem. The dashboard has to show enough operational state for someone to know when its numbers are usable.",
  },
  flowtime: {
    slug: "flowtime",
    index: "03",
    name: "Flowtime",
    kind: "State design · Offline-first interaction",
    year: "2026",
    headline: "A timer should remember the work, even when the tab forgets.",
    summary:
      "Flowtime is a private-by-default focus timer that adapts breaks to the length of a session. The harder part is continuity: keeping time accurate through sleeping tabs, browser closures, and interrupted sessions.",
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
        eyebrow: "01 / Time from truth",
        title: "Calculate elapsed time from timestamps, not ticks.",
        body: [
          "A long-running interval slowly drifts and browsers throttle background tabs. Flowtime stores the session’s absolute start time and derives elapsed time from the difference to the current timestamp on every tick.",
          "The display can pause, the tab can sleep, and the calculation still returns to the correct duration. That small architectural choice protects the central promise of the product.",
        ],
        notes: ["Absolute start time", "Derived elapsed time", "Background-safe", "No server clock"],
      },
      {
        eyebrow: "02 / Recovery is a state",
        title: "Closing the tab should open a recovery choice.",
        body: [
          "An active session is stored locally with its start time, task, and tags. When Flowtime opens again, it detects the unfinished state and offers a deliberate recovery path instead of silently resuming or discarding the work.",
          "The timer moves through explicit stopped, running, results, break, paused-break, and complete states. Each transition has a bounded action, which keeps edge cases understandable in code and in the interface.",
        ],
        notes: ["Resume", "End honestly", "Skip break", "Start again"],
      },
      {
        eyebrow: "03 / Keep it personal",
        title: "Keep the history on the device.",
        body: [
          "Completed sessions, tags, notes, settings, and the active session remain in localStorage. A service worker keeps the app shell available offline, while CSV export gives the person a route out of the product.",
          "Keyboard shortcuts, live timer announcements, visible focus, reduced motion, labelled charts, and recoverable dialogs are treated as interaction requirements rather than a final audit pass.",
        ],
        notes: ["Offline shell", "CSV export", "Keyboard control", "Screen-reader state"],
      },
    ],
    takeaway:
      "Flowtime reinforced a rule I now bring to other interfaces: protect the person’s intent through interruption and make recovery explicit.",
  },
} as const satisfies Record<CaseStudySlug, CaseStudy>;

export function isCaseStudySlug(value: string): value is CaseStudySlug {
  return value in caseStudies;
}
