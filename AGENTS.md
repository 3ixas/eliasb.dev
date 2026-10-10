<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Code Review Rules

### Thermo-Nuclear Maintainability Review

Review the PR against its merge base and relevant surrounding architecture. Be unusually demanding about structural maintainability, implementation simplicity, abstraction quality, modularity, and type boundaries.

Prioritise structural regressions and meaningful "code-judo" opportunities: redesigns that preserve behaviour while eliminating unnecessary branches, layers, state, indirection, duplication, or concepts.

### Structural expectations

- Flag ad-hoc conditionals and special cases that make existing flows substantially harder to reason about. Recommend a cleaner ownership boundary, model, or default flow.
- Challenge abstractions that add indirection without removing meaningful complexity. Prefer direct, explicit implementations.
- Check whether feature logic lives in the canonical module and whether existing helpers should be reused.
- Identify avoidable coupling, unnecessary optionality, casts, weak contracts, silent fallbacks, and ad-hoc data shapes.
- Flag non-atomic updates and sequential orchestration when a clearly simpler and safer structure is available.
- Compare architectural complexity before and after the PR, not merely individual changed lines.

### File size and decomposition

- Explicitly investigate any file that crosses from fewer than 1,000 lines to more than 1,000 because of this PR.
- Treat substantial growth in already-large files as an additional decomposition signal.
- Flag cases where splitting responsibilities would materially improve cohesion, navigation, testability, or readability.
- Do not recommend splitting files solely to satisfy a line-count threshold if doing so would worsen cohesion.

### End-to-end specs

- Flag a spec that reads hydrated, animated or lazily laid-out state with a single `evaluate` or `getComputedStyle` right after `goto`. It passes on a fast machine and flakes on a CI runner; use `expect.poll` or a web-first assertion.

### Quality bar

- Do not accept "it works and tests pass" as sufficient evidence of maintainable design.
- Look for larger structural simplifications before proposing cosmetic edits.
- Prefer deleting incidental complexity over merely relocating it.
- Avoid speculative refactors or abstraction for its own sake.
- Preserve intended behaviour and relevant invariants.

### Review output

- Review only; do not edit files, create commits, or implement fixes.
- Post high-confidence, consequential, actionable findings, identifying affected files and lines.
- For each finding, explain the structural problem, why it matters, and the simpler recommended design.
- Distinguish real regressions from subjective preferences and speculative improvements.
- Prioritise structural problems, code-judo opportunities, branching growth, boundary violations, decomposition, and maintainability.
- Do not invent severity to force low-impact observations into the review.
- If no qualifying issues exist, say so rather than manufacturing findings.
