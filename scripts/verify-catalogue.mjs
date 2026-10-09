import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { caseFiles } from "../src/content/case-files.ts";
import {
  MAX_FEATURED,
  assertCatalogue,
  catalogueProblems,
  featuredProjects,
  featuredSlugs,
  projectIndex,
  projects,
} from "../src/content/projects.ts";

const caseStudySlugs = Object.keys(caseFiles);
const base = (slug, year = 2025, overrides = {}) => ({ slug, name: slug, outcome: "o", type: "t", year, category: "products", links: {}, ...overrides });
const featurable = (slug) =>
  base(slug, 2026, {
    links: { caseStudy: `/work/${slug}` },
    screenshot: { src: "/x.webp", alt: "x", width: 1, height: 1 },
    colours: { field: "#000000", ink: "#ffffff", swatch: "#808080" },
  });

// The real catalogue and featured list are valid, and what the site depends on.
assert.deepEqual(catalogueProblems(projects, featuredSlugs, caseStudySlugs), []);
assertCatalogue(projects, featuredSlugs, caseStudySlugs);
assert.deepEqual(featuredSlugs, ["threshold", "argus-risk", "flowtime"]);
assert.equal(projects.length, 6);
assert.equal(projects.some((project) => /connect/i.test(project.name)), false, "Connect Four is left out");

// The featured projects come in the list's order, not the catalogue's.
assert.deepEqual(featuredProjects(projects, ["flowtime", "threshold"]).map((project) => project.slug), ["flowtime", "threshold"]);

// The index is the rest of the catalogue, newest year first; ties keep the catalogue's order.
assert.deepEqual(projectIndex(projects, featuredSlugs).map((project) => project.slug), ["home-secretary", "risk-event-tracker", "ask-professor-past"]);
const shuffled = [base("old", 2024), base("new-a", 2026), base("mid", 2025), base("new-b", 2026)];
assert.deepEqual(projectIndex(shuffled, []).map((project) => project.slug), ["new-a", "new-b", "mid", "old"]);
assert.deepEqual(projectIndex(shuffled, ["new-a", "old"]).map((project) => project.slug), ["new-b", "mid"], "Featured projects leave the index");
assert.deepEqual(projectIndex(shuffled, ["new-a", "new-b", "mid", "old"]), [], "An index can be empty");

// Adding a project is one entry: an index project needs no case study, screenshot or colours.
assert.deepEqual(catalogueProblems([...projects, base("one-more")], featuredSlugs, caseStudySlugs), []);

// The featured rule, each part failing alone with a message that names the project.
const featuredOne = [featurable("a")];
assert.deepEqual(catalogueProblems(featuredOne, ["a"], ["a"]), []);
const failing = (project, slugs = ["a"]) => catalogueProblems([project], ["a"], slugs);
assert.match(failing(base("a"), [])[0], /Featured project "a" needs a case study/);
assert.match(failing(featurable("a"), [])[0], /needs a case study/, "A link alone is not a case study");
assert.match(failing({ ...featurable("a"), links: {} })[0], /needs a case study/, "A case study with no link is not shown");
assert.match(failing({ ...featurable("a"), screenshot: undefined })[0], /Featured project "a" needs a screenshot/);
assert.match(failing({ ...featurable("a"), colours: undefined })[0], /Featured project "a" needs its colours/);
assert.match(failing({ ...featurable("a"), colours: { field: "red", ink: "#ffffff", swatch: "#808080" } })[0], /needs its colours/);
assert.equal(failing({ ...featurable("a"), screenshot: undefined, colours: undefined }).length, 2, "Every problem is reported");
assert.match(catalogueProblems([], ["ghost"], [])[0], /"ghost" is not in the catalogue/);

// At most three, none twice, no duplicate slugs.
const four = ["a", "b", "c", "d"].map(featurable);
assert.equal(MAX_FEATURED, 3);
assert.match(catalogueProblems(four, ["a", "b", "c", "d"], ["a", "b", "c", "d"])[0], /At most 3 projects can be featured/);
assert.match(catalogueProblems(featuredOne, ["a", "a"], ["a"]).join(" "), /featured more than once/);
assert.match(catalogueProblems([base("a"), base("a")], [], []).join(" "), /"a" more than once/);
assert.match(catalogueProblems([base("a", 2025.5)], [], []).join(" "), /whole-number year/);
assert.match(catalogueProblems([base("a", 2025, { category: "lab" })], [], []).join(" "), /needs a category/);

// assertCatalogue is what fails the build, and says why.
assert.throws(() => assertCatalogue(featuredOne, ["a"], []), /The project catalogue \(src\/content\/projects\.ts\) is invalid:\n- Featured project "a" needs a case study/);

// The seeded copy matches docs/content/redesign-copy.md word for word.
const copy = readFileSync(new URL("../docs/content/redesign-copy.md", import.meta.url), "utf8");
// The table under a heading: its rows only, up to the first line that isn't part of it.
const rows = (heading) => {
  const lines = copy.slice(copy.indexOf(heading)).split("\n").slice(1);
  const start = lines.findIndex((line) => line.startsWith("|"));
  const table = [];
  for (const line of lines.slice(start)) {
    if (!line.startsWith("|")) break;
    table.push(line);
  }
  return table.slice(2).map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
};
for (const [name, outcome, metadata] of rows("**Featured tiles**")) {
  const project = projects.find((entry) => entry.name === name);
  assert.ok(project, `${name} is in the catalogue`);
  assert.equal(project.outcome, outcome, `${name}'s outcome`);
  assert.equal(`${project.type} · ${project.year}`, metadata, `${name}'s metadata`);
}
for (const [name, outcome, type, year] of rows("**Index rows**")) {
  const project = projects.find((entry) => entry.name === name);
  assert.ok(project, `${name} is in the catalogue`);
  assert.equal(project.outcome, outcome, `${name}'s outcome`);
  assert.equal(project.type, type, `${name}'s type`);
  assert.equal(String(project.year), year, `${name}'s year`);
}
assert.equal(rows("**Featured tiles**").length, 3);
assert.equal(rows("**Index rows**").length, 3);

console.log("Project catalogue checks passed.");
