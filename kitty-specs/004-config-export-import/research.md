# Phase 0 Research: Config Export & Import

All decisions are locked. No outstanding `[NEEDS CLARIFICATION]` items.

## R1. File format and shape

- **Decision**: A single JSON object with exactly three top-level keys: `overrides`, `quickNames`, `language`. No metadata wrapper, no version field, no timestamp. Pretty-printed with 2-space indent.
- **Rationale**: The user explicitly asked to drop versioning. The three keys map 1:1 to the existing localStorage keys, so the serialization is essentially `{ overrides: parse(LS.overrides), quickNames: parse(LS.quickNames), language: LS.language }`. Trivially explainable, trivially testable.
- **Alternatives considered**:
  - `{ "version": 1, "exportedAt": "...", "config": { ... } }` — adds future-proofing but the user explicitly rejected versioning. Doing it anyway would violate C-003.
  - YAML — would require adding `js-yaml`, violating NFR-005 (no new deps).

## R2. Validate-then-write architecture

- **Decision**: The import flow is split into two pure functions:
  1. `parseAndValidate(text: string): Result<ValidConfig, ImportError>` — parses JSON, validates every field against the existing TypeScript shapes, returns either a fully-valid config object or an error. **Touches no state.**
  2. `applyConfig(config: ValidConfig): void` — writes the three localStorage keys and dispatches the three change events. **Only called after validation passes and the user confirms.**
- **Rationale**: This is the central reliability invariant. SC-005 requires that a failed import leaves state byte-identical to its pre-import state. The only way to guarantee that is to do **all** validation before **any** write. There is no rollback logic; there's nothing to roll back from.
- **Alternatives considered**: Write-then-rollback (try writes, catch failures, restore previous state). Vastly more complex, error-prone, and harder to test. Rejected.

## R3. Validation rules

- **Decision**: The validator enforces the following minimum rules. Anything else is silently ignored (forward-compatible with future fields):
  - Top-level value MUST be an object (not array, null, etc.).
  - `overrides`, if present, MUST be an object whose values are objects with `entryId: string` and `language: 'en'|'he'|'ar'|'ru'`. Optional `text: string` (max 100 chars per spec 001 NFR-04). Optional `icon: string` (max 100 chars). Keys SHOULD match `${entryId}:${language}` but are not strictly enforced — the value's `entryId`/`language` fields are authoritative.
  - `quickNames`, if present, MUST be an array of objects with `id: string`, `name: string` (max 100 chars), `icon: string` (max 100 chars), `position: number`.
  - `language`, if present, MUST be one of `'en' | 'he' | 'ar' | 'ru'`.
  - Missing top-level keys are treated as "no customization" — the corresponding localStorage key is removed/cleared on apply (matching the "full replace" mental model in FR-009).
- **Rationale**: Just enough validation to prevent silently corrupting state. Lenient on unknown fields (forward-compat); strict on type safety. The 100-char limit on text/icon mirrors the in-app editor's existing limits.
- **Alternatives considered**: Schema-validation library (`zod`, `valibot`, etc.) — overkill for a 4-field schema and would violate NFR-005. Manual validation in <80 lines of TypeScript is fine.

## R4. Change-event additions to two hooks

- **Decision**: Make two small additive edits:
  1. `src/hooks/useLanguage.ts`: dispatch a new `communicaid-language-changed` event when `setLanguage` is called, AND subscribe to it via `useEffect` so multiple `useLanguage()` instances in the same page stay in sync.
  2. `src/hooks/useOverrides.ts`: subscribe to the existing `communicaid-overrides-changed` event via `useEffect` so multiple `useOverrides()` instances stay in sync. The event is already dispatched by `saveAllOverrides` — the hook just doesn't listen for it today.
- **Rationale**: Without these, an import would write the new config to localStorage but the running React app would still show the old values until the user manually refreshed. That violates FR-010 ("immediately, without requiring a page refresh") and SC-004. The change is small (~5-10 lines per hook), additive (no behavior change for existing callers), and matches the pattern `useQuickNames` already uses.
- **Alternative considered**: Force a `window.location.reload()` after import. Simpler in `configIO.ts` but worse UX (loses scroll position, feels janky on a tablet) and contradicts the spec.

## R5. Confirmation dialog UX

- **Decision**: Use a native `window.confirm()` for the "this will replace your current configuration — continue?" prompt. For error reporting after a failed import, use `window.alert()`.
- **Rationale**: Zero new components, zero new dependencies. The text matches NFR-004 (plain language, two clear actions). Native dialogs are accessible by default and respect the OS-level a11y settings (font size, screen reader). For a feature this small, building a custom modal is over-engineering.
- **Alternative considered**: A custom React modal styled to match the rest of the app. Worth doing eventually for visual consistency, but **out of scope** for this minimal feature. If the user later wants a styled modal, that's a follow-up feature.
- **Note**: If during implementation the team decides a styled modal is mandatory, that's acceptable scope leakage **only if** it does not add new dependencies. Using a native HTML `<dialog>` element is fine.

## R6. Filename and download mechanism

- **Decision**: Filename `communicaid-config.json`. Download via the standard Blob → `URL.createObjectURL` → temporary anchor click → `URL.revokeObjectURL` pattern.
- **Rationale**: This is the canonical browser pattern for "download a generated file". Works on all modern browsers without any library. The fixed filename is fine because the user can rename on save; adding a date stamp would help disambiguate multiple backups but adds complexity the user explicitly rejected.
- **Alternative considered**: `communicaid-config-YYYY-MM-DD.json` with a date stamp. Marginal benefit, adds 3 lines of code. Skipped per "easiest possible" guidance.

## R7. Test strategy (Vitest)

- **Decision**: All new tests live in `src/utils/configIO.test.ts`. Cases:
  1. `exportConfig` produces a valid JSON object with the three expected keys.
  2. `exportConfig` includes empty objects/arrays when there are no customizations.
  3. `parseAndValidate` accepts a round-trip of `exportConfig`'s output.
  4. `parseAndValidate` rejects non-JSON input.
  5. `parseAndValidate` rejects an array at the top level.
  6. `parseAndValidate` rejects an unknown language code.
  7. `parseAndValidate` rejects an oversized text override.
  8. `parseAndValidate` accepts missing top-level keys (treats them as "no customization").
  9. `parseAndValidate` ignores unknown top-level keys (forward-compat).
  10. `applyConfig` writes all three localStorage keys correctly.
  11. `applyConfig` clears keys for sections missing in the input (full replace).
  12. `applyConfig` dispatches the three change events.
- **Rationale**: 12 small unit tests cover every functional requirement, every edge case in the spec, and the validate-then-write invariant. The React UI changes are too thin to need unit tests (they're glue between `configIO` and `window.confirm`/file picker); the manual smoke test in `quickstart.md` covers the integration path.
- **TEST_FIRST mapping**: All 12 tests are written **before** `configIO.ts` exists. They must fail (red). Then the implementation is written; they must all pass (green). The WP cannot move to `done` until they're all green.

## R8. Edge case: localStorage write failure

- **Decision**: If `localStorage.setItem` throws (quota exceeded, private browsing mode), `applyConfig` catches the error and re-throws as `{ kind: 'storage_error', message: ... }`. The UI surfaces this as an error dialog. Because writes happen sequentially across three keys, a partial write is theoretically possible — `applyConfig` snapshots the three current values **before** writing the first key, and on failure restores them. This is the **only** rollback in the entire feature, and it's necessary because localStorage doesn't support transactions.
- **Rationale**: Quota exceeded is unlikely (config is typically a few KB) but not impossible. A partial-write would leave the user in an inconsistent state, which is worse than failing the import. The snapshot-and-restore is ~10 lines of code and makes SC-005 hold even under storage pressure.
- **Alternative considered**: Ignore quota errors. Rejected — silent corruption is the worst possible failure mode.
