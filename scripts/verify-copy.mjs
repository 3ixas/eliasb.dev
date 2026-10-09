import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { projects, featuredSlugs } from "../src/content/projects.ts";
import { careerLog } from "../src/content/stretch/career.ts";
import { caseStudies } from "../src/content/stretch/case-studies.ts";
import {
  caseStudyCopy,
  caseStudyOpening,
  caseStudyProblems,
  caseStudySectionKeys,
  caseStudySectionLabels,
} from "../src/content/stretch/case-study.ts";
import { howIWork } from "../src/content/stretch/how-i-work.ts";
import { offTheClock } from "../src/content/stretch/off-the-clock.ts";
import { hero, notFound, sayHello, siteCopy, workArchive, workSection } from "../src/content/stretch/site-copy.ts";

const raw = readFileSync(new URL("../docs/content/redesign-copy.md", import.meta.url), "utf8");
// Emphasis stars and the {braces} around live values are markup, not words.
const plain = raw.replace(/\*/g, "").replace(/[{}]/g, "");

// ---- Every string in the typed modules is in the approved copy ----------------------------

const leaves = (value, path = "") => {
  // Links, image paths and dates are addresses and data, not words, so the approved copy does not list them.
  if (typeof value === "string") return /(href|src|writtenOn)$/.test(path) ? [] : [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, index) => leaves(item, `${path}[${index}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, item]) => leaves(item, `${path}.${key}`));
  return [];
};
const modules = {
  siteCopy,
  notFound,
  hero,
  workSection,
  sayHello,
  workArchive,
  howIWork,
  careerLog,
  offTheClock,
  caseStudyCopy,
  caseStudySectionLabels,
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
  workSection.note(6, 3),
  workSection.allWork(6),
  offTheClock.curiosity.more("n"),
  offTheClock.nowMaking.fallback.latest("repo", "date"),
  offTheClock.github.contributions("1,221"),
  offTheClock.github.busiest("September–October"),
  offTheClock.github.asOf("date"),
];
for (const text of built) assert.ok(plain.includes(text), `Built string is not in the approved copy: "${text}"`);
assert.equal(workSection.note(6, 3), "06 things I’ve built · 03 I’m proudest of");
assert.equal(workSection.allWork(projects.length), "All work (06) →");

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

// The career log: dates, role and organisation, then notes and milestones.
const stages = rows(raw, "## Where I’ve been");
assert.equal(stages.length, careerLog.stages.length);
careerLog.stages.forEach((stage, index) => {
  const [dates, role, rest] = stages[index];
  assert.equal(stage.dates, dates);
  assert.equal(stage.organisation ? `${stage.role} · ${stage.organisation}` : stage.role, role);
  const notes = stage.notes.map((note) => (note.when ? `${note.text} *${note.when}*` : note.text)).join(" · ");
  const milestones = stage.milestones.map((milestone) => ` ◆ ${milestone.text} *${milestone.when}*`).join("");
  assert.equal(notes + milestones, rest, `${dates}: notes and milestones`);
});
assert.deepEqual(careerLog.stages.map((stage) => stage.isCurrent), [false, false, false, true], "Only the BNP Paribas stage is current");

// Case studies.
const copyFor = (name) => {
  const start = raw.indexOf(`### ${name}`);
  const end = raw.slice(start + 1).search(/\n##+ /);
  return raw.slice(start, end === -1 ? undefined : start + 1 + end);
};
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

console.log("Redesign copy checks passed.");
