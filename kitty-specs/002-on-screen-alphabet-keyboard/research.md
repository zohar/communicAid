# Phase 0: Research

**Feature**: On-Screen Alphabet Keyboard (`002-on-screen-alphabet-keyboard`)
**Date**: 2026-04-14

This document captures the research decisions made during planning. Every decision listed here was resolved during the `/spec-kitty.plan` interrogation, so no `[NEEDS CLARIFICATION]` markers remain in the plan.

---

## R-001: Navigation model — overlay vs. screen

**Decision**: Render the keyboard as a **fullscreen overlay** controlled by a `keyboardOpen: boolean` in `App.tsx` local state. It is not a member of `NavigationState['screen']` and it does not push onto `breadcrumbIds`.

**Rationale**:

- Closing the keyboard must return the user to exactly the screen they came from (home, category, subcategory, config) without rewinding their navigation stack. Overlays give this for free; treating the keyboard as a navigation screen would require manipulating `breadcrumbIds` on open and close.
- The keyboard is a *tool*, not a *destination*, in the same way that the large-text "selected message" banner (`App.tsx:112`) is a tool. Toolbars and modals in this app are already rendered as conditional overlays.
- Keeps the scope of the change small. `NavigationState` stays untouched.

**Alternatives considered**:

- Add `'keyboard'` to `NavigationState['screen']` and push `'keyboard'` onto `breadcrumbIds`. Rejected — requires touching Back/Home handlers and breadcrumb logic and inflates the blast radius.
- Render the keyboard inline inside `HomeScreen`. Rejected — FR-001 requires the keyboard to be reachable from *any* screen, not just home.

---

## R-002: Where does keyboard language state live?

**Decision**: Keyboard language is **local state inside `KeyboardScreen`**, initialized from `useLanguage().language` at mount and updated only by the in-screen switcher. Changing it does **not** call `useLanguage().setLanguage`, so the rest of the app's active language is untouched.

**Rationale**:

- A bilingual patient composing "I want אמא" should not change the entire app's language just because they tapped the Hebrew key for one word. The rest of the app (titles, category labels, action bar) must remain in the caregiver-configured app language.
- Keeping the selection local means it disappears when the overlay closes — on next open, the keyboard reverts to the app's current language. This is the most predictable behavior and matches FR-021.

**Alternatives considered**:

- Make the switcher call `useLanguage().setLanguage`. Rejected — violates the "don't change app language" intent and would persist the switch into `localStorage`, leaking keyboard state into the rest of the app.
- Put keyboard language in a new global hook. Rejected — unnecessary abstraction for state used by exactly one component.

---

## R-003: Per-language alphabet data

**Decision**: A new file `src/data/alphabets.ts` exports `Record<Language, string[]>` with isolated-form characters for each of the four supported languages.

**Rationale**:

- Matches the existing `src/data/` convention (`categories.ts`, `resolveEntry.ts`, `translations/`).
- Single-source-of-truth for grid contents. Alphabet integrity (correct count, no duplicates, no whitespace, no stray punctuation) is easy to unit-test.
- Adding a fifth language in the future is a one-file edit.

**Alphabets committed**:

| Language | Count | First → Last | Notes |
|---|---|---|---|
| `en` | 26 | A → Z | Uppercase Latin letters. Uppercase is chosen because it is easier for a sedated reader to disambiguate and matches high-contrast display styling used elsewhere in the app. |
| `he` | 22 | א → ת | Standard Hebrew alef-bet, no final-form duplicates in the grid (Unicode final forms ך ם ן ף ץ can still be typed if needed in a later iteration; for this release the patient just uses the base-form equivalents). |
| `ar` | 28 | ا → ي | Isolated Arabic letter forms. Lam-alif ligature is intentionally excluded — if the patient needs لا, they tap ل then ا and the reader parses it. Diacritics (harakat) are excluded. |
| `ru` | 33 | А → Я | Cyrillic uppercase, including ё between е and ж per conventional Russian alphabet ordering. |

**Alternatives considered**:

- Inline the alphabets directly inside `KeyboardScreen.tsx`. Rejected — mixes data with view logic and makes unit-testing harder.
- Derive alphabets from Unicode ranges at runtime. Rejected — fragile for languages with non-contiguous ranges (Russian, which has ё out of sequence) and makes ordering decisions implicit.
- Ship only en/he/ru, defer Arabic. Rejected — the user explicitly asked for all four; Arabic is kept deliberately simple by using isolated forms only.

---

## R-004: Grid layout strategy

**Decision**: CSS Grid with a language-specific column count, chosen per alphabet size so the grid is roughly square, fits on a landscape tablet without scrolling, and every key remains ≥ 64×64 px on the minimum supported tablet width (≥ 768 px landscape viewport).

**Column counts per language** (initial values; tune in implementation if needed):

| Language | Letter count | Columns | Rows |
|---|---|---|---|
| `en` | 26 | 7 | 4 (last row has 5 keys) |
| `he` | 22 | 6 | 4 (last row has 4 keys) |
| `ar` | 28 | 7 | 4 |
| `ru` | 33 | 8 | 5 (last row has 1 key) |

**Rationale**:

- Fixed column count per language keeps rendering deterministic and simple to style.
- All counts allow keys ≥ 72×72 at the minimum tablet width after subtracting message display, controls, and padding.
- A small helper `alphabetGridColumns: Record<Language, number>` lives in `alphabets.ts` alongside the letter data.

**Alternatives considered**:

- Fully responsive `auto-fit` grid. Rejected — produces uneven last rows that look worse for a simple-minded UI and can shrink keys below the target on narrow viewports.
- Hard-coded rows (e.g., QWERTY-like rows). Rejected — explicit non-goal per FR-002.

---

## R-005: RTL handling

**Decision**: The grid container's `dir` attribute is set from the keyboard language's `languageConfigs[lang].dir` (already available from `src/data/translations/`). The message display element also sets its `dir` to the current keyboard language, so new characters flow in the correct direction. Mixed-script messages rely on native Unicode bidi (the browser's default text rendering).

**Rationale**:

- Re-uses the existing `languageConfigs` metadata. No new direction plumbing.
- Unicode bidi rendering is already correct in every evergreen browser for interleaved LTR/RTL runs — no custom logic needed.

**Alternatives considered**:

- Segment the message into runs per direction and render each in a separate span. Rejected — over-engineered; browsers already handle this.

---

## R-006: Large-text takeover implementation

**Decision**: The takeover is a **sub-component rendered inside `KeyboardScreen`**, activated by local state `takeoverOpen: boolean`. It is a `position: fixed; inset: 0` element with a click handler on its background that closes it. Inside, the typed text is rendered at a large font size with appropriate responsive scaling.

**Font sizing**:

- Starts at ~12rem and uses CSS `clamp()` plus `max-content` or a width-based scale so a 20-character message fills ~60–80% of viewport width without wrapping (NFR-002).
- Line height ~1.1 for readability at large sizes.
- Pure CSS — no JS-driven fit-text logic (to keep things simple).

**Rationale**:

- Sub-component inside the same file keeps related state together (takeover depends on `message`).
- No portal needed because the parent `KeyboardScreen` is already a top-level overlay.

**Alternatives considered**:

- Separate `<TakeoverScreen />` component at `App.tsx` level. Rejected — the takeover has no lifecycle independent of the keyboard screen; coupling keeps state simple.
- JS "fit-text" libraries. Rejected — adds a dependency for something CSS already solves well enough.

---

## R-007: Dismissal behavior for the takeover

**Decision**: Tapping anywhere on the takeover dismisses it, **except** the takeover ignores touch events that began before it opened (i.e., no dismissal on the same touch that caused it to appear). In practice this is achieved by:

1. The Show button's `onClick` opens the takeover.
2. A `useEffect` registers a `pointerup` or `click` listener on the takeover element *after* the next frame, not immediately.
3. Alternatively: a clearly visible **Close** button inside the takeover always works regardless of timing.

**Rationale**:

- Satisfies the spec edge case: a patient resting a finger on the screen should not immediately dismiss a takeover that appears under their finger.
- The explicit Close button is the fallback for any timing weirdness.

**Alternatives considered**:

- Dismiss only via an explicit Close button (no tap-to-dismiss). Rejected — slower, demands more attention.
- Dismiss on any pointerdown. Rejected — causes the exact bug above.

---

## R-008: Testing strategy and framework bootstrap

**Decision**: Install **Vitest** + **@testing-library/react** + **@testing-library/user-event** + **jsdom** as devDependencies. Add a `vitest.config.ts` and a `test` script in `package.json`. Put new test files under `tests/keyboard/`. No Playwright e2e in this feature.

**Rationale**:

- The constitution mandates Vitest and notes "No test framework installed yet — to be set up." This feature is a natural first suite.
- `@testing-library/user-event` provides realistic tap simulation for the 24+ keys, backspace, clear, show, and language switcher.
- jsdom is the standard environment for React Testing Library.

**Test coverage plan**:

- `alphabets.test.ts` — unit tests: each alphabet has the correct count; no duplicates; no whitespace; every character is a single grapheme; lam-alif is *not* present in the Arabic alphabet.
- `KeyboardScreen.test.tsx` — component tests per user story:
  - Tapping letters appends to the message display (US1)
  - Backspace removes the last character only (US2, FR-006)
  - Backspace on empty input is a no-op (FR-006 acceptance #2)
  - Clear empties the message (US4)
  - Show opens the takeover with the typed text (US1)
  - Show is disabled/inert when message is empty (FR-011, FR-015)
  - Tap on takeover dismisses it and preserves text (FR-010)
  - Language switcher swaps the grid to another language (US3)
  - Language switch preserves already-typed text (US3, FR-019)
  - Overlay `open={false}` unmounts message state (FR-013)
- `Header.test.tsx` — tests that the new keyboard button exists, is labeled, and calls `onKeyboard` when clicked.

**Alternatives considered**:

- Skip tests and ship faster. Rejected — violates the `TEST_FIRST` project directive and the constitution quality gates.
- Use Jest. Rejected — Vitest is already mandated by the constitution.

---

## R-009: Code-splitting and bundle impact

**Decision**: Import `KeyboardScreen` in `App.tsx` via `React.lazy(() => import('./components/screens/KeyboardScreen'))` and wrap its render in `<React.Suspense fallback={null}>`. This ensures the keyboard (including all four alphabets and its styles) is fetched only on first open.

**Rationale**:

- Protects initial FCP on 3G (constitution performance target).
- The keyboard is optional — many sessions will never open it — so moving its code out of the initial chunk is a net win.
- `fallback={null}` is acceptable because the keyboard opens in response to an explicit user tap; a momentary blank during chunk fetch is invisible since the old content remains on screen until the overlay renders.

**Alternatives considered**:

- Static import. Rejected — adds ~10–15 KB gzipped to initial bundle for a feature many users won't trigger.
- Preload the chunk on hover/focus of the keyboard button. Deferred — can be added later if telemetry shows first-open latency is noticeable.

---

## R-010: Privacy — message content handling

**Decision**: The typed message is held in a single `useState<string>` inside `KeyboardScreen`. It is never logged with `console.log`/`console.info`/`console.error`. It is never included in any error boundary payload. It is never stored in localStorage. It is never sent to Supabase or any network endpoint. On overlay close, the string is dropped when the component unmounts (or when `open` transitions back to `false` — see R-001).

**Rationale**:

- Constraint C-005 explicitly treats message content as sensitive medical context.
- Simplest way to guarantee non-leakage: never wire it up to anything outside the component.
- Unit tests can verify that `localStorage` and `fetch` are not touched from within the keyboard component by mocking them and asserting they are never called.

**Alternatives considered**:

- Debug-only logging gated by `import.meta.env.DEV`. Rejected — developer logs can leak into production console if the gate slips.
