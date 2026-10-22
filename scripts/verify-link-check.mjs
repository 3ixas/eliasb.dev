import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { ISSUE_TITLE, check, collectLinks, externalLinks, isBotHostile, plan, sitemapPaths } from './check-external-links.mjs';

// The weekly link check must find external links in page HTML, request them without being
// fooled by HEAD-hostile servers, skip bot-hostile hosts, and keep exactly one issue in step
// with the result. Everything here runs offline against a local server.

// Collecting
const html = `
  <a href="https://github.com/3ixas/eliasb.dev#readme" class="x">repo</a>
  <a class="y" href="https://example.com/a?b=1&amp;c=2">query</a>
  <a href="https://www.eliasb.dev/work/x">own site</a>
  <a href="https://eliasb.dev/">own apex</a>
  <a href="/work/relative">relative</a>
  <a href="mailto:me@eliasb.dev">mail</a>
  <a href="#top">fragment</a>
  <a href='https://github.com/3ixas/eliasb.dev'>again, single quotes</a>
  <link href="https://fonts.example/f.css" rel="stylesheet">`;
assert.deepEqual(externalLinks(html), [
  'https://github.com/3ixas/eliasb.dev',
  'https://example.com/a?b=1&c=2',
]);
assert.deepEqual(
  [...collectLinks([{ path: '/', html }, { path: '/resume', html: '<a href="https://example.com/a?b=1&amp;c=2">q</a>' }])],
  [
    ['https://github.com/3ixas/eliasb.dev', ['/']],
    ['https://example.com/a?b=1&c=2', ['/', '/resume']],
  ],
);
assert.deepEqual(
  sitemapPaths('<urlset><url><loc>https://www.eliasb.dev</loc></url><url><loc>https://www.eliasb.dev/work/a</loc></url></urlset>'),
  ['/', '/work/a'],
);

// Bot-hostile hosts, including subdomains, and only those
assert.equal(isBotHostile('https://www.linkedin.com/in/elias'), true);
assert.equal(isBotHostile('https://x.com/someone'), true);
assert.equal(isBotHostile('https://github.com/3ixas'), false);
assert.equal(isBotHostile('https://notlinkedin.com/'), false);

// Checking, against a server that refuses HEAD and flakes once
let flaky = 0;
const server = createServer((request, response) => {
  const { url, method } = request;
  if (url === '/ok') return void response.writeHead(200).end();
  if (url === '/head-refused') return void response.writeHead(method === 'HEAD' ? 405 : 200).end();
  if (url === '/flaky') return void response.writeHead(flaky++ === 0 ? 503 : 200).end();
  if (url === '/limited') return void response.writeHead(429).end();
  response.writeHead(404).end();
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const run = (path) => check(`${base}${path}`, { wait: 0 });
try {
  assert.deepEqual(await run('/ok'), { url: `${base}/ok`, ok: true, detail: '200' });
  assert.equal((await run('/head-refused')).ok, true, 'a 405 to HEAD falls back to GET');
  assert.equal((await run('/flaky')).ok, true, 'a single 503 is retried');
  assert.equal((await run('/limited')).ok, true, 'a 429 is not a broken link');
  assert.deepEqual(await run('/gone'), { url: `${base}/gone`, ok: false, detail: '404' });
} finally {
  server.close();
}
// The port is closed by now, so the connection is refused.
assert.deepEqual(await check(`${base}/`, { wait: 0 }), { url: `${base}/`, ok: false, detail: 'ECONNREFUSED' });
let requested = false;
const skipped = await check('https://www.linkedin.com/in/elias', {
  fetchStatus: async () => ((requested = true), { status: 999 }),
});
assert.equal(skipped.ok, true);
assert.equal(requested, false, 'a bot-hostile host is never requested');
assert.equal((await check('https://exa mple.com/')).ok, false, 'a malformed URL fails');

// The one issue: open, update, close, or nothing
const failure = { url: 'https://example.com/gone', detail: '404', pages: ['/', '/resume'] };
const opened = plan([failure], 44, null);
assert.equal(opened.action, 'open');
assert.equal(opened.title, ISSUE_TITLE);
assert.match(opened.body, /1 of 44 external links failed/);
assert.match(opened.body, /\| https:\/\/example\.com\/gone \| 404 \| \/, \/resume \|/);

const updated = plan([failure, { ...failure, url: 'https://example.com/other', detail: 'timed out' }], 44, { number: 7 });
assert.equal(updated.action, 'update');
assert.equal(updated.number, 7);
assert.match(updated.body, /2 of 44/);
assert.match(updated.body, /timed out/);

assert.deepEqual(plan([], 44, { number: 7 }), { action: 'close', number: 7 });
assert.deepEqual(plan([], 44, null), { action: 'none' });

console.log('Link-check cases passed: collection, request fallback, allowlist and the open/update/close plan.');
