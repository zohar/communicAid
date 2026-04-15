# Quickstart & Manual Smoke Test: Config Export & Import

The Vitest unit tests in `src/utils/configIO.test.ts` cover the pure validation/serialization logic exhaustively. This document is the **manual end-to-end smoke test** the implementer runs in the dev server before moving the WP to `for_review`.

It exercises the full path: dev server → real browser → real localStorage → real Blob download → real file picker.

## Prerequisites

- `npm install` has completed and dependencies are up to date.
- A Chromium-based or Safari browser available locally.

## Setup

```bash
npm run dev
```

Open `http://localhost:5173` (or whichever port Vite reports).

## Test 1 — Export round-trips your customizations

1. From the home screen, navigate to the configuration screen.
2. Make at least three customizations:
   - Edit one category label (e.g. change "Feelings" to "How I feel").
   - Rename one quick name (e.g. change one slot to "Mom").
   - Switch the language to Hebrew (or any non-default), then back again — leave it on a non-default language so it's part of the export.
3. Tap **Export configuration**.
4. Confirm a file `communicaid-config.json` is downloaded.
5. Open the file in a text editor.

**Expected**:
- Valid pretty-printed JSON.
- `overrides` contains an entry for the label you edited.
- `quickNames` contains the renamed slot.
- `language` matches the language you picked.

## Test 2 — Empty export still works

1. Open the browser DevTools → Application → Local Storage → clear all `communicaid-*` keys.
2. Reload the page.
3. Without making any customizations, navigate to the config screen.
4. Tap **Export configuration**.

**Expected**:
- A file is downloaded.
- It contains `{ "overrides": {}, "quickNames": [], "language": "en" }` (or the default language).
- No errors in the console.

## Test 3 — Import round-trip (the happy path)

1. Use the file from Test 1.
2. Clear localStorage again (DevTools → Application → Local Storage → clear).
3. Reload the page.
4. Confirm the home screen shows the bundled defaults (no customizations).
5. Navigate to the config screen.
6. Tap **Import configuration**.
7. Pick the file from Test 1.
8. Confirm the dialog ("This will replace your current configuration. Continue?").

**Expected**:
- Confirmation dialog appears with plain text and two clear actions.
- After confirming, the config screen immediately reflects the imported values **without a page refresh**:
  - The customized label appears on the relevant category.
  - The renamed quick name appears in the slot.
  - The language has switched to the imported language (page direction may flip if RTL).
- Navigating back to the home screen shows the same imported state.
- localStorage now contains the three keys, matching the file contents.

## Test 4 — Cancel the confirmation

1. With customizations in place, tap **Import configuration**.
2. Pick a valid file (use Test 1's file).
3. **Cancel** the confirmation dialog.

**Expected**:
- Existing customizations are unchanged.
- localStorage is byte-identical to before the import attempt.

## Test 5 — Cancel the file picker

1. Tap **Import configuration**.
2. Cancel the OS file picker (don't pick a file).

**Expected**: Nothing happens. No errors, no dialogs.

## Test 6 — Invalid JSON

1. Create a text file with invalid content: `{ this is not json`.
2. Tap **Import configuration**, pick that file.

**Expected**:
- Error dialog appears with a message like "The file is not valid JSON" or similar.
- localStorage is byte-identical to before the import attempt.
- The customizations from Test 1 are still intact.

## Test 7 — Wrong shape

1. Create a JSON file containing `["wrong", "shape"]`.
2. Import it.

**Expected**: Error dialog ("invalid_shape" message). State unchanged.

## Test 8 — Unknown language

1. Take a valid export file from Test 1.
2. Edit it: change `"language": "en"` to `"language": "fr"`.
3. Import it.

**Expected**: Error dialog ("invalid_language" message). State unchanged.

## Test 9 — Oversized field

1. Take a valid export file.
2. Edit one of the `text` overrides to a 200-character string.
3. Import it.

**Expected**: Error dialog ("oversized_field" message). State unchanged.

## Test 10 — Idempotent re-import

1. Import the Test 1 file.
2. Immediately import it again.

**Expected**: Same state both times. No errors. No visible difference.

## Test 11 — Cross-device simulation

1. In Browser A (or one browser profile), make customizations and export.
2. In Browser B (a different profile, or a private window), navigate to the dev server.
3. Import the file from Browser A.

**Expected**: Browser B shows the same customizations as Browser A had at export time.

## Test 12 — Offline check

1. In DevTools → Network, switch the throttling to **Offline**.
2. Run Test 1 (export) and Test 3 (import) again.

**Expected**: Both work identically. No network requests in the Network tab.

## Sign-off

Before moving WP to `for_review`, the implementer must confirm:

- [ ] All 12 manual tests above pass on the dev server.
- [ ] All Vitest unit tests in `configIO.test.ts` pass (`npm run test`).
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] No new dependencies in `package.json`.
