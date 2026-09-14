export const conceptDirections = {
  "living-editorial": {
    number: "01",
    name: "Living Editorial",
    shortName: "Editorial",
    thesis: "A personal publication that happens to be a portfolio.",
  },
  "cabinet-of-curiosities": {
    number: "02",
    name: "Cabinet of Curiosities",
    shortName: "Cabinet",
    thesis: "A shelf of useful, beautiful, and unfinished things.",
  },
  "signals-and-systems": {
    number: "03",
    name: "Signals & Systems",
    shortName: "Signals",
    thesis: "A human system, observed with care.",
  },
} as const;

export type ConceptDirection = keyof typeof conceptDirections;

export function isConceptDirection(value: string): value is ConceptDirection {
  return value in conceptDirections;
}
