---
work_package_id: WP05
title: Configuration Screen & Language Picker
lane: "for_review"
dependencies: []
requirement_refs:
- FR-03
- FR-07
- NFR-02
- NFR-06
planning_base_branch: translate-and-configure
merge_target_branch: translate-and-configure
branch_strategy: Planning artifacts for this feature were generated on translate-and-configure. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into translate-and-configure unless the human explicitly redirects the landing branch.
base_branch: translate-and-configure
base_commit: a479e6575f61d731bf7410a10f2e9bcbd2319d05
created_at: '2026-04-08T13:51:10.482873+00:00'
subtasks: [T023, T024, T025, T026]
agent: claude
shell_pid: '80167'
history:
- timestamp: '2026-04-08T13:22:32Z'
  action: created
  by: spec-kitty.tasks
---

# WP05: Configuration Screen & Language Picker

## Objective

Create the configuration screen accessible from a settings icon in the header. The config screen provides language selection (EN/HE/AR) and navigation to category editing (editing UI comes in WP06).

## Branch Strategy

- **Planning/base branch**: `translate-and-configure`
- **Merge target**: `translate-and-configure`
- **Implementation command**: `spec-kitty implement WP05 --base WP04`

## Context

The config screen is the caregiver's interface for setting up the device. It must follow the same design principles as the communication screens: large touch targets, simple layout, clear labeling. The language picker is the most critical element — it must be immediately obvious and fast to use.

**Design constraints** (from constitution):
- Touch targets minimum 48px (ideally 70-90px like communication tiles)
- Tablet-first layout
- Minimal cognitive load

## Subtasks

### T023: Create ConfigScreen Root Component

**Purpose**: Main configuration screen with sections for language selection and category navigation.

**Steps**:
1. Create `src/components/screens/ConfigScreen.tsx`:
   ```typescript
   interface ConfigScreenProps {
     onBack: () => void;
     categories: Category[];
     onCategoryEdit: (category: Category) => void;
   }
   ```
2. Layout:
   - **Language section** at the top: "Language / שפה / اللغة" heading + LanguagePicker component
   - **Categories section**: Grid of category tiles (same style as home screen) that navigate to the category editor
   - Each category tile in config mode should show an "Edit" indicator (e.g., pencil icon overlay)
   - **Quick Names section**: Editable quick-name slots (editing UI in WP06, placeholder here)
3. Use the same styling patterns as existing screens: `bg-slate-200` background, `rounded-2xl` cards, consistent padding.
4. The config screen should be scrollable if content overflows.

**Files**: `src/components/screens/ConfigScreen.tsx` (new)

**Validation**:
- [ ] Config screen renders with language section and category grid
- [ ] Category tiles are tappable and trigger `onCategoryEdit` callback
- [ ] Layout works in both portrait and landscape
- [ ] Touch targets meet 48px minimum
- [ ] Screen is scrollable when content overflows

---

### T024: Create LanguagePicker Component

**Purpose**: A row of 3 large language buttons (English, עברית, العربية) for selecting the patient's display language.

**Steps**:
1. Create `src/components/config/LanguagePicker.tsx`:
   ```typescript
   import { useLanguage } from '../../hooks/useLanguage';
   import { supportedLanguages, languageConfigs } from '../../data/translations';
   ```
2. Render 3 large buttons in a row (or grid-cols-3):
   - Each shows the language's native name (e.g., "עברית")
   - Active language has a highlighted border/background (e.g., `bg-blue-600 text-white`)
   - Inactive languages have neutral styling (e.g., `bg-white border-2 border-slate-300`)
   - Tapping a language calls `setLanguage(lang)`
3. Minimum button height: 70px to match communication screen touch targets.
4. Each button should also show a small flag emoji or language code for quick recognition:
   - EN: 🇬🇧 English
   - HE: 🇮🇱 עברית
   - AR: 🇸🇦 العربية

**Files**: `src/components/config/LanguagePicker.tsx` (new)

**Validation**:
- [ ] All 3 languages displayed with native names
- [ ] Active language visually highlighted
- [ ] Tapping changes language immediately
- [ ] UI switches to RTL when HE or AR selected
- [ ] Touch targets >= 70px height
- [ ] Works in both orientations

---

### T025: Add Settings Icon to Header

**Purpose**: Provide access to the configuration screen from the main communication interface.

**Steps**:
1. Import the `Settings` icon from lucide-react in `Header.tsx`
2. Add a settings button next to the Home button:
   ```tsx
   <button
     onClick={onSettings}
     className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 p-4 rounded-xl flex items-center justify-center transition-all shadow-md min-w-[70px] min-h-[70px]"
   >
     <Settings size={32} />
   </button>
   ```
3. Add `onSettings` callback to `HeaderProps`:
   ```typescript
   interface HeaderProps {
     title: string;
     onBack?: () => void;
     onHome: () => void;
     onSettings: () => void;
   }
   ```
4. Position the settings button on the opposite side from navigation buttons (near the clock), so it's accessible but not easily confused with navigation.
5. The settings button should NOT appear when already on the config screen (or use a different indicator).

**Files**: `src/components/Header.tsx` (modify)

**Validation**:
- [ ] Settings icon visible in header
- [ ] Tapping opens config screen
- [ ] Icon is 32px with 70x70px touch target
- [ ] Position does not conflict with navigation buttons
- [ ] Settings button works in both LTR and RTL layouts

---

### T026: Wire ConfigScreen into App.tsx Navigation

**Purpose**: Connect the config screen to the app's navigation system.

**Steps**:
1. In `App.tsx`, handle the `'config'` screen type in the navigation state:
   ```typescript
   const handleSettings = () => {
     setNavigation({
       screen: 'config',
       breadcrumb: [...navigation.breadcrumb, t('settings')],
     });
   };
   ```
2. Render ConfigScreen when `navigation.screen === 'config'`:
   ```tsx
   {navigation.screen === 'config' && (
     <ConfigScreen
       onBack={handleBack}
       categories={categories}
       onCategoryEdit={(category) => {
         // Placeholder for WP06 — navigate to category editor
       }}
     />
   )}
   ```
3. Pass `onSettings={handleSettings}` to the Header component.
4. The back button from config screen should return to the previous screen.
5. The home button should always return to the home screen.

**Files**: `src/App.tsx` (modify)

**Validation**:
- [ ] Settings icon in header opens config screen
- [ ] Back button returns from config to previous screen
- [ ] Home button returns to home screen from config
- [ ] Breadcrumb shows "Settings" (translated)
- [ ] Config screen does not show in the communication flow

## Definition of Done

- [ ] Settings icon in header opens config screen
- [ ] Config screen shows language picker with 3 languages
- [ ] Language selection changes all screens immediately
- [ ] Category grid in config screen shows all 9 categories
- [ ] Navigation (back, home) works correctly from config
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Risks

- **Accidental language change by patient**: The settings button is in the header, which the patient can see. However, the patient would need to navigate to config AND tap a language button — two deliberate actions. This is acceptable risk for a caregiver-setup device.
- **RTL transition during config**: If the caregiver switches from EN to HE while on the config screen, the entire config screen should flip to RTL immediately. Test this transition.

## Reviewer Guidance

- Verify the settings button is positioned to minimize accidental taps by patients
- Test the language switch flow: EN→HE, EN→AR, HE→EN, AR→EN, HE→AR
- Check that the config screen follows the same visual style as communication screens
- Verify back/home navigation works from config screen in all scenarios

## Activity Log

- 2026-04-08T13:51:10Z – claude – shell_pid=80167 – lane=doing – Assigned agent via workflow command
- 2026-04-08T13:53:10Z – claude – shell_pid=80167 – lane=for_review – Config screen with language picker and settings button
