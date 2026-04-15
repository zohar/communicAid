---
description: "Work package task list for feature 002-on-screen-alphabet-keyboard"
---

# Work Packages: On-Screen Alphabet Keyboard

**Inputs**: Design documents from `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/keyboard-component.md, quickstart.md

**Tests**: REQUIRED. The project constitution activates the `TEST_FIRST` directive and mandates Vitest unit/integration tests for every interactive component. The repo currently has no test framework installed, so WP01 bootstraps it.

**Organization**: Fine-grained subtasks (`Txxx`) roll up into six work packages (`WP01`–`WP06`). Each work package is independently deliverable and testable, though WP03 → WP04 → WP05 are naturally sequential because they each depend on the component code being progressively filled in.

**Prompt Files**: Each work package has a matching prompt file under `kitty-specs/002-on-screen-alphabet-keyboard/tasks/`. The tasks.md file here is the high-level roll-up; detailed guidance lives inside the per-WP prompts.

## Subtask Format: `[Txxx] [P?] Description`

- **[P]** indicates the subtask can proceed in parallel (different files/components).
- Paths are relative to the repository root `/Users/zohar/apps/communicAid/`.

## Path Conventions

- Single-project Vite/React SPA.
- Production code lives in `src/`.
- Test code lives in `tests/keyboard/` (new directory, first test suite in repo).

---

## Work Package WP01: Test Harness Bootstrap (Priority: P0)

**Goal**: Install and configure Vitest + React Testing Library as dev dependencies so that every downstream work package can follow the TEST_FIRST directive. This is the first test suite in the repo.
**Independent Test**: Running `npm run test` exits 0 with at least one passing placeholder test; TypeScript compilation still clean; lint still clean.
**Prompt**: `tasks/WP01-test-harness-bootstrap.md`
**Requirements Refs**: NFR-005

### Included Subtasks

- [x] T001 Install devDependencies: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `@vitest/ui` (package.json)
- [x] T002 Create `vitest.config.ts` at repo root with jsdom environment, CSS support, and setup file reference
- [x] T003 Create `tests/setup.ts` that imports `@testing-library/jest-dom` and registers automatic RTL cleanup
- [x] T004 Add npm scripts `test`, `test:run`, `test:ui` to `package.json`
- [x] T005 Create `tests/keyboard/` directory and a placeholder smoke test (`tests/keyboard/smoke.test.ts`) that asserts `1 + 1 === 2` so WP01 has something to run green before WP02 arrives

### Implementation Notes

- No production code changes in this WP. Only config and devDeps.
- Pin versions compatible with Vite 8 / Vitest 2.x.
- Keep `vitest.config.ts` minimal — no coverage thresholds yet, just enough to run tests.

### Parallel Opportunities

- T001 → T002 → T003 → T004 → T005 are roughly sequential because each depends on the previous step being in place. Parallelism begins in WP02.

### Dependencies

- None (starting package).

### Risks & Mitigations

- Dependency version mismatch with Vite 8 → use Vitest 2.x which targets Vite 8; verify `npm install` succeeds before writing the smoke test.
- TypeScript complains about `@testing-library/jest-dom` matchers → add a `tests/setup.ts` import and include `tests` in the `tsconfig` `include` array if needed.

---

## Work Package WP02: Alphabet Data & i18n Keys (Priority: P0)

**Goal**: Create the static alphabet dictionary and extend the translation dictionaries with the keyboard-specific UI keys. Validate alphabet invariants with unit tests.
**Independent Test**: `npm run test` passes including the new `alphabets.test.ts`; `npm run typecheck` clean; all four languages type-check against the `Record<Language, ...>` shape.
**Prompt**: `tasks/WP02-alphabet-data-and-i18n-keys.md`
**Requirements Refs**: FR-002, FR-014, FR-022, C-001

### Included Subtasks

- [x] T006 Create `src/data/alphabets.ts` exporting `alphabets: Record<Language, readonly string[]>` and `alphabetGridColumns: Record<Language, number>` with the values defined in `data-model.md`
- [x] T007 [P] Create `tests/keyboard/alphabets.test.ts` with invariant assertions (correct counts, no duplicates, no whitespace/digits/punctuation, Arabic lacks lam-alif, Russian Ё in canonical position, every `Language` has entries in both maps)
- [x] T008 [P] Add new translation keys (`keyboard`, `space`, `backspace`, `clear`, `show`, `close`, `switchLanguage`) to the existing translation dictionaries under `src/data/translations/` for all four languages (en/he/ar/ru)

### Implementation Notes

- Use `as const` and `readonly string[]` to freeze the alphabet values.
- Translation keys: English values go first; Hebrew / Arabic / Russian values match by meaning, not literal transliteration (e.g., `space` → "מרווח" / "مسافة" / "Пробел").
- Do **not** touch `useTranslation` hook internals; the dictionaries are the only files that need changes.

### Parallel Opportunities

- T007 and T008 can proceed in parallel with each other once T006 lands.

### Dependencies

- Depends on WP01 (Vitest must be installed to run T007).

### Risks & Mitigations

- Incorrect alphabet order for Russian (forgetting Ё between Е and Ж) → unit test explicitly asserts the index of Ё.
- Translation file format drift → mirror the exact structure of existing keys in each file; don't restructure.

---

## Work Package WP03: KeyboardScreen Core (Priority: P1) 🎯 MVP CORE

**Goal**: Build the `KeyboardScreen` component scaffolding, internal state, letter grid, message display, and the basic letter/space/backspace/clear controls. This is the heart of the MVP — everything except Show, language switcher, and integration into the rest of the app.
**Independent Test**: With WP04's integration applied temporarily (or by mounting the component directly in a test), a user can tap letters, see them appear in the message display, tap backspace to remove the last character, and tap clear to empty the field. Tested via RTL component tests in WP05.
**Prompt**: `tasks/WP03-keyboard-screen-core.md`
**Requirements Refs**: FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-014, FR-018, FR-021, NFR-001, NFR-003, NFR-004, NFR-006

### Included Subtasks

- [x] T009 Create `src/components/screens/KeyboardScreen.tsx` with props interface `{ open: boolean; onClose: () => void }`, internal state (`message`, `keyboardLanguage`, `takeoverOpen`), and the reset-on-close effect that zeroes state when `open` transitions `true → false`
- [x] T010 Render the message display region (large text, `aria-live="polite"`, `dir` driven by `keyboardLanguage`, visible even when empty)
- [x] T011 Render the letter grid from `alphabets[keyboardLanguage]` using CSS Grid with `alphabetGridColumns[keyboardLanguage]` columns, key size ≥ 64×64, consistent styling with existing `CategoryTile` / `ItemButton`
- [x] T012 Implement control row with Space, Backspace, and Clear buttons (lucide-react icons; Backspace `Delete`, Clear `RotateCcw`, Space a wide key). Wire handlers to `message` state.
- [x] T016 Enforce the 200-character maximum: letter-tap and space-tap handlers silently ignore input when `message.length >= 200`. Backspace and Clear always work.

### Implementation Notes

- Component must return `null` when `open === false` (R-001 / contracts/keyboard-component.md). This makes code-splitting via `React.lazy` clean.
- Use a single `handleKeyPress(char: string)` helper so the letter, space, and (future) any other append action share the same max-length check.
- Tailwind classes should closely mirror existing `CategoryTile.tsx` and `ItemButton.tsx` so the design language is consistent.
- The overlay container is `fixed inset-0 z-50` with a solid background so the underlying app cannot show through or receive pointer events.
- Use `role="dialog"` and `aria-modal="true"` on the overlay container with `aria-label={t('keyboard')}` (title comes from the translation key added in WP02).

### Parallel Opportunities

- T010, T011, T012 can each be started in parallel once T009 lands (they touch different JSX blocks inside the same file but don't collide if authored sequentially in one session). T016 must come after T011/T012 since it modifies their handlers.

### Dependencies

- Depends on WP02 (needs `alphabets`, `alphabetGridColumns`, translation keys).
- Depends on WP01 (for follow-up tests in WP05).

### Risks & Mitigations

- Key grid does not fit Russian's 33 letters at the minimum tablet width → use `alphabetGridColumns.ru = 8` and verify via the quickstart manual check in WP06. Tune the column count only if measurement fails.
- Accidentally logging message content in a `console.log` during development → do **not** add any logs referencing `message`. Explicit non-behavior from the component contract.
- RTL grid layout looking reversed for Arabic/Hebrew → setting `dir` on the grid container is enough; letters will naturally flow right-to-left and the Unicode bidi rules handle mixed scripts in the message display.

---

## Work Package WP04: Show Takeover, Language Switcher, and App Integration (Priority: P1) 🎯 MVP INTEGRATION

**Goal**: Wire up the remaining `KeyboardScreen` features — the Show button plus large-text fullscreen takeover, the in-keyboard language switcher, the Close control — and integrate the overlay into the rest of the app via a new Header button and the lazy-loaded mount in `App.tsx`.
**Independent Test**: From the running dev server, the Keyboard button appears in the Header, tapping it opens the overlay, Show produces a fullscreen large-text takeover that dismisses on tap, the language switcher swaps the grid and preserves typed text, and Close (or external `open={false}`) returns the user to the previous screen.
**Prompt**: `tasks/WP04-show-takeover-switcher-and-app-integration.md`
**Requirements Refs**: FR-001, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, NFR-002, NFR-007, C-007

### Included Subtasks

- [x] T013 Implement the Show button and large-text fullscreen takeover sub-component inside `KeyboardScreen.tsx`. Show is disabled when `message === ''` (visibly styled as disabled). Tapping Show sets `takeoverOpen = true`. The takeover renders a `position: fixed inset-0 z-60` layer with the typed text in a responsively-sized large font, and dismisses on tap (after the next animation frame, per R-007) or via an explicit Close control inside the takeover. Dismissing preserves `message`.
- [x] T014 Implement the in-keyboard language switcher: a control that opens a small selector listing all configured `Language` values. Picking a language sets `keyboardLanguage` without clearing `message`. When only one language is configured, the switcher is hidden (future-proof — today all four are configured, but the hide logic still ships).
- [x] T015 Implement the Close button in the overlay's top row that calls `props.onClose()`. Wire the keyboard's focus management (move focus into the overlay on open, restore to trigger on close).
- [x] T017 Modify `src/components/Header.tsx`: add `onKeyboard: () => void` to `HeaderProps`; insert a new `<button>` immediately after the Home button using the lucide-react `Keyboard` icon, same styling (70×70, rounded-xl, slate-700). Accessible name `t('keyboard')`.
- [x] T018 Modify `src/App.tsx`: add `const [keyboardOpen, setKeyboardOpen] = useState(false)`; add `handleKeyboard = () => setKeyboardOpen(true)` and pass as `onKeyboard` to `<Header />`; import `KeyboardScreen` via `React.lazy(() => import('./components/screens/KeyboardScreen'))`; render `<Suspense fallback={null}><KeyboardScreen open={keyboardOpen} onClose={() => setKeyboardOpen(false)} /></Suspense>` after `<RecentItems />`. Do NOT modify `NavigationState` or `breadcrumbIds`.

### Implementation Notes

- Takeover font size: use CSS `clamp()` — something like `clamp(4rem, 12vw, 16rem)` — with `text-align: center` and `line-height: 1.1`. No JS-driven fit-text library.
- Takeover tap-to-dismiss safety: register the click handler inside a `requestAnimationFrame` callback (or via `setTimeout(..., 0)`) so the same touch that opened the takeover does not also close it.
- Language switcher UI: a single button with the current language's short code/name; tapping opens a simple vertical list of alternatives. Reuse existing `languageConfigs` from `src/data/translations/` for names.
- Keep all new state local to `KeyboardScreen`. App.tsx owns only the boolean `keyboardOpen`.

### Parallel Opportunities

- T013 and T014 can be authored in parallel within the same component.
- T017 and T018 are tightly coupled (the Header prop is consumed by App.tsx) — pair them.

### Dependencies

- Depends on WP03 (needs the KeyboardScreen scaffolding and state).
- No new dependencies on WP01/WP02 beyond those already inherited.

### Risks & Mitigations

- Header layout breaks on narrow viewports when the third button is added → keep button width consistent with existing Home/Back and verify with the manual quickstart check in WP06.
- `React.lazy` chunk name is unpredictable → after WP06's build verification, check `dist/assets/` for a chunk that includes `KeyboardScreen` in the name or rename the dynamic import via Vite's `/* webpackChunkName */`-equivalent if needed.
- Focus-trap complexity for a11y → start with "move focus to the overlay on open" and "return focus on close". Full focus trap can be a follow-up if Lighthouse flags it.

---

## Work Package WP05: KeyboardScreen Component Tests (Priority: P1)

**Goal**: Cover every user story and every FR with Vitest + RTL component tests. These tests lock in behavior for the TEST_FIRST directive and block regressions.
**Independent Test**: `npm run test` exits 0 with all tests passing. Coverage for `KeyboardScreen.tsx`, `Header.tsx` changes, and `alphabets.ts` is ≥ 80% lines.
**Prompt**: `tasks/WP05-keyboard-component-tests.md`
**Requirements Refs**: FR-001, FR-002, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-013, FR-015, FR-016, FR-017, FR-019, FR-020, FR-021

### Included Subtasks

- [x] T019 `tests/keyboard/KeyboardScreen.test.tsx` — User Story 1: tap letters append to message, Show opens takeover with typed text, tap on takeover dismisses it, message preserved after dismissal (FR-001, FR-004, FR-008, FR-009, FR-010)
- [x] T020 Same file — User Story 2: backspace removes last character, backspace on empty is a no-op (FR-006)
- [x] T021 Same file — User Story 3: language switcher changes grid contents, already-typed text preserved across switch, switcher hidden/disabled when only one language (FR-016, FR-017, FR-019, FR-020, FR-021)
- [x] T022 Same file — User Story 4 and edge cases: clear empties message (FR-007), Show is inert/disabled on empty (FR-011, FR-015), state resets when `open` toggles false→true (FR-013), 200-character max is enforced
- [x] T023 [P] `tests/keyboard/Header.test.tsx` — Header renders a new keyboard button, button is labeled, clicking it calls `onKeyboard` prop, existing Home/Back/Settings behavior unchanged

### Implementation Notes

- Use `@testing-library/user-event` v14+ `userEvent.setup()` API — do NOT use the deprecated direct imports.
- Mount `KeyboardScreen` directly (without going through `App`) and drive it via `rerender` to toggle `open`.
- For the language-switcher-hidden case, temporarily mock/constrain `Language` via a test-only constant helper, OR assert that when there is only one button visible in the switcher list, the control is hidden. Keep the production `Language` union alone.
- For the "no logging" privacy assertion, spy on `console.log`/`console.info`/`console.warn`/`console.error` and assert none are called with strings containing the typed message.
- Add `window.localStorage` and `global.fetch` spies to assert they are never called from `KeyboardScreen` (privacy constraints C-003/C-004/C-005).

### Parallel Opportunities

- T023 can run fully parallel with T019–T022 (different test file).
- Within T019–T022, tests live in the same file; author them sequentially to avoid merge conflicts.

### Dependencies

- Depends on WP04 (needs the complete component and Header integration).

### Risks & Mitigations

- Flaky "dismiss takeover on tap" tests due to the frame-delay dismissal safety → use `fireEvent` with a manual `await new Promise(r => setTimeout(r, 16))` or use `vi.useFakeTimers()` and advance time. Document the pattern in the test file.
- RTL rendering in JSDOM → JSDOM doesn't render bidi correctly visually, but the `dir` attribute and text content are what we assert. Assert DOM state, not pixel layout.
- Spy cleanup between tests → rely on `afterEach(() => vi.restoreAllMocks())` plus RTL automatic cleanup from `tests/setup.ts`.

---

## Work Package WP06: Polish, Quality Gates & Manual Verification (Priority: P2)

**Goal**: Run all automated quality gates, perform the manual quickstart walkthrough, verify accessibility, privacy, and bundle-split targets. This is the final gate before the feature is declared done.
**Independent Test**: All gates pass: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`. Lighthouse a11y ≥ 90 on the keyboard overlay. No message content in console/network/storage. `dist/` contains a code-split chunk for `KeyboardScreen` ≤ 20 KB gzipped.
**Prompt**: `tasks/WP06-polish-quality-gates-and-verification.md`
**Requirements Refs**: NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-006, NFR-007, C-003, C-004, C-005, SC-001, SC-002, SC-003, SC-004, SC-005, SC-006

### Included Subtasks

- [x] T024 Run `npm run typecheck`, `npm run lint`, `npm run test` at repo root. Fix every error and warning. Do not suppress.
- [x] T025 Manual quickstart walkthrough: run `npm run dev`, follow every step in `kitty-specs/002-on-screen-alphabet-keyboard/quickstart.md` (sections 2–8), and record the outcome briefly in the WP activity log. Any failure blocks the WP.
- [x] T026 Accessibility verification: open Chrome DevTools → Lighthouse → Accessibility, run audit on the keyboard overlay, confirm score ≥ 90. Measure rendered letter-key size with the inspector; confirm ≥ 64×64 CSS pixels at a 1024×768 viewport. Confirm WCAG AA contrast on letter keys, message display, takeover text, and control buttons using the axe extension or DevTools contrast checker.
- [x] T027 Privacy verification: with a typed message, inspect the Console, Network, localStorage, and sessionStorage panes of DevTools. Confirm the message content does not appear in any of them. Close and reopen the overlay; confirm the message is gone.
- [x] T028 Bundle-split verification: run `npm run build`, inspect `dist/assets/` for a chunk containing `KeyboardScreen`, and confirm its gzipped size is ≤ 20 KB (use `gzip -c <file> | wc -c` or compare Vite's build output summary).

### Implementation Notes

- Quickstart section 9 (Lighthouse) aligns with T026; do not duplicate.
- Quickstart section 11 (Privacy) aligns with T027.
- Quickstart section 10 (Performance) aligns with T028.
- If T026 finds Lighthouse < 90, the most likely culprits are missing `aria-label` on icon-only buttons, missing `role="dialog"` / `aria-modal`, or contrast violations on disabled-Show styling. Fix these in-place.
- This WP does **not** introduce new features. Any issue found here should be fixed by editing the WP03/WP04 files directly, not by adding a new WP.

### Parallel Opportunities

- T026, T027, and T028 can be run in any order after T024 and T025 pass.

### Dependencies

- Depends on WP05 (all tests green first).

### Risks & Mitigations

- Lighthouse flags color contrast on disabled Show button → use a disabled style with ≥ 4.5:1 contrast against the background (e.g., `text-slate-400 bg-slate-700` with strike or opacity that still meets AA).
- Bundle chunk is inlined (not code-split) because Vite couldn't split it → ensure `React.lazy(() => import(...))` uses a string literal path, not a variable, and verify `vite.config.ts` has no `build.rollupOptions.output.manualChunks` override that would interfere.
- Quickstart manual test finds a regression in existing screens (HomeScreen, Category, Config, ActionBar, Recent Items, Quick Names) → fix it in place; the feature must not regress existing behavior.

---

## Dependency & Execution Summary

- **Sequence**: `WP01` → `WP02` → `WP03` → `WP04` → `WP05` → `WP06`.
- **Parallelization**:
  - Inside WP02, T007 and T008 can run in parallel after T006 lands.
  - Inside WP04, T013 and T014 can be authored in parallel.
  - Inside WP05, T023 can run fully parallel with T019–T022.
  - WP05 authoring can begin as soon as WP04 lands each feature (e.g., start T019 during WP04's T013).
- **MVP Scope**: The minimal user-facing release is `WP01 + WP02 + WP03 + WP04` (the patient can type and show messages). WP05 + WP06 are required by the project constitution's quality gates before merge but do not add user-visible behavior.

---

## Requirements Coverage Summary

| Requirement ID | Covered By Work Package(s) |
|----------------|----------------------------|
| FR-001 | WP04, WP05 |
| FR-002 | WP02, WP03, WP05 |
| FR-003 | WP03 |
| FR-004 | WP03, WP05 |
| FR-005 | WP03, WP05 |
| FR-006 | WP03, WP05 |
| FR-007 | WP03, WP05 |
| FR-008 | WP04, WP05 |
| FR-009 | WP04, WP05 |
| FR-010 | WP04, WP05 |
| FR-011 | WP04, WP05 |
| FR-012 | WP04 |
| FR-013 | WP03, WP05 |
| FR-014 | WP02, WP03 |
| FR-015 | WP04, WP05 |
| FR-016 | WP04, WP05 |
| FR-017 | WP04, WP05 |
| FR-018 | WP03, WP04 |
| FR-019 | WP04, WP05 |
| FR-020 | WP04, WP05 |
| FR-021 | WP03, WP04, WP05 |
| FR-022 | WP02 |
| NFR-001 | WP03, WP06 |
| NFR-002 | WP04, WP06 |
| NFR-003 | WP03, WP04, WP06 |
| NFR-004 | WP03, WP06 |
| NFR-005 | WP01, WP06 |
| NFR-006 | WP03, WP06 |
| NFR-007 | WP04, WP06 |
| C-001 | WP02 |
| C-002 | WP03, WP04 (non-behavior) |
| C-003 | WP03, WP05, WP06 |
| C-004 | WP03, WP05, WP06 |
| C-005 | WP03, WP05, WP06 |
| C-006 | WP02 |
| C-007 | WP04 |

---

## Subtask Index (Reference)

| Subtask ID | Summary                                                                 | Work Package | Priority | Parallel? |
|------------|-------------------------------------------------------------------------|--------------|----------|-----------|
| T001       | Install Vitest + RTL devDependencies                                    | WP01         | P0       | No        |
| T002       | Create vitest.config.ts                                                 | WP01         | P0       | No        |
| T003       | Create tests/setup.ts                                                   | WP01         | P0       | No        |
| T004       | Add test scripts to package.json                                        | WP01         | P0       | No        |
| T005       | Create tests/keyboard/ smoke test                                       | WP01         | P0       | No        |
| T006       | Create src/data/alphabets.ts                                            | WP02         | P0       | No        |
| T007       | Unit tests for alphabets.ts invariants                                  | WP02         | P0       | Yes       |
| T008       | Add keyboard translation keys (en/he/ar/ru)                             | WP02         | P0       | Yes       |
| T009       | KeyboardScreen scaffolding + state + reset-on-close                     | WP03         | P1       | No        |
| T010       | Message display region with aria-live and dir                           | WP03         | P1       | No        |
| T011       | Alphabetical letter grid with per-language column counts                | WP03         | P1       | No        |
| T012       | Control row: Space / Backspace / Clear                                  | WP03         | P1       | No        |
| T016       | 200-character max-length enforcement                                    | WP03         | P1       | No        |
| T013       | Show button + large-text takeover sub-component                         | WP04         | P1       | Yes       |
| T014       | In-keyboard language switcher (hidden when only one language)           | WP04         | P1       | Yes       |
| T015       | Close button + focus management                                         | WP04         | P1       | No        |
| T017       | Header: add keyboard button next to Home                                | WP04         | P1       | No        |
| T018       | App.tsx: keyboardOpen state + lazy KeyboardScreen mount                 | WP04         | P1       | No        |
| T019       | Tests: US1 (type + show + dismiss + preserve text)                      | WP05         | P1       | No        |
| T020       | Tests: US2 (backspace + empty no-op)                                    | WP05         | P1       | No        |
| T021       | Tests: US3 (language switcher preserves text, hidden when single)       | WP05         | P1       | No        |
| T022       | Tests: US4 + edge cases (clear, empty show, reset, max length)          | WP05         | P1       | No        |
| T023       | Tests: Header keyboard button wiring                                    | WP05         | P1       | Yes       |
| T024       | Quality gates: typecheck / lint / test all green                        | WP06         | P2       | No        |
| T025       | Manual quickstart walkthrough                                           | WP06         | P2       | No        |
| T026       | Accessibility verification (Lighthouse, contrast, touch target)         | WP06         | P2       | Yes       |
| T027       | Privacy verification (console / network / storage)                      | WP06         | P2       | Yes       |
| T028       | Bundle-split verification (KeyboardScreen chunk ≤ 20 KB gzipped)        | WP06         | P2       | Yes       |

<!-- status-model:start -->
## Canonical Status (Generated)
- WP01: approved
- WP02: approved
- WP03: approved
- WP04: approved
- WP05: approved
- WP06: for_review
<!-- status-model:end -->
