// Fails when something retired is written anywhere in the source, the stylesheets, the scripts or the specs: the old
// Subpage header and its classes, the Fastener and its tape token, the quiet index's parts (R-32: the row, closer
// looks, the margin, reveal words, the pen, the 44 px objects, Pass pins, the Stretch shell and tokens), and the
// retired faces (Bricolage Grotesque, JetBrains Mono and DM Mono). Documents are exempt: the glossary and the design
// history keep the words as history.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const self = "scripts/verify-retired.mjs";
// A class, not the `data-stretch-header` attribute that still marks the shared header.
const retired = [
  [/SubpageHeader|subpage-header/, "the Subpage header (the shared header with `inner` replaced it)"],
  [/\.stretch-header|stretch-cs-home/, "the Stretch header's classes"],
  [/[Ff]astener|stretch-tape/, "the Fastener and its tape token"],
  [/\bqi-[a-z]/, "a quiet index class (qi-*)"],
  [/components\/quiet\//, "the quiet index's components"],
  [/quiet-(index|long-form|opening|forced-colors)\.css/, "a quiet index stylesheet"],
  [/stretch-(shell|tokens|type|resume)\b|--stretch-|data-stretch-shell/, "the Stretch shell, its tokens, its hook or the old Résumé stylesheet"],
  [/CloserLook|closer-look|RevealWord|reveal-word|data-look-(tap|slot)|MarginPlacement|ScrollHold/, "a closer look, the margin or a reveal word"],
  [/\bPen\b|habit-number|HabitNumber|TodayTile|CalendarTile|ProjectObject|MiniPass|FullPass|PassPins|finished-pass/, "the pen, a 44 px object or the old pass and its pins"],
  [/DM_Mono|--font-dm-mono/, "DM Mono"],
  [/Bricolage_Grotesque|--font-bricolage|Bricolage Fallback/, "Bricolage Grotesque"],
  [/JetBrains_Mono|--font-jetbrains-mono/, "JetBrains Mono"],
  [/#2340ff/i, "the retired Stretch cobalt (#2340ff; today's cobalt is #2443d6)"],
];

const files = execFileSync("git", ["ls-files", "src", "scripts", "e2e", "playwright.config.ts"], { encoding: "utf8" })
  .split("\n")
  .filter((file) => /\.(tsx?|mjs|css|json|svg)$/.test(file) && file !== self);

const problems = [];
for (const file of files) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      for (const [pattern, what] of retired) if (pattern.test(line)) problems.push(`${file}:${index + 1} mentions ${what}`);
      if (/[Bb]ricolage|JetBrains/i.test(line) && !file.startsWith("e2e/")) problems.push(`${file}:${index + 1} names a retired face (Bricolage Grotesque or JetBrains Mono)`);
    });
}

if (problems.length) {
  console.error(`verify:retired found retired pieces still in use:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log(`verify:retired: no retired header, Fastener, quiet index part or retired face in ${files.length} files`);
