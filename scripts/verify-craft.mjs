import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// The craft bar's numbers, read from the CSS (docs/design/DESIGN.md, "Controls" and "Motion"). It cannot judge feel, so it
// holds only what a value can prove: the one focus ring, the two timing curves and the length of every feedback
// transition. Under a second, and nothing in it can flake.

const SPRING = 'cubic-bezier(.3,1.5,.4,1)';
const OUT = 'cubic-bezier(.22,1,.36,1)';
const FEEDBACK_MS = [100, 250];

/**
 * The one ring (DESIGN.md "Controls", R-05): 2 px cobalt at 3 px offset, taking the panel's ink on a panel. The page-wide
 * rule in shell.css gives it to anything without its own; parts.css gives it to the controls.
 */
const RING = { colour: 'var(--cobalt)', offset: '3px', page: '[data-site] :focus-visible', controls: ':where(.pill, .button, .text-link, .row):focus-visible' };

/** Selectors whose focus ring differs, and exactly how. */
const ringExceptions = [
  { selector: '.panel :focus-visible', colour: 'var(--panel-ink)', why: 'cobalt would not hold 3:1 on every panel field' },
  { selector: '.zoom__close:focus-visible', colour: '#fff', why: 'the Close button sits on a dark scrim' },
  { selector: '.stretch-resume__sheet :focus-visible', colour: 'var(--sheet-focus)', why: 'the Résumé sheet is paper with its own ink' },
];

/**
 * Transitions that are motion, not feedback: things that arrive, fold, glide or swing, each judged by the motion
 * specs and the interruption walk instead. A new transition outside 100 to 250 ms fails until it is brought in or named here.
 */
const motionTransitions = [
  ['.greeting__more', 'the greeting folds open'],
  ['.site-header__links', 'the links step aside for London\'s time'],
  ['.scene__moon', 'the late scene arrives'],
  ['.scene__star', 'the late scene arrives'],
  ['.eclipse__', 'the Eclipse flips the theme'],
  ['.pass', 'a staff pass leans on hover (DESIGN.md "Motion")'],
  ['.pass__sheen', 'a staff pass catches the light'],
  ['[data-rise]', 'a panel or card rises into view (DESIGN.md "Motion")'],
  ['[data-grow] .bar', 'bars to scale grow from the left'],
  ['.project__shot', "a project's screenshot lifts on hover (DESIGN.md \"Motion\")"],
  ['.sim__plot[data-released] .sim__paths', "the simulation's paths draw from the left"],
  ['.sim__plot[data-released] .sim__bin', "the simulation's histogram grows"],
  ['.sim__plot[data-released] .sim__price', "the simulation's price line appears last"],
  [':root[data-theme-changing]', 'the theme changes'],
];

const normal = (value) => value.replace(/\s+/g, '').replace(/(^|[^\d])0\./g, '$1.');
const cssFiles = () => readdirSync('src/app').filter((name) => name.endsWith('.css')).map((name) => `src/app/${name}`);
const readCss = () => Object.fromEntries(cssFiles().map((path) => [path, readFileSync(path, 'utf8')]));

/** Every rule that holds only declarations, with the innermost selector, wherever an at-rule wraps it. */
function* rules(css) {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, selector, body] of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const declarations = Object.fromEntries(body.split(';').map((text) => text.split(/:(.*)/s)).filter(([, value]) => value !== undefined).map(([name, value]) => [name.trim(), value.trim()]));
    yield { selector: selector.trim().replace(/\s+/g, ' '), declarations };
  }
}

const milliseconds = (token) => (token.endsWith('ms') ? parseFloat(token) : parseFloat(token) * 1000);

/** The durations a `transition` shorthand or `transition-duration` declares (the first time in each item; the second is a delay). */
function durationsOf(name, value) {
  if (name === 'transition-duration') return value.split(',').map((item) => milliseconds(item.trim()));
  return splitTop(value).map((item) => milliseconds(item.match(/(?:^|\s)(-?[\d.]+m?s)(?=\s|$)/)?.[1] ?? '0s'));
}

/** Splits on commas outside brackets, so `cubic-bezier(a, b)` stays whole. */
function splitTop(value) {
  const parts = [];
  let depth = 0;
  let start = 0;
  [...value].forEach((char, index) => {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  });
  parts.push(value.slice(start));
  return parts.map((part) => part.trim());
}

/** Everything the CSS gets wrong, as sentences naming the file and selector. */
export function craftProblems(files) {
  const problems = [];
  const allRules = Object.entries(files).flatMap(([path, css]) => [...rules(css)].map((rule) => ({ ...rule, path })));

  // One focus ring.
  for (const selector of [RING.page, RING.controls]) {
    const rule = allRules.find((entry) => entry.selector === selector);
    if (rule?.declarations.outline !== `2px solid ${RING.colour}` || rule?.declarations['outline-offset'] !== RING.offset) {
      problems.push(`The focus ring (\`${selector}\`) must be \`outline: 2px solid ${RING.colour}\` at \`outline-offset: ${RING.offset}\`.`);
    }
  }
  for (const { path, selector, declarations } of allRules) {
    if (!selector.includes(':focus-visible')) continue;
    if (!Object.keys(declarations).some((name) => name.startsWith('outline'))) continue;
    if (selector.includes('section[tabindex="-1"]')) {
      if (declarations.outline !== 'none') problems.push(`${path}: \`${selector}\` is the one place the ring may be none.`);
      continue;
    }
    const exception = ringExceptions.find((entry) => selector.endsWith(entry.selector) || selector === entry.selector);
    const width = declarations.outline?.match(/^(\S+) solid (.+)$/);
    const colour = declarations['outline-color'] ?? width?.[2];
    const offset = declarations['outline-offset'];
    const expectedColour = exception?.colour ?? RING.colour;
    if (width && width[1] !== '2px') problems.push(`${path}: \`${selector}\` has a ${width[1]} focus ring; the one ring is 2px.`);
    if (declarations['outline-width'] && declarations['outline-width'] !== '2px') problems.push(`${path}: \`${selector}\` has a ${declarations['outline-width']} focus ring; the one ring is 2px.`);
    if (offset !== undefined && offset !== RING.offset) problems.push(`${path}: \`${selector}\` has a focus ring offset of ${offset}; it must be ${RING.offset}.`);
    if (colour !== undefined && colour !== expectedColour) problems.push(`${path}: \`${selector}\` has a ${colour} focus ring; it must be ${expectedColour}${exception ? '' : ' (named exceptions are in verify-craft.mjs)'}.`);
  }

  // The two curves, wherever they are declared.
  for (const { path, selector, declarations } of allRules) {
    if (declarations['--spring'] !== undefined && normal(declarations['--spring']) !== SPRING) problems.push(`${path}: \`${selector}\` sets --spring to ${declarations['--spring']}; it is ${SPRING}.`);
    if (declarations['--out'] !== undefined && normal(declarations['--out']) !== OUT) problems.push(`${path}: \`${selector}\` sets --out to ${declarations['--out']}; it is ${OUT}.`);
  }
  const springs = allRules.filter(({ declarations }) => declarations['--spring'] !== undefined);
  if (springs.length === 0) problems.push('No rule sets --spring.');

  // Feedback transitions are 100 to 250 ms.
  for (const { path, selector, declarations } of allRules) {
    for (const name of ['transition', 'transition-duration']) {
      const value = declarations[name];
      if (value === undefined || value === 'none') continue;
      if (value.includes('!important')) continue;
      const bad = durationsOf(name, value).filter((ms) => ms !== 0 && (ms < FEEDBACK_MS[0] || ms > FEEDBACK_MS[1]));
      if (bad.length === 0) continue;
      if (motionTransitions.some(([part]) => selector.includes(part))) continue;
      problems.push(`${path}: \`${selector}\` transitions over ${bad.join(' and ')} ms; feedback is ${FEEDBACK_MS[0]} to ${FEEDBACK_MS[1]} ms (a motion that is not feedback is named in verify-craft.mjs).`);
    }
  }
  // A named motion that no longer exists is a stale exception.
  for (const [part] of motionTransitions) {
    if (!allRules.some(({ selector, declarations }) => selector.includes(part) && ('transition' in declarations || 'transition-duration' in declarations))) problems.push(`The motion exception \`${part}\` matches no transition; remove it from verify-craft.mjs.`);
  }

  return problems;
}

const files = readCss();
const problems = craftProblems(files);
assert.deepEqual(problems, [], `The craft bar does not hold:\n- ${problems.join('\n- ')}`);

// Each check is shown failing on a deliberate break, so a gate that has gone blind is caught here.
const broken = (path, from, to) => {
  assert.ok(files[path].includes(from), `${path} no longer contains ${from}`);
  return { ...files, [path]: files[path].replace(from, to) };
};
const mustFail = (name, changed, pattern) => assert.ok(craftProblems(changed).some((problem) => pattern.test(problem)), `The ${name} check did not fail on its deliberate break`);
mustFail('focus ring width', broken('src/app/shell.css', '[data-site] :focus-visible {\n  outline: 2px solid var(--cobalt);', '[data-site] :focus-visible {\n  outline: 3px solid var(--cobalt);'), /focus ring/);
mustFail('focus ring offset', broken('src/app/zoom.css', '.zoom__close:focus-visible {\n  outline-color: #fff;', '.zoom__close:focus-visible {\n  outline-color: #fff;\n  outline-offset: 4px;'), /offset/);
mustFail('controls ring offset', broken('src/app/parts.css', '  outline: 2px solid var(--cobalt);\n  outline-offset: 3px;', '  outline: 2px solid var(--cobalt);\n  outline-offset: 2px;'), /focus ring/);
mustFail('panel ring colour', broken('src/app/parts.css', 'outline-color: var(--panel-ink);', 'outline-color: var(--cobalt);'), /var\(--panel-ink\)/);
mustFail('spring', broken('src/app/tokens.css', '--spring: cubic-bezier(.3, 1.5, .4, 1);', '--spring: cubic-bezier(.3, 1.4, .64, 1);'), /--spring/);
mustFail('feedback timing', broken('src/app/parts.css', 'transition: background-color 150ms var(--out);', 'transition: background-color 400ms var(--out);'), /400 ms/);

console.log('Craft checks passed: one focus ring, the site curves and feedback within 100 to 250 ms.');
