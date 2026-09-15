export const profile = {
  name: "Elias Bennett",
  shortName: "Elias",
  role: "Software engineer",
  location: "London",
  statement: "I build thoughtful software for complex problems.",
  introduction:
    "I’m a software engineer who works across systems, data, and interfaces. I care about how a product feels, how it behaves when things go wrong, and whether the person using it can understand what is happening.",
  about:
    "I’m based in London and currently work on high-performance pricing and risk systems. Outside work, I build my own products end to end: finding the problem, shaping the interaction, writing the code, and returning to the awkward parts until they make sense.",
  links: {
    email: "mailto:eliasthebennett@gmail.com",
    github: "https://github.com/3ixas",
    linkedin: "https://linkedin.com/in/elias-t-bennett/",
    resume:
      "https://docs.google.com/document/d/1LhawgweUl1_f85CSVY_CpOkBtZ6NC-PXMrH4jSxSUio/edit?usp=drivesdk",
  },
} as const;

export const projects = [
  {
    index: "01",
    name: "Threshold",
    eyebrow: "Product engineering · Data visualisation · 2026",
    thesis: "Making the cost of a decision visible.",
    description:
      "A rental-affordability calculator for London, Basel, and Zurich. It brings salary, moving costs, and local assumptions into one shareable picture of what it takes to move.",
    qualities: [
      "Shareable URL state",
      "Typed city configuration",
      "Accessible visual reasoning",
    ],
    image: "/projects/threshold.webp",
    imageAlt:
      "Threshold landing page showing rental affordability choices for London, Basel, and Zurich",
    liveUrl: "https://threshold-beta.vercel.app",
    codeUrl: "https://github.com/3ixas/threshold",
  },
  {
    index: "02",
    name: "Argus Risk",
    eyebrow: "Event-driven systems",
    detail: "C# · .NET · Kafka · PostgreSQL · SignalR · Next.js",
    image: "/work/argus/overview.webp",
    imageAlt: "Argus Risk interface showing event-driven risk positions",
    codeUrl: "https://github.com/3ixas/argus-risk",
  },
  {
    index: "03",
    name: "Flowtime",
    eyebrow: "Offline-first interaction",
    detail: "Next.js · TypeScript · localStorage · Service Worker",
    image: "/work/flowtime/timer.jpg",
    imageAlt: "Flowtime focus timer interface",
    liveUrl: "https://flowtime-focus-timer.vercel.app",
    codeUrl: "https://github.com/3ixas/flowtime-focus-timer",
  },
] as const;

export const labNotes = [
  {
    index: "01",
    title: "Ask Professor Past",
    kind: "History experiment",
    description:
      "A character-led way to ask questions of history, built around a witty and eccentric professor.",
    href: "/lab#lab-01",
    treatment: "professor",
    image: "/lab/professor-past.webp",
    imageAlt: "Warm illustrated portrait of the eccentric Professor Past",
  },
  {
    index: "02",
    title: "Fantasy models",
    kind: "Football · Data",
    description:
      "Small experiments with rankings, matchups, predictions, and the weekly chaos of a redraft league.",
    href: "/lab#lab-02",
    treatment: "fantasy",
    image: "/signals/football-stadium.jpg",
    imageAlt: "Aerial view of a football stadium and marked field",
  },
  {
    index: "03",
    title: "Interface studies",
    kind: "Work in progress",
    description:
      "Components, interaction ideas, failed directions, and notes from learning how products should feel.",
    href: "/lab#lab-03",
    treatment: "interface",
    image: "/lab/flowtime-interface.jpg",
    imageAlt: "Flowtime focus timer interface showing an idle session",
  },
] as const;
