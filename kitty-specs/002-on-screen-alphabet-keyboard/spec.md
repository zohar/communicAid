# Feature Specification: On-Screen Alphabet Keyboard

**Feature Branch**: `002-on-screen-alphabet-keyboard`
**Created**: 2026-04-14
**Status**: Draft
**Input**: User description: "keyboard addition"

## Overview

communicAid currently lets post-surgery, temporarily non-verbal patients communicate by tapping tiles grouped into predefined categories (needs, feelings, pain scale, body parts, etc.). These tiles cover the most common requests, but patients inevitably need to say things no tile represents — a person's name, a specific worry, an unusual request, a question for a caregiver.

This feature adds a free-text entry mode: a simplified on-screen keyboard that lets a sedated, cognitively slowed patient type a short custom message and then "show" it in large letters so any caregiver in the room can read it at a glance.

The keyboard is intentionally minimal. It uses an **alphabetical grid in the patient's language** rather than a typing-optimized layout (no muscle-memory assumption). It has no numbers, no punctuation, and no predicted-word row. The only interactive elements are the letters, space, backspace, clear, show, a language switcher, and the app's existing Home/Back navigation.

Because communicAid already supports multiple languages (including right-to-left ones like Hebrew), the keyboard adapts to the currently active app language and exposes an in-screen **language switcher** so a bilingual patient can compose across languages without leaving the keyboard.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Type a custom message in the active language and show it to a caregiver (Priority: P1)

A patient recovering from throat surgery wants to tell a visiting family member something no existing tile covers. The app is already set to the patient's language. The patient taps the keyboard button in the header, types the message letter by letter using the alphabetical grid for that language, and taps **Show**. The screen fills with the typed text in very large letters so the caregiver standing at the bedside can read it immediately. The patient taps the screen to dismiss the takeover and returns to the keyboard (with text preserved) or the home screen.

**Why this priority**: This is the core user value of the feature. Without it, the keyboard has no purpose. Everything else (error recovery, language switching, edit affordances) is secondary to the type → show → be-understood loop.

**Independent Test**: With the app set to any one configured language, open the app, tap the keyboard button in the header from the home screen, type a short message using only that language's alphabetical grid and space, tap Show, verify the message appears in a large-text fullscreen takeover, tap the takeover, verify it dismisses back to the keyboard with text still present. Delivers the entire "say something custom" value in one flow.

**Acceptance Scenarios**:

1. **Given** the patient is on the home screen and the app language is set to the patient's language, **When** they tap the keyboard button in the header, **Then** the keyboard screen opens with an empty message area and the alphabetical grid for that language visible.
2. **Given** the keyboard is open with an empty message, **When** the patient taps letters in sequence, **Then** each tapped letter appends to the message display in the order tapped, using the correct script for the active language.
3. **Given** the patient has typed a message, **When** they tap **Show**, **Then** the device displays the message in a fullscreen large-text takeover that is legible from several feet away.
4. **Given** the large-text takeover is showing, **When** the patient (or caregiver) taps it (or a clearly visible close affordance), **Then** the takeover dismisses and returns to the keyboard screen with the typed message still present so the patient can edit or re-show it.

---

### User Story 2 - Correct a typo without losing the whole message (Priority: P1)

A sedated patient's hand slips and taps the wrong letter. They need to remove the mistaken character without starting over. They tap **Backspace**, which removes only the last character, and continue typing.

**Why this priority**: Sedated, shaky-handed patients will mistype frequently. If the only recovery is "clear everything and restart", the feature fails its target users in practice even though User Story 1 "works". Backspace must ship with the initial release.

**Independent Test**: Open the keyboard in any configured language, type a 5-character message, tap Backspace, verify the last character is gone and the first 4 remain, type another character, verify it is appended.

**Acceptance Scenarios**:

1. **Given** the message area contains at least one character, **When** the patient taps **Backspace**, **Then** exactly the last character is removed and all earlier characters remain in place.
2. **Given** the message area is empty, **When** the patient taps **Backspace**, **Then** nothing happens (no error, no navigation, no state change).

---

### User Story 3 - Switch languages mid-message (Priority: P1)

A bilingual patient has configured communicAid with two or more languages (for example English + Hebrew). They start typing in Hebrew, then want to add a name or word in English (or vice versa). They tap the **language switcher** inside the keyboard screen, choose a different configured language, the grid swaps to that language's alphabet (and its writing direction), and the patient keeps typing. The text already typed remains in the message area; the new characters append to it.

**Why this priority**: Bilingual patients are a core user segment for communicAid (Hebrew/English is the project's primary deployment context per the app's RTL support). Forcing a full exit-and-reopen cycle every time a patient needs to insert a foreign word would defeat the "minimal mental effort" principle. The switcher must ship with the initial release.

**Independent Test**: Configure the app with at least two languages, open the keyboard, type one character in the first language, tap the language switcher and pick the second language, verify the grid updates to the second language's alphabet and direction, verify the previously typed character is still present in the message area, type a character in the second language, verify it appends correctly.

**Acceptance Scenarios**:

1. **Given** the keyboard is open and at least two languages are configured, **When** the patient taps the language switcher, **Then** a simple selector of all currently configured languages is shown.
2. **Given** the language selector is open, **When** the patient picks a different language, **Then** the letter grid is replaced with that language's alphabet, the grid's writing direction matches that language (LTR or RTL), and the message area's text direction also updates accordingly for new input — but the already-typed characters are preserved in the message area.
3. **Given** only one language is configured, **When** the patient opens the keyboard, **Then** the language switcher is either hidden or visibly disabled (nothing to switch to) but all other keyboard functionality works normally.

---

### User Story 4 - Start a new message from scratch (Priority: P2)

The patient has typed a message they no longer want and wants to begin fresh without tapping Backspace repeatedly.

**Why this priority**: Useful but not survival-critical — Backspace + time accomplishes the same thing. Included in the first release because it's trivial to add alongside the other controls and spares the patient unnecessary effort.

**Independent Test**: Open the keyboard, type any message, tap **Clear**, verify the message display is empty and the keyboard remains open.

**Acceptance Scenarios**:

1. **Given** the message area contains any text, **When** the patient taps **Clear**, **Then** the message area becomes empty and the keyboard remains on screen ready for new input.

---

### User Story 5 - Return to the rest of the app without sending a message (Priority: P2)

The patient opened the keyboard by mistake, or finished showing a message and now wants to use a regular category tile instead. They tap a navigation control (Back or Home) and leave the keyboard.

**Why this priority**: Necessary for basic navigation — a screen the patient cannot leave is a trap. Listed as P2 because the app-wide navigation affordances (Header back/home buttons) already exist and this story is mostly about ensuring the keyboard screen does not break them.

**Independent Test**: Open the keyboard, tap the Home button in the header, verify the home screen is shown. Reopen the keyboard and verify the message area is empty.

**Acceptance Scenarios**:

1. **Given** the keyboard screen is open, **When** the patient taps the Home button, **Then** the app returns to the home screen.
2. **Given** the patient navigates away from the keyboard and later reopens it, **When** the keyboard reopens, **Then** the message area is empty (the feature does not persist draft text across navigation in this release).

---

### Edge Cases

- **Very long messages**: If the patient keeps typing past what the message display can show, the feature must accept the input without breaking layout. The display either scrolls, wraps, or is capped at a maximum character count — whichever is simplest for the target user to understand. The large-text takeover must remain legible for messages at that maximum.
- **Rapid repeated taps on the same key**: Two quick taps must register as two characters, not be debounced away; sedated patients may tap unevenly but intentionally.
- **Show invoked on empty message**: Tapping **Show** with an empty message area does nothing (and the control is visibly disabled). No fullscreen takeover should appear with empty content.
- **Accidental takeover dismissal**: If the takeover dismisses on any tap, a patient resting a finger on the screen could dismiss it immediately. The dismissal behavior must require an intentional tap (not a touch-down that happens as the takeover is appearing) or offer a clearly labeled Close control.
- **Mixed-script messages**: A message composed partly in one language and partly in another must remain correctly displayed both in the message area and in the large-text takeover. Each run of characters is rendered in its native direction; the overall paragraph direction follows the script of the first character (or follows standard Unicode bidi behavior — whichever produces a more predictable result for the patient).
- **Only one configured language**: If caregivers have configured only a single language, the language switcher in the keyboard is hidden or disabled so the patient is not presented with a dead affordance.
- **Language switch on an empty message**: Switching language with an empty message area must simply swap the grid; no error or prompt.
- **Portrait vs. landscape**: The target device is a tablet in landscape (the rest of communicAid assumes this). The keyboard layout must remain usable without horizontal scrolling at the app's minimum supported tablet width for every supported language (including the Russian alphabet, which has the most letters).
- **Language with many letters**: For languages with the largest configured alphabet (e.g., Russian, 33 letters), the grid must still fit on screen without scrolling, and each key must still meet the minimum touch-target size.

## Requirements *(mandatory)*

### Functional Requirements

| ID | Title | User Story | Priority | Status |
|----|-------|------------|----------|--------|
| FR-001 | Keyboard entry point in header | As a patient, I want a keyboard button placed next to the Home button in the header so I can open the keyboard from anywhere in the app. | High | Open |
| FR-002 | Alphabetical grid in active language | As a patient with reduced cognitive capacity, I want the letter keys arranged in alphabetical order of the app's currently active language (not a QWERTY-style typing layout) so I can find a letter by its position in that language's alphabet without relying on typing muscle memory. | High | Open |
| FR-003 | Large touch targets for letter keys | As a patient with reduced motor control, I want each letter key to be a large, visually distinct touch target so I can tap accurately with shaky hands. | High | Open |
| FR-004 | Live message display | As a patient, I want the characters I type to appear immediately in a dedicated message display area above the grid so I can read back what I am composing. | High | Open |
| FR-005 | Space key | As a patient, I want a clearly identifiable space key so I can separate words in my message. | High | Open |
| FR-006 | Backspace key | As a patient, I want a backspace key that removes exactly the last character so I can fix typos without losing the whole message. | High | Open |
| FR-007 | Clear key | As a patient, I want a clear key that empties the message area in one tap so I can start over when the entire message is wrong. | Medium | Open |
| FR-008 | Show action | As a patient, I want a "Show" action that presents my typed message as a fullscreen large-text takeover so a caregiver standing nearby can read it at a glance. | High | Open |
| FR-009 | Dismiss takeover | As a patient or caregiver, I want to dismiss the large-text takeover by tapping it (or a clearly visible close affordance) so I can return to the keyboard and continue composing. | High | Open |
| FR-010 | Preserve text after dismissing takeover | As a patient, I want the typed text to still be present in the message area after I dismiss the takeover so I can re-show, edit, or extend it without retyping. | High | Open |
| FR-011 | Show is inert on empty input | As a patient, I don't want the Show action to produce a fullscreen takeover when the message area is empty, so I am not confused by an empty big-text screen. | Medium | Open |
| FR-012 | Navigate away from keyboard | As a patient, I want the header's Home and Back controls to work from the keyboard screen so I can leave the keyboard at any time. | High | Open |
| FR-013 | Reset message on navigation away | When the patient navigates away from the keyboard screen, the message area is cleared, so that reopening the keyboard starts from a known empty state. | Medium | Open |
| FR-014 | No numbers, punctuation, or predicted words | The keyboard exposes only the language's letters, space, backspace, clear, and show — no number row, no punctuation keys, no predicted-word row — so that the interface stays as simple as possible for cognitively impaired users. | Medium | Open |
| FR-015 | Visible disabled state for Show when empty | When the message area is empty, the Show action is presented in a visibly disabled state so the patient understands why tapping it does nothing. | Low | Open |
| FR-016 | In-keyboard language switcher | As a bilingual patient, I want a language switcher inside the keyboard screen that lists every currently configured app language so I can swap the letter grid to another language without leaving the keyboard. | High | Open |
| FR-017 | Grid swaps to chosen language's alphabet | When the patient selects a different language from the switcher, the letter grid is immediately replaced with the alphabetical grid of that language and its keys update to that language's script. | High | Open |
| FR-018 | Writing direction follows active keyboard language | When a language is active in the keyboard, the grid layout and the text direction for new input in the message area follow that language's writing direction (LTR or RTL). | High | Open |
| FR-019 | Preserve typed text across language switches | Switching the keyboard language does not clear the message area; already-typed characters remain, and new characters append to them, enabling mixed-script messages. | High | Open |
| FR-020 | Hide or disable switcher when one language configured | When only one language is configured for the app, the language switcher is hidden or visibly disabled so the patient is not shown a dead control. | Medium | Open |
| FR-021 | Keyboard opens in active app language | When the patient opens the keyboard screen, the initially displayed letter grid is the grid of the app's currently active language (not a default like English). | High | Open |
| FR-022 | Each supported language provides an alphabetical keyboard | Every language that communicAid supports exposes a corresponding alphabetical letter grid for the keyboard. Adding a new app language requires defining that language's ordered alphabet. | High | Open |

### Non-Functional Requirements

| ID | Title | Requirement | Category | Priority | Status |
|----|-------|-------------|----------|----------|--------|
| NFR-001 | Touch target size | Every interactive key on the keyboard (letters, space, backspace, clear, show, language switcher) has a hit area of at least 64×64 CSS pixels on the minimum supported tablet width, matching existing communicAid tile sizing, for every supported language's alphabet. | Accessibility | High | Open |
| NFR-002 | Takeover legibility | In the large-text fullscreen takeover, text is rendered at a font size such that a 20-character message fills at least 60% of the viewport width without wrapping on the minimum supported tablet width, for any supported script. | Accessibility | High | Open |
| NFR-003 | Contrast | All keyboard keys, the message display, the language switcher, and the takeover text meet WCAG AA contrast ratios against their backgrounds. | Accessibility | High | Open |
| NFR-004 | Tap-to-character latency | The visual update of the message display after tapping a letter key occurs within 100 ms of touch release, so patients feel an immediate response. | Performance | High | Open |
| NFR-005 | Lighthouse accessibility score | The keyboard screen scores at least 90 on Lighthouse accessibility audit, matching the project-wide target. | Accessibility | High | Open |
| NFR-006 | Full keyboard visible without scrolling | On the minimum supported tablet width in landscape, the entire keyboard (grid + controls + message display + language switcher) fits in the viewport without requiring the patient to scroll, for every supported language — including the one with the largest alphabet. | Usability | High | Open |
| NFR-007 | Language switch latency | Tapping a language in the switcher updates the visible grid within 150 ms, so the transition feels instantaneous. | Performance | Medium | Open |

### Constraints

| ID | Title | Constraint | Category | Priority | Status |
|----|-------|------------|----------|----------|--------|
| C-001 | Alphabet scope | The keyboard for each language exposes only that language's letters plus space. No digits, no punctuation, no diacritics beyond what the language's alphabet includes by default, no emoji. | Scope | High | Open |
| C-002 | No text-to-speech | This release does not speak the message aloud. The only presentation mode is the visual large-text takeover. TTS is explicitly deferred to a later feature. | Scope | High | Open |
| C-003 | No persistence | Typed messages are not saved between sessions, not added to Recent Items, and not written to any backend. The message exists only in in-memory component state. | Privacy | High | Open |
| C-004 | No network calls | The keyboard feature makes no network requests. All behavior is local to the client. | Privacy | Medium | Open |
| C-005 | No analytics on content | The app must not log, report, or transmit the content of typed messages anywhere — not to console, not to error reporters, not to analytics. Treat message content as sensitive medical context. | Privacy | High | Open |
| C-006 | Language set matches app configuration | The set of languages offered by the in-keyboard switcher must exactly match the set of languages currently configured in the app. The keyboard does not maintain its own independent language list. | Technical | High | Open |
| C-007 | Keyboard lives alongside existing screens | The feature is added as a new screen reachable via a new header button; it does not replace or restructure the existing HomeScreen, CategoryScreen, or ActionBar. | Technical | High | Open |

### Key Entities

- **Typed Message**: The in-progress string being composed by the patient. Held only in in-memory component state for the duration of the keyboard session. Cleared when the patient navigates away. Never persisted, transmitted, or logged.
- **Keyboard Language**: The language whose alphabet is currently displayed by the letter grid. Defaults to the app's active language when the keyboard opens. Can be changed at any time via the in-screen language switcher. The selection affects the grid contents and the writing direction for new input only; it does not modify the rest of the app's active language.
- **Language Alphabet**: An ordered list of the letters of a given supported language, in that language's conventional alphabetical order, used to render the letter grid. Each supported app language owns exactly one such list.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user who has never seen the keyboard before can type a 10-character message in their primary language and show it to a caregiver in under 60 seconds, in a usability test with 5 participants per supported language, with no verbal instruction beyond "use this to say something".
- **SC-002**: In usability testing with shaky-handed or sedated-proxy users, at least 90% of intended-letter taps result in the intended letter appearing in the message display (the other ~10% are recoverable via Backspace in under 3 seconds).
- **SC-003**: The large-text takeover is legible from 2 meters away for a caregiver with corrected 20/20 vision, for messages up to 20 characters, in normal room lighting, for every supported language's script.
- **SC-004**: 100% of patients who open the keyboard screen can return to the home screen via a visible control, without assistance, within 5 seconds.
- **SC-005**: A bilingual user can switch languages inside the keyboard and successfully append a word in the second language to an existing first-language message in under 15 seconds, in usability testing.
- **SC-006**: The keyboard screen adds no more than 20 KB gzipped to the initial JS bundle, or is code-split so it does not affect initial FCP on 3G.
