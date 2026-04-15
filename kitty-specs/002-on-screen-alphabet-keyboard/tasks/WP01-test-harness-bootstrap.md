---
work_package_id: WP01
title: Test Harness Bootstrap
lane: "doing"
dependencies: []
requirement_refs:
- NFR-005
planning_base_branch: keyboard
merge_target_branch: keyboard
branch_strategy: Planning artifacts for this feature were generated on keyboard. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into keyboard unless the human explicitly redirects the landing branch.
base_branch: keyboard
base_commit: cec683ea519b1061a61d3d8f9a473616f22d931f
created_at: '2026-04-14T14:15:54.306866+00:00'
subtasks:
- T001
- T002
- T003
- T004
- T005
phase: Phase 1 - Foundation
assignee: ''
agent: "claude-opus-4-6"
shell_pid: "35450"
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

# Work Package Prompt: WP01 – Test Harness Bootstrap

## Branch Strategy

- **Planning/base branch at prompt creation**: `keyboard`
- **Final merge target for completed work**: `keyboard`
- **Actual worktree base may differ later**: `/spec-kitty.implement` populates frontmatter `base_branch` when the worktree is created. For stacked WPs it may point at another WP branch, but the final merge target remains `keyboard` unless the human explicitly changes the landing branch.
- **If human instructions contradict these fields**: stop and resolve the intended landing branch before coding.

**Implementation command (no dependencies)**: `spec-kitty implement WP01`

---

## Objectives & Success Criteria

Bootstrap the first Vitest + React Testing Library test suite for the communicAid project so that every subsequent work package in this feature — and every future feature — can run automated unit and integration tests.

**This work package is complete when**:

1. The following devDependencies are installed and listed in `package.json`:
   - `vitest`
   - `@testing-library/react`
   - `@testing-library/user-event`
   - `@testing-library/jest-dom`
   - `jsdom`
   - `@vitest/ui`
2. `vitest.config.ts` exists at the repository root and configures a jsdom test environment with a setup file.
3. `tests/setup.ts` exists and registers `@testing-library/jest-dom` matchers plus automatic React Testing Library cleanup.
4. `package.json` exposes the npm scripts `test`, `test:run`, and `test:ui`.
5. A single placeholder test file exists at `tests/keyboard/smoke.test.ts` and passes when `npm run test` is run.
6. `npm run typecheck`, `npm run lint`, and `npm run test` all exit with code 0.
7. No production source file under `src/` is modified by this WP.

## Context & Constraints

- **Plan**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/plan.md`
- **Tasks**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/tasks.md`
- **Constitution**: `/Users/zohar/apps/communicAid/.kittify/constitution/constitution.md`
- **Repo top-level CLAUDE.md**: `/Users/zohar/apps/communicAid/CLAUDE.md`

The constitution activates the `TEST_FIRST` directive and mandates Vitest for unit/integration tests. It also says "No test framework installed yet — to be set up." This work package is that setup. Downstream WPs (WP02, WP03, WP05) rely on `npm run test` being functional.

The project stack is Vite 8 + React 19 + TypeScript 6. Pin versions compatible with Vite 8 — Vitest 2.x is the right line to install (Vitest 1.x targets Vite 4/5, Vitest 2.x targets Vite 5/6/7/8).

**Do NOT**:

- Add any production code.
- Add test coverage thresholds yet (WP05 will be the real suite; thresholds belong to a later constitutional amendment).
- Modify `src/` in any way.
- Add Playwright. E2E is out of scope.
- Pull in Enzyme or Jest. Vitest and RTL only.

## Subtasks & Detailed Guidance

### Subtask T001 – Install Vitest + React Testing Library devDependencies

- **Purpose**: Pull in the runtime dependencies required by every test in every subsequent WP.
- **Steps**:
  1. From repo root, run:
     ```bash
     npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
     ```
  2. Open `package.json` and confirm all six packages are listed under `devDependencies`. Pin to the versions npm installed — no manual downgrades.
  3. Confirm `vitest` resolves to a `^2.x.x` version that is compatible with Vite 8. If npm resolves an older major, explicitly request `vitest@^2` and `@vitest/ui@^2`.
  4. Do not commit `node_modules`. The `.gitignore` should already cover this — verify, do not add.
- **Files**: `package.json`, `package-lock.json`
- **Parallel?**: No — downstream subtasks depend on this being done.
- **Notes**: If `npm install` fails due to peer-dep conflicts with React 19, check Vitest and RTL release notes for a version that supports React 19. `@testing-library/react@^16` supports React 19; earlier majors may not.

### Subtask T002 – Create `vitest.config.ts`

- **Purpose**: Tell Vitest to run tests in a jsdom environment with React Testing Library's setup file.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/vitest.config.ts`.
  2. Use the following starting point:
     ```typescript
     import { defineConfig } from 'vitest/config';
     import react from '@vitejs/plugin-react';

     export default defineConfig({
       plugins: [react()],
       test: {
         environment: 'jsdom',
         globals: true,
         setupFiles: ['./tests/setup.ts'],
         include: ['tests/**/*.{test,spec}.{ts,tsx}'],
         css: true,
       },
     });
     ```
  3. `@vitejs/plugin-react` is already a dependency of the project (used by `vite.config.ts`); reuse it. If the import path fails, check `package.json` for the exact name and adjust.
  4. Do **not** introduce a separate Vite config for tests. Keep Vitest's config self-contained in this file.
- **Files**: `vitest.config.ts` (new)
- **Parallel?**: No.
- **Notes**: Setting `globals: true` lets tests use `describe`, `it`, `expect` without importing them, matching common RTL style. `css: true` is needed because the project uses Tailwind which injects global styles; without it component tests can throw on CSS imports.

### Subtask T003 – Create `tests/setup.ts`

- **Purpose**: Hook `@testing-library/jest-dom` matchers into Vitest's expect, and ensure React Testing Library cleans up the DOM between tests.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/tests/setup.ts`.
  2. Contents:
     ```typescript
     import '@testing-library/jest-dom/vitest';
     import { cleanup } from '@testing-library/react';
     import { afterEach } from 'vitest';

     afterEach(() => {
       cleanup();
     });
     ```
  3. Confirm `@testing-library/jest-dom/vitest` is the correct import path for v6+ of the package (it is; earlier versions used `/extend-expect`). If the import fails, check the installed version and adjust.
- **Files**: `tests/setup.ts` (new)
- **Parallel?**: No.
- **Notes**: The `afterEach(cleanup)` call is belt-and-braces — modern RTL auto-cleans, but being explicit makes the setup portable across test runners.

### Subtask T004 – Add npm test scripts

- **Purpose**: Give developers (and CI / future WPs) a consistent way to run tests.
- **Steps**:
  1. Open `/Users/zohar/apps/communicAid/package.json`.
  2. Under `"scripts"`, add (do not replace existing scripts):
     ```json
     "test": "vitest",
     "test:run": "vitest run",
     "test:ui": "vitest --ui"
     ```
  3. `test` is the watch-mode default, `test:run` is the one-shot mode that CI and WP06 will use, `test:ui` opens the Vitest UI for debugging.
  4. Keep existing scripts (`dev`, `build`, `preview`, `lint`, `typecheck` if present) unchanged.
- **Files**: `package.json`
- **Parallel?**: No.
- **Notes**: Do not add coverage reporting scripts yet. Coverage can be a follow-up if constitutional amendments demand a reporter.

### Subtask T005 – Create a smoke test so WP01 has something to go green on

- **Purpose**: Prove that the test runner works end-to-end before WP02 starts writing real tests.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/tests/keyboard/smoke.test.ts`.
  2. Contents:
     ```typescript
     import { describe, it, expect } from 'vitest';

     describe('test harness smoke', () => {
       it('runs vitest successfully', () => {
         expect(1 + 1).toBe(2);
       });
     });
     ```
  3. Run `npm run test:run` from the repo root. Confirm it prints a passing test and exits with code 0.
  4. Run `npm run typecheck`. Confirm it exits 0. If it fails because `tsconfig.json` does not include `tests/`, add the `tests` folder to the `include` array of the existing `tsconfig.json` (or `tsconfig.app.json` if the project splits configs).
  5. Run `npm run lint`. Confirm it exits 0. If lint errors in `tests/setup.ts` (e.g., "jest-dom types not found"), add `tests/**/*.ts` and `tests/**/*.tsx` to the existing ESLint file patterns or add appropriate type imports.
- **Files**: `tests/keyboard/smoke.test.ts` (new); possibly `tsconfig.json` or `tsconfig.app.json` and the ESLint config.
- **Parallel?**: No.
- **Notes**: Keep this smoke test. WP02 will add `alphabets.test.ts` alongside it; do not delete the smoke test in WP02. It's a cheap canary that catches config breakage.

## Risks & Mitigations

- **Vitest incompatible with Vite 8**: Pin `vitest@^2.x` which explicitly supports Vite 8.
- **`@testing-library/react` incompatible with React 19**: Use `@testing-library/react@^16` or later.
- **TypeScript config does not include tests/**: Add `tests/**/*` to the `include` array. If two tsconfigs exist (`tsconfig.json` + `tsconfig.app.json`), tests usually go in a separate `tsconfig.test.json` referenced by a root project reference. Keep it simple: add the tests directory to the main app config if that works without polluting the production build.
- **ESLint does not lint tests**: This is acceptable as long as `npm run lint` exits 0. If lint does run over tests and flags things like "no-undef" for globals, extend the ESLint override to recognize Vitest globals.
- **Package-lock drift**: `package-lock.json` will change significantly. Commit it as-is — do not hand-edit.

## Review Guidance

The reviewer for WP01 must verify:

1. `npm install` runs cleanly on a fresh clone.
2. `npm run test:run` exits 0 with exactly one passing test (the smoke test).
3. `npm run typecheck` exits 0.
4. `npm run lint` exits 0.
5. No files under `src/` are modified.
6. No `node_modules` or lockfile-only commits; `package.json` changes are limited to `devDependencies` and `scripts`.
7. `vitest.config.ts`, `tests/setup.ts`, and `tests/keyboard/smoke.test.ts` exist and match the shape described above.

## Activity Log

- 2026-04-14T14:01:38Z – system – lane=planned – Prompt created.
- 2026-04-14T14:15:54Z – claude-opus-4-6 – shell_pid=19334 – lane=doing – Assigned agent via workflow command
- 2026-04-14T14:20:33Z – claude-opus-4-6 – shell_pid=19334 – lane=for_review – Ready for review: Vitest 2 + RTL 16 test harness bootstrapped. typecheck/lint/test:run all green on Node 22 (project's required Vite 8 engine). No src/ changes.
- 2026-04-15T07:15:30Z – claude-opus-4-6 – shell_pid=35450 – lane=doing – Started review via workflow command
