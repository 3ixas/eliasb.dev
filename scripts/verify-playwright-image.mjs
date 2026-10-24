// Fails when the Playwright image the e2e job runs in is not the release of @playwright/test
// that pnpm-lock.yaml resolves: the image carries the browsers for exactly one release, so a
// library upgrade without a new image tag fails every shard with a missing executable.
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const locked = read("pnpm-lock.yaml").match(/^ {6}'@playwright\/test':\n {8}specifier: .+\n {8}version: (\d+\.\d+\.\d+)/m)?.[1];
const images = [...read(".github/workflows/quality.yml").matchAll(/image:\s*mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-\S+/g)].map((match) => match[1]);

if (!locked) {
  console.error("Could not find the @playwright/test version in pnpm-lock.yaml.");
  process.exit(1);
}
if (!images.length) {
  console.error("Found no mcr.microsoft.com/playwright image in .github/workflows/quality.yml.");
  process.exit(1);
}
const stale = images.filter((version) => version !== locked);
if (stale.length) {
  console.error(
    `quality.yml runs the Playwright image v${stale[0]} but pnpm-lock.yaml resolves @playwright/test ${locked}. ` +
      `Change the image tag to v${locked}-noble and its @sha256 digest together.`,
  );
  process.exit(1);
}
console.log(`Playwright image check passed: quality.yml and pnpm-lock.yaml are both on ${locked}.`);
