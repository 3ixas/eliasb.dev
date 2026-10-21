// Fails on any `font-size` under 24 px in src/app/*.css that is not one of the five text tokens
// (docs/design/STRETCH.md, "Type"). Display sizes (clamp(), vw/svh, 24 px and up) are out of scope.
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../src/app/", import.meta.url);
const tokens = new Set(["--text-label", "--text-small", "--text-body", "--text-lead", "--text-quote"]);
const problems = [];

for (const file of readdirSync(dir).filter((name) => name.endsWith(".css"))) {
  readFileSync(new URL(file, dir), "utf8").split("\n").forEach((line, index) => {
    const size = line.match(/^\s*font-size:\s*([^;]+);/)?.[1].trim();
    if (!size) return;
    const token = size.match(/^var\((--text-[\w-]+)\)$/)?.[1];
    if (token) {
      if (!tokens.has(token)) problems.push(`${file}:${index + 1} uses ${token}, which is not a text token`);
      return;
    }
    const px = size.match(/^(\d*\.?\d+)px$/)?.[1];
    if (px && Number(px) < 24) problems.push(`${file}:${index + 1} font-size: ${size} is under 24 px and not a token`);
  });
}

if (problems.length) {
  console.error(`${problems.join("\n")}\nUse --text-label (13px), --text-small, --text-body, --text-lead or --text-quote.`);
  process.exit(1);
}
console.log("Type scale check passed: every font-size under 24 px uses a text token.");
