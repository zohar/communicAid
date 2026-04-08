# Feature Specification: Translate & Configure

**Feature**: 001-translate-and-configure
**Status**: Draft
**Created**: 2026-04-08
**Mission**: software-dev

## Overview

Enable multi-language support and caregiver-driven customization for the communicAid communication board. The app serves post-surgery patients who cannot speak — caregivers need to quickly set up the device in the patient's language and tailor the communication entries to the patient's specific needs.

## Problem Statement

The current app is English-only with hardcoded entries. In multilingual hospital environments (e.g., Israel), patients and caregivers speak different languages. Additionally, the default communication entries may not match a specific patient's needs, diet, or family situation. Caregivers need a fast, simple way to configure the device at the bedside without technical knowledge.

## Actors

- **Patient**: Post-surgery, non-verbal, possibly cognitively slowed by sedatives. Interacts only with the main communication screens.
- **Caregiver**: Nurse, family member, or aide. Configures the device for a specific patient via the configuration screen. May not speak the patient's language.

## User Scenarios & Testing

### Scenario 1: Setting Up a New Patient (Hebrew-speaking)

A nurse receives a Hebrew-speaking patient post-surgery. The nurse:
1. Opens the configuration screen
2. Selects Hebrew as the patient's language
3. Hands the device to the patient
4. The patient sees all buttons in Hebrew (large text) with English subtitles (small text)
5. The entire layout switches to RTL

**Acceptance**: Language change applies immediately to all screens. RTL layout is correct. English subtitles appear on all buttons.

### Scenario 2: Customizing Food Items for a Patient

A family member wants to replace default food items with the patient's actual preferences:
1. Opens the configuration screen
2. Navigates to the Food & Drink category
3. Taps an item to edit
4. Changes the text (in the current patient language) and selects a different icon
5. Saves — the change appears immediately on the communication screen
6. The edit persists after closing and reopening the app

**Acceptance**: Edited entry displays correctly. Edit persists in local storage. Other entries remain unchanged.

### Scenario 3: Editing People/Quick Names

A caregiver sets up the quick-name buttons with the patient's actual family members:
1. Opens the configuration screen
2. Navigates to the People section
3. Edits all quick-name slots with actual names and appropriate icons
4. The action bar reflects the updated names immediately

**Acceptance**: All quick-name slots are editable. Changes reflect immediately in the action bar.

### Scenario 4: Resetting a Screen to Defaults

After a patient is discharged, a nurse resets the device:
1. Opens the configuration screen
2. Navigates to the Food & Drink category
3. Taps "Reset to Defaults"
4. All entries in that category revert to the default translations for the current language
5. Custom edits are discarded

**Acceptance**: Reset restores original default entries for the current language. Only the targeted screen/category is affected.

### Scenario 5: Arabic-speaking Patient with English-speaking Nurse

An Arabic-speaking patient is assigned an English-speaking nurse:
1. The nurse configures the device with Arabic as the patient language
2. The patient sees Arabic (large) with English subtitles (small)
3. The nurse can read the English subtitles to understand what the patient is selecting
4. The layout is RTL for Arabic

**Acceptance**: Dual-language display works correctly. Nurse can read English subtitles. RTL layout is correct for Arabic.

### Scenario 6: Offline Usage

The device loses internet connectivity:
1. All previously configured entries remain available
2. The patient can continue using the communication board
3. Language selection persists
4. Custom entries persist

**Acceptance**: App functions fully offline with all configured data.

## Functional Requirements

| ID | Requirement | Status |
|---|---|---|
| FR-01 | App supports three languages: English, Hebrew, Arabic | Proposed |
| FR-02 | All default entries (categories, items, phrases) are pre-translated into EN, HE, AR | Proposed |
| FR-03 | Global language selector in configuration screen sets the patient's display language | Proposed |
| FR-04 | When patient language is not English, buttons show patient language (large) and English (small subtitle) | Proposed |
| FR-05 | When patient language is English, buttons show only English (large), no subtitle | Proposed |
| FR-06 | Hebrew and Arabic selections switch the entire UI layout to RTL | Proposed |
| FR-07 | Configuration screen accessible from the main UI (e.g., settings icon in header) | Proposed |
| FR-08 | Categories and items within categories are editable (text and icon) with a fixed count per screen | Proposed |
| FR-09 | Action bar buttons (Yes, No, Help, I Want, I Don't Want, Stop, More, Less) are not editable | Proposed |
| FR-10 | People/quick-name slots are always fully editable (name and icon) | Proposed |
| FR-11 | Editing an entry allows modifying its display text and selecting a lucide-react icon | Proposed |
| FR-12 | Edits override the defaults for the current language only | Proposed |
| FR-13 | A "Reset to Defaults" button per category/screen restores original default entries for the current language | Proposed |
| FR-14 | All configuration (language choice, custom entries) persists locally for offline use | Proposed |
| FR-15 | Configuration changes apply immediately to the communication screens without reload | Proposed |

## Non-Functional Requirements

| ID | Requirement | Threshold | Status |
|---|---|---|---|
| NFR-01 | Language switch applies to all screens within 500ms | 500ms | Proposed |
| NFR-02 | Configuration screen is usable on tablet in portrait and landscape | Both orientations | Proposed |
| NFR-03 | App remains fully functional with no internet connection after initial load | 100% offline capability | Proposed |
| NFR-04 | RTL layout does not break any existing UI components | Zero layout regressions | Proposed |
| NFR-05 | Local storage usage stays under 1MB for all configuration data | < 1MB | Proposed |
| NFR-06 | Configuration screen touch targets meet the same 48px minimum as communication screens | 48px minimum | Proposed |

## Constraints

| ID | Constraint | Status |
|---|---|---|
| C-01 | Default translations must be bundled in the app (not fetched from a server) for offline-first operation | Proposed |
| C-02 | No external i18n library required — translation data is structured data, not UI framework strings | Proposed |
| C-03 | Icon selection is limited to lucide-react icon set | Proposed |
| C-04 | Number of entries per category is fixed (matches current defaults) — users edit content, not structure | Proposed |
| C-05 | Configuration data stored in browser localStorage | Proposed |

## Success Criteria

1. A caregiver can set up the device in a patient's language (EN/HE/AR) in under 30 seconds
2. A caregiver can customize any category's entries within 2 minutes
3. The device functions fully offline after initial page load with all configured data intact
4. A non-native-speaking caregiver can understand patient selections via English subtitles
5. Resetting a category to defaults takes a single tap plus confirmation

## Key Entities

- **Language**: One of EN, HE, AR. Stored as a global preference.
- **TranslatedEntry**: A category/item/phrase with text values per supported language and a lucide icon identifier.
- **CustomOverride**: A user edit that replaces a default entry's text/icon for a specific language. Stored locally.
- **Configuration**: The aggregate of language preference + all custom overrides. Persisted in localStorage.

## Assumptions

- The current set of 9 categories, their subcategories, items, and phrases defines the fixed structure. Customization changes content within this structure, not the structure itself.
- Hebrew and Arabic translations will be provided as part of the implementation (default translation data bundled in the app).
- The configuration screen does not need authentication — the device is assumed to be physically controlled by the caregiver.
- Browser localStorage is sufficient for persistence (no server-side storage needed for configuration).

## Out of Scope

- Adding or removing categories/items (structure changes)
- Server-side configuration sync or multi-device sync
- Text-to-speech or audio output
- User accounts or authentication for the configuration screen
- Export/import configuration as file (nice-to-have for future iteration)

## Dependencies

- lucide-react icon set (already installed) for icon selection in the editor
- RTL CSS support via Tailwind CSS 4 (supports `dir="rtl"` and logical properties)

## Nice-to-Have (Future)

- Export/import configuration as a JSON file for editing in an external text editor
- Additional languages beyond EN/HE/AR
- Per-entry audio recording for custom entries
