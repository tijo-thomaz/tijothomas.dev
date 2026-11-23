# Compliance assessment: tijothomas.dev home redesign (EDD stage 1.3)

- **Branch:** `redesign-home` · **Date:** 2026-11-23
- **Scope:** static `/` (+ placeholders, OG, sitemap, robots) with Vercel Web Analytics; `/terminal` moved unchanged with Supabase counters (Q7a) and the Groq-backed chat; Vercel hosting.
- **Owner decision applied (2026-11-23, reverses F-64):** no owner email or phone anywhere on site routes; contact is LinkedIn + GitHub only.

> **This is an engineering assessment, not legal advice.** Items marked **[LAWYER/DPO]** need review by a qualified privacy lawyer or DPO before you rely on them. Facts about third-party services marked [I] come from vendor documentation or inference and must be re-checked against the current vendor terms.

---

## 1. GDPR / UK GDPR / ePrivacy

### 1.1 Who is the controller, and does GDPR apply? [LAWYER/DPO]
- **Controller:** the owner, as a natural person running a professional portfolio. The household exemption (GDPR Art. 2(2)(c); UK GDPR equivalent) is **unlikely** to apply, because the site serves a professional purpose (job seeking). [LAWYER/DPO]
- **Territorial scope:** the owner is based in Bengaluru, India (facts F-04), with no EU or UK establishment. GDPR then applies only under **Art. 3(2)**: offering goods or services to people in the EU, or **monitoring their behaviour** in the EU. Cookieless aggregate analytics and a chat aimed at EU/UK recruiters (relocation to Manchester or Germany, F-05) make this arguable either way. The same test applies under UK GDPR Art. 3(2). [LAWYER/DPO]
- **Art. 27 representative:** if Art. 3(2) applies, an EU (and UK) representative is required **unless** the processing is occasional, not large-scale, and unlikely to create risk (Art. 27(2)(a)). That exemption plausibly fits here. [LAWYER/DPO]
- **India DPDP Act 2023** (Rules notified 2025, phased commencement): applies to the owner as a Data Fiduciary for digital personal data processed in India. Obligations are light for this data set, but timing and applicability need checking. [LAWYER/DPO]
- **Engineering stance:** design as if GDPR, UK GDPR and ePrivacy/PECR apply. The controls cost almost nothing here, and this avoids depending on a scope argument.

### 1.2 Personal data inventory
| # | Data | Data subjects | Where / route | Source | Purpose | Recipient / processor | Retention | Personal? |
|---|---|---|---|---|---|---|---|---|
| P1 | IP address, User-Agent, URL, referrer, timestamp (request logs) | all visitors | every route | HTTP request | hosting, security, abuse handling | Vercel Inc. (US) | Vercel plan default (short; Hobby/Pro runtime logs are hours to days) [I: confirm plan] | Yes (IP) |
| P2 | Vercel Web Analytics data point: timestamp, URL, referrer, filtered query, country/region/city, OS, browser, device type; a visitor **hash** derived from the request | all visitors | `/`, `/terminal`, all pages with `<Analytics/>` | beacon from first-party path | aggregate traffic statistics | Vercel Inc. (US) | visitor hash discarded after **24 h** [F, Vercel docs]; aggregates per plan | Pseudonymous during the 24 h; aggregates are not personal |
| P3 | Chat text typed by visitors (free text; may contain names, emails, employers) + `sessionId` | `/terminal` chat users | `/api/chat` → Groq | visitor input | answer questions about the owner | Vercel (function + logs: `route.ts:9` logs the message [F]); **Groq Inc. (US)** | Vercel logs per plan; Groq per its API terms [I: verify] | Potentially yes |
| P4 | Supabase counters: date + count of visits / commands / questions | none identifiable | `/api/analytics` → Supabase | server-side increment | vanity metrics | Supabase Inc. | indefinite | **No** (no identifier is sent [F]) |
| P5 | `localStorage` on the visitor's device: `tijothomas-theme`, `tijothomas-zoom`, `tijothomas-sounds` (preferences); `portfolio-analytics` (local counters, last command, session start) | `/terminal` visitors | browser only | terminal UI | preferences; local usage display | none (never sent) [F] | until the visitor clears it | No (stays on device), but see ePrivacy §1.4 |
| P6 | Owner's own data: name, headline, location, employers, LinkedIn and GitHub URLs | owner | `/`, JSON-LD, OG | owner (confirmed facts) | professional profile | public | until the owner removes it | Yes (owner, self-published) |
| P7 | Owner's email and UK phone/WhatsApp | owner | **`/terminal` only** (7 live modules, threat-model T-21); **must not** appear on site routes | legacy terminal code | — | public JS + Groq (via chat context) | — | Yes — contradicts the owner's new decision; see SQ-05 |

`/` itself stores nothing on the device, sets no cookies, has no forms and collects no visitor input (NFR-043, proposed HOME-AC-26).

### 1.3 Lawful basis (Art. 6)
| Processing | Basis | Note |
|---|---|---|
| P1 request logs | Art. 6(1)(f) legitimate interests: running and securing the site | Standard; short retention |
| P2 Vercel Web Analytics | Art. 6(1)(f): understanding aggregate reach of a portfolio | Light legitimate-interests assessment (LIA): cookieless, 24 h hash, no cross-site tracking, no profiling. Record the LIA in the privacy notice. [LAWYER/DPO: confirm] |
| P3 Chat → Groq | Art. 6(1)(f) (visitor-initiated request to answer questions); alternatively 6(1)(b)-like pre-contract steps do not fit | Visitors should be told **before** typing that text goes to a US AI provider. Today they are not (§1.7) |
| P4 Supabase counters | not personal data | — |
| P6 owner's own data | owner's own decision | — |

### 1.4 ePrivacy (Art. 5(3)) / UK PECR reg. 6: cookies and device storage
- **`/`:** no cookies and no `localStorage`/`sessionStorage` writes, including from `@vercel/analytics` [F, Vercel docs: no cookies; hash computed server-side]. **No consent banner is needed**, matching the spec ("no cookie banner"). The EDPB Guidelines 2/2023 read Art. 5(3) broadly (it can cover script-triggered transmission of device information). Vercel's server-side hashing of the ordinary HTTP request is generally treated as outside it, but this is not settled. [LAWYER/DPO]
- **`/terminal`:**
  - Theme, zoom and sound keys are **strictly necessary** for a function the user requested (preferences), so they are exempt.
  - `portfolio-analytics` is written on every visit (`trackVisit`, `lib/simple-analytics.ts:73-81`) for analytics purposes and is not strictly necessary. Under a strict EU reading this is device storage that needs consent. Mitigating facts: it never leaves the device, and it feeds the visitor's own stats display. Under UK PECR, the Data (Use and Access) Act 2025 adds an exemption for storage used for statistical purposes with clear information and an easy opt-out, subject to its commencement. [LAWYER/DPO]
  - Engineering options (terminal is otherwise "unchanged"): accept and disclose it in the privacy notice (recommended for now), or stop writing the key (a one-line change, deferred with Supabase retirement).
- **Supabase increments** are server-side and send no device data, so they are outside Art. 5(3).

### 1.5 Minimisation and retention
- `/`: only owner-confirmed public facts. **No email or phone** (owner decision; threat-model SEC-23, proposed CONT-AC-14). No visitor data collected by the page.
- Remove the hidden SEO block with phone and email (`app/layout.tsx:88-120`); the new site layout does this (FR-002).
- Chat: stop logging message text (SEC-35); do not send the owner's phone/email in `portfolioContext` (SQ-05 a).
- Retention: Vercel defaults (logs short; analytics hash 24 h); Supabase counters indefinite (non-personal); Groq per terms [I].

### 1.6 Processors, sub-processors and international transfers
| Provider | Role | Location | Transfer mechanism | Action |
|---|---|---|---|---|
| Vercel Inc. | processor (hosting, logs, analytics) | US (global edge) | Vercel DPA with SCCs; EU–US Data Privacy Framework status [I: verify current listing] | Accept the Vercel DPA (it is part of Vercel's terms [I]); keep a copy |
| Groq Inc. | processor (LLM inference for chat text) | US | Groq DPA / SCCs / DPF status **unknown** [I] | **Verify** that a DPA exists, the transfer mechanism, retention, and whether API inputs are used for training [LAWYER/DPO] |
| Supabase Inc. | service provider; no personal data sent | project region unknown | n/a for P4 | Confirm the project region; keep it non-personal |
| GitHub | source hosting; no visitor data | US | n/a | — |

Because the controller is in India, EU/UK visitor data also leaves the EU/UK to the controller's own location. Whether Chapter V applies to collection by a non-EU controller under Art. 3(2) is a legal question (EDPB Guidelines 05/2021). [LAWYER/DPO]

### 1.7 Transparency (Art. 12–14) and the existing privacy notice
- `/` currently has **no** privacy notice. The new site uses Vercel Analytics, and `/terminal` sends chat text to Groq. A short notice is needed.
- The existing terminal modal (`widgets/PrivacyPolicy/molecules/PrivacyModal.tsx`) is **inaccurate**: it states "No IP Tracking", "No Personal Data", "Local Storage Only: Data stays in your browser". In fact Vercel processes IPs, chat text goes to Groq (US), and the modal does not mention the chat, Groq, retention, rights or the lawful basis. A misleading notice is a fairness and transparency problem (Art. 5(1)(a), Art. 13). It also lists the owner's email (`mailto:`), which the owner no longer wants published.
- **Controller contact without email:** Art. 13(1)(a) requires the controller's identity and contact details. With the owner's no-email decision, the options are: (i) LinkedIn messaging as the contact channel, (ii) a dedicated role alias used only in the privacy notice (e.g. `privacy@<domain>` forwarding), which would be a narrow exception to the no-email rule, or (iii) a postal address. Whether (i) alone is an adequate contact channel is a legal question. [LAWYER/DPO] (see SQ-02)
- **Proposed:** a static `/privacy` page linked from the footer of `/` (and from the terminal modal), content in `content/` (proposed HOME-AC-27, ADR-P3). Minimum content: controller identity and contact channel; what is processed (P1–P3, P5); purposes and lawful bases (§1.3); processors and transfers (§1.6); retention; rights and how to exercise them; right to complain to a supervisory authority (EU DPA / UK ICO).

### 1.8 Data subject rights
- The owner stores no identifiable visitor data. Vercel analytics is pseudonymous for 24 h, then aggregate; chat text is not stored by the app. Most requests will fall under **Art. 11** (the controller cannot identify the person); the notice should say so.
- Channel: the contact channel chosen in SQ-02; respond within one month (Art. 12(3)). Vercel log entries can be deleted only through Vercel support; Groq data per Groq's process [I].

### 1.9 DPIA (Art. 35)
**Not required** (screening result). Against the EDPB/WP248 criteria: no evaluation or scoring, no automated decisions with legal effect, no systematic monitoring at scale (aggregate cookieless analytics on a low-traffic personal site), no special-category or highly personal data collected by design, not large-scale, no data matching, no vulnerable subjects, no novel technology used *on visitors* (the LLM answers questions; it makes no decisions about them), no blocking of a right or service. 0 of 9 criteria clearly met; "innovative technology" (LLM chat) at most 1, and WP248 suggests a DPIA when two or more apply. Re-screen when "Ask Tijo" ships on `/`. [LAWYER/DPO: confirm]

---

## 2. EU AI Act (Regulation (EU) 2024/1689)

| Surface | AI system? | Risk tier | Reasoning |
|---|---|---|---|
| Site routes (`/`, placeholders, OG, sitemap, robots) | **No** | — | Static content; no inference. No AI Act duties. |
| `/terminal` chat (`/api/chat` → Groq `llama-3.1-8b-instant`) | **Yes** (a machine-based system generating text output from input) | **Limited risk: Art. 50 transparency** | Not prohibited (Art. 5). Not high-risk: Annex III point 4 covers systems **used by employers/recruiters** to select or evaluate candidates, not a candidate's own promotional chatbot. The owner built and operates the system under their own name, which makes them a **provider** of an AI system (and its deployer). The owner is not a GPAI model provider (Llama is hosted by Groq), so Chapter V does not apply. |

**Territorial:** the owner is outside the EU, but Art. 2(1)(c) covers third-country providers and deployers where the output is used in the Union (EU recruiters). The personal non-professional exemption (Art. 2(10)) is for natural-person **deployers** in purely personal activity, and job seeking is likely professional. [LAWYER/DPO]

**Obligations and status (Art. 50 applies from 2 Aug 2026, so it is in force now):**
| Obligation | Status today | Action |
|---|---|---|
| Art. 50(1): people must be informed they are interacting with an AI system, unless obvious | **Largely met** [F]: chat header "Tijo's AI Assistant" (`ChatHeader.tsx:16`), welcome text "I'm powered by advanced AI" (`useChatAssistant.ts:346`), messages labelled "AI Assistant" for screen readers. **Gap:** the flagged-response fallback speaks in the first person as the owner ("I'm Tijo Thomas, …", `usePromptShield.ts:213`), which can read as a human reply | Reword in the "Ask Tijo" feature (terminal unchanged now); acceptable short-term because the AI label is visible in the same panel |
| Art. 50(2): providers of systems generating synthetic text mark outputs in a machine-readable, detectable way | **Not met.** The applicability of 50(2) to chat text displayed inside an AI-labelled UI, and the effect of the Commission's code of practice on marking and of any Digital Omnibus transitional relief for systems already on the market before 2 Aug 2026, need checking. [LAWYER/DPO] [I: verify current status] | Cheap engineering option for "Ask Tijo": `ai_generated: true` in the API response and `data-ai-generated="true"` on assistant message elements. Deferred |
| Art. 4: AI literacy of staff | Owner is the sole operator and an engineer; record it in this file | Done by this note |
| Human oversight, logging, technical documentation, conformity assessment | **Not required** (high-risk duties only) | Recommended practice for "Ask Tijo": eval set, prompt versioning, abuse logging without content (threat-model SEC-35, SEC-40) |

---

## 3. Other regimes (one line each)

| Regime | Applies? | Reason |
|---|---|---|
| **NIS2** (Directive 2022/2555) | No | An individual's portfolio is not an essential or important entity (not in an Annex I/II sector, below size caps). |
| **DORA** (Regulation 2022/2554) | No | Not a financial entity or ICT third-party provider to one. |
| **PCI DSS** | No | No payment card data is accepted, stored or transmitted. |
| **HIPAA** | No | Not a US covered entity or business associate; no PHI. Mentioning a "HIPAA-compliant" past project in content is a factual claim, not a duty. |
| **European Accessibility Act** (Directive 2019/882) | No | Covers listed products/services (e.g. e-commerce, banking, e-books) from economic operators; a personal portfolio is not one, and micro-enterprise service providers are exempt anyway. WCAG 2.2 AA is still met by design (NFR-011). |
| **UK PECR / Data (Use and Access) Act 2025** | Possibly | See §1.4; relevant to `portfolio-analytics` on `/terminal` only. |
| **India DPDP Act 2023** | Possibly | Owner located in India; see §1.1. [LAWYER/DPO] |

---

## 4. Items for a lawyer or DPO
1. GDPR / UK GDPR territorial applicability (Art. 3(2)) to a non-EU individual's portfolio with cookieless analytics and an AI chat; Art. 27 representative exemption.
2. Household-exemption reading for a job-seeking portfolio.
3. ePrivacy Art. 5(3) / PECR position for (a) Vercel's server-side visitor hash, (b) `portfolio-analytics` in `localStorage` on `/terminal`, and the commencement of the DUAA 2025 statistical-purpose exemption.
4. Groq as processor: DPA, transfer mechanism, retention, training use of API inputs.
5. Whether LinkedIn messaging alone satisfies Art. 13(1)(a) "contact details" given the owner's no-email decision.
6. EU AI Act Art. 50(2) applicability to chat text, and any transitional relief for systems placed on the market before 2 Aug 2026.
7. India DPDP Act obligations and commencement for this processing.

## 5. Compliance requirements carried into construction
| ID | Requirement | Scope | Link |
|---|---|---|---|
| CMP-01 | `/` sets 0 cookies and 0 web-storage keys | Now | HOME-AC-26 (proposed), NFR-043 |
| CMP-02 | No owner email or phone in any served artefact of site routes | Now | SEC-23, CONT-AC-14 (proposed) |
| CMP-03 | Accurate privacy notice reachable from `/` (and the terminal modal corrected or linked) | Now if SQ-02 a/b | HOME-AC-27 (proposed), ADR-P3 |
| CMP-04 | Chat message text not logged | Now if SQ-01 b; else Deferred | SEC-35 |
| CMP-05 | Owner email/phone not sent to Groq or shipped in terminal JS | Now if SQ-05 a | SQ-05 |
| CMP-06 | AI disclosure kept visible in the terminal chat; machine-readable marking in "Ask Tijo" | Deferred | §2 |
| CMP-07 | Vercel DPA on file; Groq DPA verified | Now (owner) | §1.6 |
