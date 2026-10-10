// Fails when a `verify:*` or `check*` script in package.json is not run by CI, directly or
// through another script: a check that exists but is never wired in guards nothing.
import { readFileSync } from "node:fs";

const { scripts } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const workflow = readFileSync(new URL("../.github/workflows/quality.yml", import.meta.url), "utf8");

const calls = (command) => [...command.matchAll(/\bpnpm\s+(?:run\s+)?([\w:.-]+)/g)].map((match) => match[1]);

const reached = new Set();
const visit = (name) => {
  if (reached.has(name) || !(name in scripts)) return;
  reached.add(name);
  for (const called of calls(scripts[name])) visit(called);
};
for (const line of workflow.split("\n").filter((text) => /^\s*(-\s+)?run:/.test(text))) {
  for (const name of calls(line)) visit(name);
}

const unwired = Object.keys(scripts).filter((name) => /^(verify:|check)/.test(name) && !reached.has(name));
if (unwired.length) {
  console.error(`Not run by .github/workflows/quality.yml: ${unwired.join(", ")}. Add them to \`check\` or \`check:built\`.`);
  process.exit(1);
}
console.log(`CI coverage checks passed: every verify and check script (${[...reached].filter((name) => /^(verify:|check)/.test(name)).length}) is run by CI.`);
