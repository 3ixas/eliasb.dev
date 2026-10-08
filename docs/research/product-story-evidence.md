# Product and go-to-market story: what the evidence shows

Research for [#102](https://github.com/3ixas/eliasb.dev/issues/102), feeding the grilling session [#103](https://github.com/3ixas/eliasb.dev/issues/103) under the map [#100](https://github.com/3ixas/eliasb.dev/issues/100). Gathered 8 October 2026.

This note reports only what the sources show. Where nothing exists, it says so. It does not infer practices from code quality or from planning documents that were never carried out.

## Bottom line

- **Deciding what to build:** every project has a written problem statement, a named target user, and an explicit out-of-scope list, usually as a PRD or spec written before the code. Argus states plainly that its real audience is hiring managers. There is no record of how the problems were chosen or checked with anyone before building.
- **Knowing it works:** there is no evidence of talking to users, collecting outside feedback, or watching usage in any project. No product analytics run anywhere. Flowtime's spec planned five-person user testing, and those boxes were never ticked. Ask Professor Past v2 has anonymous product events wired up (case started, completed, abandoned), but they only go to a server log, and v2 isn't public. The site's own iterations came from Elias reviewing his site himself.
- **Go-to-market:** the repositories record the facts of the marketing career: role, employer, dates, healthcare, and that he enjoyed working with the website engineers. They say nothing about what he actually did or learned in marketing.
- **Live claim at risk:** the hero's supporting line says Elias handles "deciding what's worth making … and improving it after it ships" ([`src/content/site.ts:10`](../../src/content/site.ts)). Nothing in the sources supports the "improving it after it ships" half yet.

## 1. How Elias decides what to build

### What the sources show

| Project | Evidence | Source |
| --- | --- | --- |
| Threshold | A PRD with a problem statement ("People in their 20s and 30s make the decision to move out … without a clear, honest view of what it will actually cost"), 57 user stories, and an out-of-scope list. Written 16 April 2026, then built in thirteen slices that were all closed the same day. | [threshold#1](https://github.com/3ixas/threshold/issues/1), issues #2–#14 |
| Threshold | The target user is named as "people in their 20s–30s deciding whether they can afford to move out". | `threshold/.stitch/SITE.md` §1 |
| Threshold | The case study frames it as Elias's own question: "can I afford to move, and if not, how long until I can?" | [`src/content/case-files.ts:89`](../../src/content/case-files.ts) |
| Flowtime | The spec names target users (knowledge workers, people using a stopwatch for Flowtime, Pomodoro users) and a core problem ("practitioners manually time sessions with phone stopwatches, calculate break durations mentally"). Its success criterion is that a first full cycle can be finished within 2 minutes. | `flowtime-focus-timer/project-spec.md` lines 3–17 |
| Flowtime | The v2 roadmap ranks features in a "Why It Matters" / "Effort" table and states the goal as "a polished portfolio piece … while serving as a personal productivity tool ready for public launch". | `flowtime-focus-timer/v2-roadmap.md` lines 1–45 |
| Argus Risk | The spec separates a simulated target user (a risk or portfolio manager) from the actual audience: "Hiring managers and engineers at banks, hedge funds, and trading firms". | `argus-risk/project-spec.md` lines 5–11 |
| Ask Professor Past | v1 shipped publicly as a chatbot (README: "Live Demo: askprofessorpast.com", deployed on Railway). The v2 spec rejects the chat-first design: "not a generic chat wrapper … Chat is an adaptive interaction inside a structured casebook". | [ask-professor-past README](https://github.com/3ixas/ask-professor-past); `ask-professor-past-v2/IMPLEMENTATION_SPEC.md` §1–2.1 |
| Ask Professor Past | The v2 audience is "curious adults and older teenagers" plus "portfolio reviewers"; a classroom product is excluded on purpose. | `ask-professor-past-v2/IMPLEMENTATION_SPEC.md` §2.2 |
| Ask Professor Past | Material case replacement "requires an explicit product decision; it must not happen silently". | `ask-professor-past-v2/IMPLEMENTATION_SPEC.md` §2.3 |
| eliasb.dev | Discovery set the audience ("people hiring founding engineers or product engineers"), compared three visual directions before building, and chose projects by what public evidence could support. It also warned that "public repositories do not establish customer traction … without inventing market outcomes." | [`docs/discovery/DISCOVERY.md`](../discovery/DISCOVERY.md) lines 6, 106–114, 176–200 |
| eliasb.dev | The Work section lists what each case study would improve next, such as Threshold's stale data and Argus's unmeasured latency. These are self-identified next steps, not prompted by user requests. | [`src/content/case-files.ts`](../../src/content/case-files.ts) lines 144–152, 234–242, 316–320 |

**Pattern the sources support:** Elias writes the problem, the user, success criteria and exclusions down before building, and cuts scope deliberately. The documents say what to build, not why this idea over others.

### Missing

- No record of why these problems were picked, such as personal pain, friends' pain, a market gap, or portfolio value. The only explicit "why" is Argus's portfolio audience and the Threshold case study's first-person question.
- No ideas that were considered and dropped, and no evidence of validating an idea before building it.
- Elias's private repos (budgeting tool, Sleeper companion, flat hunt, wedding gift fund, and others in `gh repo list 3ixas`) look like they may solve his own problems. They are out of scope for this ticket and weren't read.

## 2. How he knows a product is working

### What the sources show

| Project | Analytics or usage tracking | Feedback or user contact | Source |
| --- | --- | --- | --- |
| Threshold | None. No analytics dependency in `package.json`. | None recorded. All 33 commits are dated 16–17 April 2026, with no later product iteration. | `threshold/package.json`, `git log` |
| Flowtime | None. The spec lists "Vercel Analytics (optional, privacy-friendly)" and "No analytics tracking without user consent", but nothing is installed. The repo's "analytics" are the user's own session statistics shown inside the app, not product analytics. | The spec planned "5 users complete first session without asking questions", an "informal survey", and "3 test users can describe it back". **Every one of those checkboxes is still unticked.** The commit titled "portfolio review" was a code and docs cleanup. The README says "suggestions are welcome"; the repo has no issues. | `flowtime-focus-timer/project-spec.md` lines 143, 203, 225–229, 255–257; `todo.md` (commit `49550dd`); README line 185 |
| Argus Risk | Not applicable: it's a local simulator. Its success metrics are technical (latency, throughput, coverage), and the case study says latency is unmeasured. | None. | `argus-risk/project-spec.md` §Success Metrics; [`case-files.ts:234`](../../src/content/case-files.ts) |
| Ask Professor Past v1 | None. "Simple analytics dashboard to track most-asked historical themes" is listed under Future Enhancements. | None recorded, though v1 was publicly deployed. | v1 README |
| Ask Professor Past v2 | **Instrumented but not live.** The frontend sends `case_started`, `step_completed`, `case_completed`, `case_abandoned`, `turn_error`, and `performance` events to `POST /api/v1/events`, which only writes a log line. The spec frames this as "minimal anonymous product events" for drop-off, with no message content. | The close-out plan promises "what was learned from real-provider and public usage", but this hasn't happened yet. Every public-release gate is open. | `web/src/lib/api.ts` lines 110–133; `web/src/components/investigation-client.tsx` lines 331, 346; `api/app/main.py` lines 260–271; `IMPLEMENTATION_SPEC.md` §7.2, §11; `PARENT_ISSUE_DRAFT.md` line 89; `RELEASE_PLAN.md` lines 36–40, 129, 159–177 |
| eliasb.dev | **Planned, not installed.** Three docs specify "privacy-conscious page-view and performance analytics", but `package.json` has no analytics dependency and `src/` has no analytics component. I didn't check the Vercel dashboard because the Vercel connector needs authorisation. | Iteration came from Elias's own annotated reviews of his live and preview site (14, 22 and 25 September 2026), each turned into a spec and tickets. The dogfood report labels its personas "inferred"; it was an automated browser QA pass, not people. | [`DISCOVERY.md:171`](../discovery/DISCOVERY.md), [`DESIGN-BRIEF.md:109`](../discovery/DESIGN-BRIEF.md), [`REFOUNDATION-SCOPE.md:197`](../specs/REFOUNDATION-SCOPE.md); [`docs/review/`](../review/); [`dogfood report`](../dogfood-reports/2026-09-24-codex-one-page-personal-surface-dogfood.md) §Personas |

**Pattern the sources support:** Elias defines success up front, sometimes including user-testing criteria (Flowtime), and builds privacy-first measurement into the design (Professor Past v2). He iterates hard on his own critique. There is **no evidence** that he ran user tests, talked to users, or used analytics data to change a product.

### Missing

- Whether anyone (friends, family, colleagues, strangers) has used Threshold, Flowtime, or Professor Past, and what they said.
- Whether Flowtime's planned five-person test ever happened outside the repo.
- Whether Vercel Web Analytics is turned on in the dashboard for any project, and whether Elias has looked at it.
- Whether Professor Past v1 had any traffic or reactions while it was live.
- Whether Elias uses Flowtime or Threshold himself. The v2 roadmap calls Flowtime "a personal productivity tool", but no source records his own use.

## 3. Go-to-market understanding from the marketing career

### What the sources show

- **Roles and dates**, from the career timeline on the site, added in commit `7742a51` (#47) and later removed from the page:
  - Marketing Executive at Optegra Eye Healthcare & Kensington Medical, September 2021 to August 2024.
  - Full Stack Software Engineer at Joveen, August 2024 to June 2025.
  - Software Engineer at BNP Paribas CIB, July 2025 to now, in "High-Performance Computing, Pricing and Risk Systems".

  The release check called these "verified". Issue #47 names the linked résumé as the factual source.
- **The About story** ([`src/content/about.ts:11`](../../src/content/about.ts)) says he "ended up in digital marketing in healthcare, and the part I enjoyed most was working with the engineers who built our website". His dad worked in advertising, the source of the Greggs anecdote. The About copy keeps Optegra unnamed on purpose ([`docs/content/copy/11-about-journey.md:5`](../content/copy/11-about-journey.md)).
- **Earlier positioning:** an old site tagline read "From healthcare marketing to full-stack software and high-performance pricing and risk systems" (commit `7742a51`).
- **Adjacent to go-to-market, but not go-to-market:** Flowtime added `robots.txt` and a sitemap "for SEO" (commit 2026-01-10). Professor Past v2 has a staged public-beta release plan with a canonical domain and legacy preservation (`RELEASE_PLAN.md`). These show launch hygiene, not marketing practice.

### Missing (nothing in any source)

- What the marketing role involved: channels (SEO, paid search, email, social, content), patient-acquisition funnels, campaign measurement, conversion tracking, A/B tests, CRM, website analytics tools.
- What he learned there about how people find, judge, and choose a product, and how that shows up in his building today.
- Any go-to-market action for his own projects: launch posts, sharing, positioning tests, sign-ups.
- The e-commerce full-stack role at Joveen: whether it touched conversion, analytics, merchandising, or customer feedback.
- His résumé (the Google Doc linked from [`src/content/site.ts:67`](../../src/content/site.ts)) **was not read**. Fetching it was blocked during this research. It probably holds the marketing detail and should be checked with Elias in #103.

## Questions the grilling session (#103) must put to Elias

**Deciding what to build**

1. For each of Threshold, Flowtime, Argus Risk, and Professor Past: where did the idea come from, and what made it worth building over other ideas?
2. Did you check the problem with anyone before building, even informally? Who?
3. What have you decided *not* to build, and why? Professor Past's v1-to-v2 change and the dropped Experiments are candidates.
4. Professor Past v2 replaced the open chatbot with a guided casebook. What prompted that change: your own judgement, something someone said, or v1 usage?

**Knowing it works**

5. Has anyone outside you used each product? What did they say, and did anything change because of it?
6. Did Flowtime's planned five-person test happen in any form?
7. Is Vercel Web Analytics or any other analytics enabled on Threshold, Flowtime, Professor Past v1, or eliasb.dev? Have you ever looked at the numbers?
8. Do you use Flowtime or Threshold yourself? Has using them changed them?
9. At BNP Paribas, how do you know your work is working (user feedback from traders or risk, adoption, incidents)? Answer only at the safe, high level the site allows.
10. Which practices are real today, and which are new habits you'd start now and state plainly as new? For example, adding analytics, running five-person tests, or a feedback channel.

**Go-to-market**

11. At Optegra and Kensington Medical, what did you own: which channels, which metrics, which tools? Give one campaign or website change and its result.
12. What did marketing teach you about how people find and choose a product that you still use?
13. Did the e-commerce role at Joveen involve conversion, analytics, or customer feedback?
14. Can the site name Optegra and Kensington Medical, Joveen, and BNP Paribas CIB in "Where I've been"? The About copy currently avoids naming Optegra.
15. Have you done any go-to-market for your own projects (sharing, launch posts, communities)? If not, is that a stated new practice?

**Live copy**

16. The hero says "improving it after it ships". What's the true example, or should the line change?

## Sources checked

- This repo: `docs/discovery`, `docs/review`, `docs/dogfood-reports`, `docs/launch`, `docs/content` (including `copy/11-about-journey.md`), `docs/specs`, `src/content` (`site.ts`, `case-files.ts`, `about.ts`), `package.json`, issue #47, and commit `7742a51`. `public/` holds no CV or résumé.
- `/Users/elias/_LifeOS/03_ENGINEERING/repos/personal/threshold`: README, `research.md`, `.stitch/SITE.md`, `compound-engineering.local.md`, `todos/`, `package.json`, git log, GitHub issues #1–#14.
- `/Users/elias/_LifeOS/03_ENGINEERING/repos/personal/flowtime-focus-timer`: `project-spec.md`, `v2-roadmap.md`, `todo.md`, README, `package.json`, git log. The GitHub repo has no issues.
- `/Users/elias/_LifeOS/03_ENGINEERING/repos/personal/argus-risk`: `project-spec.md`, README, `first-session-prompt.md`, `todo.md`, git log. The GitHub repo has no issues.
- `/Users/elias/_LifeOS/03_ENGINEERING/repos/personal/ask-professor-past-v2` (private): `IMPLEMENTATION_SPEC.md`, `RELEASE_PLAN.md`, `PARENT_ISSUE_DRAFT.md`, `project-spec.md`, `DEPLOYMENT.md`, the events code, and GitHub issues #1–#11. Also the public v1 README via `gh api`.
- Not checked: the résumé (blocked), the Vercel dashboards (connector not authorised), and personal notes or messages (out of bounds).
