// Weekly check that every external link on the site still works (#266, reasoning in #249).
//
//   node scripts/check-external-links.mjs [--base-url URL] [--dry-run] [--extra-url URL ...]
//
// Reads <base-url>/sitemap.xml, fetches each page it lists (on the base URL's own origin, so it
// works against `next dev` as well as production), collects every external <a href>, requests
// each one, and keeps ONE "External links failing" issue in step with the result: opened or
// updated on failure, closed when everything passes. `--dry-run` prints what it would open,
// update or close and makes no GitHub call (it still requests the links). `--extra-url` adds a
// link as if a page carried it, to prove the failure path without touching the source.
// Exits non-zero while any link fails. scripts/verify-link-check.mjs holds the cases.
import { pathToFileURL } from 'node:url';

export const ISSUE_TITLE = 'External links failing';

// Hosts that refuse automated requests, so a status from them says nothing about the link.
// They are only checked for a well-formed URL. Keep this short.
export const BOT_HOSTILE_HOSTS = [
  // LinkedIn answers every non-browser request with its non-standard 999.
  'linkedin.com',
  // X answers non-browser requests with 403 or a login wall.
  'x.com',
  'twitter.com',
];

const SITE_HOSTS = ['eliasb.dev'];
const USER_AGENT = 'eliasb.dev-link-check/1.0 (+https://github.com/3ixas/eliasb.dev)';
const TIMEOUT_MS = 15_000;
const CONCURRENCY = 4;

const hostMatches = (host, domain) => host === domain || host.endsWith(`.${domain}`);

export const isBotHostile = (url) => {
  const { hostname } = new URL(url);
  return BOT_HOSTILE_HOSTS.some((domain) => hostMatches(hostname, domain));
};

const isSiteHost = (host) => SITE_HOSTS.some((domain) => hostMatches(host, domain));

const decodeEntities = (text) =>
  text
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

/** Every external http(s) <a href> in a page, without the fragment, in document order. */
export const externalLinks = (html) => {
  const found = [];
  for (const [, double, single, bare] of html.matchAll(/<a\s[^>]*?\bhref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const href = decodeEntities(double ?? single ?? bare);
    if (!/^https?:\/\//i.test(href)) continue;
    let url;
    try {
      url = new URL(href);
    } catch {
      found.push(href); // malformed: reported by `check`
      continue;
    }
    if (isSiteHost(url.hostname)) continue;
    url.hash = '';
    found.push(url.href);
  }
  return [...new Set(found)];
};

/** The page paths a sitemap lists, mapped onto the origin being checked. */
export const sitemapPaths = (xml) =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => {
    const { pathname, search } = new URL(decodeEntities(loc));
    return `${pathname}${search}`;
  });

/** Maps each external URL to the pages it appears on. */
export const collectLinks = (pages) => {
  const links = new Map();
  for (const { path, html } of pages) {
    for (const url of externalLinks(html)) links.set(url, [...(links.get(url) ?? []), path]);
  }
  return links;
};

const request = async (url, method) => {
  const response = await fetch(url, {
    method,
    redirect: 'follow',
    headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*;q=0.8' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  await response.body?.cancel();
  return response.status;
};

// 429 means "slow down", not "gone": the link is not known to be broken.
const ok = (status) => (status >= 200 && status < 400) || status === 429;

const attempt = async (url) => {
  try {
    // Many servers answer HEAD with 403/404/405 or drop it, so anything but a pass is asked again with GET.
    const head = await request(url, 'HEAD').catch(() => null);
    if (head !== null && ok(head)) return { status: head };
    return { status: await request(url, 'GET') };
  } catch (error) {
    return { status: null, error: error.name === 'TimeoutError' ? 'timed out' : (error.cause?.code ?? error.message) };
  }
};

/** Checks one URL: a well-formed URL only for bot-hostile hosts, else a request with one retry. */
export const check = async (url, { fetchStatus = attempt, wait = 2000 } = {}) => {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { url, ok: false, detail: 'not a valid URL' };
  }
  if (isBotHostile(parsed.href)) return { url, ok: true, skipped: true, detail: 'format only' };
  let result = await fetchStatus(parsed.href);
  if (!ok(result.status ?? 0)) {
    await new Promise((resolve) => setTimeout(resolve, wait));
    result = await fetchStatus(parsed.href);
  }
  const detail = result.status === null ? result.error : String(result.status);
  return { url, ok: ok(result.status ?? 0), detail };
};

const mapLimit = async (items, limit, task) => {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await task(items[index]);
      }
    }),
  );
  return results;
};

export const issueBody = (failures, checked) =>
  [
    `${failures.length} of ${checked} external links failed the weekly check.`,
    '',
    '| URL | Status | On page |',
    '| --- | --- | --- |',
    ...failures.map(({ url, detail, pages }) => `| ${url} | ${detail} | ${pages.join(', ')} |`),
    '',
    'Opened by `.github/workflows/link-check.yml` and kept up to date by it; it closes this issue once every link passes.',
  ].join('\n');

/** What to do to the one issue, given the failures and the open issue (or null). */
export const plan = (failures, checked, openIssue) => {
  if (failures.length > 0) {
    const body = issueBody(failures, checked);
    return openIssue
      ? { action: 'update', number: openIssue.number, title: ISSUE_TITLE, body }
      : { action: 'open', title: ISSUE_TITLE, body };
  }
  return openIssue ? { action: 'close', number: openIssue.number } : { action: 'none' };
};

const github = (repo, token) => async (path, init = {}) => {
  const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': USER_AGENT,
      ...init.headers,
    },
  });
  if (!response.ok) throw new Error(`GitHub ${init.method ?? 'GET'} ${path} answered ${response.status}`);
  return response.json();
};

const findOpenIssue = async (api) => {
  for (let page = 1; ; page++) {
    const issues = await api(`/issues?state=open&per_page=100&page=${page}`);
    const match = issues.find((issue) => !issue.pull_request && issue.title === ISSUE_TITLE);
    if (match || issues.length < 100) return match ?? null;
  }
};

const apply = async (api, step) => {
  const json = (body) => ({ body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
  if (step.action === 'open') await api('/issues', { method: 'POST', ...json({ title: step.title, body: step.body }) });
  if (step.action === 'update') await api(`/issues/${step.number}`, { method: 'PATCH', ...json({ body: step.body }) });
  if (step.action === 'close') {
    await api(`/issues/${step.number}/comments`, {
      method: 'POST',
      ...json({ body: 'Every external link passes again, closing.' }),
    });
    await api(`/issues/${step.number}`, { method: 'PATCH', ...json({ state: 'closed', state_reason: 'completed' }) });
  }
};

const argValues = (argv, flag) => argv.flatMap((arg, index) => (arg === flag ? [argv[index + 1]] : []));

const main = async () => {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const baseUrl = (argValues(argv, '--base-url')[0] ?? 'https://www.eliasb.dev').replace(/\/$/, '');
  const extra = argValues(argv, '--extra-url');

  const fetchText = async (path) => {
    const response = await fetch(`${baseUrl}${path}`, { headers: { 'user-agent': USER_AGENT } });
    if (!response.ok) throw new Error(`${baseUrl}${path} answered ${response.status}`);
    return response.text();
  };
  const paths = sitemapPaths(await fetchText('/sitemap.xml'));
  const pages = [];
  for (const path of paths) pages.push({ path, html: await fetchText(path) });
  const links = collectLinks(pages);
  // A collector that finds nothing has broken, and passing quietly would hide that.
  if (links.size === 0) throw new Error(`No external links found on ${paths.length} pages of ${baseUrl}.`);
  for (const url of extra) links.set(url, [...(links.get(url) ?? []), '(injected with --extra-url)']);
  console.log(`Collected ${links.size} external links from ${paths.length} pages of ${baseUrl}.`);

  const urls = [...links.keys()];
  const results = await mapLimit(urls, CONCURRENCY, (url) => check(url));
  for (const result of results) console.log(`${result.ok ? 'ok  ' : 'FAIL'} ${result.detail.padEnd(8)} ${result.url}`);
  const failures = results.filter((result) => !result.ok).map((result) => ({ ...result, pages: links.get(result.url) }));

  let openIssue = null;
  let api = null;
  if (!dryRun) {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY) {
      throw new Error('GITHUB_TOKEN and GITHUB_REPOSITORY are required (or pass --dry-run).');
    }
    api = github(process.env.GITHUB_REPOSITORY, process.env.GITHUB_TOKEN);
    openIssue = await findOpenIssue(api);
  }
  const step = plan(failures, urls.length, openIssue);
  if (dryRun) {
    console.log(`\nDry run, no GitHub call (no open issue is assumed). Would ${step.action}:`);
    if (step.title) console.log(`# ${step.title}\n\n${step.body}`);
  } else {
    await apply(api, step);
    console.log(`\nIssue: ${step.action}${step.number ? ` #${step.number}` : ''}.`);
  }
  if (failures.length > 0) process.exitCode = 1;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
