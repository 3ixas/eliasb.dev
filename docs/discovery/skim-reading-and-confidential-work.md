# Skim-reading and confidential employer work

Research for [#155](https://github.com/3ixas/eliasb.dev/issues/155), a child of the map [#152](https://github.com/3ixas/eliasb.dev/issues/152) (forward-facing redesign). Researched 10 October 2026.

**Question.** What does a recruiter take from a portfolio or personal site in the first seconds, and how do strong engineers' sites present employer work they can't fully disclose? What does that mean for the **First glance** and the **Role story**, including how to frame a marketing career as a product-sense edge?

## Answer in brief

1. **The first pass is a triage of a few fields.** Recruiters do not read on the first pass. They pick out the name, current title and company, dates, previous title and company, and education, then decide fit or no fit in about 6 to 7.4 seconds. The First glance should give those fields, in that order, as plain text.
2. **Page visitors decide whether to stay within about 10 seconds, and most of their attention stays on the first screen.** The First glance has to be complete on the first screen and readable before the Signature entrance finishes. Inference: on its current ~5 s timing, the entrance spends most of that 10-second window.
3. **Strong engineers state their current role and employer in the first line, in plain words.** Examples: "I work on the Web team at Linear", and "worked at Vercel on Next.js". They don't use a logo wall or a clever tagline in place of the facts.
4. **Confidential work is shown through role, problem, constraints, decisions and relative outcomes, never through artefacts or raw numbers.** The sources agree on naming the employer and the category of the work, then telling the story of your role and reasoning. They redact or genericise anything proprietary, and say plainly that the details are confidential.
5. **The Role story should follow the shape hiring managers ask for in case studies**: problem, your role, constraints, approach, what you decided against, effects, and what you learned. Lead with a summary (inverted pyramid), and write achievements as "X, measured by Y, by doing Z", with Y given as a relative or scale figure where an absolute one would be proprietary.
6. **Marketing should be framed as specific product-minded behaviours**, such as asking why, knowing the user and the business, and validating quickly. It is not a claim about the CV. Orosz's "product-minded engineer" traits are the vocabulary hirers already use.

## Evidence

### What a skimming recruiter takes in

- **Ladders eye-tracking study, 2012.** 30 recruiters were observed over 10 weeks. They spent about 6 seconds on the initial fit or no-fit decision, and nearly 80% of that time on six fields: name, current title and company, current start and end dates, previous title and company, previous start and end dates, and education. Everything else got a keyword scan. (Reported by [Recruiting Daily](https://recruitingdaily.com/?p=18946) and others. The original PDF is hosted [here](https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf), but I couldn't extract its text, so the six-field list is cited from secondary reports.)
- **Ladders update, 2018.** The average initial screen was 7.4 seconds. The best-performing résumés had uncluttered designs, clear section headers, bold job titles over bulleted accomplishments, and a summary at the top. The worst had multiple columns, long sentences, little white space and keyword stuffing ([Ladders press release, PR Newswire](http://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html); [HR Dive summary](https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/)).
- **Caveat.** Ladders sells résumé services, the samples are small, and the figure measures triage, not total evaluation. Recruiters spend much longer on documents that pass the first look ([ERE critique](https://www.ere.net/articles/is-the-6-second-resume-scan-a-myth)). These are résumé studies, not portfolio studies. Applying them to a site's first screen is inference, but the task is the same: a recruiter is deciding whether to keep reading.
- **Profy.dev hiring-manager survey (60+ respondents, via Scrimba).** 93% would look at a portfolio if one was provided, and 51% said its absence wouldn't hurt the candidate ([Scrimba](https://scrimba.com/articles/how-to-build-a-web-developer-portfolio-that-gets-you-hired/amp/)). The sample is small and comes from a secondary report. The useful point: the site supplements a CV, so it should confirm the CV's story quickly.

### How people read web pages

- **NN/g, dwell time.** In a study of 205,873 pages, the first 10 seconds were critical to the decision to stay or leave. Pages that survived that window were still likely to lose visitors over the next 20 seconds. Leaving levelled off after about 30 seconds ([NN/g, How long do users stay on web pages](https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/)).
- **NN/g, scrolling and attention, 2018.** About 57% of page-viewing time went above the fold and 74% to the first two screenfuls (130,000+ fixations, 1920×1080) ([NN/g](https://www.nngroup.com/articles/scrolling-and-attention/)).
- **NN/g, the F-pattern.** When text is unformatted and the reader is being efficient, readers fixate on the first lines and on the first few words of each line. Recommendations: front-load the key points, start headings with the most informative two words, bold key phrases and use lists ([NN/g, F-shaped pattern](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)).
- **NN/g, the inverted pyramid.** Put the conclusion first and rank the details below it, so a reader who stops at any point leaves with the main message. Front-load sentences with information-carrying words, and consider a highlights summary ([NN/g, Inverted pyramid](https://www.nngroup.com/articles/inverted-pyramid/)).
- **Lindgaard et al., 2006** (*Behaviour & Information Technology* 25(2)). Judgements of visual appeal formed at a 50 ms exposure matched those formed after longer viewing ([Nature news](https://www.nature.com/news/2006/060109/full/news060109-13.html)). The study measured appeal only, not credibility or comprehension. It supports "the look lands instantly". It does not show that the words do.
- **Stanford Web Credibility guidelines (Fogg, 2002).** Make claims easy to verify, show a real organisation and real people behind the site, highlight expertise and credentials, and avoid errors ([Stanford](https://credibility.stanford.edu/guidelines/index.html)). This supports naming the employer and the awards, and linking to anything public.

### How strong engineers' sites open (checked live, 10 Oct 2026)

| Site | First glance | Employer detail |
| --- | --- | --- |
| [emilkowal.ski](https://emilkowal.ski) | Name, then title "Design Engineer", then "I work on the Web team at Linear." | The previous employer is one line in the next paragraph. |
| [leerob.com](https://leerob.com) | Name, then a one-sentence bio naming his current role and employer. | Past roles are one clause each ("worked at Vercel on Next.js"), with no numbers. |
| [brianlovin.com](https://brianlovin.com) | Name and a tagline. The current employer and focus come in the next paragraph. | Work history sits on the About page. |
| [brittanychiang.com](https://brittanychiang.com) | Name, "Frontend Engineer", and a one-line value statement. | An Experience list with dates, title, linked company, a short description and tech tags. No outcomes. |

Pattern: name, role, then employer, in plain words on the first screen. None of these sites gives employer work its own page or quantified outcomes, so a Role story would be a gap these exemplars leave open (inference). These sites belong to people whose public work and reputation carry them. Elias has to make more of the employer story himself.

### Presenting work you can't disclose

- **NN/g survey of 204 UX hiring managers, 2019.** They want "how you started with an opportunity and produced real value", the messy process, your role, constraints, the timeline, what *isn't* in the result and why, and effects on users and the business. For NDA work, they suggest showing process artefacts, redacting or blurring identifying data (especially financial data), or recreating the work generically ([NN/g, UX design portfolios](https://www.nngroup.com/articles/ux-design-portfolios/)). This is design-specific, but it carries over to engineering: show the reasoning, not the artefact.
- **Tobias van Schneider.** Name the client and mark the project confidential, describe the type of work and your role without specifics, list the client in a "select clients" line, or offer a password-protected case study only with permission ([van Schneider](https://vanschneider.com/blog/portfolio-tips/make-portfolio-work-cant-shared/)).
- **Practitioner guides (secondary, mostly design).** Replace specifics with categories, strip metrics, vendor names and internal system names, use relative results, and keep sanitised diagrams ([Fueler](https://www.fueler.io/blog/how-to-write-case-study-client-work-under-nda); [UX Planet](https://uxplanet.org/nda-how-to-show-confidential-work-in-your-portfolio-ea165058bb96)).
- **Laszlo Bock (then Google SVP People Ops), 2014.** Write each accomplishment as "Accomplished [X] as measured by [Y] by doing [Z]", and give the scale so a number has meaning ([Business Insider](https://www.businessinsider.in/google-hr-boss-says-this-is-the-key-to-a-perfect-resume/articleshow/43924179.cms)).
- **Caution.** A password-protected page doesn't make sharing proprietary detail acceptable, and practitioners disagree about it ([Blind thread](https://www.teamblind.com/post/how-to-best-showcase-nda-design-work-onjful3q)). Map principle 3 already settles this for Elias: brag-in-interview detail only, never anything proprietary.

### Product sense as a hiring signal

- **Gergely Orosz, "The product-minded software engineer" (2019, updated 2022).** The traits he lists: proposes product ideas, understands the business and the user, asks why, likes talking to people outside engineering, weighs product impact against engineering effort up front, handles edge cases pragmatically, validates fast, owns the outcome after launch ([Pragmatic Engineer](https://blog.pragmaticengineer.com/the-product-minded-engineer/)).
- I found no rigorous evidence on how hirers weigh a marketing background specifically. The search turned up only forum threads and career-changer blogs. Treat "marketing is an edge" as Elias's framing (map principle 5), to be shown with proof rather than asserted.

## Implications for eliasb.dev (inference)

### First glance

- **Order the fields the way the triage reads them.** Name, then "Software Engineer at BNP Paribas CIB", then one line of what he works on: market-data loaders, a pricing engine, the team's only C# engineer. Then one proof line for the awards. "via _nology" can sit on the same line or the next in smaller type. It is a true detail that a recruiter will check against the CV, but it shouldn't come before the employer.
- **Put the facts in plain words. Say who he is before saying what he believes.** The exemplars and the F-pattern both favour the first two words carrying information. The **Maker of clarity** headline can stay as the voice, but the role line has to be readable on its own.
- **Have it in the HTML and legible inside the Signature entrance's first beat.** Given the 10-second stay-or-leave window, the role line should be readable within the first second or two, not after the ~5 s sequence. One option is to let the typed headline *be* the role line (a question for the Signature entrance ticket). The Ladders "summary at the top" result and NN/g's above-the-fold attention both point the same way.
- **Avoid** multiple columns, a logo wall standing in for the sentence, and long sentences in the hero (the worst performers in the Ladders study).

### Role story (one per employer)

Suggested shape: inverted pyramid at the top, then the NN/g case-study order.

1. **Summary.** Role, organisation, dates and a one-sentence outcome, readable on its own (the same fields as the triage).
2. **The problem space.** Described as a category (for example "market-data ingestion for a pricing desk"), never internal system names.
3. **My role.** Scope, team shape and what was his alone ("the team's only C# engineer").
4. **Decisions and constraints.** What he chose, what he ruled out and why. This is where depth shows without disclosure.
5. **Outcomes.** In X-by-Y-by-Z form, with Y as relative change, scale band or time saved. Awards appear here as third-party proof.
6. **What I learned and what I'd do next.** Matches the Case study's ending.
7. **A plain confidentiality line.** For example, "Details are confidential; happy to go deeper in conversation." This is the van Schneider and NN/g pattern, and it turns the gap into an interview prompt.

Public-detail test for every sentence: would Elias say it in an interview at another bank? (map principle 3). No architecture diagrams with real names, no internal system names, no absolute figures that come from proprietary data.

### Marketing as a product-sense edge

- Put the marketing years in the earlier Role stories (Joveen, Optegra/Kensington Medical) under Orosz's vocabulary. Give one concrete instance each of "understood the user and the business", "validated fast with data" and "worked across non-engineering teams".
- Then carry it forward as a thread in the BNP Role story ("why this loader matters to the desk") so it reads as a working edge rather than a past career. Show each behaviour; don't write the adjective.

## Confidence and limits

- **High:** the first screen and first seconds decide whether a visitor keeps reading. Plain role, title and employer facts first. Front-loaded headings. Disclose confidential work by role and reasoning, not by artefacts.
- **Medium:** the exact second counts (small, commercially sponsored samples). Applying résumé triage to a site's hero.
- **Low:** any claim that a marketing background is valued as such. No good evidence found.
- No BNP Paribas or _nology material was consulted or included. Elias's private notes were not read.
