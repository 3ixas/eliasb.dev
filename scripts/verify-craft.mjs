import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// The craft bar's numbers, read from the CSS (docs/design/DESIGN.md, "Craft bar"). It cannot judge feel, so it holds
// only what a value can prove: the one focus ring, the two timing curves, the object shadow tokens and the length of
// every feedback transition. Under a second, and nothing in it can flake.

const SPRING = 'cubic-bezier(.3,1.5,.4,1)';
const OUT = 'cubic-bezier(.22,1,.36,1)';
const FEEDBACK_MS = [100, 250];

/**
 * The passes and panels ring (DESIGN.md "Controls"), in parts.css and every stylesheet that replaces a quiet-index
 * one: 2 px cobalt at 3 px offset, taking the panel's ink on a panel. The quiet index keeps its own until #420.
 */
const NEW_RING = { files: ['src/app/parts.css'], rule: ':where(.pill, .button, .text-link, .row):focus-visible', colour: 'var(--cobalt)', offset: '3px' };
const newRingExceptions = [{ selector: '.panel :focus-visible', colour: 'var(--panel-ink)', why: 'cobalt would not hold 3:1 on every panel field' }];

/** Selectors whose focus ring differs from 2 px cobalt at 2 px offset, and exactly how. */
const ringExceptions = [
  { selector: '.qi-row:focus-visible', offset: '-2px', why: 'a row: the ring sits inside it so the fill and the ring share one edge' },
  { selector: '[data-card] .qi-row:is(:focus-visible, :active)', offset: '-2px', colour: 'var(--project-ink)', why: 'a phone card: cobalt would not hold 3:1 on the Project colour' },
  { selector: '.qi-zoom__close:focus-visible', colour: '#fff', why: 'the Close button sits on a dark scrim' },
  { selector: '.stretch-resume__sheet :focus-visible', colour: 'var(--sheet-focus)', why: 'the Résumé sheet is paper with its own ink' },
];

/**
 * Transitions that are motion, not feedback: things that arrive, fold, glide or swing, each judged by the motion
 * specs and the interruption walk instead. A new transition outside 100 to 250 ms fails until it is brought in or named here.
 */
const motionTransitions = [
  ['.qi-greeting__more', 'the greeting folds open'],
  ['.qi-header__links', 'the links fade with the greeting'],
  ['.qi-scene__moon', 'the late scene arrives'],
  ['.qi-scene__star', 'the late scene arrives'],
  ['.qi-margin[data-glide]', 'the margin glides between rows'],
  ['.qi-inline', 'an inline closer look folds open'],
  ['.qi-crop', 'an object reacts'],
  ['.qi-caret[data-done]', 'the typed quote ends'],
  ['.qi-scale__fill', 'a to-scale bar draws'],
  ['.stretch-eclipse__', 'the Eclipse flips the theme'],
  ['[data-rise]', 'a panel or card rises into view (DESIGN.md "Motion")'],
  ['[data-grow] .bar', 'bars to scale grow from the left'],
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
  const global = allRules.find(({ selector }) => selector === '[data-stretch-shell] :focus-visible');
  if (global?.declarations.outline !== '2px solid var(--stretch-cobalt)' || global?.declarations['outline-offset'] !== '2px') {
    problems.push('The page-wide focus ring (`[data-stretch-shell] :focus-visible`) must be `outline: 2px solid var(--stretch-cobalt)` at `outline-offset: 2px`.');
  }
  const ring = allRules.find(({ path, selector }) => NEW_RING.files.includes(path) && selector === NEW_RING.rule);
  if (ring?.declarations.outline !== `2px solid ${NEW_RING.colour}` || ring?.declarations['outline-offset'] !== NEW_RING.offset) {
    problems.push(`The passes and panels focus ring (\`${NEW_RING.rule}\`) must be \`outline: 2px solid ${NEW_RING.colour}\` at \`outline-offset: ${NEW_RING.offset}\`.`);
  }
  for (const { path, selector, declarations } of allRules) {
    if (!selector.includes(':focus-visible') && !selector.includes('[data-card] .qi-row:is(')) continue;
    const isNew = NEW_RING.files.includes(path);
    const outline = Object.keys(declarations).filter((name) => name.startsWith('outline'));
    if (outline.length === 0) continue;
    if (selector.includes('section[tabindex="-1"]')) {
      if (declarations.outline !== 'none') problems.push(`${path}: \`${selector}\` is the one place the ring may be none.`);
      continue;
    }
    const exception = (isNew ? newRingExceptions : ringExceptions).find((entry) => selector.endsWith(entry.selector) || selector === entry.selector);
    const width = declarations.outline?.match(/^(\S+) solid (.+)$/);
    const colour = declarations['outline-color'] ?? width?.[2];
    const offset = declarations['outline-offset'];
    const expectedOffset = exception?.offset ?? (isNew ? NEW_RING.offset : '2px');
    const expectedColour = exception?.colour ?? (isNew ? NEW_RING.colour : 'var(--stretch-cobalt)');
    if (width && width[1] !== '2px') problems.push(`${path}: \`${selector}\` has a ${width[1]} focus ring; the one ring is 2px.`);
    if (declarations['outline-width'] && declarations['outline-width'] !== '2px') problems.push(`${path}: \`${selector}\` has a ${declarations['outline-width']} focus ring; the one ring is 2px.`);
    if (offset !== undefined && offset !== expectedOffset) problems.push(`${path}: \`${selector}\` has a focus ring offset of ${offset}; it must be ${expectedOffset}${exception ? '' : ' (only a row’s is −2px)'}.`);
    if (colour !== undefined && colour !== expectedColour) problems.push(`${path}: \`${selector}\` has a ${colour} focus ring; it must be ${expectedColour}${exception ? '' : ' (named exceptions are in verify-craft.mjs)'}.`);
  }

  // The two curves, wherever they are declared.
  for (const { path, selector, declarations } of allRules) {
    if (declarations['--spring'] !== undefined && normal(declarations['--spring']) !== SPRING) problems.push(`${path}: \`${selector}\` sets --spring to ${declarations['--spring']}; it is ${SPRING}.`);
    if (declarations['--out'] !== undefined && normal(declarations['--out']) !== OUT) problems.push(`${path}: \`${selector}\` sets --out to ${declarations['--out']}; it is ${OUT}.`);
  }
  const springs = allRules.filter(({ declarations }) => declarations['--spring'] !== undefined);
  if (springs.length === 0) problems.push('No rule sets --spring.');

  // Object depth comes from tokens: every theme block that has one has both, and the dark blocks agree.
  const shadowBlocks = allRules.filter(({ declarations }) => declarations['--shadow-object'] !== undefined || declarations['--shadow-look'] !== undefined);
  if (shadowBlocks.length !== 4) problems.push(`Expected the shadow tokens in the 4 theme blocks of stretch-tokens.css, found ${shadowBlocks.length}.`);
  for (const { path, selector, declarations } of shadowBlocks) {
    if (declarations['--shadow-object'] === undefined || declarations['--shadow-look'] === undefined) problems.push(`${path}: \`${selector}\` sets only one of --shadow-object and --shadow-look.`);
  }
  const dark = shadowBlocks.slice(1).map(({ declarations }) => `${declarations['--shadow-object']} | ${declarations['--shadow-look']}`);
  if (new Set(dark).size > 1) problems.push('The three dark theme blocks give different object shadows; they must agree.');

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

  // The row fill: instant in, 120 ms out.
  const row = allRules.find(({ selector }) => selector === '.qi-row');
  if (normal(row?.declarations.transition ?? '') !== 'background-color120msvar(--out)') problems.push('`.qi-row` must fade its fill out over `background-color 120ms var(--out)`.');
  for (const state of ['.qi-row:hover', '[data-stretch-shell] .qi-row:focus-visible', '[data-stretch-shell] .qi-row:active']) {
    if (allRules.find(({ selector }) => selector === state)?.declarations.transition !== 'none') problems.push(`\`${state}\` must set \`transition: none\`, so the fill is instant in.`);
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
mustFail('focus ring width', broken('src/app/stretch-shell.css', 'outline: 2px solid var(--stretch-cobalt);', 'outline: 3px solid var(--stretch-cobalt);'), /focus ring/);
mustFail('focus ring offset', broken('src/app/quiet-long-form.css', '.qi-long__back:focus-visible {\n  border-radius: 6px;', '.qi-long__back:focus-visible {\n  border-radius: 6px;\n  outline-offset: 4px;'), /offset/);
mustFail('new focus ring offset', broken('src/app/parts.css', '  outline: 2px solid var(--cobalt);\n  outline-offset: 3px;', '  outline: 2px solid var(--cobalt);\n  outline-offset: 2px;'), /passes and panels focus ring/);
mustFail('panel ring colour', broken('src/app/parts.css', 'outline-color: var(--panel-ink);', 'outline-color: var(--cobalt);'), /var\(--panel-ink\)/);
mustFail('spring', broken('src/app/tokens.css', '--spring: cubic-bezier(.3, 1.5, .4, 1);', '--spring: cubic-bezier(.3, 1.4, .64, 1);'), /--spring/);
mustFail('feedback timing', broken('src/app/quiet-index.css', 'transition: background-color 120ms var(--out);', 'transition: background-color 400ms var(--out);'), /400 ms/);
mustFail('row fill', broken('src/app/quiet-index.css', '  background: var(--stretch-card);\n    transition: none;', '  background: var(--stretch-card);'), /instant in/);
mustFail('shadow tokens', broken('src/app/stretch-tokens.css', '--shadow-look: 0 0 0 1px rgb(0 0 0 / 0.08)', '--shadow-looks: 0 0 0 1px rgb(0 0 0 / 0.08)'), /shadow/);

console.log('Craft checks passed: one focus ring per design, the site curves, object shadows from tokens, feedback within 100 to 250 ms, rows instant in and 120 ms out.');
