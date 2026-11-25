# U-05 Content layer (`src/content/*.ts`) and flag parser
Stories: US-13 (primary); US-07, US-08, US-09, US-10 (part)     Depends on: U-04 (amended 2026-11-24: linear order U-03 → U-02 → U-04 → U-05)
Flags: hot-path: no · critical: no · ai: no
Estimate: S
Paths follow the `src/` layout (amended 2026-11-24); `@/content/*` resolves to `src/content/*`.

## Goal
Create one typed source of truth for every fact and every line of UI copy on the site, filled only from resolved owner answers.

## ACs covered
CONT-AC-05, CONT-AC-10, CONT-AC-11, CONT-AC-13, CONT-AC-15

## Scope
1. Types in `src/content/types.ts`:
   - `Profile`: no `email`/`phone`/`whatsapp` (ADR-P5); nullable `availability` and `noticePeriod`.
   - `ExperienceEntry`: `start`, `end: string | null`, `kind: 'job' | 'gap'`, `bullets`.
   - `WorkItem`: `status: 'live' | 'in-progress' | 'planned'`; optional `badgeLabel` for the confirmed label of a `live` item (e.g. F-16 "Proof of concept", HOME-AC-13); `metric: { label; value: string | null } | null`; optional `caseStudyUrl` and `target`.
   - `Post`: `status: 'published' | 'coming-soon' | 'planned'` (RQ-01 a); optional `url`.
2. `src/content/profile.ts` (identity, hero, highlights, `howIWork` ×5, section copy, nav, SEO copy, links LinkedIn F-67 + GitHub F-68), plus `experience.ts`, `work.ts` and `posts.ts`.
   - Every factual field carries a `// F-xx` or `// C-xx` row reference.
   - Values follow `1.1-facts-resolved.md`:
     - F-05: UK/EU wording.
     - F-08: hero sentence.
     - F-13: no "LLM-powered".
     - F-16: PromptShield badge "Proof of concept", no metric row.
     - F-20–29: status `planned`.
     - F-35: Opteamix bullet omitted.
     - F-38: title "Software Developer".
     - F-63: notice period null.
     - F-66: no tagline.
     - C-17: meta description.
3. `src/lib/flags.ts`: `isShowPlanned(raw: string | undefined): boolean`. Only the exact string `"true"` returns `true`.
4. `src/content/facts.test.ts` reads `edd-docs/questions/1.1-facts.md` and `1.1-facts-resolved.md` as read-only test fixtures. Product code never imports `edd-docs/`.

Out of scope: rendering (U-06, U-07); privacy copy (`src/content/privacy.ts`, U-10).

## Files touched
- `src/content/{types,profile,experience,work,posts}.ts`, `src/content/*.test.ts`
- `src/lib/flags.ts`, `src/lib/flags.test.ts`
- `CHANGELOG.md`, `README.md` (sections on `src/content/*.ts` and `SHOW_PLANNED`)

## Interfaces
- `import { profile } from '@/content/profile'` etc. `src/content/` imports types only (PLAT-AC-09).
- `isShowPlanned(process.env.SHOW_PLANNED)` is evaluated at build time.

## Definition of Done
- The ACs pass. Line coverage of `src/content/` and `src/lib/` is ≥ 85%. `npm run gates` is green.
- The owner's spot check of the NDA rows (bet365) in `experience.ts` is recorded (R3).
- Review clean. README and CHANGELOG updated.

## Patterns used
- Typed content module as the single source of truth.
- Discriminated unions for status, with a compile-time guard plus a runtime test.
- Feature flag with strict parsing. It fails closed: anything but `"true"` hides planned items.
- Nullable fields instead of placeholders (the field is omitted when null).
