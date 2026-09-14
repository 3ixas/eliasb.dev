export const labItems = [
  {
    index: "01",
    status: "Public experiment",
    title: "Ask Professor Past",
    kind: "History · Character · AI",
    description:
      "A personality-led history chatbot that turns a search-shaped question into a conversation with an eccentric professor.",
    note: "The original experiment is live. A more deliberate rebuild is currently at the specification and visual-system stage.",
    liveUrl: "https://askprofessorpast.com",
    codeUrl: "https://github.com/3ixas/ask-professor-past",
    treatment: "professor",
  },
  {
    index: "02",
    status: "Working format",
    title: "Fantasy football models",
    kind: "Football · Data · Prediction",
    description:
      "A home for matchup views, rankings, draft tools, and eventually a small prediction model built around one Sleeper redraft league.",
    note: "League connection and member anonymisation are still pending. The first release will show the format without pretending forecast confidence.",
    liveUrl: undefined,
    codeUrl: undefined,
    treatment: "fantasy",
  },
  {
    index: "03",
    status: "Ongoing collection",
    title: "Interface studies",
    kind: "Interaction · Craft · Notes",
    description:
      "Small studies of states, controls, motion, and recovery—the parts of an interface that usually decide whether a product feels considered.",
    note: "Studies will appear when there is a real decision, failed direction, or reusable lesson worth preserving.",
    liveUrl: undefined,
    codeUrl: undefined,
    treatment: "interface",
  },
] as const;

export const libraryObjects = [
  {
    number: "001",
    kind: "Reading",
    title: "The next marked page",
    status: "Current selection pending",
    description:
      "The current book will become a tactile object with its cover, progress, and one short note about why it has stayed with me.",
    className: "library-object-book",
  },
  {
    number: "002",
    kind: "Cinema",
    title: "A film worth returning to",
    status: "Letterboxd connection pending",
    description:
      "Recent films will arrive as poster-led entries, with ratings or notes only when I have intentionally made them public.",
    className: "library-object-poster",
  },
  {
    number: "003",
    kind: "Music",
    title: "The current rotation",
    status: "Playlist selection pending",
    description:
      "A manually maintained Spotify playlist will sit inside an authored sleeve with a date and a short description of the mood.",
    className: "library-object-record",
  },
] as const;

export const journey = [
  {
    label: "Earlier",
    title: "Data and marketing",
    description:
      "I began closer to analysis, audiences, and the question of why people respond to one experience and ignore another.",
  },
  {
    label: "Then",
    title: "AI model training",
    description:
      "Evaluating and curating code for language models made precision, clear reasoning, and the limits of automated answers tangible.",
  },
  {
    label: "Now",
    title: "Software engineering",
    description:
      "I work on high-performance financial risk systems and build personal products across systems, interfaces, and data.",
  },
] as const;
