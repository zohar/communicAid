# Research: Translate & Configure

**Feature**: 001-translate-and-configure
**Created**: 2026-04-08

## R1: Translation Data Architecture

**Decision**: Use a flat translation dictionary keyed by item ID, bundled as TypeScript modules. No i18n library.

**Rationale**: The app translates structured data (category names, item labels, phrases) — not UI framework strings. A simple `Record<Language, Record<ItemId, string>>` lookup is sufficient, type-safe, tree-shakeable, and works offline with zero runtime overhead.

**Alternatives considered**:
- `react-i18next`: Overkill for structured data translation. Adds ~15KB bundle weight. Designed for UI string translation, not data-driven content.
- `react-intl`: Same concerns as i18next. Adds ICU message parsing overhead we don't need.
- JSON translation files loaded at runtime: Adds async loading complexity and potential offline failure. Bundling as TS modules is simpler and equally effective.

## R2: RTL Support Strategy

**Decision**: Use Tailwind CSS 4 logical properties and the HTML `dir` attribute. Set `dir="rtl"` on the root `<html>` element when HE or AR is selected.

**Rationale**: Tailwind CSS 4 supports logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) which automatically adapt to text direction. Combined with `dir="rtl"` on the document root, this handles layout flipping without custom CSS. The existing codebase uses physical properties (`ml-*`, `mr-*`, `p-4`, `gap-*`) — symmetric utilities like `p-*`, `gap-*`, `rounded-*` are direction-agnostic and need no changes. Only left/right-specific margins and paddings need migration to logical equivalents.

**Alternatives considered**:
- `rtlcss` PostCSS plugin: Generates mirrored stylesheets. Unnecessary when using logical properties natively.
- Separate RTL stylesheet: Maintenance burden, unnecessary with Tailwind logical properties.

## R3: Local Persistence Strategy

**Decision**: Use `localStorage` with a single JSON key per concern: `communicaid-language` for language preference, `communicaid-overrides` for custom entry overrides.

**Rationale**: localStorage is synchronous, always available (no async loading), survives page reloads and browser restarts, and has 5-10MB storage limits across all browsers — well above our <1MB constraint. The data is simple key-value JSON.

**Alternatives considered**:
- IndexedDB: More powerful but async, more complex API. Overkill for <1MB of flat JSON data.
- Cookies: Size-limited (4KB), sent with every request. Not suitable.
- Supabase persistence: Requires auth and network. Contradicts offline-first constraint.

## R4: Icon Picker Component

**Decision**: Build a simple grid-based icon picker that searches the lucide-react icon set by name. Use dynamic import of the lucide icon metadata for the picker, render selected icons as components.

**Rationale**: lucide-react exports ~1500 icons. The picker needs search/filter capability to be usable. Icons are already React components, so rendering is straightforward. The picker only loads in the config screen (code-split).

**Alternatives considered**:
- Third-party icon picker library: No maintained React + lucide-specific picker exists.
- Emoji-only (current approach): Limits expressiveness. The spec requires lucide icon selection.
- Flat icon list without search: Unusable with 1500+ icons.

## R5: Dual-Language Button Display

**Decision**: Modify `ItemButton`, `CategoryTile`, and action bar buttons to accept both a primary text and an optional English subtitle. When the current language is not English, render the patient language as large text and English as a small subtitle below. When the language is English, render only the large text.

**Rationale**: This is the simplest approach — the components already render text and icons, adding a conditional subtitle is a minimal change. The translation lookup resolves both the primary language text and the English fallback at render time.

**Alternatives considered**:
- Separate "caregiver view" toggle: Adds UI complexity to the communication screen, which must stay minimal for patients.
- Tooltip on hover/long-press: Not accessible for tablet use with cognitively impaired users.
