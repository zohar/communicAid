---
work_package_id: WP03
title: KeyboardScreen Core
lane: "done"
dependencies:
- WP02
- WP01
requirement_refs:
- C-002
- C-003
- C-004
- C-005
- FR-002
- FR-003
- FR-004
- FR-005
- FR-006
- FR-007
- FR-014
- FR-018
- FR-021
- NFR-001
- NFR-003
- NFR-004
- NFR-006
planning_base_branch: keyboard
merge_target_branch: keyboard
branch_strategy: Planning artifacts for this feature were generated on keyboard. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into keyboard unless the human explicitly redirects the landing branch.
base_branch: 002-on-screen-alphabet-keyboard-WP03-merge-base
base_commit: 8c4b06ba74c31c83c5be8a51a9ab718e373fe73b
created_at: '2026-04-14T14:24:32.395925+00:00'
subtasks:
- T009
- T010
- T011
- T012
- T016
phase: Phase 2 - Core Component
assignee: ''
agent: claude-opus-4-6
shell_pid: '24778'
review_status: "approved"
reviewed_by: "Zohar Stolar"
review_feedback: ''
history:
- timestamp: '2026-04-14T14:01:38Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP03 – KeyboardScreen Core

## Branch Strategy

- **Planning/base branch at prompt creation**: `keyboard`
- **Final merge target for completed work**: `keyboard`
- **Actual worktree base may differ later**: `/spec-kitty.implement` populates frontmatter `base_branch` when the worktree is created. For stacked WPs it may point at another WP branch, but the final merge target remains `keyboard` unless the human explicitly changes the landing branch.
- **If human instructions contradict these fields**: stop and resolve the intended landing branch before coding.

**Implementation command (depends on WP02)**: `spec-kitty implement WP03 --base WP02`

---

## Objectives & Success Criteria

Build the `KeyboardScreen` component scaffolding, its internal state, the message display area, the alphabetical letter grid (driven by `alphabets[keyboardLanguage]`), and the core editing controls (Space, Backspace, Clear). Enforce the 200-character maximum. This is the bulk of the MVP view. The Show button, language switcher, and Close/app integration land in WP04.

**This work package is complete when**:

1. `src/components/screens/KeyboardScreen.tsx` exists with the props interface `{ open: boolean; onClose: () => void }`.
2. Internal state: `message: string`, `keyboardLanguage: Language`, `takeoverOpen: boolean`.
3. When `open === false`, the component returns `null` and no DOM is rendered.
4. When `open === true`, the component renders a fullscreen `fixed inset-0 z-50` overlay containing the message display and the letter grid with Space/Backspace/Clear controls.
5. Tapping a letter key or the space key appends the character to `message` unless `message.length >= 200`.
6. Tapping Backspace removes the last character of `message` (no-op when empty).
7. Tapping Clear sets `message` to `''`.
8. The grid is rendered from `alphabets[keyboardLanguage]` with column count `alphabetGridColumns[keyboardLanguage]` and the container uses `dir={languageConfigs[keyboardLanguage].dir}`.
9. Every interactive key has an accessible name, `role="dialog"` + `aria-modal="true"` on the overlay root, `aria-live="polite"` on the message display.
10. `npm run typecheck` and `npm run lint` exit 0. Tests are added in WP05.
11. **No** console logging of `message` content. **No** `localStorage`/`fetch` references.

## Context & Constraints

- **Plan**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/plan.md`
- **Contracts**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/contracts/keyboard-component.md`
- **Data model**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/data-model.md`
- **Research**: sections R-001, R-004, R-005, R-010 in `research.md`
- **Existing primitives to match**: `src/components/CategoryTile.tsx`, `src/components/ItemButton.tsx` (for button styling), `src/components/Header.tsx` (for the 70×70 button pattern), `src/hooks/useLanguage.ts` (for reading the app language), `src/hooks/useTranslation.ts` (for the `t` function), `src/data/translations/` (for `languageConfigs` and direction info).

## Subtasks & Detailed Guidance

### Subtask T009 – Component scaffolding, props, internal state, reset-on-close

- **Purpose**: Set up the file structure, the prop interface, the three pieces of internal state, and the effect that resets state when the overlay closes.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/src/components/screens/KeyboardScreen.tsx`.
  2. Skeleton:
     ```tsx
     import { useEffect, useState } from 'react';
     import type { Language } from '../../types';
     import { useLanguage } from '../../hooks/useLanguage';
     import { useTranslation } from '../../hooks/useTranslation';
     import { alphabets, alphabetGridColumns } from '../../data/alphabets';
     // import { languageConfigs } from '../../data/translations';  // adjust to actual export path

     interface KeyboardScreenProps {
       open: boolean;
       onClose: () => void;
     }

     const MAX_LENGTH = 200;

     export default function KeyboardScreen({ open, onClose }: KeyboardScreenProps) {
       const { language: appLanguage } = useLanguage();
       const { t } = useTranslation();

       const [message, setMessage] = useState<string>('');
       const [keyboardLanguage, setKeyboardLanguage] = useState<Language>(appLanguage);
       const [takeoverOpen, setTakeoverOpen] = useState<boolean>(false);

       // Reset all local state when the overlay closes.
       useEffect(() => {
         if (!open) {
           setMessage('');
           setKeyboardLanguage(appLanguage);
           setTakeoverOpen(false);
         }
       }, [open, appLanguage]);

       if (!open) return null;

       // ... JSX rendered in T010/T011/T012
       return null; // placeholder, replaced by T010/T011/T012
     }
     ```
  3. Export the component as the **default** export — `React.lazy(() => import('./KeyboardScreen'))` in WP04 depends on this.
  4. Do not add any `console.log` statements. Do not import `localStorage` or `fetch`.
- **Files**: `src/components/screens/KeyboardScreen.tsx` (new)
- **Parallel?**: No.
- **Notes**: The reset effect intentionally reads `appLanguage` so that reopening the keyboard always initializes `keyboardLanguage` to the current app language, matching FR-021. Using `appLanguage` as the reset seed also prevents a stale value if the user switched the app language while the overlay was closed.

### Subtask T010 – Message display region

- **Purpose**: Render the live preview of the typed message above the grid, with the writing direction matching the current keyboard language and an `aria-live` region so screen readers announce updates.
- **Steps**:
  1. Inside the component's JSX (replacing the placeholder return), render a container that holds the message display and, below it, the grid and controls (added in T011/T012).
  2. Layout:
     ```tsx
     // Determine direction from the current keyboard language.
     // If languageConfigs is available, use it; otherwise derive from the Language enum.
     const dir: 'ltr' | 'rtl' =
       keyboardLanguage === 'he' || keyboardLanguage === 'ar' ? 'rtl' : 'ltr';

     return (
       <div
         role="dialog"
         aria-modal="true"
         aria-label={t('keyboard')}
         className="fixed inset-0 z-50 bg-slate-200 flex flex-col p-6 gap-4"
         dir={dir}
       >
         {/* Top row: title and close will go here in WP04 */}

         <div
           aria-live="polite"
           aria-atomic="true"
           className="bg-white border-4 border-slate-400 rounded-2xl p-6 min-h-[6rem] text-5xl font-bold break-words"
           dir={dir}
           lang={keyboardLanguage}
         >
           {message || '\u00A0' /* nbsp so the box keeps its height when empty */}
         </div>

         {/* Grid (T011) and controls (T012) go here */}
       </div>
     );
     ```
  3. Use Tailwind classes consistent with the rest of the app (slate/white palette, bold 4px borders, large text).
- **Files**: `src/components/screens/KeyboardScreen.tsx` (modified)
- **Parallel?**: Yes — T010 / T011 / T012 can be authored in the same session without collision if you write them in order inside the same JSX return.
- **Notes**: Do not render the typed `message` inside any element that wraps it in a prop whose value might be logged (e.g., no `title={message}` — that leaks content into the accessibility tree unnecessarily and into error boundaries). Keep it as a text child only.

### Subtask T011 – Letter grid from `alphabets[keyboardLanguage]`

- **Purpose**: Render the alphabetical letter grid for the current keyboard language using the column counts from `alphabetGridColumns`.
- **Steps**:
  1. Below the message display, render the grid:
     ```tsx
     const letters = alphabets[keyboardLanguage];
     const columns = alphabetGridColumns[keyboardLanguage];

     const handleKeyPress = (char: string) => {
       setMessage((prev) => (prev.length >= MAX_LENGTH ? prev : prev + char));
     };

     return (
       <div /* ... */>
         {/* ...message display... */}

         <div
           className="grid gap-3 flex-1"
           style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
           dir={dir}
         >
           {letters.map((letter) => (
             <button
               key={letter}
               type="button"
               onClick={() => handleKeyPress(letter)}
               className="bg-white hover:bg-slate-100 active:bg-slate-200 border-4 border-slate-400 rounded-2xl shadow-md text-5xl font-bold min-w-[64px] min-h-[64px] flex items-center justify-center transition-colors"
               aria-label={letter}
               lang={keyboardLanguage}
             >
               {letter}
             </button>
           ))}
         </div>

         {/* ...controls row (T012)... */}
       </div>
     );
     ```
  2. Use `style={{ gridTemplateColumns }}` rather than Tailwind's fixed `grid-cols-*` utilities, because the column count is dynamic per language.
  3. The `flex-1` on the grid container gives it the vertical space remaining after the message display and controls.
- **Files**: `src/components/screens/KeyboardScreen.tsx` (modified)
- **Parallel?**: Yes with T010/T012.
- **Notes**: `aria-label={letter}` is redundant when the letter is also the visible text — some linters will flag it. If that happens, remove the `aria-label` and rely on the visible text as the accessible name. The important accessibility requirement is that each button has a non-empty accessible name.

### Subtask T012 – Control row: Space, Backspace, Clear

- **Purpose**: The three core editing controls. Show and Close are added in WP04.
- **Steps**:
  1. Add a controls row below the grid (or as a second row at the bottom of the overlay — tune spacing for landscape tablet):
     ```tsx
     import { Delete, RotateCcw } from 'lucide-react';

     const handleBackspace = () => {
       setMessage((prev) => prev.slice(0, -1));
     };

     const handleClear = () => {
       setMessage('');
       setTakeoverOpen(false);
     };

     // ...inside JSX, after the grid div:
     <div className="flex gap-3 items-stretch" dir={dir}>
       <button
         type="button"
         onClick={() => handleKeyPress(' ')}
         className="flex-1 bg-white hover:bg-slate-100 active:bg-slate-200 border-4 border-slate-400 rounded-2xl shadow-md text-3xl font-bold min-h-[80px] flex items-center justify-center"
         aria-label={t('space')}
       >
         {t('space')}
       </button>
       <button
         type="button"
         onClick={handleBackspace}
         className="bg-white hover:bg-slate-100 active:bg-slate-200 border-4 border-slate-400 rounded-2xl shadow-md min-w-[120px] min-h-[80px] flex items-center justify-center"
         aria-label={t('backspace')}
       >
         <Delete size={40} />
       </button>
       <button
         type="button"
         onClick={handleClear}
         className="bg-white hover:bg-slate-100 active:bg-slate-200 border-4 border-slate-400 rounded-2xl shadow-md min-w-[120px] min-h-[80px] flex items-center justify-center"
         aria-label={t('clear')}
       >
         <RotateCcw size={40} />
       </button>
     </div>
     ```
  2. Backspace on an empty string is a natural no-op because `''.slice(0, -1) === ''`; do not add a conditional.
  3. Clear also closes any open takeover (T013 will rely on this).
- **Files**: `src/components/screens/KeyboardScreen.tsx` (modified); no new imports beyond `lucide-react` which is already a project dependency.
- **Parallel?**: Yes with T010/T011.
- **Notes**: Use the same visual styling as the letter keys so the controls feel like part of the same grid. Space is widest, Backspace and Clear are equal-width icon buttons.

### Subtask T016 – 200-character maximum enforcement

- **Purpose**: Prevent runaway input from breaking the message display layout or the upcoming large-text takeover.
- **Steps**:
  1. Confirm that `handleKeyPress` (introduced in T011) already includes the max-length check:
     ```typescript
     const handleKeyPress = (char: string) => {
       setMessage((prev) => (prev.length >= MAX_LENGTH ? prev : prev + char));
     };
     ```
  2. Verify that space-key presses also go through `handleKeyPress(' ')` and therefore respect the limit.
  3. Do **not** enforce the limit by disabling keys (the keys must remain visible and tappable); the handler just silently no-ops.
  4. Backspace and Clear must continue to work regardless of length.
- **Files**: `src/components/screens/KeyboardScreen.tsx` (verification — no new code if T011 was written per this prompt)
- **Parallel?**: No — depends on T011/T012 being in place.
- **Notes**: This is a cheap invariant that WP05's tests will validate. The constant `MAX_LENGTH = 200` lives at the top of the component file as a module-level constant, not inside the component body.

## Risks & Mitigations

- **`languageConfigs` export path mismatch**: If importing from `src/data/translations` fails, derive direction inline from the `Language` union (`he`/`ar` are RTL). The derivation is authoritative enough for this feature.
- **Grid keys too small for Russian on narrow viewports**: Measure at 1024 px landscape. If a key falls below 64×64, lower the column count by one (e.g., `ru: 7` producing 5 rows × 7 = 35 cells with 2 empty slots, or use 6 columns). This is a last-resort tuning knob; prefer the values in `data-model.md` first.
- **Tailwind JIT doesn't pick up dynamic `gridTemplateColumns`**: We deliberately use an inline `style` attribute rather than `grid-cols-${n}` exactly to avoid this. Do not switch to Tailwind class interpolation.
- **Accidental message leakage via `title` or `aria-describedby`**: Only put `message` inside visible text nodes of the message display. No other element should reference it.

## Review Guidance

The reviewer for WP03 must verify:

1. `KeyboardScreen.tsx` exists and default-exports the component.
2. When `open === false`, the component renders nothing (no DOM nodes).
3. When `open === true`, the overlay covers the viewport, has `role="dialog"` and `aria-modal="true"`, and displays an empty message box plus a letter grid.
4. Tapping a letter in the grid appends it to the message display.
5. Space, Backspace, and Clear work as specified.
6. The grid uses the correct column count per language (verify by manually toggling `keyboardLanguage` in DevTools during a dev run or by visual inspection for at least one language).
7. `npm run typecheck` and `npm run lint` exit 0.
8. No `console.*` calls reference `message`.
9. No `localStorage`, `sessionStorage`, `fetch`, or `XMLHttpRequest` usage inside the file.
10. The `dir` attribute on the overlay and message display updates when `keyboardLanguage` changes.

## Activity Log

- 2026-04-14T14:01:38Z – system – lane=planned – Prompt created.
- 2026-04-14T14:24:33Z – claude-opus-4-6 – shell_pid=24778 – lane=doing – Assigned agent via workflow command
- 2026-04-14T14:27:32Z – claude-opus-4-6 – shell_pid=24778 – lane=for_review – Ready for review: KeyboardScreen core with grid, message display, Space/Backspace/Clear, Close. Deviation: dropped open:boolean prop in favor of parent-controlled conditional mount to avoid react-hooks/set-state-in-effect. WP04 parent wiring will conditionally render. typecheck/lint/tests all green.
- 2026-04-15T07:25:58Z – claude-opus-4-6 – shell_pid=24778 – lane=approved – User directed to skip review and merge. KeyboardScreen core per contract (with documented open-prop deviation).
- 2026-04-15T07:29:36Z – claude-opus-4-6 – shell_pid=24778 – lane=done – Merged into keyboard via merge commit a82fa8d
