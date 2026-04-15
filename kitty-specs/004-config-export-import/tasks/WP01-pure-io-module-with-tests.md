---
work_package_id: WP01
title: Pure I/O Module with Tests
lane: planned
dependencies: []
requirement_refs:
- FR-003
- FR-004
- FR-009
- FR-011
- FR-012
- FR-013
- FR-014
- NFR-001
- NFR-002
- NFR-005
- NFR-006
planning_base_branch: deploy-and-export
merge_target_branch: deploy-and-export
branch_strategy: Planning artifacts for this feature were generated on deploy-and-export. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into deploy-and-export unless the human explicitly redirects the landing branch.
subtasks:
- T001
- T002
- T003
- T004
- T005
- T006
phase: Phase 1 - Pure logic foundation
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

# Work Package Prompt: WP01 – Pure I/O Module with Tests

## Review Feedback

*[Empty initially. Reviewers will populate it if the work is returned from review.]*

---

## Branch Strategy

- **Planning/base branch**: `deploy-and-export`
- **Final merge target**: `deploy-and-export`
- **No prior WP dependencies** — branch directly from `deploy-and-export`.
- **Implement command**: `spec-kitty implement WP01`

---

## Objectives & Success Criteria

Add a pure TypeScript module `src/utils/configIO.ts` exporting three functions:

- `exportConfig(): string` — serializes the three localStorage keys into a pretty-printed JSON string.
- `parseAndValidate(text: string): ImportResult` — parses and validates an imported file, returning a discriminated union. Never throws.
- `applyConfig(config: ExportedConfig): void` — atomically writes all three localStorage keys and dispatches the three change events; rolls back on `setItem` failure.

And a comprehensive Vitest test suite at `src/utils/configIO.test.ts` covering 12 cases (every FR + edge case from the spec).

**Done when** all of the following hold:

- `npm run test` passes (12+ tests green, including `configIO.test.ts`).
- `npm run typecheck` clean.
- `npm run lint` clean.
- No new entries in `package.json` `dependencies` or `devDependencies` (Vitest is already there).
- The TEST_FIRST gate was honored: the test file was written **before** the implementation and was observed failing (red) before passing (green). Activity log shows both states.

These map to spec requirements **FR-003, FR-004, FR-009, FR-011, FR-012, FR-013, FR-014, NFR-001, NFR-002, NFR-005, NFR-006** and success criteria **SC-005, SC-007**.

---

## Context & Constraints

**Required reading before you start**:

- `kitty-specs/004-config-export-import/spec.md` — full requirements, edge cases, success criteria.
- `kitty-specs/004-config-export-import/plan.md` — architecture, Constitution Check.
- `kitty-specs/004-config-export-import/research.md` — locked decisions for file shape, validation rules, snapshot rollback. **Do not relitigate these.**
- `kitty-specs/004-config-export-import/data-model.md` — exact TypeScript shapes you'll implement.
- `kitty-specs/004-config-export-import/contracts/config-file.md` — the JSON contract; this is what your validator enforces.
- `src/types.ts` — existing `CustomOverride` and `Language` types you'll reuse.
- `src/hooks/useOverrides.ts`, `src/hooks/useQuickNames.ts`, `src/hooks/useLanguage.ts` — the existing read/write patterns; use the same localStorage keys.

**Hard constraints**:

- **No new dependencies**. Do not `npm install` anything. Vitest is already in the project.
- **No React, no DOM, no UI** in this module. It only touches `localStorage` and `window.dispatchEvent`. (Yes, `localStorage` and `window` are technically DOM globals; what's forbidden here is React, JSX, components.)
- **Validate-then-write**: `parseAndValidate` must never write anything. `applyConfig` is the only write site.
- **Discriminated union for errors**: never `throw` from `parseAndValidate`; return `{ ok: false, error: { kind, message } }`.
- **Lenient on unknown fields, strict on known field types** — the validator must be forward-compatible.
- **localStorage keys are fixed** (set by spec 001): `communicaid-overrides`, `communicaid-quick-names`, `communicaid-language`. Do not add new keys.
- **Event names are fixed**: `communicaid-overrides-changed`, `communicaid-quick-names-changed`, and the new `communicaid-language-changed`.

---

## Subtasks & Detailed Guidance

### Subtask T001 – Write the Vitest test file (TEST_FIRST red baseline)

- **Purpose**: Honor the constitution's `TEST_FIRST` directive. Write the entire test suite **before** the implementation exists, run it, and confirm every test fails (red). This is the test-first baseline that proves the implementation is moving from red to green.
- **Steps**:
  1. Create `src/utils/configIO.test.ts`.
  2. Import `describe`, `it`, `expect`, `beforeEach`, `vi` from `vitest`.
  3. Import the (not-yet-existing) module: `import { exportConfig, parseAndValidate, applyConfig, type ExportedConfig, type ImportResult } from './configIO';`.
  4. In `beforeEach`, clear `localStorage` and any spies.
  5. Write the 12 test cases listed below.
  6. Run `npm run test`. Every test in `configIO.test.ts` must fail (the import will fail to resolve — that's the expected red state).
  7. Append an Activity Log entry: `<timestamp> – <agent> – lane=doing – TEST_FIRST: 12 tests written and failing as expected (configIO module does not exist yet)`.
- **Files**:
  - `src/utils/configIO.test.ts` (new, ~250 lines)
- **Parallel?**: No.
- **Test cases (the 12 from research.md R7)**:

  ```ts
  // exportConfig
  it('exportConfig serializes three localStorage keys to pretty JSON', () => {
    localStorage.setItem('communicaid-overrides', JSON.stringify({ 'foo:en': { entryId: 'foo', language: 'en', text: 'Bar' } }));
    localStorage.setItem('communicaid-quick-names', JSON.stringify([{ id: '1', name: 'Mom', icon: '👩', position: 1 }]));
    localStorage.setItem('communicaid-language', 'he');

    const text = exportConfig();
    const parsed = JSON.parse(text);

    expect(parsed.overrides).toEqual({ 'foo:en': { entryId: 'foo', language: 'en', text: 'Bar' } });
    expect(parsed.quickNames).toEqual([{ id: '1', name: 'Mom', icon: '👩', position: 1 }]);
    expect(parsed.language).toBe('he');
    expect(text).toContain('\n  '); // pretty-printed with 2-space indent
  });

  it('exportConfig produces an empty-but-valid file when no customizations exist', () => {
    const text = exportConfig();
    const parsed = JSON.parse(text);
    expect(parsed.overrides).toEqual({});
    expect(parsed.quickNames).toEqual([]);
    expect(typeof parsed.language).toBe('string');
  });

  // parseAndValidate
  it('parseAndValidate accepts a round-trip of exportConfig output', () => {
    localStorage.setItem('communicaid-overrides', JSON.stringify({ 'foo:en': { entryId: 'foo', language: 'en', text: 'Bar' } }));
    localStorage.setItem('communicaid-language', 'en');
    const result = parseAndValidate(exportConfig());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config.overrides?.['foo:en']?.text).toBe('Bar');
  });

  it('parseAndValidate rejects non-JSON input', () => {
    const result = parseAndValidate('{ this is not json');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('invalid_json');
  });

  it('parseAndValidate rejects an array at the top level', () => {
    const result = parseAndValidate('["wrong"]');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('invalid_shape');
  });

  it('parseAndValidate rejects an unknown language code', () => {
    const result = parseAndValidate(JSON.stringify({ language: 'fr' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('invalid_language');
  });

  it('parseAndValidate rejects an oversized text override', () => {
    const big = 'x'.repeat(101);
    const result = parseAndValidate(JSON.stringify({
      overrides: { 'foo:en': { entryId: 'foo', language: 'en', text: big } }
    }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('oversized_field');
  });

  it('parseAndValidate accepts a file with missing top-level keys', () => {
    const result = parseAndValidate(JSON.stringify({ language: 'en' }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.overrides).toBeUndefined();
      expect(result.config.quickNames).toBeUndefined();
      expect(result.config.language).toBe('en');
    }
  });

  it('parseAndValidate ignores unknown top-level keys (forward-compat)', () => {
    const result = parseAndValidate(JSON.stringify({ language: 'en', futureFeature: { whatever: true } }));
    expect(result.ok).toBe(true);
  });

  // applyConfig
  it('applyConfig writes all three localStorage keys', () => {
    applyConfig({
      overrides: { 'foo:en': { entryId: 'foo', language: 'en', text: 'Bar' } },
      quickNames: [{ id: '1', name: 'Mom', icon: '👩', position: 1 }],
      language: 'he',
    });
    expect(JSON.parse(localStorage.getItem('communicaid-overrides')!)).toEqual({ 'foo:en': { entryId: 'foo', language: 'en', text: 'Bar' } });
    expect(JSON.parse(localStorage.getItem('communicaid-quick-names')!)).toEqual([{ id: '1', name: 'Mom', icon: '👩', position: 1 }]);
    expect(localStorage.getItem('communicaid-language')).toBe('he');
  });

  it('applyConfig clears keys for sections missing in the input (full replace)', () => {
    localStorage.setItem('communicaid-overrides', JSON.stringify({ 'old:en': { entryId: 'old', language: 'en', text: 'gone' } }));
    localStorage.setItem('communicaid-quick-names', JSON.stringify([{ id: '1', name: 'X', icon: 'X', position: 1 }]));
    applyConfig({ language: 'en' });
    expect(localStorage.getItem('communicaid-overrides')).toBeNull();
    expect(localStorage.getItem('communicaid-quick-names')).toBeNull();
    expect(localStorage.getItem('communicaid-language')).toBe('en');
  });

  it('applyConfig dispatches the three change events', () => {
    const events: string[] = [];
    const handler = (e: Event) => events.push(e.type);
    window.addEventListener('communicaid-overrides-changed', handler);
    window.addEventListener('communicaid-quick-names-changed', handler);
    window.addEventListener('communicaid-language-changed', handler);
    applyConfig({ overrides: {}, quickNames: [], language: 'en' });
    expect(events).toContain('communicaid-overrides-changed');
    expect(events).toContain('communicaid-quick-names-changed');
    expect(events).toContain('communicaid-language-changed');
    window.removeEventListener('communicaid-overrides-changed', handler);
    window.removeEventListener('communicaid-quick-names-changed', handler);
    window.removeEventListener('communicaid-language-changed', handler);
  });
  ```

- **Notes**:
  - You can add a 13th test for the `applyConfig` snapshot-rollback path (mock `setItem` to throw on the second call, assert that the first key was restored). It's bonus coverage and worth doing if time permits.
  - Vitest's default jsdom environment provides `localStorage` and `window`. No setup file needed.
  - If `vitest.config.ts` doesn't already use the jsdom environment, add `environment: 'jsdom'` to its config — but check first; the existing `useQuickNames.test.ts` (if any) will tell you the current setup. **Do not** install jsdom; if it's missing, raise it as a question instead of adding a dependency.

### Subtask T002 – Define TypeScript shapes

- **Purpose**: Set up the type contract that the test file imports and the rest of the module implements. Per data-model.md.
- **Steps**:
  1. Create `src/utils/configIO.ts`.
  2. At the top, import existing types: `import type { CustomOverride, Language } from '../types';`.
  3. Define a local type `StoredQuickName` matching the shape used in `useQuickNames.ts` (id, name, icon, position). Do not import it — that hook keeps it private. A duplicate 4-line type declaration is fine.
  4. Define and export `ExportedConfig`, `ImportResult`, and `ImportError` exactly as in data-model.md.
- **Files**:
  - `src/utils/configIO.ts` (new, this subtask adds ~25 lines)
- **Parallel?**: No.
- **Notes**: Keep all types in this single file. Do not split into a `configIO.types.ts`. The whole module is under 200 lines.

### Subtask T003 – Implement `exportConfig`

- **Purpose**: Read the three localStorage keys, build the `ExportedConfig` object, return pretty-printed JSON.
- **Steps**:
  1. Read each of the three localStorage keys.
  2. For `overrides` and `quickNames`, parse the stored JSON. If the key is missing or parsing fails, fall back to `{}` and `[]` respectively.
  3. For `language`, read the raw string. If missing or not one of the four allowed values, fall back to `'en'`.
  4. Return `JSON.stringify({ overrides, quickNames, language }, null, 2)`.
- **Files**: `src/utils/configIO.ts`
- **Parallel?**: No.
- **Notes**: This function is forgiving by design — it tries to export *something* even if the user has corrupt localStorage. The validator (`parseAndValidate`) is the strict one.

### Subtask T004 – Implement `parseAndValidate`

- **Purpose**: Parse and fully validate the imported file. Never throw. Return a discriminated union.
- **Steps**:
  1. Try `JSON.parse(text)`. On failure, return `{ ok: false, error: { kind: 'invalid_json', message: <error.message> } }`.
  2. If the parsed value is not a plain object (typeof !== 'object', is null, or is an array), return `invalid_shape`.
  3. Validate the optional `language` field: if present and not in `['en','he','ar','ru']`, return `invalid_language`.
  4. Validate the optional `overrides` field:
     - Must be a plain object (not array).
     - For each entry, the value must be a plain object with a string `entryId` and a valid `language`.
     - If `text` is present, must be a string ≤100 chars (otherwise `oversized_field`).
     - If `icon` is present, must be a string ≤100 chars (otherwise `oversized_field`).
     - Unknown fields inside an override entry are ignored.
  5. Validate the optional `quickNames` field:
     - Must be an array.
     - Each element must be an object with `id` (string), `name` (string ≤100 chars), `icon` (string ≤100 chars), `position` (number).
     - Overlong `name`/`icon` → `oversized_field`.
  6. On success, return `{ ok: true, config: { overrides, quickNames, language } }` where each field is omitted (not set) if it was missing from the input.
- **Files**: `src/utils/configIO.ts`
- **Parallel?**: No.
- **Notes**:
  - Write small private helper functions (`isValidLanguage`, `isPlainObject`, `validateOverride`, `validateQuickName`) — keeps the main function readable.
  - The validator is the longest function in the file (~80 lines including helpers). That's fine.

### Subtask T005 – Implement `applyConfig` with snapshot rollback

- **Purpose**: Atomically replace the three localStorage keys and dispatch the three change events. Roll back on partial-write failure.
- **Steps**:
  1. **Snapshot first**: capture the current values of the three keys (or `null` if missing).
  2. Wrap the writes in a `try`/`catch`:
     - For `overrides`: if `config.overrides` is defined, `setItem` the JSON-stringified value; else `removeItem`.
     - Same for `quickNames`.
     - For `language`: if defined, `setItem` the raw string; else `removeItem`.
  3. After all three writes succeed, dispatch the three change events: `window.dispatchEvent(new Event('communicaid-overrides-changed'))`, etc.
  4. In the `catch` block: restore the three keys from the snapshot (using `setItem` or `removeItem`), then **re-throw** as a new `Error` with a `cause` containing the original — or, better, wrap and re-throw as an object `{ kind: 'storage_error', message }`. The caller (UI) catches this and surfaces it.
- **Files**: `src/utils/configIO.ts`
- **Parallel?**: No.
- **Notes**:
  - The function returns `void` on success and throws on storage failure. The storage_error path is the **only** throw in the entire module.
  - Why throw here instead of returning a result? Because storage failure is rare and exceptional — the `Result` discrimination is for the validation path, where we expect failures to be normal and routine. Throwing for storage failure keeps the happy path clean.
  - **Important**: After dispatching events, the React tree will re-read localStorage via the listeners added in WP02. Make sure the events are dispatched AFTER all writes succeed, not interleaved.

### Subtask T006 – Run all checks

- **Purpose**: Final green light before moving the WP to review.
- **Steps**:
  1. `npm run test` — every test in `configIO.test.ts` passes. No regressions in the rest of the suite.
  2. `npm run typecheck` — clean.
  3. `npm run lint` — clean.
  4. `git diff package.json package-lock.json` — should be empty (no new dependencies).
  5. Append an Activity Log entry: `<timestamp> – <agent> – lane=doing – All 12 tests green; typecheck/lint clean; no new deps`.
- **Files**: None modified.
- **Parallel?**: No.
- **Notes**: If any check fails, fix the underlying issue and re-run. Do not patch around failures.

---

## Test Strategy

This WP **is** the test strategy for the feature. The 12 unit tests in `configIO.test.ts` cover every functional requirement and edge case in `spec.md`. WP02 is verified by manual smoke testing in `quickstart.md` because the UI surface is too thin to justify React Testing Library.

The test-first loop is:

1. **Red** (T001): Tests written; all fail because `configIO.ts` doesn't exist.
2. **Green** (T002 → T003 → T004 → T005 → T006): Module implemented; tests turn green one by one.

---

## Risks & Mitigations

See tasks.md WP01 risks section. Most important: snapshot-rollback in `applyConfig` is the only thing that makes SC-005 hold under storage pressure.

---

## Review Guidance

Reviewers should verify, in order:

1. **Test file written first**: Activity Log shows T001 completed before T003–T005. The red baseline was observed.
2. **All 12 tests present and passing**: `npm run test` is green; `configIO.test.ts` contains all 12 cases listed in T001.
3. **No throws from `parseAndValidate`**: grep the file for `throw` — should only appear inside `applyConfig`'s catch path.
4. **Snapshot-rollback in `applyConfig`**: visually confirm the function snapshots before writing and restores on failure.
5. **No new dependencies**: `git diff package.json` empty.
6. **No React/JSX in `configIO.ts`**: visual inspection.
7. **Forward-compat on validation**: a JSON file with an unknown top-level key is accepted (covered by test 9).

Reject the WP if: any test fails, the test file was written after the implementation, the validator throws, the rollback is missing, or any new dependency was added.

---

## Activity Log

> **CRITICAL**: Activity log entries MUST be in chronological order (oldest first, newest last). APPEND new entries at the END.

**Format**: `- YYYY-MM-DDTHH:MM:SSZ – <agent_id> – lane=<lane> – <brief action>`

**Initial entry**:
- 2026-04-15T08:35:00Z – system – lane=planned – Prompt generated via /spec-kitty.tasks

---

### Updating Lane Status

To change this work package's lane:

1. **Edit directly**: Change the `lane:` field in frontmatter AND append an activity log entry at the end.
2. **Use CLI** (recommended): `spec-kitty agent tasks move-task WP01 --to <lane> --note "message"`

**Valid lanes**: `planned`, `doing`, `for_review`, `done`

**Implement command**: `spec-kitty implement WP01`
