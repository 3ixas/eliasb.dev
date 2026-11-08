# Lens passes: scope

Agreed with Elias on 8 November 2026, after the craft map ([#358](https://github.com/3ixas/eliasb.dev/issues/358)) was signed off on 7 November. Status: **approved**.

## Outcome

eliasb.dev reads as Elias's own, not agent-made, to someone who looks closely. It gets there through fourteen passes, each looking through a single **lens** taken from `ui-polish`, `craft-review` and the skills that catch AI tells in design and writing.

## Why merged lenses, not one ticket per skill section

Splitting the two skills literally gives about 24 tickets, and roughly half of them overlap. Typography, resilience and restraint each appear two or three times across ui-polish's modes, its craft passes and craft-review's dimensions. Each lens below absorbs every section that asks the same question. Rendered diagnostics is a set of tools, not a lens, and every lens uses it.

| # | Lens | Absorbs |
|---|---|---|
| 1 | Distinctiveness | ui-polish's audit; interface-design's AI-default patterns |
| 2 | Restraint | ui-polish's Restraint pass; craft-review's Restraint; the removal rule |
| 3 | Interface copy | ui-polish's Copy mode |
| 4 | Prose authorship | `writing` humanize and review, on long-form pages |
| 5 | Hierarchy and layout | the Hierarchy and layout mode; Structure pass; Visual precision; measured spacing |
| 6 | Typography | the mode and the pass; font stability |
| 7 | Colour and surfaces | the mode; contrast; depth; nested radii |
| 8 | Components and coherence | the Components and states mode; the component checkpoint; Consistency; System coherence |
| 9 | Interaction | the Interaction pass and dimension; the design-engineering details |
| 10 | States | Behavioural completeness: empty, loading and error states, a feed that's down, the 404 |
| 11 | Resilience | the Resilience mode and pass; worst-case data (`break-ui`) |
| 12 | Phone | Mobile web, Native and human feel, mobile Safari edges |
| 13 | Technical smoothness | the Performance pass; Technical smoothness |
| 14 | Copy gate | `verify:copy`, plus the visual tells found along the way added to `DESIGN.md`'s anti-goals |

Lenses run in this order as a strict chain. Things are removed before what remains is polished, and foundations come before detail. A lens that finds nothing closes as "held up".

## Each lens ticket

1. **Read first:** `DESIGN.md`, its craft bar, `GLOSSARY.md`, and the defects and matters of taste in [#359](https://github.com/3ixas/eliasb.dev/issues/359), so nothing is found twice.
2. **Diagnose** in craft-review's finding format: location and evidence; class (observed defect, causal hypothesis, or preference); consequence and reach; correction and owner; verification. No quota.
3. **Elias picks.** The ticket fixes what he picked in one PR, guarded auto-merge arms, and the preview link goes in the ticket. Findings he doesn't pick stay in the ticket as declined and aren't re-ticketed.

## Rules

- **Copy:** remove, tighten and reword to the voice profile, with positive framing. No new claims. Elias's pick approves the exact before and after strings.
- **The craft bar is the reference, not the target.** A finding that contradicts it goes to Elias as a decision and isn't fixed inside the lens.
- **Method owners:** `writing` (humanize) and interface-design's AI-default patterns. `avoid-ai-writing` is only a cross-check, on lenses 3 and 4. `accessibility` takes craft-review's accessibility handoffs only.
- **Coverage:**
  - Visual lenses (5–13) go deepest on the homepage, the BNP Paribas Role story and the Threshold case study, with a lighter check elsewhere.
  - Copy lenses (3–4) read every string on every route. Prose authorship reads every Role story and case study in full.
  - The Résumé sheet is untouched.
- **Off-lens findings:** a finding outside the current lens is added to that later lens's ticket, not fixed early.
- **Escalation:** a finding that needs a redesign or a change of motion goes to `interface-design` or `motion` as a decision.
- **Visual baselines** change only for a picked item, and the PR says which.
- **Execution:** one lens at a time, one session each. Diagnosis runs on the live site and on Vercel previews; there's no unbounded local `next build` (see `docs/runbooks/local-testing.md`).
- **Authority:** merging to `main` deploys production, so Elias's pick is also his approval to ship that lens.

## Proof of done

- **Per lens:** findings evidenced and classified; before-and-after captures on the preview at 390 and 1440 px in both themes; affected gates green; picked items re-captured.
- **Phone (12):** a real iPhone, or the iOS Simulator recorded as a limit.
- **Series:** `verify:copy` runs in the required job and has been shown failing once on a deliberate break. An optional cold read by someone new to the site is prompted with "What here reads like it was written or designed by an AI?"

## Excluded

- A redesign, new sections or integrations
- New claims
- The Résumé sheet
- Changes to craft-bar values without a separate decision

## Open assumptions

- `verify:copy`'s word list is settled in lens 14 from what lenses 3 and 4 find. A word list catches surface tells only; it guards against regressions and doesn't prove authorship.
