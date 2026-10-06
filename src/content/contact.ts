import { profile } from "@/content/site";

/** Contact and the footer. Approved in docs/content/copy/12-contact-footer.md. */
export const contact = {
  kicker: "04 / Contact",
  heading: "Say hello",
  sign: { small: "say", large: "hello" },
  postcard: {
    headline: "Wish you were here.",
    line: "Got an idea, a project, or just want to talk about building things? Email is the best way to reach me.",
    name: "Elias Bennett",
    email: "eliasthebennett@gmail.com",
    href: profile.links.email,
    linkName: "Email me at eliasthebennett@gmail.com",
    stamp: "E/B",
  },
  /** The pinned cards, in the canvas's order. */
  cards: [
    { label: "Résumé", line: "Read my CV", href: profile.links.resume },
    { label: "GitHub", line: "3ixas", href: profile.links.github },
    { label: "LinkedIn", line: "Elias Bennett", href: profile.links.linkedin },
  ],
  footer: "Made by Elias",
} as const;
