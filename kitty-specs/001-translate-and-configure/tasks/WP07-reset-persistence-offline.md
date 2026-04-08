---
work_package_id: WP07
title: Reset, Persistence & Offline
lane: planned
dependencies: []
requirement_refs:
- FR-09
- FR-13
- FR-14
- NFR-01
- NFR-03
- NFR-05
planning_base_branch: translate-and-configure
merge_target_branch: translate-and-configure
branch_strategy: Planning artifacts for this feature were generated on translate-and-configure. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into translate-and-configure unless the human explicitly redirects the landing branch.
subtasks: [T032, T033, T034, T035, T036]
history:
- timestamp: '2026-04-08T13:22:32Z'
  action: created
  by: spec-kitty.tasks
---

# WP07: Reset, Persistence & Offline

## Objective

Add reset-to-defaults functionality per category, verify all configuration persists across sessions, and confirm offline operation.

## Branch Strategy

- **Planning/base branch**: `translate-and-configure`
- **Merge target**: `translate-and-configure`
- **Implementation command**: `spec-kitty implement WP07 --base WP06`

## Context

This is the polish phase. The core translation and editing functionality is complete (WP01-WP06). This WP adds the reset feature, hardens persistence, and validates the offline requirement.

## Subtasks

### T032: Create ResetButton Component with Confirmation

**Purpose**: A "Reset to Defaults" button that restores a category's entries to the original default translations for the current language. Includes a confirmation dialog to prevent accidental resets.

**Steps**:
1. Create `src/components/config/ResetButton.tsx`:
   ```typescript
   interface ResetButtonProps {
     categoryId: string;
     onReset: () => void;
   }
   ```
2. Render a button with clear labeling:
   ```tsx
   <button className="bg-red-500 hover:bg-red-600 text-white rounded-xl p-4 flex items-center gap-3 min-h-[60px]">
     <RotateCcw size={24} />
     <span className="text-lg font-semibold">{t('reset-to-defaults')}</span>
   </button>
   ```
3. On tap, show a confirmation dialog:
   - Use a simple overlay/modal: "Reset all items in this category to defaults? Custom edits will be lost."
   - Two buttons: "Reset" (red, destructive) and "Cancel" (gray)
   - Minimum touch target: 70px for both buttons
4. On confirmation, call `onReset()` which triggers `useOverrides(categoryId).resetCategory()`.
5. Add translation entries for the confirmation text:
   - `reset-to-defaults`: "Reset to Defaults" / "איפוס לברירת מחדל" / "إعادة التعيين إلى الافتراضي"
   - `reset-confirm-title`: "Reset Category?" / "?לאפס קטגוריה" / "إعادة تعيين الفئة؟"
   - `reset-confirm-message`: "Custom edits will be lost." / ".עריכות מותאמות יאבדו" / ".ستفقد التعديلات المخصصة"
   - `reset-button`: "Reset" / "אפס" / "إعادة تعيين"
   - `cancel`: "Cancel" / "ביטול" / "إلغاء"

**Files**: `src/components/config/ResetButton.tsx` (new), translation dictionaries (modify)

**Validation**:
- [ ] Button rendered with clear destructive styling
- [ ] Confirmation dialog appears on tap
- [ ] Cancel dismisses dialog without action
- [ ] Confirm resets all entries in the category for current language
- [ ] Other categories' overrides unaffected
- [ ] Other languages' overrides unaffected
- [ ] Dialog text is translated

---

### T033: Wire Reset into ConfigScreen

**Purpose**: Place the ResetButton in the CategoryEditor and ensure the reset flow works end-to-end.

**Steps**:
1. Import ResetButton in `CategoryEditor.tsx`
2. Place it at the bottom of the CategoryEditor, below the item list:
   ```tsx
   <ResetButton
     categoryId={category.id}
     onReset={() => resetCategory()}
   />
   ```
3. After reset, the CategoryEditor should reflect the restored defaults immediately (entries show default text/icons).
4. Add a "Reset All" option in the main ConfigScreen (not per-category) that resets ALL categories and language back to defaults. This is a separate button with an even stronger confirmation.

**Files**: `src/components/config/CategoryEditor.tsx` (modify), `src/components/screens/ConfigScreen.tsx` (modify)

**Validation**:
- [ ] ResetButton appears at bottom of CategoryEditor
- [ ] After reset, entries show default values
- [ ] Reset only affects the current category and current language
- [ ] "Reset All" in main config resets everything

---

### T034: Verify Language Persistence Across Sessions

**Purpose**: Confirm that the selected language survives page reload, tab close/reopen, and browser restart.

**Steps**:
1. Select Hebrew as the language
2. Reload the page → should still be Hebrew
3. Close the tab, open a new tab to the app → should still be Hebrew
4. Verify `localStorage.getItem('communicaid-language')` returns `'he'`
5. Clear localStorage → should default to English
6. Verify the `dir` attribute is set correctly on page load (not just on language change)

**Files**: `src/hooks/useLanguage.ts` (verify, may need adjustment for initial dir attribute)

**Validation**:
- [ ] Language persists across page reload
- [ ] dir attribute set correctly on initial page load
- [ ] Defaults to English when no localStorage value
- [ ] RTL layout correct immediately on load (no flash of LTR)

**Edge case**: If the page loads with `dir="ltr"` and then the useEffect sets `dir="rtl"`, there will be a brief layout flash. To prevent this, consider setting `dir` in the `<html>` tag via a tiny inline script in `index.html` that reads localStorage before React hydrates:
```html
<script>
  const lang = localStorage.getItem('communicaid-language');
  if (lang === 'he' || lang === 'ar') document.documentElement.dir = 'rtl';
  if (lang) document.documentElement.lang = lang;
</script>
```

---

### T035: Verify Override Persistence Across Sessions

**Purpose**: Confirm that custom entry edits survive page reload.

**Steps**:
1. Edit an item's text (e.g., change "Apple" to "Green Apple")
2. Reload the page → should still show "Green Apple"
3. Navigate to the category → should show "Green Apple"
4. Open config → CategoryEditor should show "Green Apple" with "edited" indicator
5. Verify `localStorage.getItem('communicaid-overrides')` contains the override
6. Clear localStorage → should revert to defaults

**Files**: No changes expected — verification only. Fix bugs if found.

**Validation**:
- [ ] Custom text persists across reload
- [ ] Custom icon persists across reload
- [ ] Multiple overrides for different entries persist
- [ ] Overrides for different languages persist independently
- [ ] Clearing localStorage reverts everything to defaults

---

### T036: Verify Offline Functionality

**Purpose**: Confirm the app works fully without network after initial page load.

**Steps**:
1. Load the app with network enabled
2. Disconnect from the internet (browser devtools → Network → Offline, or airplane mode)
3. Verify:
   - All communication screens work (navigate categories, tap items)
   - Language switching works
   - Config screen opens
   - Entry editing works
   - Reset to defaults works
   - Recent items work
4. All data is bundled in the app (translations, category structure, icons)
5. Supabase is not used for any of this feature's functionality, so no network dependency
6. The only potential issue: lucide-react icons are bundled, but if the icon picker lazy-loads, the chunk must be cached after first load

**Files**: No changes expected — verification only.

**Validation**:
- [ ] All screens render offline
- [ ] Language switching works offline
- [ ] Entry editing works offline
- [ ] localStorage operations work offline
- [ ] No network requests attempted for translation/config features
- [ ] Lazy-loaded icon picker chunk cached after first load

## Definition of Done

- [ ] ResetButton with confirmation dialog implemented
- [ ] Reset per-category works correctly
- [ ] Language persists across sessions (no RTL flash)
- [ ] Custom overrides persist across sessions
- [ ] App functions fully offline
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Risks

- **RTL flash on load**: If the dir attribute is set only via React useEffect, there's a brief LTR→RTL flash. The inline script in index.html (T034) prevents this.
- **localStorage quota**: Very unlikely to hit the ~5MB limit with config data (<50KB), but worth noting.

## Reviewer Guidance

- Test the reset flow with multiple categories edited — ensure only the targeted category is reset
- Test persistence by editing, reloading, and verifying
- Test offline by disconnecting network and exercising all features
- Check for the RTL flash on page load with Hebrew/Arabic selected
- Verify the inline script in index.html sets dir before React renders
