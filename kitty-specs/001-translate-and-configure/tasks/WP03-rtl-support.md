---
work_package_id: WP03
title: RTL Support
lane: planned
dependencies: []
requirement_refs:
- FR-06
- NFR-04
planning_base_branch: translate-and-configure
merge_target_branch: translate-and-configure
branch_strategy: Planning artifacts for this feature were generated on translate-and-configure. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into translate-and-configure unless the human explicitly redirects the landing branch.
subtasks: [T011, T012, T013, T014]
history:
- timestamp: '2026-04-08T13:22:32Z'
  action: created
  by: spec-kitty.tasks
---

# WP03: RTL Support

## Objective

Ensure the entire app renders correctly in RTL mode for Hebrew and Arabic. Audit all components for directional Tailwind classes and migrate them to logical property equivalents.

## Branch Strategy

- **Planning/base branch**: `translate-and-configure`
- **Merge target**: `translate-and-configure`
- **Implementation command**: `spec-kitty implement WP03 --base WP02`

## Context

Tailwind CSS 4 supports logical properties natively. The HTML `dir="rtl"` attribute (set by `useLanguage` from WP02) triggers automatic layout flipping for logical properties. Physical properties (e.g., `ml-4`, `pr-3`, `text-left`) do NOT flip — they must be migrated.

**Key mappings**:
| Physical | Logical |
|---|---|
| `ml-*` | `ms-*` (margin-inline-start) |
| `mr-*` | `me-*` (margin-inline-end) |
| `pl-*` | `ps-*` (padding-inline-start) |
| `pr-*` | `pe-*` (padding-inline-end) |
| `left-*` | `start-*` |
| `right-*` | `end-*` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `rounded-l-*` | `rounded-s-*` |
| `rounded-r-*` | `rounded-e-*` |
| `border-l-*` | `border-s-*` |
| `border-r-*` | `border-e-*` |

**Direction-agnostic utilities** (no change needed): `p-*`, `m-*`, `gap-*`, `flex`, `grid`, `rounded-*` (all sides), `text-center`, `items-center`, `justify-center`, `justify-between`.

## Subtasks

### T011: Audit Existing Components for Directional Classes

**Purpose**: Find every instance of physical directional Tailwind classes across all components.

**Steps**:
1. Search all `.tsx` files in `src/` for these patterns:
   - `ml-`, `mr-`, `pl-`, `pr-` (directional margin/padding)
   - `left-`, `right-` (positioning)
   - `text-left`, `text-right` (text alignment)
   - `rounded-l`, `rounded-r` (directional rounding)
   - `border-l`, `border-r` (directional borders)
   - `space-x-` (may need attention for RTL)
2. Create a list of every match with file, line, and the class that needs changing.
3. Components to audit:
   - `Header.tsx` — has `text-right` for clock area, `gap-*` in flex layout
   - `ActionBar.tsx` — grid layout, should be direction-agnostic
   - `CategoryTile.tsx` — centered content, should be fine
   - `ItemButton.tsx` — centered content, should be fine
   - `RecentItems.tsx` — grid layout
   - `HomeScreen.tsx` — grid layout
   - `CategoryScreen.tsx` — grid + heading alignment
   - `App.tsx` — flex column layout

**Files**: All `src/**/*.tsx` files (read-only audit)

**Validation**:
- [ ] Complete list of directional classes identified
- [ ] Each instance assessed for whether it needs changing

---

### T012: Migrate Physical to Logical Properties

**Purpose**: Replace all directional Tailwind classes identified in T011 with their logical equivalents.

**Steps**:
1. For each instance found in T011, replace the physical class with its logical equivalent.
2. **Expected changes** (based on current codebase analysis):
   - `Header.tsx`: `text-right` on clock div → `text-end`
   - `Header.tsx`: `min-w-[180px]` on clock — this is fine (width is not directional)
   - Any `gap-*` in flex layouts — fine (direction-agnostic)
   - Most components use centered/symmetric layouts and likely need minimal changes
3. Be conservative: only change classes that would break in RTL. Symmetric utilities (`p-4`, `gap-3`, `rounded-xl`, etc.) are fine as-is.

**Files**: Various `src/components/*.tsx` files (modify only those with directional classes)

**Validation**:
- [ ] All physical directional classes replaced with logical equivalents
- [ ] No regressions in LTR mode (English) — app looks identical to before
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes

---

### T013: Wire dir Attribute to Document Element

**Purpose**: Ensure the `useLanguage` hook's `dir` side effect is properly integrated so that switching language actually triggers RTL layout.

**Steps**:
1. This was already implemented in WP02's `useLanguage` hook via `useEffect`.
2. Verify that `App.tsx` (or a top-level component) calls `useLanguage()` so the effect runs.
3. If App.tsx doesn't call `useLanguage` yet, add it at the top level:
   ```typescript
   function App() {
     useLanguage(); // Ensures dir attribute is set on mount
     // ... rest of component
   }
   ```
4. Verify the `<html>` tag in `index.html` does NOT have a hardcoded `dir` attribute (it should be set dynamically).

**Files**: `src/App.tsx` (modify), `index.html` (verify)

**Validation**:
- [ ] Switching language to HE sets `dir="rtl"` on `<html>`
- [ ] Switching language to AR sets `dir="rtl"` on `<html>`
- [ ] Switching language to EN sets `dir="ltr"` on `<html>`
- [ ] `lang` attribute updated on `<html>`

---

### T014: Test RTL Layout for All Screens

**Purpose**: Visually verify that all screens render correctly in RTL mode.

**Steps**:
1. Manually set language to HE (via localStorage or browser devtools: `localStorage.setItem('communicaid-language', 'he')` then reload)
2. Check each screen:
   - **Home screen**: Category grid should still be a 3-column grid, but text should be right-aligned and flow right-to-left
   - **Category screen**: Items, phrases, subcategories should flow RTL
   - **Header**: Back/home buttons should be on the right, clock on the left (swapped from LTR)
   - **Action bar**: Grid layout should flow RTL
   - **Pain scale**: 1-10 should flow right-to-left (10 on the left)
   - **Recent items**: Grid should flow RTL
3. Fix any layout issues discovered.
4. Repeat for AR to verify same behavior.

**Files**: Various components if fixes needed

**Validation**:
- [ ] Home screen grid renders correctly in RTL
- [ ] Category screen renders correctly in RTL
- [ ] Header layout is mirrored (navigation on right, clock on left)
- [ ] Action bar grid renders correctly in RTL
- [ ] Pain scale flows right-to-left
- [ ] No overlapping or broken elements in any screen

## Definition of Done

- [ ] All directional Tailwind classes migrated to logical equivalents
- [ ] RTL layout works correctly for all existing screens when language is HE or AR
- [ ] LTR layout unchanged when language is EN
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Risks

- **Flex direction**: `flex-row` with `dir="rtl"` automatically reverses item order. This is usually desired but may need attention for ordered sequences like the pain scale (1→10 should remain numerically ordered, just flowing RTL).
- **Third-party components**: lucide-react icons are SVGs and don't need flipping. Emojis are direction-agnostic.

## Reviewer Guidance

- Compare LTR and RTL screenshots side-by-side for each screen
- Pay special attention to the Header (buttons should swap sides)
- Verify the pain scale numbers still make sense in RTL (1 on right, 10 on left)
- Check that grid layouts flow naturally (RTL grids fill from right)
