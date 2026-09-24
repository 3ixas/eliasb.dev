export const labItems = [
  {
    index: "01",
    status: "Public experiment",
    title: "Ask Professor Past",
    kind: "History experiment",
    description:
      "This is V1 of Professor Past: a history chatbot where you can ask an eccentric professor about the past.",
    note: "This is the first version of the Professor Past project: the original history chatbot, built around an eccentric professor.",
    liveUrl: undefined,
    codeUrl: "https://github.com/3ixas/ask-professor-past",
    treatment: "professor",
    image: "/lab/professor-past.webp",
    imageAlt: "Warm illustrated portrait of the eccentric Professor Past",
  },
  {
    index: "02",
    status: "Working format",
    title: "Fantasy football models",
    kind: "Football · Data · Prediction",
    description:
      "I’m exploring matchup views, rankings, and draft tools for my Sleeper redraft league, with a small prediction model as a possible next step.",
    note: "The homepage shows the live matchup when Sleeper is connected. I keep the other managers anonymous, and I’m still experimenting with rankings and predictions.",
    liveUrl: undefined,
    codeUrl: undefined,
    treatment: "fantasy",
    image: "/signals/football-stadium.jpg",
    imageAlt: "Aerial view of a football stadium and marked field",
  },
  {
    index: "03",
    status: "Ongoing collection",
    title: "Interface studies",
    kind: "Interaction · Craft · Notes",
    description:
      "Small interface studies about states, controls, motion, and the details that make a product easier to use.",
    note: "I’ll add a study when there’s a decision or lesson worth sharing, including ideas that didn’t work.",
    liveUrl: undefined,
    codeUrl: undefined,
    treatment: "interface",
    image: "/lab/flowtime-interface.jpg",
    imageAlt: "Flowtime focus timer interface showing an idle session",
  },
] as const;

export const journey = [
  {
    label: "Earlier",
    title: "Data and marketing",
    description:
      "I started in marketing, working with data and experiments. I became curious about why some experiences worked better than others.",
  },
  {
    label: "Then",
    title: "AI model training",
    description:
      "Training and evaluating code for language models taught me to check whether an answer actually holds up. A plausible response was not enough if its reasoning or code was wrong.",
  },
  {
    label: "Now",
    title: "Software engineering",
    description:
      "Today I build high-performance pricing and risk software in C#, alongside personal products in TypeScript and Python.",
  },
] as const;
