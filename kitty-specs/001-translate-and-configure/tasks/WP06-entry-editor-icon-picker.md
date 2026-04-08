---
work_package_id: WP06
title: Entry Editor & Icon Picker
lane: planned
dependencies: [WP05]
requirement_refs:
- C-03
- C-04
- FR-08
- FR-10
- FR-11
planning_base_branch: translate-and-configure
merge_target_branch: translate-and-configure
branch_strategy: 'Depends on WP05 — use: spec-kitty implement WP06 --base WP05'
subtasks: [T027, T028, T029, T030, T031]
history:
- timestamp: '2026-04-08T13:22:32Z'
  action: created
  by: spec-kitty.tasks
---

# WP06: Entry Editor & Icon Picker

## Objective

Build the entry editing UI: a category editor listing editable items, an entry editor for text and icon, and a searchable icon picker (lazy-loaded). Also wire quick-name editing.

## Branch Strategy

- **Planning/base branch**: `translate-and-configure`
- **Merge target**: `translate-and-configure`
- **Implementation command**: `spec-kitty implement WP06 --base WP05`

## Context

This is the core configuration functionality. Caregivers edit entries to customize the communication board for a specific patient. The editing flow is:
1. Config screen → tap a category → CategoryEditor (list of items with edit buttons)
2. Tap an item → EntryEditor (text input + icon selector)
3. Tap icon → IconPicker (searchable grid of lucide icons)

Edits are saved via `useOverrides` hook (from WP02) which persists to localStorage.

**Design constraints**:
- Touch-friendly: all interactive elements ≥ 48px
- Simple flow: minimal nesting, clear save/cancel actions
- Immediate feedback: changes visible as soon as saved

## Subtasks

### T027: Create CategoryEditor Component

**Purpose**: List all items in a category with their current text, icon, and edit buttons.

**Steps**:
1. Create `src/components/config/CategoryEditor.tsx`:
   ```typescript
   interface CategoryEditorProps {
     category: Category;
     onBack: () => void;
     onEditEntry: (entryId: string, currentText: string, currentIcon: string) => void;
   }
   ```
2. Layout:
   - Header showing category name (translated) with back button
   - **Phrases section** (if category has phrases): List of phrase entries with edit icon
   - **Items section**: List of item entries with edit icon
   - **Subcategories** (if any): Show subcategory name with drill-down, then list their items
   - Each entry row shows: icon | translated text | edit button (pencil icon)
3. Entry row styling:
   ```tsx
   <div className="flex items-center gap-4 bg-white rounded-xl p-4 border-2 border-slate-200 min-h-[70px]">
     <span className="text-3xl">{icon}</span>
     <span className="text-xl font-semibold flex-1">{t(entryId)}</span>
     <button onClick={() => onEditEntry(entryId, t(entryId), icon)}
       className="bg-slate-200 hover:bg-slate-300 p-3 rounded-lg min-w-[48px] min-h-[48px] flex items-center justify-center">
       <Pencil size={24} />
     </button>
   </div>
   ```
4. Show a visual indicator if an entry has been customized (e.g., small dot or "edited" badge).
5. Include the ResetButton component (from WP07 — render a placeholder for now, or import if available).

**Files**: `src/components/config/CategoryEditor.tsx` (new)

**Validation**:
- [ ] All items in a category listed with icons and text
- [ ] Edit button on each row triggers callback
- [ ] Subcategory items accessible (drill-down or inline)
- [ ] Touch targets ≥ 48px
- [ ] Customized entries visually indicated
- [ ] Scrollable when content overflows

---

### T028: Create EntryEditor Component

**Purpose**: Edit a single entry's display text and icon. Modal or full-screen overlay.

**Steps**:
1. Create `src/components/config/EntryEditor.tsx`:
   ```typescript
   interface EntryEditorProps {
     entryId: string;
     currentText: string;
     currentIcon: string;
     onSave: (text: string, icon: string) => void;
     onCancel: () => void;
   }
   ```
2. Layout (full-screen overlay or modal):
   - **Preview**: Large display of the entry as it would appear on the communication screen (icon + text + subtitle)
   - **Text input**: Large text input field with the current text. Pre-filled with the current value.
     - Label: "Display text" (translated)
     - Input should be large (text-xl, min-h-[60px]) for tablet touch input
   - **Icon selector**: Current icon displayed large, with a "Change icon" button that opens IconPicker
   - **Actions**: "Save" (primary, blue) and "Cancel" (secondary, gray) buttons at the bottom
     - Minimum button height: 70px
3. The text input should edit the text for the CURRENT language only (as per FR-12).
4. Validation: text must be non-empty, max 100 characters.
5. Show character count: `${text.length}/100`

**Files**: `src/components/config/EntryEditor.tsx` (new)

**Validation**:
- [ ] Pre-fills with current text and icon
- [ ] Text input is touch-friendly (large)
- [ ] Save persists the override via `useOverrides`
- [ ] Cancel discards changes
- [ ] Validation prevents empty text
- [ ] Character count displayed
- [ ] Preview updates as user types

---

### T029: Create IconPicker Component (Lazy-Loaded)

**Purpose**: Searchable grid of lucide-react icons for selecting an entry's icon.

**Steps**:
1. Create `src/components/config/IconPicker.tsx`
2. This component must be **lazy-loaded** (code-split) since it imports lucide icon metadata:
   ```typescript
   // In EntryEditor.tsx or wherever it's used:
   const IconPicker = React.lazy(() => import('./IconPicker'));
   ```
3. Implementation:
   - Import icon names from lucide-react. The `icons` export from `lucide-react` is an object mapping icon names to components.
   - **Search bar**: Text input at the top for filtering icons by name
   - **Icon grid**: 6-8 columns of icon buttons, scrollable
   - Each icon button: render the icon component at 24-32px with the icon name below
   - Minimum touch target: 48x48px per icon button
   - **Selected state**: Highlighted border on the currently selected icon
   - "Select" button to confirm, or tap icon to select immediately
4. Performance: The full lucide set has ~1500 icons. Consider:
   - Showing only the first 100-200 icons by default
   - Loading more on scroll (virtualized list) or showing all filtered results
   - Keeping the search responsive (filter as user types, debounced)
5. Also include common emojis as an option — the current app uses emojis, not lucide icons. Add an "Emojis" tab or section with the most common communication-related emojis.

**Files**: `src/components/config/IconPicker.tsx` (new)

**Validation**:
- [ ] Component lazy-loads (check network tab — should load as separate chunk)
- [ ] Search filters icons by name in real-time
- [ ] Grid renders smoothly (no jank with many icons)
- [ ] Touch targets ≥ 48px
- [ ] Selected icon visually highlighted
- [ ] Selection callback fires correctly
- [ ] Suspense fallback shown while loading

---

### T030: Wire CategoryEditor into ConfigScreen

**Purpose**: Connect the config screen's category grid to the CategoryEditor and EntryEditor.

**Steps**:
1. Add navigation state in ConfigScreen (or App.tsx) for the editing flow:
   - `config` → `config-category` → `config-entry`
2. When a category tile is tapped in config screen, show CategoryEditor for that category.
3. When an edit button is tapped in CategoryEditor, show EntryEditor.
4. Wire `useOverrides` into the flow:
   ```typescript
   const { setOverride } = useOverrides(selectedCategory.id);

   const handleSaveEntry = (text: string, icon: string) => {
     setOverride(editingEntryId, { text, icon });
     // Navigate back to CategoryEditor
   };
   ```
5. Back navigation: EntryEditor → CategoryEditor → ConfigScreen.

**Files**: `src/components/screens/ConfigScreen.tsx` (modify), `src/App.tsx` (may need navigation state updates)

**Validation**:
- [ ] Full editing flow works: config → category → entry → save → back
- [ ] Saved edits appear immediately in CategoryEditor list
- [ ] Saved edits appear on communication screen when navigating back
- [ ] Back navigation works at every level

---

### T031: Wire Quick-Name Editing into ConfigScreen

**Purpose**: Allow caregivers to edit the quick-name buttons (People section in action bar).

**Steps**:
1. In ConfigScreen, add a "Quick Names" section below the language picker or categories.
2. Display the current quick-name slots (currently 4: Nurse, Mum, Dad, Doctor) as editable entries.
3. Each quick-name slot is always editable (per spec FR-10) — tapping opens EntryEditor.
4. Quick-name overrides are stored via `useOverrides` with a special category (e.g., `quicknames`).
5. The quick names in App.tsx should read from overrides to reflect edits.

**Files**: `src/components/screens/ConfigScreen.tsx` (modify), `src/App.tsx` (modify quick names state)

**Validation**:
- [ ] All quick-name slots shown in config screen
- [ ] Each slot editable (text + icon)
- [ ] Edits reflected immediately in the action bar
- [ ] Edits persist across sessions

## Definition of Done

- [ ] CategoryEditor lists all items with edit buttons
- [ ] EntryEditor allows text and icon editing
- [ ] IconPicker loads lazily and provides searchable icon selection
- [ ] Full editing flow works end-to-end
- [ ] Quick names are editable from config screen
- [ ] All edits persist in localStorage
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Risks

- **Icon picker performance**: 1500+ icons may cause scroll jank. Mitigate with virtualization or lazy rendering.
- **Emoji vs lucide**: Current app uses emojis. IconPicker should support both. If mixing is complex, prioritize emoji support (existing) with lucide as enhancement.
- **Complex navigation state**: 3-level config navigation (config → category → entry) needs careful state management. Keep it in App.tsx's existing navigation pattern.

## Reviewer Guidance

- Test the full editing flow end-to-end for at least 2 categories
- Verify icon picker loads as a separate chunk (check browser devtools network tab)
- Check that edits survive page reload
- Verify quick-name edits appear in the action bar immediately
- Test editing with Hebrew selected (RTL text input)
