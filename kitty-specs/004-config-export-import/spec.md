# Feature Specification: Config Export & Import

**Feature Branch**: `004-config-export-import`
**Created**: 2026-04-15
**Status**: Draft
**Input**: User description: "Be able to export and import the configuration — all texts and buttons overrides. JSON. Easiest possible. Full export and full replace on import. No versioning, no history."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Caregiver backs up a configured tablet (Priority: P1)

A caregiver has spent time customizing the tablet for a specific patient: edited category labels, renamed quick-name buttons (e.g. "Mom", "Dr. Cohen"), and selected the patient's language. They want to back up that work so they don't lose it if the browser cache is cleared, the device is wiped, or they need to share the same setup with a colleague.

The caregiver opens the configuration screen, taps **Export configuration**, and a file (`communicaid-config.json`) is downloaded to the device. They store that file somewhere safe (email, cloud drive, USB stick).

**Why this priority**: This is the entire purpose of the feature. Without it, every customization is one cache-clear away from being lost forever, which is a real problem for tablet-based assistive devices that are frequently rebooted or wiped between patients.

**Independent Test**: Make at least one customization (edit a label, rename a quick name, or change language). Open the configuration screen. Tap Export. Confirm a JSON file is downloaded and contains the customization.

**Acceptance Scenarios**:

1. **Given** the user has made customizations, **When** they tap Export configuration on the config screen, **Then** a JSON file is downloaded with a sensible default filename (e.g. `communicaid-config.json`).
2. **Given** the downloaded JSON file is opened in any text editor, **When** a human reads it, **Then** every customization the user has made is visible: text/icon overrides, quick names, and the current language.
3. **Given** the user has made no customizations at all, **When** they tap Export, **Then** a valid (possibly empty) JSON file is still produced, with no errors.

---

### User Story 2 - Caregiver restores a configuration on a fresh device (Priority: P1)

The same caregiver (or a different one) sits down at a freshly wiped tablet — or on the same tablet after clearing browser data. They open the configuration screen, tap **Import configuration**, pick the previously-exported `communicaid-config.json` file, confirm the action, and immediately see the configured labels, quick names, and language take effect throughout the app.

**Why this priority**: Export is useless without import. These two stories ship together as one MVP.

**Independent Test**: Take a JSON file produced by Story 1, clear localStorage (or use a fresh browser profile), open the configuration screen, tap Import, pick the file, confirm, and verify all customizations are restored exactly.

**Acceptance Scenarios**:

1. **Given** the user has a previously-exported config file, **When** they tap Import on the config screen and select the file, **Then** the app shows a confirmation dialog warning that current configuration will be replaced.
2. **Given** the user confirms the import, **When** the import completes, **Then** all overrides, quick names, and language are replaced with the file's contents and the rest of the UI updates immediately (without a page refresh) to reflect the new values.
3. **Given** the user cancels the confirmation dialog, **When** they look at the app, **Then** nothing has changed — the existing config is intact.
4. **Given** the user picks a file that is not valid JSON or is missing the expected shape, **When** import is attempted, **Then** the app shows a clear error message and the existing configuration is left untouched.
5. **Given** an import succeeds, **When** the user navigates back to the home screen, **Then** the imported labels, quick names, and language are visible immediately without any manual refresh.

---

### Edge Cases

- What happens when the user taps Export with **no customizations at all**? A valid JSON file is still produced (containing empty maps/arrays and the current language). No errors.
- What happens when the imported file is **valid JSON but has unexpected fields**? Unknown fields are ignored; known fields are applied. The import succeeds.
- What happens when the imported file is **valid JSON but missing some known fields** (e.g. only `overrides`, no `quickNames`)? The missing sections are treated as "no customization for that section" — i.e. they reset to the bundled defaults. This matches the "full replace" mental model.
- What happens when the user **cancels the file picker**? Nothing happens; the existing config is intact.
- What happens when the imported file contains **values that exceed reasonable lengths** (e.g. a 50,000-character label)? The same per-field limits that apply when editing in the UI apply on import — overlong strings are rejected and the import fails with a clear error before any state is changed.
- What happens when the imported file's **language code is unrecognized** (not one of `en`, `he`, `ar`, `ru`)? The import fails with a clear error before any state is changed; the existing language is preserved.
- What happens when the user **imports the same file twice in a row**? Idempotent — the second import is a no-op from the user's perspective (same result).
- What happens when the user **runs the app offline**? Both export and import work — they only touch the local browser; no network calls.
- What happens when an import is attempted on a **browser that blocks file downloads** (e.g. some kiosk profiles)? Export must surface a clear error rather than silently failing.

## Requirements *(mandatory)*

### Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-001 | The configuration screen MUST expose an **Export configuration** action (button or equivalent) that the user can trigger with one tap. | Draft |
| FR-002 | The configuration screen MUST expose an **Import configuration** action (button or equivalent) that the user can trigger with one tap. | Draft |
| FR-003 | When Export is triggered, the system MUST produce a single JSON file containing **all** of the user's persisted customizations: text/icon overrides, quick names, and the current language preference. | Draft |
| FR-004 | The exported file MUST be valid JSON, parseable by any standard JSON parser. | Draft |
| FR-005 | The exported file MUST be downloaded to the user's device with a sensible default filename (e.g. `communicaid-config.json`). | Draft |
| FR-006 | When Import is triggered, the system MUST present a file picker restricted to (or strongly suggesting) JSON files. | Draft |
| FR-007 | After a file is selected, the system MUST present a confirmation dialog warning that the current configuration will be replaced before any state is mutated. | Draft |
| FR-008 | If the user cancels the confirmation dialog, the system MUST leave the existing configuration completely unchanged. | Draft |
| FR-009 | On confirmed import, the system MUST **fully replace** all three persisted configuration sections (overrides, quick names, language) with the file's contents — sections missing from the file are treated as "no customization", restoring those sections to their bundled defaults. | Draft |
| FR-010 | After a successful import, the system MUST update the rest of the UI (home screen, category screens, action bar) immediately, without requiring a page refresh, so the user sees the imported configuration take effect right away. | Draft |
| FR-011 | If the imported file is not valid JSON, the system MUST show a clear error message and leave the existing configuration untouched. | Draft |
| FR-012 | If the imported file fails validation (e.g. unrecognized language code, oversized field), the system MUST show a clear error message and leave the existing configuration untouched (validate-then-write, not write-then-rollback). | Draft |
| FR-013 | The export and import actions MUST work entirely offline — no network calls. | Draft |
| FR-014 | The exported JSON MUST be human-readable enough that a curious user opening it in a text editor can recognize their own customizations (e.g. pretty-printed with two-space indent). | Draft |

### Non-Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-001 | Export MUST complete in under 1 second on a typical tablet, for any realistic configuration size (well under the 1 MB localStorage cap from spec 001 NFR-05). | Draft |
| NFR-002 | Import MUST complete in under 1 second on a typical tablet, for any file produced by this feature's Export. | Draft |
| NFR-003 | The Export and Import buttons MUST be at least 48px tall (the project's minimum touch target from CLAUDE.md) and visually consistent with the existing config screen styling. | Draft |
| NFR-004 | Confirmation and error dialogs MUST be readable by a cognitively slowed user: large text, plain language, one clear primary action and one clear secondary action. | Draft |
| NFR-005 | The feature MUST add **no new runtime dependencies** beyond what's already in `package.json` — JSON serialization, file download via Blob/URL, and file picking via `<input type="file">` are all native browser APIs. | Draft |
| NFR-006 | The feature MUST NOT add any analytics, tracking, or external network calls. Patient configuration is sensitive. | Draft |

### Constraints

| ID | Constraint | Status |
|----|-----------|--------|
| C-001 | Format is **JSON**, not YAML or any other format. | Confirmed |
| C-002 | Behavior on import is **full replace**, not merge. Imported file fully overwrites the three localStorage keys. | Confirmed |
| C-003 | The feature MUST NOT introduce file versioning, schema version fields, migration logic, or any rollback/undo history. The user explicitly requested "whatever is needed to make export and import easy and reliable, not more." | Confirmed |
| C-004 | The feature MUST NOT introduce or change the persistence shape of overrides, quick names, or language. It only reads them on export and writes them on import using the existing localStorage keys (`communicaid-overrides`, `communicaid-quick-names`, `communicaid-language`). | Confirmed |
| C-005 | The feature MUST live within the existing config screen — no new top-level navigation. | Confirmed |
| C-006 | No backend, no Supabase, no cloud sync. The file is downloaded to the user's device via the browser; that's the entire transport layer. | Confirmed |

### Key Entities

- **Exported configuration file**: A single JSON document with three top-level sections corresponding to the three localStorage keys the app uses today:
  - `overrides`: a map keyed by `${entryId}:${language}` whose values describe per-entry text/icon edits.
  - `quickNames`: an ordered list of quick-name slot definitions (id, name, icon, position).
  - `language`: a single string identifying the current language preference.

  The file is the **complete user customization surface** at the moment of export. There is no metadata wrapper, no version field, no timestamp, no app-name field. The shape is exactly what the rest of the app already uses internally, captured as JSON.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can fully back up their tablet's customizations to a file in **under 10 seconds** of interaction time (open config → tap Export → file is on device).
- **SC-002**: A user can fully restore a previously-backed-up configuration on a fresh device in **under 30 seconds** of interaction time (open config → tap Import → pick file → confirm → see updated UI).
- **SC-003**: 100% of the customizations a user has made (text overrides, icon overrides, quick names, language) are present in the exported file.
- **SC-004**: After a successful import, 100% of the imported customizations are visible in the running app **without a page refresh**.
- **SC-005**: An import of a malformed or invalid file leaves the existing configuration **byte-identical** to its pre-import state.
- **SC-006**: The export file produced on Tablet A and imported on Tablet B yields a configuration on Tablet B that is functionally **indistinguishable** from Tablet A's at the moment of export.
- **SC-007**: The feature works fully offline — no network requests are made by either Export or Import.

## Assumptions

- The current persistence layer (three localStorage keys: `communicaid-overrides`, `communicaid-quick-names`, `communicaid-language`) is the complete user-customization surface. Spec 001 has been shipped and these keys are stable. If a future feature adds a fourth localStorage key (e.g. theme), this feature's export/import will need to be updated in lockstep — that is acceptable scope leakage and does not need to be designed for now.
- The existing change-event mechanism (`communicaid-overrides-changed`, `communicaid-quick-names-changed`) used by the in-app hooks is sufficient to make the rest of the UI react to imported changes without a refresh.
- Modern browsers (the same set already targeted by the SPA) support the Blob/URL.createObjectURL download pattern and the `<input type="file">` picker. No polyfill needed.
- The user is comfortable transferring the exported file via whatever channel they already use (email, USB stick, cloud drive). Transport is out of scope.
- The user will not attempt to hand-craft a config file from scratch — the export file is the only supported source for import. Hand-edited files might still work, but supporting them is not a goal.
