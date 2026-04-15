# Phase 1: Data Model

**Feature**: On-Screen Alphabet Keyboard (`002-on-screen-alphabet-keyboard`)
**Date**: 2026-04-14

This feature is client-only. There are no database tables, no API contracts, and no persisted entities. The "data model" below describes the in-memory state shapes and the static alphabet dictionary. All of it lives in React state and TypeScript module exports.

---

## Entity 1: Typed Message (in-memory only)

**What it represents**: The in-progress string the patient is composing inside the keyboard overlay.

**Lifecycle**:

1. Created when the keyboard overlay opens, initial value `""`.
2. Mutated by letter-key taps (append), space (append), backspace (drop last character), and clear (reset to `""`).
3. Read by the message display and by the large-text takeover.
4. Destroyed when the overlay closes (the component either unmounts or resets the state when its `open` prop transitions from `true` to `false`).

**Shape**:

```ts
// Local React state inside KeyboardScreen.tsx
const [message, setMessage] = useState<string>('');
```

**Validation rules**:

- Only characters from the **currently active keyboard language's alphabet** plus the space character (`' '`) may be appended via UI interactions.
- Never `null`, never `undefined`. Empty is represented as `""`.
- No trimming. Leading/trailing whitespace is preserved as the patient typed it.
- A hard maximum length of **200 characters** is enforced to protect the layout of the message display and the large-text takeover (edge case in spec.md). Further letter taps beyond 200 are silently ignored (the keys are not disabled, but `setMessage` is a no-op at the limit). Backspace and Clear are always active.

**Constraints (from spec)**:

- Never persisted. Not written to `localStorage`, `sessionStorage`, IndexedDB, Supabase, or any file. (C-003)
- Never transmitted. No `fetch`, `XMLHttpRequest`, `WebSocket`, `navigator.sendBeacon`, or form submission carries this value. (C-004)
- Never logged. No `console.*` call, no error-reporter breadcrumb, no analytics event includes this value. (C-005)

**State transitions**:

```
(closed, no state)
        │
        │  user taps keyboard button in header
        ▼
  message = ""
        │
        ├── letter tap / space ──► message + char (if length < 200)
        │
        ├── backspace ──► message.slice(0, -1)  (no-op if "")
        │
        ├── clear ──► ""
        │
        ├── show (non-empty) ──► takeoverOpen = true   (message unchanged)
        │
        ├── show (empty) ──► no-op
        │
        └── close / navigate away ──► destroy state
```

---

## Entity 2: Keyboard Language (in-memory only)

**What it represents**: Which language's alphabet is currently rendered in the grid and controls the writing direction of new input. This is **independent** of the app's active language (`useLanguage().language`).

**Lifecycle**:

1. Created when the keyboard overlay opens, initial value = `useLanguage().language` at that moment.
2. Mutated only by the in-screen language switcher.
3. Read by the grid renderer and by the message display's `dir` attribute.
4. Destroyed when the overlay closes.

**Shape**:

```ts
// Local React state inside KeyboardScreen.tsx
const { language: appLanguage } = useLanguage();
const [keyboardLanguage, setKeyboardLanguage] = useState<Language>(appLanguage);
```

**Validation rules**:

- Must be a member of `Language` (`'en' | 'he' | 'ar' | 'ru'`).
- Every value of `Language` must have a corresponding entry in `alphabets` (unit-tested; see `alphabets.test.ts`).

**Constraints**:

- Changing `keyboardLanguage` MUST NOT call `useLanguage().setLanguage`. The app language is not touched by in-keyboard switching. (R-002)
- Changing `keyboardLanguage` MUST NOT clear `message`. Already-typed characters remain; new characters append. (FR-019)

**State transitions**:

```
keyboardLanguage = appLanguage
        │
        ├── user picks 'he' in switcher ──► keyboardLanguage = 'he'  (message unchanged)
        │
        ├── user picks 'ar' in switcher ──► keyboardLanguage = 'ar'  (message unchanged)
        │
        └── overlay closes ──► destroyed
```

---

## Entity 3: Takeover Open (in-memory only)

**What it represents**: Whether the large-text fullscreen takeover is currently showing the typed message.

**Shape**:

```ts
const [takeoverOpen, setTakeoverOpen] = useState<boolean>(false);
```

**Validation rules**:

- May only be set to `true` when `message.length > 0`. The Show button is visibly disabled otherwise (FR-011, FR-015).
- Must be reset to `false` when the keyboard overlay closes, so reopening the keyboard never flashes an old takeover.

**State transitions**:

```
takeoverOpen = false
        │
        ├── show tapped (message non-empty) ──► takeoverOpen = true
        │
        ├── tap on takeover / Close button ──► takeoverOpen = false  (message preserved)
        │
        └── overlay closes ──► takeoverOpen = false
```

---

## Entity 4: Language Alphabet (static module export)

**What it represents**: The ordered list of letters for each supported app language, used to render the letter grid.

**Shape**:

```ts
// src/data/alphabets.ts
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

**Invariants (enforced by unit tests)**:

- `alphabets.en.length === 26`
- `alphabets.he.length === 22`
- `alphabets.ar.length === 28`
- `alphabets.ru.length === 33`
- Every entry is a non-empty string, no whitespace, no digits, no punctuation.
- No duplicate characters within a language.
- Arabic does not contain the lam-alif ligature `لا` (it is composed by tapping ل then ا).
- Russian ordering places `Ё` between `Е` and `Ж`.
- Every `Language` key in the union has a corresponding entry in both `alphabets` and `alphabetGridColumns`. (TypeScript `Record<Language, ...>` guarantees this at compile time; tests double-check at runtime.)

**Mutability**: The `alphabets` object is `as const`-frozen and its value arrays are typed `readonly string[]`. It is imported for read-only access; no runtime code mutates it.

---

## Relationships

- **Typed Message** is written by letter taps whose source letter comes from the **Language Alphabet** indexed by **Keyboard Language**.
- **Takeover Open** can only transition `false → true` when **Typed Message** is non-empty.
- **Keyboard Language** is initialized from the app's `useLanguage().language` but is otherwise decoupled from it. The reverse dependency does not exist: in-keyboard switching never affects app language.

No other entities in this feature. No backend, no IDs, no timestamps, no foreign keys.
