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
  roleStoryMetadata,
  roleStoryName,
  roleStoryProblems,
  roleStorySectionKeys,
  roleStorySectionLabels,
} from "../src/content/stretch/role-story.ts";
import { currentPassStatus, passLinkLabel, passProblems, passRecords } from "../src/content/stretch/staff-pass.ts";
import { howIWork, shortPrdDate } from "../src/content/stretch/how-i-work.ts";
import { greetingKey, greetingLine } from "../src/content/stretch/greeting.ts";
import { offTheClock } from "../src/content/stretch/off-the-clock.ts";
import { opening } from "../src/content/stretch/opening.ts";
import { notFound, sayHello, siteCopy, thingsIMake, workArchive } from "../src/content/stretch/site-copy.ts";
import { headedProblems, PAPER_SURFACE, shownSource, work } from "../src/content/stretch/work.ts";
import { comparisonRow, workPanelProblems, workPanels } from "../src/content/stretch/work-panels.ts";
import { simulationCopy } from "../src/content/stretch/simulation-copy.ts";
import { thresholdLinkCopy } from "../src/content/stretch/threshold-link.ts";
import { argusProvenanceCopy } from "../src/content/stretch/argus-provenance.ts";
import { flowtimeBreakCopy } from "../src/content/stretch/flowtime-break.ts";
import { hostLabel } from "../src/components/site/host-label.ts";

const raw = readFileSync(new URL("../docs/content/redesign-copy.md", import.meta.url), "utf8");
// Emphasis stars and the {braces} around live values are markup, not words.
const plain = raw.replace(/\*/g, "").replace(/[{}]/g, "");

// ---- Every string in the typed modules is in the approved copy ----------------------------

const leaves = (value, path = "") => {
  // Links, image paths, a figure's kind, a comparison's unit and its screens' devices, dates, anchors, category keys and Role story slugs are addresses and data, not words, so the approved copy does not list them.
  if (typeof value === "string") return /(href|src|writtenOn|\.id|\.glyph|\.slug|\.figures\.[\w-]+\.kind|\.rows\[\d+\]\.unit|\.pairs\[\d+\]\.unit|\.figures\.[\w-]+\.images\[\d+\]\.device|\.category|\.story|\.project|\.restates\[\d+\]|\.drawn\.kind|\.drawn\.projects\[\d+\])$/.test(path) ? [] : [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, index) => leaves(item, `${path}[${index}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, item]) => leaves(item, `${path}.${key}`));
  return [];
};
const modules = {
  simulationCopy,
  // The working link's own words; its cities, districts and places are Threshold's data.
  thresholdLinkCopy,
  // Argus's working figure's words; its symbols, prices and rates are illustrative data.
  argusProvenanceCopy,
  // Flowtime's working figure's words; its minutes are Flowtime's rule.
  flowtimeBreakCopy,
  siteCopy,
  notFound,
  // The opening's own words; the runs are the same sentences cut up.
  opening: {
    headline: opening.headline,
    support: opening.support,
  },
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
  siteCopy.header.londonTime("14:28"),
  thingsIMake.allThings(6),
  offTheClock.curiosity.count(1, 3),
  offTheClock.github.contributions("1,221"),
  ...["GitHub", "Wikipedia"].map(offTheClock.live),
  offTheClock.fromAsOf("Goodreads", "date"),
  argusProvenanceCopy.announce("symbol", "value"),
  flowtimeBreakCopy.minutes("n"),
  flowtimeBreakCopy.valueText("focus", "break"),
];
for (const text of built) assert.ok(plain.includes(text), `Built string is not in the approved copy: "${text}"`);
assert.equal(thingsIMake.note, "Products of my own, from a rental calculator to a risk simulator.");
assert.equal(`${thingsIMake.allThings(projects.length)} →`, "Everything I’ve built (6) →");

// The 404's visitor pass, section title and note are listed field by field, and each section's line is in the deck's table.
for (const line of [
  `- Section title: ${notFound.tryTitle}`,
  `- Section note: ${notFound.tryNote}`,
  `its band says ${notFound.pass.band};`,
  `Its line is ${notFound.missing.line} and its metadata is ${notFound.missing.meta}.`,
]) assert.ok(raw.includes(line), `The 404 copy lacks the line "${line}"`);
assert.deepEqual(
  siteCopy.menu.map(({ id }) => id),
  Object.keys(notFound.tryLines),
  "The 404 has a line for each homepage section, in the homepage's order",
);
for (const { id, label } of siteCopy.menu) {
  assert.ok(raw.includes(`| ${label} | ${notFound.tryLines[id]} |`), `The 404 copy lacks the row "${label}": ${notFound.tryLines[id]}`);
}

// The header greeting follows the visitor's own hour, with the approved edges.
const greetingAt = (hour, weekend = false) => greetingLine(greetingKey(hour), weekend);
for (const [hour, line] of [
  [0, "Still up?"], [4, "Still up?"], [5, "Kettle’s on."], [11, "Kettle’s on."], [12, "Nearly five?"],
  [16, "Nearly five?"], [17, "Home yet?"], [21, "Home yet?"], [22, "Still up?"], [23, "Still up?"],
]) {
  assert.equal(greetingAt(hour), line, `The greeting at ${hour}:00 to ${hour}:59`);
}
// The afternoon alone changes with the day.
for (const hour of [12, 16]) assert.equal(greetingAt(hour, true), "Nowhere to be?", `The weekend greeting at ${hour}:00`);
for (const hour of [0, 5, 11, 17, 21, 22]) assert.equal(greetingAt(hour, true), greetingAt(hour), `The greeting at ${hour}:00 is the same every day`);
assert.equal(siteCopy.greeting.hello, "Hello");
for (let hour = 0; hour < 24; hour += 1) assert.notEqual(greetingKey(hour), "hello", "Only the browser's clock picks a greeting; hello is the line before it");

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

// The opening names the employer once on screen, in the h1 (#243): "BNP" is in the headline and nowhere else in the opening.
assert.equal([opening.headline, opening.support].join(" ").match(/BNP/g)?.length, 1, "The opening names BNP exactly once");
assert.ok(opening.headline.includes("BNP"), "The opening's one BNP is in the h1");

// The opening's lines are the copy deck's, and the runs the page draws put them back together exactly.
const openingRows = Object.fromEntries(rows(raw, "## Opening").map(([where, copy]) => [where, copy.replaceAll("*", "")]));
assert.equal(opening.headline, openingRows["Opening line (`h1`)"], "The opening line");
assert.equal(opening.support, openingRows["Supporting line"], "The supporting line");
assert.equal(opening.headlineRuns.map((run) => run.text).join(""), opening.headline, "The opening's headline runs read as the headline");

// How I work: four habits, their highlights, drawn proofs and PRD link.
{
  const howSection = copyFor("How I work");
  const howRows = rows(howSection, "### ");
  assert.equal(howIWork.beats.length, 4, "How I work has four habits");
  assert.equal(howIWork.note, bullet(howSection, "Note"), "How I work: note");
  // Each card highlights a phrase of its story, so the phrase must be in the story word for word.
  for (const beat of howIWork.beats) assert.ok(beat.proof.includes(beat.highlight), `How I work: "${beat.habit}" has no "${beat.highlight}" in its story to highlight`);
  const drawnAs = ({ drawn }) =>
    drawn.kind === "projects" ? drawn.projects.map((slug) => projects.find((project) => project.slug === slug)?.name).join(" · ")
    : drawn.kind === "count" ? `${drawn.value}, ${drawn.slices} slices`
    : drawn.kind === "switch" ? `A switch, ${drawn.off} / ${drawn.on} · ${drawn.currentPath} · ${drawn.newPath}`
    : `${drawn.value}, ${drawn.before} · ${drawn.after}, its bar ${drawn.percent}% longer`;
  assert.deepEqual(
    howIWork.beats.map((beat) => [beat.habit, beat.proof, beat.highlight, drawnAs(beat)]),
    howRows,
    "How I work: habits, proofs, highlights and drawn proofs",
  );
  const prdDate = caseStudies.threshold.prd.date;
  assert.equal(`${howIWork.prd.title}, ${shortPrdDate(prdDate)} →`, bullet(howSection, "PRD link"), "How I work: the link to the PRD");
  // A drawing never says more than its story or Threshold's evidence: every drawn number is stated.
  for (const beat of howIWork.beats) {
    const { drawn } = beat;
    const number = drawn.kind === "count" ? String(drawn.value) : drawn.kind === "change" ? String(drawn.percent) : null;
    if (number) assert.ok(beat.highlight.includes(number), `How I work: "${beat.habit}" draws ${number}, which its highlighted phrase does not state`);
    if (drawn.kind === "count") {
      assert.ok(
        caseStudies.threshold.evidence.some((item) => item.value === String(drawn.slices) && item.label.includes("slices")),
        `How I work: "${beat.habit}" draws ${drawn.slices} slices, which Threshold's evidence does not state`,
      );
    }
    if (drawn.kind === "change") assert.equal(drawn.value, `+${drawn.percent}%`, `How I work: "${beat.habit}" writes ${drawn.value} for a ${drawn.percent}% change`);
    if (drawn.kind === "projects") for (const slug of drawn.projects) assert.ok(beat.proof.includes(projects.find((project) => project.slug === slug)?.name ?? slug), `How I work: "${beat.habit}" draws ${slug}, which its story does not name`);
  }
}

// Off the clock: the compact 7-day cue labels (R-50, R-55) match the deck table and come from each day's session.
{
  const otcFrom = raw.indexOf("## Off the clock");
  const otcNext = raw.indexOf("\n## ", otcFrom + 1);
  const otcSection = raw.slice(otcFrom, otcNext === -1 ? undefined : otcNext);
  const cueRows = rows(otcSection, "### Training week");
  assert.deepEqual(
    offTheClock.training.days.map(({ short, long, cue, session }) => [short, long, cue, session]),
    cueRows,
    "Off the clock: the 7-day workout cue table",
  );
  for (const day of offTheClock.training.days) {
    assert.ok(day.session.toLowerCase().includes(day.cue.toLowerCase()), `Off the clock: ${day.short} cue "${day.cue}" is not sourced from "${day.session}"`);
  }
}

// The approved copy under a `### name` heading, for the sections that follow.
function copyFor(name) {
  const start = raw.indexOf(`### ${name}`);
  const end = raw.slice(start + 1).search(/\n##+ /);
  return raw.slice(start, end === -1 ? undefined : start + 1 + end);
}

// Work and Where I'm headed, word for word.
function bullet(text, label) {
  return text.match(new RegExp(`^- ${label}: (.+)$`, "m"))?.[1];
}
const { headed } = work;

const headedCopy = copyFor("Where I’m headed");
assert.equal(headed.heading, bullet(headedCopy, "Heading"), "Where I’m headed: heading");
assert.equal(headed.line, bullet(headedCopy, "Lead"), "Where I’m headed: lead");
assert.equal(headed.soFar, bullet(headedCopy, "Tag"), "Where I’m headed: tag");
assert.deepEqual(
  headed.bars.map((bar) => [bar.label, bar.title, bar.soFar.text, shownSource(bar.source).link.label]),
  rows(headedCopy, "### "),
  "Where I’m headed: bars",
);

const workSection = raw.slice(raw.indexOf("## Work\n"));
assert.equal(work.heading, bullet(workSection, "Heading"), "Work: heading");
assert.equal(work.note, bullet(workSection, "Subheading"), "Work: subheading");

// Every link goes to a Role story or Case study that exists, and every "So far" restates a fact its source tells.
for (const { source } of headed.bars) {
  const { href } = shownSource(source).link;
  assert.ok(roleStorySlugs.some((slug) => href === `/work/${slug}`) || Object.keys(caseStudies).some((slug) => href === `/things-i-make/${slug}`), `Work links to "${href}", which does not exist`);
}
assert.deepEqual(headedProblems(headed.bars), []);
assert.match(headedProblems([{ ...headed.bars[0], soFar: { ...headed.bars[0].soFar, restates: ["decided what the engineers built next"] } }])[0], /Judgement bar.*decided what the engineers built next/);
assert.match(headedProblems([{ ...headed.bars[2], soFar: { ...headed.bars[2].soFar, restates: ["58 user stories"] } }])[0], /Range bar.*58 user stories/);
assert.match(headedProblems([{ ...headed.bars[2], soFar: { ...headed.bars[2].soFar, text: "Threshold, a live site." } }])[0], /Range bar.*no longer shows "57 user stories"/);
// Each part's drawn proof is held to its "So far" line (#459), and its colour falls back to cobalt when its thread falls under 3:1.
assert.match(headedProblems([{ ...headed.bars[1], drawn: { kind: "months-to-prod", months: 7 } }])[0], /Depth bar draws 7 months/);
assert.match(headedProblems([{ ...headed.bars[1], drawn: { kind: "months-to-prod", months: 0 } }])[0], /Depth bar draws 0 months.*positive whole number/);
assert.match(headedProblems([{ ...headed.bars[1], soFar: { ...headed.bars[1].soFar, text: "Six months to production code, in a pricing engine of around 70 projects." } }])[0], /Depth bar draws a start from zero/);
assert.match(headedProblems([{ ...headed.bars[1], soFar: { ...headed.bars[1].soFar, text: "Six months from zero C# to live code, in a pricing engine of around 70 projects." } }])[0], /Depth bar draws production code/);
assert.match(headedProblems([{ ...headed.bars[2], drawn: { kind: "count-to-live", value: 58 } }])[0], /Range bar draws 58/);
assert.match(headedProblems([{ ...headed.bars[2], soFar: { ...headed.bars[2].soFar, text: "Threshold, 57 user stories." } }])[0], /Range bar draws a live mark/);
assert.match(headedProblems([{ ...headed.bars[0], soFar: { ...headed.bars[0].soFar, text: "At Optegra, dashboards guided what the engineers built next." } }])[0], /Judgement bar draws a split test/);
assert.equal(shownSource(headed.bars[0].source).drawn, "light-dark(var(--cobalt), var(--cobalt))", "Optegra's thread falls under 3:1 on paper, so its drawing takes cobalt");
assert.match(shownSource(headed.bars[1].source).drawn, /^light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\)$/, "BNP Paribas's thread holds 3:1 on paper in both themes");
assert.match(shownSource(headed.bars[2].source).drawn, /^light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\)$/, "Threshold's thread holds 3:1 on paper in both themes");
// PAPER_SURFACE stays pinned to tokens.css (--paper) and parts.css (.surface--paper light foot 3% black, .surface dark lit top 7% white).
{
  const tokensCss = readFileSync(new URL("../src/app/tokens.css", import.meta.url), "utf8");
  const partsCss = readFileSync(new URL("../src/app/parts.css", import.meta.url), "utf8");
  const papers = [...tokensCss.matchAll(/--paper:\s*(#[0-9a-f]{6});/g)].map((m) => m[1]);
  const lightPaper = papers[0];
  const darkPaper = papers[1];
  const footBlack = Number(partsCss.match(/\.surface--paper\s*\{[^}]*--foot:\s*light-dark\(color-mix\(in srgb, var\(--field\), #000 (\d+)%\)/)?.[1]);
  const surfaceBlock = partsCss.match(/\.surface\s*\{([^}]*)\}/)?.[1] ?? "";
  const paperBlock = partsCss.match(/\.surface--paper\s*\{([^}]*)\}/)?.[1] ?? "";
  const litSource = paperBlock.includes("--lit:") ? paperBlock : surfaceBlock;
  const litWhite = Number(litSource.match(/--lit:\s*light-dark\(.*?,\s*color-mix\(in srgb, var\(--field\), #fff (\d+)%\)\)/)?.[1]);
  assert.ok(lightPaper && darkPaper && footBlack > 0 && litWhite > 0, "tokens.css and parts.css define the paper surface tones");
  const mix = (hex, target, weight) =>
    "#" + [1, 3, 5].map((at) => Math.round(Number.parseInt(hex.slice(at, at + 2), 16) * (1 - weight) + target * weight).toString(16).padStart(2, "0")).join("");
  assert.equal(PAPER_SURFACE.light, mix(lightPaper, 0, footBlack / 100), "PAPER_SURFACE.light matches light --paper deepened by .surface--paper's --foot");
  assert.equal(PAPER_SURFACE.dark, mix(darkPaper, 255, litWhite / 100), "PAPER_SURFACE.dark matches dark --paper lifted by .surface's --lit");
}
// Work has a row for every Role story exactly once, the current job first.
assert.deepEqual([...work.employers.map((employer) => employer.slug)].sort(), [...roleStorySlugs].sort(), "Work has a row for every Role story exactly once");
assert.equal(work.employers[0].slug, roleStorySlugs[0], "Work starts with the newest Role story");
assert.deepEqual(siteCopy.menu.map(({ id }) => id), ["work", "things-i-make", "how-i-work", "off-the-clock", "say-hello"], "The menu follows the page");

// Case studies.
const names = { threshold: "Threshold", "argus-risk": "Argus Risk", flowtime: "Flowtime" };
const studies = Object.values(caseStudies);

for (const study of studies) {
  const table = Object.fromEntries(rows(copyFor(names[study.slug]), "### ").map(([label, text]) => [label, text]));
  const opening = caseStudyOpening(study, projects);
  assert.equal(
    [opening.outcome, ...opening.meta, opening.note].filter(Boolean).join(" · "),
    table.Opening,
    `${study.slug}: opening`,
  );
  assert.equal(study.description, table["Meta description (and header lede)"], `${study.slug}: meta description`);

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
  assert.equal([story.role, roleStoryMetadata(story)].join(" · "), table.Opening, `${story.slug}: opening`);
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

// A figure's words are approved copy too.
for (const story of roles) {
  for (const [path, text] of leaves(story.figures ?? {}, `${story.slug}.figures`)) {
    assert.ok(plain.includes(text), `${path} is not in docs/content/redesign-copy.md: "${text}"`);
  }
}
assert.deepEqual(roleStoryProblems(roles), []);
assert.deepEqual(roles.map((story) => story.slug), ["bnp-paribas", "joveen", "optegra"], "Role stories run newest to oldest");
assert.deepEqual(roles.map((story) => story.next), ["joveen", "optegra", null], "Next role follows the order, and Optegra ends on ← Work");
assert.deepEqual(roles.map((story) => story.number), ["01", "02", "03"]);
const [bnp, ...rest] = roles;
assert.match(roleStoryProblems([{ ...bnp, evidence: Array(5).fill(bnp.evidence[0]) }, ...rest])[0], /more than 4 evidence/);
assert.match(roleStoryProblems([{ ...bnp, next: "bnp-paribas" }, ...rest])[0], /different Role story or none/);
assert.match(roleStoryProblems([{ ...bnp, next: "ghost" }, ...rest])[0], /different Role story or none/);
assert.match(roleStoryProblems([{ ...bnp, sections: { ...bnp.sections, decisions: {} } }, ...rest])[0], /empty "decisions" section/);
// A Résumé line states only figures its Role story states, so a changed number cannot linger on the sheet.
assert.match(roleStoryProblems([{ ...bnp, resume: [...bnp.resume.slice(1), "Went from no C# to production code in nine months."] }, ...rest])[0], /"nine", which its story does not say/);
assert.match(roleStoryProblems([{ ...bnp, resume: [bnp.resume[0], "Cut a 30–40 minute data load to under 7."] }, ...rest])[0], /"7", which its story does not say/);
assert.match(roleStoryProblems([{ ...bnp, resume: ["Only one line."] }, ...rest])[0], /1 Résumé lines, not 2 to 4/);

// Every printed value has a stated limit (TEXT_LIMITS), measured on /fixtures/worst-case: a longer one is refused.
{
  const long = (n) => "x".repeat(n);
  const word = (n) => `Long ${long(n - 5)}`;
  assert.match(roleStoryProblems([{ ...bnp, employer: word(61) }, ...rest]).join("\n"), /employer name longer than 60/);
  assert.deepEqual(roleStoryProblems([{ ...bnp, employer: word(60) }, ...rest]).filter((p) => /employer name/.test(p)), []);
  assert.match(roleStoryProblems([{ ...bnp, evidence: [{ value: long(9), label: "a figure" }] }, ...rest]).join("\n"), /the figure ".*", longer than 8/);
  const study = Object.values(caseStudies)[0];
  assert.match(caseStudyProblems([{ ...study, evidence: [{ value: long(9), label: "a figure" }] }, ...Object.values(caseStudies).slice(1)], projects).join("\n"), /longer than 8/);
  assert.match(passProblems({ ...passRecords, joveen: { ...passRecords.joveen, short: word(33) } }, roles)[0], /Staff pass "joveen": the name ".*" is longer than 32/);
  assert.deepEqual(passProblems({ ...passRecords, joveen: { ...passRecords.joveen, short: word(32) } }, roles), []);
}

// A Staff pass's headline number is one of its Role story's evidence items or a fact the story states in words
// (#209), so a pass never claims more than its story does. Each failure names the pass.
assert.deepEqual(passProblems(passRecords, roles), []);
assert.deepEqual(roleStorySlugs.map((slug) => passRecords[slug].short), ["BNP Paribas", "Joveen", "Optegra"]);
assert.deepEqual(passRecords["bnp-paribas"].pins?.map((pin) => pin.label), ["Winner", "Take Ownership", "AI Champion"]);
assert.equal(passRecords.joveen.pins, undefined, "Only the current pass wears the awards");
{
  const claim = (slug, headline) => passProblems({ ...passRecords, [slug]: { ...passRecords[slug], headline } }, roles);
  assert.match(claim("joveen", { value: "−90%", label: "page load" })[0], /Staff pass "joveen": the headline "−90% · page load" is not one of its Role story's evidence items or stated facts/);
  assert.match(claim("joveen", { value: "−40%", label: "latency" })[0], /"joveen"/, "A real number under a different label is not the story's fact");
  assert.match(claim("optegra", { value: "88%", label: "Core Web" })[0], /"optegra"/, "A label may stop at a comma, not mid-phrase");
  assert.deepEqual(claim("optegra", { value: "88%", label: "Core Web Vitals pass rate, up from 62%" }), [], "The whole evidence label is the story's fact too");
  assert.match(claim("bnp-paribas", { value: "Only", label: "C# engineer on the team" })[0], /"bnp-paribas"/, "A stated fact needs the sentence that states it");
  assert.match(claim("bnp-paribas", { value: "Only", label: "C# engineer on the team", quote: "only Rust engineer" })[0], /"bnp-paribas"/, "...and the story must say it");
}
assert.equal(currentPassStatus, "Valid · present");
assert.equal(passLinkLabel(passRecords.optegra), "The Optegra story →", "The link names the short employer, not Optegra Eye Healthcare & Kensington Medical");

// Each entry owns its pairing, so reordering the copy cannot redirect a link or a filter.
assert.deepEqual(workArchive.filters.map(({ category }) => category), [null, ...PROJECT_CATEGORIES], "the filters are All, then every category once, in the catalogue's order");
for (const [what, ids] of [["menu", siteCopy.menu.map(({ id }) => id)], ["Say hello links", sayHello.links.map(({ id }) => id)]]) {
  assert.equal(new Set(ids).size, ids.length, `the ${what} lists each id once`);
}

// Work's panels (R-13 to R-15, R-45): every string as the deck gives it, and every figure and bar its Role story's fact.
{
  const from = raw.indexOf("## Work\n");
  const next = raw.indexOf("\n## ", from + 1);
  const deck = raw.slice(from, next === -1 ? undefined : next);
  const tables = deck.split("\n").filter((line) => line.startsWith("|") && !line.startsWith("|---")).map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
  const { bnp, roles } = workPanels;
  assert.equal(workPanels.heading, work.heading, "Work's panels keep Work's heading");
  assert.equal(workPanels.subheading, work.note, "Work's subheading is its approved note");
  assert.equal(`${bnp.figure.value} · ${bnp.figure.label}`, bullet(deck, "BNP Paribas figure"), "Work: BNP Paribas's figure");
  assert.equal(simulationCopy.title, bullet(deck, "Simulation heading"), "Work: the simulation's heading");
  assert.equal(`${simulationCopy.again} · ${simulationCopy.paths} · 10 · 100 · 1,000 · ${simulationCopy.spread}`, bullet(deck, "Simulation controls"), "Work: the simulation's controls");
  assert.equal(simulationCopy.settled("1,000", 0.012, 0.871), "1,000 paths: one price, 1.2% above today; 10th–90th spread 87.1%.", "Work: a settled run is read with its price and spread");
  assert.equal(simulationCopy.settled("10", -0.0004, 0.871), "10 paths: one price, level with today; 10th–90th spread 87.1%.", "Work: a price that rounds to nothing is level");
  assert.equal(`${simulationCopy.start} · ${simulationCopy.end} · ${simulationCopy.price}`, bullet(deck, "Simulation"), "Work: the simulation's labels");
  assert.equal(simulationCopy.caption, bullet(deck, "Simulation caption"), "Work: the simulation's caption");
  assert.equal(simulationCopy.description, bullet(deck, "Simulation description"), "Work: the simulation's accessible description");
  assert.match(simulationCopy.description, /^Illustrative/, "The simulation says it is illustrative");
  const story = roleStories[bnp.slug];
  assert.deepEqual(
    bnp.comparisons.map((comparison) => [comparisonRow(story, comparison)?.what, `${comparison.before.name} · ${comparison.before.value}`, `${comparison.after.name} · ${comparison.after.value}`]),
    tables.filter((row) => row.length === 3 && row[0] !== "Comparison" && row[0] !== "Panel" && !["Joveen", "Optegra"].includes(row[0])),
    "Work: BNP Paribas's comparisons",
  );
  assert.deepEqual(
    roles.flatMap((panel) => panel.pairs.map((pair) => [passRecords[panel.slug].short, pair.what, pair.value])),
    tables.filter((row) => ["Joveen", "Optegra"].includes(row[0])),
    "Work: Joveen's and Optegra's pairs",
  );
  assert.deepEqual(workPanelProblems(workPanels), []);
  const pair = (index, replacement) => workPanelProblems({ ...workPanels, roles: [{ ...roles[0], pairs: roles[0].pairs.map((entry, at) => (at === index ? { ...entry, ...replacement } : entry)) }, roles[1]] });
  assert.match(pair(0, { value: "520 ms → 210 ms", after: { amount: 210 } })[0], /joveen's "Key API p95" says "210"/, "A pair's number must be its story's");
  assert.match(pair(0, { after: { amount: 200 } })[0], /after side draws 200 ms, but its words state 230/, "A bar is drawn at the amount its value states");
  assert.match(pair(2, { after: { amount: 140 } })[0], /after side draws 140 change, but its words state 130/, "A change in per cent is drawn from 100");
  assert.match(pair(1, { after: { amount: 2 } })[0], /after side draws 2 minutes, but its words state under 2/, "An upper bound is drawn as one");
  assert.match(pair(0, { unit: "rate" })[0], /words "520 ms" state no amount in rate/, "A pair is drawn in the unit its words are in");
  const scaleRow = (index, replacement) => {
    const figure = story.figures["what-changed"];
    const changed = { ...story, figures: { ...story.figures, "what-changed": { ...figure, rows: figure.rows.map((row, at) => (at === index ? { ...row, ...replacement } : row)) } } };
    return roleStoryProblems(Object.values(roleStories).map((entry) => (entry.slug === story.slug ? changed : entry)));
  };
  assert.match(scaleRow(0, { before: { label: "about two weeks, experienced", amount: 14 } })[0], /before side draws 14 working-days, but its words state 10/, "Two weeks are ten working days");
  assert.match(scaleRow(1, { before: { label: "30–40 min", amount: 40 } })[0], /before side draws 40 minutes, but its words state 30–40/, "A range is drawn as one");
  const comparison = (replacement) => workPanelProblems({ ...workPanels, bnp: { ...bnp, comparisons: [{ ...bnp.comparisons[0], ...replacement }, bnp.comparisons[1]] } });
  assert.match(comparison({ after: { name: "Me, new to it", value: "an afternoon" } })[0], /writes "an afternoon"/, "A comparison's value is its scale row's");
  assert.match(comparison({ row: 4 })[0], /scale row 4/);
  assert.match(workPanelProblems({ ...workPanels, bnp: { ...bnp, figure: { value: "6 months", label: "from zero Rust to production code" } } })[0], /figure .* is not one of its Role story's evidence items/);
}

// External host labels read as human names for known sites, and strip www. otherwise (#528).
for (const [href, expected] of [
  ["https://github.com/3ixas", "GitHub"],
  ["https://www.linkedin.com/in/elias-t-bennett/", "LinkedIn"],
  ["https://www.goodreads.com/user/show/1", "Goodreads"],
  ["https://letterboxd.com/3lxas/", "Letterboxd"],
  ["https://threshold-beta.vercel.app/london", "Threshold"],
  ["https://flowtime-focus-timer.vercel.app", "Flowtime"],
  ["https://web.archive.org/web/20240605112227/https://www.optegra.com/", "the Wayback Machine"],
  ["https://www.joveen.com/", "joveen.com"],
]) {
  assert.equal(hostLabel(href), expected, `hostLabel(${href})`);
}

console.log("Redesign copy checks passed.");
