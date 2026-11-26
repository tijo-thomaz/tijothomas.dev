# U-11 Owner release checklist (attestations)

Each row is something only the owner can do or see, in a console the build cannot reach. Record the owner's own words and the date.

| ID | Item | Status | Owner attestation |
|----|------|--------|-------------------|
| SQ-06 (a) | `GROQ_API_KEY` deleted from Vercel (Production, Preview, Development) | **Done** | 2026-11-25: "done" |
| SQ-06 (b) | The old Groq key revoked at console.groq.com/keys | Open: owner to confirm | |
| SQ-06 (c) | Vercel preview deployment protection on | Open | |
| SQ-07 | No `SUPABASE_SERVICE_ROLE_KEY` set in Vercel; only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Open: owner to confirm | |
| SQ-09 | MFA on GitHub, Vercel and the domain registrar; no dangling DNS records | Open | |
| HSTS | Every subdomain of tijothomas.dev that is in use serves HTTPS, because HSTS `includeSubDomains` makes browsers refuse plain HTTP on all subdomains for two years (U-11 review nit) | Open | |
| SEC-21 | SSL Labs grade A or better for tijothomas.dev (after the U-11 headers deploy) | Open | |
| U-09 DoD | Google Rich Results Test passes for `/` | Open | |
| TERM | Terminal sound output listened to and acceptable | Open | |

## Verification by Claude (no console access needed)
- **No code reads `GROQ_API_KEY`:** the `CG10_groq` gate passes, as does TERM-AC-09 (0 files under `src/` or in `.env.example`). Deleting the key cannot break a deploy.
