# U-05 Content layer (`content/*.ts`) and flag parser
Stories: US-13 (primary); US-07, US-08, US-09, US-10 (part)     Depends on: U-03
Flags: hot-path: no · critical: no · ai: no
Estimate: S

## Goal
One typed source of truth for every fact and every line of UI copy on the site, filled only from resolved owner answers.

## ACs covered
CONT-AC-05, CONT-AC-10, CONT-AC-11, CONT-AC-13, CONT-AC-15

## Scope
1. Types (`content/types.ts`): `Profile` (no `email`/`phone`/`whatsapp`, ADR-P5; nullable `availability`, `noticePeriod`), `ExperienceEntry` (`start`, `end: string | null`, `kind: 'job' | 'gap'`, `bullets`), `WorkItem` (`status: 'live' | 'in-progress' | 'planned'`, optional `badgeLabel` for the confirmed label of a `live` item, e.g. F-16 "Proof of concept" (HOME-AC-13), `metric: { label; value: string | null } | null`, optional `caseStudyUrl`, `target`), `Post` (`status: 'published' | 'coming-soon' | 'planned'`, RQ-01 a; optional `url`).
2. `content/profile.ts` (identity, hero, highlights, `howIWork` ×5, section copy, nav, seo copy, links LinkedIn F-67 + GitHub F-68), `experience.ts`, `work.ts`, `posts.ts`. Every factual field carries `// F-xx` or `// C-xx`. Values follow `1.1-facts-resolved.md` (F-05 UK/EU wording, F-08 hero sentence, F-13 no "LLM-powered", F-16 PromptShield "Proof of concept" with no metric row, F-20–29 `planned`, F-38 "Software Developer", F-63 notice period null, F-35 Opteamix bullet omitted, F-66 no tagline, C-17 meta description).
3. `lib/flags.ts`: `isShowPlanned(raw: string | undefined): boolean` (only exact `"true"`).
4. `content/facts.test.ts`: parses `edd-docs/questions/1.1-facts.md` + `1.1-facts-resolved.md` as test fixtures (read-only; no product import of `edd-docs/`).

Out of scope: rendering (U-06, U-07), privacy copy (`content/privacy.ts`, U-10).

## Files touched
`content/{types,profile,experience,work,posts}.ts`, `content/*.test.ts`, `lib/flags.ts`, `lib/flags.test.ts`, `lib/site.ts` (if not already), `CHANGELOG.md`, `README.md` (`content/*.ts`, `SHOW_PLANNED`).

## Interfaces
- `import { profile } from '@/content/profile'` etc.; `content/` imports types only (PLAT-AC-09).
- `isShowPlanned(process.env.SHOW_PLANNED)` evaluated at build time.

## Definition of Done
- ACs pass; `content/` and `lib/` line coverage ≥ 85%; `npm run gates` green.
- Owner spot-check of the NDA rows (bet365) in `experience.ts` recorded (R3).
- Review clean; README + CHANGELOG.

## Patterns used
- Typed content module as single source of truth.
- Discriminated unions for status (compile-time guard plus runtime test).
- Feature flag with strict parsing (fail closed: anything but `"true"` hides planned items).
- Nullable fields instead of placeholders (omit when null).
