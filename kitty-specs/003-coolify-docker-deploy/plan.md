# Implementation Plan: Coolify Docker Deploy

**Branch**: `deploy-and-export` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `kitty-specs/003-coolify-docker-deploy/spec.md`

## Summary

Add three deploy artifacts at the repository root — `Dockerfile`, `nginx.conf`, and `.dockerignore` — so the communicAid SPA can be deployed to Coolify with zero configuration. The image is a multi-stage build: a `node:20-alpine` stage runs `npm ci && npm run build` to produce `dist/`, then a `nginx:alpine` runtime stage serves the static output on port 80, with SPA fallback (`try_files $uri /index.html`), a `/health` endpoint returning `200 ok`, gzip on, and cache headers tuned to Vite's hashed-asset output. No application source code, build scripts, or project dependencies change.

## Technical Context

**Language/Version**: Dockerfile (BuildKit-compatible). Build stage: Node 20 LTS Alpine. Runtime stage: Nginx stable Alpine.
**Primary Dependencies**: Public images `node:20-alpine` and `nginx:alpine`. No new npm packages. Existing `npm run build` (Vite 8) is invoked unchanged.
**Storage**: N/A — static assets only, no persistence layer touched.
**Testing**: No application code under test. Test-first applies as a runnable container verification checklist (build → boot → curl probes → image-size assertion), captured in `quickstart.md` and required to pass before the WP can transition to done. See Constitution Check below for the explicit TEST_FIRST mapping.
**Target Platform**: Linux x86_64 container running on a Coolify host. SPA served to modern tablet browsers.
**Project Type**: Single project (deployment artifacts added at repo root).
**Performance Goals**: Cold container start to first successful `/health` < 5s. Runtime image < 100 MB. Preserves the constitution's FCP < 2s on mobile 3G target — gzip on, long cache for hashed assets, no-cache for `index.html`.
**Constraints**: Zero env vars at build or runtime. No source code changes outside repo-root deploy files. No CI/CD changes. No Netlify config. Coolify Dockerfile build pack only.
**Scale/Scope**: Single container, single feature, three new files at repo root plus planning/test artifacts under `kitty-specs/003-coolify-docker-deploy/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see end of this section.*

| Constitution Item | Status | How this feature complies |
|---|---|---|
| **TEST_FIRST directive** | Pass (with mapping) | This feature ships no application code, so unit/integration tests in Vitest don't apply. Test-first is mapped to a **container acceptance script** documented in `quickstart.md`: explicit `docker build`, container boot, and `curl` probes for `/`, a deep route, and `/health`, plus an image-size assertion. The acceptance script is written **before** the Dockerfile/nginx.conf inside the implementation WP and must fail first, then pass. This satisfies the spirit of TEST_FIRST for an artifact whose behavior is observable only against a built/running container. |
| **Vitest / Playwright coverage 80%+** | Pass (N/A) | No application code added — coverage denominator unchanged. |
| **ESLint clean / TypeScript strict** | Pass (N/A) | No `.ts`/`.tsx` files added or modified. |
| **Lighthouse a11y ≥ 90** | Pass | UI is unchanged. The deploy must not regress accessibility, which is verified by the existing app — not by this feature. |
| **FCP < 2s on mobile 3G** | Pass | nginx config enables gzip and sets long `Cache-Control` for hashed assets; `index.html` is served with `no-cache` so deploys are picked up immediately without breaking caching of fingerprinted bundles. |
| **No service-role keys in frontend** | Pass | Zero env vars in build or runtime; nothing is baked in. |
| **No analytics / third-party tracking** | Pass | None added. |
| **Branch strategy: at least one reviewer approves** | Pass | This feature merges through the same review flow; not bypassed. |
| **Deployable to Netlify and/or Coolify** | Pass | This feature is exactly that — Coolify deploy enablement. Netlify path is unaffected (Vite `dist/` still works). |

**Result**: All gates pass. No complexity-tracking entries needed.

**Post-design re-check** (after Phase 1): Still passing. No design decisions in Phase 1 introduce dependencies, env vars, or surface area that would change any of the above.

## Project Structure

### Documentation (this feature)

```
kitty-specs/003-coolify-docker-deploy/
├── spec.md              # Feature specification (already written)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A note — no entities)
├── quickstart.md        # Phase 1 output (container verification script)
├── contracts/
│   └── http-surface.md  # Phase 1 output (HTTP surface contract)
├── checklists/
│   └── requirements.md  # Spec quality checklist (already passed)
└── tasks/               # Created later by /spec-kitty.tasks
```

### Source Code (repository root)

```
/                                 # Files added by this feature
├── Dockerfile                    # NEW — multi-stage build
├── nginx.conf                    # NEW — SPA fallback + /health + caching
├── .dockerignore                 # NEW — excludes node_modules, dist, .git, etc.
│
├── src/                          # UNCHANGED
├── supabase/                     # UNCHANGED
├── package.json                  # UNCHANGED
├── vite.config.ts                # UNCHANGED
└── ... (everything else unchanged)
```

**Structure Decision**: Single project, three new files at repo root. No subdirectories created for deploy artifacts — Coolify's Dockerfile build pack expects `Dockerfile` at the repository root by default, and keeping `nginx.conf` and `.dockerignore` alongside it makes the entire deploy setup trivially discoverable.

## Complexity Tracking

*Not applicable — Constitution Check passed cleanly with no violations.*

## Parallel Work Analysis

Single-developer feature, no parallelism. The three files are tightly coupled (the Dockerfile copies `nginx.conf`, the `.dockerignore` defines the build context for both stages) and should be authored together in a single work package.

## Phase 0: Research

See [research.md](./research.md). All decisions are locked from spec Constraints + the planning interview. Research consolidates the rationale for: base image choices, port selection, `/health` shape, cache header strategy, and how TEST_FIRST is satisfied by a container acceptance script.

## Phase 1: Design Artifacts

- **HTTP surface contract**: [contracts/http-surface.md](./contracts/http-surface.md) — defines the small set of routes the runtime must answer (`/`, hashed assets, deep links, `/health`).
- **Data model**: [data-model.md](./data-model.md) — N/A stub explaining why no entities exist.
- **Quickstart / acceptance script**: [quickstart.md](./quickstart.md) — the runnable verification checklist that doubles as the test-first acceptance gate.

**Agent context update**: This project's CLAUDE.md already documents the Coolify deployment intent. No additions needed beyond noting (in implementation) that the repo now ships a Dockerfile.

## Next Step

Run `/spec-kitty.tasks` to break this plan into work packages.

---

**Branch contract (final restatement before tasks):**
- Current branch: `deploy-and-export`
- Planning/base branch: `deploy-and-export`
- Final merge target: `deploy-and-export`
- `branch_matches_target`: **true**
