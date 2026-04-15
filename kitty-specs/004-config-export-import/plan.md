# Implementation Plan: Config Export & Import

**Branch**: `deploy-and-export` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `kitty-specs/004-config-export-import/spec.md`

## Summary

Add two buttons to `ConfigScreen.tsx` — **Export configuration** and **Import configuration** — that let a caregiver back up and restore the entire user-customization layer (text/icon overrides, quick names, language) as a single JSON file. The download uses the native Blob/URL pattern; the upload uses a hidden `<input type="file">`. The serialization, parsing, and validation logic lives in a new pure module `src/utils/configIO.ts` so it can be unit-tested with Vitest. Import is **validate-then-write**: the file is parsed and validated against the existing TypeScript shapes before any localStorage key is touched, so a failed import leaves state byte-identical (SC-005). Two existing hooks (`useLanguage`, `useOverrides`) need a tiny additive change to listen for change events so the rest of the UI updates immediately after import without a page refresh (FR-010, SC-004).

## Technical Context

**Language/Version**: TypeScript 6 (existing strict config), React 19.
**Primary Dependencies**: None new. Uses native `Blob`, `URL.createObjectURL`, `<input type="file">`, `JSON.parse`/`stringify`, and the existing custom-event mechanism (`communicaid-overrides-changed`, `communicaid-quick-names-changed`, plus a new `communicaid-language-changed`).
**Storage**: Browser localStorage. Three existing keys, unchanged in shape: `communicaid-overrides`, `communicaid-quick-names`, `communicaid-language`.
**Testing**: Vitest (already in `vitest.config.ts`). Pure functions in `configIO.ts` are unit-tested first (TEST_FIRST). The React component changes are kept minimal so they can be smoke-tested manually in the dev server.
**Target Platform**: Modern tablet browsers (the same set the SPA already targets).
**Project Type**: Single project (existing structure).
**Performance Goals**: Export <1s, import <1s on a typical tablet, for any realistic configuration (well under the 1 MB localStorage cap from spec 001 NFR-05). Easily met — operations are pure JSON on a few KB.
**Constraints**: No new npm dependencies. No backend, no network calls. No file versioning, no schema-version field, no rollback history. Validate-then-write. Full replace, not merge. UI lives inside `ConfigScreen.tsx` — no new top-level navigation.
**Scale/Scope**: 3 source files added (`src/utils/configIO.ts`, `src/utils/configIO.test.ts`, `src/components/screens/ConfigScreen.tsx` modifications). 2 source files touched additively (`src/hooks/useLanguage.ts`, `src/hooks/useOverrides.ts`) to wire up change-event listeners.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see end of this section.*

| Constitution Item | Status | How this feature complies |
|---|---|---|
| **TEST_FIRST directive** | Pass | The pure functions in `configIO.ts` (`exportConfig`, `parseAndValidate`, `applyConfig`) are unit-tested in `configIO.test.ts` **before** the implementation lands. The test file is the first thing the implementer writes; tests must fail (red), then the implementation makes them pass (green). React/UI integration is intentionally thin (button onClick handlers + a dialog) so the bulk of behavior is covered by Vitest. |
| **Vitest / Playwright coverage 80%+** | Pass | New module is pure functions; coverage will be 100% on `configIO.ts`. UI changes are minimal glue. Net coverage stays at or above 80%+. |
| **ESLint clean / TypeScript strict** | Pass | All new code is TypeScript strict, follows existing ESLint rules. No `any`. No `// @ts-ignore`. |
| **Lighthouse a11y ≥ 90** | Pass | New buttons reuse the existing config-screen button style (already 48px+, high contrast). Confirmation/error dialogs use plain language, large text, two clearly-labeled actions (NFR-004). |
| **FCP < 2s on mobile 3G** | Pass | Module is small (estimated <2 KB minified). No new dependencies. No code-splitting concerns. |
| **No service-role keys in frontend** | Pass | No backend or API keys involved. |
| **No analytics / third-party tracking** | Pass | Fully offline; no network calls (NFR-006, FR-013, SC-007). |
| **Branch strategy: at least one reviewer approves** | Pass | Standard review flow. |
| **Deployable to Netlify and/or Coolify** | Pass | Pure SPA change; no deployment surface change. |

**Result**: All gates pass. No complexity-tracking entries needed.

**Post-design re-check** (after Phase 1): Still passing. The change-event additions to `useLanguage` and `useOverrides` are small, additive, and do not change the existing persistence contract (C-004).

## Project Structure

### Documentation (this feature)

```
kitty-specs/004-config-export-import/
├── spec.md              # Feature specification (already written)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (file shape)
├── quickstart.md        # Phase 1 output (manual end-to-end smoke test)
├── contracts/
│   └── config-file.md   # Phase 1 output (the export-file JSON contract)
├── checklists/
│   └── requirements.md  # Spec quality checklist (already passed)
└── tasks/               # Created later by /spec-kitty.tasks
```

### Source Code (repository root)

```
src/
├── utils/
│   ├── configIO.ts          # NEW — pure export/parse/validate/apply functions
│   └── configIO.test.ts     # NEW — Vitest unit tests, written first (TEST_FIRST)
├── components/
│   └── screens/
│       └── ConfigScreen.tsx # MODIFIED — adds Export & Import buttons + dialogs
├── hooks/
│   ├── useLanguage.ts       # MODIFIED — dispatches/listens to communicaid-language-changed
│   └── useOverrides.ts      # MODIFIED — listens to communicaid-overrides-changed
└── ... (everything else unchanged)
```

**Structure Decision**: Pure logic in a `utils/` module, UI in the existing `ConfigScreen`, minimal additive edits to two hooks. This keeps the high-value logic test-first and the UI surface area trivially reviewable.

## Complexity Tracking

*Not applicable — Constitution Check passed cleanly with no violations.*

## Parallel Work Analysis

Single-developer feature, no parallelism needed. The work is naturally sequential:

1. Tests for `configIO.ts` (red).
2. `configIO.ts` implementation (green).
3. Hook subscription edits (`useLanguage`, `useOverrides`).
4. `ConfigScreen.tsx` UI wiring (Export button → download, Import button → file picker → confirm dialog → apply).
5. Manual end-to-end smoke test from `quickstart.md`.

## Phase 0: Research

See [research.md](./research.md). All decisions are locked from spec Constraints + the existing codebase shapes. Research consolidates the rationale for: file shape, validate-then-write architecture, the change-event additions to two hooks, error-handling UX, and the Vitest test plan.

## Phase 1: Design Artifacts

- **Config-file contract**: [contracts/config-file.md](./contracts/config-file.md) — the exact JSON shape exported and accepted on import.
- **Data model**: [data-model.md](./data-model.md) — the TypeScript shapes the validator targets.
- **Quickstart**: [quickstart.md](./quickstart.md) — manual end-to-end smoke test the implementer runs in the dev server before moving the WP to review.

**Agent context update**: No CLAUDE.md changes needed; the existing project description already covers user customizations.

## Next Step

Run `/spec-kitty.tasks` to break this plan into work packages.

---

**Branch contract (final restatement before tasks):**
- Current branch: `deploy-and-export`
- Planning/base branch: `deploy-and-export`
- Final merge target: `deploy-and-export`
- `branch_matches_target`: **true**
