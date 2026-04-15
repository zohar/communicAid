---
work_package_id: WP05
title: KeyboardScreen Component Tests
lane: "doing"
dependencies: [WP04]
requirement_refs:
- C-003
- C-004
- C-005
- FR-001
- FR-002
- FR-004
- FR-005
- FR-006
- FR-007
- FR-008
- FR-009
- FR-010
- FR-011
- FR-013
- FR-015
- FR-016
- FR-017
- FR-019
- FR-020
- FR-021
planning_base_branch: keyboard
merge_target_branch: keyboard
branch_strategy: Planning artifacts for this feature were generated on keyboard. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into keyboard unless the human explicitly redirects the landing branch.
base_branch: 002-on-screen-alphabet-keyboard-WP04
base_commit: d20f7a978a2495d049f1e14609f18f03f68c44cb
created_at: '2026-04-15T07:04:35.026285+00:00'
subtasks:
- T019
- T020
- T021
- T022
- T023
phase: Phase 3 - Tests
assignee: ''
agent: "claude-opus-4-6"
shell_pid: "31555"
review_status: ''
reviewed_by: ''
review_feedback: ''
history:
- timestamp: '2026-04-14T14:01:38Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP05 – KeyboardScreen Component Tests

## Branch Strategy

- **Planning/base branch at prompt creation**: `keyboard`
- **Final merge target for completed work**: `keyboard`
- **Actual worktree base may differ later**: `/spec-kitty.implement` populates frontmatter `base_branch` when the worktree is created. For stacked WPs it may point at another WP branch, but the final merge target remains `keyboard` unless the human explicitly changes the landing branch.
- **If human instructions contradict these fields**: stop and resolve the intended landing branch before coding.

**Implementation command (depends on WP04)**: `spec-kitty implement WP05 --base WP04`

---

## Objectives & Success Criteria

Add Vitest + React Testing Library component tests that cover every user story and every functional requirement for the keyboard feature. This is the feature's authoritative regression suite.

**This work package is complete when**:

1. `tests/keyboard/KeyboardScreen.test.tsx` exists and includes test blocks for User Stories 1–4 and all relevant edge cases.
2. `tests/keyboard/Header.test.tsx` exists and verifies the new keyboard button wiring.
3. `npm run test:run` passes with all new tests green.
4. Tests assert the privacy constraints: `console.*` is not called with the message content, `localStorage`, `sessionStorage`, `fetch`, and `XMLHttpRequest` are never touched from within `KeyboardScreen`.
5. `npm run typecheck` and `npm run lint` exit 0.

## Context & Constraints

- **Plan**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/plan.md`
- **Spec**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/spec.md`
- **Research**: section R-008 in `research.md`
- **Component under test**: `src/components/screens/KeyboardScreen.tsx` (default export)
- **Header under test**: `src/components/Header.tsx`
- **RTL API**: use `@testing-library/react` and `@testing-library/user-event` v14+ with `userEvent.setup()` pattern.

**Do NOT**:

- Modify `KeyboardScreen.tsx` or `Header.tsx` to make tests easier (unless you find a genuine bug — then fix it in WP03/WP04 style and mention it in the review).
- Use `fireEvent` unless `userEvent` cannot express the interaction.
- Add any production-code helpers or exports solely for tests. Test through the public API.

## Subtasks & Detailed Guidance

### Subtask T019 – User Story 1 tests: type, show, dismiss, preserve

- **Purpose**: Lock in the core happy-path: type a message, show it, dismiss the takeover, message preserved.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/tests/keyboard/KeyboardScreen.test.tsx`.
  2. Set up a helper that mounts the component with `open` controllable via `rerender`:
     ```tsx
     import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
     import { render, screen, within } from '@testing-library/react';
     import userEvent from '@testing-library/user-event';
     import KeyboardScreen from '../../src/components/screens/KeyboardScreen';

     function renderOpen() {
       const onClose = vi.fn();
       const utils = render(<KeyboardScreen open={true} onClose={onClose} />);
       return { ...utils, onClose };
     }
     ```
  3. User Story 1 tests:
     ```tsx
     describe('KeyboardScreen – User Story 1: type and show', () => {
       it('renders an empty message display and a letter grid when opened', () => {
         renderOpen();
         expect(screen.getByRole('dialog', { name: /keyboard/i })).toBeInTheDocument();
         // At least one letter key (English by default if test env language is en)
         expect(screen.getAllByRole('button').length).toBeGreaterThan(10);
       });

       it('tapping letters appends to the message display', async () => {
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: 'W' }));
         await user.click(screen.getByRole('button', { name: 'A' }));
         await user.click(screen.getByRole('button', { name: 'T' }));
         await user.click(screen.getByRole('button', { name: 'E' }));
         await user.click(screen.getByRole('button', { name: 'R' }));
         // The message display is an aria-live region; find it by role or a stable test id.
         expect(screen.getByText('WATER')).toBeInTheDocument();
       });

       it('Show opens a large-text takeover with the typed message', async () => {
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: 'H' }));
         await user.click(screen.getByRole('button', { name: 'I' }));
         await user.click(screen.getByRole('button', { name: /show/i }));
         // Wait for the takeover (opens on next animation frame).
         // Use findBy to wait.
         const takeover = await screen.findByRole('dialog', { name: /show/i });
         expect(within(takeover).getByText('HI')).toBeInTheDocument();
       });

       it('tapping the takeover dismisses it and preserves the typed text', async () => {
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: 'O' }));
         await user.click(screen.getByRole('button', { name: 'K' }));
         await user.click(screen.getByRole('button', { name: /show/i }));
         const takeover = await screen.findByRole('dialog', { name: /show/i });
         await user.click(takeover);
         expect(screen.queryByRole('dialog', { name: /show/i })).not.toBeInTheDocument();
         // Keyboard dialog still present, message preserved
         expect(screen.getByRole('dialog', { name: /keyboard/i })).toBeInTheDocument();
         expect(screen.getByText('OK')).toBeInTheDocument();
       });
     });
     ```
  4. Note: if the message display renders `\u00A0` when empty, `screen.getByText('')` will fail; use a `data-testid="keyboard-message"` on the display element and `screen.getByTestId(...)` for assertions. Add the testid in WP03's file if it is not already there — this is the one exception to "don't modify production code for tests" because it's a read-only attribute with no behavioral impact.
- **Files**: `tests/keyboard/KeyboardScreen.test.tsx` (new)
- **Parallel?**: No (same file as T020/T021/T022).
- **Notes**: The `findByRole` calls are important — the takeover opens on the next animation frame. `findBy*` polls until the element appears, so the test passes without flake.

### Subtask T020 – User Story 2 tests: backspace

- **Purpose**: Lock in FR-006 behavior.
- **Steps**:
  1. Add to the same file (`KeyboardScreen.test.tsx`):
     ```tsx
     describe('KeyboardScreen – User Story 2: backspace', () => {
       it('removes exactly the last character when backspace is tapped', async () => {
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: 'H' }));
         await user.click(screen.getByRole('button', { name: 'E' }));
         await user.click(screen.getByRole('button', { name: 'L' }));
         await user.click(screen.getByRole('button', { name: 'L' }));
         await user.click(screen.getByRole('button', { name: 'X' }));
         await user.click(screen.getByRole('button', { name: /backspace/i }));
         expect(screen.getByText('HELL')).toBeInTheDocument();
         await user.click(screen.getByRole('button', { name: 'O' }));
         expect(screen.getByText('HELLO')).toBeInTheDocument();
       });

       it('backspace on an empty message is a no-op', async () => {
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: /backspace/i }));
         await user.click(screen.getByRole('button', { name: /backspace/i }));
         // Message display still empty; no exceptions thrown.
         // Use the testid approach for the "is empty" assertion.
         const display = screen.getByTestId('keyboard-message');
         expect(display.textContent?.trim()).toBe('');
       });
     });
     ```
- **Files**: `tests/keyboard/KeyboardScreen.test.tsx` (modified)
- **Parallel?**: No.
- **Notes**: If the display element has a `data-testid`, add it in WP03/WP04 production code with value `keyboard-message`. Otherwise switch to `screen.getByLabelText` or `screen.getByRole('status')` depending on how the display's aria is wired.

### Subtask T021 – User Story 3 tests: language switcher preserves text

- **Purpose**: Lock in FR-016/017/019 — switching language preserves already-typed text and updates the grid.
- **Steps**:
  1. Add to the same file:
     ```tsx
     describe('KeyboardScreen – User Story 3: language switcher', () => {
       it('opens a list of configured languages when the switcher is tapped', async () => {
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: /language/i }));
         expect(screen.getByRole('listbox')).toBeInTheDocument();
         // At least English and Hebrew should be options
         expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument();
         expect(screen.getByRole('option', { name: /עברית|hebrew/i })).toBeInTheDocument();
       });

       it('switching language replaces the grid and preserves typed text', async () => {
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: 'H' }));
         await user.click(screen.getByRole('button', { name: 'I' }));
         await user.click(screen.getByRole('button', { name: /language/i }));
         await user.click(screen.getByRole('option', { name: /עברית|hebrew/i }));
         // Hebrew letter א is in the new grid
         expect(screen.getByRole('button', { name: 'א' })).toBeInTheDocument();
         // English letter Q is no longer in the DOM
         expect(screen.queryByRole('button', { name: 'Q' })).not.toBeInTheDocument();
         // Previously typed HI is preserved
         expect(screen.getByTestId('keyboard-message').textContent).toContain('HI');
         // New input appends
         await user.click(screen.getByRole('button', { name: 'א' }));
         expect(screen.getByTestId('keyboard-message').textContent).toContain('HIא');
       });
     });
     ```
- **Files**: `tests/keyboard/KeyboardScreen.test.tsx` (modified)
- **Parallel?**: No.
- **Notes**: The test does not try to verify the writing direction visually — it asserts DOM state. For RTL visual verification, rely on the quickstart manual walkthrough in WP06.

### Subtask T022 – User Story 4 + edge case tests

- **Purpose**: Lock in Clear (FR-007), Show-disabled-on-empty (FR-011, FR-015), reset on close (FR-013), 200-character max.
- **Steps**:
  1. Add to the same file:
     ```tsx
     describe('KeyboardScreen – User Story 4 and edge cases', () => {
       it('clear empties the message', async () => {
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: 'H' }));
         await user.click(screen.getByRole('button', { name: 'I' }));
         await user.click(screen.getByRole('button', { name: /clear/i }));
         expect(screen.getByTestId('keyboard-message').textContent?.trim()).toBe('');
       });

       it('show is disabled when the message is empty', () => {
         renderOpen();
         const showBtn = screen.getByRole('button', { name: /show/i });
         expect(showBtn).toBeDisabled();
       });

       it('show is enabled after typing at least one character', async () => {
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: 'A' }));
         expect(screen.getByRole('button', { name: /show/i })).toBeEnabled();
       });

       it('resets message state when open toggles false -> true', async () => {
         const user = userEvent.setup();
         const onClose = vi.fn();
         const { rerender } = render(<KeyboardScreen open={true} onClose={onClose} />);
         await user.click(screen.getByRole('button', { name: 'Z' }));
         expect(screen.getByTestId('keyboard-message').textContent).toContain('Z');
         rerender(<KeyboardScreen open={false} onClose={onClose} />);
         rerender(<KeyboardScreen open={true} onClose={onClose} />);
         expect(screen.getByTestId('keyboard-message').textContent?.trim()).toBe('');
       });

       it('enforces the 200 character maximum', async () => {
         const user = userEvent.setup();
         renderOpen();
         const a = screen.getByRole('button', { name: 'A' });
         // Tap A 201 times.
         for (let i = 0; i < 201; i++) {
           await user.click(a);
         }
         const display = screen.getByTestId('keyboard-message');
         expect(display.textContent?.length).toBe(200);
       });

       it('does not log message content to console', async () => {
         const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
         const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
         const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
         const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: 'S' }));
         await user.click(screen.getByRole('button', { name: 'E' }));
         await user.click(screen.getByRole('button', { name: 'C' }));
         await user.click(screen.getByRole('button', { name: 'R' }));
         await user.click(screen.getByRole('button', { name: 'E' }));
         await user.click(screen.getByRole('button', { name: 'T' }));
         for (const spy of [logSpy, infoSpy, warnSpy, errSpy]) {
           for (const call of spy.mock.calls) {
             const joined = call.map(String).join(' ');
             expect(joined).not.toContain('SECRET');
           }
         }
       });

       it('does not touch localStorage or fetch', async () => {
         const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
         const fetchSpy = vi.fn();
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (globalThis as any).fetch = fetchSpy;
         const user = userEvent.setup();
         renderOpen();
         await user.click(screen.getByRole('button', { name: 'A' }));
         await user.click(screen.getByRole('button', { name: 'B' }));
         expect(setItemSpy).not.toHaveBeenCalledWith(expect.stringContaining('keyboard'), expect.anything());
         expect(fetchSpy).not.toHaveBeenCalled();
       });
     });

     afterEach(() => {
       vi.restoreAllMocks();
     });
     ```
  2. The `setItem` assertion is narrow (it only forbids writes with keys containing "keyboard"). This is intentional — the `useLanguage` hook legitimately reads/writes its own localStorage key and we don't want to flag that.
- **Files**: `tests/keyboard/KeyboardScreen.test.tsx` (modified)
- **Parallel?**: No.
- **Notes**: The 201-click loop is slow in userEvent; if it is noticeably slow (>500 ms), switch that one test to `fireEvent.click` for speed.

### Subtask T023 – Header keyboard button test

- **Purpose**: Lock in that the Header exposes the new button and calls the right prop.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/tests/keyboard/Header.test.tsx`.
  2. Contents:
     ```tsx
     import { describe, it, expect, vi } from 'vitest';
     import { render, screen } from '@testing-library/react';
     import userEvent from '@testing-library/user-event';
     import { Header } from '../../src/components/Header';

     describe('Header – keyboard button', () => {
       it('renders a keyboard button that calls onKeyboard when clicked', async () => {
         const user = userEvent.setup();
         const onKeyboard = vi.fn();
         render(
           <Header
             title="Home"
             onHome={() => {}}
             onSettings={() => {}}
             onKeyboard={onKeyboard}
           />,
         );
         const btn = screen.getByRole('button', { name: /keyboard/i });
         await user.click(btn);
         expect(onKeyboard).toHaveBeenCalledTimes(1);
       });

       it('does not render a back button when onBack is omitted', () => {
         render(
           <Header
             title="Home"
             onHome={() => {}}
             onSettings={() => {}}
             onKeyboard={() => {}}
           />,
         );
         // Back button only appears when onBack is provided.
         // Assert Home button is present (baseline), no Back.
         expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
       });
     });
     ```
- **Files**: `tests/keyboard/Header.test.tsx` (new)
- **Parallel?**: Yes — separate file, can be authored at any time after WP04.
- **Notes**: The "no back button when omitted" test is a cheap regression guard for existing Header behavior, not a new requirement.

## Test Strategy

- **Framework**: Vitest + React Testing Library + user-event v14+.
- **Environment**: jsdom (from WP01 setup).
- **Run command**: `npm run test:run` from repo root.
- **Fixtures**: None — all tests mount the component directly with inline props.
- **Coverage expectation**: ~80%+ line coverage for `KeyboardScreen.tsx`, `Header.tsx` modifications, and `alphabets.ts`. Coverage is not enforced by Vitest config in this feature; the reviewer verifies by inspection.

## Risks & Mitigations

- **`findBy*` timeout on takeover tests due to raf delay**: `findBy*` defaults to a 1000 ms timeout, which is plenty for a single rAF. If tests flake, add `{ timeout: 2000 }` to the call.
- **Hebrew/Arabic letter lookup by accessible name**: `screen.getByRole('button', { name: 'א' })` relies on the button's visible text. If the test runner's locale doesn't normalize these, use `screen.getByText('א')` inside the grid container instead.
- **`console.*` spy false positives**: Restrict assertions to whether `call.join(' ')` contains the *exact* typed message, not partial substrings. This avoids flagging innocuous warnings.
- **React's act() warnings from the raf-delayed takeover**: Wrap the takeover assertion in `await waitFor(...)` if needed; the component is not doing anything async enough to require act-wrapping beyond what user-event already provides.

## Review Guidance

The reviewer for WP05 must verify:

1. Both test files exist and are picked up by `npm run test:run`.
2. All tests pass (green).
3. The tests cover every FR listed in the WP's requirement refs table (spot-check by reading the describe block titles).
4. The privacy assertions (console, localStorage, fetch) are present and green.
5. No production code was changed except possibly adding a `data-testid="keyboard-message"` attribute to the message display (this is the only acceptable production-code adjustment for tests).
6. `npm run typecheck` and `npm run lint` exit 0.

## Activity Log

- 2026-04-14T14:01:38Z – system – lane=planned – Prompt created.
- 2026-04-15T07:04:35Z – claude-opus-4-6 – shell_pid=31555 – lane=doing – Assigned agent via workflow command
