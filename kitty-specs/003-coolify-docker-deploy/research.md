# Phase 0 Research: Coolify Docker Deploy

All decisions below are locked. There are no outstanding `[NEEDS CLARIFICATION]` items — every constraint was either fixed in `spec.md` Constraints or confirmed during the planning interview.

## R1. Build-stage base image

- **Decision**: `node:20-alpine`.
- **Rationale**: Node 20 is the current active LTS. Alpine variant keeps the build stage small and fast to pull. Vite 8 builds cleanly on Node 20.
- **Alternatives considered**:
  - `node:22-alpine` — newer LTS, but no benefit for this build and the 20.x line is the most broadly tested at the time of writing.
  - `node:20` (Debian-based) — larger pull, no functional advantage for a transient build stage.
  - `oven/bun` — would change the build toolchain; out of scope.

## R2. Runtime-stage base image

- **Decision**: `nginx:alpine`.
- **Rationale**: Smallest officially supported nginx image. Comfortably satisfies the <100 MB image-size NFR. Confirmed by the user during discovery (Q1 → option A).
- **Alternatives considered**:
  - `caddy:alpine` — simpler config syntax, but adds a non-standard dependency for a problem nginx already solves cleanly.
  - `node:alpine + serve` — bigger image and pulls in a Node runtime we don't need at serve time.
  - `nginxinc/nginx-unprivileged:alpine` — would let nginx run as non-root on a non-privileged port, but Coolify's Dockerfile pack expects port 80 by default; switching adds complexity for no security gain on a rootless container runtime. Revisit only if the host explicitly requires unprivileged binding.

## R3. Internal port

- **Decision**: Port `80` inside the container, declared via `EXPOSE 80`.
- **Rationale**: Coolify's Dockerfile build pack auto-routes to the exposed port and treats `80` as the default for HTTP services, so this requires zero Coolify-side configuration. The container runs in a sandboxed namespace, so binding port 80 does not require host root.
- **Alternatives considered**: `8080` — would require explicit Coolify config, contradicting the "zero configuration" success criterion.

## R4. SPA fallback strategy

- **Decision**: Single nginx `location /` block with `try_files $uri $uri/ /index.html;`.
- **Rationale**: The canonical, well-understood pattern for serving Vite/CRA-style SPAs. Lets nginx serve hashed asset files directly when they exist, and falls back to `index.html` for any unknown path so the client-side router can take over. Directly satisfies FR-005, FR-006, and US2 acceptance scenarios.
- **Alternatives considered**: `error_page 404 /index.html;` — works but masks real 404s and confuses observability. `try_files` is the standard for a reason.

## R5. `/health` endpoint shape

- **Decision**: A dedicated nginx `location = /health` block returning `200` with body `ok` and `Content-Type: text/plain`. No file on disk; the response is generated entirely by nginx using `return 200 "ok\n";`.
- **Rationale**: Dead simple. No extra process, no extra dependency, succeeds while nginx itself is up — which is exactly the signal Coolify needs ("the web server is alive"). Confirmed by the user during planning Q1.
- **Alternatives considered**:
  - `health.html` static file — works but adds a deploy artifact for no benefit.
  - Sidecar healthcheck script — overkill for a static SPA.

## R6. Cache headers

- **Decision**:
  - `index.html`: `Cache-Control: no-cache` (always revalidated).
  - Hashed assets under `/assets/` (Vite's default output dir): `Cache-Control: public, max-age=31536000, immutable`.
- **Rationale**: Vite emits content-hashed filenames for everything in `dist/assets/`, so they can be cached aggressively forever — the hash changes when the content changes. `index.html` is the only file whose URL is stable, so it must never be cached, otherwise users keep loading the old shell after a redeploy. Preserves the FCP < 2s mobile-3G target from the constitution and ensures SC-005 (redeploy serves new assets on next page load).
- **Alternatives considered**: Caching everything for 1 hour — simple but creates a window where users see a stale shell after deploy.

## R7. `.dockerignore` contents

- **Decision**: Exclude `node_modules`, `dist`, `.git`, `.github`, `.vscode`, `.idea`, `.env*`, `*.log`, `coverage`, `.DS_Store`, `kitty-specs`, `.kittify`, `.worktrees`, `communicAid-v2`, `communicAid.pen`.
- **Rationale**: Keeps the build context small and reproducible, and prevents accidentally shipping local `.env` files, editor metadata, or unrelated experimental directories present in the repo (`communicAid-v2`, `communicAid.pen`). Directly satisfies FR-008 and NFR-004.
- **Alternatives considered**: A minimal `.dockerignore` (just `node_modules` + `.git`) — leaks too much into the build context.

## R8. Build failure propagation

- **Decision**: The build stage runs `npm ci && npm run build`. Any non-zero exit code aborts the Docker build, so Coolify reports a failed deployment instead of producing a stale image. No `|| true`, no swallowed errors.
- **Rationale**: Direct satisfaction of FR-009 and the "build step fails" edge case.

## R9. How TEST_FIRST applies to a deploy-only feature

- **Decision**: Treat `quickstart.md` as the test-first acceptance gate. The implementer writes the verification script (build + boot + `curl /` + `curl /deep/route` + `curl /health` + `du -sh image`) **before** authoring the Dockerfile and nginx config. The script must initially fail (the artifacts don't exist yet), then pass once the implementation is correct. The WP cannot move to "done" until every check in the script is green on a clean checkout.
- **Rationale**: The constitution's `TEST_FIRST` directive exists to force "define expected behavior before writing the thing." For application code, that's a Vitest spec. For a deploy artifact, the equivalent is an executable acceptance script targeting observable container behavior. Shoehorning unit tests onto a Dockerfile would add no value; a real verification script does.
- **Alternatives considered**:
  - Skipping TEST_FIRST entirely — violates the directive.
  - Writing a Vitest test for the Dockerfile — meaningless; nothing to import or call.
