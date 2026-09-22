import { spawn } from "node:child_process";
import net from "node:net";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const compatibilityRedirects = new Map([
  ["/about", "/#about"],
  ["/library", "/#outside-work"],
  ["/lab", "/#experiments"],
]);

const canonicalPages = [
  "/",
  "/work",
  "/work/threshold",
  "/work/argus-risk",
  "/work/flowtime",
];
const expectedSitemapUrls = new Set(canonicalPages.map((route) => route === "/" ? "https://eliasb.dev" : `https://eliasb.dev${route}`));
const expectedIndexableRobots = [
  ["user-agent: *", "allow: /", "disallow: /concepts/"],
  ["host: https://eliasb.dev", "sitemap: https://eliasb.dev/sitemap.xml"],
];

const requiredHomepageSections = ["work", "outside-work", "experiments", "about", "contact"];
const signalStates = new Set(["live", "curated", "pending", "unavailable"]);
const failures = [];
let checkCount = 0;

function check(condition, message) {
  checkCount += 1;
  if (!condition) failures.push(message);
}

function equal(actual, expected, message) {
  check(actual === expected, `${message} (received ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`);
}

function tags(markup, name) {
  return [...markup.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map(([tag]) => tag);
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i"))?.[1]
    ?? tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i"))?.[2]
    ?? null;
}

function bodyMarkup(document) {
  const start = document.indexOf("<body");
  const end = document.indexOf("</body>");
  const body = document.slice(start >= 0 ? start : 0, end >= 0 ? end : document.length);
  const script = body.indexOf("<script");
  return script >= 0 ? body.slice(0, script) : body;
}

function plainText(markup) {
  return markup
    .replace(/<[^>]+>/g, " ")
    .replace(/<!--.*?-->/gs, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hrefs(markup) {
  return tags(markup, "a")
    .map((tag) => ({
      tag,
      href: attribute(tag, "href"),
    }))
    .filter(({ href }) => href);
}

function ids(markup) {
  return new Set([...markup.matchAll(/\sid="([^"]+)"/g)].map(([, id]) => id));
}

function normalizeRobotsPolicy(robots) {
  return robots
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((group) => group.split(/\r?\n/).filter(Boolean).map((line) => {
      const match = line.trim().match(/^([^:]+?)\s*:\s*(.*)$/);
      if (!match) return line.trim().toLowerCase();
      return `${match[1].trim().toLowerCase()}: ${match[2].trim()}`;
    }));
}

async function findAvailablePort() {
  const probe = net.createServer();
  await new Promise((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", resolve);
  });
  const address = probe.address();
  check(address && typeof address !== "string", "Could not determine a local server port");
  const port = address && typeof address !== "string" ? address.port : 0;
  await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
  return port;
}

function startBuiltServer(port) {
  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  return spawn(command, ["exec", "next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: { ...process.env, SITE_INDEXABLE: "true" },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function waitForServer(baseUrl, server) {
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Built server exited before becoming ready with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status < 500) return;
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw new Error(`Built server did not become ready: ${lastError?.message ?? "timeout"}`);
}

async function fetchPage(baseUrl, route) {
  const response = await fetch(new URL(route, baseUrl), { redirect: "manual" });
  const document = await response.text();
  return { response, document, markup: bodyMarkup(document) };
}

async function fetchAsset(baseUrl, route) {
  const response = await fetch(new URL(route, baseUrl), { redirect: "manual" });
  check(response.status === 200, `${route} should return 200`);
  return response.text();
}

function verifyPageShell(markup, route) {
  const main = tags(markup, "main")[0];
  check(main, `${route} should have a main landmark`);
  equal(attribute(main ?? "", "id"), "main-content", `${route} main landmark id`);
  equal(attribute(main ?? "", "tabindex"), "-1", `${route} main landmark should accept skip-link focus`);
  check(markup.includes('<a class="skip-link" href="#main-content">'), `${route} should expose a skip link`);
  equal(tags(markup, "h1").length, 1, `${route} should have exactly one h1`);
}

function verifyHomepage(markup) {
  verifyPageShell(markup, "/");

  const top = tags(markup, "div").find((tag) => attribute(tag, "id") === "top");
  check(top, "Homepage should expose #top as a focusable anchor target");
  equal(attribute(top ?? "", "tabindex"), "-1", "#top should accept keyboard navigation focus");

  const nav = markup.match(/<nav aria-label="Primary navigation">([\s\S]*?)<\/nav>/i)?.[1] ?? "";
  const navHrefs = hrefs(nav).map(({ href }) => href);
  equal(navHrefs.join("|"), "#top|#work|#outside-work|#about", "Homepage primary navigation targets");

  const pageIds = ids(markup);
  for (const sectionId of requiredHomepageSections) {
    const section = tags(markup, "section").find((tag) => attribute(tag, "id") === sectionId);
    check(section, `Homepage should expose #${sectionId} as a semantic section`);
    equal(attribute(section ?? "", "tabindex"), "-1", `#${sectionId} should accept keyboard navigation focus`);
    const labelledBy = attribute(section ?? "", "aria-labelledby");
    check(Boolean(labelledBy && pageIds.has(labelledBy)), `#${sectionId} should reference an existing heading`);
  }

  for (const { href } of hrefs(markup).filter(({ href }) => href?.startsWith("#"))) {
    check(pageIds.has(href.slice(1)), `Homepage anchor ${href} should resolve to an element`);
  }

  const outsideWorkTitle = markup.match(/<h2\b[^>]*\bid="outside-work-title"[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? "";
  equal(plainText(outsideWorkTitle), "Some of what I’m into lately.", "Homepage #outside-work-title rendered text");
  check(!plainText(markup).toLowerCase().includes("science fiction"), "Homepage should omit a standalone science-fiction category");
  check(markup.includes('href="/work"'), "Homepage should link to the complete Work archive");
  check(markup.includes('href="/work/threshold"'), "Homepage should link to the Threshold case study");
  check(markup.includes('href="/work/argus-risk"'), "Homepage should link to the Argus Risk case study");

  const imageTags = tags(markup, "img");
  check(imageTags.length >= 8, "Homepage should render the authored imagery and signal imagery");
  check(imageTags.every((tag) => attribute(tag, "alt") !== null), "Every homepage image should declare alternative text");
  check(markup.includes("Threshold landing page showing rental affordability"), "Threshold imagery should have meaningful alternative text");
  check(markup.includes("London skyline from the Thames"), "London imagery should have meaningful alternative text");
  check(markup.includes("Elias Bennett smiling in a white dinner jacket"), "About imagery should retain the selected portrait alternative text");
  check(tags(markup, "img").some((tag) => (attribute(tag, "srcset") ?? "").includes("/_next/image")), "Homepage imagery should use responsive Next Image sources");

  const detailBlocks = [...markup.matchAll(/<details\b[\s\S]*?<\/details>/gi)].map(([block]) => block);
  check(detailBlocks.length >= 4, "Homepage should retain native reading, cinema, and experiment disclosures");
  check(detailBlocks.every((block) => /<summary\b/i.test(block)), "Every disclosure should use a native summary control");
  check(markup.includes('data-close-object'), "Open culture objects should expose a keyboard-accessible close control");

  const spotifyFrame = tags(markup, "iframe").find((tag) => (attribute(tag, "src") ?? "").includes("open.spotify.com/embed/playlist/"));
  check(spotifyFrame, "Homepage should retain the official Spotify playlist embed");
  equal(attribute(spotifyFrame ?? "", "title"), "Elias’s current Spotify playlist", "Spotify iframe title");
  const spotifyLink = hrefs(markup).find(({ href }) => href?.includes("open.spotify.com/playlist/"));
  check(spotifyLink, "Homepage should expose a direct Spotify fallback link");
  check(markup.includes("Open playlist in Spotify"), "Spotify fallback link should be visibly labelled");

  const statuses = [...markup.matchAll(/<span class="signal-status" data-state="([^"]+)">([^<]*)<\/span>/gi)];
  check(statuses.length >= 6, "Outside work should expose status labels for its signal cards");
  for (const [, state, label] of statuses) {
    check(signalStates.has(state), `Signal state ${state} must use the shared signal contract`);
    check(Boolean(label.trim()), "Signal states must have a visible label");
  }
  const text = plainText(markup);
  check(text.includes("anonymous"), "Fantasy football output should keep opposing managers anonymous");
  check(text.includes("not synced to a fitness service") || text.includes("fitness service"), "Training output should distinguish authored data from a fitness sync");
  check(text.includes("Wikimedia") || text.includes("fallback"), "History output should identify its live or fallback source");
  check(/Stable fallback|Updated \d{1,2} [A-Z][a-z]{2,4}/.test(text), "Signal cards should expose visible freshness wording");
  check(["GitHub", "Goodreads", "Letterboxd", "Sleeper", "Wikimedia"].some((source) => text.includes(source)), "Signal cards should expose visible source wording");
  check(!/(ghp_|github_pat_|sk-[A-Za-z0-9]|STRAVA_CLIENT_SECRET)/i.test(text), "Rendered output must not contain credential-like values");

  const descriptions = [...markup.matchAll(/<span class="lab-description">([\s\S]*?)<\/span>/gi)]
    .map(([, description]) => plainText(description));
  check(descriptions.length >= 3 && descriptions.every((description) => description.length >= 60), "Long experiment descriptions should remain present in the rendered output");

  const fantasyCard = markup.match(/<article class="signal signal-fantasy">([\s\S]*?)<\/article>/i)?.[1] ?? "";
  const fantasyStatus = fantasyCard.match(/<span class="signal-status" data-state="([^"]+)">([^<]*)<\/span>/i);
  check(fantasyStatus, "Fantasy football card should expose a signal state");
  if (fantasyStatus?.[1] === "pending") {
    check(plainText(fantasyCard).includes("Sleeper pending"), "Pending fantasy state should show its Sleeper pending wording");
    check(!hrefs(fantasyCard).some(({ href }) => href?.includes("sleeper.com")), "Pending fantasy state should not expose a Sleeper source link");
  }
  if (fantasyStatus?.[1] === "live") {
    check(hrefs(fantasyCard).some(({ href }) => href?.includes("sleeper.com")), "Live fantasy state should retain its Sleeper source link");
  }

  const sourceHosts = ["github.com", "goodreads.com", "letterboxd.com", "wikipedia.org"];
  for (const host of sourceHosts) {
    check(hrefs(markup).some(({ href }) => href?.includes(host)), `Homepage should retain a ${host} source link`);
  }
  for (const { tag, href } of hrefs(markup).filter(({ href }) => href?.startsWith("http"))) {
    check(attribute(tag, "target") === "_blank", `External link ${href} should open in a new browsing context`);
    check((attribute(tag, "rel") ?? "").split(/\s+/).includes("noreferrer"), `External link ${href} should carry noreferrer`);
  }
}

async function verifyRoutes(baseUrl, pages) {
  for (const route of canonicalPages) {
    const page = pages.get(route) ?? await fetchPage(baseUrl, route);
    pages.set(route, page);
    equal(page.response.status, 200, `${route} should render successfully`);
    verifyPageShell(page.markup, route);
  }

  for (const [route, location] of compatibilityRedirects) {
    const response = await fetch(new URL(route, baseUrl), { redirect: "manual" });
    equal(response.status, 308, `${route} should permanently redirect`);
    equal(response.headers.get("location"), location, `${route} compatibility target`);
  }
}

async function verifyInternalLinks(baseUrl, pages) {
  const routes = new Set(["/"]);
  for (const { markup } of pages.values()) {
    for (const { href } of hrefs(markup)) {
      if (!href || !href.startsWith("/")) continue;
      const url = new URL(href, baseUrl);
      url.hash = "";
      url.search = "";
      routes.add(url.pathname || "/");
    }
  }

  for (const route of routes) {
    const response = await fetch(new URL(route, baseUrl), { redirect: "manual" });
    check(response.status >= 200 && response.status < 400, `Internal route crawl should resolve ${route} (received ${response.status})`);
  }
}

let server;
let baseUrl;

try {
  const port = await findAvailablePort();
  server = startBuiltServer(port);
  baseUrl = new URL(`http://127.0.0.1:${port}`);
  await waitForServer(baseUrl, server);

  const pages = new Map();
  const homepage = await fetchPage(baseUrl, "/");
  pages.set("/", homepage);
  equal(homepage.response.status, 200, "Homepage should render successfully");
  verifyHomepage(homepage.markup);

  await verifyRoutes(baseUrl, pages);

  const robots = await fetchAsset(baseUrl, "/robots.txt");
  equal(
    JSON.stringify(normalizeRobotsPolicy(robots)),
    JSON.stringify(expectedIndexableRobots),
    "Indexable robots.txt should match the complete expected directive policy",
  );

  const sitemap = await fetchAsset(baseUrl, "/sitemap.xml");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  equal(sitemapUrls.length, expectedSitemapUrls.size, "Sitemap should contain the intended number of canonical URLs");
  equal(
    JSON.stringify([...new Set(sitemapUrls)].sort()),
    JSON.stringify([...expectedSitemapUrls].sort()),
    "Sitemap URLs should match the canonical route set",
  );

  await verifyInternalLinks(baseUrl, pages);

  if (failures.length) {
    console.error(`Release verification failed with ${failures.length} finding(s) after ${checkCount} checks.`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(`Release production contract checks passed with ${checkCount} checks.`);
  }
} catch (error) {
  console.error(`Release verification could not complete: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  if (server) {
    if (server.exitCode === null) {
      await new Promise((resolve) => {
        server.once("close", resolve);
        server.kill("SIGTERM");
      });
    }
  }
}
