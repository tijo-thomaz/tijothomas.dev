# Content rules
Status: Draft
Prefix: CONT
Traces: FR-010–FR-016; US-07, US-08, US-12, US-13

Facts come only from rows in `edd-docs/questions/1.1-facts.md` that the owner answered `confirm` or `edit`.

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
