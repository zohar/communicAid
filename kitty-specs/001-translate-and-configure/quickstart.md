# Quickstart: Translate & Configure

**Feature**: 001-translate-and-configure

## Architecture Overview

```
src/
  data/
    categories.ts         → REFACTOR: Extract structure, remove hardcoded English text
    translations/
      en.ts               → NEW: English translation dictionary
      he.ts               → NEW: Hebrew translation dictionary  
      ar.ts               → NEW: Arabic translation dictionary
      index.ts            → NEW: Export all translations, types
  hooks/
    useLanguage.ts        → NEW: Language state + localStorage + dir attribute
    useTranslation.ts     → NEW: Translation lookup with override merging
    useOverrides.ts       → NEW: Custom override CRUD + localStorage
  components/
    CategoryTile.tsx      → MODIFY: Accept subtitle prop, render dual-language
    ItemButton.tsx        → MODIFY: Accept subtitle prop, render dual-language
    ActionBar.tsx         → MODIFY: Translate action labels, translate quick names
    Header.tsx            → MODIFY: Add settings icon, translate title
    RecentItems.tsx       → MODIFY: Translate recent item labels
    screens/
      HomeScreen.tsx      → MODIFY: Use translation hook
      CategoryScreen.tsx  → MODIFY: Use translation hook
      ConfigScreen.tsx    → NEW: Configuration root screen
    config/
      LanguagePicker.tsx  → NEW: Language selector (EN/HE/AR)
      CategoryEditor.tsx  → NEW: Edit items in a category
      EntryEditor.tsx     → NEW: Edit single entry (text + icon)
      IconPicker.tsx      → NEW: Searchable lucide icon grid
      ResetButton.tsx     → NEW: Reset category to defaults
  types.ts                → MODIFY: Add Language, TranslatedEntry, CustomOverride types
  App.tsx                 → MODIFY: Add config screen route, wrap with language context
```

## Key Design Decisions

1. **No i18n library** — translations are structured data lookups, not UI strings
2. **Sparse overrides** — only edited entries stored in localStorage, defaults bundled
3. **RTL via `dir` attribute** — Tailwind logical properties handle layout flipping
4. **Icon picker is code-split** — only loaded in config screen (lazy import)
5. **React hooks for state** — no external state management per constitution

## Implementation Order

1. Translation data layer (types, dictionaries, hooks)
2. RTL support (dir attribute, logical property migration)
3. Dual-language button display (component modifications)
4. Configuration screen (new screens + editors)
5. Icon picker (code-split component)
6. Local persistence (localStorage integration)
7. Reset to defaults functionality

## Testing Strategy

- Unit tests (Vitest): Translation resolution, override merging, localStorage hooks
- Component tests: Dual-language rendering, RTL layout
- E2E tests (Playwright): Full config flow, language switching, offline persistence
