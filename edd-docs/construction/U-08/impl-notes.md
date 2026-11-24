# U-08 CityMap, motion, accessibility: implementation notes (EDD 2.2)

- **Commits:**
  - `6cd16dc`: tests (red).
  - `f4ab041`: implementation.
  - `f8a4625`: gate fixes.
  - `6dd449a`: review fixes.
- **Base:** `ccfa635`. Done in the main session; the edd-reviewer ran in the background.

## What was built
- **`cityGeometry.ts`** was generated once from `Main.dc.html:49` by a one-off script kept outside the repo. It holds 166 shapes in paint order. The reviewer re-checked it against the mockup: 0 geometry differences, and all 9 accent fills became `class="accent"`.
- **`CityMap.tsx`** (server component): a `<nav aria-label={profile.city.label}>` around the svg (viewBox `-418 -303 837 794`). It renders:
  - 4 building links, named by the nav labels;
  - label pills sized from the label (the mockup widths are preserved for the confirmed labels);
  - the car as `g.city-car`;
  - 2 signposts with 2 stacked boards each, showing `profile.city.signposts`.

  A building with no nav label throws, so the build fails rather than shipping a nameless link.
- **CSS:**
  - **lift:** `translateY(-4px)`, 150 ms ease-out, on the building's inner group, so the link's hit area stays put;
  - **highlight:** the label fills with `--focus` on hover and `:focus-visible`;
  - **focus:** a 3 px outline;
  - **car:** drives in once over 12 s;
  - **reduced motion:** a global switch that turns off every animation and transition, while the hover and focus states still apply.
- **Hero** mounts the map in its right column. `aspect-ratio: 837/794` reserves the space (CLS 0).
- **e2e:** `home-motion`, `home-a11y` (axe, Tab walk, target sizes) and `home-viewport`. `@axe-core/playwright` is pinned to exactly 4.14.0 (its `axe-core` dependency resolves to 4.14.1).
- **Gates:**
  - pii-allowlist: + the viewBox value.
  - check-literals word rule: a word is a token with 2+ letters or letters only.
  - view-source: + the sign boards.

## Review (`review.md`): approve-with-minors (0 blocker, 0 major, 7 minor, 9 nit)
- **Fixed:**
  - #1: pills sized from content.
  - #2: guard against an unlabelled building.
  - #4: focus evidence (screenshot, plus outline ≥ 2 px now required on buildings too).
  - #5: hover jitter (lift moved to the inner group).
  - #6: literals bypass ("Three years at bet365" is caught again, with a test).
  - #7: Lighthouse numbers and zoom evidence are in `gates.md`.
  - **Nits:** the test plan said `role="group"`; React keys; fixed sleeps replaced by polling; the car's start position is now on the tile; the label font is set in CSS; the axe-core version note.
- **Owner decision (#3):** at 360 px the map labels are about 5.6 px and the signposts about 4.8 px. The map scales as a whole, which is the mockup's design. The building links stay accessible (named, ≥ 24 px targets, focus visible). Options:
  - (a) keep as designed;
  - (b) crop the empty sky above the map on narrow screens (the viewBox stays as fixed by HOME-AC-10, cropped with CSS);
  - (c) enlarge the labels on narrow screens.
- **Not changed:**
  - The landmark name is the confirmed C-04 sentence (64 characters).
  - The "space reserved" test is kept as a regression check on the aspect ratio.
  - The 2.5.8 circle-against-circle case: all targets pass the plain size rule anyway.
