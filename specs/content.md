# Content rules
Status: Approved (PG1 2026-11-23; amended after PG3 2026-11-23)
Prefix: CONT
Traces: FR-010–FR-016; US-07, US-08, US-12, US-13; SEC-11, SEC-23; CMP-02, CMP-05

Facts come only from rows in `edd-docs/questions/1.1-facts.md` that the owner answered `confirm` or `edit`, as resolved in `1.1-facts-resolved.md`.

## Decisions (PG3, 2026-11-23)
- **ADR-P5:** no owner contact PII in the data model. `Profile` has no `email`, `phone` or `whatsapp` field; contact is LinkedIn + GitHub only (F-64 superseded). The placeholder list is notice period + Opteamix bullets. FR-016 widens to "no email or phone in any served artefact", and the build scan covers `/terminal` too (SQ-05 a).

## Acceptance criteria
- **CONT-AC-01** — Given a work item with `metric.value === null`, when its card renders, then the metric value element reads exactly "Not yet measured" and contains no digit. The label may contain digits. _Traces: FR-011, US-07 · Verify: unit_ (spec test "no work card shows a number when metric is null")
- **CONT-AC-02** — Given a work item with `metric.value` set, when its card renders, then the value appears verbatim next to its label. _Traces: FR-011, US-07 · Verify: unit_
- **CONT-AC-03** — Given at least one `planned` work item and one `planned` post, and `SHOW_PLANNED` is not `"true"`, when `/` renders, then neither title is in the DOM. _Traces: FR-012, US-08 · Verify: unit_ (spec test "planned items hidden when flag is false")
- **CONT-AC-04** — Given `SHOW_PLANNED="true"`, when `/` renders, then planned items appear with a "Planned" badge. _Traces: FR-012, US-08 · Verify: unit_
- **CONT-AC-05** — Given the flag parser, when given `"false"`, `""`, `"1"`, `"TRUE "` or `undefined`, then it returns `false`. Only `"true"` returns `true`. _Traces: FR-012, US-08 · Verify: unit_
- **CONT-AC-06** — Given every work item is hidden, when `/` renders, then `section#work` still has its `h2` and the empty-state line. _Traces: FR-012, US-08 · Verify: unit_
- **CONT-AC-07** — Given the rendered HTML of `/`, when scanned with `/\[[A-Z][A-Z :]+/`, then there are 0 matches. _Traces: FR-013, US-13 · Verify: unit_
- **CONT-AC-08** — Given any nullable content field is null, when `/` renders, then its element is omitted, with no empty tag and no "undefined"/"null" text. _Traces: FR-013, US-04, US-12 · Verify: unit_
- **CONT-AC-09** — Given the build output for `/`, when grepped for `tel:`, `wa.me`, `+91` or `+44`, then there are 0 matches. _Traces: FR-016, NFR-043, US-12 · Verify: gate_
- **CONT-AC-10** — Given `content/*.ts`, when checked against `1.1-facts.md`, then every factual field carries a `// F-xx` or `// C-xx` row reference, every referenced row is answered `confirm` or `edit`, and no `remove` row is referenced. _Traces: FR-014, FR-015, US-13 · Verify: unit_
- **CONT-AC-11** — Given content data, when validated, then each experience `start ≤ end`, `howIWork.length === 5`, and `status` is one of the allowed union values (compile-time plus a runtime test). _Traces: FR-010, US-07, US-09, US-10 · Verify: unit_
- **CONT-AC-12** — Given `components/**`, when scanned, then no string literal longer than 3 words exists outside the aria/structural allow-list. _Traces: FR-010, US-13 · Verify: gate_
- **CONT-AC-13** — Given every URL-typed field in `content/*.ts`, when validated, then each starts with `https://`, and none starts with `mailto:`, `tel:`, `javascript:` or `data:`. _Traces: SEC-11, FR-010 · Verify: unit_
- **CONT-AC-14** — Given a production build, when every HTML, RSC payload and JS chunk served for `/`, `/privacy`, `/work/*`, `/writing/*`, `/opengraph-image`, `/sitemap.xml`, `/robots.txt` **and `/terminal`** is scanned, then there are 0 email addresses (`/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i`), 0 `mailto:`, 0 `tel:`, 0 `wa.me` and 0 phone-like runs (`/\+?\d[\d\s().-]{8,}\d/`) outside the gate's allow-list of non-contact numbers. The gate names each match. _Traces: SEC-23, FR-016, CMP-02, CMP-05, T-06, T-21 · Verify: gate_
- **CONT-AC-15** — Given the `Profile` type and `content/profile.ts`, when type-checked and tested, then neither has an `email`, `phone` or `whatsapp` key. _Traces: SEC-23, FR-013, ADR-P5 · Verify: unit_
