# Implementation Plan: Translate & Configure

**Branch**: `translate-and-configure` | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `kitty-specs/001-translate-and-configure/spec.md`

## Summary

Enable multi-language support (EN/HE/AR) with RTL layout and a caregiver-facing configuration screen for customizing communication board entries. Translation data is bundled as TypeScript dictionaries with sparse localStorage overrides. No external i18n library — translations are structured data lookups. RTL handled via HTML `dir` attribute and Tailwind logical properties.

## Technical Context

**Language/Version**: TypeScript 6, React 19
**Primary Dependencies**: Vite 8, Tailwind CSS 4, lucide-react 1.7
**Storage**: Browser localStorage (offline-first, no server persistence for config)
**Testing**: Vitest (unit/integration), Playwright (e2e) — to be set up
**Target Platform**: Tablet-first SPA, deployed to Netlify/Coolify
**Project Type**: Single SPA (frontend only for this feature)
**Performance Goals**: FCP <2s on mobile 3G, language switch <500ms
**Constraints**: Offline-capable after initial load, <1MB localStorage, 48px min touch targets
**Scale/Scope**: 9 categories, ~80 translatable entries, 3 languages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|---|---|---|
| TypeScript strict mode | Pass | Already enabled in tsconfig |
| ESLint clean | Pass | Currently passing |
| Lighthouse a11y 90+ | Monitor | RTL changes must not regress accessibility |
| Touch targets 48px+ | Pass | Config screen will follow same standard |
| No Supabase keys in frontend | Pass | This feature uses localStorage only |
| Test-first directive | Acknowledge | Test framework to be set up as part of implementation |
| Code-split aggressively | Plan | Icon picker will be lazy-loaded |

**Post-Phase 1 re-check**: No new violations. The design uses localStorage only (no security concerns), follows existing component patterns, and the icon picker is code-split to keep bundle size minimal.

## Project Structure

### Documentation (this feature)

```
kitty-specs/001-translate-and-configure/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── local-storage-api.md
├── checklists/
│   └── requirements.md
└── tasks/               # Phase 2 output (created by /spec-kitty.tasks)
```

### Source Code (repository root)

```
src/
├── data/
│   ├── categories.ts          # REFACTOR: structure-only, no hardcoded text
│   └── translations/
│       ├── index.ts            # NEW: types, exports, language config
│       ├── en.ts               # NEW: English dictionary
│       ├── he.ts               # NEW: Hebrew dictionary
│       └── ar.ts               # NEW: Arabic dictionary
├── hooks/
│   ├── useLanguage.ts          # NEW: language state + dir attribute
│   ├── useTranslation.ts       # NEW: translation lookup + override merge
│   └── useOverrides.ts         # NEW: CRUD for custom overrides
├── components/
│   ├── CategoryTile.tsx        # MODIFY: dual-language display
│   ├── ItemButton.tsx          # MODIFY: dual-language display
│   ├── ActionBar.tsx           # MODIFY: translated labels
│   ├── Header.tsx              # MODIFY: settings button, translated title
│   ├── RecentItems.tsx         # MODIFY: translated labels
│   ├── screens/
│   │   ├── HomeScreen.tsx      # MODIFY: use translation hook
│   │   ├── CategoryScreen.tsx  # MODIFY: use translation hook
│   │   └── ConfigScreen.tsx    # NEW: configuration root
│   └── config/
│       ├── LanguagePicker.tsx   # NEW: EN/HE/AR selector
│       ├── CategoryEditor.tsx   # NEW: edit items in a category
│       ├── EntryEditor.tsx      # NEW: edit single entry (text + icon)
│       ├── IconPicker.tsx       # NEW: searchable lucide icon grid (lazy)
│       └── ResetButton.tsx      # NEW: reset category to defaults
├── types.ts                    # MODIFY: add Language, TranslatedEntry, CustomOverride
└── App.tsx                     # MODIFY: add config route, language provider
```

## Complexity Tracking

No constitution violations. No additional complexity justification needed.

## Key Technical Decisions

### 1. Translation as Data, Not i18n

Translations are TypeScript modules exporting `Record<string, string>` keyed by entry ID. This gives us:
- Type safety (unknown keys caught at compile time)
- Tree-shaking (unused translations stripped)
- Zero runtime overhead (no parsing, no async loading)
- Offline-first by default (bundled in the app)

### 2. Sparse Override Pattern

Custom edits are stored as a sparse overlay in localStorage keyed by `${entryId}:${language}`. Resolution: check override first, fall back to bundled default. This means:
- Minimal storage (only edited entries saved)
- Clean reset (delete overrides for a category)
- Language-scoped edits (override only affects one language)

### 3. RTL via Document Direction

Setting `dir="rtl"` on `<html>` combined with Tailwind's logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) handles layout flipping. Existing symmetric utilities (`p-*`, `gap-*`, `flex`, `grid`) need no changes. Only directional margins/paddings need migration.

### 4. Icon Picker Code-Split

The lucide icon picker is lazy-loaded (`React.lazy`) since it includes metadata for ~1500 icons. It only loads when the caregiver opens the entry editor in the config screen. The communication screens never load this code.

### 5. No State Management Library

Per constitution, React hooks only. Language state flows via a custom `useLanguage` hook that reads/writes localStorage and manages the `dir` attribute as a side effect. Components subscribe to language changes via this hook.

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hebrew/Arabic translations are inaccurate | Medium | Medium | Flag as draft translations, allow override editing as a fallback |
| RTL layout breaks some components | Medium | High | Test each component individually for RTL, use Playwright visual regression |
| Icon picker is too large for bundle | Low | Medium | Lazy load, only import metadata not full SVGs |
| localStorage cleared by browser | Low | Medium | Document risk in config screen, future: export/import feature |
