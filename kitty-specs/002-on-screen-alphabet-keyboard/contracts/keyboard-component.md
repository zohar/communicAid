# Component Contract: KeyboardScreen

**Feature**: On-Screen Alphabet Keyboard (`002-on-screen-alphabet-keyboard`)
**Date**: 2026-04-14

This feature has no HTTP, GraphQL, or RPC contracts. The only "contract" is the interface between `KeyboardScreen` and its host (`App.tsx`) and the updated interface of `Header`. They are documented here in the same role that `contracts/*.yaml` would play for a backend feature.

---

## Contract 1: `KeyboardScreen` component

**Location**: `src/components/screens/KeyboardScreen.tsx` (new file)

**Import form**:

```ts
// App.tsx
const KeyboardScreen = React.lazy(() => import('./components/screens/KeyboardScreen'));
```

### Props

```ts
interface KeyboardScreenProps {
  /**
   * Whether the keyboard overlay is currently open.
   * When this transitions from true to false, the component must reset
   * its internal state (typed message, selected keyboard language,
   * takeover open flag) so the next open starts fresh.
   */
  open: boolean;

  /**
   * Callback invoked when the patient explicitly closes the keyboard
   * (via the in-overlay Close control or via the Back/Home header
   * buttons). The host is responsible for setting its own
   * keyboardOpen state to false in response.
   */
  onClose: () => void;
}
```

### Rendering contract

- When `open === false`, `KeyboardScreen` **must render `null`** (or an empty fragment). It must not leave any DOM behind and must not keep any timers alive.
- When `open === true`, it renders a fullscreen `position: fixed; inset: 0; z-50` container that covers the entire viewport.
- The overlay must not pass pointer events through to the content behind it (i.e. it must fully cover and block the rest of the app visually and interactively).

### Internal state (see data-model.md)

- `message: string` — the in-progress typed text. Initial value `""`.
- `keyboardLanguage: Language` — initialized from `useLanguage().language` when the overlay opens.
- `takeoverOpen: boolean` — initial value `false`.

### Event contract

| Event | Trigger | Behavior |
|---|---|---|
| Letter tap | Any letter button in the grid | `message → message + letter` if `message.length < 200`, otherwise no-op. Never triggers `onClose`. |
| Space tap | Space button | `message → message + ' '` if `message.length < 200`. |
| Backspace tap | Backspace button | `message → message.slice(0, -1)`. No-op if `message === ''`. |
| Clear tap | Clear button | `message → ''`. `takeoverOpen → false`. |
| Show tap (non-empty) | Show button when `message.length > 0` | `takeoverOpen → true`. Message unchanged. |
| Show tap (empty) | Show button when `message === ''` | No-op. Button visibly disabled. |
| Takeover dismiss | Tap on takeover background or tap on Close control inside the takeover | `takeoverOpen → false`. `message` unchanged. |
| Language switcher tap | Any non-current language entry | `keyboardLanguage → picked language`. `message` unchanged. |
| Close tap | In-overlay Close button | Calls `onClose()`. |
| Overlay closed externally | Host sets `open={false}` | Internal state resets to initial values on next render. |

### Accessibility contract

- Every interactive element has an accessible name via `aria-label` or visible text.
- The overlay is labeled as a dialog: `role="dialog"`, `aria-modal="true"`, `aria-label` = localized keyboard title.
- Focus is moved into the overlay when it opens.
- Letter buttons use `lang={keyboardLanguage}` and the container uses `dir={languageConfigs[keyboardLanguage].dir}`.
- The message display is a visually-prominent `<div>` with `aria-live="polite"` so assistive technology announces updates.
- Touch targets are ≥ 64×64 CSS pixels at the minimum supported tablet width.

### Non-behaviors (things the component must NOT do)

- Must not call `useLanguage().setLanguage`.
- Must not write `message` to `localStorage`, `sessionStorage`, `indexedDB`, or any Supabase client.
- Must not call `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, or any network API with `message` (or at all).
- Must not `console.log`, `console.info`, `console.warn`, or `console.error` the message content. Debug logs about lifecycle are allowed only if they do not include `message`.
- Must not auto-dismiss the takeover on `pointerdown` that started in the same frame as the takeover opening (see research R-007).
- Must not display numbers, punctuation, emoji, or predicted-word suggestions.
- Must not change any state in `App.tsx` other than via the `onClose` callback.

---

## Contract 2: `Header` component (modified)

**Location**: `src/components/Header.tsx` (existing file, modified)

### Added prop

```ts
interface HeaderProps {
  title: string;
  onBack?: () => void;
  onHome: () => void;
  onSettings: () => void;
  /** NEW: opens the keyboard overlay. Always provided by App.tsx. */
  onKeyboard: () => void;
}
```

### Rendering change

- A new button is inserted into the left cluster of the header, **immediately after** the existing Home button (`Header.tsx:48–54`).
- Styling matches the existing Home and Back buttons (same size, padding, color, shadow) so the three buttons form a visually consistent group.
- Icon is the `Keyboard` icon from `lucide-react` at size 32.
- The button's accessible name is `t('keyboard')` with an English fallback of `"Keyboard"`.

### Behavior

- `onClick` calls `props.onKeyboard()`.
- The button is always visible and always enabled, on every screen (home, category, config).

### Non-behaviors

- Does not know whether the keyboard is currently open. There is no toggle state in the header; tapping the button always *requests* open, and the host decides.
- Does not change title, clock, RTL handling, or any other existing header behavior.

---

## Contract 3: `App.tsx` (modified)

**Location**: `/Users/zohar/apps/communicAid/src/App.tsx` (existing file, modified)

### Added state

```ts
const [keyboardOpen, setKeyboardOpen] = useState<boolean>(false);
```

### Added handler

```ts
const handleKeyboard = () => setKeyboardOpen(true);
```

### Wiring

- `<Header />` receives `onKeyboard={handleKeyboard}` in addition to its existing props.
- A `<React.Suspense fallback={null}><KeyboardScreen open={keyboardOpen} onClose={() => setKeyboardOpen(false)} /></React.Suspense>` element is rendered at the end of the root return (after `<RecentItems />`), so it visually stacks above all other content.

### Non-behaviors

- `NavigationState` is not changed. No new screen value. No changes to `breadcrumbIds`.
- `handleBack` and `handleHome` are unchanged.
- `selectedMessage` banner behavior is unchanged.
- `recentItems` is not touched when typing in the keyboard — the keyboard does **not** add anything to Recent Items (C-003).

---

## Contract 4: `alphabets` module

**Location**: `src/data/alphabets.ts` (new file)

### Exports

```ts
export const alphabets: Record<Language, readonly string[]>;
export const alphabetGridColumns: Record<Language, number>;
```

(See `data-model.md` for the concrete values and invariants.)

### Consumer contract

- `KeyboardScreen` imports `alphabets[keyboardLanguage]` to render the grid and `alphabetGridColumns[keyboardLanguage]` to pick the grid's column count.
- No other consumers. The alphabets file is not used by any existing category, translation, or config code.
