export const labItems = [
  {
    index: "01",
    status: "Public experiment",
    title: "Ask Professor Past",
    kind: "History experiment",
    description:
      "A first public version of Professor Past, an eccentric character for exploring questions about history.",
    note: "This version puts the professor at the centre of each answer.",
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
      "I’m working on matchup views, rankings, and draft tools for my Sleeper league. I’m still deciding whether a prediction model belongs here.",
    note: "The live matchup is on the homepage. Here, I try out ideas for the tools around it.",
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
      "Small tests of controls, motion, and the details that make a product easier to use.",
    note: "Some ideas work better than others; I keep the notes either way.",
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
    story: "I worked with engineers to improve website performance. Core Web Vitals and split tests helped us decide what to fix first.",
  },
  {
    role: "Full Stack Software Engineer",
    employer: "Joveen",
    dates: {
      start: { dateTime: "2024-08", label: "Aug 2024" },
      end: { dateTime: "2025-06", label: "June 2025" },
    },
    context: undefined,
    story: "I moved from tracking site performance to changing the code, improving an ecommerce product built with React, MySQL, and Java/Spring Boot.",
  },
  {
    role: "Software Engineer",
    roleFocus: "pricing and risk systems",
    employer: "BNP Paribas CIB",
    dates: {
      start: { dateTime: "2025-07", label: "July 2025" },
      end: { dateTime: null, label: "Present" },
    },
    context: "High-Performance Computing",
    story: "I work on software that brings market data into pricing and risk calculations.",
  },
] as const;
