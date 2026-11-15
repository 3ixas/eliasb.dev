// Every `font-size` in src/app/*.css must be one the check can vouch for (docs/design/DESIGN.md, "Type"):
// a type token in tokens.css, one of the Résumé sheet's three text steps (only stretch-resume.css may read them),
// a px size of 24 or more, or a clamp() that never goes under 24 px. Text under 24 px stays on the steps, so a
// clamp() that dips below 24 px would sit between them. Anything else (rem, em, %, a bare vw) fails.
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../src/app/", import.meta.url);
/** The Résumé sheet's steps, which its PDF was drawn at: the sheet alone reads them. */
const sheetTokens = new Set(["--text-label", "--text-small", "--text-body"]);
const sheetFile = "stretch-resume.css";
/** Under this, text uses the steps; from it, display type may be fluid. */
const displayFrom = 24;
/** Nothing a visitor reads is smaller (DESIGN.md "Type", "One floor"). */
const floor = 13;

const problems = [];

// The passes and panels scale: every --type-* token tokens.css defines, at every width it is set for.
// A token is a px size of at least the floor, or a clamp() whose least size is at least the floor.
const typeTokens = new Set();
readFileSync(new URL("tokens.css", dir), "utf8").split("\n").forEach((line, index) => {
  const [, name, value] = line.match(/^\s*(--type-[\w-]+):\s*([^;]+);/) ?? [];
  if (!name) return;
  typeTokens.add(name);
  const least = Number(value.trim().match(/^(?:clamp\(\s*)?(\d*\.?\d+)px/)?.[1]);
  if (!(least >= floor)) problems.push(`tokens.css:${index + 1} ${name}: ${value.trim()} is not a px size or clamp() of at least ${floor} px`);
});
if (typeTokens.size < 12) problems.push(`tokens.css defines ${typeTokens.size} --type-* tokens; the scale has twelve`);

/**
 * A staff pass is drawn in em of its card's width ÷ 14.5 (pass.css), so it prints the same at any card width. Its em is
 * the card's width ÷ 14.5 (at least 17 px, as the smallest card is 248 px), its sizes are 1 em or more, and its small
 * print is floored at the 13 px floor. Only pass.css may size text this way.
 */
const passSize = /^(calc\(var\(--card\) \/ 14\.5\)|1(\.\d+)?em|max\(13px, 0\.\d+em\))$/;

for (const file of readdirSync(dir).filter((name) => name.endsWith(".css"))) {
  readFileSync(new URL(file, dir), "utf8").split("\n").forEach((line, index) => {
    const size = line.match(/^\s*font-size:\s*([^;]+);/)?.[1].trim();
    if (!size) return;
    const at = `${file}:${index + 1} font-size: ${size}`;
    if (file === "pass.css" && passSize.test(size)) return;
    const token = size.match(/^var\((--(?:text|type)-[\w-]+)\)$/)?.[1];
    if (token) {
      if (sheetTokens.has(token)) {
        if (file !== sheetFile) problems.push(`${at} reads the Résumé sheet's ${token} outside its sheet; use a --type-* token`);
      } else if (!typeTokens.has(token)) problems.push(`${at} uses ${token}, which is not a type token`);
      return;
    }
    const px = size.match(/^(\d*\.?\d+)px$/)?.[1];
    if (px) {
      if (Number(px) < displayFrom) problems.push(`${at} is under ${displayFrom} px and not a token`);
      return;
    }
    const least = size.match(/^clamp\(\s*(\d*\.?\d+)px\s*,/)?.[1];
    if (least) {
      if (Number(least) < displayFrom) problems.push(`${at} can fall under ${displayFrom} px, between the text steps; make it a --type-* token or fluid from the width where it clears ${displayFrom} px`);
      return;
    }
    problems.push(`${at} is not a token, a px size or a clamp() with a px minimum`);
  });
}

if (problems.length) {
  console.error(`${problems.join("\n")}\nUse a --type-* token from tokens.css (the Résumé sheet alone keeps --text-label, --text-small and --text-body).`);
  process.exit(1);
}
console.log(`Type scale check passed: every font-size is a type token (or the sheet's own step) (${typeTokens.size} type tokens, none under ${floor} px) or a display size of ${displayFrom} px or more.`);
