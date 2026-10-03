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
  const aboutStart = markup.indexOf('<section class="about-section"');
  const contactStart = markup.indexOf('<section id="contact"');
  const aboutSection = aboutStart >= 0 && contactStart > aboutStart ? markup.slice(aboutStart, contactStart) : "";
  check(Boolean(aboutSection), "Homepage should render its About section before Contact");
  check(aboutSection.includes("Career path"), "About should identify the career overview");
  const careerCopy = plainText(aboutSection);
  check(careerCopy.includes("My career so far."), "About should introduce the career progression plainly");
  check(careerCopy.includes("I started in marketing and data, then moved into software"), "About should explain the verified career progression in plain language");
  check(careerCopy.includes("Core Web Vitals and split tests"), "About should ground the marketing stage in approved career evidence");
  check(careerCopy.includes("React, MySQL, and Java/Spring Boot"), "About should explain the move into full-stack work with approved evidence");
  check(careerCopy.includes("I work on software that brings market data into pricing and risk calculations"), "About should describe the current role with its verified pricing/risk systems context");
  const careerRoles = [...aboutSection.matchAll(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi)].map(([, title]) => plainText(title));
  equal(careerRoles.join("|"), "Marketing Executive|Full Stack Software Engineer|Software Engineer working on pricing and risk systems", "About career roles should describe the verified current work without inventing an official title");
  const careerEmployers = [...aboutSection.matchAll(/class="career-employer"[^>]*>([\s\S]*?)<\/p>/gi)].map(([, employer]) => plainText(employer));
  equal(careerEmployers.join("|"), "Optegra Eye Healthcare & Kensington Medical|Joveen|BNP Paribas CIB", "About should show the verified employers in order");
  const careerDates = [...aboutSection.matchAll(/<time\b[^>]*>([\s\S]*?)<\/time>/gi)].map(([, date]) => plainText(date));
  equal(careerDates.join("|"), "Sept 2021|Aug 2024|Aug 2024|June 2025|July 2025", "About should expose the verified role dates");
  check(aboutSection.includes("Present"), "About should show the current role as ongoing");
  check(aboutSection.includes("High-Performance Computing"), "About should retain the verified current team context");
  check(!aboutSection.includes("AI model training"), "About should not claim unverified career experience");
  equal((aboutSection.match(/\bawkward\b/gi) ?? []).length, 0, "About should not use vague filler language");
  check(!aboutSection.includes("Outside the editor"), "About should not repeat the interests gathered in Library");
  check(!aboutSection.includes("A few other ways I measure a week."), "About should not render the duplicate interests grid");
  check(!aboutSection.includes("profile-links"), "About should not retain the profile-link group");
  const aboutContactAction = [...aboutSection.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
    .find(([, tag]) => attribute(tag, "class") === "about-contact-cta");
  check(Boolean(aboutContactAction), "About should preserve its Contact shortcut");
  equal(attribute(aboutContactAction?.[1] ?? "", "href"), "#contact", "About conversation action should use the existing Contact anchor");
  check(plainText(aboutContactAction?.[2] ?? "").includes("Start a conversation"), "About Contact shortcut should retain its clear label");
  const contactEnd = markup.indexOf("<footer", contactStart);
  const contactSection = contactStart >= 0 && contactEnd > contactStart ? markup.slice(contactStart, contactEnd) : "";
  check(Boolean(contactSection), "Homepage should render its Contact section before the footer");
  check(!/<img\b/i.test(contactSection), "Contact should keep its visual focus on ways to connect");
  const contactActions = contactSection.match(/<nav class="contact-profile-links"[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? "";
  const contactProfiles = [...contactActions.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  equal(contactProfiles.length, 3, "Contact should present GitHub, LinkedIn, and résumé actions");
  for (const [index, [, tag, label]] of contactProfiles.entries()) {
    const expectedLabel = ["GitHub", "LinkedIn", "Résumé"][index];
    check(plainText(label).includes(expectedLabel), `Contact profile action ${index + 1} should be labelled ${expectedLabel}`);
    equal(attribute(tag, "target"), "_blank", `${expectedLabel} should preserve its external-link behavior`);
    check((attribute(tag, "rel") ?? "").split(/\s+/).includes("noreferrer"), `${expectedLabel} should retain safe external-link attributes`);
  }
  const emailAction = hrefs(contactSection).find(({ href }) => href?.startsWith("mailto:"));
  check(emailAction, "Contact should retain the primary email action");
  check(attribute(emailAction?.tag ?? "", "class") === "contact-link", "Email should remain the primary contact action");
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
  check(markup.includes("Elias Bennett smiling in a white dinner jacket"), "About imagery should retain the selected portrait alternative text");
  check(tags(markup, "img").some((tag) => (attribute(tag, "srcset") ?? "").includes("/_next/image")), "Homepage imagery should use responsive Next Image sources");

  const detailBlocks = [...markup.matchAll(/<details\b[\s\S]*?<\/details>/gi)].map(([block]) => block);
  check(detailBlocks.length >= 2, "Homepage should retain native experiment disclosures");
  check(detailBlocks.every((block) => /<summary\b/i.test(block)), "Every disclosure should use a native summary control");

  // The cassette player is a facade: Spotify's player loads only when Play is pressed.
  check(!/open\.spotify\.com\/embed/.test(markup), "Spotify's player should load only when Play is pressed");
  check(tags(markup, "button").some((tag) => attribute(tag, "aria-label") === "Play my playlist on Spotify"), "The cassette player should have a named Play button");
  const spotifyLink = hrefs(markup).find(({ href }) => href?.includes("open.spotify.com/playlist/"));
  check(spotifyLink, "Homepage should expose a direct Spotify fallback link");
  check(markup.includes("Open in Spotify"), "Spotify fallback link should be visibly labelled");

  const statuses = [...markup.matchAll(/<span class="signal-status" data-state="([^"]+)">([^<]*)<\/span>/gi)];
  // GitHub and training keep their legacy cards until they move onto the Board in #86 and #87.
  check(statuses.length >= 2, "Outside work should expose status labels for its signal cards");
  for (const [, state, label] of statuses) {
    check(signalStates.has(state), `Signal state ${state} must use the shared signal contract`);
    check(Boolean(label.trim()), "Signal states must have a visible label");
  }
  const githubCalendar = [...markup.matchAll(/<[a-z][^>]*>/gi)]
    .map(([tag]) => tag)
    .find((tag) => attribute(tag, "role") === "grid" && /GitHub/i.test(attribute(tag, "aria-label") ?? ""));
  const calendarUnavailableNotice = [...markup.matchAll(/<[a-z][^>]*>/gi)]
    .map(([tag]) => tag)
    .find((tag) => tag.includes("contribution-calendar-empty"));
  if (githubCalendar) {
    const githubCalendarLabel = attribute(githubCalendar, "aria-label") ?? "";
    check(/GitHub contributions.*by day/i.test(githubCalendarLabel), "GitHub contribution grid should name its day-level data");
    check(!/\b[\w.-]+\/[\w.-]+\b/.test(githubCalendarLabel), "GitHub contribution description should not expose repository details");
    check((markup.match(/class="contribution-day"/g) ?? []).length === 365, "GitHub contribution grid should expose exactly 365 days");
    check(markup.includes("Past 365 days"), "GitHub contribution grid should identify its time window");
    check(/\b[A-Z][a-z]{2} 20\d{2} – [A-Z][a-z]{2} 20\d{2}\b/.test(plainText(markup)), "GitHub contribution grid should show month and year context");
    check(markup.includes("contribution-calendar-instructions"), "GitHub contribution grid should explain its scroll and keyboard controls");
  } else {
    check(calendarUnavailableNotice || /I couldn’t load GitHub just now/.test(plainText(markup)), "Without the private aggregate snapshot, GitHub should explain why the full-year calendar is unavailable");
    check(!/class="contribution-day"/.test(markup), "A partial public-event feed should not be shown as a complete year");
  }

  const text = plainText(markup);
  const githubSignal = markup.match(/<article class="signal signal-building"[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? "";
  check(!/Private contribution count|class="signal-metrics"/.test(githubSignal), "GitHub output should not show a separate private contribution statistic");
  check(/Now reading/.test(text) && /(Goodreads|Between books)/.test(text), "The book pin should show the book from Goodreads, or say I'm between books");
  check(/Admit one · Last watched/.test(text) && /(Letterboxd|Nothing logged yet)/.test(text), "The film ticket should show the film from Letterboxd, or say nothing is logged");
  check(!/private contributions are part of the total|keep their repositories private/i.test(text), "GitHub output should omit the redundant private-repository explanation");
  check(text.includes("Strava") || (text.includes("Typical week") && text.includes("My weekly plan")), "Training output should distinguish live activity from an authored typical week");
  const trainingCard = markup.match(/<article class="signal signal-training">([\s\S]*?)<\/article>/i)?.[1] ?? "";
  const trainingText = plainText(trainingCard);
  if (trainingText.includes("My weekly training plan")) {
    check(!/maintained by hand|not a live workout log|usual plan/i.test(trainingText), "Training should skip redundant schedule explanations");
    check(!/class="training-day"/.test(trainingCard), "The retired authored training schedule should not render");
  }
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
  check(/Updated \d{1,2} [A-Z][a-z]{2,4}|Wikimedia · cached/i.test(text), "Signal cards should expose a useful update date or cache label");
  check(["GitHub", "Goodreads", "Letterboxd", "Sleeper", "Wikimedia"].some((source) => text.includes(source)), "Signal cards should expose visible source wording");
  check(!/(ghp_|github_pat_|sk-[A-Za-z0-9]|STRAVA_CLIENT_SECRET)/i.test(text), "Rendered output must not contain credential-like values");

  const descriptions = [...markup.matchAll(/<span class="lab-description">([\s\S]*?)<\/span>/gi)]
    .map(([, description]) => plainText(description));
  check(descriptions.length >= 3 && descriptions.every((description) => description.length >= 60), "Long experiment descriptions should remain present in the rendered output");
  check(text.includes("first public version of Professor Past"), "Professor Past should be identified as its first public version");

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
