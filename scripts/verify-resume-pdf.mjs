// Fails when the committed résumé PDF is out of date with the sheet, or runs past two pages; warns, without failing, past one.
//
// "Out of date" is decided on text and links, not pixels: the PDF's extracted text must be exactly what the
// sheet shows (src/content/resume.ts, resumeText), in reading order, and its link annotations must be the
// sheet's links on the public site. The sheet is rendered from those same records, so this needs no
// browser or server, and so can run with `pnpm check`. Checking both ways matters: a string the sheet
// no longer has (a removed role) is still in a stale PDF, so extra text fails as surely as missing text.
// Layout and styling are ignored on purpose, since a change that only moves pixels does not make the PDF wrong.
// Whitespace is dropped on both sides because the PDF breaks lines wherever the page did, and case is
// ignored because the name and the headings are set in capitals by CSS.
import { readFile } from "node:fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { resumeOrigin, resumePdf, resumeSheet, resumeText } from "../src/content/resume.ts";

const squash = (text) => text.normalize("NFKC").toLowerCase().replace(/[\s­]+/g, "");

/** What is in the PDF, as one squashed string, and how many pages it has. */
async function readPdf(data) {
  const pdf = await getDocument({ data: new Uint8Array(data), useSystemFonts: true, verbosity: 0 }).promise;
  let text = "";
  const links = new Set();
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    const content = await page.getTextContent();
    text += content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    for (const annotation of await page.getAnnotations()) if (annotation.url) links.add(annotation.url);
  }
  return { pages: pdf.numPages, text: squash(text), links };
}

/** Marks the sheet draws that are not strings of its own: a result's dash and the comma after a role. */
const decoration = /[–,]/g;

/** How the PDF's text differs from the sheet's strings: missing, out of order, or extra, as messages. */
export function stale(expected, pdfText) {
  const problems = [];
  let from = 0;
  let previous = null;
  let extra = "";
  for (const line of expected) {
    const at = pdfText.indexOf(squash(line), from);
    if (at === -1) {
      const anywhere = pdfText.includes(squash(line));
      problems.push(anywhere ? `"${line}" is in the PDF, but not after "${previous}"` : `"${line}" is not in the PDF`);
      continue;
    }
    extra += pdfText.slice(from, at);
    from = at + squash(line).length;
    previous = line;
  }
  extra = (extra + pdfText.slice(from)).replace(decoration, "");
  if (!problems.length && extra) problems.push(`the PDF has text the sheet does not: "${extra.slice(0, 80)}"`);
  return problems.slice(0, 5);
}

/** The links the PDF should carry: the sheet's, on the public site, which is what the render script rewrites them to. */
export function expectedLinks(sheet) {
  const hrefs = [...sheet.contacts, ...sheet.experience.map(({ story }) => story), ...sheet.projects.map(({ study }) => study)].map(({ href }) => href);
  return new Set(hrefs.map((href) => new URL(href, resumeOrigin).href));
}

/** How the PDF's links differ from the expected ones, as messages. */
export function brokenLinks(expected, actual) {
  return [
    ...[...expected].filter((url) => !actual.has(url)).map((url) => `the PDF has no link to ${url}`),
    ...[...actual].filter((url) => !expected.has(url)).map((url) => `the PDF links to ${url}, which the sheet does not`),
  ];
}

const data = await readFile(new URL(`../${resumePdf.file}`, import.meta.url)).catch(() => null);
if (!data) {
  console.error(`${resumePdf.file} does not exist. Run \`pnpm resume:pdf\` against a running site and commit the result.`);
  process.exit(1);
}
const { pages, text, links } = await readPdf(data);
const sheet = resumeSheet();
const problems = [...stale(resumeText(sheet), text), ...brokenLinks(expectedLinks(sheet), links)];
if (problems.length) {
  console.error(`${resumePdf.file} is out of date with /resume:\n  ${problems.join("\n  ")}\nRun \`pnpm resume:pdf\` against a running site and commit the result.`);
  process.exit(1);
}
if (pages > 2) {
  console.error(`The résumé PDF runs to ${pages} pages; two is the limit. Cut Selected projects to two, then each role to two results.`);
  process.exit(1);
}
if (pages > 1) console.warn(`::warning::The résumé PDF runs to ${pages} pages; one is the target.`);
console.log(`Résumé PDF checks passed: ${pages} page${pages === 1 ? "" : "s"}, text and links match the sheet.`);
