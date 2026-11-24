# U-07 Home lists: implementation notes (EDD 2.2)

- **Commits:**
  - `32eccb6`: tests (red).
  - `48ac777`: implementation.
  - `71fef6a`: review fixes.
  - `9dc2603` and `2f2507d`: build-race fix and its test.
- **Base:** `8705b16`. Done by the orchestrator in the main session; the edd-reviewer ran in the background.

## What was built
- **Server components:**
  - `WorkSection`, `WorkCard`, `MetricRow` and `StatusBadge`;
  - `ExperienceTimeline` (job and gap rows);
  - `HowIWork`;
  - `Writing`.

  None has `"use client"`. All copy comes from `src/content`. `profile.labels.caseStudy` was added, citing HOME-AC-13 verbatim.
- **`src/lib/visible.ts`:** the build-time planned filter.
- **`src/lib/format.ts`:**
  - `formatMonth` uses fixed three-letter months, with no `Intl` or `Date`, so no ICU differences or time-zone shifts.
  - `formatRange` and `workBadge`.
- **Page:** `isShowPlanned(process.env.SHOW_PLANNED)` is read at build time, and the page is prerendered.
- **view-source gate (SEO-AC-09):**
  - `scripts/lib/content-strings.mjs` builds the expected text nodes from `src/content` and `src/lib/format.ts`, imported through Node's TypeScript type stripping. `engines` is now node `>=22.18`.
  - `scripts/lib/view-source-match.mjs` matches each expected string to a whole text node, and checks that planned titles and summaries appear nowhere in the raw HTML or RSC payload while the flag is off.
  - The gate is now enforced.
- **Site Tailwind config** (U-06 review #7):
  - `tailwind.site.config.js` is used through `@config` and does not scan the terminal. Minified site CSS was 52,241 bytes and became 9,683 bytes with the same CSS, then 13,745 bytes with the U-07 section styles.
  - The terminal stylesheet now names `tailwind.config.js` explicitly (build race, see `gates.md`).
- **Keep list:** emptied. The U-05 modules are reachable from `/`, and the staleness check would have failed them.

## Review (`review.md`): approve-with-minors (0 blocker, 0 major)
- **Fixed in `71fef6a`:**
  - #1: view-source substring matching. Now whole text nodes, with a unit test showing a dropped `h3` is caught.
  - #2: formatted strings are now expected.
  - #3: the flag logic is imported, not copied, and a planned-leak check was added.
  - #4: a test that could not fail.
  - #5: an `h3` inside a `span`.
  - #6: "Sept".
  - #7: the Node version (`engines`), and the warning is suppressed in the gate command.
- **Nits fixed:**
  - env stubs are reset in `afterEach`;
  - the timeline order test is hard-coded;
  - a comment said `<ul>` for an `<ol>`;
  - the gate loads content from `--root`;
  - hover style on linked post rows.
- **Not changed:** an empty-string metric value. The content tests already reject empty strings (`content.test.ts`), so no such value can exist.

## Decisions for the owner
1. **Deployment hold:** the nav anchors now resolve (HOME-AC-09). The hero tip (C-03) still says "the city is a map", and the CityMap arrives in U-08. The hold stays until U-08 unless you prefer to hide the tip now.
2. **Work shows only PromptShield**, because the two fde projects are `planned` (F-20 resolution). Set `SHOW_PLANNED=true` at build time to preview them with "Planned · Dec 2026" badges.
3. **The Writing posts are not links** (no URLs yet, RQ-04), and each shows "Coming soon".
