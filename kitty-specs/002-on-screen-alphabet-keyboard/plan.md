# Implementation Plan: On-Screen Alphabet Keyboard

**Branch**: `keyboard` | **Date**: 2026-04-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `kitty-specs/002-on-screen-alphabet-keyboard/spec.md`

## Branch Contract

- Current branch at plan start: `keyboard`
- Planning/base branch for this feature: `keyboard`
- Final merge target for completed changes: `keyboard`
- `branch_matches_target`: true

All planning artifacts are committed directly on `keyboard`. No worktree is created by this command.

## Summary

Add an on-screen alphabetical keyboard to communicAid so sedated, non-verbal patients can compose short custom messages that no predefined tile covers, and then "show" the composed message in very large letters to a nearby caregiver.

The keyboard is rendered as a **fullscreen overlay** above whatever screen is currently showing — it is *not* a navigation screen and does not push onto the app's `breadcrumbIds` stack. A new keyboard button is added to the existing `Header` component, placed next to the Home button, which toggles the overlay.

The overlay contains:

- An **alphabetical letter grid** for the patient's currently selected keyboard language (not QWERTY)
- A **live message display** above the grid showing what has been typed so far
- Controls: **Space**, **Backspace**, **Clear**, **Show**, **Close**
- A **language switcher** (shown when more than one language is configured) that swaps the grid to a different language's alphabet without clearing the typed text, enabling mixed-script messages
- A secondary **large-text takeover** sublayer that appears when Show is tapped, fills the viewport with the typed text, and dismisses on tap

The feature supports all four currently configured app languages: English (26 letters), Hebrew (22 letters), Arabic (28 letters, isolated forms, lam-alif intentionally represented as two separate keys ل + ا), and Russian (33 letters). The grid is always alphabetical in that language's conventional order. Writing direction of the grid and of new input in the message area follows the active keyboard language (LTR or RTL).

All keyboard state (typed text, active keyboard language) is local React state inside the keyboard component. It is not persisted, not logged, not transmitted, and is cleared when the overlay closes.

## Technical Context

**Language/Version**: TypeScript 6 (strict mode), React 19
**Primary Dependencies**: Existing communicAid stack only — React 19, Tailwind CSS 4, lucide-react, Vite 8. No new runtime dependencies.
**Storage**: None. Typed message state is in-memory React state only. Not written to localStorage, not written to Supabase, not persisted across overlay close/reopen.
**Testing**: Vitest + @testing-library/react + @testing-library/user-event to be added as dev dependencies (test framework is not yet installed per CLAUDE.md and constitution). Playwright e2e is out of scope for this feature; a manual quickstart checklist covers e2e validation.
**Target Platform**: Modern evergreen browsers on tablet (primary), desktop, mobile. Landscape orientation is the primary supported layout.
**Project Type**: Single-project React SPA (Vite). No backend changes.
**Performance Goals**:

- Tap-to-character latency < 100 ms (NFR-004)
- Language switch latency < 150 ms (NFR-007)
- Keyboard screen contributes ≤ 20 KB gzipped to initial JS bundle, or is code-split via `React.lazy` so it does not affect initial FCP on 3G (SC-006)
- FCP under 2 s on mobile 3G (constitution performance target — must not regress)

**Constraints**:

- Touch targets ≥ 64×64 CSS pixels for every interactive key (NFR-001), including for the Russian 33-letter grid, on the minimum supported tablet width
- WCAG AA contrast for all text and interactive elements (NFR-003)
- Lighthouse accessibility score ≥ 90 on the keyboard screen (NFR-005, constitution quality gate)
- No network calls from this feature (C-004)
- No logging or telemetry of typed message content (C-005)
- No persistence of typed messages (C-003)

**Scale/Scope**: One new screen component, one new Header button, one new data file (alphabets), one new entry in `App.tsx` state, zero backend/API/DB changes. ~400–600 LOC total including tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`/Users/zohar/apps/communicAid/.kittify/constitution/constitution.md`) defines the following gates. Each is evaluated against this feature:

| Gate | Evaluation | Status |
|---|---|---|
| **TEST_FIRST directive** — tests written before implementation for acceptance and unit layers | Plan sequences Vitest setup and test files (covering FR-002 through FR-021 acceptance scenarios) ahead of the production component and data files in `tasks.md`. Red-green-refactor loop applies. | ✅ Pass |
| **Vitest unit/integration coverage 80%+** | Unit tests for alphabet data, key handler functions, and `KeyboardScreen` component interactions target ≥80% line coverage for the new files. Existing repo coverage is untouched (there is no prior test suite to regress). | ✅ Pass (bootstraps test harness as part of the feature) |
| **Accessibility tests on all interactive components** | RTL + key tap + takeover dismiss covered by RTL tests; contrast and target size covered by manual Lighthouse check in `quickstart.md`. | ✅ Pass |
| **TypeScript strict mode, ESLint clean** | All new files must compile under the existing `tsconfig` strict settings and pass `npm run lint`. No `any`, no `@ts-ignore`. | ✅ Pass |
| **Lighthouse a11y ≥ 90 on new screen** | Built into `quickstart.md` manual validation step. | ✅ Pass |
| **FCP < 2 s on mobile 3G, minimal bundle, aggressive code-split** | `KeyboardScreen` is loaded via `React.lazy` from `App.tsx` so it is fetched only when the user opens the keyboard. | ✅ Pass |
| **Touch targets ≥ 48px (project currently uses 70–90px)** | New keys use ≥ 64×64 and will hit ~80px at normal tablet widths, matching existing `CategoryTile` / `ItemButton` sizing. | ✅ Pass |
| **No Supabase service-role keys exposed in frontend** | Feature is client-only, touches no Supabase code paths. | ✅ Pass (N/A) |
| **Patient data sensitivity — no analytics/tracking of content** | Constraint C-005 forbids logging or transmitting message content. No `console.log` of message string. No error reporter attachment. | ✅ Pass |
| **Branch strategy — one focused reviewer approves before merge** | Covered by repo PR process; no plan-level action needed. | ✅ Pass |

**Constitution Check result: PASS.** No violations, no justification entries needed. Re-check after Phase 1 below.

## Project Structure

### Documentation (this feature)

```
kitty-specs/002-on-screen-alphabet-keyboard/
├── spec.md                      # Feature specification (already generated)
├── plan.md                      # This file (/spec-kitty.plan output)
├── research.md                  # Phase 0 output
├── data-model.md                # Phase 1 output
├── quickstart.md                # Phase 1 output
├── contracts/
│   └── keyboard-component.md    # Component "contract" — props, state, events
├── checklists/
│   └── requirements.md          # Already generated during /spec-kitty.specify
└── tasks/
    └── README.md                # (Generated by /spec-kitty.tasks, NOT this command)
```

### Source Code (repository root)

This is a single-project Vite/React SPA. Existing layout:

```
/Users/zohar/apps/communicAid/
├── src/
│   ├── App.tsx                           # Root — will gain `keyboardOpen` state + overlay
│   ├── types.ts                          # Shared TS types — already defines Language union
│   ├── components/
│   │   ├── Header.tsx                    # Will gain a new keyboard button + onKeyboard prop
│   │   ├── ActionBar.tsx
│   │   ├── RecentItems.tsx
│   │   ├── CategoryTile.tsx
│   │   ├── ItemButton.tsx
│   │   ├── config/
│   │   └── screens/
│   │       ├── HomeScreen.tsx
│   │       ├── CategoryScreen.tsx
│   │       ├── ConfigScreen.tsx
│   │       └── KeyboardScreen.tsx        # NEW — the overlay component
│   ├── data/
│   │   ├── categories.ts
│   │   ├── alphabets.ts                  # NEW — Record<Language, string[]>
│   │   ├── resolveEntry.ts
│   │   └── translations/
│   └── hooks/
│       ├── useLanguage.ts                # Unchanged — reused as source of initial keyboard language
│       ├── useTranslation.ts             # Unchanged — used for button labels (Clear, Show, etc.)
│       ├── useOverrides.ts
│       └── useQuickNames.ts
├── tests/                                # NEW directory
│   └── keyboard/
│       ├── alphabets.test.ts             # Unit tests for alphabet data integrity
│       ├── KeyboardScreen.test.tsx       # Component tests for all user stories
│       └── Header.test.tsx               # Tests the new keyboard button wiring
├── vitest.config.ts                      # NEW — test runner config
├── package.json                          # MODIFIED — add vitest, testing-library, jsdom devDeps
└── kitty-specs/002-on-screen-alphabet-keyboard/
    └── (planning artifacts as above)
```

**Structure Decision**: Single-project SPA. All feature code lives under the existing `src/` tree following the established conventions:

- **Screen components** go in `src/components/screens/`
- **Data modules** (static dictionaries) go in `src/data/`
- **Tests** go in a new `tests/` tree mirroring `src/` (this is the first test suite in the repo, so `tests/` is created fresh).

No new folders beyond `tests/keyboard/`. No packages, no workspaces, no backend changes.

## Integration Points

1. **`src/App.tsx`**
   - Add `const [keyboardOpen, setKeyboardOpen] = useState(false);`
   - Pass `onKeyboard={() => setKeyboardOpen(true)}` into `<Header />`
   - Render `<React.Suspense fallback={null}><KeyboardScreen open={keyboardOpen} onClose={() => setKeyboardOpen(false)} /></React.Suspense>` after the main content
   - `KeyboardScreen` is imported via `React.lazy(() => import('./components/screens/KeyboardScreen'))` for code-splitting
   - **No change** to `NavigationState`, `breadcrumbIds`, or any existing handlers

2. **`src/components/Header.tsx`**
   - Add `onKeyboard: () => void` to `HeaderProps`
   - Add a `<button>` inside the left cluster (right after the Home button) using the `Keyboard` icon from `lucide-react`, matching the existing ~70×70 styling of the Home and Back buttons
   - Accessible label driven by `useTranslation().t('keyboard')` with an English fallback

3. **`src/hooks/useTranslation.ts` + `src/data/translations/*`**
   - Add new translation keys: `keyboard` (button label / overlay title), `space`, `backspace`, `clear`, `show`, `close`, `switchLanguage`
   - Provide values for all four languages (en, he, ar, ru)

4. **`src/data/alphabets.ts`** (NEW)
   - Exports `alphabets: Record<Language, string[]>` with canonical alphabetical orderings
   - Exports `alphabetGridColumns: Record<Language, number>` so each language gets a column count that yields a balanced, scroll-free layout

5. **`src/components/screens/KeyboardScreen.tsx`** (NEW)
   - Props: `{ open: boolean; onClose: () => void }`
   - Internal state: `message: string`, `keyboardLanguage: Language`, `takeoverOpen: boolean`
   - Resets `message` and `takeoverOpen` when `open` transitions from `true` to `false`
   - Initializes `keyboardLanguage` from `useLanguage().language` on open
   - Renders nothing when `open === false` (so `React.lazy` + `Suspense` works cleanly and it is not in the tree until needed)

## Non-Goals

To keep scope tight and satisfy the "every change should impact as little code as possible" rule:

- **No text-to-speech.** Explicitly deferred (C-002). No Web Speech API usage.
- **No persistence of messages.** Typed messages never touch localStorage, Supabase, or Recent Items (C-003).
- **No predictive text, autocomplete, word row, or emoji.** FR-014 explicitly excludes them.
- **No QWERTY layout.** Alphabetical only (FR-002).
- **No numbers or punctuation keys.** C-001 forbids them.
- **No reorganizing existing screens.** The existing HomeScreen, CategoryScreen, ConfigScreen, ActionBar, and Recent Items stay exactly as they are (C-007).
- **No adding more app languages.** The feature supports exactly the four languages already in `Language` (en/he/ar/ru). Extending to a fifth language is a separate change that only needs to add an entry to `alphabets.ts`.
- **No Playwright e2e in this feature.** Manual quickstart walkthrough covers e2e; Playwright setup is a separate project-level initiative.
- **No new state management library.** React local state only.
- **No accessibility overhaul of existing components.** Only the new keyboard components are held to a11y gates in this feature.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

No violations. This section intentionally left empty.

## Post-Design Constitution Re-Check

After completing Phase 1 (data-model + contracts + quickstart), re-evaluate:

- **TEST_FIRST** — unchanged, still pass. Test files are listed first in the WP ordering intended for `tasks.md`.
- **Performance targets** — unchanged. `React.lazy` code split confirmed. No extra runtime dependencies were pulled in during design.
- **Accessibility gates** — unchanged. Data model confirms alphabet sizes fit 64×64 targets on the minimum tablet width.
- **Patient data sensitivity** — unchanged. Data model explicitly documents that Typed Message never leaves component memory.

**Post-design Constitution Check result: PASS.** Ready for `/spec-kitty.tasks`.
