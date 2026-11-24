// Fingerprints the inputs that produce the committed share-card PNGs in public/share/ (the three StaffPass
// stills and PNG copies of the featured case studies' WebP screenshots, because Satori/resvg drops WebP).
// Shared by scripts/render-share-assets.mjs and scripts/verify-share-assets.mjs.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { featuredSlugs, projects } from "../src/content/projects.ts";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories.ts";
import { passHang, passRecords, passStatus } from "../src/content/stretch/staff-pass.ts";

export const SHARE_ASSET_DIR = "public/share";
export const SHARE_MANIFEST_PATH = `${SHARE_ASSET_DIR}/manifest.json`;
export const RENDER_VERSION = 1;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Parses width and height from a PNG header, throwing when the buffer is not a valid PNG. */
export function pngDimensions(bytes, label = "image") {
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error(`${label} is not a valid PNG`);
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const repoFile = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url));
const sha256 = (parts) => {
  const hash = createHash("sha256");
  for (const part of parts) hash.update(part);
  return hash.digest("hex");
};

/** Expected share-card assets and the SHA-256 fingerprint of the source content each one was rendered from. */
export function expectedShareAssets({
  stories = roleStories,
  records = passRecords,
  hangs = passHang,
  catalogue = projects,
  featured = featuredSlugs,
  read = repoFile,
} = {}) {
  const passTemplate = [
    String(RENDER_VERSION),
    read("public/profile/elias-evening-pass.webp"),
    read("src/components/parts/staff-pass.tsx"),
    read("src/app/fixtures/share-passes/page.tsx"),
    read("src/app/pass.css"),
    read("src/app/tokens.css"),
  ];

  const assets = {};

  for (const slug of roleStorySlugs) {
    const story = stories[slug];
    const record = records[slug];
    const hang = hangs[slug];
    const data = JSON.stringify({
      slug,
      short: record.short,
      lanyard: record.lanyard,
      role: story.role,
      dates: story.dates,
      panel: story.panel,
      hang,
      status: passStatus(hang.state),
    });
    assets[`pass-${slug}.png`] = {
      kind: "pass",
      slug,
      path: `${SHARE_ASSET_DIR}/pass-${slug}.png`,
      fingerprint: sha256([...passTemplate, data]),
    };
  }

  for (const slug of featured) {
    const project = catalogue.find((entry) => entry.slug === slug);
    if (!project?.screenshot) throw new Error(`Featured project "${slug}" has no screenshot to render for its share card.`);
    const sourcePath = `public${project.screenshot.src}`;
    assets[`shot-${slug}.png`] = {
      kind: "screenshot",
      slug,
      path: `${SHARE_ASSET_DIR}/shot-${slug}.png`,
      source: sourcePath,
      fingerprint: sha256([String(RENDER_VERSION), sourcePath, read(sourcePath)]),
    };
  }

  return assets;
}

/** Pure staleness check, returning one sentence per problem; empty when every committed asset matches live inputs. */
export function shareAssetProblems(manifest, expected, filesOnDisk) {
  const problems = [];
  if (!manifest || typeof manifest !== "object" || !manifest.assets || typeof manifest.assets !== "object") {
    return [`${SHARE_MANIFEST_PATH} is missing or unreadable.`];
  }
  if (manifest.version !== RENDER_VERSION) {
    problems.push(`${SHARE_MANIFEST_PATH} is render version ${manifest.version}, expected ${RENDER_VERSION}.`);
  }
  for (const [name, spec] of Object.entries(expected)) {
    const recorded = manifest.assets[name];
    if (!recorded) {
      problems.push(`${spec.path} is missing from ${SHARE_MANIFEST_PATH}.`);
      continue;
    }
    if (recorded.fingerprint !== spec.fingerprint) {
      problems.push(`${spec.path} is stale: its ${spec.kind} content changed since it was rendered.`);
    }
    const disk = filesOnDisk.get(name);
    if (!disk) {
      problems.push(`${spec.path} does not exist on disk.`);
    } else if (disk.width !== recorded.width || disk.height !== recorded.height) {
      problems.push(`${spec.path} is ${disk.width}×${disk.height}, but ${SHARE_MANIFEST_PATH} records ${recorded.width}×${recorded.height}.`);
    }
  }
  for (const name of Object.keys(manifest.assets)) {
    if (!(name in expected)) problems.push(`${SHARE_MANIFEST_PATH} lists unexpected asset "${name}".`);
  }
  return problems;
}
