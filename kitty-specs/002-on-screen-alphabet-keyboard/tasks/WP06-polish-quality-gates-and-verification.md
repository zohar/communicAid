---
work_package_id: WP06
title: Polish, Quality Gates & Manual Verification
lane: "approved"
dependencies: [WP05]
requirement_refs:
- C-003
- C-004
- C-005
- NFR-001
- NFR-002
- NFR-003
- NFR-004
- NFR-005
- NFR-006
- NFR-007
planning_base_branch: keyboard
merge_target_branch: keyboard
branch_strategy: Planning artifacts for this feature were generated on keyboard. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into keyboard unless the human explicitly redirects the landing branch.
base_branch: 002-on-screen-alphabet-keyboard-WP05
base_commit: 8f3edfb3ce8d7ce007ec2d6737edfc05583f6a65
created_at: '2026-04-15T07:08:07.565277+00:00'
subtasks:
- T024
- T025
- T026
- T027
- T028
phase: Phase 4 - Polish & Verification
assignee: ''
agent: claude-opus-4-6
shell_pid: '33202'
review_status: "approved"
reviewed_by: "Zohar Stolar"
review_feedback: ''
history:
- timestamp: '2026-04-14T14:01:38Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP06 – Polish, Quality Gates & Manual Verification

## Branch Strategy

- **Planning/base branch at prompt creation**: `keyboard`
- **Final merge target for completed work**: `keyboard`
- **Actual worktree base may differ later**: `/spec-kitty.implement` populates frontmatter `base_branch` when the worktree is created. For stacked WPs it may point at another WP branch, but the final merge target remains `keyboard` unless the human explicitly changes the landing branch.
- **If human instructions contradict these fields**: stop and resolve the intended landing branch before coding.

**Implementation command (depends on WP05)**: `spec-kitty implement WP06 --base WP05`

---

## Objectives & Success Criteria

Run every quality gate, perform the manual quickstart walkthrough, verify accessibility, privacy, and bundle-split targets. This is the final gate before the feature is declared done and merged into `keyboard`.

**This work package is complete when**:

1. `npm run typecheck`, `npm run lint`, `npm run test:run`, and `npm run build` all exit 0.
2. Every step in `kitty-specs/002-on-screen-alphabet-keyboard/quickstart.md` sections 2–8 passes by manual observation.
3. Lighthouse accessibility audit on the keyboard overlay scores ≥ 90.
4. Every letter key at 1024×768 viewport measures ≥ 64×64 CSS pixels.
5. Text/background contrast for letter keys, message display, takeover text, and control buttons meets WCAG AA.
6. No message content appears in Console, Network, localStorage, or sessionStorage at any point during manual testing.
7. `dist/assets/` contains a code-split chunk for `KeyboardScreen` with gzipped size ≤ 20 KB.
8. Existing communicAid features (home, categories, pain scale, body parts, config, quick names, recent items, language switching) still work unchanged.

## Context & Constraints

- **Plan**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/plan.md`
- **Quickstart**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/quickstart.md`
- **Spec success criteria**: `/Users/zohar/apps/communicAid/kitty-specs/002-on-screen-alphabet-keyboard/spec.md` (SC-001 – SC-006)
- **Constitution**: `/Users/zohar/apps/communicAid/.kittify/constitution/constitution.md` (quality gates)

This WP introduces **no new features**. Any issue found must be fixed by editing the files from WP01–WP05 directly, not by scaffolding a new WP. If a fix is substantial, flag it to the reviewer and record the fix in this WP's activity log.

## Subtasks & Detailed Guidance

### Subtask T024 – Automated quality gates

- **Purpose**: Confirm every automated check is green before touching the browser.
- **Steps**:
  1. From repo root, run in order:
     ```bash
     npm run typecheck
     npm run lint
     npm run test:run
     npm run build
     ```
  2. Each command must exit with code 0.
  3. If any command fails, **fix the underlying issue** — do not suppress, do not `--no-verify`, do not skip tests. Common fixes:
     - Unused imports or variables → remove them
     - Missing types → add explicit types, never `any`
     - Failing test → determine whether the test or the code is wrong, fix whichever is incorrect
     - Lint rule violation → fix the code (not the rule)
  4. Record the build's summary output (chunk names and sizes) for use in T028.
- **Files**: Potentially any file from WP01–WP05 if fixes are needed; ideally none.
- **Parallel?**: No — must pass before other subtasks.
- **Notes**: If `npm run build` succeeds but produces warnings about very large chunks, note them but do not block this subtask; T028 handles bundle-size verification for the keyboard chunk specifically.

### Subtask T025 – Manual quickstart walkthrough

- **Purpose**: Execute every step of `quickstart.md` sections 2–8 by hand in a real browser.
- **Steps**:
  1. Start the dev server: `npm run dev`.
  2. Open the printed URL in a browser sized to 1024×768 landscape (or a tablet emulator).
  3. For each section in `quickstart.md` from section 2 through section 8, perform the action and verify the expected outcome:
     - **§2**: Keyboard button appears in header on every screen
     - **§3**: User Story 1 (type + show + dismiss + preserve)
     - **§4**: User Story 2 (backspace + empty no-op)
     - **§5**: User Story 3 (language switcher, all four languages, mixed-script message)
     - **§6**: User Story 4 (clear + show-disabled-on-empty)
     - **§7**: User Story 5 (close returns to previous screen + reopen starts empty)
     - **§8**: Every edge case listed (long message, rapid taps, empty show, touch-hold dismissal safety, Arabic lam-alif, Russian Ё, mixed script in takeover)
  4. For any failure, fix the underlying code in the appropriate WP file and re-run the failed step.
  5. In this WP's activity log, record a one-line summary per quickstart section (e.g., "§3 PASS", "§5 PASS after fixing switcher dropdown z-index").
- **Files**: Potentially any file from WP03/WP04 for fixes.
- **Parallel?**: No — must follow T024.
- **Notes**: The "rapid repeated taps" edge case is testing that we did not accidentally add debouncing. The test for this is tactile — click fast five times and confirm five characters.

### Subtask T026 – Accessibility verification

- **Purpose**: Verify every accessibility gate from the constitution and the spec's NFRs.
- **Steps**:
  1. With the keyboard overlay open, open Chrome DevTools → Lighthouse.
  2. Configure: Mode = Navigation, Device = Desktop, Categories = Accessibility only.
  3. Run the audit. The score must be ≥ 90. Record the score in the activity log.
  4. If the score is below 90:
     - Read the specific failing audits in the report.
     - Most likely fixes: add missing `aria-label` on icon-only buttons, fix disabled-button contrast, ensure `role="dialog"` + `aria-modal="true"` are on the overlay, ensure `aria-live="polite"` on the message display.
     - Fix in the appropriate WP file, re-run Lighthouse, repeat until ≥ 90.
  5. Measure touch-target sizes:
     - With the keyboard open, right-click any letter key and "Inspect".
     - In the Elements panel, the rendered size is shown in the box model overlay.
     - Every letter key must measure ≥ 64×64 CSS pixels at the 1024×768 viewport.
     - Verify at least one key per language (switch language and re-measure Russian, which has the most letters).
  6. Contrast verification:
     - Use Chrome DevTools' built-in contrast checker (in the Styles pane, click a color swatch → "Contrast ratio").
     - Check: letter keys (text vs background), message display (text vs background), takeover text (text vs background), Space/Backspace/Clear (text/icon vs background), Show enabled (white text vs green), Show disabled (text vs background).
     - Every ratio must meet WCAG AA (≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI components).
     - If any ratio fails, adjust the Tailwind color in the failing button and re-run.
- **Files**: Potentially `KeyboardScreen.tsx` / `Header.tsx` for fixes.
- **Parallel?**: Yes with T027 and T028 after T024/T025 pass.
- **Notes**: Lighthouse's desktop mode is more forgiving on touch-target audits than mobile mode. Run desktop mode first; if it's green, you're done. The ≥ 64×64 requirement is enforced by explicit measurement in step 5, not by Lighthouse.

### Subtask T027 – Privacy verification

- **Purpose**: Prove that typed message content never leaves the component's memory.
- **Steps**:
  1. With the dev server running, open the app, open the keyboard, type a recognizable short message (e.g., `PRIVACYCHECK`).
  2. With DevTools open:
     - **Console tab**: Scroll through every log entry. `PRIVACYCHECK` must not appear anywhere — not in any Vite HMR log, not in any React warning, not in any custom log.
     - **Network tab**: Filter to "All". Scroll through every request and response. No URL, query string, header, or body contains `PRIVACYCHECK`. (The keyboard feature should produce zero new network requests in the first place, but verify.)
     - **Application tab → Local Storage → http://localhost:...**: Expand. Inspect every key/value. `PRIVACYCHECK` must not appear. (The `communicaid-language` key from `useLanguage` is expected; it should not contain the message.)
     - **Application tab → Session Storage**: Same check.
     - **Application tab → IndexedDB**: Should be empty or unrelated to the keyboard.
  3. Close and reopen the keyboard overlay. Confirm the message area is empty — the previously typed `PRIVACYCHECK` is gone.
  4. Record the verification in the activity log.
- **Files**: None — observation only. If privacy leaks are found, fix in the source WP file.
- **Parallel?**: Yes.
- **Notes**: If `PRIVACYCHECK` shows up in a React DevTools snapshot, that is acceptable — React DevTools is not in production. The concern is only browser-persistent surfaces and console/network.

### Subtask T028 – Bundle-split verification

- **Purpose**: Confirm `KeyboardScreen` is code-split and its chunk is under 20 KB gzipped.
- **Steps**:
  1. Run `npm run build` (already done in T024; re-run here if needed).
  2. Inspect `dist/assets/` for a chunk containing `KeyboardScreen` in its name. Vite typically names lazy-loaded chunks like `KeyboardScreen-<hash>.js`.
  3. If no such chunk exists (the component was inlined into the main bundle), open `src/App.tsx` and verify:
     - The import is `const KeyboardScreen = lazy(() => import('./components/screens/KeyboardScreen'));`
     - The path is a **string literal**, not a variable.
     - `vite.config.ts` does not have a `build.rollupOptions.output.manualChunks` override that merges this file into another chunk.
     - Fix and re-build.
  4. Measure the chunk's gzipped size:
     ```bash
     gzip -c dist/assets/KeyboardScreen-*.js | wc -c
     ```
     The result is the gzipped size in bytes. Must be ≤ 20480 (20 KB).
  5. If the chunk is larger than 20 KB:
     - Common causes: accidentally bundling all four language translation dictionaries, pulling in a tree-shakeable lucide-react icon as a wildcard import.
     - Fix: use named imports from `lucide-react` (`import { Keyboard, Delete, RotateCcw, Eye, X, Globe } from 'lucide-react'`) and avoid pulling unrelated code into `KeyboardScreen.tsx`.
  6. Record the measured size in the activity log.
- **Files**: Potentially `KeyboardScreen.tsx` or `App.tsx` for fixes.
- **Parallel?**: Yes with T026/T027.
- **Notes**: Vite's build summary already prints gzip sizes for the top chunks; you can read the value directly from that output instead of running `gzip` yourself.

## Test Strategy

- **Automated**: T024 runs the full automated suite. No new tests are added in this WP.
- **Manual**: T025 executes the quickstart walkthrough. T026/T027 execute the a11y and privacy checks. T028 executes the bundle check.
- **Gate**: If any check fails, fix in the upstream WP's files, re-run, repeat until green.

## Risks & Mitigations

- **Lighthouse a11y score between 85 and 89**: Usually a contrast failure on the disabled Show button or a missing label on the language switcher trigger. Fix in place.
- **Chunk size creeps above 20 KB**: Audit imports in `KeyboardScreen.tsx` — avoid `import * as ...` and avoid importing from barrel files that pull in unrelated code.
- **Manual quickstart step reveals a real behavioral bug**: Fix in the source file from WP03 or WP04, then re-run the failing section. Do not create a new WP for a bugfix discovered in WP06.
- **Privacy leak through a React DevTools snapshot**: Ignore — DevTools is not a production surface. The privacy test is limited to browser-persistent surfaces and console/network.

## Review Guidance

The reviewer for WP06 must verify:

1. The activity log contains explicit PASS entries for every quickstart section (2–8), the Lighthouse score, the touch-target measurement, the contrast check, the privacy check, and the chunk size.
2. `npm run typecheck`, `npm run lint`, `npm run test:run`, and `npm run build` all exit 0 at the reviewer's machine.
3. The dev server run by the reviewer reproduces the critical quickstart flows (type + show + dismiss + switch language + close).
4. `dist/assets/KeyboardScreen-*.js` exists and is ≤ 20 KB gzipped.
5. No existing feature regressed (spot-check home, category, config, pain scale, language switching, quick names).
6. The activity log references the commit hashes of any in-WP fixes.

## Activity Log

- 2026-04-14T14:01:38Z – system – lane=planned – Prompt created.
- 2026-04-15T07:08:07Z – claude-opus-4-6 – shell_pid=33202 – lane=doing – Assigned agent via workflow command
- 2026-04-15T07:10:34Z – claude-opus-4-6 – shell_pid=33202 – lane=doing – T025 manual quickstart walkthrough: deferred to human reviewer. Requires a running dev server and a real browser (dev tools, Lighthouse, DevTools inspector). Automated subset of a11y and privacy checks completed via static audit and grep against the production bundle - see WP06 commit message and review notes. Reviewer must run: npm run dev, follow kitty-specs/002-on-screen-alphabet-keyboard/quickstart.md sections 2-8, and separately run Lighthouse on the keyboard overlay plus DevTools Application/Network/Console panes for the browser-interactive portion of T026/T027.
- 2026-04-15T07:10:49Z – claude-opus-4-6 – shell_pid=33202 – lane=for_review – Ready for review. Automated gates all green: typecheck, lint, 47 tests passing, production build success. KeyboardScreen chunk: 2.22 kB gzipped (11% of 20 kB budget). Static a11y audit caught disabled Show contrast (fixed in 8acad05, now ~5.1:1 vs. ~1.95:1 before). Static privacy audit of built bundle: 0 console.*, 0 fetch, 0 localStorage references in KeyboardScreen chunk. T025 manual quickstart walkthrough deferred to human reviewer - requires dev server + Lighthouse + DevTools.
- 2026-04-15T07:26:01Z – claude-opus-4-6 – shell_pid=33202 – lane=approved – User directed to skip review and merge. Automated gates green, static a11y+privacy audit complete, manual quickstart deferred to user's own browser pass post-merge.
