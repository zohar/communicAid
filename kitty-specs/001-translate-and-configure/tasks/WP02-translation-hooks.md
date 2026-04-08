---
work_package_id: WP02
title: Translation Hooks
lane: "doing"
dependencies: []
requirement_refs:
- C-05
- FR-12
- FR-14
- FR-15
planning_base_branch: translate-and-configure
merge_target_branch: translate-and-configure
branch_strategy: Planning artifacts for this feature were generated on translate-and-configure. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into translate-and-configure unless the human explicitly redirects the landing branch.
base_branch: translate-and-configure
base_commit: 774245b1b8e5e6050e286c90df1626c5524b4c87
created_at: '2026-04-08T13:42:49.962758+00:00'
subtasks: [T007, T008, T009, T010]
shell_pid: "75646"
history:
- timestamp: '2026-04-08T13:22:32Z'
  action: created
  by: spec-kitty.tasks
---

# WP02: Translation Hooks

## Objective

Implement the three custom React hooks (`useLanguage`, `useTranslation`, `useOverrides`) and the `resolveEntry` utility function that power the entire translation and configuration system. These hooks are the API that all components will use.

## Branch Strategy

- **Planning/base branch**: `translate-and-configure`
- **Merge target**: `translate-and-configure`
- **Implementation command**: `spec-kitty implement WP02 --base WP01`

## Context

**Dependencies**: WP01 must be complete (types and translation dictionaries available).

**Reference files**:
- `kitty-specs/001-translate-and-configure/contracts/local-storage-api.md` — hook API signatures
- `kitty-specs/001-translate-and-configure/data-model.md` — resolution logic, localStorage schema
- `src/types.ts` — Language, TranslationDictionary, CustomOverride types (from WP01)
- `src/data/translations/index.ts` — translations and language configs (from WP01)

## Subtasks

### T010: Create resolveEntry Utility Function

**Purpose**: Pure function that resolves display text, icon, and English subtitle for any entry given a language and overrides map. This is the core resolution logic used by `useTranslation`.

**Steps**:
1. Create `src/hooks/resolveEntry.ts` (or `src/utils/resolveEntry.ts` — keep it alongside hooks since it's tightly coupled):
   ```typescript
   import { Language, CustomOverride, TranslationDictionary } from '../types';
   import { translations } from '../data/translations';

   export function resolveEntry(
     entryId: string,
     language: Language,
     overrides: Record<string, CustomOverride>
   ): { text: string; icon: string; subtitle: string | null } {
     const overrideKey = `${entryId}:${language}`;
     const override = overrides[overrideKey];

     const text = override?.text ?? translations[language]?.[entryId] ?? translations.en[entryId] ?? entryId;
     const icon = override?.icon ?? ''; // Icons come from categories.ts, not translations
     const subtitle = language === 'en' ? null : (translations.en[entryId] ?? null);

     return { text, icon, subtitle };
   }
   ```
2. Note: The `icon` resolution needs refinement — icons are stored in `categories.ts` on the entry objects, not in translation dictionaries. The override can replace the icon, but the default icon comes from the category data, not from resolveEntry. Consider having resolveEntry only handle text + subtitle, and let components read icons from category data directly (with override check).

   **Recommended approach**: resolveEntry handles text and subtitle only. Icon override is a separate concern handled by `useOverrides`.

**Files**: `src/hooks/resolveEntry.ts` (new)

**Validation**:
- [ ] Returns correct text for default (no override) case
- [ ] Returns override text when override exists
- [ ] Returns English subtitle when language is not English
- [ ] Returns null subtitle when language is English
- [ ] Falls back to English text when translation is missing
- [ ] Falls back to entry ID when no translation exists at all

---

### T007: Implement useLanguage Hook

**Purpose**: Manage the global language state — read/write language preference to localStorage, set the HTML `dir` attribute, and trigger re-renders when language changes.

**Steps**:
1. Create `src/hooks/useLanguage.ts`:
   ```typescript
   import { useState, useEffect, useCallback } from 'react';
   import { Language } from '../types';
   import { languageConfigs, defaultLanguage } from '../data/translations';

   const STORAGE_KEY = 'communicaid-language';

   function getStoredLanguage(): Language {
     const stored = localStorage.getItem(STORAGE_KEY);
     if (stored === 'en' || stored === 'he' || stored === 'ar') return stored;
     return defaultLanguage;
   }

   export function useLanguage() {
     const [language, setLanguageState] = useState<Language>(getStoredLanguage);

     const setLanguage = useCallback((lang: Language) => {
       localStorage.setItem(STORAGE_KEY, lang);
       setLanguageState(lang);
     }, []);

     useEffect(() => {
       const config = languageConfigs[language];
       document.documentElement.dir = config.dir;
       document.documentElement.lang = language;
     }, [language]);

     const config = languageConfigs[language];

     return {
       language,
       setLanguage,
       isRTL: config.isRTL,
       dir: config.dir,
     };
   }
   ```
2. The hook reads from localStorage on mount (synchronous, no loading state needed).
3. `useEffect` sets `dir` and `lang` on `<html>` element whenever language changes.

**Files**: `src/hooks/useLanguage.ts` (new)

**Validation**:
- [ ] Returns `'en'` as default when no localStorage value exists
- [ ] Persists language choice to localStorage
- [ ] Sets `document.documentElement.dir` to `'rtl'` for HE/AR
- [ ] Sets `document.documentElement.dir` to `'ltr'` for EN
- [ ] Sets `document.documentElement.lang` attribute
- [ ] Re-renders components when language changes

---

### T008: Implement useTranslation Hook

**Purpose**: Provide `t()`, `tEn()`, and `icon()` functions that components use to get translated text and icons for any entry ID.

**Steps**:
1. Create `src/hooks/useTranslation.ts`:
   ```typescript
   import { useMemo } from 'react';
   import { useLanguage } from './useLanguage';
   import { translations } from '../data/translations';
   import { CustomOverride } from '../types';

   const OVERRIDES_KEY = 'communicaid-overrides';

   function getStoredOverrides(): Record<string, CustomOverride> {
     try {
       const stored = localStorage.getItem(OVERRIDES_KEY);
       return stored ? JSON.parse(stored) : {};
     } catch {
       return {};
     }
   }

   export function useTranslation() {
     const { language } = useLanguage();
     const overrides = getStoredOverrides();

     const t = useMemo(() => (entryId: string): string => {
       const overrideKey = `${entryId}:${language}`;
       const override = overrides[overrideKey];
       if (override?.text) return override.text;
       return translations[language]?.[entryId] ?? translations.en[entryId] ?? entryId;
     }, [language, overrides]);

     const tEn = useMemo(() => (entryId: string): string | null => {
       if (language === 'en') return null;
       return translations.en[entryId] ?? null;
     }, [language]);

     const icon = useMemo(() => (entryId: string): string | null => {
       const overrideKey = `${entryId}:${language}`;
       const override = overrides[overrideKey];
       return override?.icon ?? null; // null means "use default icon from category data"
     }, [language, overrides]);

     return { t, tEn, icon };
   }
   ```

2. **Important**: The overrides are read from localStorage on each render. This is intentional — when the config screen writes an override, the communication screen picks it up on next render. For better reactivity, consider using a state variable that syncs with localStorage via a `storage` event listener (cross-tab sync, though not required for this feature).

3. **Simpler approach**: Read overrides once via useState + useEffect on mount. Re-read when a custom event is dispatched after writing overrides. This avoids reading localStorage on every render.

**Files**: `src/hooks/useTranslation.ts` (new)

**Validation**:
- [ ] `t('happy')` returns "Happy" when language is EN
- [ ] `t('happy')` returns "שמח" when language is HE
- [ ] `t('happy')` returns override text when override exists
- [ ] `tEn('happy')` returns "Happy" when language is HE
- [ ] `tEn('happy')` returns null when language is EN
- [ ] `icon('happy')` returns null when no icon override exists
- [ ] `icon('happy')` returns override icon when override exists

---

### T009: Implement useOverrides Hook

**Purpose**: CRUD operations for custom entry overrides, scoped to a specific category. Used by the config screen's CategoryEditor.

**Steps**:
1. Create `src/hooks/useOverrides.ts`:
   ```typescript
   import { useState, useCallback } from 'react';
   import { Language, CustomOverride } from '../types';
   import { useLanguage } from './useLanguage';
   import { categories } from '../data/categories';

   const OVERRIDES_KEY = 'communicaid-overrides';

   function getAllOverrides(): Record<string, CustomOverride> {
     try {
       const stored = localStorage.getItem(OVERRIDES_KEY);
       return stored ? JSON.parse(stored) : {};
     } catch {
       return {};
     }
   }

   function saveAllOverrides(overrides: Record<string, CustomOverride>) {
     localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
   }

   export function useOverrides(categoryId: string) {
     const { language } = useLanguage();
     const [overrides, setOverrides] = useState<Record<string, CustomOverride>>(getAllOverrides);

     const setOverride = useCallback((entryId: string, patch: { text?: string; icon?: string }) => {
       setOverrides(prev => {
         const key = `${entryId}:${language}`;
         const updated = {
           ...prev,
           [key]: {
             entryId,
             language,
             ...prev[key],
             ...patch,
           },
         };
         saveAllOverrides(updated);
         return updated;
       });
     }, [language]);

     const resetCategory = useCallback(() => {
       setOverrides(prev => {
         // Find all entry IDs belonging to this category
         const category = categories.find(c => c.id === categoryId);
         if (!category) return prev;

         const entryIds = new Set<string>();
         entryIds.add(categoryId); // category name itself
         category.items?.forEach(item => entryIds.add(item.id));
         category.phrases?.forEach(phrase => entryIds.add(phrase.id));
         category.subcategories?.forEach(sub => {
           entryIds.add(sub.id);
           sub.items?.forEach(item => entryIds.add(item.id));
           sub.phrases?.forEach(phrase => entryIds.add(phrase.id));
         });

         // Remove all overrides for these entries in the current language
         const updated = { ...prev };
         for (const entryId of entryIds) {
           delete updated[`${entryId}:${language}`];
         }
         saveAllOverrides(updated);
         return updated;
       });
     }, [categoryId, language]);

     return { overrides, setOverride, resetCategory };
   }
   ```

2. The hook manages a local copy of all overrides (initialized from localStorage) and writes back on every change. `resetCategory` removes all overrides for the given category's entries in the current language.

**Files**: `src/hooks/useOverrides.ts` (new)

**Validation**:
- [ ] `setOverride` persists to localStorage
- [ ] `setOverride` merges text/icon independently (can override text without affecting icon)
- [ ] `resetCategory` removes only overrides for entries in the specified category
- [ ] `resetCategory` only removes overrides for the current language
- [ ] `resetCategory` does not affect other categories' overrides
- [ ] State updates trigger re-render

## Definition of Done

- [ ] All four files created: `resolveEntry.ts`, `useLanguage.ts`, `useTranslation.ts`, `useOverrides.ts`
- [ ] `useLanguage` reads/writes localStorage and sets dir attribute
- [ ] `useTranslation` returns correct text for default and overridden entries
- [ ] `useOverrides` supports set, merge, and reset operations
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Risks

- **localStorage read on every render**: `useTranslation` reads overrides from localStorage each render. For the communication screen (which re-renders on item tap), this should be fast enough (<1ms for small JSON). If performance issues arise, refactor to use state + event listener pattern.
- **Cross-component sync**: When config screen writes overrides and user navigates back to communication, the communication screen needs to pick up changes. Since both screens unmount/remount on navigation, this works automatically (hooks re-read localStorage on mount).

## Reviewer Guidance

- Verify localStorage key names match the data-model.md spec (`communicaid-language`, `communicaid-overrides`)
- Check that `useLanguage` sets both `dir` and `lang` on `document.documentElement`
- Verify `resolveEntry` fallback chain: override → language translation → English translation → entry ID
- Confirm `resetCategory` correctly walks the category tree (including subcategory items)
