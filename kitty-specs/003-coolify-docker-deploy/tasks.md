---
description: "Work package task list for Coolify Docker Deploy"
---

# Work Packages: Coolify Docker Deploy

**Inputs**: Design documents from `kitty-specs/003-coolify-docker-deploy/`
**Prerequisites**: plan.md, spec.md, research.md, contracts/http-surface.md, quickstart.md

**Tests**: This feature ships no application code. The constitution's `TEST_FIRST` directive is satisfied by treating `quickstart.md` as the runnable acceptance script (build → boot → curl probes → image-size assertion). The script is run **before** the deploy artifacts exist (must fail), then re-run after each artifact is added until all checks pass.

**Organization**: One single, tightly-coupled work package. The three deploy files (`Dockerfile`, `nginx.conf`, `.dockerignore`) cannot be meaningfully validated independently — the Dockerfile copies `nginx.conf`, `.dockerignore` defines the build context for both stages, and the acceptance script exercises all three together. Splitting would create artificial worktree overhead with no parallelization benefit.

**Branch strategy**:
- Planning/base branch: `deploy-and-export`
- Final merge target: `deploy-and-export`
- `branch_matches_target`: true

---

## Work Package WP01: Coolify Docker Deploy Artifacts (Priority: P1) 🎯 MVP

**Goal**: Add `Dockerfile`, `nginx.conf`, and `.dockerignore` at the repository root so the communicAid SPA can be deployed to Coolify with zero configuration. Verify end-to-end with the acceptance script in `quickstart.md`.
**Independent Test**: Run `kitty-specs/003-coolify-docker-deploy/quickstart.md` steps 1–10 on a clean checkout. All 10 steps must pass: image builds, image <100 MB, container starts on port 80, `/` returns SPA shell, deep routes return SPA shell, `/health` returns `200 ok`, hashed assets carry `immutable` cache headers, `index.html` carries `no-cache`.
**Prompt**: `tasks/WP01-coolify-docker-deploy-artifacts.md`

**Requirements Refs**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, NFR-001, NFR-002, NFR-003, NFR-004, NFR-005

### Included Subtasks

- [x] T001 Run the acceptance script on a clean checkout, capture the failure baseline (TEST_FIRST gate)
- [x] T002 [P] Write `.dockerignore` at repo root excluding node_modules, dist, .git, .env*, kitty-specs, .kittify, .worktrees, communicAid-v2, communicAid.pen, editor metadata
- [x] T003 [P] Write `nginx.conf` at repo root: listen 80, gzip on, `/health` location returns `200 "ok"`, `try_files $uri $uri/ /index.html` SPA fallback, cache headers (immutable for `/assets/`, no-cache for `index.html`)
- [x] T004 Write multi-stage `Dockerfile` at repo root: `node:20-alpine` build stage runs `npm ci && npm run build`; `nginx:alpine` runtime stage copies `dist/` to `/usr/share/nginx/html` and `nginx.conf` to `/etc/nginx/conf.d/default.conf`; `EXPOSE 80`
- [x] T005 Run the full acceptance script end-to-end; all 10 steps green
- [x] T006 Security & secret review: confirm no secrets in any image layer, image size <100 MB, `.dockerignore` actually excludes sensitive directories, no env vars introduced

### Implementation Notes

- T001 must run **first** to honor TEST_FIRST. The implementer pastes the failed output (or a one-line summary) into the WP activity log to prove the gate was observed.
- T002 and T003 are independent files and can be authored in parallel within the same session, but T004 depends on both (it copies `nginx.conf`).
- T005 is a re-run of the same script from T001 — only difference is that now it must pass.
- T006 is a paranoia step before review: `docker history communicaid:local` to scan layers, plus a manual `.dockerignore` audit.
- Coolify's Dockerfile build pack expects `Dockerfile` at the repository root. Do **not** put it in a subdirectory.

### Parallel Opportunities

- T002 and T003 can be written in either order or simultaneously (different files, no shared state).
- T004 must come after both T002 and T003.
- T005 and T006 can overlap (different concerns: behavior vs. security).

### Dependencies

- None. This is the only WP and starts from `deploy-and-export`.

### Risks & Mitigations

- **Risk**: Build fails due to TypeScript errors or lockfile drift inside the container.
  **Mitigation**: Run `npm ci && npm run build` locally first (outside Docker) to confirm the codebase builds clean before suspecting the Dockerfile.
- **Risk**: SPA fallback accidentally swallows real 404s for missing assets, hiding bugs.
  **Mitigation**: The `try_files` directive checks for the asset on disk first; only unmatched paths fall through to `index.html`. Acceptance step 8 verifies a real hashed asset is served directly with the correct cache header.
- **Risk**: `index.html` gets cached by intermediaries, leaving users on stale shells after redeploy.
  **Mitigation**: Explicit `add_header Cache-Control "no-cache"` on `index.html` in nginx.conf. Acceptance step 9 verifies it.
- **Risk**: Image bloat pushes past 100 MB.
  **Mitigation**: Multi-stage build discards the entire build stage filesystem; runtime is just `nginx:alpine` (~25 MB) plus `dist/`. Acceptance step 2 asserts the size limit.
- **Risk**: A local `.env` or other secret accidentally lands in the build context.
  **Mitigation**: `.dockerignore` excludes `.env*` and similar; T006 explicitly audits this.

---

## Dependency & Execution Summary

- **Sequence**: WP01 (no prior WPs).
- **Parallelization**: Within WP01, T002 and T003 can be authored in parallel; T005 and T006 can overlap.
- **MVP Scope**: WP01 **is** the entire feature. Shipping it satisfies all acceptance scenarios in spec.md.

---

## Subtask Index (Reference)

| Subtask ID | Summary | Work Package | Priority | Parallel? |
|------------|---------|--------------|----------|-----------|
| T001       | Run acceptance script (failure baseline, TEST_FIRST) | WP01 | P1 | No |
| T002       | Author `.dockerignore` | WP01 | P1 | Yes |
| T003       | Author `nginx.conf` | WP01 | P1 | Yes |
| T004       | Author multi-stage `Dockerfile` | WP01 | P1 | No (depends on T002, T003) |
| T005       | Run full acceptance script — all green | WP01 | P1 | Yes (with T006) |
| T006       | Security & secret audit, image-size assertion | WP01 | P1 | Yes (with T005) |
