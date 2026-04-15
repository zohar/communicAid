---
work_package_id: WP01
title: Coolify Docker Deploy Artifacts
lane: "doing"
dependencies: []
requirement_refs:
- FR-001
- FR-002
- FR-003
- FR-004
- FR-005
- FR-006
- FR-007
- FR-008
- FR-009
- FR-010
- FR-011
- NFR-001
- NFR-002
- NFR-003
- NFR-004
- NFR-005
planning_base_branch: deploy-and-export
merge_target_branch: deploy-and-export
branch_strategy: Planning artifacts for this feature were generated on deploy-and-export. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into deploy-and-export unless the human explicitly redirects the landing branch.
base_branch: deploy-and-export
base_commit: 3a436773708bef3940d96b5ee75c16611d230be5
created_at: '2026-04-15T08:03:44.700953+00:00'
subtasks:
- T001
- T002
- T003
- T004
- T005
- T006
phase: Phase 1 - Deploy enablement
assignee: ''
agent: ''
shell_pid: "44939"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-04-15T07:59:35Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP01 – Coolify Docker Deploy Artifacts

## ⚠️ IMPORTANT: Review Feedback Status

**Read this first if you are implementing this task!**

- **Has review feedback?**: Check the `review_status` field above. If it says `has_feedback`, scroll to the **Review Feedback** section immediately.
- **You must address all feedback** before your work is complete.
- **Mark as acknowledged**: When you understand the feedback and begin addressing it, update `review_status: acknowledged` in the frontmatter.

---

## Review Feedback

*[This section is empty initially. Reviewers will populate it if the work is returned from review.]*

---

## Markdown Formatting

Wrap HTML/XML tags in backticks: `` `<div>` ``, `` `<script>` ``
Use language identifiers in code blocks: ` ```bash `, ` ```nginx `, ` ```dockerfile `

---

## Branch Strategy

- **Planning/base branch**: `deploy-and-export`
- **Final merge target**: `deploy-and-export`
- **No prior WP dependencies** — branch directly from `deploy-and-export`.
- **Implement command**: `spec-kitty implement WP01`
- During `/spec-kitty.implement`, the actual base branch may differ if WPs are stacked, but for this feature there is only one WP.

---

## Objectives & Success Criteria

Add three files at the repository root that enable zero-configuration Coolify deployment of the communicAid SPA:

1. **`Dockerfile`** — multi-stage build (`node:20-alpine` build → `nginx:alpine` runtime).
2. **`nginx.conf`** — SPA fallback, `/health` endpoint, cache headers, gzip.
3. **`.dockerignore`** — excludes everything that should not enter the build context.

**Done when** all of the following hold on a clean checkout:

- `docker build -t communicaid:local .` succeeds.
- Runtime image size is **strictly less than 100 MB**.
- Container starts on internal port `80` and remains running.
- `GET /` returns the Vite-built SPA shell.
- `GET /any/deep/route` returns the SPA shell (not 404).
- `GET /health` returns HTTP `200` with body `ok`.
- A hashed asset under `/assets/` is served with `Cache-Control: public, max-age=31536000, immutable`.
- `GET /` carries `Cache-Control: no-cache`.
- No secrets, env vars, or sensitive directories are present in any image layer.

These map directly to spec requirements **FR-001…FR-011, NFR-001…NFR-005** and success criteria **SC-001…SC-006**.

---

## Context & Constraints

**Required reading before you start**:

- `kitty-specs/003-coolify-docker-deploy/spec.md` — full requirements, acceptance scenarios, edge cases.
- `kitty-specs/003-coolify-docker-deploy/plan.md` — Constitution Check, structure decision, TEST_FIRST mapping.
- `kitty-specs/003-coolify-docker-deploy/research.md` — locked decisions for base images, ports, cache headers, etc. **Do not relitigate these.**
- `kitty-specs/003-coolify-docker-deploy/contracts/http-surface.md` — exact HTTP surface the runtime must answer.
- `kitty-specs/003-coolify-docker-deploy/quickstart.md` — **the runnable acceptance script. This is your test-first gate.**
- `.kittify/constitution/constitution.md` — TEST_FIRST directive, FCP <2s target, no-secrets-in-frontend rule.

**Hard constraints** (do not violate):

- All three files live at the **repository root** (`/Users/zohar/apps/communicAid/`), not in a subdirectory. Coolify's Dockerfile build pack expects this.
- **No environment variables** at build or runtime. The SPA has no Supabase wiring in this scope.
- **No application source code changes**. Do not touch `src/`, `package.json`, `vite.config.ts`, `tsconfig.json`, or anything outside the three new files.
- **No CI/CD changes**, no `.github/workflows/`, no `netlify.toml`.
- **Base images are locked**: `node:20-alpine` (build) and `nginx:alpine` (runtime). See research.md R1, R2.
- **Internal port is locked**: `80`. See research.md R3.
- **`/health` returns `200 "ok\n"` via `return` directive**, not from a static file. See research.md R5.

---

## Subtasks & Detailed Guidance

### Subtask T001 – Run the acceptance script (TEST_FIRST failure baseline)

- **Purpose**: Honor the constitution's `TEST_FIRST` directive. For a deploy artifact, the test-first equivalent is running the acceptance script **before** the artifacts exist and observing it fail. This proves the script actually catches the absence of working deploy files, and locks in the baseline that the implementation must move from red to green.
- **Steps**:
  1. Open `kitty-specs/003-coolify-docker-deploy/quickstart.md`.
  2. Run **step 1** (`docker build -t communicaid:local .`).
  3. Confirm it fails with a clear error (most likely "unable to prepare context: cannot evaluate symlinks in Dockerfile path" or "Dockerfile does not exist"). This is the expected failure.
  4. Append a one-line note to this WP's Activity Log: `<timestamp> – <agent> – lane=doing – TEST_FIRST: acceptance script fails as expected (no Dockerfile yet)`.
- **Files**: None modified. This is a verification step.
- **Parallel?**: No — must be the very first action.
- **Notes**: Do **not** skip this. It is the test-first gate. If you cannot make it fail (e.g. you find a stray Dockerfile already there), stop and investigate before continuing.

### Subtask T002 – Write `.dockerignore` [P]

- **Purpose**: Keep the Docker build context small and reproducible, and prevent secrets, editor metadata, and unrelated experimental directories from entering image layers. Satisfies **FR-008** and **NFR-004**.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/.dockerignore` with the entries below.
  2. Verify with `du -sh .` minus the excluded paths that the effective context is small.
- **Files**:
  - `.dockerignore` (new, repo root)
- **Parallel?**: Yes — can be written alongside T003.
- **Content** (use exactly this list; it is derived from research.md R7 and the actual repo state including the untracked `communicAid-v2/` and `communicAid.pen` paths shown in `git status`):

  ```gitignore
  # Version control
  .git
  .gitignore
  .gitattributes

  # Dependencies and build output (will be regenerated inside the image)
  node_modules
  dist
  build
  coverage

  # Environment files — never enter image layers
  .env
  .env.*
  *.env

  # Editor / OS metadata
  .vscode
  .idea
  .DS_Store
  *.swp
  *.swo

  # Logs
  *.log
  npm-debug.log*

  # Spec Kitty + planning artifacts (not needed at runtime)
  kitty-specs
  .kittify
  .worktrees

  # Unrelated experimental directories present in this repo
  communicAid-v2
  communicAid.pen

  # CI / deploy configs not needed inside the image
  .github
  netlify.toml
  ```

- **Notes**: If `.gitignore` happens to include something else worth excluding from the build context, mirror it here as well — but **do not** copy `.gitignore` blindly; some entries (e.g. `.env.example`) might actually be needed.

### Subtask T003 – Write `nginx.conf` [P]

- **Purpose**: Configure nginx to serve the static SPA with correct routing, healthcheck, gzip, and cache headers. Satisfies **FR-004, FR-005, FR-006, FR-007, FR-011, NFR-003**, and the constitution's FCP <2s target.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/nginx.conf` with the content below.
  2. The Dockerfile (T004) will copy this file to `/etc/nginx/conf.d/default.conf` inside the runtime image, so the file is a `server { ... }` block — **not** a top-level `nginx.conf` with `events {}` and `http {}`. Those are inherited from the stock `nginx:alpine` config.
- **Files**:
  - `nginx.conf` (new, repo root)
- **Parallel?**: Yes — can be written alongside T002.
- **Content**:

  ```nginx
  server {
      listen 80;
      server_name _;

      root /usr/share/nginx/html;
      index index.html;

      # Gzip — keeps the FCP <2s target on mobile 3G achievable
      gzip on;
      gzip_vary on;
      gzip_min_length 1024;
      gzip_proxied any;
      gzip_comp_level 6;
      gzip_types
          text/plain
          text/css
          text/javascript
          application/javascript
          application/json
          application/xml
          image/svg+xml
          font/woff
          font/woff2;

      # Healthcheck — generated by nginx, no disk I/O
      location = /health {
          access_log off;
          add_header Content-Type text/plain;
          return 200 "ok\n";
      }

      # Hashed assets — safe to cache aggressively because filenames change with content
      location /assets/ {
          access_log off;
          add_header Cache-Control "public, max-age=31536000, immutable";
          try_files $uri =404;
      }

      # Never cache the SPA shell — must always pick up new deploys
      location = /index.html {
          add_header Cache-Control "no-cache";
          try_files $uri =404;
      }

      # SPA fallback — serve real files when present, otherwise return the shell
      location / {
          add_header Cache-Control "no-cache";
          try_files $uri $uri/ /index.html;
      }
  }
  ```

- **Notes**:
  - Do **not** add an `events {}` or top-level `http {}` block — this file is included as a server block by the stock nginx config in `/etc/nginx/conf.d/`.
  - The `add_header Cache-Control "no-cache"` on `location /` only takes effect on the fallback `index.html` response (other paths are handled by the more-specific `location /assets/` block first). Acceptance steps 8 and 9 verify both.
  - Vite's default output puts hashed assets under `dist/assets/`. If a future build config moves them, this nginx block must be updated in lockstep — but that is **out of scope** for this WP.

### Subtask T004 – Write the multi-stage `Dockerfile`

- **Purpose**: Build the SPA with Node and serve it with nginx, in a single self-contained image with no source code, no Node runtime, and no build toolchain in the runtime layer. Satisfies **FR-001, FR-002, FR-003, FR-009, FR-010, NFR-001, NFR-002, NFR-005**.
- **Steps**:
  1. Create `/Users/zohar/apps/communicAid/Dockerfile` with the content below.
  2. Make sure both `package.json` and `package-lock.json` exist at the repo root (they should — `npm ci` requires the lockfile).
- **Files**:
  - `Dockerfile` (new, repo root)
- **Parallel?**: No — depends on T002 (so the build context is clean) and T003 (the file it copies must exist).
- **Content**:

  ```dockerfile
  # syntax=docker/dockerfile:1.6

  # ---- Build stage ------------------------------------------------------------
  FROM node:20-alpine AS build

  WORKDIR /app

  # Install dependencies first (better layer caching)
  COPY package.json package-lock.json ./
  RUN npm ci

  # Build the SPA
  COPY . .
  RUN npm run build

  # ---- Runtime stage ----------------------------------------------------------
  FROM nginx:alpine AS runtime

  # Replace the default site config with our SPA-aware one
  COPY nginx.conf /etc/nginx/conf.d/default.conf

  # Copy the built static assets
  COPY --from=build /app/dist /usr/share/nginx/html

  EXPOSE 80

  # nginx:alpine's default CMD already runs nginx in the foreground.
  # No CMD override needed.
  ```

- **Notes**:
  - The `COPY . .` in the build stage is what makes `.dockerignore` important — without it, `node_modules`, `kitty-specs/`, and friends would all enter the build context.
  - Do **not** add `HEALTHCHECK` to the Dockerfile. Coolify performs its own healthcheck against `/health`, and adding a Docker-level healthcheck would duplicate the work and slow container startup.
  - Do **not** introduce build args. The deploy must require zero configuration (FR-010, C-003).
  - Keep the file minimal and readable — NFR-005 explicitly requires that a maintainer can understand the entire deploy setup in under 5 minutes.

### Subtask T005 – Run the full acceptance script — all green

- **Purpose**: Execute the runnable acceptance script in `quickstart.md` end-to-end and confirm every step passes. This is the test-first "green" phase.
- **Steps**:
  1. Open `kitty-specs/003-coolify-docker-deploy/quickstart.md`.
  2. Run steps 1 through 10 in order.
  3. For each step, confirm the expected outcome matches reality. Do **not** skip the cache-header checks (steps 8 and 9) — they are easy to forget and they are the difference between "works" and "works correctly after redeploy".
  4. If any step fails, fix the underlying file (Dockerfile, nginx.conf, or .dockerignore) and re-run from step 1. Do not patch around failures.
  5. Append an Activity Log entry summarising the result: `<timestamp> – <agent> – lane=doing – Acceptance script all 10 steps green; image size <size>`.
- **Files**: None modified (this is a verification step). May create and immediately remove a local `communicaid-test` container.
- **Parallel?**: Can overlap with T006.
- **Notes**:
  - The script does `docker run -p 8080:80` — make sure no other process is using `8080` locally (e.g. another dev server). If it is, change the port flag to something else and adjust the curl URLs in your run.
  - Step 8 extracts a hashed asset path from `index.html`. If your local Vite build emits a path other than `/assets/...`, update the nginx `location /assets/` block accordingly **and** flag it in the Activity Log so reviewers know.

### Subtask T006 – Security & secret audit, image-size assertion

- **Purpose**: Final paranoia pass before review. Confirms that the runtime image has no secrets, the image-size NFR is met, and `.dockerignore` is doing its job. Satisfies **NFR-001, NFR-004**, and the constitution's "no secrets in frontend" rule.
- **Steps**:
  1. Image size assertion (also covered by acceptance step 2, but call it out explicitly here):

     ```bash
     docker image inspect communicaid:local --format '{{.Size}}'
     ```

     Expected: numeric value `< 100000000`. If it exceeds 100 MB, investigate `docker history communicaid:local --no-trunc` to find the bloated layer.

  2. Layer scan for secrets and unwanted files:

     ```bash
     docker history communicaid:local --no-trunc
     docker run --rm communicaid:local sh -c 'find /usr/share/nginx/html -type f | head -50'
     docker run --rm communicaid:local sh -c 'ls /usr/share/nginx/html'
     ```

     Confirm the runtime filesystem under `/usr/share/nginx/html` contains only Vite's `dist/` output — no `.env`, no `node_modules`, no `kitty-specs`, no `communicAid-v2`, no `.git`.

  3. `.dockerignore` audit:

     ```bash
     # Show what the build context actually contains (excluding ignored paths):
     docker build --no-cache --progress=plain -t communicaid:audit . 2>&1 | grep -E 'transferring context|sending build context'
     ```

     The "transferring context" line should be small (well under 50 MB). If it's hundreds of MB, your `.dockerignore` is missing something.

  4. Confirm zero env vars: grep the Dockerfile for `ENV` or `ARG` — there should be none beyond what Node/nginx need internally.

  5. Append an Activity Log entry: `<timestamp> – <agent> – lane=doing – Security/size audit green: image <size> MB, no secrets in layers, .dockerignore verified`.

- **Files**: None modified. May create a transient `communicaid:audit` image; remove it with `docker rmi communicaid:audit` when done.
- **Parallel?**: Can overlap with T005.
- **Notes**: If the `find` command shows surprising files inside the runtime image (anything that isn't part of Vite's `dist/` output), the build context is leaking. Fix `.dockerignore` and rebuild from scratch with `--no-cache`.

---

## Test Strategy

This WP's "tests" are the runnable acceptance script in `quickstart.md`. There are no Vitest or Playwright tests to add — see plan.md "Constitution Check → TEST_FIRST" for the rationale.

The test-first loop is:

1. **Red** (T001): Run the script with no deploy files present. It fails on step 1 (`docker build`).
2. **Green** (T002 → T003 → T004 → T005): Add the three files and re-run the script until all 10 steps pass.
3. **Refactor** (T006): Audit for security, size, and leakage. If anything is wrong, fix and re-run T005.

Every step in `quickstart.md` maps to a specific spec requirement — see the comments inside that file for the mapping.

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| `npm ci` fails inside the container due to lockfile drift | Low | Run `npm ci && npm run build` locally first to confirm clean state before suspecting the Dockerfile. |
| SPA fallback masks real 404s for missing assets | Medium | The `try_files` directive checks for the asset on disk first; the `/assets/` block uses `try_files $uri =404` so genuinely missing hashed assets DO return 404. Only unmatched paths fall through to `index.html`. Verified by acceptance step 8. |
| `index.html` cached by intermediaries → users stuck on stale shell after redeploy | Medium | Explicit `Cache-Control: no-cache` on the `index.html` response. Verified by acceptance step 9. |
| Image bloat past 100 MB | Low | Multi-stage build discards the entire Node/build filesystem; runtime is just `nginx:alpine` (~25 MB) plus Vite's `dist/` (typically a few MB). T006 explicitly asserts. |
| Local `.env` or other secret accidentally enters the build context | Low | `.dockerignore` excludes `.env*`. T006 explicitly audits image layers. |
| Maintainer adds Supabase env vars later and breaks the "zero env vars" assumption | Low | Out of scope for this WP. A future feature must handle runtime env injection (e.g. an entrypoint script that rewrites a config file). Note this in the implementation summary so reviewers see it. |
| Coolify uses a non-standard internal port mapping | Low | Container exposes 80; Coolify routes external traffic. If a host explicitly demands a different port, that's a separate change and out of scope. |

---

## Review Guidance

Reviewers should verify, in order:

1. **Three files exist at repo root**: `Dockerfile`, `nginx.conf`, `.dockerignore`. **No** new files anywhere else (no changes to `src/`, `package.json`, etc.).
2. **The acceptance script in `quickstart.md` runs clean on the reviewer's machine**, end-to-end, all 10 steps. This is the single most important review action.
3. **Constitution gates**:
   - TEST_FIRST honored: Activity Log shows the red-then-green sequence (T001 failed, then T005 passed).
   - No secrets in image layers (T006 audit recorded).
   - FCP target preserved: gzip on, hashed assets `immutable`, `index.html` `no-cache`.
   - No env vars introduced.
4. **`.dockerignore` actually excludes the dangerous paths** — spot-check by running `docker build --progress=plain` and inspecting the "transferring context" size.
5. **Image size <100 MB** — confirm with `docker images communicaid:local`.
6. **Readability**: a reviewer unfamiliar with this repo should be able to read all three files in under 5 minutes and understand the entire deploy setup. If you have to re-read a block to figure out what it does, push back on the implementer.

Reviewer should reject the WP if any acceptance step fails locally, if any file lives outside repo root, or if any application source file has been touched.

---

## Activity Log

> **CRITICAL**: Activity log entries MUST be in chronological order (oldest first, newest last). APPEND new entries at the END.

**Format**: `- YYYY-MM-DDTHH:MM:SSZ – <agent_id> – lane=<lane> – <brief action>`

**Initial entry**:
- 2026-04-15T07:59:35Z – system – lane=planned – Prompt generated via /spec-kitty.tasks

---

### Updating Lane Status

To change this work package's lane:

1. **Edit directly**: Change the `lane:` field in frontmatter AND append an activity log entry at the end.
2. **Use CLI** (recommended): `spec-kitty agent tasks move-task WP01 --to <lane> --note "message"`

**Valid lanes**: `planned`, `doing`, `for_review`, `done`

**Implement command**: `spec-kitty implement WP01`
