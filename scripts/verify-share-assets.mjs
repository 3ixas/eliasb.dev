// Fails when a committed share-card PNG in public/share/ is missing or out of date with its StaffPass
// content/tokens or featured project screenshot, or when any share card's text fails WCAG 2.2 AA (4.5:1)
// against its field. Runs without a browser or server as part of `pnpm check`.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { featuredSlugs, projects } from "../src/content/projects.ts";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories.ts";
import { contrastRatio } from "../src/content/stretch/story.ts";
import {
  RENDER_VERSION,
  SHARE_MANIFEST_PATH,
  expectedShareAssets,
  pngDimensions,
  shareAssetProblems,
} from "./share-assets-fingerprint.mjs";

const sharePageColours = { field: "#eeede9", ink: "#141416", cobalt: "#2443d6" };

function readDiskPngSize(relativePath) {
  const url = new URL(`../${relativePath}`, import.meta.url);
  if (!existsSync(url)) return null;
  return pngDimensions(readFileSync(url), relativePath);
}

const manifestUrl = new URL(`../${SHARE_MANIFEST_PATH}`, import.meta.url);
const manifest = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, "utf8")) : null;
const expected = expectedShareAssets();
const filesOnDisk = new Map();
for (const [name, spec] of Object.entries(expected)) {
  const size = readDiskPngSize(spec.path);
  if (size) filesOnDisk.set(name, size);
}

const problems = shareAssetProblems(manifest, expected, filesOnDisk);
if (problems.length) {
  console.error(
    `Share card assets are out of date:\n  ${problems.join("\n  ")}\nRun \`pnpm share:assets\` against a running site and commit public/share/.`,
  );
  process.exit(1);
}

// Every share card's text pair holds WCAG 2.2 AA normal text (>= 4.5:1) against its field.
const cardPairs = [
  ["homepage ink", sharePageColours.ink, sharePageColours.field],
  ["homepage cobalt", sharePageColours.cobalt, sharePageColours.field],
  ...roleStorySlugs.map((slug) => [`role story "${slug}"`, roleStories[slug].panel.ink, roleStories[slug].panel.field]),
  ...featuredSlugs.map((slug) => {
    const panel = projects.find((entry) => entry.slug === slug)?.panel;
    assert.ok(panel, `Featured project "${slug}" has panel colours`);
    return [`case study "${slug}"`, panel.ink, panel.field];
  }),
];
for (const [label, ink, field] of cardPairs) {
  const ratio = contrastRatio(ink, field);
  assert.ok(ratio >= 4.5, `Share card ${label} (${ink} on ${field}) is ${ratio.toFixed(2)}:1; it needs 4.5:1.`);
}

// Self-tests: prove a changed pass role, a changed screenshot, changed site tokens, a missing PNG,
// a wrong size, a version mismatch and an unexpected manifest entry all fail.
const repoRead = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url));

const changedRole = expectedShareAssets({
  stories: {
    ...roleStories,
    "bnp-paribas": { ...roleStories["bnp-paribas"], role: "Principal engineer" },
  },
});
assert.match(
  shareAssetProblems(manifest, changedRole, filesOnDisk).join("\n"),
  /pass-bnp-paribas\.png is stale/,
  "A changed Role story role must flag its pass PNG as stale",
);

const changedShot = expectedShareAssets({
  read: (path) => (path === "public/work/threshold/answer.webp" ? Buffer.from("mutated-webp") : repoRead(path)),
});
assert.match(
  shareAssetProblems(manifest, changedShot, filesOnDisk).join("\n"),
  /shot-threshold\.png is stale/,
  "A changed project screenshot must flag its share PNG as stale",
);

const changedTokens = expectedShareAssets({
  read: (path) => (path === "src/app/tokens.css" ? Buffer.from("/* changed tokens */") : repoRead(path)),
});
assert.match(
  shareAssetProblems(manifest, changedTokens, filesOnDisk).join("\n"),
  /pass-bnp-paribas\.png is stale/,
  "A changed tokens.css must flag pass PNGs as stale",
);

const missingFile = new Map(filesOnDisk);
missingFile.delete("shot-threshold.png");
assert.match(
  shareAssetProblems(manifest, expected, missingFile).join("\n"),
  /shot-threshold\.png does not exist/,
  "A missing share asset must fail the check",
);

const wrongSize = new Map(filesOnDisk);
wrongSize.set("pass-joveen.png", { width: 1, height: 1 });
assert.match(
  shareAssetProblems(manifest, expected, wrongSize).join("\n"),
  /pass-joveen\.png is 1×1/,
  "A mismatched PNG dimension must fail the check",
);

assert.match(
  shareAssetProblems({ ...manifest, version: RENDER_VERSION + 1 }, expected, filesOnDisk).join("\n"),
  /render version/,
  "A manifest render-version mismatch must fail the check",
);

assert.match(
  shareAssetProblems({ ...manifest, assets: { ...manifest.assets, "pass-ghost.png": { width: 1, height: 1, fingerprint: "x" } } }, expected, filesOnDisk).join("\n"),
  /unexpected asset "pass-ghost\.png"/,
  "An unexpected manifest entry must fail the check",
);

console.log(`Share asset checks passed: ${Object.keys(expected).length} PNGs fresh and ${cardPairs.length} card colour pairs >= 4.5:1 AA.`);
