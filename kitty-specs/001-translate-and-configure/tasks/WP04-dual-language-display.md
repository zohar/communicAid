---
work_package_id: WP04
title: Dual-Language Display
lane: "for_review"
dependencies: []
requirement_refs:
- FR-03
- FR-04
- FR-05
planning_base_branch: translate-and-configure
merge_target_branch: translate-and-configure
branch_strategy: Planning artifacts for this feature were generated on translate-and-configure. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into translate-and-configure unless the human explicitly redirects the landing branch.
base_branch: translate-and-configure
base_commit: 613e09875d1aa1edd3df04835842d47c28eafec5
created_at: '2026-04-08T13:47:38.592092+00:00'
subtasks: [T015, T016, T017, T018, T019, T020, T021, T022]
agent: claude
shell_pid: '78730'
history:
- timestamp: '2026-04-08T13:22:32Z'
  action: created
  by: spec-kitty.tasks
---

# WP04: Dual-Language Display

## Objective

Update all existing communication components to display translations with dual-language support: patient language as large text, English subtitle as small text (when patient language is not English). Wire the translation hooks into every screen.

## Branch Strategy

- **Planning/base branch**: `translate-and-configure`
- **Merge target**: `translate-and-configure`
- **Implementation command**: `spec-kitty implement WP04 --base WP03`

## Context

After WP01-WP03, the translation data, hooks, and RTL support are in place. This WP connects them to the actual UI components. Every user-visible string must now come from `useTranslation().t()` instead of hardcoded text.

**Dual-language rule** (FR-04, FR-05):
- If language is NOT English: show patient language (large) + English subtitle (small)
- If language IS English: show English only (large), no subtitle

## Subtasks

### T015: Add Dual-Language Display to CategoryTile

**Purpose**: Category tiles on the home screen show translated category names with English subtitles.

**Steps**:
1. Add optional `subtitle` prop to `CategoryTile`:
   ```typescript
   interface CategoryTileProps {
     name: string;
     subtitle?: string | null;
     icon: string;
     onClick: () => void;
   }
   ```
2. Render subtitle below the name when present:
   ```tsx
   <span className="text-2xl font-bold text-slate-800 text-center leading-tight">
     {name}
   </span>
   {subtitle && (
     <span className="text-sm text-slate-500 text-center leading-tight">
       {subtitle}
     </span>
   )}
   ```
3. The subtitle text should be smaller and lighter than the main text.

**Files**: `src/components/CategoryTile.tsx` (modify)

**Validation**:
- [ ] Subtitle renders below name when provided
- [ ] No subtitle when prop is null/undefined
- [ ] Layout does not break with long translated text

---

### T016: Add Dual-Language Display to ItemButton

**Purpose**: Item and phrase buttons show translated text with English subtitles.

**Steps**:
1. Add optional `subtitle` prop to `ItemButton`:
   ```typescript
   interface ItemButtonProps {
     text: string;
     subtitle?: string | null;
     icon: string;
     onClick: () => void;
     variant?: 'default' | 'phrase';
   }
   ```
2. Render subtitle below the text:
   ```tsx
   <span className="text-xl text-center leading-tight">{text}</span>
   {subtitle && (
     <span className="text-xs text-center leading-tight opacity-70">
       {subtitle}
     </span>
   )}
   ```
3. For the `phrase` variant, subtitle should still be visible (slightly lighter on the amber background).

**Files**: `src/components/ItemButton.tsx` (modify)

**Validation**:
- [ ] Subtitle renders for both default and phrase variants
- [ ] Subtitle is visually distinct but readable on both color schemes
- [ ] Touch target size (min-h-[140px]) still accommodated with subtitle

---

### T017: Update ActionBar with Translated Labels

**Purpose**: The 8 permanent action buttons (Yes, No, Help, etc.) and quick-name buttons display translated text with English subtitles.

**Steps**:
1. Import `useTranslation` in `ActionBar.tsx`
2. Replace hardcoded `permanentActions` array text with translation lookups:
   ```typescript
   const { t, tEn } = useTranslation();
   const permanentActions = [
     { id: 'action-yes', icon: '✅' },
     { id: 'action-no', icon: '❌' },
     { id: 'action-help', icon: '🆘' },
     { id: 'action-i-want', icon: '👍' },
     { id: 'action-i-dont-want', icon: '👎' },
     { id: 'action-stop', icon: '🛑' },
     { id: 'action-more', icon: '➕' },
     { id: 'action-less', icon: '➖' },
   ];
   ```
3. Render each button with `t(action.id)` for main text and `tEn(action.id)` for subtitle.
4. Action bar buttons have less space (min-h-[90px]) — subtitle should be very small (text-[10px]) or omitted if it would cause overflow. Consider a condensed layout.
5. Quick-name buttons: these are user-editable, so they don't use the translation system for custom names. But the default quick names (Nurse, Mum, Dad, Doctor) should be translated.

**Files**: `src/components/ActionBar.tsx` (modify)

**Validation**:
- [ ] Action buttons show translated text
- [ ] English subtitles appear on action buttons when language is not EN
- [ ] Quick-name defaults are translated
- [ ] Layout does not break with longer translated text (Hebrew/Arabic may be longer or shorter)

---

### T018: Update Header with Translated Title

**Purpose**: The Header shows the current screen title translated.

**Steps**:
1. The `title` prop in Header is currently a string (e.g., "Home", category name).
2. The title will now be passed as already-translated text by the parent component (App.tsx will call `t(...)` before passing).
3. No changes needed to Header's own rendering — it just displays what it receives.
4. However, the "Home" title in App.tsx's breadcrumb needs to come from `t('home')`.

**Files**: `src/components/Header.tsx` (may not need changes), `src/App.tsx` (modify breadcrumb logic)

**Validation**:
- [ ] Header shows translated title text
- [ ] Title text is correct for each screen in each language

---

### T019: Update HomeScreen to Use Translation Hook

**Purpose**: HomeScreen passes translated category names and subtitles to CategoryTile.

**Steps**:
1. Import `useTranslation` in `HomeScreen.tsx`
2. For each category, pass `t(category.id)` as `name` and `tEn(category.id)` as `subtitle`:
   ```tsx
   const { t, tEn } = useTranslation();
   // ...
   <CategoryTile
     key={category.id}
     name={t(category.id)}
     subtitle={tEn(category.id)}
     icon={category.icon}
     onClick={() => onCategorySelect(category)}
   />
   ```

**Files**: `src/components/screens/HomeScreen.tsx` (modify)

**Validation**:
- [ ] Category tiles show translated names
- [ ] English subtitles appear when language is not EN
- [ ] No subtitles when language is EN

---

### T020: Update CategoryScreen to Use Translation Hook

**Purpose**: CategoryScreen shows translated item names, phrase texts, subcategory names, and section headings.

**Steps**:
1. Import `useTranslation` in `CategoryScreen.tsx`
2. Translate all user-visible text:
   - Section headings: `t('common-phrases')`, `t('subcategories')`, `t('choose')`, `t('or-choose')`
   - Pain level heading: `t('pain-level')`
   - Time display heading: `t('current-time')`
   - Body parts heading: `t('point-where-hurts')`, `t('select-below')`
   - Item buttons: `t(item.id)` for text, `tEn(item.id)` for subtitle
   - Phrase buttons: `t(phrase.id)` for text, `tEn(phrase.id)` for subtitle
   - Subcategory tiles: `t(subcategory.id)` for name, `tEn(subcategory.id)` for subtitle
   - Pain level buttons: `t(...)` for "Level X" labels (need translation entries like `pain-level-1` through `pain-level-10`)
3. The `onItemTap` callback currently receives `(text, icon)`. The text should now be the translated text, and the callback should also pass the entry ID for recent items tracking.

**Files**: `src/components/screens/CategoryScreen.tsx` (modify)

**Validation**:
- [ ] All section headings translated
- [ ] All items show translated text with subtitles
- [ ] All phrases show translated text with subtitles
- [ ] Pain scale labels translated
- [ ] Special screens (time, body parts) headings translated

---

### T021: Update RecentItems to Use Translation Hook

**Purpose**: Recent items display translated text.

**Steps**:
1. The recent items currently store `{ text, icon, tappedAt }`. Since items are stored with the text at tap-time, they already have the correct translated text.
2. However, if the language changes after tapping, the recent items would show the old language. Consider storing the entry ID instead and resolving text at render time.
3. Update `RecentItem` type to include `entryId`:
   ```typescript
   export interface RecentItem {
     entryId: string;
     text: string;  // Keep as display fallback
     icon: string;
     tappedAt: Date;
   }
   ```
4. In RecentItems component, use `t(item.entryId)` if entryId is available, otherwise fall back to `item.text`.
5. Update the "Recent" heading to use `t('recent')`.

**Files**: `src/components/RecentItems.tsx` (modify), `src/types.ts` (modify RecentItem)

**Validation**:
- [ ] Recent items heading is translated
- [ ] Recent items show text in current language (not the language at tap-time)
- [ ] Fallback to stored text if entryId is missing

---

### T022: Update App.tsx with Language Provider and Config Route

**Purpose**: Wire useLanguage at the top level and add navigation state for the config screen.

**Steps**:
1. Call `useLanguage()` in App to ensure dir attribute is set on mount.
2. Update the `NavigationState` type to include `'config'` screen:
   ```typescript
   type NavigationState = {
     screen: 'home' | 'category' | 'config';
     category?: Category;
     breadcrumb: string[];
   };
   ```
3. Use `t('home')` for the initial breadcrumb title.
4. Update `handleItemTap` to include `entryId` in the RecentItem.
5. Add a placeholder for config screen rendering (actual ConfigScreen comes in WP05).
6. The `currentTitle` logic needs to translate breadcrumb entries.

**Files**: `src/App.tsx` (modify)

**Validation**:
- [ ] App renders correctly with useLanguage hook
- [ ] Navigation state supports 'config' screen type
- [ ] Breadcrumb titles are translated
- [ ] RecentItem creation includes entryId
- [ ] `npm run typecheck` passes

## Definition of Done

- [ ] All communication components display translated text
- [ ] Dual-language display works: patient language large, English subtitle small
- [ ] English-only mode shows no subtitles
- [ ] All hardcoded English strings in components replaced with `t()` calls
- [ ] Recent items track entryId for language-aware re-rendering
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Risks

- **Text overflow**: Translated text (especially Arabic) may be longer than English. Test that buttons accommodate longer text without breaking layout. The min-height constraints help, but very long translations may need text truncation.
- **Pain scale labels**: Need new translation entries (`pain-level-1` through `pain-level-10`). Ensure these are added to all three dictionaries (may require going back to WP01 dictionaries).

## Reviewer Guidance

- Switch through all three languages and verify every screen
- Check that NO hardcoded English text remains in any component
- Verify subtitle styling is consistent across CategoryTile, ItemButton, and ActionBar
- Test with Hebrew to ensure RTL + dual-language display works together
- Check recent items behavior when switching languages mid-session

## Activity Log

- 2026-04-08T13:47:38Z – claude – shell_pid=78730 – lane=doing – Assigned agent via workflow command
- 2026-04-08T13:51:05Z – claude – shell_pid=78730 – lane=for_review – Dual-language display complete: all components wired with translation hooks
