# Config File Contract

The exported configuration file is a single JSON document. This contract defines its exact shape, what's required, what's optional, and how the importer treats unexpected input.

## Filename

`communicaid-config.json` (default; user can rename on save).

## MIME type

`application/json` (used in the Blob constructor).

## Encoding

UTF-8. Pretty-printed with 2-space indentation (FR-014).

## Top-level shape

```jsonc
{
  // All three keys are optional. A missing key means "no customization for that section",
  // which on import resets that section to the bundled defaults (FR-009).
  "overrides":  { /* see below */ },
  "quickNames": [ /* see below */ ],
  "language":   "en" | "he" | "ar" | "ru"
}
```

The top-level value MUST be a JSON object. Arrays, nulls, strings, and numbers at the top level are rejected as `invalid_shape`.

Unknown top-level keys are **ignored**, not rejected. This keeps old export files importable after a future feature adds a fourth localStorage key.

## `overrides` section

A JSON object whose keys are storage-keys of the form `${entryId}:${language}` and whose values are `CustomOverride` records:

```jsonc
{
  "overrides": {
    "food-drink-water:he": {
      "entryId": "food-drink-water",
      "language": "he",
      "text": "מים קרים"
    },
    "category-pain:en": {
      "entryId": "category-pain",
      "language": "en",
      "text": "How much does it hurt?",
      "icon": "alert-triangle"
    }
  }
}
```

**Validation rules**:
- The value's `entryId` field is the source of truth (the key is informational; the importer trusts the value).
- `entryId` MUST be a non-empty string.
- `language` MUST be one of `"en" | "he" | "ar" | "ru"`. Anything else → `invalid_language`.
- `text`, if present, MUST be a string ≤100 characters. Longer → `oversized_field`.
- `icon`, if present, MUST be a string ≤100 characters. Longer → `oversized_field`.
- An override may have `text`, `icon`, both, or neither (an empty override is harmless and ignored on apply).
- Unknown fields inside an override are ignored.

## `quickNames` section

A JSON array of quick-name slot definitions:

```jsonc
{
  "quickNames": [
    { "id": "1", "name": "Mom",        "icon": "👩",      "position": 1 },
    { "id": "2", "name": "Dr. Cohen",  "icon": "👨‍⚕️", "position": 2 }
  ]
}
```

**Validation rules**:
- MUST be an array. Anything else → `invalid_shape`.
- Each element MUST have `id` (string), `name` (string ≤100 chars), `icon` (string ≤100 chars), `position` (number).
- The array length is not enforced — but the existing UI assumes 6 slots, so a file with more or fewer slots will produce a UI that may behave unexpectedly. This is acceptable: it's the user's file, they chose what to put in it. If this becomes a problem in practice, add a length check later.
- Unknown fields inside a quick-name entry are ignored.

## `language` section

A single string identifying the active language. MUST be one of `"en" | "he" | "ar" | "ru"`. Anything else → `invalid_language`.

## Empty config

A user with no customizations at all produces:

```json
{
  "overrides": {},
  "quickNames": [],
  "language": "en"
}
```

(or whatever their current language is). This is a valid file and a valid import — it resets the target device to "no overrides, default quick names, that language".

## Error taxonomy

| `ImportError.kind` | Meaning | Example |
|---|---|---|
| `invalid_json` | `JSON.parse` threw | File is corrupt, truncated, or contains a stray comma |
| `invalid_shape` | Top level isn't an object, or a section's type is wrong (e.g. `quickNames` is a string) | `[ "wrong" ]` at top level |
| `invalid_language` | A language code isn't in the allowed set | `"language": "fr"` |
| `oversized_field` | A string field exceeds its char limit | A 200-character `text` override |
| `storage_error` | `localStorage.setItem` threw during apply | Quota exceeded, private mode |

Each error carries a human-readable `message` that the UI surfaces verbatim in the alert dialog.
