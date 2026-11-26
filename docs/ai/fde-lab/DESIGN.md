# FDE Lab — design spec (source of truth for UI)

Visual references: `fde-lab-prototype.html` (lesson player) and
`harness-lab-simulators.html` (simulators). Where this file and the
prototypes differ, this file wins.

## 1. Feel
A calm, precise workbench: lots of paper, one warm accent, big working
pictures. Playful in the pictures and simulators, sober in the text.
No emoji, no gradients, no glassmorphism, no stock illustrations.

## 2. Tokens

### Colour
| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F6F4EF` | `#151413` | page ground (with faint 28px grid on picture panels) |
| `paper` | `#FBFAF7` | `#1D1C1A` | panels, cards |
| `ink` | `#1C1B1A` | `#EFECE6` | text, slab |
| `muted` | `#6B6660` | `#A9A29A` | secondary text (must pass 4.5:1) |
| `line` | `#E4DFD6` | `#33302C` | borders, grid |
| `accent` | `#E2644C` | `#F07A62` | active step/tile, primary button, focus ring |
| `accent-soft` | `#FBE1D9` | `#4A2A22` | active row/tag backgrounds |
| `bad` | `#9E1A3C` | `#EF6A8C` | incidents, duplicates, wrong results |
| `good` | `#0D7680` | `#45B8C2` | correct results, "fixed" |
| `code-bg` | `#1F1E1D` | `#0E0D0C` | code panels (both themes dark) |

### Type
- Headings: **Manrope 800**. H1 40px/1.05 (32px mobile), H2 24px, H3 18px.
- Body: **Inter 400/600**, 15–16px, line-height 1.55, max 70 characters.
- Code: **JetBrains Mono** 13.5px, line-height 1.75.
- Labels: sentence case, 13px minimum.

### Space, shape, motion
- 8px spacing scale (4, 8, 12, 16, 24, 32, 48, 64).
- Radius: 8 (controls), 12 (panels), 14 (main panels), 999 (pills).
- One border style: 1px `line`. No heavy shadows; one subtle shadow on the
  slab only.
- Motion: 150–250ms ease-out; scene transitions 300ms; everything off under
  `prefers-reduced-motion`.
- Targets ≥ 44px; focus ring 3px `accent`, 2px offset.

## 3. App shell (all pages)
```
┌──────────────────────────────────────────────────────────────────────┐
│ [logo] FDE Lab   Learn · Simulators · Cheat sheets · Progress  [⌘K] │  top bar 60px
├───────────────┬──────────────────────────────────────────────────────┤
│ COURSE        │                                                      │
│ 01 Foundations│                 page content                         │
│  • Agent loop │                                                      │
│  • Context …  │                                                      │
│ 02 Reliability│                                                      │
│  • Idempotency│                                                      │
│ …             │                                                      │
│ [progress bar]│                                                      │
└───────────────┴──────────────────────────────────────────────────────┘
 sidebar 270px (folds into a drawer below 1000px)
```
Sidebar items show status: done tick · "Draft" pill (unreviewed) · hidden if planned.

## 4. Topic page header + tabs
```
Idempotency & safe retries                        02 Reliability · 35 min
A retried write must happen exactly once.                         [Draft]
[Overview][Get started][Concept][Scenario][Simulator][Lab][Cheat sheet][Recall]
```
Tabs: horizontal scroll on mobile; active tab = ink background, paper text;
completed tab gets a small tick. Each tab is its own URL (`/topics/<slug>/<tab>`).

## 5. Tab layouts

### Overview
Two columns (stack < 760px): left = what it is (3 short paragraphs), why FDEs
care, "after this you can" list; right = a small static IsoScene of the topic,
prerequisites, time, a "Start with Get started" button.

### Get started
Full-width playground: editor (left) + output (right) on desktop; stacked on
mobile. Above it: one-sentence goal. Below: CodeTabs (TS / Python / Go) with
copy, and "Expected output". "Reset" and "Run" buttons; run time limit shown.

### Concept (matches fde-lab-prototype.html)
```
┌ BridgeCallout: "You already know this: a double-clicked Pay button…" ┐
├───────────────────────────────────────────┬──────────────────────────┤
│  IsoScene (large, grid background)        │ Step 3 / 7     [Concept] │
│                                           │ Title                    │
│                                           │ Explanation              │
│                                           │ ┌ Picture it ──────────┐ │
│                                           │ └──────────────────────┘ │
│                                           │ [Back] [Next: … →]       │
├───────────────────────────────────────────┤ Pseudocode (dark, hl)    │
│ ① ② ③ ④ ⑤ ⑥ ⑦  stepper with titles        │ Who holds what (table)   │
└───────────────────────────────────────────┴──────────────────────────┘
Was this step clear? [thumbs up] [thumbs down]
```

### Scenario
Editorial article layout, 70ch column, with a sticky mini "case card" on the
right on desktop: Company (fictional) · Problem · Constraints · Outcome.
Sections: The situation → What went wrong (with a small IsoScene showing the
failure) → The fix → What to monitor → Questions you'd ask the customer.

### Simulator (matches harness-lab-simulators.html)
Left: large result picture (chart or bars). Right: controls, Predict box
(claret left border, must be filled to enable "Run"), result summary in big
numbers (claret if bad, teal if good). Under it: "What you just saw",
"Break it" challenge cards (locked → solved), "Copy link to this run",
"Illustrative model: assumptions" disclosure.

### Hands-on lab
Single column of checkpoint cards:
```
Checkpoint 2 · Make the consumer idempotent                 [ ] done
Goal …
Hint 1 [reveal]  Hint 2 [locked]  Hint 3 [locked]
Run: go test ./lab01 -run E2     Expected: 0 duplicate charges
[I tried it]  → unlocks [Show solution]
```
Top of page: "Run in browser (checkpoints 1–2)" vs "Full lab in Go (repo link)".

### Cheat sheet
Dense two-column print-friendly sheet (single column on mobile):
key terms · use-when / avoid-when table · snippets with CodeTabs ·
common mistakes · interview questions (question bold, short answer).
"Print / Save as PDF" button; print CSS hides chrome, uses black on white.

### Recall & field doc
Recall: one question at a time, textarea, "Reveal answer", self-grade
(Got it / Partly / Missed) stored for spaced review.
Field doc: rendered document (e.g. runbook) on paper style + "Copy blank
template" button.

## 6. IsoScene rules
- Slab of N tiles (3–6), labels on the dark front face, hatched right end.
- Stacks of blocks on tiles (0–6), "bad" blocks in `bad` colour on top.
- Active tile filled `accent`; caption bubbles in `ink` with `bg` text.
- Fits its box at any width ≥ 320px; never clips labels; drawn with real
  pixel sizes via ResizeObserver.

## 7. Progress & badges
Progress page: per topic, 8 tab ticks; recall streak; "review today" list
(spaced repetition from Recall self-grades). Completion badge: simple SVG
seal with topic name and date, downloadable/shareable.

## 8. Accessibility checklist
Real buttons/links only · labels on every control · charts have text
summaries · colour never the only signal (icons/text too) · keyboard path
through every tab · visible focus · reduced motion · 4.5:1 contrast.
