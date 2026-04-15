---
work_package_id: WP04
title: Show Takeover, Language Switcher, and App Integration
lane: "done"
dependencies: [WP03]
requirement_refs:
- C-002
- C-007
- FR-001
- FR-008
- FR-009
- FR-010
- FR-011
- FR-012
- FR-013
- FR-015
- FR-016
- FR-017
- FR-018
- FR-019
- FR-020
- FR-021
- NFR-002
- NFR-007
planning_base_branch: keyboard
merge_target_branch: keyboard
branch_strategy: Planning artifacts for this feature were generated on keyboard. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into keyboard unless the human explicitly redirects the landing branch.
base_branch: 002-on-screen-alphabet-keyboard-WP03
base_commit: 4a8d142b90d3da737fa183e15d8cc4a767f76628
created_at: '2026-04-14T19:34:17.838277+00:00'
subtasks:
- T013
- T014
- T015
- T017
- T018
phase: Phase 2 - Core Component
assignee: ''
agent: claude-opus-4-6
shell_pid: '27479'
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

# Work Package Prompt: WP04 – Show Takeover, Language Switcher, and App Integration

## Branch Strategy

- **Planning/base branch at prompt creation**: `keyboard`
- **Final merge target for completed work**: `keyboard`
- **Actual worktree base may differ later**: `/spec-kitty.implement` populates frontmatter `base_branch` when the worktree is created. For stacked WPs it may point at another WP branch, but the final merge target remains `keyboard` unless the human explicitly changes the landing branch.
- **If human instructions contradict these fields**: stop and resolve the intended landing branch before coding.

**Implementation command (depends on WP03)**: `spec-kitty implement WP04 --base WP03`

---

## Objectives & Success Criteria

Complete the `KeyboardScreen` by adding the Show button with its large-text fullscreen takeover, the in-keyboard language switcher, and the Close control. Then wire the keyboard into the rest of the app: add a keyboard button to `Header.tsx` and mount the (lazy-loaded) `KeyboardScreen` in `App.tsx`. After this WP the feature is user-visible and usable end-to-end.

**This work package is complete when**:

1. `KeyboardScreen` renders a Show button that is visibly disabled when `message === ''` and opens a large-text fullscreen takeover when `message.length > 0`.
2. The takeover can be dismissed by tapping it or by tapping an explicit in-takeover Close control. Dismissing preserves `message`.
3. The takeover cannot be dismissed by the same touch/click that opened it (see R-007).
4. `KeyboardScreen` renders an in-keyboard language switcher that lists the currently configured languages; picking one swaps `keyboardLanguage` without clearing `message`. The switcher is hidden when only one language is configured.
5. `KeyboardScreen` renders a Close button that calls `onClose()`.
6. `Header.tsx` renders a new Keyboard button immediately after the Home button, styled consistently.
7. `App.tsx` has `keyboardOpen` state, passes `onKeyboard` to `<Header />`, and lazy-loads `KeyboardScreen` via `React.lazy` inside `<Suspense fallback={null}>`.
8. `NavigationState` and `breadcrumbIds` in `App.tsx` are **unchanged**.
9. `npm run typecheck` and `npm run lint` exit 0.
10. Running `npm run dev` and manually tapping the keyboard button from any screen opens the overlay. Typing and Showing a message produces a large-text takeover that dismisses on tap. Closing the overlay returns to the previous screen.

## Context & Constraints

- **Plan**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/plan.md`
- **Contracts**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/contracts/keyboard-component.md`
- **Research**: sections R-001, R-006, R-007, R-009 in `research.md`
- **Existing code**: `src/App.tsx`, `src/components/Header.tsx`, `src/hooks/useLanguage.ts`
- **WP03 delivered**: `src/components/screens/KeyboardScreen.tsx` with state, grid, message display, Space/Backspace/Clear.

## Subtasks & Detailed Guidance

### Subtask T013 – Show button and large-text fullscreen takeover

- **Purpose**: Let the patient present the typed message as very large text for a caregiver to read at a glance.
- **Steps**:
  1. Add a Show button to the controls row in `KeyboardScreen.tsx`:
     ```tsx
     import { Eye } from 'lucide-react';

     const handleShow = () => {
       if (message.length === 0) return;
       // Open the takeover on the next frame so the same touch that opened
       // it cannot also dismiss it (see research R-007).
       requestAnimationFrame(() => setTakeoverOpen(true));
     };

     // ...inside the controls row, after Clear:
     <button
       type="button"
       onClick={handleShow}
       disabled={message.length === 0}
       aria-disabled={message.length === 0}
       className="bg-green-500 hover:bg-green-400 active:bg-green-600 border-4 border-green-700 rounded-2xl shadow-md text-3xl font-bold text-white min-w-[160px] min-h-[80px] flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:border-slate-500 disabled:text-slate-200 disabled:cursor-not-allowed"
       aria-label={t('show')}
     >
       <Eye size={36} />
       <span>{t('show')}</span>
     </button>
     ```
  2. Add the takeover sub-element, rendered conditionally when `takeoverOpen`:
     ```tsx
     import { X } from 'lucide-react';

     // ...near the bottom of the JSX, as a sibling of the main overlay content:
     {takeoverOpen && (
       <div
         className="fixed inset-0 z-[60] bg-white flex items-center justify-center p-8 cursor-pointer"
         onClick={() => setTakeoverOpen(false)}
         role="dialog"
         aria-modal="true"
         aria-label={t('show')}
       >
         <p
           className="font-bold text-center break-words"
           style={{ fontSize: 'clamp(4rem, 12vw, 16rem)', lineHeight: 1.1 }}
           dir={dir}
           lang={keyboardLanguage}
         >
           {message}
         </p>
         <button
           type="button"
           onClick={(e) => {
             e.stopPropagation();
             setTakeoverOpen(false);
           }}
           className="fixed top-6 end-6 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-xl p-4 min-w-[70px] min-h-[70px] flex items-center justify-center shadow-lg"
           aria-label={t('close')}
         >
           <X size={32} />
         </button>
       </div>
     )}
     ```
  3. Contrast check for disabled style: `text-slate-200` on `bg-slate-400` is insufficient contrast; use `text-slate-300` on `bg-slate-500` or adjust until WCAG AA passes. The quickstart step in WP06 will catch this; choose something defensibly accessible on first pass.
- **Files**: `src/components/screens/KeyboardScreen.tsx` (modified)
- **Parallel?**: Yes with T014.
- **Notes**: The `requestAnimationFrame` wrapper is the dismissal safety net (R-007). Without it, the same pointerup that triggered Show can be interpreted as a click on the takeover background and immediately dismiss it.

### Subtask T014 – In-keyboard language switcher

- **Purpose**: Let bilingual patients swap the grid to another language without leaving the overlay and without losing typed text.
- **Steps**:
  1. Determine the list of configured languages. For this release the list is all four values of `Language`; derive it from a constant:
     ```typescript
     import type { Language } from '../../types';

     const CONFIGURED_LANGUAGES: Language[] = ['en', 'he', 'ar', 'ru'];

     const LANGUAGE_NAMES: Record<Language, string> = {
       en: 'English',
       he: 'עברית',
       ar: 'العربية',
       ru: 'Русский',
     };
     ```
     Put these at the top of the file, outside the component. (If `languageConfigs` already exports names, reuse those instead and delete `LANGUAGE_NAMES`.)
  2. Render a switcher in the top bar of the overlay (above the message display), but only if `CONFIGURED_LANGUAGES.length > 1`:
     ```tsx
     import { Globe } from 'lucide-react';
     const [switcherOpen, setSwitcherOpen] = useState(false);

     // ...inside the overlay, before the message display:
     <div className="flex items-center justify-between gap-3" dir={dir}>
       <h2 className="text-3xl font-bold text-slate-800">{t('keyboard')}</h2>

       {CONFIGURED_LANGUAGES.length > 1 && (
         <div className="relative">
           <button
             type="button"
             onClick={() => setSwitcherOpen((v) => !v)}
             className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-5 py-4 min-h-[64px] flex items-center gap-2 shadow-md text-2xl font-bold"
             aria-label={t('switchLanguage')}
             aria-haspopup="listbox"
             aria-expanded={switcherOpen}
           >
             <Globe size={28} />
             <span>{LANGUAGE_NAMES[keyboardLanguage]}</span>
           </button>

           {switcherOpen && (
             <ul
               role="listbox"
               className="absolute top-full end-0 mt-2 bg-white border-4 border-slate-400 rounded-2xl shadow-xl z-[55] min-w-[200px] overflow-hidden"
             >
               {CONFIGURED_LANGUAGES.map((lang) => (
                 <li key={lang}>
                   <button
                     type="button"
                     onClick={() => {
                       setKeyboardLanguage(lang);
                       setSwitcherOpen(false);
                     }}
                     className={`w-full text-start px-5 py-4 text-2xl font-bold min-h-[64px] ${
                       lang === keyboardLanguage
                         ? 'bg-slate-200'
                         : 'bg-white hover:bg-slate-100'
                     }`}
                     aria-selected={lang === keyboardLanguage}
                     role="option"
                   >
                     {LANGUAGE_NAMES[lang]}
                   </button>
                 </li>
               ))}
             </ul>
           )}
         </div>
       )}

       {/* Close button lives in T015, same row */}
     </div>
     ```
  3. Swapping `keyboardLanguage` must **not** clear `message`. Verify by hand.
  4. Also close the switcher dropdown when it loses focus or when the user picks any option — a simple effect or onBlur is enough.
- **Files**: `src/components/screens/KeyboardScreen.tsx` (modified)
- **Parallel?**: Yes with T013.
- **Notes**: Using an `absolute` dropdown anchored to the switcher button keeps the implementation simple. A more elaborate menu (`@headlessui/react`'s `Menu`) would require a new dependency and is out of scope.

### Subtask T015 – Close button and focus management

- **Purpose**: Give the patient a visible way to leave the overlay, and make the overlay assistive-tech friendly.
- **Steps**:
  1. Add a Close button to the top row (alongside the title and switcher from T014):
     ```tsx
     <button
       type="button"
       onClick={onClose}
       className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-xl p-4 min-w-[70px] min-h-[70px] flex items-center justify-center shadow-md"
       aria-label={t('close')}
     >
       <X size={32} />
     </button>
     ```
     Place this at the opposite end of the top row from the title.
  2. Add a ref to the overlay root and move focus to it on open:
     ```tsx
     import { useRef } from 'react';
     const overlayRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
       if (open) {
         overlayRef.current?.focus();
       }
     }, [open]);
     ```
     Add `ref={overlayRef}` and `tabIndex={-1}` to the overlay root `<div>`.
  3. Full focus trap is **not** required in this WP. Lighthouse will flag it if it matters; WP06 will address any findings.
- **Files**: `src/components/screens/KeyboardScreen.tsx` (modified)
- **Parallel?**: No — depends on T013/T014 layout decisions for the top row.
- **Notes**: The Close button calls `props.onClose()`. The parent (`App.tsx`, wired in T018) is responsible for flipping its own `keyboardOpen` state to `false`.

### Subtask T017 – Header: add keyboard button next to Home

- **Purpose**: Give the patient a visible entry point to the keyboard from any screen.
- **Steps**:
  1. Open `src/components/Header.tsx`.
  2. Add `onKeyboard: () => void` to `HeaderProps`:
     ```tsx
     interface HeaderProps {
       title: string;
       onBack?: () => void;
       onHome: () => void;
       onSettings: () => void;
       onKeyboard: () => void;
     }
     ```
  3. Destructure the new prop and import the `Keyboard` icon:
     ```tsx
     import { Home, ArrowLeft, ArrowRight, Settings, Keyboard as KeyboardIcon } from 'lucide-react';
     // ...
     export function Header({ title, onBack, onHome, onSettings, onKeyboard }: HeaderProps) {
     ```
  4. Insert the new button immediately after the Home button, inside the left cluster:
     ```tsx
     <button
       onClick={onKeyboard}
       className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 p-4 rounded-xl flex items-center justify-center transition-all shadow-md min-w-[70px] min-h-[70px]"
       aria-label={t('keyboard')}
     >
       <KeyboardIcon size={32} />
     </button>
     ```
     `t` comes from `useTranslation()`; if `Header.tsx` does not already call `useTranslation`, import it and add a line. Do not hardcode "Keyboard" as a fallback — the translation key is defined in WP02 for all four languages.
  5. Preserve the existing styling, title, clock, and Settings button exactly.
- **Files**: `src/components/Header.tsx` (modified)
- **Parallel?**: No — pair with T018 since the two are tightly coupled.
- **Notes**: The import rename `Keyboard as KeyboardIcon` avoids a name collision with the existing `KeyboardScreen` import in case both land in the same file in a future refactor.

### Subtask T018 – `App.tsx`: keyboardOpen state + lazy KeyboardScreen mount

- **Purpose**: Own the boolean that drives the overlay, and lazy-load the keyboard component so its bundle doesn't affect initial FCP.
- **Steps**:
  1. Open `src/App.tsx`.
  2. Add the lazy import near the top, alongside the other screen imports:
     ```tsx
     import { lazy, Suspense, useState } from 'react';
     // ...
     const KeyboardScreen = lazy(() => import('./components/screens/KeyboardScreen'));
     ```
     If `useState` is already imported from `react`, just add `lazy` and `Suspense`.
  3. Inside the `App` function, add the keyboard state and handler:
     ```tsx
     const [keyboardOpen, setKeyboardOpen] = useState<boolean>(false);
     const handleKeyboard = () => setKeyboardOpen(true);
     const handleKeyboardClose = () => setKeyboardOpen(false);
     ```
  4. Pass the handler into `<Header />`:
     ```tsx
     <Header
       title={currentTitle}
       onBack={navigation.breadcrumbIds.length > 1 ? handleBack : undefined}
       onHome={handleHome}
       onSettings={handleSettings}
       onKeyboard={handleKeyboard}
     />
     ```
  5. Render the lazy-loaded keyboard overlay at the end of the root `<div>`, after `<RecentItems />`:
     ```tsx
     <Suspense fallback={null}>
       <KeyboardScreen open={keyboardOpen} onClose={handleKeyboardClose} />
     </Suspense>
     ```
  6. Do **not** change anything else in `App.tsx`. Do not touch `NavigationState`, `breadcrumbIds`, `handleBack`, `handleHome`, `handleSettings`, `handleItemTap`, `selectedMessage`, or the existing screens.
- **Files**: `src/App.tsx` (modified)
- **Parallel?**: No — pair with T017.
- **Notes**: Because `KeyboardScreen` returns `null` when `open === false`, the Suspense boundary will only have to actually load the chunk the first time the user taps the keyboard button. Subsequent opens are instantaneous.

## Risks & Mitigations

- **Takeover dismisses immediately on the same tap that opened it**: Addressed by the `requestAnimationFrame` wrapper in T013. If it still happens, wrap in a short `setTimeout(..., 50)` instead.
- **Language switcher covered by grid due to `z-index` stacking**: The dropdown uses `z-[55]` which sits above the grid (`z-50` on the overlay). Verify in a dev run.
- **Focus management pulls focus away from the dev inspector during hot reload**: This is a dev-only annoyance, not a user-facing issue. Do not weaken the `.focus()` call for DX.
- **Code-split chunk not produced**: Verify in WP06 by inspecting `dist/assets/`. If Vite inlines it, ensure the dynamic import uses a string literal path (it does in T018).
- **Header layout overflow on smaller tablets**: If the three-button left cluster plus centered title plus right cluster wraps, consider making the title element shrink (`truncate` + `min-w-0`). This is a tuning concern, not a structural one.

## Review Guidance

The reviewer for WP04 must verify:

1. The Header now shows a third left-cluster button (Keyboard) on every screen.
2. Tapping the Keyboard button from home, a category, or config opens the overlay.
3. The overlay shows a title, language switcher (with 4 options), and a Close button in its top row, plus the message display, grid, and controls from WP03.
4. Typing a message and tapping Show displays a fullscreen very-large-text takeover. Tapping the takeover (or its Close button) dismisses it and the keyboard message area still shows the typed text.
5. The language switcher swaps the grid to each of the four languages; typed text is preserved across switches.
6. Tapping Close (or the Home button in the header) closes the overlay and returns to the previous screen.
7. `App.tsx` has not changed `NavigationState` or `breadcrumbIds`; `git diff` shows only the additive changes described above.
8. `npm run typecheck` and `npm run lint` exit 0.
9. A fresh `npm run build` produces a separate chunk containing `KeyboardScreen` in `dist/assets/` (exact size verification lives in WP06).

## Activity Log

- 2026-04-14T14:01:38Z – system – lane=planned – Prompt created.
- 2026-04-14T19:34:18Z – claude-opus-4-6 – shell_pid=27479 – lane=doing – Assigned agent via workflow command
- 2026-04-15T07:04:03Z – claude-opus-4-6 – shell_pid=27479 – lane=for_review – Ready for review: Show+takeover, switcher, Header button, App.tsx lazy mount. KeyboardScreen chunk is 2.22 kB gzipped (target <=20 kB). All gates green.
- 2026-04-15T07:25:59Z – claude-opus-4-6 – shell_pid=27479 – lane=approved – User directed to skip review and merge. Show takeover, switcher, Header+App integration all wired.
- 2026-04-15T07:29:37Z – claude-opus-4-6 – shell_pid=27479 – lane=done – Merged into keyboard via merge commit a82fa8d
