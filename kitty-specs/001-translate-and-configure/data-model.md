# Data Model: Translate & Configure

**Feature**: 001-translate-and-configure
**Created**: 2026-04-08

## Entities

### Language

```
Language = "en" | "he" | "ar"
```

Stored as a global preference in localStorage (`communicaid-language`). Defaults to `"en"`.

**Properties**:
- `code`: Language code (en, he, ar)
- `name`: Display name (English, עברית, العربية)
- `dir`: Text direction (ltr | rtl)
- `isRTL`: Convenience boolean

### TranslatedEntry

Represents any translatable content item (category, item, phrase, action button, quick name default).

```
TranslatedEntry {
  id: string              // Unique identifier (e.g., "feelings-pain", "happy", "feel-better")
  type: "category" | "item" | "phrase" | "action" | "quickname"
  translations: {
    en: string            // English text (always present, serves as fallback)
    he: string            // Hebrew text
    ar: string            // Arabic text
  }
  icon: string            // Emoji character OR lucide icon name (e.g., "😊" or "heart")
  parentId?: string       // Parent category ID (for items/phrases/subcategories)
  special?: "pain-scale" | "body-parts" | "time"  // Special rendering mode
  subcategoryOf?: string  // If this is a subcategory, points to parent category
}
```

### CustomOverride

A sparse overlay that replaces specific fields of a default entry. Only edited fields are stored.

```
CustomOverride {
  entryId: string         // References TranslatedEntry.id
  language: Language      // Which language this override applies to
  text?: string           // Overridden display text (for that language)
  icon?: string           // Overridden icon (emoji or lucide name)
}
```

Stored in localStorage as `communicaid-overrides`: `Record<string, CustomOverride>` keyed by `${entryId}:${language}`.

### Configuration (aggregate)

Not a stored entity — computed at runtime from:
1. `language`: Current Language from localStorage
2. `overrides`: Map of CustomOverride from localStorage
3. `defaults`: Bundled TranslatedEntry data

**Resolution logic**:
```
getDisplayText(entryId, language):
  override = overrides[entryId + ":" + language]
  if override?.text exists → return override.text
  else → return defaults[entryId].translations[language]

getDisplayIcon(entryId, language):
  override = overrides[entryId + ":" + language]
  if override?.icon exists → return override.icon
  else → return defaults[entryId].icon

getEnglishSubtitle(entryId, language):
  if language === "en" → return null
  else → return getDisplayText(entryId, "en")
```

## Relationships

```
Language  ←1:N→  CustomOverride (one language has many overrides)
TranslatedEntry ←1:N→ CustomOverride (one entry can have overrides per language)
Category ←1:N→ Item (items belong to a category)
Category ←1:N→ Phrase (phrases belong to a category)
Category ←1:N→ Subcategory (subcategories belong to a parent category)
```

## State Transitions

### Language Selection
```
Any Language → [user selects in config] → New Language
  Side effects: 
    - Update localStorage
    - Set document dir attribute (ltr/rtl)
    - Re-render all components with new language text
```

### Entry Override
```
Default Entry → [user edits in config] → Overridden Entry
  Side effects:
    - Write CustomOverride to localStorage
    - Communication screen reflects change immediately

Overridden Entry → [user resets category] → Default Entry
  Side effects:
    - Remove all CustomOverrides for that category + current language
    - Communication screen reverts to defaults
```

## Validation Rules

- Language must be one of: "en", "he", "ar"
- Entry ID must reference a valid TranslatedEntry
- Override text must be non-empty string (1-100 chars)
- Override icon must be a valid emoji or lucide icon name
- Quick name overrides are always allowed (no structural constraint)
- Action bar entries (Yes, No, Help, etc.) cannot have overrides

## localStorage Schema

```
Key: "communicaid-language"
Value: "en" | "he" | "ar"
Default: "en"

Key: "communicaid-overrides"
Value: JSON string of Record<string, CustomOverride>
  where key = "${entryId}:${language}"
Default: "{}"
```

Estimated storage: ~50KB for full override set (well under 1MB constraint).
