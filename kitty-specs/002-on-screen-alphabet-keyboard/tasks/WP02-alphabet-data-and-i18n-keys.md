---
work_package_id: WP02
title: Alphabet Data & i18n Keys
lane: planned
dependencies: [WP01]
requirement_refs:
- C-001
- C-006
- FR-002
- FR-014
- FR-022
planning_base_branch: keyboard
merge_target_branch: keyboard
branch_strategy: Planning artifacts for this feature were generated on keyboard. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into keyboard unless the human explicitly redirects the landing branch.
subtasks:
- T006
- T007
- T008
phase: Phase 1 - Foundation
assignee: ''
agent: ''
shell_pid: ''
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

# Work Package Prompt: WP02 – Alphabet Data & i18n Keys

## Branch Strategy

- **Planning/base branch at prompt creation**: `keyboard`
- **Final merge target for completed work**: `keyboard`
- **Actual worktree base may differ later**: `/spec-kitty.implement` populates frontmatter `base_branch` when the worktree is created. For stacked WPs it may point at another WP branch, but the final merge target remains `keyboard` unless the human explicitly changes the landing branch.
- **If human instructions contradict these fields**: stop and resolve the intended landing branch before coding.

**Implementation command (depends on WP01)**: `spec-kitty implement WP02 --base WP01`

---

## Objectives & Success Criteria

Create the static per-language alphabet data file, lock its invariants down with unit tests, and extend the existing translation dictionaries with the seven UI strings the keyboard will need (`keyboard`, `space`, `backspace`, `clear`, `show`, `close`, `switchLanguage`) in all four supported languages (English, Hebrew, Arabic, Russian).

**This work package is complete when**:

1. `src/data/alphabets.ts` exists and exports `alphabets` and `alphabetGridColumns` keyed by `Language` with the exact values in `data-model.md`.
2. `tests/keyboard/alphabets.test.ts` exists and passes, asserting every invariant from `data-model.md`.
3. Each language dictionary under `src/data/translations/` has the seven new keys with localized values.
4. `npm run typecheck`, `npm run lint`, and `npm run test` all exit 0.
5. No React component files under `src/components/` are modified.

## Context & Constraints

- **Plan**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/plan.md`
- **Data model**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/data-model.md` (canonical source for alphabet values)
- **Research**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/research.md` sections R-003 and R-004
- **Existing translations**: `/Users/zohar/apps/communicAid/src/data/translations/` (follow the existing file structure; do not restructure)
- **Types**: `src/types.ts:1` defines `Language = 'en' | 'he' | 'ar' | 'ru'`

The `Record<Language, ...>` type enforces at compile time that every language has an alphabet and a column count; the unit tests double-check at runtime so a future `Language` addition can't silently ship without the corresponding data.

**Do NOT**:

- Add any React component code.
- Modify `src/types.ts` — `Language` stays as it is.
- Add punctuation, digits, diacritics, lam-alif ligature, or any whitespace characters to any alphabet.
- Rename existing translation keys.

## Subtasks & Detailed Guidance

### Subtask T006 – Create `src/data/alphabets.ts`

- **Purpose**: Single source of truth for the per-language letter sets and their grid column counts.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/src/data/alphabets.ts`.
  2. Use this exact structure (values from `data-model.md`):
     ```typescript
     import type { Language } from '../types';

     export const alphabets: Record<Language, readonly string[]> = {
       en: [
         'A', 'B', 'C', 'D', 'E', 'F', 'G',
         'H', 'I', 'J', 'K', 'L', 'M', 'N',
         'O', 'P', 'Q', 'R', 'S', 'T', 'U',
         'V', 'W', 'X', 'Y', 'Z',
       ],
       he: [
         'א', 'ב', 'ג', 'ד', 'ה', 'ו',
         'ז', 'ח', 'ט', 'י', 'כ', 'ל',
         'מ', 'נ', 'ס', 'ע', 'פ', 'צ',
         'ק', 'ר', 'ש', 'ת',
       ],
       ar: [
         'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ',
         'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص',
         'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق',
         'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي',
       ],
       ru: [
         'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж',
         'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О',
         'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц',
         'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю',
         'Я',
       ],
     } as const;

     export const alphabetGridColumns: Record<Language, number> = {
       en: 7,
       he: 6,
       ar: 7,
       ru: 8,
     };
     ```
  3. Do not add any helper functions. This file is pure data.
- **Files**: `src/data/alphabets.ts` (new)
- **Parallel?**: No (T007 and T008 depend on this file existing)
- **Notes**: Hebrew intentionally uses base-form letters only. Arabic uses isolated forms only and intentionally excludes the lam-alif ligature (لا) — the patient types ل then ا and the font renders the ligature visually.

### Subtask T007 – Unit tests for alphabet invariants

- **Purpose**: Lock in correctness so no future edit can silently break the data.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/tests/keyboard/alphabets.test.ts`.
  2. Cover these assertions:
     ```typescript
     import { describe, it, expect } from 'vitest';
     import { alphabets, alphabetGridColumns } from '../../src/data/alphabets';
     import type { Language } from '../../src/types';

     const EXPECTED_LENGTHS: Record<Language, number> = {
       en: 26,
       he: 22,
       ar: 28,
       ru: 33,
     };

     describe('alphabets', () => {
       it.each(Object.keys(EXPECTED_LENGTHS) as Language[])(
         '%s has the correct number of letters',
         (lang) => {
           expect(alphabets[lang].length).toBe(EXPECTED_LENGTHS[lang]);
         },
       );

       it.each(Object.keys(EXPECTED_LENGTHS) as Language[])(
         '%s has no duplicate letters',
         (lang) => {
           const letters = alphabets[lang];
           const unique = new Set(letters);
           expect(unique.size).toBe(letters.length);
         },
       );

       it.each(Object.keys(EXPECTED_LENGTHS) as Language[])(
         '%s contains no whitespace, digits, or punctuation',
         (lang) => {
           for (const letter of alphabets[lang]) {
             expect(letter).not.toMatch(/\s/);
             expect(letter).not.toMatch(/\d/);
             expect(letter).not.toMatch(/[.,!?;:'"()]/);
             expect(letter.length).toBeGreaterThan(0);
           }
         },
       );

       it('Arabic alphabet does not contain the lam-alif ligature', () => {
         expect(alphabets.ar).not.toContain('لا');
       });

       it('Russian alphabet has Ё immediately after Е', () => {
         const ru = alphabets.ru;
         const eIndex = ru.indexOf('Е');
         expect(eIndex).toBeGreaterThanOrEqual(0);
         expect(ru[eIndex + 1]).toBe('Ё');
         expect(ru[eIndex + 2]).toBe('Ж');
       });

       it('every Language has a column count', () => {
         for (const lang of Object.keys(EXPECTED_LENGTHS) as Language[]) {
           expect(alphabetGridColumns[lang]).toBeGreaterThan(0);
         }
       });
     });
     ```
  3. Run `npm run test:run` and confirm all assertions pass.
- **Files**: `tests/keyboard/alphabets.test.ts` (new)
- **Parallel?**: Yes — T007 and T008 can be authored in parallel after T006 lands.
- **Notes**: `it.each` gives readable test output per language. If `@testing-library/jest-dom` matchers conflict with the core `expect`, remove the jest-dom augmentation; it is not needed for pure-data tests.

### Subtask T008 – Add keyboard translation keys in all four languages

- **Purpose**: Every string displayed by the keyboard UI comes from the existing translation system (`useTranslation().t(key)`), so the keyboard respects the app's active language.
- **Steps**:
  1. Inspect `/Users/zohar/apps/communicAid/src/data/translations/` to identify the file(s) per language. Likely one file per language (e.g., `en.ts`, `he.ts`, `ar.ts`, `ru.ts`) exporting a `TranslationDictionary`.
  2. For each language file, add the following keys with localized values:

     | Key | English | Hebrew | Arabic | Russian |
     |---|---|---|---|---|
     | `keyboard` | `Keyboard` | `מקלדת` | `لوحة المفاتيح` | `Клавиатура` |
     | `space` | `Space` | `רווח` | `مسافة` | `Пробел` |
     | `backspace` | `Backspace` | `מחק` | `مسح` | `Стереть` |
     | `clear` | `Clear` | `נקה` | `مسح الكل` | `Очистить` |
     | `show` | `Show` | `הצג` | `إظهار` | `Показать` |
     | `close` | `Close` | `סגור` | `إغلاق` | `Закрыть` |
     | `switchLanguage` | `Language` | `שפה` | `اللغة` | `Язык` |

  3. Preserve existing keys. Add the new keys at the bottom of each dictionary, or in a clearly marked "keyboard" block, matching the style of the existing file.
  4. If the translation system uses a single file with nested dictionaries (`Record<Language, TranslationDictionary>`), add the new keys to each nested entry — do not create a new file.
- **Files**: The translation files under `src/data/translations/` (modified, not new).
- **Parallel?**: Yes — T007 and T008 can be authored in parallel.
- **Notes**: If you are unsure whether a Hebrew or Arabic value is idiomatic, prefer the single-word options above over paraphrases; they will appear inside small buttons and must stay short. Russian `Стереть` means "erase" and is the conventional label for a backspace key.

## Risks & Mitigations

- **Wrong alphabet order for a language**: Compare against the ordering in `data-model.md` character by character. The tests in T007 catch count and Ё ordering, but they cannot verify, say, that Arabic letters are in the canonical order. Double-check visually before committing.
- **Accidental whitespace in a string literal**: The T007 regex test catches this.
- **Translation file schema drift**: If the existing files use a different shape than expected (e.g., nested namespaces), mirror that shape. Do not restructure.
- **Encoding issues in Arabic/Hebrew/Russian**: Save files as UTF-8 (editors default to this). If a code review shows garbled characters, the editor's encoding is wrong.

## Review Guidance

The reviewer for WP02 must verify:

1. `alphabets.ts` exists and exports `alphabets` and `alphabetGridColumns`.
2. The invariant tests all pass (`npm run test:run` shows at least 10 new assertions green).
3. The four language files each contain the seven new keys with localized values.
4. No React component or hook is modified.
5. `npm run typecheck` and `npm run lint` exit 0.
6. Arabic alphabet contains 28 letters, does not contain لا, and is ordered canonically (ا first, ي last).
7. Russian alphabet contains Ё in the canonical position.

## Activity Log

- 2026-04-14T14:01:38Z – system – lane=planned – Prompt created.
