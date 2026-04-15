# Feature Specification: Coolify Docker Deploy

**Feature Branch**: `003-coolify-docker-deploy`
**Created**: 2026-04-15
**Status**: Draft
**Input**: User description: "Add the required files for an easy deploy to Coolify using a docker"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One-click Coolify deployment of the SPA (Priority: P1)

The project maintainer connects the communicAid Git repository to a Coolify instance, selects the Dockerfile build pack, and deploys. Coolify builds the image, starts the container, and the live site serves the static SPA — including deep links — without any additional configuration, environment variables, or post-deploy steps.

**Why this priority**: This is the entire purpose of the feature. Without it, there is no deployable artifact. Everything else (healthchecks, caching, etc.) is a refinement on top of this baseline.

**Independent Test**: Point a fresh Coolify project at the repository, choose Dockerfile build, and deploy. The deployment must succeed end-to-end and the home page must load on the assigned URL.

**Acceptance Scenarios**:

1. **Given** a fresh Coolify project pointed at this repo, **When** the maintainer triggers a deploy, **Then** the build completes successfully and a running container serves the SPA on the configured port.
2. **Given** a successful deployment, **When** a visitor opens the root URL in a browser, **Then** the communicAid home screen renders within standard expectations for a static SPA.
3. **Given** a successful deployment, **When** the maintainer pushes a new commit and redeploys, **Then** the new build replaces the running container and serves the updated assets.

---

### User Story 2 - Deep links and client-side routes work after refresh (Priority: P1)

A patient or caregiver navigates to a non-root URL inside the SPA (either by clicking a link, refreshing the page on a sub-route, or sharing a bookmarked URL). The server must return the SPA shell so the client-side router can take over, instead of returning a 404.

**Why this priority**: SPAs that 404 on refresh are effectively broken in production. This is non-negotiable for any real-world SPA deployment and must ship together with US1.

**Independent Test**: After deployment, navigate to any client-side route, hard-refresh the browser, and confirm the page loads correctly instead of showing a 404.

**Acceptance Scenarios**:

1. **Given** the app is deployed, **When** a visitor refreshes the browser on any client-side route, **Then** the server returns the SPA shell and the route renders correctly.
2. **Given** the app is deployed, **When** a visitor requests a path that does not match any built asset, **Then** the server returns the SPA shell rather than a 404 response.
3. **Given** the app is deployed, **When** a visitor requests an existing static asset (e.g. a JS or CSS file), **Then** the server returns that asset directly with the correct content type.

---

### User Story 3 - Coolify healthcheck reports the container as healthy (Priority: P2)

Coolify periodically probes a known endpoint to determine whether the container is healthy. The deployment must expose a lightweight endpoint that responds successfully so Coolify can mark the service as up, restart it if it fails, and surface accurate status in the dashboard.

**Why this priority**: Healthchecks are not strictly required for the site to load, but without them Coolify cannot reliably detect a broken container or perform safe rolling restarts. P2 because US1 and US2 deliver value on their own.

**Independent Test**: Issue a request to the healthcheck path against a running container and confirm a successful response.

**Acceptance Scenarios**:

1. **Given** a running container, **When** Coolify (or any client) requests the healthcheck path, **Then** the server responds with a successful status indicating the container is healthy.
2. **Given** the web server inside the container has stopped, **When** Coolify probes the healthcheck path, **Then** the probe fails so Coolify can mark the container as unhealthy.

---

### Edge Cases

- What happens when the build step fails (e.g. type errors, lint errors, missing dependency)? The image build must fail loudly so Coolify reports a failed deployment instead of shipping a broken or stale image.
- What happens when a visitor requests a path containing characters that look like directory traversal (e.g. `../`)? The server must not serve files outside the built assets directory.
- What happens when a visitor requests a static asset that no longer exists in the new build? The server should fall back to the SPA shell so the client router can handle the missing route gracefully.
- What happens when the container is rebuilt with a new commit? The previous container is replaced and visitors receive the new assets on their next page load; in-flight users continue on the old assets until they refresh.
- What happens if Coolify assigns a different external port or hostname? The container must not assume a specific external URL — it only needs to listen on its declared internal port.

## Requirements *(mandatory)*

### Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-001 | The repository MUST contain a Dockerfile that Coolify can build without additional configuration. | Draft |
| FR-002 | The Dockerfile MUST use a multi-stage build: a build stage that compiles the SPA from source, and a runtime stage that serves the compiled static assets via Nginx. | Draft |
| FR-003 | The runtime image MUST contain only the compiled static assets and the web server — no source code, no build toolchain, no development dependencies. | Draft |
| FR-004 | The runtime container MUST listen on a single, well-known HTTP port that Coolify can route to. | Draft |
| FR-005 | The web server configuration MUST serve static assets directly when they exist in the built output. | Draft |
| FR-006 | The web server configuration MUST fall back to the SPA shell (`index.html`) for any request path that does not match a built static asset, so client-side routes work on refresh and deep links. | Draft |
| FR-007 | The runtime image MUST expose a lightweight healthcheck endpoint that returns a successful response while the web server is running. | Draft |
| FR-008 | The repository MUST contain a `.dockerignore` that excludes development-only files (e.g. `node_modules`, local build output, editor files, git metadata) so builds are reproducible and image context stays small. | Draft |
| FR-009 | The build MUST fail with a non-zero exit code if the SPA build step fails, so Coolify reports a failed deployment rather than shipping a stale or broken image. | Draft |
| FR-010 | The deployment MUST require zero environment variables and zero post-deploy configuration steps. | Draft |
| FR-011 | The web server MUST return correct content types for the static assets it serves (HTML, JS, CSS, images, fonts). | Draft |

### Non-Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-001 | The runtime image size MUST be under 100 MB to keep Coolify pulls and restarts fast. | Draft |
| NFR-002 | A cold container start (from "image present" to "first successful healthcheck") MUST complete in under 5 seconds on a small Coolify VM. | Draft |
| NFR-003 | The SPA's first contentful paint over the deployed container on a typical broadband connection MUST stay within the project's existing performance target (FCP under 2s on mobile 3G as defined in CLAUDE.md). | Draft |
| NFR-004 | The runtime image MUST NOT contain any secrets, credentials, or developer-machine paths baked into layers. | Draft |
| NFR-005 | The Dockerfile and Nginx config MUST be readable and minimal — a maintainer should be able to understand the entire deploy setup in under 5 minutes. | Draft |

### Constraints

| ID | Constraint | Status |
|----|-----------|--------|
| C-001 | The deployment target is Coolify using its Dockerfile build pack. No Nixpacks, no Docker Compose, no Kubernetes manifests. | Confirmed |
| C-002 | The runtime web server MUST be Nginx (Alpine variant), per the user's selection during discovery. | Confirmed |
| C-003 | No environment variables are required at build time or runtime — the SPA has no Supabase wiring or other external configuration in this scope. | Confirmed |
| C-004 | This feature MUST NOT modify application source code in `src/`, the existing build scripts in `package.json`, or unrelated project configuration. It only adds deployment artifacts. | Confirmed |
| C-005 | This feature MUST NOT introduce CI/CD pipelines, GitHub Actions, or Netlify configuration — Coolify is the sole deployment target in scope. | Confirmed |

### Key Entities

Not applicable — this feature adds infrastructure files only, with no persisted data or domain entities.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A maintainer can take a fresh Coolify instance, point it at this repository, select Dockerfile build, and reach a working public URL in under 10 minutes with no manual configuration beyond the Coolify wizard.
- **SC-002**: 100% of client-side routes load correctly on browser refresh after deployment (no 404s on deep links).
- **SC-003**: Coolify reports the container as healthy within 5 seconds of startup and continues to report healthy as long as the web server is running.
- **SC-004**: The runtime image is under 100 MB.
- **SC-005**: A redeploy after a code change replaces the running container and serves the new assets on the next page load with zero manual intervention.
- **SC-006**: No secrets, credentials, or environment variables are required for a successful deploy.

## Assumptions

- Coolify is configured to use the repository's Dockerfile build pack (not Nixpacks).
- The host running Coolify can pull from a public Alpine-based Node image and a public Nginx Alpine image.
- The communicAid SPA's existing `npm run build` produces a self-contained `dist/` directory suitable for static serving (this is the current Vite behavior).
- Coolify will assign and route the external port/hostname; the container only needs to listen on a fixed internal port.
- The maintainer is comfortable with build-time-only configuration; if Supabase or other env-driven config is added later, that will be handled in a separate feature.
