---
work_package_id: WP02
title: ConfigScreen UI + Hook Subscriptions
lane: planned
dependencies:
- WP01
requirement_refs:
- FR-001
- FR-002
- FR-005
- FR-006
- FR-007
- FR-008
- FR-010
- NFR-003
- NFR-004
planning_base_branch: deploy-and-export
merge_target_branch: deploy-and-export
branch_strategy: Branch from WP01 during /spec-kitty.implement (use --base WP01). Final merge target is deploy-and-export.
subtasks:
- T007
- T008
- T009
- T010
- T011
phase: Phase 2 - User-facing UI
assignee: ''
agent: ''
shell_pid: ''
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-04-15T08:35:00Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP02 – ConfigScreen UI + Hook Subscriptions

## Review Feedback

*[Empty initially. Reviewers will populate it if the work is returned from review.]*

---

## Branch Strategy

- **Planning/base branch**: `deploy-and-export`
- **Final merge target**: `deploy-and-export`
- **Depends on WP01** — branch from WP01's branch.
- **Implement command**: `spec-kitty implement WP02 --base WP01`

---

## Objectives & Success Criteria

Wire the WP01 module into the user-facing UI:

1. Add **Export configuration** and **Import configuration** buttons to `ConfigScreen.tsx`.
2. Wire them through `window.confirm` (for replace warning) and `window.alert` (for errors).
3. Make small additive edits to `useLanguage` and `useOverrides` so the running app reacts to imported state without a page refresh.

**Done when** all of the following hold:

- All 12 manual smoke tests in `quickstart.md` pass on the dev server.
- `npm run test` passes (WP01 tests still green; no UI tests added).
- `npm run typecheck` clean.
- `npm run lint` clean.
- No new entries in `package.json`.
- Buttons are ≥48px tall and visually consistent with existing config screen styling.

These map to spec requirements **FR-001, FR-002, FR-005, FR-006, FR-007, FR-008, FR-010, NFR-003, NFR-004** and success criteria **SC-001, SC-002, SC-004, SC-006**.

---

## Context & Constraints

**Required reading**:

- WP01's prompt and the resulting `src/utils/configIO.ts` module — you'll be calling its three exported functions.
- `kitty-specs/004-config-export-import/spec.md` — user stories, acceptance scenarios.
- `kitty-specs/004-config-export-import/research.md` R4 (hook event additions), R5 (dialog UX), R6 (download mechanism).
- `kitty-specs/004-config-export-import/quickstart.md` — your manual test plan.
- `src/components/screens/ConfigScreen.tsx` — the file you'll modify. Read it fully first to understand the existing button styling and layout patterns.
- `src/hooks/useLanguage.ts`, `src/hooks/useOverrides.ts` — the two files you'll touch additively.
- `src/hooks/useQuickNames.ts` — reference pattern for a hook that already subscribes to its change event.

**Hard constraints**:

- **No new dependencies**.
- **No styled custom modal** — use native `confirm`/`alert` per research R5. (If a styled modal is later needed, that's a follow-up feature.)
- **Additive-only edits** to `useLanguage` and `useOverrides`: do not change their existing public API. Other call sites must keep working unchanged.
- **No localStorage writes outside `applyConfig`** — the import button must go through WP01's module, not poke localStorage directly.
- **Buttons must use existing styling** — touch the same Tailwind classes the existing config-screen buttons use.

---

## Subtasks & Detailed Guidance

### Subtask T007 – Wire `useLanguage` to dispatch and listen for change events [P]

- **Purpose**: Without this, an imported language change writes localStorage but the React tree shows the old language until refresh. Violates FR-010.
- **Steps**:
  1. Open `src/hooks/useLanguage.ts`.
  2. In `setLanguage`, after the `localStorage.setItem` line, add `window.dispatchEvent(new Event('communicaid-language-changed'));`.
  3. Add a `useEffect` near the existing one that subscribes to the event:
     ```ts
     useEffect(() => {
       const handler = () => setLanguageState(getStoredLanguage());
       window.addEventListener('communicaid-language-changed', handler);
       return () => window.removeEventListener('communicaid-language-changed', handler);
     }, []);
     ```
  4. Verify the existing `dir`/`lang` `useEffect` still runs on language change — it should, because `language` is in its dependency array and `setLanguageState` will trigger a re-render.
- **Files**:
  - `src/hooks/useLanguage.ts` (additive edit, ~6 new lines)
- **Parallel?**: Yes — independent of T008.
- **Notes**:
  - Do **not** remove or rename the existing `setLanguage` callback. Existing call sites must keep working.
  - This is functionally what `useQuickNames` already does for its own event. Same pattern.

### Subtask T008 – Wire `useOverrides` to listen for change events [P]

- **Purpose**: Without this, an imported override-set writes localStorage but `useOverrides` callers (CategoryEditor, EntryEditor, the home screen via useTranslation cascade) show stale state until refresh. Violates FR-010.
- **Steps**:
  1. Open `src/hooks/useOverrides.ts`.
  2. Add `import { useEffect } from 'react';` if not already imported (likely missing — check).
  3. After the existing `useState(getAllOverrides)` line, add:
     ```ts
     useEffect(() => {
       const handler = () => setOverrides(getAllOverrides());
       window.addEventListener('communicaid-overrides-changed', handler);
       return () => window.removeEventListener('communicaid-overrides-changed', handler);
     }, []);
     ```
- **Files**:
  - `src/hooks/useOverrides.ts` (additive edit, ~7 new lines)
- **Parallel?**: Yes — independent of T007.
- **Notes**:
  - Do **not** remove or change the existing `setOverride` / `resetCategory` callbacks. They already dispatch the event via `saveAllOverrides`; the hook just hadn't been listening to its own event.
  - **Loop check**: the listener calls `setOverrides`, which causes a re-render but does NOT call `saveAllOverrides`, so it does NOT re-dispatch the event. No infinite loop.

### Subtask T009 – Add Export button to ConfigScreen

- **Purpose**: User-facing entry point for FR-001, FR-003, FR-005.
- **Steps**:
  1. Open `src/components/screens/ConfigScreen.tsx`.
  2. Import `exportConfig` from `'../../utils/configIO'` (path may vary; check the actual relative path).
  3. Find a suitable location on the screen for two new buttons (top of the screen, or a dedicated "Backup" section near the bottom). Use the existing button styling.
  4. Add a button labeled `Export configuration` (or the localized equivalent if the screen uses `useTranslation`). On click:
     ```ts
     try {
       const text = exportConfig();
       const blob = new Blob([text], { type: 'application/json' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = 'communicaid-config.json';
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
     } catch (err) {
       window.alert(`Could not export configuration: ${(err as Error).message}`);
     }
     ```
  5. Make sure the button is ≥48px tall (NFR-003).
- **Files**:
  - `src/components/screens/ConfigScreen.tsx`
- **Parallel?**: No (shares file with T010).
- **Notes**:
  - If `ConfigScreen.tsx` already uses translation keys for its labels, add a new key for "Export configuration" in the same translation files used elsewhere. If it uses inline English, inline English is fine for this button too. Match the existing pattern.
  - Do **not** create a new `ExportButton` component. Inline JSX is fine and matches the rest of the screen.

### Subtask T010 – Add Import button + file picker + dialogs to ConfigScreen

- **Purpose**: User-facing entry point for FR-002, FR-006, FR-007, FR-008, FR-009, FR-011, FR-012.
- **Steps**:
  1. In the same `ConfigScreen.tsx` file, import `parseAndValidate` and `applyConfig` from the same module.
  2. Add a hidden file input near the new buttons:
     ```tsx
     const fileInputRef = useRef<HTMLInputElement>(null);
     // ...
     <input
       ref={fileInputRef}
       type="file"
       accept="application/json"
       style={{ display: 'none' }}
       onChange={handleImportFile}
     />
     ```
  3. Add the visible Import button. On click: `fileInputRef.current?.click();`.
  4. Implement `handleImportFile`:
     ```ts
     const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (!file) return;
       e.target.value = ''; // allow re-selecting the same file later

       let text: string;
       try {
         text = await file.text();
       } catch (err) {
         window.alert(`Could not read the file: ${(err as Error).message}`);
         return;
       }

       const result = parseAndValidate(text);
       if (!result.ok) {
         window.alert(`Could not import configuration: ${result.error.message}`);
         return;
       }

       const confirmed = window.confirm('This will replace your current configuration. Continue?');
       if (!confirmed) return;

       try {
         applyConfig(result.config);
       } catch (err) {
         window.alert(`Could not save configuration: ${(err as Error).message}`);
       }
     };
     ```
  5. The success path is intentionally silent — the change events from `applyConfig` cause the rest of the UI (including this same `ConfigScreen` via its own hooks) to re-render with the new state.
- **Files**:
  - `src/components/screens/ConfigScreen.tsx`
- **Parallel?**: No (sequential after T009).
- **Notes**:
  - The `e.target.value = ''` line is critical — without it, picking the same file twice in a row won't fire the `change` event.
  - Do **not** wrap the success path in a "Configuration imported successfully!" alert — it's noise. The user will see the change immediately on screen, which is the better feedback.
  - If the existing `ConfigScreen` is split into sub-components, put the Export/Import logic at the top level of `ConfigScreen` rather than threading it through props.

### Subtask T011 – Run all 12 manual smoke tests + checks

- **Purpose**: Verify the full integration end-to-end before review.
- **Steps**:
  1. `npm run dev` and open the dev server in a browser.
  2. Run all 12 tests from `kitty-specs/004-config-export-import/quickstart.md` in order.
  3. For each test, confirm the expected outcome matches reality. **Do not skip any test** — the confirm-cancel and re-import-same-file cases are the most likely to be subtly broken.
  4. Run `npm run test` — confirm WP01's tests still pass.
  5. Run `npm run typecheck` — clean.
  6. Run `npm run lint` — clean.
  7. Append an Activity Log entry summarising: `<timestamp> – <agent> – lane=doing – All 12 manual smoke tests green; unit tests, typecheck, lint clean`.
- **Files**: None modified.
- **Parallel?**: No.
- **Notes**: If any smoke test fails, fix the underlying file (hook, ConfigScreen, or even back to WP01 if it's a logic issue) and re-run. Do not declare done until all 12 pass.

---

## Test Strategy

WP02 is intentionally test-light at the unit level. The pure logic that needs deep coverage already lives in WP01's `configIO.test.ts` (12 cases). The UI surface in WP02 is thin glue:

- Two buttons that delegate to WP01 functions.
- Two hook subscriptions that mirror an existing pattern (`useQuickNames`).

Adding React Testing Library tests for these would cost a lot in setup (jsdom, RTL config, mock localStorage events) for marginal value. The 12 manual smoke tests in `quickstart.md` cover the integration path against a real browser, which is the right level of coverage for this surface.

If a future feature adds more interactive logic to ConfigScreen, that's the right time to introduce RTL-based component tests.

---

## Risks & Mitigations

See tasks.md WP02 risks section.

---

## Review Guidance

Reviewers should verify, in order:

1. **All 12 manual smoke tests pass on the reviewer's machine** — this is the single most important review action. Run them yourself; do not trust the implementer's word.
2. **No new dependencies** — `git diff package.json` empty.
3. **Hook edits are additive only** — `useLanguage` and `useOverrides` retain their existing public API (callers don't need to change).
4. **No infinite re-render loops** — open DevTools React Profiler, do an import, confirm a single render burst.
5. **No styled custom modal added** — must use native `confirm`/`alert` per research R5.
6. **Buttons ≥48px tall** — measure in DevTools.
7. **Filename is `communicaid-config.json`** — case-sensitive.
8. **`e.target.value = ''` line present in `handleImportFile`** — re-selecting the same file must work.
9. **Success path is silent** — no celebration alert after a successful import.

Reject the WP if: any smoke test fails, any new dependency was added, any existing call site of `useLanguage`/`useOverrides` had to be modified, or a custom styled modal was introduced.

---

## Activity Log

> **CRITICAL**: Activity log entries MUST be in chronological order (oldest first, newest last). APPEND new entries at the END.

**Initial entry**:
- 2026-04-15T08:35:00Z – system – lane=planned – Prompt generated via /spec-kitty.tasks

---

### Updating Lane Status

To change this work package's lane:

1. **Edit directly**: Change the `lane:` field in frontmatter AND append an activity log entry at the end.
2. **Use CLI** (recommended): `spec-kitty agent tasks move-task WP02 --to <lane> --note "message"`

**Valid lanes**: `planned`, `doing`, `for_review`, `done`

**Implement command**: `spec-kitty implement WP02 --base WP01`
