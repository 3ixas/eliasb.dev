import { spawn } from "node:child_process";
import net from "node:net";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const compatibilityRedirects = new Map([
  ["/about", "/#where-ive-been"],
  ["/library", "/#off-the-clock"],
  ["/lab", "/#off-the-clock"],
]);

const canonicalPages = [
  "/",
  "/work",
  "/work/threshold",
  "/work/argus-risk",
  "/work/flowtime",
];
const expectedSitemapUrls = new Set(canonicalPages.map((route) => route === "/" ? "https://www.eliasb.dev" : `https://www.eliasb.dev${route}`));
const expectedWorkSocialCards = new Map([
  ["/work", {
    title: "Work · Elias Bennett",
    image: "/work/threshold/landing.webp",
    alt: "Threshold landing page introducing the real cost of moving out",
  }],
  ["/work/threshold", {
    title: "Threshold · Elias Bennett",
    image: "/work/threshold/landing.webp",
    alt: "Threshold landing page introducing the real cost of moving out",
  }],
  ["/work/argus-risk", {
    title: "Argus Risk · Elias Bennett",
    image: "/work/argus/overview.webp",
    alt: "Argus Risk dashboard showing portfolio value, profit and loss, exposure, and system status",
  }],
  ["/work/flowtime", {
    title: "Flowtime · Elias Bennett",
    image: "/work/flowtime/timer.jpg",
    alt: "Flowtime focus timer interface",
  }],
]);
const expectedIndexableRobots = [
  ["user-agent: *", "allow: /"],
  ["host: https://www.eliasb.dev", "sitemap: https://www.eliasb.dev/sitemap.xml"],
];

const requiredHomepageSections = ["work", "how-i-work", "where-ive-been", "off-the-clock", "say-hello"];
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

function metaContent(document, key, attributeName = "property") {
  const tag = tags(document, "meta").find((candidate) => attribute(candidate, attributeName) === key);
  return attribute(tag ?? "", "content");
}

function bodyMarkup(document) {
  const start = document.indexOf("<body");
  const end = document.indexOf("</body>");
  const body = document.slice(start >= 0 ? start : 0, end >= 0 ? end : document.length);
  return body.replace(/<script\b[\s\S]*?<\/script>/gi, "");
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
  const skipLink = hrefs(markup).find(({ href }) => href === "#main-content");
  check(skipLink && plainText(markup.slice(markup.indexOf(skipLink.tag))).startsWith("Skip to content"), `${route} should expose a skip link`);
  equal(tags(markup, "h1").length, 1, `${route} should have exactly one h1`);
}

function verifyHomepage(markup) {
  verifyPageShell(markup, "/");
  const fullOpening = "I build everyday software, and make complicated things feel simple.";
  const headlineContent = markup.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "";
  equal(plainText(headlineContent), fullOpening, "Homepage headline should be one complete, server-rendered sentence");
  // The entrance holds the page only after its guard script has run in a browser.
  check(!/data-entering/.test(markup), "Homepage content should never wait for the entrance in the server HTML");
  check(/Elias\s+Bennett/.test(plainText(markup)), "Homepage should carry the name as plain text");

  const nav = markup.match(/<nav aria-label="Primary navigation"[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? "";
  const navHrefs = hrefs(nav).map(({ href }) => href);
  equal(navHrefs.join("|"), "#work|#how-i-work|#where-ive-been|#off-the-clock|#say-hello", "Homepage primary navigation targets");
  const navLabels = [...nav.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map(([, content]) => plainText(content));
  equal(navLabels.join("|"), "Work|How I work|Where I’ve been|Off the clock|Say hello", "Homepage primary navigation labels");

  const pageIds = ids(markup);
  for (const sectionId of requiredHomepageSections) {
    const section = tags(markup, "section").find((tag) => attribute(tag, "id") === sectionId);
    check(section, `Homepage should expose #${sectionId} as a semantic section`);
    const labelledBy = attribute(section ?? "", "aria-labelledby");
    check(Boolean(labelledBy && pageIds.has(labelledBy)), `#${sectionId} should reference an existing heading`);
  }

  for (const { href } of hrefs(markup).filter(({ href }) => href?.startsWith("#"))) {
    check(pageIds.has(href.slice(1)), `Homepage anchor ${href} should resolve to an element`);
  }

  const text = plainText(markup);
  check(text.includes("Off the clock") && text.includes("Now making"), "Homepage should show Off the clock with Now making");

  // Say hello: the email is the big link; the résumé, GitHub and LinkedIn follow, in that order.
  const helloStart = markup.indexOf('id="say-hello"');
  const helloEnd = markup.indexOf("<footer", helloStart);
  const helloSection = helloStart >= 0 && helloEnd > helloStart ? markup.slice(helloStart, helloEnd) : "";
  check(Boolean(helloSection), "Homepage should render Say hello before the footer");
  const emailAction = hrefs(helloSection).find(({ href }) => href?.startsWith("mailto:"));
  check(emailAction, "Say hello should keep the email action");
  equal(emailAction?.href, "mailto:eliasthebennett@gmail.com", "The email action should write to Elias");
  const cards = [...helloSection.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].filter(([, tag]) => attribute(tag, "target") === "_blank");
  equal(cards.map(([, , body]) => plainText(body).split(" ")[0]).join("|"), "Résumé|GitHub|LinkedIn", "The links should be the résumé, GitHub and LinkedIn, in that order");
  const footer = markup.slice(markup.indexOf("<footer"), markup.indexOf("</footer>"));
  equal(plainText(footer), "Made by Elias", "The footer should be my signature");

  check(markup.includes('href="/work"'), "Homepage should link to the complete Work archive");
  check(markup.includes('href="/work/threshold"'), "Homepage should link to the Threshold case study");
  check(markup.includes('href="/work/argus-risk"'), "Homepage should link to the Argus Risk case study");
  check(markup.includes('href="/work/flowtime"'), "Homepage should link to the Flowtime case study");

  const imageTags = tags(markup, "img");
  check(imageTags.length >= 5, "Homepage should render its portrait, project and signal imagery");
  check(imageTags.every((tag) => attribute(tag, "alt") !== null), "Every homepage image should declare alternative text");
  check(markup.includes("Threshold landing page"), "Threshold imagery should have meaningful alternative text");
  check(imageTags.some((tag) => (attribute(tag, "srcset") ?? "").includes("/_next/image")), "Homepage imagery should use responsive Next Image sources");

  // Nothing from the retired Board, or from the sources dropped before it.
  check(!/data-board-|data-pin\b|board-surface|data-fixing/.test(markup), "No Board markup should remain on the homepage");
  check(!/id="outside-work"|id="about"|id="contact"|id="experiments"/.test(markup), "The Board's section anchors are gone");
  check(!/spotify/i.test(markup), "Nothing from Spotify should remain on the homepage");
  check(!/sleeper|NFL fantasy/i.test(markup), "Nothing from Sleeper or fantasy football should remain on the homepage");
  check(!/Strava|Typical week/.test(text), "Nothing on the homepage should come from Strava or the retired typical week");
  check(!/(ghp_|github_pat_|sk-[A-Za-z0-9]|STRAVA_CLIENT_SECRET)/i.test(text), "Rendered output must not contain credential-like values");

  for (const host of ["github.com"]) {
    check(hrefs(markup).some(({ href }) => href?.includes(host)), `Homepage should retain a ${host} link`);
  }
  // The project index's rows are whole-row links that open the destination in this tab.
  const external = hrefs(markup).filter(({ tag, href }) => href?.startsWith("http") && !(attribute(tag, "class") ?? "").includes("stretch-index__link"));
  for (const { tag, href } of external) {
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
    if (route === "/") await verifyHomeSocialMetadata(baseUrl, page.document);
    if (route.startsWith("/work")) await verifyWorkSocialMetadata(baseUrl, page.document, route);
  }

  const retiredConcepts = await fetch(new URL("/concepts", baseUrl), { redirect: "manual" });
  equal(retiredConcepts.status, 404, "The retired /concepts design study should no longer exist");
  const fixtures = await fetch(new URL("/fixtures/off-the-clock", baseUrl), { redirect: "manual" });
  equal(fixtures.status, 404, "Test fixtures should not exist in production");
  await verifyNotFound(baseUrl);

  for (const [route, location] of compatibilityRedirects) {
    const response = await fetch(new URL(route, baseUrl), { redirect: "manual" });
    equal(response.status, 308, `${route} should permanently redirect`);
    equal(response.headers.get("location"), location, `${route} compatibility target`);
  }
}

async function verifyHomeSocialMetadata(baseUrl, document) {
  const title = "Elias Bennett, software engineer in London";
  const description = "I’m Elias, a software engineer in London. I build everyday software, and make complicated things feel simple. Here’s my work, how I work, and what I’m up to.";
  equal(document.match(/<title>([^<]*)<\/title>/i)?.[1], title, "Homepage title");
  equal(metaContent(document, "description", "name"), description, "Homepage description");
  equal(metaContent(document, "og:title"), title, "Homepage Open Graph title");
  equal(metaContent(document, "og:site_name"), "Elias Bennett", "Open Graph site name");
  equal(metaContent(document, "og:image:alt"), "ELIAS BENNETT. I build everyday software, and make complicated things feel simple.", "Homepage social image alternative text");
  equal(metaContent(document, "twitter:title", "name"), title, "Homepage Twitter title");

  const ogImage = metaContent(document, "og:image");
  check(ogImage?.includes("/opengraph-image"), "Homepage Open Graph image should be the headline card");
  if (ogImage) {
    const image = await fetch(new URL(new URL(ogImage).pathname + new URL(ogImage).search, baseUrl));
    equal(image.status, 200, "The social image should return 200");
    equal(image.headers.get("content-type"), "image/png", "The social image content type");
  }
  check(metaContent(document, "twitter:image", "name")?.includes("/opengraph-image"), "Homepage Twitter image should be the headline card");

  const icon = tags(document, "link").find((tag) => attribute(tag, "rel") === "icon");
  check(attribute(icon ?? "", "href")?.startsWith("/icon.svg"), "The favicon should be the pushpin SVG");
  const iconSvg = await fetchAsset(baseUrl, "/icon.svg");
  check(iconSvg.includes("prefers-color-scheme: dark"), "The favicon should carry a dark-tab variant");
}

async function verifyNotFound(baseUrl) {
  const { response, document, markup } = await fetchPage(baseUrl, "/nothing-here-at-all");
  equal(response.status, 404, "An unknown route should return 404");
  verifyPageShell(markup, "/404");
  equal(document.match(/<title>([^<]*)<\/title>/i)?.[1], "Nothing here · Elias Bennett", "404 title");
  const robots = tags(document, "meta").filter((tag) => attribute(tag, "name") === "robots").map((tag) => attribute(tag, "content") ?? "");
  check(robots.length > 0 && robots.every((content) => /noindex/.test(content)), `Every robots tag on the 404 should say noindex (received ${JSON.stringify(robots)})`);
  equal(metaContent(document, "og:title"), "Nothing here · Elias Bennett", "The 404 should share under its own title, not the home page's");
  equal(metaContent(document, "og:url"), null, "The 404 should not claim the home page's URL when shared");
  const heading = markup.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "";
  equal(plainText(heading), "This page doesn’t exist.", "404 heading");
  check(plainText(markup).includes("It’s moved, or it never did. Everything else is where you left it."), "404 line");
  check(hrefs(markup).some(({ tag, href }) => href === "/" && plainText(markup.slice(markup.indexOf(tag))).startsWith("Back to the homepage")), "The 404 should link back to the homepage");
}

async function verifyWorkSocialMetadata(baseUrl, document, route) {
  const expected = expectedWorkSocialCards.get(route);
  if (!expected) return;

  const description = metaContent(document, "description", "name");
  const expectedUrl = `https://www.eliasb.dev${route}`;
  const ogImage = metaContent(document, "og:image");
  const twitterImage = metaContent(document, "twitter:image", "name");

  check(Boolean(description), `${route} should expose its own search description`);
  equal(metaContent(document, "og:title"), expected.title, `${route} Open Graph title`);
  equal(metaContent(document, "og:description"), description, `${route} Open Graph description`);
  equal(metaContent(document, "og:url"), expectedUrl, `${route} Open Graph URL`);
  check(ogImage?.endsWith(expected.image), `${route} Open Graph image should use its project artwork`);
  equal(metaContent(document, "og:image:alt"), expected.alt, `${route} Open Graph image alternative text`);
  equal(metaContent(document, "twitter:card", "name"), "summary_large_image", `${route} Twitter card type`);
  equal(metaContent(document, "twitter:title", "name"), expected.title, `${route} Twitter title`);
  equal(metaContent(document, "twitter:description", "name"), description, `${route} Twitter description`);
  check(twitterImage?.endsWith(expected.image), `${route} Twitter image should use its project artwork`);
  equal(metaContent(document, "twitter:image:alt", "name"), expected.alt, `${route} Twitter image alternative text`);

  const imageResponse = await fetch(new URL(expected.image, baseUrl), { redirect: "manual" });
  equal(imageResponse.status, 200, `${route} social image should return 200`);
  check(imageResponse.headers.get("content-type")?.startsWith("image/"), `${route} social image should have an image content type`);
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
