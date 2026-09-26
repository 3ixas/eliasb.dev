export const labItems = [
  {
    index: "01",
    status: "Public experiment",
    title: "Ask Professor Past",
    kind: "History experiment",
    description:
      "Ask an eccentric professor about history; this is the first public version of Professor Past.",
    note: "Version one, with the professor at the centre of every answer.",
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
      "I’m tinkering with matchup views, rankings, and draft tools for my Sleeper league. A prediction model might be next.",
    note: "The live matchup is on the homepage; this is where I try the ideas around it.",
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
      "Small studies of controls, motion, and the details that make a product easier to use.",
    note: "I keep the studies that teach me something, even when the idea doesn’t work.",
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
    story: "I worked with engineers on website performance, using Core Web Vitals and split tests to help choose what to fix.",
  },
  {
    role: "Full Stack Software Engineer",
    employer: "Joveen",
    dates: {
      start: { dateTime: "2024-08", label: "Aug 2024" },
      end: { dateTime: "2025-06", label: "June 2025" },
    },
    context: undefined,
    story: "I moved into the code, improving an ecommerce site across React, MySQL and a Java/Spring Boot backend.",
  },
  {
    role: "Software Engineer",
    employer: "BNP Paribas CIB",
    dates: {
      start: { dateTime: "2025-07", label: "July 2025" },
      end: { dateTime: null, label: "Present" },
    },
    context: "High-Performance Computing, Pricing and Risk Systems · through _nology",
    story: "These days I work on software that brings market data into pricing and risk calculations.",
  },
] as const;
