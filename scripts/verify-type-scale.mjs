// Every `font-size` in src/app/*.css must be one the check can vouch for (docs/design/STRETCH.md, "Type"):
// one of the five text tokens, a px size of 24 or more, a clamp() whose minimum keeps the 13 px floor,
// or a display expression named below. Anything else (rem, em, %, a bare vw, a new expression) fails.
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../src/app/", import.meta.url);
const tokens = new Set(["--text-label", "--text-small", "--text-body", "--text-lead", "--text-quote"]);
const floor = 13;

/** Display sizes the patterns above can't read, each with why it never gets small. */
const display = new Map([
  ["var(--say-hello-size)", "Say hello: clamp(56px, 11vw, 160px), clamp(46px, 14.4vw, 56px) on a phone"],
  ["min(var(--footer-size), calc(var(--say-hello-size) * 0.85))", "the footer name: 12vw or clamp(44px, 7vw, 104px), against Say hello"],
  ["min(clamp(56px, 13vw, 128px), var(--cs-name-fit))", "a case study's name, fitted to its column's width"],
  ["min(clamp(36px, 7.5vw, 76px), var(--cs-name-fit))", "a Role story's name, fitted to its column's width"],
  ["min(31.5vw, 28svh)", "the hero name: about 100 px on a 320 px phone"],
]);

const problems = [];

for (const file of readdirSync(dir).filter((name) => name.endsWith(".css"))) {
  readFileSync(new URL(file, dir), "utf8").split("\n").forEach((line, index) => {
    const size = line.match(/^\s*font-size:\s*([^;]+);/)?.[1].trim();
    if (!size) return;
    const at = `${file}:${index + 1} font-size: ${size}`;
    const token = size.match(/^var\((--text-[\w-]+)\)$/)?.[1];
    if (token) {
      if (!tokens.has(token)) problems.push(`${at} uses ${token}, which is not a text token`);
      return;
    }
    const px = size.match(/^(\d*\.?\d+)px$/)?.[1];
    if (px) {
      if (Number(px) < 24) problems.push(`${at} is under 24 px and not a token`);
      return;
    }
    const least = size.match(/^clamp\(\s*(\d*\.?\d+)px\s*,/)?.[1];
    if (least) {
      if (Number(least) < floor) problems.push(`${at} can fall under the ${floor} px floor`);
      return;
    }
    if (!display.has(size)) problems.push(`${at} is not a token, a px size, a clamp() with a px minimum or a named display size`);
  });
}

if (problems.length) {
  console.error(`${problems.join("\n")}\nUse --text-label (13px), --text-small, --text-body, --text-lead or --text-quote.`);
  process.exit(1);
}
console.log(`Type scale check passed: every font-size is a text token, 24 px or more, or a display size that keeps the ${floor} px floor.`);
