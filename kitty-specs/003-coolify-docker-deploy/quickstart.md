# Quickstart & Acceptance Script: Coolify Docker Deploy

This document doubles as the **test-first acceptance gate** for the implementation work package. The commands below MUST be runnable on a clean checkout. The implementer is expected to:

1. Read this file first.
2. Run the script and watch it fail (the Dockerfile does not exist yet).
3. Implement `Dockerfile`, `nginx.conf`, `.dockerignore`.
4. Re-run the script. Every step must pass before the WP can transition to done.

All paths are relative to the repository root (`/Users/zohar/apps/communicAid/`).

## Prerequisites

- Docker (or a compatible runtime such as Colima/OrbStack) installed and running locally.
- Repository checked out and current branch is `deploy-and-export`.

## Acceptance steps

### 1. Build the image

```bash
docker build -t communicaid:local .
```

**Expected**: build completes with exit code `0`. The build stage runs `npm ci && npm run build` and produces `dist/`. The runtime stage copies that into `nginx:alpine`.

**Failure modes that must abort**: any TypeScript error, Vite build error, or missing file aborts with non-zero exit. (Validates FR-009.)

### 2. Assert image size

```bash
docker image inspect communicaid:local --format '{{.Size}}'
```

**Expected**: numeric value strictly less than `100000000` (100 MB). (Validates NFR-001 and SC-004.)

A convenience one-liner for humans: `docker images communicaid:local`.

### 3. Run the container

```bash
docker run --rm -d --name communicaid-test -p 8080:80 communicaid:local
```

**Expected**: container starts and remains running. `docker ps` shows it healthy. (Validates FR-004 and the cold-start side of NFR-002.)

### 4. Probe the SPA shell at root

```bash
curl -fsS http://localhost:8080/ | head -c 200
```

**Expected**: HTTP `200`, response body is HTML containing `<div id="root">` (or whatever Vite emits as the mount point). `curl -f` exits non-zero on any non-2xx. (Validates US1 and FR-005.)

### 5. Probe a deep client-side route (SPA fallback)

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' http://localhost:8080/category/feelings
```

**Expected**: `200`. The response body must be the SPA shell, not a 404 page. (Validates US2, FR-006, and the second negative test in `contracts/http-surface.md`.)

### 6. Probe a second nonsense route to be sure fallback isn't accidental

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' http://localhost:8080/this/does/not/exist/at/all
```

**Expected**: `200`.

### 7. Probe the healthcheck

```bash
curl -fsS http://localhost:8080/health
```

**Expected**: HTTP `200`, response body exactly `ok` (followed by a newline). (Validates US3, FR-007, SC-003.)

### 8. Probe a real hashed asset and verify cache headers

```bash
ASSET=$(curl -fsS http://localhost:8080/ | grep -oE '/assets/[^"]+\.(js|css)' | head -n1)
curl -fsSI "http://localhost:8080${ASSET}"
```

**Expected**: `200` with `Cache-Control: public, max-age=31536000, immutable`. (Validates R6 and the constitution's FCP target by ensuring caching is configured.)

### 9. Verify `index.html` is NOT cached

```bash
curl -fsSI http://localhost:8080/ | grep -i '^cache-control:'
```

**Expected**: contains `no-cache`. (Validates SC-005 — redeploys are picked up immediately.)

### 10. Tear down

```bash
docker stop communicaid-test
```

## Optional: deploy to a real Coolify instance

Once the local script is green, the manual integration test for SC-001 is:

1. Push the branch.
2. In Coolify, create a new Application → Source = this Git repo → Build Pack = **Dockerfile** → Branch = `deploy-and-export` → Port = `80`.
3. Click Deploy.
4. Verify the assigned URL serves the SPA, deep links work, and Coolify's healthcheck status is green within 5 seconds of container start.

If any step fails, return to the local script — it is the source of truth for "does this image actually work."
