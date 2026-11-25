# U-10 Privacy notice: test plan (EDD stage 2.1)

- **Date:** 2026-11-25 · **Base:** `692faaf` (`base.txt`) · **Unit:** `edd-docs/inception/units/U-10-privacy.md`
- **ACs (3):** HOME-AC-27, HOME-AC-28, TERM-AC-12. All 3 are removed from `specs/pending.txt` (8 → 5; the 5 left belong to U-11).

| AC | Test file | What the tests check | Level |
|---|---|---|---|
| HOME-AC-27 | `src/components/Footer.test.tsx`, `privacy/page.test.tsx`, `e2e/privacy.spec.ts` | A "Privacy" link to `/privacy` in the footer of `/` and of `/privacy`. | unit, e2e |
| HOME-AC-28 | `src/content/privacy.test.ts` (7), `src/app/(site)/privacy/page.test.tsx` (5), `scripts/check-use-client.test.mjs`, `e2e/privacy.spec.ts` | **Content:** the controller is `profile.name` with the `profile.links.linkedin` contact. It covers Vercel request logs and Web Analytics (24 h), Supabase counters on `/terminal`, every terminal localStorage key, the lawful basis, US transfers, retention, rights (Art. 11) and the right to complain (supervisory authority, ICO). It has a section per topic, no email, phone, chat or Groq, and an ISO date. **Page:** one `h1`, an `h2` per section, a LinkedIn link, the date shown, no email, canonical `/privacy`, indexable. **Gate:** `/privacy` prerendered as static. **e2e:** 200 without JS, one `h1`, the topics, the LinkedIn link and no email. | unit, gate, e2e |
| TERM-AC-12 | `PrivacyModal.test.tsx`, `e2e/privacy.spec.ts` | The modal links to `/privacy`. None of these appear: "No IP Tracking", "Data stays in your browser", "No Personal Data", "Truly Anonymous", "Your privacy is protected. Period." No email. | unit, e2e |

**Content tracing:** `facts.test.ts` now covers `privacy.ts`. Its lines cite `F-xx` for owner facts or `CMP-xx` for the compliance requirement behind the statement, and each CMP ID must exist in `compliance.md`.

**Red run:**
- 3 files fail because their modules are missing (`privacy.ts`, the page).
- 3 tests fail: the footer link and the two modal checks.
- The facts test fails because `privacy.ts` is missing.
