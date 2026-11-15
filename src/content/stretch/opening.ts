/*
 * The opening line and its supporting line: the h1 and the sentence under it, with BNP Paribas and "products of my
 * own." marked for the page to draw. Copy is from docs/content/redesign-copy.md ("Quiet index · Opening"), approved
 * by Elias; scripts/verify-copy.mjs checks it. The reveal words and their closer looks retired in #417 and #420.
 *
 * Its runtime imports carry a .ts extension, so Node can load it directly as well as Next.
 */

/** A run of the opening: plain text, or a marked phrase (the employer's underline, the cobalt tail). */
export type Run = { text: string; mark?: "employer" | "emphasis" };

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

const headline = "I build pricing and risk engines at BNP Paribas, and products of my own.";
const support = "I’m the team’s only C# engineer, and the engines run on CPU and GPU. I’ve won the bank’s digitisation competition and a Take Ownership award.";

export const opening = {
  headline,
  headlineRuns: runs(headline, [
    ["BNP Paribas", "employer"],
    ["products of my own.", "emphasis"],
  ]),
  support,
} as const;
