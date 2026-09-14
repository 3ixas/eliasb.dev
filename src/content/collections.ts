export const labItems = [
  {
    index: "01",
    status: "Public experiment",
    title: "Ask Professor Past",
    kind: "History · Character · AI",
    description:
      "A personality-led history chatbot that turns a search-shaped question into a conversation with an eccentric professor.",
    note: "The original experiment is live. A more deliberate rebuild is currently at the specification and visual-system stage.",
    liveUrl: undefined,
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
    note: "The live homepage matchup is connected and the other managers stay anonymous. Rankings and prediction experiments can grow here without presenting guesses as certainty.",
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

export const journey = [
  {
    label: "Earlier",
    title: "Data and marketing",
    description:
      "I started in marketing, close to data, experiments, and the question of why one experience earns attention while another loses it.",
  },
  {
    label: "Then",
    title: "AI model training",
    description:
      "Training and evaluating code for language models made precision matter in a different way. A plausible answer was never enough if the reasoning or code did not hold up.",
  },
  {
    label: "Now",
    title: "Software engineering",
    description:
      "Today I build high-performance pricing and risk software in C#, alongside personal products in TypeScript and Python. The common thread is making complicated behaviour easier to reason about.",
  },
] as const;
