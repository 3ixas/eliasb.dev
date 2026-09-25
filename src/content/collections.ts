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

export const careerTimeline = [
  {
    role: "Marketing Executive",
    employer: "Optegra Eye Healthcare & Kensington Medical",
    dates: {
      start: { dateTime: "2021-09", label: "Sept 2021" },
      end: { dateTime: "2024-08", label: "Aug 2024" },
    },
    context: undefined,
  },
  {
    role: "Full Stack Software Engineer",
    employer: "Joveen",
    dates: {
      start: { dateTime: "2024-08", label: "Aug 2024" },
      end: { dateTime: "2025-06", label: "June 2025" },
    },
    context: undefined,
  },
  {
    role: "Software Engineer",
    employer: "BNP Paribas CIB",
    dates: {
      start: { dateTime: "2025-07", label: "July 2025" },
      end: { dateTime: null, label: "Present" },
    },
    context: "High-Performance Computing, Pricing and Risk Systems · through _nology",
  },
] as const;
