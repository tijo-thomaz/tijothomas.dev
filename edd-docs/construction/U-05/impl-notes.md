# U-05 Content layer and flag parser: implementation notes (EDD 2.2)

- **Commits:** `f030b11` (U-04 fix) → `a00b4c5` (tests, red) → `32e8648` (implementation) → `636522e` (docs). Base `0d75cb8`. Done by the orchestrator in the main session.

| Commit | What |
|--------|------|
| `f030b11` | **U-04 defect fixed.** Commit `016d28c` gave the GitHub account as `tijo-thomas` in the terminal contact data, the contact buttons, the chat context and the CV text. F-68 and the git remote say `tijo-thomaz`. The tests now reject the wrong spelling. The same commit records PG5 for U-04. |
| `a00b4c5` | Tests: `src/lib/flags.test.ts`, `src/lib/site.test.ts`, `src/content/content.test.ts` and `src/content/facts.test.ts`. Red because the modules are missing. |
| `32e8648` | Code: `src/content/{types,profile,experience,work,posts}.ts`, `src/lib/flags.ts`, and `src/lib/site.ts` (which now reads `profile.siteUrl`). `check-unreachable` changes: keep-list entries need a reason, and tests of keep-listed modules are no longer flagged as tests of dead code. `scripts/check-unreachable.keep.txt` holds 4 entries until U-07. |
| `636522e` | README "Content" and `SHOW_PLANNED` sections. CHANGELOG repaired (second U-04 defect, below). |

## Defects found in U-04 output
1. **Wrong GitHub username** in 6 terminal files. Fixed in `f030b11`. No real email or phone was involved.
2. **CHANGELOG corruption:** the U-04 docs commit (`82bd8bb`) used a text replacement whose `$` pattern pasted the file header into the middle of the file. The file was rewritten by hand in `636522e`. README was checked and is unaffected.

## Decisions for the owner
1. **Highlight 3 subtitle.** The mockup says "shipped with an LLM-powered translation tool". F-13 drops the LLM wording but gives no new text. The page now says "shipped with a VS Code translation tool", which is taken from the resolved F-43 bullet.
2. **Highlight 2 value "4 regulated markets".** The F-12 row in the facts sheet lost its digit (" regulated markets"). The value comes from mockup L54, which F-12 cites, and the owner answered "correct".
3. **Infosys location: "Trivandrum, India".** This follows F-46, which the owner confirmed. The mockup shows "Bengaluru, India" for Infosys.
4. **Meta description (C-17), rewritten to follow F-08, 146 characters:** "React, TypeScript and Go engineer. Nine years shipping production software, nearly three at bet365. Open to Forward Deployed and Applied AI roles."
5. **City signposts "Germany →" and "Manchester →" (C-04)** are kept as confirmed, although the hero now reads "Relocating to the UK or EU". U-08 renders them, so you can change them before then.
6. **Both fde projects are `planned`** (F-20 resolution), so production shows only PromptShield in Work. F-21's "In progress" label is not used.
7. **Post badges:** only "Coming soon" (F-58) and "Planned" (F-26) have labels. A published post will render as a plain link with no badge, so no "Published" copy was invented.
8. **NDA spot check (R3, part of the DoD).** Please confirm the bet365 entry in `src/content/experience.ts`:
   - company "bet365 Group Ltd", title "Software Developer", Feb 2023 – Nov 2025, Manchester, UK, Hybrid;
   - the bullets F-41, F-42, F-43 (resolved, no LLM wording) and F-44;
   - the highlight "4 regulated markets / Germany, France, Ohio and New Jersey at bet365";
   - the hero and meta wording "nearly three at bet365".

## Design notes
- **Every data line carries a row reference.** `facts.test.ts` treats any line with a literal value as data, and it fails when a data line has no `F-xx`, `C-xx` or `RQ-xx` reference. A reference must be either confirmed (correct, confirm or edit) or resolved in `1.1-facts-resolved.md`, and must not be withheld. The withheld rows are F-18, F-35, F-63, F-64, F-66, F-71 and F-72, and each one must appear in the resolutions. A mutation check confirmed that citing F-18, or dropping a reference, fails the test.
- **Compile-time guards:** `@ts-expect-error` lines reject:
  - an unknown status or kind;
  - a sixth how-I-work step (`howIWork` is a 5-tuple);
  - an `http://` link;
  - `email`, `phone` or `whatsapp` on `Profile`.

  CG3 fails if any guard stops erroring.
- **Null fields:** `availability` and `noticePeriod` are `null` (RQ-02 a), and the Opteamix entry carries only the F-34 bullet. No item has `caseStudyUrl` or `url` (F-71, RQ-04).
- **Reachability:** `profile.ts` is reachable through `src/lib/site.ts`. `experience`, `work`, `posts` and `flags` stay keep-listed, with reasons, until U-07 imports them. The U-07 DoD should remove those entries.
