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
import { howIWork } from "../src/content/stretch/how-i-work.ts";
import { greetingKey } from "../src/content/stretch/greeting.ts";
import { offTheClock } from "../src/content/stretch/off-the-clock.ts";
import { hero, notFound, sayHello, siteCopy, thingsIMake, workArchive } from "../src/content/stretch/site-copy.ts";
import { headedProblems, shownSource, work } from "../src/content/stretch/work.ts";

const raw = readFileSync(new URL("../docs/content/redesign-copy.md", import.meta.url), "utf8");
// Emphasis stars and the {braces} around live values are markup, not words.
const plain = raw.replace(/\*/g, "").replace(/[{}]/g, "");

// ---- Every string in the typed modules is in the approved copy ----------------------------

const leaves = (value, path = "") => {
  // Links, image paths, a figure's kind and its screens' devices, dates, anchors, category keys and Role story slugs are addresses and data, not words, so the approved copy does not list them.
  if (typeof value === "string") return /(href|src|writtenOn|\.id|\.glyph|\.slug|\.figures\.[\w-]+\.kind|\.figures\.[\w-]+\.images\[\d+\]\.device|\.category|\.story|\.project|\.restates\[\d+\])$/.test(path) ? [] : [[path, value]];
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
  thingsIMake.note(6, 3),
  thingsIMake.allThings(6),
  offTheClock.curiosity.more("n"),
  offTheClock.github.contributions("1,221"),
  offTheClock.github.busiest("September–October"),
  offTheClock.github.asOf("date"),
];
for (const text of built) assert.ok(plain.includes(text), `Built string is not in the approved copy: "${text}"`);
assert.equal(thingsIMake.note(6, 3), "06 things I’ve built · 03 I’m proudest of");
assert.equal(thingsIMake.allThings(projects.length), "Everything I’ve built (06) →");

// The 404's lost-property tag and section rows are listed field by field, not just as stray words.
const tag = notFound.tag;
for (const line of [
  `- Tag title: ${tag.title}`,
  `- Tag fields: ${tag.item} (the address asked for, shortened in the middle at about 48 characters) · ${tag.foundAt} ${tag.foundAtValue} · ${tag.returnTo} ${tag.returnToValue}`,
  `- Tag stamp: ${tag.stamp}`,
  `- Lead-in to the section rows: ${notFound.orTry}`,
]) assert.ok(raw.includes(line), `The 404 copy lacks the line "${line}"`);

// The header greeting follows the visitor's own hour, with the approved edges.
const greetingAt = (hour) => siteCopy.greeting[greetingKey(hour)];
for (const [hour, line] of [
  [0, "Still up?"], [4, "Still up?"], [5, "Good morning"], [11, "Good morning"], [12, "Good afternoon"],
  [17, "Good afternoon"], [18, "Good evening"], [21, "Good evening"], [22, "Still up?"], [23, "Still up?"],
]) {
  assert.equal(greetingAt(hour), line, `The greeting at ${hour}:00 to ${hour}:59`);
}
assert.equal(siteCopy.greeting.hello, "Hello");
for (let hour = 0; hour < 24; hour += 1) assert.notEqual(greetingKey(hour), "hello", "Only the browser's clock picks a greeting; hello is the line before it");

// The hero names the employer once on screen, in the headline: the name down to the buttons reads "BNP" in the h1 and nowhere else (#243).
const heroText = [hero.name.first, hero.name.last, hero.role, hero.portraitLabel, hero.headline.lead, hero.headline.emphasis, hero.support, hero.actions.work, hero.actions.hello];
assert.equal(heroText.join(" ").match(/BNP/g)?.length, 1, "The hero names BNP exactly once");
assert.ok(`${hero.headline.lead} ${hero.headline.emphasis}`.includes("BNP"), "The hero's one BNP is in the h1");

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
// The pen underlines a phrase of each proof, so the phrase must be in the proof word for word.
for (const beat of howIWork.beats) assert.ok(beat.proof.includes(beat.underline), `How I work: "${beat.habit}" has no "${beat.underline}" in its proof to underline`);
assert.equal(howIWork.beats.filter((beat) => beat.arrowToCard).length, 1, "How I work: exactly one beat points at the PRD card");
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

// Work: the employers' closer looks, Where I'm headed and History at uni, word for word.
const bullet = (text, label) => text.match(new RegExp(`^- ${label}: (.+)$`, "m"))?.[1];
const { headed, history } = work;

const workCopy = copyFor("Quiet index · Work");
const workRows = Object.fromEntries(rows(workCopy, "### ").map(([where, copy]) => [where, copy]));
const nowProofs = work.employers[0].proofs;
assert.ok(workRows["BNP Paribas closer look"].includes(nowProofs.join(" · ")), "BNP Paribas: the closer look's proofs");
for (const { slug, pins } of work.employers) {
  const story = roleStories[slug];
  assert.equal(`${story.role} · ${story.dates}`, workRows[`${passRecords[slug].short} row`], `${slug}: the row's line is its Role story's role and dates`);
  assert.equal(pins.length, 3, `${slug}: three Pass pins`);
}
assert.equal(`${history.line}`, workRows["History at uni row"], "History at uni: row");
assert.equal(`${history.note.school} · ${history.note.course} · ${history.note.date}`, workRows["History at uni closer look"], "History at uni: closer look");
assert.ok(workRows["Where I’m headed: heading and line"].includes(`${headed.heading} · ${headed.line}`), "Where I’m headed: heading and line");

const headedCopy = copyFor("Where I’m headed");
assert.equal(headed.heading, bullet(headedCopy, "Heading"), "Where I’m headed: heading");
assert.equal(headed.soFar, bullet(headedCopy, "Tag"), "Where I’m headed: tag");
assert.deepEqual(
  headed.bars.map((bar) => [bar.label, bar.title, bar.soFar.text, shownSource(bar.source).link.label]),
  rows(headedCopy, "### "),
  "Where I’m headed: bars",
);

const gotHereCopy = copyFor("How I got here");
assert.equal(work.note, bullet(gotHereCopy, "Note"), "Work: note");
assert.equal(history.line, rows(gotHereCopy, "### ").map(([dates, , note]) => `${dates} · ${note}`)[0], "History");
assert.equal(work.heading, bullet(raw.slice(raw.indexOf("## Work\n")), "Heading"), "Work: heading");

// Every link goes to a Role story or Case study that exists, and every "So far" restates a fact its source tells.
for (const { source } of headed.bars) {
  const { href } = shownSource(source).link;
  assert.ok(roleStorySlugs.some((slug) => href === `/work/${slug}`) || Object.keys(caseStudies).some((slug) => href === `/things-i-make/${slug}`), `Work links to "${href}", which does not exist`);
}
assert.deepEqual(headedProblems(headed.bars), []);
assert.match(headedProblems([{ ...headed.bars[0], soFar: { ...headed.bars[0].soFar, restates: ["decided what the engineers built next"] } }])[0], /Judgement bar.*decided what the engineers built next/);
assert.match(headedProblems([{ ...headed.bars[2], soFar: { ...headed.bars[2].soFar, restates: ["58 user stories"] } }])[0], /Range bar.*58 user stories/);
assert.match(headedProblems([{ ...headed.bars[2], soFar: { ...headed.bars[2].soFar, text: "Threshold, a live site." } }])[0], /Range bar.*no longer shows "57 user stories"/);
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

console.log("Redesign copy checks passed.");
