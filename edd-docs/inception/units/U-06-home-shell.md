# U-06 Home shell: Nav, Hero text, Highlights, Contact, Footer
Stories: US-04, US-06, US-12, US-14 (primary)     Depends on: U-05, U-04
Flags: hot-path: no (static CDN page; performance proven by the Lighthouse gate, not CG12) · critical: no · ai: no
Estimate: M

## Goal
Replace the hello-world `/` with the top and bottom of the real page, server-rendered from `content/`, with no client JS of our own.

## ACs covered
HOME-AC-01, HOME-AC-03, HOME-AC-11, HOME-AC-12, HOME-AC-17, HOME-AC-18, HOME-AC-26, CONT-AC-07, CONT-AC-08, CONT-AC-12

## Scope
1. Design tokens and site CSS from `Main.dc.html` (`--accent: #ff7a33`, RQ-06 a; focus ring 3px `#1d4ed8`).
2. Server components: `SkipLink`, `Nav` (brand → `#top`, `#work`, `#experience`, `#writing`, `#contact`; no CV button), `Hero` (location line, single `h1` = `profile.headline`, intro, "View work" → `#work`, "Get in touch" → `#contact` (RQ-03 a), tip text; CityMap slot left empty until U-08), `Highlights`, `Contact` (target roles/cities, visa line, availability if set, LinkedIn + GitHub only), `Footer` ("© <build year> <name>", "Terminal mode" → `/terminal`; Privacy link added in U-10).
3. `app/(site)/page.tsx` composes them inside `main`.
4. Gates: `scripts/check-use-client.mjs` (HOME-AC-03), `scripts/check-literals.mjs` (CONT-AC-12) wired into `gates.yml`. Lighthouse stays report-only, but read its numbers now (R4 early signal).

Out of scope: Work, Experience, How I work, Writing (U-07); CityMap and motion (U-08); metadata/JSON-LD (U-09).

## Files touched
`app/(site)/page.tsx`, `app/(site)/globals.css`, `components/{SkipLink,Nav,Hero,Highlights,Contact,Footer}.tsx` + colocated `*.test.tsx`, `components/page.test.tsx`, `e2e/home-storage.spec.ts`, `scripts/check-use-client.mjs`, `scripts/check-literals.mjs`, `scripts/literals-allowlist.json`, `gates.yml`, `CHANGELOG.md`.

## Interfaces
- Components take typed props from `content/` (e.g. `Hero({ hero }: { hero: Profile['hero'] })`); no component imports `content/` and `app/` both (page wires them).

## Definition of Done
- ACs pass; `npm run gates` green; `specs/pending.txt` updated.
- Manual visual check against `Main.dc.html` at 360 and 1440 px (screenshots).
- Review clean; CHANGELOG.

## Patterns used
- React Server Components with static prerender (zero client JS from our code).
- Presentational components fed by typed content props.
- Omit-when-null (no empty tags, no placeholder text).
