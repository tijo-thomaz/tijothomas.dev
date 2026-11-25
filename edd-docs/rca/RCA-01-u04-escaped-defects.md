# RCA-01: defects that escaped U-04 (wrong GitHub account, corrupted CHANGELOG)

- **Date:** 2026-11-24 · **Author:** orchestrator (main session) · **Requested by:** owner (option C, before PG5 of U-06)
- **Severity:** low. No PII leaked, and nothing was pushed or deployed. Two wrong facts reached committed code and docs, and one survived a fix.
- **Blameless:** this covers process and tooling. The orchestrator wrote every affected commit.

## Defects
| # | Defect | Introduced | Found | Fixed |
|---|--------|-----------|-------|-------|
| D1 | The terminal linked to GitHub account `tijo-thomas`. The owner's account is `tijo-thomaz` (F-68, git remote). The wrong name was in 7 places in 6 files. | `016d28c` (U-04 commit A) | U-05, while cross-checking F-68 | 6 places in `f030b11`; **the 7th (`src/terminal/lib/utils.ts:40`) only in RCA-01** |
| D2 | A text replacement pasted the CHANGELOG's own header (title, `## [Unreleased]`, `### Added`) into the middle of a sentence. | `82bd8bb` (U-04 docs) | U-05, when editing the CHANGELOG | `636522e` |

## Timeline
1. `016d28c`: the PII strip rewrote the terminal contact strings and typed the account from memory as `tijo-thomas`. The tests written for it, `/github\.com\/tijo-thomas/`, encoded the same wrong value, so they passed.
2. `82bd8bb`: a scripted edit with JavaScript's `String.prototype.replace` used a replacement string containing `` ~$` ``, from the prompt text `` `tijo@tijothomas:~$` ``. In a replacement string, `` $` `` means "the text before the match", so the whole file prefix was inserted. CG14 only checks that the file *changed*, so it passed.
3. U-04 gates: 19/19 PASS, and the owner approved PG5. No reviewer pass was run. The U-04 DoD required one for commit A.
4. U-05: the F-68 cross-check exposed D1. The fix `f030b11` used `sed 's#tijo-thomas\([^z]\)#…#'`. That pattern needs a character after the name, so it missed the one copy at the end of a line. The CHANGELOG edit exposed D2.
5. RCA-01: a repo-wide scan for `github.com/<account>` found the missed copy.

## 5 Whys
**D1:**
1. Why was the account wrong? It was typed from memory, not copied from F-68.
2. Why did the tests not catch it? They were written by the same author from the same memory, and they asserted a prefix (`tijo-thomas`) instead of the source of truth.
3. Why is there no single source? `src/terminal` must not import `src/content` (PLAT-AC-09), so the terminal keeps its own copies of contact strings.
4. Why did the fix miss a copy? It was a pattern-based `sed` with an assumption about the following character. No repo-wide search for the wrong value was run afterwards.
5. Why was no review there to catch it? The independent review (2.3) was skipped for U-04 and U-05.

**D2:**
1. Why was the header pasted in? The `` $` `` special pattern in a JS replacement string.
2. Why was it not noticed? The diff was not read before commit, and the edit script printed nothing.
3. Why did no gate fail? CG14 checks only that README and CHANGELOG changed, not their structure.

## Contributing factors
- Shell-scripted edits (heredoc, `sed`, `node -e`, `python -c`) in this Windows Git Bash setup. Backslashes and `$` behave in surprising ways; an earlier U-04 regex bug had the same cause.
- Tests written from the same assumption as the code (common-mode failure).
- Skipped independent review.

## Corrective and preventive actions
| # | Action | Type | Status |
|---|--------|------|--------|
| CA-1 | Fix the missed copy in `src/terminal/lib/utils.ts`. | correct | done (RCA-01 commit) |
| CA-2 | `scripts/rca-01.test.mjs`: every `github.com/<account>` in shipped source equals the F-68 account read from `1.1-facts-resolved.md`. The test fails on the pre-fix tree. | detect | done |
| CA-3 | `scripts/rca-01.test.mjs`: CHANGELOG has one `# ` title, one `## [Unreleased]` and no repeated `###` heading per release. The test fails on `82bd8bb`'s CHANGELOG. | detect | done |
| CA-4 | Rule for the orchestrator: no JS `replace()` with a string replacement, and no `sed` for text edits. Use the Edit tool, or a function replacement. After any scripted edit, grep the whole repo for the old value and read `git diff` before committing. | prevent | adopted (recorded in session memory) |
| CA-5 | Tests for a fact must read the source of truth (facts sheet or `src/content`), not a value retyped by hand. | prevent | adopted (CA-2 is the pattern) |
| CA-6 | The independent review (2.3) runs for every unit from U-06 on. U-04, U-05 and U-06 are reviewed retroactively. | prevent | in progress (edd-reviewer running) |
