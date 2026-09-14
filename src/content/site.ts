export const profile = {
  name: "Elias Bennett",
  shortName: "Elias B.",
  role: "Software engineer",
  location: "London",
  statement: "I build thoughtful software for complex problems.",
  introduction:
    "I work across engineering, product, and interface design—turning consequential systems into tools people can understand and trust.",
  about:
    "I’m a London-based software engineer interested in the point where systems thinking, product judgment, and visual craft meet. I currently work on high-performance financial risk systems, and I keep a lab for the smaller ideas, interface studies, and experiments that teach me something new.",
  links: {
    github: "https://github.com/3ixas",
    linkedin: "https://linkedin.com/in/elias-t-bennett/",
    resume:
      "https://drive.google.com/file/d/1aiC3EBfxrfcbGTkETDpzRi7FYlfTPYWQ/view?usp=sharing",
  },
} as const;

export const projects = [
  {
    index: "01",
    name: "Threshold",
    eyebrow: "Product engineering · Data visualization · 2026",
    thesis: "Making the cost of a decision visible.",
    description:
      "A rental-affordability calculator for London, Basel, and Zurich. It turns salary, moving costs, and local assumptions into a clear, shareable picture of what independent living really costs.",
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
    detail: "Kafka · PostgreSQL · SignalR · Next.js",
    codeUrl: "https://github.com/3ixas/argus-risk",
  },
  {
    index: "03",
    name: "Flowtime",
    eyebrow: "Offline-first interaction",
    detail: "Focus state that survives refreshes, mistakes, and interruptions.",
    image: "/projects/flowtime.jpg",
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
    href: "https://askprofessorpast.com",
  },
  {
    index: "02",
    title: "Fantasy models",
    kind: "Football · Data",
    description:
      "Small experiments with rankings, matchups, predictions, and the weekly chaos of a redraft league.",
    href: undefined,
  },
  {
    index: "03",
    title: "Interface studies",
    kind: "Work in progress",
    description:
      "Components, interaction ideas, failed directions, and notes from learning how products should feel.",
    href: undefined,
  },
] as const;
