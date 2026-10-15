import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PROJECT_CATEGORIES, projects, featuredSlugs } from "../src/content/projects.ts";
import { caseStudies } from "../src/content/stretch/case-studies.ts";
import {
  caseStudyCopy,
  caseStudyOpening,
  caseStudyProblems,
  caseStudySectionKeys,
  caseStudySectionLabels,
} from "../src/content/stretch/case-study.ts";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories.ts";
import {
  roleStoryBack,
  roleStoryCopy,
  roleStoryDescription,
  roleStoryName,
  roleStoryProblems,
  roleStorySectionKeys,
  roleStorySectionLabels,
} from "../src/content/stretch/role-story.ts";
import { howIWork } from "../src/content/stretch/how-i-work.ts";
import { offTheClock } from "../src/content/stretch/off-the-clock.ts";
import { hero, notFound, sayHello, siteCopy, thingsIMake, workArchive } from "../src/content/stretch/site-copy.ts";
import { work } from "../src/content/stretch/work.ts";

const raw = readFileSync(new URL("../docs/content/redesign-copy.md", import.meta.url), "utf8");
// Emphasis stars and the {braces} around live values are markup, not words.
const plain = raw.replace(/\*/g, "").replace(/[{}]/g, "");

// ---- Every string in the typed modules is in the approved copy ----------------------------

const leaves = (value, path = "") => {
  // Links, image paths, dates, anchors, category keys and Role story slugs are addresses and data, not words, so the approved copy does not list them.
  if (typeof value === "string") return /(href|src|writtenOn|\.id|\.category|\.story)$/.test(path) ? [] : [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, index) => leaves(item, `${path}[${index}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, item]) => leaves(item, `${path}.${key}`));
  return [];
};
const modules = {
  siteCopy,
  notFound,
  hero,
  thingsIMake,
  sayHello,
  workArchive,
  howIWork,
  work,
  offTheClock,
  caseStudyCopy,
  caseStudySectionLabels,
  roleStoryBack,
  roleStoryCopy,
  roleStorySectionLabels,
};
for (const [name, module] of Object.entries(modules)) {
  for (const [path, text] of leaves(module, name)) {
    assert.ok(plain.includes(text), `${path} is not in docs/content/redesign-copy.md: "${text}"`);
  }
}

// Strings built from live values, filled with the copy's own placeholders.
const built = [
  siteCopy.title("Page"),
  siteCopy.clock.label("14:05"),
  siteCopy.clock.spoken("14:05"),
  thingsIMake.note(6, 3),
  thingsIMake.allThings(6),
  offTheClock.curiosity.more("n"),
  offTheClock.nowMaking.fallback.latest("repo", "date"),
  offTheClock.github.contributions("1,221"),
  offTheClock.github.busiest("September–October"),
  offTheClock.github.asOf("date"),
];
for (const text of built) assert.ok(plain.includes(text), `Built string is not in the approved copy: "${text}"`);
assert.equal(thingsIMake.note(6, 3), "06 things I’ve built · 03 I’m proudest of");
assert.equal(thingsIMake.allThings(projects.length), "Everything I’ve built (06) →");

// ---- Tables and sections, word for word --------------------------------------------------

const rows = (text, heading) => {
  const lines = text.slice(text.indexOf(heading)).split("\n").slice(1);
  const table = [];
  for (const line of lines.slice(lines.findIndex((entry) => entry.startsWith("|")))) {
    if (!line.startsWith("|")) break;
    table.push(line);
  }
  return table.slice(2).map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
};

// How I work.
const beats = rows(raw, "## How I work");
assert.equal(beats.length, 3);
assert.deepEqual(
  howIWork.beats.map((beat) => [`**${beat.habit}**`, beat.proof]),
  beats,
);

// The approved copy under a `### name` heading, for the sections that follow.
const copyFor = (name) => {
  const start = raw.indexOf(`### ${name}`);
  const end = raw.slice(start + 1).search(/\n##+ /);
  return raw.slice(start, end === -1 ? undefined : start + 1 + end);
};

// Work: Now, Where I'm headed and How I got here, word for word.
const bullet = (text, label) => text.match(new RegExp(`^- ${label}: (.+)$`, "m"))?.[1];
const { now, headed, gotHere } = work;

const nowRows = Object.fromEntries(rows(copyFor("Now"), "### ").map(([part, copy]) => [part, copy]));
assert.equal([now.role, now.organisation, now.dates].join(" · "), nowRows["Role line"], "Now: role line");
assert.equal(now.proofs.join(" · "), nowRows.Proofs, "Now: proofs");
assert.equal(now.link.label, nowRows.Link, "Now: link");

const headedCopy = copyFor("Where I’m headed");
assert.equal(headed.heading, bullet(headedCopy, "Heading"), "Where I’m headed: heading");
assert.equal(headed.line, bullet(headedCopy, "Line"), "Where I’m headed: line");
assert.deepEqual(
  headed.strands.map((strand) => [strand.title, strand.proof, strand.link.label]),
  rows(headedCopy, "### "),
  "Where I’m headed: strands",
);

const gotHereCopy = copyFor("How I got here");
assert.equal(gotHere.heading, bullet(gotHereCopy, "Heading"), "How I got here: heading");
assert.equal(gotHere.note, bullet(gotHereCopy, "Note"), "How I got here: note");
assert.deepEqual(
  gotHere.rows.map((row) => [row.dates, row.organisation ? `${row.role} · ${row.organisation}` : row.role, row.note]),
  rows(gotHereCopy, "### "),
  "How I got here: rows",
);
assert.equal(work.heading, bullet(raw.slice(raw.indexOf("## Work\n")), "Heading"), "Work: heading");

// Every link goes somewhere that exists: a Role story, or a section of the homepage. Rows run newest first.
const links = [now.link, ...headed.strands.map((strand) => strand.link)];
for (const { href } of links) {
  assert.ok(href.startsWith("#") ? siteCopy.menu.some(({ id }) => `#${id}` === href) : roleStorySlugs.some((slug) => href === `/work/${slug}`), `Work links to "${href}", which does not exist`);
}
for (const row of gotHere.rows) assert.ok(row.story === null || roleStorySlugs.includes(row.story), `${row.dates} opens a Role story that does not exist`);
assert.deepEqual(gotHere.rows.map((row) => row.story), ["joveen", "optegra", null], "How I got here runs newest first, and History has no story");
assert.deepEqual(siteCopy.menu.map(({ id }) => id), ["work", "things-i-make", "how-i-work", "off-the-clock", "say-hello"], "The menu follows the page");

// Case studies.
const names = { threshold: "Threshold", "argus-risk": "Argus Risk", flowtime: "Flowtime" };
const studies = Object.values(caseStudies);

for (const study of studies) {
  const table = Object.fromEntries(rows(copyFor(names[study.slug]), "### ").map(([label, text]) => [label, text]));
  const opening = caseStudyOpening(study, projects);
  assert.equal(
    [opening.outcome, opening.metadata, opening.stack, opening.note].filter(Boolean).join(" · "),
    table.Opening,
    `${study.slug}: opening`,
  );
  assert.equal(study.description, table["Meta description"], `${study.slug}: meta description`);

  const lead = (section) => (section.heading ? `**${section.heading}** ` : "");
  const points = (section) => section.points?.map((point) => `*${point.lead}* ${point.text}`).join(" ") ?? "";
  const prose = (section) => lead(section) + (section.paragraphs?.join(" ") ?? "") + points(section);
  const prd = study.prd;
  const prdText = [prd.lead, `“${prd.quote}”`, prd.after].filter(Boolean).join(" ");
  const evidence = study.evidence.map((item) => `${item.value} ${item.label}`).join(" · ");
  const expected = {
    "where-it-started": prose(study.sections["where-it-started"]),
    "written-down-first": `${lead(study.sections["written-down-first"])}${prdText} · Evidence: ${evidence}`,
    decisions: prose(study.sections.decisions),
    "how-its-built": prose(study.sections["how-its-built"]),
    "where-it-stands": prose(study.sections["where-it-stands"]),
    "whats-next": prose(study.sections["whats-next"]),
  };
  caseStudySectionKeys.forEach((key, index) => {
    const label = `${String(index + 1).padStart(2, "0")} ${caseStudySectionLabels[key]}`;
    // The copy ends Argus's quoted line with a full stop after the closing quote.
    const approved = (table[label] ?? "").replace("”. · Evidence", "” · Evidence");
    assert.equal(expected[key], approved, `${study.slug}: ${label}`);
  });
}

// Role stories.
const roles = Object.values(roleStories);

for (const story of roles) {
  const table = Object.fromEntries(rows(copyFor(story.employer), "### ").map(([label, text]) => [label, text]));
  assert.equal([story.role, story.metadata].join(" · "), table.Opening, `${story.slug}: opening`);
  assert.equal(siteCopy.title(roleStoryName(story)), table.Title, `${story.slug}: title`);
  assert.equal(roleStoryDescription(story), table["Meta description"], `${story.slug}: meta description`);
  assert.equal([story.employer, story.role, siteCopy.socialImage.name].join(" · "), table["Social card"], `${story.slug}: social card`);

  const points = (section) => section.points?.map((point) => `*${point.lead}* ${point.text}`).join(" ") ?? "";
  const prose = (section) => [section.paragraphs?.join(" "), points(section)].filter(Boolean).join(" ");
  const evidence = story.evidence.map((item) => `${item.value} ${item.label}`).join(" · ");
  roleStorySectionKeys.forEach((key, index) => {
    const label = `${String(index + 1).padStart(2, "0")} ${roleStorySectionLabels[key]}`;
    const expected = key === "what-changed" ? `${prose(story.sections[key])} · Evidence: ${evidence}` : prose(story.sections[key]);
    assert.equal(expected, table[label], `${story.slug}: ${label}`);
  });
}

// ---- Shape and the catalogue ----------------------------------------------------------------

assert.deepEqual(caseStudyProblems(studies, projects), []);
for (const slug of featuredSlugs) assert.ok(caseStudies[slug], `${slug} is featured and has a case study`);
assert.deepEqual(studies.map((study) => study.next), ["argus-risk", "flowtime", "threshold"], "Next project follows the featured order");
assert.deepEqual(studies.map((study) => study.number), ["01", "02", "03"]);

// The problems are reported by name.
const [threshold] = studies;
assert.match(caseStudyProblems([{ ...threshold, evidence: [...threshold.evidence, threshold.evidence[0]] }, studies[1], studies[2]], projects)[0], /more than 4 evidence/);
assert.match(caseStudyProblems([{ ...threshold, next: "threshold" }], projects)[0], /different case study/);
assert.match(caseStudyProblems([{ ...threshold, slug: "ghost" }, threshold], projects)[0], /"ghost" has no project/);
assert.match(
  caseStudyProblems([{ ...threshold, sections: { ...threshold.sections, decisions: {} } }, studies[1]], projects)[0],
  /empty "decisions" section/,
);
assert.throws(() => caseStudyOpening({ ...threshold, slug: "home-secretary" }, projects), /needs its project's screenshot and colours/);

assert.deepEqual(roleStoryProblems(roles), []);
assert.deepEqual(roles.map((story) => story.slug), ["bnp-paribas", "joveen", "optegra"], "Role stories run newest to oldest");
assert.deepEqual(roles.map((story) => story.next), ["joveen", "optegra", null], "Next role follows the order, and Optegra ends on ← Work");
assert.deepEqual(roles.map((story) => story.number), ["01", "02", "03"]);
const [bnp, ...rest] = roles;
assert.match(roleStoryProblems([{ ...bnp, evidence: [...bnp.evidence, bnp.evidence[0]] }, ...rest])[0], /more than 4 evidence/);
assert.match(roleStoryProblems([{ ...bnp, next: "bnp-paribas" }, ...rest])[0], /different Role story or none/);
assert.match(roleStoryProblems([{ ...bnp, next: "ghost" }, ...rest])[0], /different Role story or none/);
assert.match(roleStoryProblems([{ ...bnp, sections: { ...bnp.sections, decisions: {} } }, ...rest])[0], /empty "decisions" section/);

// Each entry owns its pairing, so reordering the copy cannot redirect a link or a filter.
assert.deepEqual(workArchive.filters.map(({ category }) => category), [null, ...PROJECT_CATEGORIES], "the filters are All, then every category once, in the catalogue's order");
for (const [what, ids] of [["menu", siteCopy.menu.map(({ id }) => id)], ["Say hello links", sayHello.links.map(({ id }) => id)]]) {
  assert.equal(new Set(ids).size, ids.length, `the ${what} lists each id once`);
}

console.log("Redesign copy checks passed.");
