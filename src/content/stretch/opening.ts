/*
 * The opening line and its supporting line (GLOSSARY.md, Reveal word): the h1 and the sentence under it, with the
 * words in them that can show something real. Copy is from docs/content/redesign-copy.md ("Quiet index · Opening"
 * and "The reveal words in the opening"), approved by Elias; scripts/verify-copy.mjs checks it. Each reveal word's
 * closer look says only what a Role story or the Work section already says, so it is read from them here.
 *
 * Its runtime imports carry a .ts extension, so Node can load it directly as well as Next.
 */
import { roleStories } from "./role-stories.ts";
import { work } from "./work.ts";

/** The words that open a closer look, by the id its `data-look` carries. */
export type RevealId = "engines" | "cores" | "digitisation" | "ownership";

/** A run of the opening: plain text, or a word that reacts (the employer, the cobalt tail) or shows something (a reveal word). */
export type Run = { text: string; mark?: "employer" | "emphasis" | RevealId };

/** Splits `text` into runs, marking each phrase where it first appears. A phrase the text lacks is a build error, so a marked word cannot drift from its sentence. */
function runs(text: string, marks: readonly (readonly [phrase: string, mark: NonNullable<Run["mark"]>])[]): readonly Run[] {
  const found = marks.map(([phrase, mark]) => ({ phrase, mark, at: text.indexOf(phrase) }));
  for (const { phrase, at } of found) if (at < 0) throw new Error(`The opening says "${text}", which lacks "${phrase}".`);
  const result: Run[] = [];
  let from = 0;
  for (const { phrase, mark, at } of found.sort((a, b) => a.at - b.at)) {
    if (at < from) throw new Error(`The opening's marked words overlap at "${phrase}".`);
    if (at > from) result.push({ text: text.slice(from, at) });
    result.push({ text: phrase, mark });
    from = at + phrase.length;
  }
  if (from < text.length) result.push({ text: text.slice(from) });
  return result;
}

const bnp = roleStories["bnp-paribas"];
const bnpWork = work.employers.find((employer) => employer.slug === "bnp-paribas");
const winner = bnpWork?.pins.find((pin) => pin.glyph === "trophy");
const scale = bnp.figures?.["what-changed"];
const certificate = bnp.figures?.["what-i-took-with-me"];
const competitionLine = bnp.resume.find((line) => line.includes("digitisation competition"));
if (!winner || scale?.kind !== "scale" || certificate?.kind !== "certificate" || !competitionLine) {
  throw new Error("The opening's reveal words need BNP Paribas's Winner pin, its scale figure, its certificate and its competition line.");
}
const [, competition] = scale.rows;

const headline = "I build pricing and risk engines at BNP Paribas, and products of my own.";
const support = "I’m the team’s only C# engineer, and the engines run on CPU and GPU. I’ve won the bank’s digitisation competition and a Take Ownership award.";

export const opening = {
  headline,
  headlineRuns: runs(headline, [
    ["pricing and risk engines", "engines"],
    ["BNP Paribas", "employer"],
    ["products of my own.", "emphasis"],
  ]),
  support,
  supportRuns: runs(support, [
    ["CPU and GPU", "cores"],
    ["digitisation competition", "digitisation"],
    ["Take Ownership award", "ownership"],
  ]),
  /** What each reveal word's closer look says beyond the sentence. The paths' note is the caption the copy pass added (#282). */
  looks: {
    engines: {
      caption: "The engines run large simulation-based calculations across several asset classes.",
      note: "Illustrative paths, not real prices.",
    },
    cores: { caption: "The same tests had to run on both CPU and GPU." },
    digitisation: {
      pin: winner,
      line: competitionLine,
      /** The data load before and after, drawn to scale (the Role story's own figure): 30–40 minutes, then under 5. */
      bars: [
        { label: "30–40 min", amount: competition.before.amount },
        { label: "Under 5", amount: competition.after.amount },
      ],
    },
    ownership: { certificate },
  },
} as const;

/** What each reveal word's closer look says beyond the sentence, as the text its accessible description reads. */
export const revealDescription: Record<RevealId, string> = {
  engines: `${opening.looks.engines.caption} ${opening.looks.engines.note}`,
  cores: opening.looks.cores.caption,
  digitisation: `${opening.looks.digitisation.pin.label}. ${opening.looks.digitisation.pin.detail}. ${opening.looks.digitisation.line}`,
  ownership: opening.looks.ownership.certificate.caption,
};
