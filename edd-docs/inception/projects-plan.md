# Projects platform: units and plan (Draft, 2026-11-26)

Brief: `docs/ai/PLATFORM_PROMPT.md`. Specs: `specs/projects.md` (PROJ-AC-01..16). Facts: `edd-docs/questions/2.0-projects-facts.md`.
Branch `projects-platform`, stacked on `u11-security-headers` (needs U-11's CSP). Rebase on `main` after PR #20 merges.

| Unit | Goal | ACs | Depends on |
|------|------|-----|------------|
| U-12 | Specs, fact rows, `docs/ai/` brought in from `docs/ai-prompts` | (this file, specs) | U-11 |
| U-13 | Registry: `WorkItem` gains `formerName`, `repoUrl`, `playOriginEnv`, `wasm`, `indexPlay`, `caseStudy`; PromptShield entry becomes Sluice | PROJ-AC-01, 02, 13 | U-12 approved |
| U-14 | `next.config.js` → `next.config.ts`: `beforeFiles` rewrites from the registry (a page at `/play/[slug]` would otherwise win), 308 redirect, `/play/*` CSP and `X-Robots-Tag`; `/play/[slug]` "Demo coming soon" page; `docs/ai/PROJECT_HOSTING.md` | PROJ-AC-03, 04, 05, 06, 11, 12 | U-13 |
| U-15 | `/projects`, `/work/sluice` case study (typed content in `src/content/case-studies/sluice.ts`, server-rendered SVG diagrams), home card links, metadata, sitemap | PROJ-AC-07, 08, 09, 10, 16 | U-14 |
| U-16 | Gates: static and no-third-party-script check, Lighthouse on the new pages; e2e; owner checklist (Vercel env, Sluice Vercel project) | PROJ-AC-14, 15 | U-15 |

## Risks
- **Headers on proxied responses:** Vercel applies `next.config` headers to a `/play/*` rewrite, and the zone may send its own CSP (both are then enforced). Verify on the first preview with a real zone; the hosting contract says the zone sends no CSP of its own.
- **Case study claims:** ARCHITECTURE.md §3 is a target design. The page labels it "Planned" and claims only what §2 says exists.
- **Content format:** typed `.ts`, not MDX, so the fact-citation (CONT-AC-10), literals and PII gates keep working with no new dependency.
