/**
 * About: my story, from my dictated source note (29 September 2026, held
 * privately in Obsidian). Approved in docs/content/copy/11-about-journey.md.
 * No story detail comes from anywhere else.
 */
export const about = {
  kicker: "03 / About",
  heading: { lead: "A bit about", emphasis: "me." },
  story: [
    "I studied history at university. Not with a career in mind, just because I loved it, and I still do: the story of how people got from prehistory to now.",
    "After uni I went into marketing. My dad worked in advertising, and I still remember him bringing home doughnuts from a Greggs campaign and telling me all about it. I ended up in digital marketing in healthcare, and the part I enjoyed most was working with the engineers who built our website.",
    "Then a friend who’s a quant researcher told me about a hectic week at work, and I could hear how much he loved it. I wanted that feeling from my own work.",
    "So I started coding in my spare time, no pressure, just to see. I loved it: thinking hard about how to build or fix something, and the fact that if you have an idea, you can just build it.",
    "I went all in: a full-stack role at an e-commerce business, with a software engineering bootcamp alongside it. That led to my role at BNP Paribas, where I’ve been ever since. I still love it as much as I did at the start.",
  ],
  photo: {
    src: "/profile/elias.webp",
    alt: "Elias smiling in a grey jumper outside a stone building on a sunny day",
    width: 968,
    height: 968,
  },
  start: "start here ↓",
  /** The five stops on the red string, in order. */
  stops: [
    { tag: "History at uni", object: "essay", words: ["History essay"] },
    { tag: "Into marketing", object: "bakery-bag", words: [] },
    { tag: "The click", object: "speech-bubble", words: ["“I need that feeling from what I do.”"] },
    { tag: "Learning to code", object: "sticky-note", words: ["// if you have an idea,", "// you can just build it"] },
    { tag: "BNP Paribas, today", object: "lanyard", words: ["Software engineer", "Pricing and risk systems"] },
  ],
} as const;

export type AboutStop = (typeof about)["stops"][number];
