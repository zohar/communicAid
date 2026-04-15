---
description: "Work package task list for Config Export & Import"
---

# Work Packages: Config Export & Import

**Inputs**: Design documents from `kitty-specs/004-config-export-import/`
**Prerequisites**: spec.md, plan.md, research.md, data-model.md, contracts/config-file.md, quickstart.md

**Tests**: This feature ships application code, so the constitution's `TEST_FIRST` directive is satisfied by Vitest unit tests in `src/utils/configIO.test.ts`, written **before** the implementation. The pure-logic module (WP01) covers 12 cases (every FR + every edge case from the spec). The UI integration (WP02) is verified by the manual smoke test in `quickstart.md` — 12 dev-server scenarios.

**Organization**: Split into two work packages along a clean fault line:
- **WP01** delivers a pure, fully-unit-tested logic module with no React, no DOM, and no app coupling beyond importing existing TypeScript types.
- **WP02** builds the UI on top of that module and wires up two small additive hook subscriptions so the running app reacts to imported state without a page refresh.

Splitting this way keeps each WP independently reviewable and lets the test-first gate be enforced cleanly on the high-value logic before any UI work begins.

**Branch strategy**:
- Planning/base branch: `deploy-and-export`
- Final merge target: `deploy-and-export`
- WP02 depends on WP01 (its base will be `WP01` during `/spec-kitty.implement`).

---

## Work Package WP01: Pure I/O Module with Tests (Priority: P1) 🎯 MVP foundation

**Goal**: Add a pure TypeScript module `src/utils/configIO.ts` that exports three functions — `exportConfig`, `parseAndValidate`, `applyConfig` — and a Vitest test suite `src/utils/configIO.test.ts` that exhaustively covers them. Every functional requirement and edge case in spec.md is asserted at the unit level. The module touches `localStorage` and dispatches change events, but is otherwise pure (no React, no DOM, no UI).
**Independent Test**: `npm run test` runs all 12 Vitest cases and they pass green. `npm run typecheck` clean. `npm run lint` clean. No new entries in `package.json` dependencies.
**Prompt**: `tasks/WP01-pure-io-module-with-tests.md`

**Requirements Refs**: FR-003, FR-004, FR-009, FR-011, FR-012, FR-013, FR-014, NFR-001, NFR-002, NFR-005, NFR-006

### Included Subtasks

- [ ] T001 Write Vitest test file `src/utils/configIO.test.ts` with all 12 cases from research.md R7. Run `npm run test` and confirm every test fails (red baseline — TEST_FIRST gate)
- [ ] T002 Define the new TypeScript shapes in `src/utils/configIO.ts`: `ExportedConfig`, `ImportResult`, `ImportError` (per data-model.md)
- [ ] T003 Implement `exportConfig(): string` — reads the three localStorage keys, builds an `ExportedConfig` object, returns `JSON.stringify(obj, null, 2)`
- [ ] T004 Implement `parseAndValidate(text: string): ImportResult` — pure validate-then-write enforcer per research.md R2 and R3; returns discriminated union, never throws
- [ ] T005 Implement `applyConfig(config: ExportedConfig): void` — snapshots the three keys, writes new values, dispatches all three change events; restores snapshot on `setItem` failure (research.md R8)
- [ ] T006 Run `npm run test` (all green), `npm run typecheck` (clean), `npm run lint` (clean). Confirm no new entries in `package.json`

### Implementation Notes

- T001 must run **first** to honor TEST_FIRST. Tests must fail because `configIO.ts` doesn't exist yet — that's the red baseline. The implementer pastes the failing-test summary into the WP activity log to prove the gate was observed.
- T002–T005 are sequential. The shapes (T002) come before the implementations because the test file imports them.
- T005 introduces the **only** rollback in the entire feature: snapshot all three localStorage keys before writing the first one, so if any subsequent `setItem` throws (quota, private mode), we restore the snapshot before re-throwing as `storage_error`. This is necessary to honor SC-005 (failed import leaves state byte-identical) under storage pressure.
- The new event `communicaid-language-changed` is dispatched here in `applyConfig`, but it's also dispatched from `useLanguage.setLanguage` in WP02. This event name is the contract.

### Parallel Opportunities

- None within WP01. The test-first ordering enforces strict sequence T001 → T002 → T003 → T004 → T005 → T006.

### Dependencies

- None. WP01 is the foundation.

### Risks & Mitigations

- **Risk**: localStorage `setItem` partial write leaves state inconsistent.
  **Mitigation**: Snapshot-before-write in `applyConfig` (research R8); restored on failure. Covered by a dedicated unit test that mocks `setItem` to throw on the second call.
- **Risk**: Validation is too strict and rejects legitimate exports from a future schema addition.
  **Mitigation**: Validator is **lenient on unknown fields** (forward-compat) and **strict on known field types**. Unit tests assert both.
- **Risk**: Validator is too lenient and lets bad data through.
  **Mitigation**: Tests for invalid_json, invalid_shape, invalid_language, oversized_field — every error variant has a dedicated case.

---

## Work Package WP02: ConfigScreen UI + Hook Subscriptions (Priority: P1) 🎯 MVP shipping

**Goal**: Wire the WP01 module into the user-facing UI. Add **Export configuration** and **Import configuration** buttons to `ConfigScreen.tsx`, wire them through `window.confirm` / `window.alert` for confirmation and error reporting, and make two small additive edits to `useLanguage` and `useOverrides` so the running app reacts to imported state without a page refresh.
**Independent Test**: All 12 manual smoke tests in `quickstart.md` pass on the dev server (`npm run dev`). `npm run typecheck` clean. `npm run lint` clean. No new entries in `package.json` dependencies.
**Prompt**: `tasks/WP02-configscreen-ui-and-hook-subscriptions.md`

**Requirements Refs**: FR-001, FR-002, FR-005, FR-006, FR-007, FR-008, FR-010, NFR-003, NFR-004

### Included Subtasks

- [ ] T007 Add `communicaid-language-changed` event dispatch in `useLanguage.setLanguage`, and a `useEffect` listener so multiple `useLanguage()` callers stay in sync
- [ ] T008 Add a `useEffect` listener for `communicaid-overrides-changed` in `useOverrides`, mirroring the pattern already used by `useQuickNames`
- [ ] T009 Add **Export configuration** button to `ConfigScreen.tsx`: calls `exportConfig()`, builds a Blob, triggers download via temporary anchor, revokes the URL after click. Filename `communicaid-config.json`. Errors caught and surfaced via `window.alert`
- [ ] T010 Add **Import configuration** button + hidden `<input type="file" accept="application/json">` to `ConfigScreen.tsx`: on file selection, read text → `parseAndValidate` → if ok, `window.confirm` → if confirmed, `applyConfig` → success path is silent (UI updates via change events). Errors surfaced via `window.alert` with the message from `ImportResult`
- [ ] T011 Run all 12 manual smoke tests from `quickstart.md` against the dev server. Confirm `npm run test`, `npm run typecheck`, and `npm run lint` are all clean

### Implementation Notes

- T007 and T008 are **prerequisite** for FR-010 / SC-004. Without them, an import writes localStorage but the React tree shows stale state until refresh. They're tiny (5–10 lines each) and additive — no existing call site changes behavior.
- T009 and T010 must use existing styling on `ConfigScreen.tsx`. Buttons must be ≥48px tall (NFR-003). Reuse the same component classes already in use on the screen for visual consistency.
- The hidden `<input type="file">` pattern: render an `<input>` with `style={{ display: 'none' }}` and a `ref`; the visible Import button calls `inputRef.current?.click()`.
- Read file text via `await file.text()` (modern browsers; no FileReader callback dance needed).
- Confirmation copy: short, plain language. Suggested: `"This will replace your current configuration. Continue?"`. Error copy: just surface `error.message` from `ImportResult`.
- Do **not** add a styled custom modal in this WP. Native `confirm`/`alert` is the agreed scope (research R5). If a styled modal is needed later, it's a follow-up feature.

### Parallel Opportunities

- T007 and T008 are independent files and can be authored in parallel within the same session.
- T009 and T010 both modify `ConfigScreen.tsx` and must be sequential (or coordinated via a single edit pass). T009 first is recommended (easier path).

### Dependencies

- **Depends on WP01**: WP02 imports `exportConfig`, `parseAndValidate`, `applyConfig` from `src/utils/configIO.ts`. Run `spec-kitty implement WP02 --base WP01` so the WP02 worktree branches from WP01's branch.

### Risks & Mitigations

- **Risk**: Adding the change-event listener to `useOverrides` causes infinite re-render loops if the listener also triggers a state update that re-dispatches the event.
  **Mitigation**: The listener only re-reads localStorage into local state; it does not call `saveAllOverrides` (which is what dispatches the event). Tested by manually editing localStorage in DevTools and confirming a single re-render, not a loop.
- **Risk**: Native `confirm`/`alert` look out of place on a tablet next to the styled UI.
  **Mitigation**: Acknowledged trade-off (research R5). User explicitly asked for "easiest possible". Can be replaced with a styled `<dialog>` in a follow-up if it becomes a real complaint.
- **Risk**: Import button on a kiosk-locked browser doesn't show the file picker.
  **Mitigation**: Out of scope for this feature. The spec only commits to "modern tablet browsers".
- **Risk**: After import, the language flips from LTR to RTL (or vice versa) and the layout looks broken until next reload.
  **Mitigation**: `useLanguage`'s existing `useEffect` already sets `document.documentElement.dir` and `lang` whenever `language` changes. Once T007 wires up the change-event subscription, this happens immediately on import. Verified by Test 11 in quickstart.md.

---

## Dependency & Execution Summary

- **Sequence**: WP01 → WP02. WP02 cannot start until WP01 is merged (or at least its `configIO.ts` API is stable on a base branch).
- **Parallelization**: None across WPs. Within WP02, T007 and T008 are independent files.
- **MVP Scope**: Both WPs together = MVP. WP01 alone ships an unused module; WP02 is the user-visible feature. They should be reviewed and merged in order, but the user only sees value after WP02 lands.

---

## Subtask Index (Reference)

| Subtask ID | Summary | Work Package | Priority | Parallel? |
|------------|---------|--------------|----------|-----------|
| T001       | Vitest tests for configIO (red baseline, TEST_FIRST) | WP01 | P1 | No |
| T002       | TypeScript shapes (ExportedConfig, ImportResult, ImportError) | WP01 | P1 | No |
| T003       | `exportConfig()` implementation | WP01 | P1 | No |
| T004       | `parseAndValidate()` implementation | WP01 | P1 | No |
| T005       | `applyConfig()` implementation with snapshot rollback | WP01 | P1 | No |
| T006       | Run tests + typecheck + lint, confirm clean | WP01 | P1 | No |
| T007       | `useLanguage` event dispatch + listener | WP02 | P1 | Yes (with T008) |
| T008       | `useOverrides` event listener | WP02 | P1 | Yes (with T007) |
| T009       | Export button on ConfigScreen | WP02 | P1 | No |
| T010       | Import button + file picker + dialogs on ConfigScreen | WP02 | P1 | No |
| T011       | Run quickstart.md smoke tests + typecheck + lint | WP02 | P1 | No |
