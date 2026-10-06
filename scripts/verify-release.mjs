import { spawn } from "node:child_process";
import net from "node:net";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const compatibilityRedirects = new Map([
  ["/about", "/#about"],
  ["/library", "/#outside-work"],
  ["/lab", "/#outside-work"],
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
    title: "Work · Elias B.",
    image: "/work/threshold/landing.webp",
    alt: "Threshold landing page introducing the real cost of moving out",
  }],
  ["/work/threshold", {
    title: "Threshold · Elias B.",
    image: "/work/threshold/landing.webp",
    alt: "Threshold landing page introducing the real cost of moving out",
  }],
  ["/work/argus-risk", {
    title: "Argus Risk · Elias B.",
    image: "/work/argus/overview.webp",
    alt: "Argus Risk dashboard showing portfolio value, profit and loss, exposure, and system status",
  }],
  ["/work/flowtime", {
    title: "Flowtime · Elias B.",
    image: "/work/flowtime/timer.jpg",
    alt: "Flowtime focus timer interface",
  }],
]);
const expectedIndexableRobots = [
  ["user-agent: *", "allow: /"],
  ["host: https://www.eliasb.dev", "sitemap: https://www.eliasb.dev/sitemap.xml"],
];

const requiredHomepageSections = ["work", "outside-work", "about", "contact"];
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
  check(!/data-home-opening/.test(markup), "Homepage content should never wait for the opening");
  check(!/Replay the opening/i.test(markup), "Homepage should not expose an opening replay control");

  const top = tags(markup, "div").find((tag) => attribute(tag, "id") === "top");
  check(top, "Homepage should expose #top as a focusable anchor target");
  equal(attribute(top ?? "", "tabindex"), "-1", "#top should accept keyboard navigation focus");

  const nav = markup.match(/<nav aria-label="Primary navigation">([\s\S]*?)<\/nav>/i)?.[1] ?? "";
  const navHrefs = hrefs(nav).map(({ href }) => href);
  equal(navHrefs.join("|"), "#work|#outside-work|#about", "Homepage primary navigation targets");
  const navLabels = [...nav.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map(([, content]) => plainText(content));
  equal(navLabels.join("|"), "Work|Library|About", "Homepage primary navigation labels");
  check(!/class="scroll-progress"/.test(markup), "Homepage should not render the retired scroll progress bar");

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
  const aboutStart = markup.lastIndexOf("<", markup.indexOf('id="about"'));
  const contactStart = markup.lastIndexOf("<", markup.indexOf('id="contact"'));
  const aboutSection = aboutStart >= 0 && contactStart > aboutStart ? markup.slice(aboutStart, contactStart) : "";
  check(Boolean(aboutSection), "Homepage should render its About section before Contact");
  // About: the story from the source note, five stops on the string, the grey-jumper photo.
  const aboutText = plainText(aboutSection);
  check(aboutText.includes("03 / About"), "About should be section 03, with Experiments gone");
  check(aboutText.startsWith("03 / About A bit about me. I studied history at university."), "About should open with history");
  check(aboutText.includes("a Greggs campaign"), "About should name the Greggs campaign, as approved");
  check(!/_nology|Optegra|Joveen/i.test(aboutText), "The bootcamp and earlier employers stay unnamed in the story");
  const stops = [...aboutSection.matchAll(/<li\b[^>]*data-stop="(\d)"[^>]*>([\s\S]*?)<\/li>/gi)].map(([, stop, body]) => `${stop} ${plainText(body)}`);
  equal(stops.length, 5, "About should pin five stops on the string");
  check(/^1 .*History at uni/.test(stops[0] ?? "") && /^5 .*BNP Paribas, today/.test(stops[4] ?? ""), "The stops should run from history to BNP Paribas");
  check(aboutText.includes("“I need that feeling from what I do.”"), "The speech bubble should quote the source word for word");
  check(tags(aboutSection, "img").some((tag) => attribute(tag, "alt") === "Elias smiling in a grey jumper outside a stone building on a sunny day"), "About should show the grey-jumper photo");
  check(!/career-employer|about-contact-cta|Career path/.test(aboutSection), "The career timeline and About's contact shortcut are gone");
  check(!markup.includes('id="experiments"'), "The Experiments section is gone; Making is on the Board");
  const contactEnd = markup.indexOf("<footer", contactStart);
  const contactSection = contactStart >= 0 && contactEnd > contactStart ? markup.slice(contactStart, contactEnd) : "";
  check(Boolean(contactSection), "Homepage should render its Contact section before the footer");
  check(!/<img\b/i.test(contactSection), "Contact should keep its visual focus on ways to connect");
  // Contact: the postcard is the email link; the CV, GitHub and LinkedIn are pinned cards, in that order.
  check(plainText(contactSection).includes("04 / Contact"), "Contact should be section 04");
  const contactHeading = contactSection.match(/<h2\b[^>]*id="contact-title"[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? "";
  equal(plainText(contactHeading), "Say hello", "Contact's heading should say hello");
  const emailAction = hrefs(contactSection).find(({ href }) => href?.startsWith("mailto:"));
  check(emailAction, "Contact should keep the email action");
  equal(attribute(emailAction?.tag ?? "", "aria-label"), "Email me at eliasthebennett@gmail.com", "The postcard should be named as the email link");
  check(plainText(contactSection).includes("Wish you were here."), "The postcard should carry its message");
  const cards = [...contactSection.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].filter(([, tag]) => attribute(tag, "target") === "_blank");
  equal(cards.map(([, , body]) => plainText(body).split(" ")[0]).join("|"), "Résumé|GitHub|LinkedIn", "The cards should be the CV, GitHub and LinkedIn, in that order");
  for (const [, tag, body] of cards) {
    check((attribute(tag, "rel") ?? "").split(/\s+/).includes("noreferrer"), `${plainText(body)} should keep safe external-link attributes`);
  }
  const footer = markup.slice(markup.indexOf("<footer"), markup.indexOf("</footer>"));
  equal(plainText(footer), "Made by Elias", "The footer should be the frame's edge and my signature");
  check(!plainText(markup).toLowerCase().includes("science fiction"), "Homepage should omit a standalone science-fiction category");
  check(markup.includes('href="/work"'), "Homepage should link to the complete Work archive");
  check(markup.includes('href="/work/threshold"'), "Homepage should link to the Threshold case study");
  check(markup.includes('href="/work/argus-risk"'), "Homepage should link to the Argus Risk case study");
  check(markup.includes('href="/work/flowtime"'), "Homepage should link to the Flowtime case study");

  const imageTags = tags(markup, "img");
  check(imageTags.length >= 8, "Homepage should render the authored imagery and signal imagery");
  check(imageTags.every((tag) => attribute(tag, "alt") !== null), "Every homepage image should declare alternative text");
  check(markup.includes("Threshold landing page showing rental affordability"), "Threshold imagery should have meaningful alternative text");
  check(markup.includes("London skyline from the Thames"), "London imagery should have meaningful alternative text");
  check(tags(markup, "img").some((tag) => (attribute(tag, "srcset") ?? "").includes("/_next/image")), "Homepage imagery should use responsive Next Image sources");

  // The cassette player is a facade: Spotify's player loads only when Play is pressed.
  check(!/open\.spotify\.com\/embed/.test(markup), "Spotify's player should load only when Play is pressed");
  check(tags(markup, "button").some((tag) => attribute(tag, "aria-label") === "Play my playlist on Spotify"), "The cassette player should have a named Play button");
  const spotifyLink = hrefs(markup).find(({ href }) => href?.includes("open.spotify.com/playlist/"));
  check(spotifyLink, "Homepage should expose a direct Spotify fallback link");
  check(markup.includes("Open in Spotify"), "Spotify fallback link should be visibly labelled");

  // The GitHub year is up only with a full year of data; when it is, it's 365 day buttons with tags.
  const github = markup.match(/data-board-pin="github"([\s\S]*)$/i)?.[1] ?? "";
  if (markup.includes('data-board-pin="github"')) {
    equal((github.match(/class="board-github-day"/g) ?? []).length, 365, "The GitHub sheet should hold exactly 365 days");
    check(/aria-label="(?:Nothing|\d+ contributions?) on [A-Z][a-z]{2} \d{1,2} [A-Z][a-z]{2,4}"/.test(github), "Each GitHub day should say its count and date");
    check(/GitHub contributions over the past year: [\d,]+/.test(github), "The GitHub sheet should be named with its total");
    check(!/\b3ixas\/[\w.-]+/.test(github), "The GitHub sheet should not expose repository details");
  }
  check(!/class="contribution-day"|signal-status|I couldn’t load GitHub/.test(markup), "The legacy GitHub card is gone");
  // Making: the blueprint shows what I'm making now, or my latest public repository.
  const making = markup.match(/data-board-pin="making"([\s\S]*?)data-board-pin=/i)?.[1] ?? "";
  check(/(Now making|Latest on GitHub)/.test(plainText(making)), "The Making pin should say what I'm making, or show my latest repository");

  const text = plainText(markup);
  check(/Now reading/.test(text) && /(Goodreads|Between books)/.test(text), "The book pin should show the book from Goodreads, or say I'm between books");
  check(/Admit one · Last watched/.test(text) && /(Letterboxd|Nothing logged yet)/.test(text), "The film ticket should show the film from Letterboxd, or say nothing is logged");
  check(!/private contributions are part of the total|keep their repositories private/i.test(text), "GitHub output should omit the redundant private-repository explanation");
  // Training: the running photo with my week as a plan, today marked once, and nothing from Strava.
  const training = markup.match(/data-board-pin="training"([\s\S]*?)data-board-pin=/i)?.[1] ?? "";
  check(plainText(training).includes("Out on a run, central London."), "The training pin should show the running photo's caption");
  check(tags(training, "img").some((tag) => attribute(tag, "alt") === "Elias mid-run on a rainy street in central London"), "The running photo should describe itself");
  check(/My training week, the plan\. Today, [A-Z][a-z]+day: /.test(plainText(training)), "The training plan should read once to screen readers, today first");
  equal((training.match(/data-today="true"/g) ?? []).length, 1, "The training plan should mark exactly one day as today");
  check(!/Strava|Typical week|My weekly training plan/.test(text), "Nothing on the homepage should come from Strava or the retired typical week");
  // The Weekly Curiosity: three oddities as a clipping, sourced to readable pages.
  // From the clipping's pin up to the next pin on the Board.
  const clipping = markup.match(/data-board-pin="clipping"([\s\S]*?)data-board-pin=/i)?.[1] ?? "";
  check(plainText(clipping).includes("The Weekly Curiosity"), "The clipping should carry its masthead");
  const stories = [...clipping.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)].map(([, story]) => story);
  equal(stories.length, 3, "The clipping should hold three oddities");
  const storyYears = stories.map((story) => Number(plainText(story).match(/(\d{1,4})\s+Read (?:on Wikipedia|more)/)?.[1] ?? 0));
  check(storyYears.every((year) => year > 0), "Each oddity should show its year");
  check(new Set(storyYears.map((year) => Math.floor((year - 1) / 100))).size >= 3, "The oddities should span at least three centuries");
  check(storyYears.some((year) => year < 1900), "The oddities should include one before 1900");
  for (const story of stories) {
    check(hrefs(story).some(({ href }) => href?.startsWith("https://")), "Each oddity should link directly to its source");
    check(/Read (?:on Wikipedia|more)/.test(plainText(story)), "Each oddity's source link should have a clear label");
    if (/<img\b/i.test(story)) {
      const credits = hrefs(story);
      check(/<img\b[^>]*alt="[^"]+"/i.test(story), "Each oddity's picture should have useful alternative text");
      check(plainText(story).includes("Image:"), "Each oddity's picture should name its creator");
      check(credits.some(({ href }) => href?.startsWith("https://commons.wikimedia.org/wiki/File:")), "Each oddity's picture should link to its Commons file record");
      check(/(?:CC BY|CC0|Public domain|GFDL|Free Art License)/i.test(plainText(story)), "Each oddity's picture should display its reuse licence");
    }
  }
  const daySource = hrefs(clipping).find(({ href }) => /^https:\/\/en\.wikipedia\.org\/wiki\/([A-Z][a-z]+_\d{1,2}|Portal:History)$/.test(href ?? ""));
  check(daySource, "The clipping's source should be the readable Wikipedia page for the day");
  check(!/api\/rest_v1/.test(clipping), "The clipping should never link to the feed's raw JSON");
  check(["GitHub", "Goodreads", "Letterboxd", "Sleeper", "Wikimedia"].some((source) => text.includes(source)), "Signal cards should expose visible source wording");
  check(!/(ghp_|github_pat_|sk-[A-Za-z0-9]|STRAVA_CLIENT_SECRET)/i.test(text), "Rendered output must not contain credential-like values");


  // The fantasy ticket is up only in season; when it is, it names my team and no one else.
  const fantasyAt = markup.indexOf('data-board-pin="fantasy"');
  if (fantasyAt >= 0) {
    const nextPin = markup.indexOf("data-board-pin=", fantasyAt + 1);
    const fantasyText = plainText(markup.slice(fantasyAt, nextPin > 0 ? nextPin : undefined));
    check(/NFL fantasy · Week\s\d+/.test(fantasyText), "The fantasy ticket should show the NFL week");
    check(fantasyText.includes("a rival who shall remain nameless"), "The fantasy ticket should keep the opponent anonymous");
    check(!/\b0\.00 – 0\.00\b/.test(fantasyText), "The fantasy ticket should never show a 0.00 – 0.00 new week");
  }
  check(!hrefs(markup).some(({ href }) => href?.includes("sleeper.com")), "Nothing should link to the Sleeper league, which names the league and its teams");

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
    if (route.startsWith("/work")) await verifyWorkSocialMetadata(baseUrl, page.document, route);
  }

  const retiredConcepts = await fetch(new URL("/concepts", baseUrl), { redirect: "manual" });
  equal(retiredConcepts.status, 404, "The retired /concepts design study should no longer exist");
  const fixtures = await fetch(new URL("/fixtures/pins", baseUrl), { redirect: "manual" });
  equal(fixtures.status, 404, "Test fixtures should not exist in production");

  for (const [route, location] of compatibilityRedirects) {
    const response = await fetch(new URL(route, baseUrl), { redirect: "manual" });
    equal(response.status, 308, `${route} should permanently redirect`);
    equal(response.headers.get("location"), location, `${route} compatibility target`);
  }
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
