// Fails when `stretch-fastener` is written in any source file but the Fastener component
// (src/components/site/fastener.tsx), which owns the markup and the rule that a Fastener goes only
// on a tile or a sheet (GLOSSARY.md, "Fastener"). The stylesheets define the class and are exempt.
import { readdirSync, readFileSync } from "node:fs";
import { sep } from "node:path";

const root = new URL("../src/", import.meta.url);
const owner = "components/site/fastener.tsx";

const problems = [];
for (const entry of readdirSync(root, { recursive: true })) {
  const file = String(entry).split(sep).join("/");
  if (!/\.(tsx?|jsx?|mdx?)$/.test(file) || file === owner) continue;
  readFileSync(new URL(file, root), "utf8").split("\n").forEach((line, index) => {
    if (line.includes("stretch-fastener")) problems.push(`src/${file}:${index + 1} writes stretch-fastener; render <Fastener kind="..." /> from ${owner} instead`);
  });
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("verify:fastener: only the Fastener component writes stretch-fastener");
