# Quickstart: On-Screen Alphabet Keyboard

**Feature**: `002-on-screen-alphabet-keyboard`
**Date**: 2026-04-14

This quickstart is the end-to-end manual validation path for the feature. It covers all five user stories and every edge case. A reviewer should be able to run every step in under 10 minutes.

---

## Prerequisites

- Repository checked out on branch `keyboard`.
- Working directory: `/Users/zohar/apps/communicAid`.
- Node / npm environment matches the existing repo (no new Node version required).

## 1. Install and run

```bash
npm install          # pulls in newly-added vitest/testing-library devDeps
npm run typecheck    # must exit 0
npm run lint         # must exit 0
npm run test         # must exit 0 with all KeyboardScreen + alphabets + Header tests green
npm run dev          # open the URL Vite prints (http://localhost:5173)
```

## 2. Verify the keyboard button appears

1. Open the app in a landscape-oriented tablet emulator (or a desktop browser at ≥ 1024 × 768).
2. Confirm the header now shows three buttons on the left: **Back** (when available), **Home**, **Keyboard**. The Keyboard icon is the `lucide-react` `Keyboard` glyph at size 32 in the same styled pill as Home.
3. Navigate into a category. The Keyboard button remains visible. Navigate into Settings. Still visible.

**Expected**: The Keyboard button is visible on every screen and does not disrupt the existing header layout in either LTR (English) or RTL (Hebrew/Arabic) language settings.

## 3. User Story 1 — Type and show

1. From the Home screen in English, tap the Keyboard button.
2. The keyboard overlay opens. The message area above the grid is empty. An A–Z grid of 26 keys is displayed.
3. Tap W, A, T, E, R.
4. The message display reads `WATER` in large letters.
5. Tap **Show**.
6. The viewport fills with the word `WATER` in very large letters, readable across a room.
7. Tap the takeover background.
8. The takeover closes. The keyboard is still visible. The message area still reads `WATER`.
9. Tap **Close** (or Home) to exit the overlay.

**Expected**: Every step succeeds exactly as described. No console warnings. No content flicker.

## 4. User Story 2 — Backspace

1. Reopen the keyboard.
2. Type `HELLX`.
3. Tap **Backspace**. Message reads `HELL`.
4. Tap O. Message reads `HELLO`.
5. With message still `HELLO`, tap Backspace five times. Message becomes empty.
6. Tap Backspace again. Nothing happens (no error, no navigation, no state change).

## 5. User Story 3 — Language switcher

1. With the keyboard open and any message typed in English, tap the language switcher.
2. A list showing all four languages (English, עברית, العربية, Русский) appears.
3. Pick **עברית**.
4. The grid is replaced with the 22-letter Hebrew alphabet א–ת. The grid direction is RTL. The message area remains `HELLO` but new input will flow right-to-left.
5. Tap א, ב, ג.
6. The message area shows `HELLO` followed by `אבג` rendered with correct Unicode bidi (the Latin run stays LTR; the Hebrew run is RTL).
7. Tap the switcher and pick **العربية**.
8. The grid is replaced with the 28-letter Arabic alphabet in isolated forms, RTL.
9. Tap ل then ا. The message shows `HELLOאבגلا` with the rendered Arabic letters connected by the font's native shaping.
10. Tap the switcher and pick **Русский**.
11. The grid shows 33 Cyrillic letters in alphabetical order (А, Б, В, … Я, with Ё between Е and Ж). LTR. Tap Д, А.
12. Previous text is still present; `ДА` is appended.

## 6. User Story 4 — Clear

1. With a non-empty message in the display, tap **Clear**.
2. The message area is empty.
3. The keyboard stays open and is ready for new input.
4. Tap **Show**. Nothing happens. The Show button is visibly disabled.

## 7. User Story 5 — Navigate away and back

1. With the keyboard open and a message typed, tap the **Home** button in the header (or the in-overlay Close button).
2. The app returns to the home screen (or whichever screen was behind the overlay).
3. Tap the Keyboard button again.
4. The overlay reopens with an **empty** message area. The previous draft is gone (FR-013).

## 8. Edge cases

- **Very long message**: Keep typing past 200 characters. The 201st letter tap is silently ignored. Backspace still works. The layout does not break; the message display wraps or truncates gracefully.
- **Rapid repeated taps**: Tap the same letter key very quickly 5 times. All 5 characters appear; none are debounced away.
- **Empty Show**: With an empty message, tap Show. No takeover appears. Button styling clearly indicates disabled state.
- **Accidental takeover dismissal**: With a typed message, tap Show. Do not lift your finger; drag and keep pressing. The takeover does not dismiss until you intentionally tap *again* (or tap Close).
- **Arabic lam-alif**: Tap ل then ا. The message area shows the two characters and (thanks to font shaping) they render connected as لا. Backspace removes one character at a time.
- **Russian Ё**: The letter Ё is present in the grid and can be typed. It appears between Е and Ж in alphabetical order.
- **Mixed script in takeover**: Compose `HELLO אבג ДА` and tap Show. The takeover renders all three runs correctly with native bidi. Every character is legible at large size.

## 9. Accessibility verification

1. With the keyboard overlay open, run Chrome DevTools → Lighthouse → Accessibility audit.
2. Confirm score ≥ 90.
3. Measure the rendered size of a letter key in the inspector. Confirm width ≥ 64 px and height ≥ 64 px at a 1024×768 viewport.
4. Use the axe DevTools extension (or DevTools' built-in contrast checker) to confirm WCAG AA contrast on:
   - Letter keys
   - Message display text
   - Takeover text
   - Control buttons (space, backspace, clear, show, close)
5. Tab-focus into the overlay and confirm focus lands on an element inside it (focus trap or initial-focus handling).

## 10. Performance verification

1. Run `npm run build` and inspect the dist chunks. Confirm there is a separate chunk for `KeyboardScreen` (via `React.lazy`).
2. Measure the chunk's gzipped size: `ls -lh dist/assets/KeyboardScreen*.js.gz` (or eyeball the build output). Should be ≤ 20 KB gzipped.
3. On the running dev server, open DevTools Performance. Record while tapping a letter key. Confirm the message display update happens within 100 ms of touch release.
4. Record while switching language. Confirm the grid re-renders within 150 ms.

## 11. Privacy verification

1. With DevTools open, type a short message in the keyboard.
2. Check the **Console** tab — the typed text must NOT appear in any log.
3. Check the **Network** tab — no request body, query param, or header contains the typed text.
4. Check `localStorage` and `sessionStorage` — neither contains the typed text.
5. Close and reopen the overlay — the message is gone.

## 12. Regression check

1. Use the app normally without opening the keyboard: pick categories, tap tiles, use the pain scale, use Quick Names, switch language in Settings, navigate back and forward.
2. Confirm every existing feature still works exactly as before. The keyboard button is the only visible change to any other screen.
