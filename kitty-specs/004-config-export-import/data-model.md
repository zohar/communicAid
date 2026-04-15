# Data Model: Config Export & Import

This feature reuses existing TypeScript shapes from `src/types.ts` and the three localStorage keys defined by spec 001. It introduces **one** new type for the exported file and **one** new type for the import-validation result. No new persistent state, no new entities.

## Existing shapes (unchanged)

These come from the current codebase and are read/written as-is:

```ts
// src/types.ts
type Language = 'en' | 'he' | 'ar' | 'ru';

interface CustomOverride {
  entryId: string;
  language: Language;
  text?: string;   // max 100 chars (spec 001 NFR-04)
  icon?: string;   // max 100 chars
}

// src/hooks/useQuickNames.ts (private)
type StoredQuickName = {
  id: string;
  name: string;     // max 100 chars
  icon: string;     // max 100 chars
  position: number;
};
```

## New shapes (added by this feature)

In `src/utils/configIO.ts`:

```ts
/**
 * The on-disk shape of an exported configuration file.
 * Mirrors the three localStorage keys 1:1.
 *
 * Every top-level field is optional so that a file missing a section
 * is treated as "no customization for that section" on import (FR-009).
 */
export interface ExportedConfig {
  overrides?: Record<string, CustomOverride>;
  quickNames?: StoredQuickName[];
  language?: Language;
}

/** Result of parseAndValidate — discriminated union, no exceptions. */
export type ImportResult =
  | { ok: true; config: ExportedConfig }
  | { ok: false; error: ImportError };

/** Why an import failed — used to render a clear error message. */
export type ImportError =
  | { kind: 'invalid_json'; message: string }
  | { kind: 'invalid_shape'; message: string }
  | { kind: 'invalid_language'; message: string }
  | { kind: 'oversized_field'; message: string }
  | { kind: 'storage_error'; message: string };
```

## Persistence layer (unchanged)

| localStorage key | Type | Owner |
|---|---|---|
| `communicaid-overrides` | JSON-stringified `Record<string, CustomOverride>` | `useOverrides` (read/write); this feature reads on export, writes on import |
| `communicaid-quick-names` | JSON-stringified `StoredQuickName[]` | `useQuickNames` (read/write); this feature reads on export, writes on import |
| `communicaid-language` | plain string `Language` | `useLanguage` (read/write); this feature reads on export, writes on import |

## Change events (unchanged + one addition)

| Event | Status | Dispatched by | Subscribed by |
|---|---|---|---|
| `communicaid-overrides-changed` | existing | `useOverrides.saveAllOverrides`, `applyConfig` | `useOverrides` (NEW subscription added by this feature), `useTranslation` |
| `communicaid-quick-names-changed` | existing | `useQuickNames.save`/`reset`, `applyConfig` | `useQuickNames` (already subscribes) |
| `communicaid-language-changed` | **NEW** | `useLanguage.setLanguage`, `applyConfig` | `useLanguage` (NEW subscription added by this feature) |

## State transitions

There are exactly two state-changing operations introduced by this feature:

1. **Export** — pure read. No state changes. Returns a string.
2. **Import** (after user confirmation) — atomic write to all three localStorage keys, followed by dispatch of all three change events. If `localStorage.setItem` throws partway through, the previous state of all three keys is restored from a snapshot taken before the first write (research R8).

There are no other state transitions, no in-progress states, no async coordination, no undo log.
