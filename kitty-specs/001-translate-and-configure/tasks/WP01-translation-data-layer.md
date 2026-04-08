---
work_package_id: WP01
title: Translation Data Layer
lane: planned
dependencies: []
requirement_refs:
- C-01
- C-02
- FR-01
- FR-02
planning_base_branch: translate-and-configure
merge_target_branch: translate-and-configure
branch_strategy: No dependencies — branch from translate-and-configure
subtasks: [T001, T002, T003, T004, T005, T006]
history:
- timestamp: '2026-04-08T13:22:32Z'
  action: created
  by: spec-kitty.tasks
---

# WP01: Translation Data Layer

## Objective

Create the type system and translation dictionaries that all other work packages build on. Refactor the existing `categories.ts` from hardcoded English strings to ID-based entries with bundled translations in English, Hebrew, and Arabic.

## Branch Strategy

- **Planning/base branch**: `translate-and-configure`
- **Merge target**: `translate-and-configure`
- **Implementation command**: `spec-kitty implement WP01`

## Context

**Current state**: `src/data/categories.ts` exports a `Category[]` with hardcoded English text in `name`, `text`, and `icon` fields. All components read from this directly.

**Target state**: Categories define structure only (IDs, relationships, special modes). All displayable text lives in translation dictionaries keyed by entry ID. Types enforce the contract.

**Reference files**:
- `kitty-specs/001-translate-and-configure/data-model.md` — entity definitions
- `kitty-specs/001-translate-and-configure/contracts/local-storage-api.md` — hook API surface
- `src/data/categories.ts` — current data structure
- `src/types.ts` — current type definitions

## Subtasks

### T001: Add Translation Types to types.ts

**Purpose**: Define the core types that the entire translation system relies on.

**Steps**:
1. Open `src/types.ts` and add the following types:
   ```typescript
   export type Language = "en" | "he" | "ar";

   export interface LanguageConfig {
     code: Language;
     name: string;        // "English", "עברית", "العربية"
     dir: "ltr" | "rtl";
     isRTL: boolean;
   }

   export interface TranslationDictionary {
     [entryId: string]: string;
   }

   export interface CustomOverride {
     entryId: string;
     language: Language;
     text?: string;
     icon?: string;
   }
   ```
2. Keep the existing `Category`, `Item`, `Phrase`, `RecentItem`, `QuickName` interfaces — they will be modified in T002.

**Files**: `src/types.ts` (modify)

**Validation**:
- [ ] `npm run typecheck` passes
- [ ] All new types are exported

---

### T002: Refactor categories.ts to Use Entry IDs

**Purpose**: Decouple the category structure from English text. Each item now has an `id` that maps to translation dictionaries.

**Steps**:
1. The current `Category` interface has `name: string` and items have `text: string`. These already have `id` fields that can serve as translation keys.
2. Modify the `Category` interface: keep `id`, `icon`, `subcategories`, `items`, `phrases`, `special` — but `name` becomes derived from translation lookup (no change to interface needed — components will use `t(category.id)` instead of `category.name`).
3. Similarly, `Item` and `Phrase` already have `id` and `icon` — `text` will be derived from `t(item.id)`.
4. The key insight: **don't remove the text fields from the types** yet. Instead, keep the current structure but ensure every `id` value is unique and stable. These IDs become translation keys.
5. Verify all IDs are unique across the entire categories array. Current IDs:
   - Categories: `feelings-pain`, `body-parts`, `food-drink`, `daily-tasks`, `time`, `places`, `people`, `objects`, `questions`
   - Subcategories: `fruits-vegetables`, `cooked-food`, `drinks`
   - Items: `happy`, `sad`, `scared`, `tired`, `cold`, `hot`, `head`, `throat`, `chest`, `stomach`, `arm`, `leg`, etc.
   - Phrases: `feel-better`, `feel-worse`, `in-pain`, `hurts-here`, `numb`, etc.
6. Check for duplicate IDs (e.g., `bathroom` appears in both Daily Tasks items and Places items, `when` appears in both Time items and Questions items). Disambiguate by prefixing with category: `daily-bathroom` vs `places-bathroom`, `time-when` vs `questions-when`.

**Files**: `src/data/categories.ts` (modify), `src/types.ts` (may need minor adjustments)

**Validation**:
- [ ] All entry IDs are unique
- [ ] No duplicate IDs exist across categories
- [ ] `npm run typecheck` passes
- [ ] Existing app still works (text fields still present as fallback)

**Edge cases**:
- The action bar items (Yes, No, Help, etc.) in `ActionBar.tsx` are currently inline objects, not in categories.ts. They need IDs too: `action-yes`, `action-no`, `action-help`, `action-i-want`, `action-i-dont-want`, `action-stop`, `action-more`, `action-less`.
- Quick name defaults need IDs: `quickname-nurse`, `quickname-mum`, `quickname-dad`, `quickname-doctor`.

---

### T003: Create English Translation Dictionary

**Purpose**: Bundle all English text as the default/fallback language dictionary.

**Steps**:
1. Create `src/data/translations/en.ts`
2. Export a `TranslationDictionary` mapping every entry ID to its English text:
   ```typescript
   import { TranslationDictionary } from '../../types';

   export const en: TranslationDictionary = {
     // Categories
     'feelings-pain': 'Feelings & Pain',
     'body-parts': 'Body Parts',
     'food-drink': 'Food & Drink',
     // ... all category names

     // Items
     'happy': 'Happy',
     'sad': 'Sad',
     // ... all item texts

     // Phrases
     'feel-better': 'I feel better',
     'feel-worse': 'I feel worse',
     // ... all phrase texts

     // Action bar
     'action-yes': 'Yes',
     'action-no': 'No',
     // ... all action labels

     // Quick name defaults
     'quickname-nurse': 'Nurse',
     // ... all quick name defaults

     // UI strings (config screen, headers)
     'home': 'Home',
     'recent': 'Recent',
     'common-phrases': 'Common Phrases',
     'subcategories': 'Subcategories',
     'choose': 'Choose',
     'or-choose': 'Or Choose',
     'pain-level': 'Pain Level (1-10)',
     'current-time': 'Current Time',
     'point-where-hurts': 'Point to where it hurts',
     'select-below': 'Or select from buttons below',
     'settings': 'Settings',
   };
   ```
3. Extract ALL text strings from `categories.ts`, `ActionBar.tsx`, `Header.tsx`, `CategoryScreen.tsx`, `RecentItems.tsx` — every user-visible string needs an entry.

**Files**: `src/data/translations/en.ts` (new)

**Validation**:
- [ ] Every entry ID in categories.ts has a corresponding entry in en.ts
- [ ] Every UI string in components has a corresponding entry
- [ ] `npm run typecheck` passes

---

### T004: Create Hebrew Translation Dictionary

**Purpose**: Bundle Hebrew translations for all entries.

**Steps**:
1. Create `src/data/translations/he.ts`
2. Export a `TranslationDictionary` with the same keys as `en.ts`, but with Hebrew values:
   ```typescript
   import { TranslationDictionary } from '../../types';

   export const he: TranslationDictionary = {
     'feelings-pain': 'רגשות וכאב',
     'body-parts': 'איברי הגוף',
     'food-drink': 'אוכל ושתייה',
     'daily-tasks': 'משימות יומיות',
     'time': 'זמן',
     'places': 'מקומות',
     'people': 'אנשים',
     'objects': 'חפצים',
     'questions': 'שאלות',
     // Items
     'happy': 'שמח',
     'sad': 'עצוב',
     'scared': 'מפחד',
     'tired': 'עייף',
     'cold': 'קר',
     'hot': 'חם',
     'head': 'ראש',
     'throat': 'גרון',
     'chest': 'חזה',
     'stomach': 'בטן',
     'arm': 'יד',
     'leg': 'רגל',
     // Phrases
     'feel-better': 'אני מרגיש יותר טוב',
     'feel-worse': 'אני מרגיש יותר גרוע',
     'in-pain': 'כואב לי',
     // ... all entries
     // Action bar
     'action-yes': 'כן',
     'action-no': 'לא',
     'action-help': 'עזרה',
     'action-i-want': 'אני רוצה',
     'action-i-dont-want': 'אני לא רוצה',
     'action-stop': 'עצור',
     'action-more': 'עוד',
     'action-less': 'פחות',
     // UI
     'home': 'בית',
     'recent': 'אחרונים',
     'settings': 'הגדרות',
     // ... all UI strings
   };
   ```
3. Ensure every key from en.ts is present. Use accurate Hebrew medical/daily vocabulary appropriate for hospital patients.

**Files**: `src/data/translations/he.ts` (new)

**Validation**:
- [ ] Same keys as en.ts (no missing, no extra)
- [ ] Hebrew text is accurate and appropriate for medical/hospital context
- [ ] `npm run typecheck` passes

---

### T005: Create Arabic Translation Dictionary

**Purpose**: Bundle Arabic translations for all entries.

**Steps**:
1. Create `src/data/translations/ar.ts`
2. Export a `TranslationDictionary` with the same keys as `en.ts`, but with Arabic values:
   ```typescript
   import { TranslationDictionary } from '../../types';

   export const ar: TranslationDictionary = {
     'feelings-pain': 'المشاعر والألم',
     'body-parts': 'أعضاء الجسم',
     'food-drink': 'الطعام والشراب',
     'daily-tasks': 'المهام اليومية',
     'time': 'الوقت',
     'places': 'الأماكن',
     'people': 'الأشخاص',
     'objects': 'الأغراض',
     'questions': 'الأسئلة',
     // Items
     'happy': 'سعيد',
     'sad': 'حزين',
     // ... all entries with accurate Arabic medical vocabulary
     // Action bar
     'action-yes': 'نعم',
     'action-no': 'لا',
     'action-help': 'مساعدة',
     // ... all entries
   };
   ```
3. Ensure every key from en.ts is present. Use Modern Standard Arabic appropriate for hospital patients across different Arabic dialects.

**Files**: `src/data/translations/ar.ts` (new)

**Validation**:
- [ ] Same keys as en.ts (no missing, no extra)
- [ ] Arabic text is accurate and uses MSA appropriate for medical context
- [ ] `npm run typecheck` passes

---

### T006: Create translations/index.ts

**Purpose**: Central export point for all translations and language configuration.

**Steps**:
1. Create `src/data/translations/index.ts`:
   ```typescript
   import { Language, LanguageConfig, TranslationDictionary } from '../../types';
   import { en } from './en';
   import { he } from './he';
   import { ar } from './ar';

   export const translations: Record<Language, TranslationDictionary> = {
     en,
     he,
     ar,
   };

   export const languageConfigs: Record<Language, LanguageConfig> = {
     en: { code: 'en', name: 'English', dir: 'ltr', isRTL: false },
     he: { code: 'he', name: 'עברית', dir: 'rtl', isRTL: true },
     ar: { code: 'ar', name: 'العربية', dir: 'rtl', isRTL: true },
   };

   export const defaultLanguage: Language = 'en';
   export const supportedLanguages: Language[] = ['en', 'he', 'ar'];
   ```

**Files**: `src/data/translations/index.ts` (new)

**Validation**:
- [ ] All three languages importable and accessible
- [ ] `npm run typecheck` passes
- [ ] `languageConfigs` has correct RTL flags

## Definition of Done

- [ ] All types defined and exported from `types.ts`
- [ ] `categories.ts` has unique, stable entry IDs
- [ ] Translation dictionaries for EN, HE, AR have identical key sets
- [ ] `translations/index.ts` exports everything needed by hooks
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Risks

- **Duplicate IDs in categories.ts**: Some IDs (bathroom, when) appear in multiple categories. Must disambiguate in T002.
- **Translation accuracy**: HE/AR translations should be reviewed by native speakers. Flag as draft quality.
- **Missing entries**: Easy to miss a hardcoded string. Use grep to find all user-visible text.

## Reviewer Guidance

- Verify every user-visible string in the current app has a translation entry
- Check for ID uniqueness across all categories/items/phrases
- Verify Hebrew and Arabic text direction makes sense (even if you don't read the language, check for obvious copy-paste errors or missing entries)
- Ensure no hardcoded English text remains in components (will be addressed in WP04, but the data layer should be complete)
