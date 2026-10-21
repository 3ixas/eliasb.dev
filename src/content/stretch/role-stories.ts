/*
 * The Role stories in the Stretch shape. Copy is from
 * docs/content/redesign-copy.md ("Role stories"), approved by Elias before it
 * was written here. Public-safe: no colleague names, internal system names, or
 * appraisal, pay or level terms.
 */
import type { RoleStory, RoleStorySlug } from "./role-story";

/** One story for every employer: a missing or misspelt key does not compile. */
export const roleStories: Record<RoleStorySlug, RoleStory> = {
  "bnp-paribas": {
    slug: "bnp-paribas",
    employer: "BNP Paribas",
    role: "Software engineer",
    number: "01",
    dates: "Jul 2025 – now",
    setting: "Risk division · London",
    sections: {
      summary: {
        paragraphs: [
          "I’m a software engineer in BNP Paribas’s risk division in London. I work in C# on the engines that price and risk-manage trades on CPU and GPU, and I’m the team’s only C# engineer.",
        ],
      },
      "the-role": {
        paragraphs: [
          "The engines run large simulation-based calculations across several asset classes. It’s a big codebase, around 70 projects, and some of the C# is translated to run on the GPU.",
          "I joined in July 2025 having never written C#. Today I own implementation and delivery on the C# side, from planning through review.",
        ],
      },
      "the-problems": {
        points: [
          {
            lead: "Market data.",
            text: "Loaders written in Java had to be ported to C#, pulling data from several sources into one place and checking it on the way.",
          },
          {
            lead: "A stale dependency.",
            text: "The live pricing pipeline relied on a data file that was no longer reliably available in production.",
          },
          {
            lead: "Quant code.",
            text: "Pricing code written by quantitative developers had to be integrated into the engine.",
          },
          { lead: "Two execution paths.", text: "The same tests had to run on both CPU and GPU." },
        ],
      },
      decisions: {
        points: [
          {
            lead: "Ship the risky change behind a flag, switched off.",
            text: "Removing the dependency touched live pricing, so I put the new path behind a feature flag that defaults to off, added caching, and wrote an end-to-end test nobody had asked for. The architect’s view was that the thing to protect was the blast radius, not only correctness. I’d have called that a nice-to-have before; now it’s how I start.",
          },
          {
            lead: "Validate the data before trusting it.",
            text: "The commodity loader was the harder one: ten file types, correlation groups, unit conversions, and records linked to each other. I checked the links, so an orphaned record gets caught on load rather than showing up as a strange number in a simulation.",
          },
          {
            lead: "Give AI work phases.",
            text: "I built a workflow where each stage has its own scoped agent: grill the problem, plan, build test-first, self-review, then a health review. Each agent only sees what that stage needs, which keeps it from skipping ahead.",
          },
        ],
      },
      "what-changed": {
        paragraphs: [
          "I used that workflow to integrate a pricer into the calculation engine in a couple of days. For an experienced integration engineer it takes about two weeks, and I was new to it.",
          "I went from no C# to shipping production code independently in six months.",
          "The Early Careers digitisation competition is the other half of this. I led a team of four and co-built a dashboard from our users’ requirements, which cut a 30–40 minute data load to under 5. We won, out of five groups, and presented it to the Head of Risk Systems.",
        ],
      },
      "what-i-took-with-me": {
        paragraphs: [
          "I was nominated as an AI Champion in the risk division, and the workflow is now used by several teams across the department. I also won a Take Ownership award.",
          "The habit underneath all of it is simple: write down what you’re doing before you build it, and ship it so it’s safe to undo.",
        ],
      },
    },
    figures: {
      decisions: {
        kind: "flag",
        live: "Live pricing · today’s path",
        toggled: "New path · no stale file · cached",
        state: "off by default",
        caption: "Protect the blast radius",
      },
      // Lengths are in one unit per row: working days (two weeks taken as ten) and minutes (30–40 drawn at 40, under 5 at 5).
      "what-changed": {
        kind: "scale",
        rows: [
          {
            what: "Integrating a pricer",
            before: { label: "about two weeks, experienced", amount: 10 },
            after: { label: "a couple of days, new to it", amount: 2 },
          },
          {
            what: "The competition dashboard’s data load",
            before: { label: "30–40 min", amount: 40 },
            after: { label: "under 5 min", amount: 5 },
          },
        ],
        caption: "Bars to scale. Two weeks is taken as ten working days.",
      },
      "what-i-took-with-me": {
        kind: "certificate",
        id: "take-ownership-certificate",
        src: "/work/bnp-paribas/take-ownership.png",
        alt: "_nology’s Q1 2026 Take Ownership award certificate for Elias Bennett, citing his move into a C# role with no prior experience, production C# in pricing and risk systems, onboarding documentation and a winning digitisation project.",
        width: 1600,
        height: 900,
        caption: "Take Ownership · _nology · Q1 2026 · awarded May 2026",
      },
    },
    resume: [
      "Went from no C# to shipping production code independently in six months, and now own implementation and delivery as the team’s only C# engineer.",
      "Ported Java market-data loaders to C#, and took a stale data dependency out of live pricing behind a feature flag that defaults to off, with caching and an end-to-end test.",
      "Built an AI workflow that gives each stage its own scoped agent. It took a pricer integration from about two weeks to a couple of days, and several teams across the department now use it.",
      "Led a team of four to win the Early Careers digitisation competition, co-building a dashboard that cut a 30–40 minute data load to under 5.",
    ],
    evidence: [
      { value: "Nov 2025", label: "won the Early Careers digitisation competition" },
      { value: "6", label: "months from zero C# to production code" },
    ],
    // BNP's green, as a hue only (no logo). The light field takes near-black ink (5.0:1);
    // the dark field is the same hue deepened and takes light ink (11.4:1).
    colours: {
      light: { field: "#00965e", ink: "#06120d", swatch: "#053824" },
      dark: { field: "#0b3a28", ink: "#eaf5ef", swatch: "#3ecf8e" },
    },
    next: "joveen",
  },
  joveen: {
    slug: "joveen",
    employer: "Joveen",
    role: "Full stack software engineer",
    number: "02",
    dates: "Aug 2024 – Jun 2025",
    sections: {
      summary: {
        paragraphs: [
          "I was a full stack software engineer at Joveen, working on its e-commerce site in React, Java with Spring Boot and MySQL.",
        ],
      },
      "the-role": {
        paragraphs: [
          "I worked across the React front end, the Java API behind it and the MySQL database underneath. I was also on a coding bootcamp alongside the job.",
        ],
      },
      "the-problems": {
        points: [
          { lead: "A slow site.", text: "Pages took too long to load." },
          { lead: "A codebase on its way out.", text: "Some modules were still in PHP and had to move to Spring Boot." },
          { lead: "Mobile and browser bugs.", text: "Layouts and features broke on some phones and browsers." },
          { lead: "Slow queries.", text: "A key API was slower than it needed to be." },
        ],
      },
      decisions: {
        points: [
          {
            lead: "Make the front end do less up front.",
            text: "We refactored React components and lazy-loaded assets, so a page loads what it needs first.",
          },
          {
            lead: "Move PHP to Spring Boot in pieces.",
            text: "Migrating module by module let us release in smaller steps. I wrote endpoints, validation and tests, and fixed defects along the way.",
          },
          {
            lead: "Test across browsers, then fix.",
            text: "A cross-browser testing pipeline caught the mobile layout and functionality bugs, and I fixed them.",
          },
          {
            lead: "Measure the database.",
            text: "We added indexes and rewrote slow queries, starting with the API that mattered most.",
          },
        ],
      },
      "what-changed": {
        paragraphs: [
          "Page load fell by 40%. Deploys went from 10 minutes to under 2. Mobile retention rose by 30%. The key API’s p95 dropped from 520 ms to 230 ms, and cloud costs fell by 18%.",
        ],
      },
      "what-i-took-with-me": {
        paragraphs: [
          "Alongside the job I did freelance AI training, reviewing 1,000 code items across TypeScript, Python, Java, C# and SQL at 97% QA precision. It was my first sustained work with AI on code, and the start of the thread that leads to the workflow I built at BNP Paribas.",
        ],
      },
    },
    figures: {
      "the-role": {
        kind: "screens",
        images: [
          {
            src: "/work/joveen/home-desktop.webp",
            alt: "The joveen.com homepage on a desktop: the Joveen wordmark and menu above a hero for CliniCare skincare, with a Shop the Range button and a row of the range’s products.",
            width: 1600,
            height: 800,
            device: "desktop",
          },
          {
            src: "/work/joveen/home-phone.webp",
            alt: "The same joveen.com hero on a phone, stacked: the CliniCare line, the Shop the Range button and the products.",
            width: 585,
            height: 796,
            device: "phone",
          },
        ],
        caption: "joveen.com today, 16 October 2026. It now runs on Shopify: the live site, not my UI",
        source: { href: "https://www.joveen.com/", label: "joveen.com" },
      },
    },
    resume: [
      "Cut page load by 40% by refactoring React components and lazy-loading assets.",
      "Moved PHP modules to Spring Boot module by module, writing the endpoints, validation and tests.",
      "Fixed mobile layout and browser bugs found by a cross-browser testing pipeline; mobile retention rose by 30%.",
      "Added indexes and rewrote slow queries, taking the key API’s p95 from 520 ms to 230 ms.",
    ],
    evidence: [
      { value: "−40%", label: "page load" },
      { value: "Under 2", label: "minutes to deploy, down from 10" },
      { value: "+30%", label: "mobile retention" },
      { value: "230 ms", label: "key API p95, down from 520 ms" },
    ],
    // Joveen's identity is monochrome. The light band is black; the dark band is off-white, so it
    // stays distinct from the dark page. Both swatches clear 3:1 on their band and 4.5:1 on the page.
    colours: {
      light: { field: "#0a0a0a", ink: "#f2f2f2", swatch: "#737373" },
      dark: { field: "#ececec", ink: "#0a0a0a", swatch: "#7a7a7a" },
    },
    next: "optegra",
  },
  optegra: {
    slug: "optegra",
    employer: "Optegra Eye Healthcare & Kensington Medical",
    role: "Marketing executive",
    number: "03",
    dates: "Sep 2021 – Aug 2024",
    sections: {
      summary: {
        paragraphs: [
          "I was a marketing executive across two healthcare providers: private, at Kensington Medical, and NHS work through Optegra Eye Healthcare. The best part of the job was working with the engineers who built our website.",
        ],
      },
      "the-role": {
        paragraphs: [
          "From September 2021 at Kensington Medical, and from October 2022 at Optegra, I did digital marketing: campaign analysis, split tests and analytics dashboards. I also worked with the engineers on the company website, scoping and ticketing fixes.",
        ],
      },
      "the-problems": {
        points: [
          {
            lead: "Slow, uneven pages.",
            text: "The Core Web Vitals pass rate was 62%, and page loads were slower than they needed to be.",
          },
          { lead: "No clear view of what worked.", text: "We couldn’t easily tell which changes brought in consultations." },
        ],
      },
      decisions: {
        points: [
          {
            lead: "Scope the fix so it can be built.",
            text: "I scoped performance fixes with the engineers and ticketed them, so each one was something they could build and I could measure.",
          },
          {
            lead: "Test, then build.",
            text: "Split tests and analytics dashboards showed which changes helped, and that guided what the engineers worked on next.",
          },
        ],
      },
      "what-changed": {
        paragraphs: [
          "The Core Web Vitals pass rate went from 62% to 88%. The p95 page-load time fell by 30%. Consultation conversion rose by 15%.",
        ],
      },
      "what-i-took-with-me": {
        paragraphs: [
          "The click came in early 2024. A friend loved his work so much that even a hectic week sounded exciting, and I wanted that from mine. I started coding in my spare time, just to see, and by August 2024 I was doing it for a living.",
        ],
      },
    },
    figures: {
      "the-role": {
        kind: "screens",
        images: [
          {
            src: "/work/optegra/home.webp",
            alt: "The Optegra homepage in June 2024: a sunset beach behind the headline Choose Our Top Rated Eye Hospitals, a booking panel for a free video or telephone consultation, and the Trustpilot and NHS marks.",
            width: 1440,
            height: 900,
            device: "desktop",
          },
        ],
        caption: "Optegra homepage, Wayback Machine snapshot of 5 June 2024",
        source: {
          href: "https://web.archive.org/web/20240605112227/https://www.optegra.com/",
          label: "web.archive.org/web/20240605112227/https://www.optegra.com/",
        },
      },
      "what-changed": {
        kind: "screens",
        images: [
          {
            src: "/work/optegra/dry-amd-treatment.webp",
            alt: "Optegra’s dry AMD treatment page in June 2024: the headline Dry AMD Treatment, Available at our Central London and Manchester Eye Hospitals, Valeda Light Therapy, and a Request a Callback form.",
            width: 1440,
            height: 900,
            device: "desktop",
          },
        ],
        caption: "Optegra dry AMD treatment launch page, Wayback Machine snapshot of 13 June 2024",
        source: {
          href: "https://web.archive.org/web/20240613032246/https://www.optegra.com/dry-amd-treatment/",
          label: "web.archive.org/web/20240613032246/https://www.optegra.com/dry-amd-treatment/",
        },
      },
    },
    resume: [
      "Scoped performance fixes with the engineers and ticketed them, taking the Core Web Vitals pass rate from 62% to 88% and cutting p95 page load by 30%.",
      "Ran split tests and built analytics dashboards that showed which changes brought in consultations and guided what the engineers built next; consultation conversion rose by 15%.",
    ],
    evidence: [
      { value: "88%", label: "Core Web Vitals pass rate, up from 62%" },
      { value: "−30%", label: "p95 page load" },
      { value: "+15%", label: "consultation conversion" },
    ],
    // The teal of Optegra's logo (#00aa90, with its deeper #006765): the light band takes it as it is,
    // the dark band a deepened teal.
    colours: {
      light: { field: "#00aa90", ink: "#04100f", swatch: "#003d3b" },
      dark: { field: "#004a48", ink: "#e6f6f4", swatch: "#3ddbc2" },
    },
    next: null,
  },
};

export const roleStorySlugs = Object.keys(roleStories) as RoleStorySlug[];

/** The one checked lookup for a slug that comes from a URL, which is untrusted text. */
export function roleStoryFor(slug: string): RoleStory | undefined {
  return Object.hasOwn(roleStories, slug) ? roleStories[slug as RoleStorySlug] : undefined;
}
