# Local Storage API Contract

**Feature**: 001-translate-and-configure

This feature has no server API — all data is local. This document defines the internal API surface (React hooks and utility functions) that components will use to interact with the translation and configuration system.

## Hooks

### useLanguage()

```typescript
function useLanguage(): {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  dir: "ltr" | "rtl";
}
```

- Reads/writes `communicaid-language` in localStorage
- Triggers re-render on language change
- Sets `document.documentElement.dir` as side effect

### useTranslation()

```typescript
function useTranslation(): {
  t: (entryId: string) => string;           // Returns text in current language
  tEn: (entryId: string) => string | null;  // Returns English subtitle (null if lang is EN)
  icon: (entryId: string) => string;        // Returns icon (override or default)
}
```

- Depends on `useLanguage()` for current language
- Merges defaults with overrides from localStorage
- Memoized for performance

### useOverrides(categoryId: string)

```typescript
function useOverrides(categoryId: string): {
  overrides: Record<string, CustomOverride>;
  setOverride: (entryId: string, patch: { text?: string; icon?: string }) => void;
  resetCategory: () => void;
}
```

- Scoped to a specific category for the current language
- `setOverride` writes to localStorage immediately
- `resetCategory` removes all overrides for the category + current language

## Utility Functions

### getLanguageConfig(code: Language)

```typescript
function getLanguageConfig(code: Language): {
  code: Language;
  name: string;       // "English" | "עברית" | "العربية"
  nativeName: string; // Same as name
  dir: "ltr" | "rtl";
  isRTL: boolean;
}
```

### resolveEntry(entryId: string, language: Language, overrides: Record<string, CustomOverride>)

```typescript
function resolveEntry(
  entryId: string,
  language: Language,
  overrides: Record<string, CustomOverride>
): { text: string; icon: string; subtitle: string | null }
```

Pure function. No side effects. Used by `useTranslation` internally and available for testing.
