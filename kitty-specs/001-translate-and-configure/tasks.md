# Tasks: Translate & Configure

**Feature**: 001-translate-and-configure
**Created**: 2026-04-08
**Branch**: `translate-and-configure`

## Subtask Index

| ID | Description | WP | Parallel |
|---|---|---|---|
| T001 | Add Language, TranslatedEntry, CustomOverride types to types.ts | WP01 | |
| T002 | Refactor categories.ts to use entry IDs instead of hardcoded text | WP01 | |
| T003 | Create English translation dictionary (en.ts) | WP01 | [P] |
| T004 | Create Hebrew translation dictionary (he.ts) | WP01 | [P] |
| T005 | Create Arabic translation dictionary (ar.ts) | WP01 | [P] |
| T006 | Create translations/index.ts with exports and language config | WP01 | |
| T007 | Implement useLanguage hook with localStorage and dir attribute | WP02 | |
| T008 | Implement useTranslation hook with override merging | WP02 | |
| T009 | Implement useOverrides hook with localStorage CRUD | WP02 | |
| T010 | Create resolveEntry utility function | WP02 | |
| T011 | Audit existing components for directional Tailwind classes | WP03 | |
| T012 | Migrate physical margin/padding classes to logical equivalents | WP03 | |
| T013 | Wire useLanguage dir attribute to document.documentElement | WP03 | |
| T014 | Test RTL layout for all existing screens | WP03 | |
| T015 | Add subtitle prop to CategoryTile, render dual-language | WP04 | [P] |
| T016 | Add subtitle prop to ItemButton, render dual-language | WP04 | [P] |
| T017 | Update ActionBar to use translation hook for action labels | WP04 | [P] |
| T018 | Update Header to use translation hook for title | WP04 | |
| T019 | Update HomeScreen to use translation hook | WP04 | |
| T020 | Update CategoryScreen to use translation hook | WP04 | |
| T021 | Update RecentItems to use translation hook | WP04 | |
| T022 | Update App.tsx to wrap with language provider and add config route | WP04 | |
| T023 | Create ConfigScreen root component with navigation | WP05 | |
| T024 | Create LanguagePicker component (EN/HE/AR selector) | WP05 | [P] |
| T025 | Add settings icon button to Header component | WP05 | |
| T026 | Wire ConfigScreen into App.tsx navigation | WP05 | |
| T027 | Create CategoryEditor component (list of editable items) | WP06 | |
| T028 | Create EntryEditor component (text + icon editing) | WP06 | |
| T029 | Create IconPicker component (searchable lucide grid, lazy-loaded) | WP06 | |
| T030 | Wire CategoryEditor into ConfigScreen with category selection | WP06 | |
| T031 | Wire quick-name editing into ConfigScreen | WP06 | |
| T032 | Create ResetButton component with confirmation dialog | WP07 | |
| T033 | Wire reset per-category into ConfigScreen | WP07 | |
| T034 | Persist and restore language choice across sessions | WP07 | |
| T035 | Persist and restore custom overrides across sessions | WP07 | |
| T036 | Verify offline functionality (all data available without network) | WP07 | |

## Work Packages

### Phase 1: Foundation

#### WP01: Translation Data Layer
**Priority**: Critical (all other WPs depend on this)
**Dependencies**: None
**Estimated prompt size**: ~400 lines

**Goal**: Create the type system and translation dictionaries that all other work packages build on. Refactor `categories.ts` from hardcoded English to ID-based entries with bundled translations in EN/HE/AR.

**Subtasks**: T001, T002, T003, T004, T005, T006

**Implementation sketch**:
1. Define types (Language, TranslatedEntry, CustomOverride)
2. Refactor categories.ts to use IDs and remove text
3. Create translation dictionaries for all three languages
4. Create index.ts to export everything

**Parallel opportunities**: T003, T004, T005 (dictionaries) can be written in parallel.

**Success criteria**: `npm run typecheck` passes. All existing entry IDs have translations in all 3 languages.

---

#### WP02: Translation Hooks
**Priority**: Critical
**Dependencies**: WP01
**Estimated prompt size**: ~350 lines

**Goal**: Implement the three custom React hooks (useLanguage, useTranslation, useOverrides) and the resolveEntry utility that power the entire translation and configuration system.

**Subtasks**: T007, T008, T009, T010

**Implementation sketch**:
1. Create resolveEntry pure utility function
2. Create useLanguage hook (localStorage + dir attribute)
3. Create useTranslation hook (lookup + override merge)
4. Create useOverrides hook (CRUD for custom overrides)

**Parallel opportunities**: T007 and T010 are independent of each other.

**Success criteria**: Hooks compile. resolveEntry returns correct text/icon/subtitle for all language + override combinations.

---

### Phase 2: UI Integration

#### WP03: RTL Support
**Priority**: High
**Dependencies**: WP02
**Estimated prompt size**: ~300 lines

**Goal**: Ensure the entire app renders correctly in RTL mode (Hebrew/Arabic). Audit and migrate Tailwind classes from physical to logical properties where needed.

**Subtasks**: T011, T012, T013, T014

**Implementation sketch**:
1. Audit all components for directional classes (ml-*, mr-*, pl-*, pr-*, left-*, right-*, text-left, text-right)
2. Replace with logical equivalents (ms-*, me-*, ps-*, pe-*, start-*, end-*, text-start, text-end)
3. Wire dir attribute to document element via useLanguage
4. Test each screen in RTL mode

**Parallel opportunities**: None — sequential audit-then-fix.

**Success criteria**: Setting language to HE or AR flips the entire layout correctly. No broken components in RTL.

---

#### WP04: Dual-Language Display
**Priority**: High
**Dependencies**: WP02, WP03
**Estimated prompt size**: ~500 lines

**Goal**: Update all existing communication components to display translations with dual-language support (patient language large, English subtitle small). Wire the translation hooks into every screen.

**Subtasks**: T015, T016, T017, T018, T019, T020, T021, T022

**Implementation sketch**:
1. Add subtitle prop to CategoryTile and ItemButton
2. Update ActionBar with translated action labels
3. Update Header with translated titles
4. Update HomeScreen, CategoryScreen, RecentItems to use translation hooks
5. Update App.tsx to add language provider and config route

**Parallel opportunities**: T015, T016, T017 (component modifications) can be done in parallel.

**Success criteria**: All communication screens display correct text in selected language. Non-English languages show English subtitles. English-only shows no subtitle.

---

### Phase 3: Configuration

#### WP05: Configuration Screen & Language Picker
**Priority**: High
**Dependencies**: WP04
**Estimated prompt size**: ~400 lines

**Goal**: Create the configuration screen accessible from the header, with language selection (EN/HE/AR) and navigation to category editing.

**Subtasks**: T023, T024, T025, T026

**Implementation sketch**:
1. Add settings icon button to Header
2. Create ConfigScreen with category list and language picker section
3. Create LanguagePicker component
4. Wire ConfigScreen into App.tsx navigation (new "config" screen type)

**Parallel opportunities**: T024 (LanguagePicker) can be built independently.

**Success criteria**: Settings icon in header opens config screen. Language picker changes language and immediately updates all screens. Back button returns to communication screens.

---

#### WP06: Entry Editor & Icon Picker
**Priority**: High
**Dependencies**: WP05
**Estimated prompt size**: ~500 lines

**Goal**: Build the entry editing UI — a category editor that lists editable items, an entry editor for text and icon, and a searchable icon picker (lazy-loaded).

**Subtasks**: T027, T028, T029, T030, T031

**Implementation sketch**:
1. Create CategoryEditor (list of items in a category with edit buttons)
2. Create EntryEditor (text input + icon selector)
3. Create IconPicker (searchable grid of lucide icons, React.lazy loaded)
4. Wire CategoryEditor into ConfigScreen
5. Add quick-name editing to ConfigScreen

**Parallel opportunities**: T029 (IconPicker) can be built independently of T027/T028.

**Success criteria**: Caregiver can edit any item's text and icon. Changes appear immediately on communication screens. Quick names are fully editable.

---

### Phase 4: Polish

#### WP07: Reset, Persistence & Offline
**Priority**: Medium
**Dependencies**: WP06
**Estimated prompt size**: ~350 lines

**Goal**: Add reset-to-defaults functionality, ensure all configuration persists across sessions, and verify offline operation.

**Subtasks**: T032, T033, T034, T035, T036

**Implementation sketch**:
1. Create ResetButton with confirmation dialog
2. Wire reset per-category into ConfigScreen
3. Verify language choice persists on reload
4. Verify custom overrides persist on reload
5. Test full offline flow (disconnect network, verify all features work)

**Parallel opportunities**: T032 and T034/T035 are independent.

**Success criteria**: Reset restores defaults for targeted category only. All settings survive page reload. App works fully offline after initial load.

## Dependency Graph

```
WP01 (Translation Data Layer)
  └─→ WP02 (Translation Hooks)
        ├─→ WP03 (RTL Support)
        │     └─→ WP04 (Dual-Language Display)
        │           └─→ WP05 (Config Screen & Language Picker)
        │                 └─→ WP06 (Entry Editor & Icon Picker)
        │                       └─→ WP07 (Reset, Persistence & Offline)
        └─→ WP04 (also depends on WP02 directly)
```

## MVP Scope

**WP01 + WP02 + WP04** = Minimum viable: translations work in the communication screens with language switching (programmatic only, no config UI yet).

**WP01–WP05** = Usable product: language can be selected from config screen, all screens display translations.

**WP01–WP07** = Full feature: editing, icon picker, reset, persistence, offline.

<!-- status-model:start -->
## Canonical Status (Generated)
- WP01: for_review
- WP02: for_review
- WP03: for_review
- WP04: for_review
- WP05: for_review
- WP06: for_review
- WP07: for_review
<!-- status-model:end -->
