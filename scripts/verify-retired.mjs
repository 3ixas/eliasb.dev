// Fails when something the quiet index retired is written anywhere in the source, the stylesheets, the scripts or the
// specs: the old Subpage header and its classes, the Fastener and its tape token, and `fastener` data on projects.
// Documents are exempt: the glossary and the design history keep the words as history.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const self = "scripts/verify-retired.mjs";
// A class, not the `data-stretch-header` attribute that still marks the shared header.
const retired = [
  [/SubpageHeader|subpage-header/, "the Subpage header (the shared header with `inner` replaced it)"],
  [/\.stretch-header|stretch-cs-home/, "the Stretch header's classes"],
  [/[Ff]astener|stretch-tape/, "the Fastener and its tape token"],
];

const files = execFileSync("git", ["ls-files", "src", "scripts", "e2e", "playwright.config.ts"], { encoding: "utf8" })
  .split("\n")
  .filter((file) => /\.(tsx?|mjs|css|json)$/.test(file) && file !== self);

const problems = [];
for (const file of files) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      for (const [pattern, what] of retired) if (pattern.test(line)) problems.push(`${file}:${index + 1} mentions ${what}`);
    });
}

if (problems.length) {
  console.error(`verify:retired found retired pieces still in use:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log(`verify:retired: no retired header, Fastener or tape token in ${files.length} files`);
