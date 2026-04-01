# AERO — Claude Agent Entry File

This file is the primary context source for AI agents working on this repository.
Read this before making any code changes or planning any tasks.

---

## Project Overview

**AERO** is a web application for managing helicopter flight operations — from planning
aerial inspections of power lines to creating and approving flight orders.

**Four user roles** collaborate through status-driven workflows:

| Role | Polish name | Capabilities |
|------|-------------|--------------|
| Admin | Administrator systemu | Manages helicopters, crew, landing sites, users |
| Planner | Osoba planująca | Creates and monitors flight operations |
| Supervisor | Osoba nadzorująca | Approves/rejects operations and orders |
| Pilot | Pilot | Creates flight orders, reports completion |

The system is **self-contained** — no external APIs, message queues, or third-party
integrations. A single Spring Boot backend serves a React SPA.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, MUI (Material UI), react-router-dom v6 |
| HTTP client | Axios |
| Map | react-leaflet + Leaflet (OpenStreetMap tiles) |
| Backend | Java 21, Spring Boot 3.x |
| Persistence | Spring Data MongoDB, MongoDB 7 |
| Testing DB | Testcontainers (MongoDBContainer) — no Docker Compose |
| Auth | Session-based (JSESSIONID cookie), Spring Security |
| Build | Gradle (Kotlin DSL), backend only; frontend runs via npm |

---

## Repository Layout (Monorepo)

```
aero-wir-gpt/
├── backend/                          # Spring Boot (Java 21)
│   ├── build.gradle.kts
│   └── src/main/java/pl/pse/aero/
│       ├── AeroApplication.java
│       ├── config/                   # SecurityConfig, CORS, DataInitializer
│       ├── controller/               # Thin REST controllers
│       ├── dto/                      # Request/Response objects
│       ├── domain/                   # MongoDB documents (@Document) + enums
│       ├── repository/               # Spring Data MongoDB interfaces
│       └── service/                  # Business logic, state machines, KML parsing
├── frontend/                         # Vite + React 18 + TypeScript
│   ├── package.json
│   └── src/
│       ├── api/                      # Axios instance + typed API functions
│       ├── components/               # DataTable, MapView, StatusBadge, Layout
│       ├── contexts/                 # AuthContext
│       ├── pages/                    # One folder per entity (list + form pages)
│       ├── types/                    # TypeScript interfaces mirroring DTOs
│       └── App.tsx                   # Router + sidebar + protected routes
├── sc-docs/                          # Architecture, PRD, plan, tasks
│   ├── architecture.md
│   ├── description.md                # Full PRD (Polish)
│   ├── implementation-plan.md
│   ├── questions.md                  # Resolved architecture decisions
│   └── tasks/                       # Per-ticket task files (SC-AERO-*)
├── build.gradle.kts                  # Root Gradle (allprojects config)
├── settings.gradle.kts
└── CLAUDE.md                         # ← you are here
```

> **Key decision**: Frontend is NOT managed by Gradle. It runs independently via
> `npm run dev` with a Vite proxy: `/api/**` → `http://localhost:8080`. This keeps
> the build pipeline simple.

---

## Architecture

### System Topology

```
Browser (SPA)               Spring Boot              MongoDB
React + TS + MUI  ←HTTPS→  REST API :8080  ←driver→  :27017
```

### Backend — Layered Structure

```
Controller → Service → Repository → Database
  (DTO)      (Document)  (MongoDB)    (MongoDB)
```

- **Controllers** — handle HTTP only; validate request DTOs; call services; return response DTOs. No business logic.
- **Services** — own all business rules: status transitions, role-based field restrictions, validation checks (crew weight, helicopter range, license dates), KML processing.
- **Repositories** — Spring Data MongoDB interfaces; derived query methods for filtered queries.

### Authentication & Authorization

- Session-based via Spring Security (`JSESSIONID` cookie).
- `POST /api/auth/login` — authenticates, creates session, returns `{id, email, firstName, lastName, role}`.
- `GET /api/auth/me` — returns current user or 401.
- Role enforcement at two levels:
  1. **URL-level**: `SecurityConfig` restricts endpoints by role.
  2. **Field-level**: Services enforce which fields each role can edit per status.
- `DataInitializer` seeds 4 default users on first boot:
  - `admin@aero.pl` / `admin` — ADMIN
  - `planista@aero.pl` / `planista` — PLANNER
  - `nadzor@aero.pl` / `nadzor` — SUPERVISOR
  - `pilot@aero.pl` / `pilot` — PILOT

### Document Relationships (6 Document Types)

**Core (4):** `user`, `helicopter`, `crew_member`, `landing_site`

**Business (2 with embedded/referenced data):**
- `flight_operation` — embedded: `activityTypes`, `contacts`, `comments` (append-only), `changeHistory` (audit trail)
- `flight_order` — references: `crewMemberIds` (list), `operationIds` (list — the critical many-to-many)

```
Helicopters ──── Flight Orders ──── Crew Members
                      │
              Flight Operations
                      │
                  KML Points (embedded field)
```

All documents stored in the `aero` MongoDB database. Relationships use ID references
(not foreign keys). Embedded sub-documents (comments, history) are used where data is
always accessed together with the parent. Unique indexes enforce constraints on
`User.email`, `Helicopter.registrationNumber`, and `CrewMember.email`.

**User ↔ CrewMember**: Separate documents. Users have login credentials and roles.
CrewMembers are flight personnel (weight, training dates, etc.). Linked via an explicit
nullable reference: `user.crewMemberId → crew_member.id`. Only populated for Pilot users.

### KML Processing Pipeline

```
Upload KML file
  → Save to disk ({upload-dir}/{UUID}_{filename}.kml)
  → Parse XML: extract <coordinates> from <Placemark> nodes
  → Validate: max 5000 points, within Poland bbox (lat 49.0–54.9, lng 14.1–24.2)
  → Calculate: Haversine formula on consecutive points → routeLengthKm
  → Persist: parsed points as embedded field (kmlPoints) on flight_operations document
  → Return: { filePath, points[], routeLengthKm }
```

Coordinate storage as an embedded field avoids re-parsing KML on every page load.
The `GET /api/operations/{id}` response includes the points array for the frontend MapView.

### Frontend — Page Structure

Every entity follows the pattern:
1. **ListPage** — MUI DataGrid with sorting, filtering, default sort/filter per entity.
2. **FormPage** — Create/edit form with role-based field visibility/editability. Reused for both new (no `:id`) and edit (with `:id`).

```
/login              → LoginPage
/helicopters        → HelicopterListPage    /helicopters/new | /:id
/crew               → CrewListPage          /crew/new | /:id
/landing-sites      → LandingSiteListPage   /landing-sites/new | /:id
/users              → UserListPage          /users/new | /:id
/operations         → OperationListPage     /operations/new | /:id
/orders             → OrderListPage         /orders/new | /:id
```

**Shared components:**

| Component | Purpose |
|-----------|---------|
| `DataTable` | Wraps MUI DataGrid — consistent sorting, filtering, column defs |
| `MapView` | Wraps react-leaflet — renders polylines (routes) and markers (landing sites) |
| `StatusBadge` | Colored MUI Chip per status code |
| `Layout` | Role-aware sidebar + top bar + content area |
| `ProtectedRoute` | Redirects to /login if not authenticated; optionally checks role |

---

## Status Workflows

### Flight Operation Statuses

| Code | Status (EN) | Status (PL) |
|------|-------------|-------------|
| 1 | SUBMITTED | Wprowadzone |
| 2 | REJECTED | Odrzucone |
| 3 | CONFIRMED | Potwierdzone do planu |
| 4 | SCHEDULED | Zaplanowane do zlecenia |
| 5 | PARTIALLY_COMPLETED | Częściowo zrealizowane |
| 6 | COMPLETED | Zrealizowane |
| 7 | CANCELLED | Rezygnacja |

```
[SUBMITTED] → [CONFIRMED] → [SCHEDULED] → [COMPLETED]
           ↘ [REJECTED]              ↘ [PARTIALLY_COMPLETED]
  Any of 1,3,4 → [CANCELLED]        ↘ back to [CONFIRMED] (order not done)
```

### Flight Order Statuses

| Code | Status (EN) | Status (PL) |
|------|-------------|-------------|
| 1 | SUBMITTED | Wprowadzone |
| 2 | SENT_FOR_APPROVAL | Przekazane do akceptacji |
| 3 | REJECTED | Odrzucone |
| 4 | APPROVED | Zaakceptowane |
| 5 | PARTIALLY_COMPLETED | Zrealizowane w części |
| 6 | COMPLETED | Zrealizowane w całości |
| 7 | NOT_COMPLETED | Nie zrealizowane |

**Status cascading** — when a pilot marks an order final, all linked operations cascade:
- Order COMPLETED → all operations → COMPLETED
- Order PARTIALLY_COMPLETED → all operations → PARTIALLY_COMPLETED
- Order NOT_COMPLETED → all operations → back to CONFIRMED

### Flight Order — 5 Blocking Validation Rules

| # | Rule |
|---|------|
| 1 | `helicopter.inspectionExpiryDate >= plannedDeparture.date` |
| 2 | `pilot.licenseExpiryDate >= plannedDeparture.date` |
| 3 | All crew members (including pilot): `trainingExpiryDate >= plannedDeparture.date` |
| 4 | `SUM(crew weights) <= helicopter.maxCrewWeightKg` |
| 5 | `estimatedRouteLengthKm <= helicopter.rangeKm` |

---

## Resolved Architecture Decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | User ↔ CrewMember link | Explicit nullable reference: `user.crewMemberId → crew_member.id` |
| 2 | Database | MongoDB 7 (Docker container; Testcontainers for integration testing) |
| 3 | UI language | Polish UI, English codebase (enums, variables, API fields) |
| 4 | Java version | Java 21 |
| 5 | Crew roles | Fixed enum: `PILOT`, `OBSERVER` |
| 6 | Activity types | Fixed enum in code |
| 7 | KML test data | Synthetic KML files with Polish coordinates |
| 8 | Route length (orders) | Auto-calculated: sum of `routeLengthKm` from selected operations |
| 9 | Deployment | Local only |
| 10 | Project structure | Monorepo: `backend/` + `frontend/` |

---

## Implementation Phases

| Phase | Focus | MVP? |
|-------|-------|------|
| 0 | Scaffolding — monorepo, deps, MongoDB, proxy | Setup |
| 1 | Auth + App Shell — login, session, sidebar, role routing | Foundation |
| 2 | Admin CRUD — helicopters, crew, landing sites, users | Supporting data |
| 3 | Flight Operations — KML, status workflow, map, comments | **MVP milestone** |
| 4 | Flight Orders — validations, cascading statuses, full map | Full scope |
| 5 | Polish — error handling, loading states, edge cases | Quality |

**MVP = after Phase 3**: A working app where planners create operations with map
display, and supervisors can approve/reject them.

---

## Running the Project

**Prerequisites**: MongoDB 7+ running locally on port 27017 (database: `aero`).

```bash
# 0. Start MongoDB (one-time setup)
bash backend/setup-mongodb.sh

# 1. Start backend (from repo root)
./gradlew :backend:bootRun

# 2. Start frontend (in a separate terminal)
cd frontend && npm run dev
```

- Backend: http://localhost:8080
- Frontend: http://localhost:5173 (proxies `/api/**` to backend)
- MongoDB: localhost:27017, database: `aero`

**Testing**: Integration tests use Testcontainers — a `MongoDBContainer` is
started automatically, no manual database setup needed.

```bash
./gradlew :backend:test
```

---

## Postman Collection

The file `backend/src/test/resources/AERO-API.postman_collection.json` contains an
importable Postman collection covering all REST endpoints. **Every time a controller
method is added, removed, or its contract changes (path, method, request/response
body), update this collection to stay in sync.**

---

## Branch & Commit Naming

This project follows **Conventional Commits** and uses the SC-AERO ticket number
as the scope.

### Branch Naming

```
<type>/<ticket-id>-<short-description>
```

**Examples:**
```
feat/3-SC-AERO-flight-operations-kml
fix/27-SC-AERO-crew-weight-validation
chore/1-SC-AERO-monorepo-restructure
refactor/15-SC-AERO-operation-service-cleanup
docs/4-SC-AERO-api-readme
```

**Types:**
| Type | When to use |
|------|-------------|
| `feat` | New feature or user-visible functionality |
| `fix` | Bug fix |
| `chore` | Tooling, build, deps, config, CI — no production code change |
| `refactor` | Code restructuring without behaviour change |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `style` | Formatting, whitespace — no logic change |
| `perf` | Performance improvement |

### Commit Message Format

```
<type>(<scope>): <short summary in imperative mood>

[optional body]

[optional footer: Refs #<ticket-id>]
```

**Rules:**
- `type` — lowercase, from the table above
- `scope` — ticket ID, e.g. `3-SC-AERO` or a module name e.g. `kml`, `auth`
- Summary — imperative mood, max 72 chars, no trailing period
- Body — wrap at 72 chars; explain *why*, not *what*
- Reference ticket in footer when closing: `Refs #27` or `Closes #27`

**Examples:**
```
feat(3-SC-AERO): add KML upload and coordinate persistence

Store parsed lat/lng points as an embedded field on flight_operations
document to avoid re-parsing KML on every page load. Validate max 5000
points and Poland bounding box at upload time.

Refs #3
```

```
fix(27-SC-AERO): correct crew weight sum to include pilot

The pilot crew member was excluded from the weight check, allowing
overweight orders to pass validation.

Closes #27
```

```
chore(deps): upgrade Spring Boot to 3.4.1
```

```
refactor(auth): extract session creation into AuthService
```

---

## Task Lifecycle

Tasks live in `sc-docs/tasks/backend/` and `sc-docs/tasks/frontend/`. When a task is
**fully implemented** (code written, compiles, tests pass), move its `.md` file to the
`finished/` subfolder (create it if it doesn't exist):

```
sc-docs/tasks/backend/15-SC-AERO.md  →  sc-docs/tasks/backend/finished/15-SC-AERO.md
```

**Do not** leave completed task files in the active task directory.

---

## API Documentation (OpenAPI / Swagger)

Every REST controller endpoint **must** have OpenAPI annotations:

- **`@Tag`** on the controller class — with `name` and `description`
- **`@Operation`** on every endpoint method — with `summary` (required) and `description` (when non-obvious)
- **`@ApiResponse`** on POST/PUT endpoints — document `201`, `400`, `401` as applicable

Swagger UI is available at `http://localhost:8080/swagger-ui.html` when the backend is running.

**Do not** create or modify a controller endpoint without adding these annotations.

---

---

## Integration Policy

All layers of the application must stay in sync. When making changes:

1. **E2E tests must match the current API and UI** — if a controller endpoint
   changes (path, request/response body, roles), update the corresponding E2E
   test. If a UI component changes (field names, placeholders, selectors), update
   the UI tests. Do not leave tests referencing mock data that no longer exists.

2. **Frontend must use the real API** — pages must fetch data from the backend,
   not hardcoded mock arrays. If mock data is temporarily needed, comment it out
   with `// TODO: UI CHANGES <date>` so it is clear and removable.

3. **Postman collection must match the current API** — every time a controller
   method is added, removed, or its contract changes, update
   `backend/src/test/resources/AERO-API.postman_collection.json`.

4. **UI elements must respect backend role permissions** — if the backend returns
   403 for a given role on an endpoint, the corresponding UI button/action must
   be hidden or disabled for that role.

---

## E2E Testing Policy

E2E tests live in `e2e/` and use Playwright. They cover UI flows and API integration.

**When to write E2E tests:**

- When adding a **backend controller method** that is consumed by an existing frontend view — add an API-level E2E test covering the new endpoint (CRUD, validation, role access).
- When adding a **frontend view/page** that calls existing controller endpoints — add a UI E2E test covering the page load, key interactions, and data display.
- When adding **end-to-end features** (new controller + new UI) — add both API and UI E2E tests.
- When modifying **status workflows** or **role-based access** — update or add E2E tests for the affected transitions and role checks.

**Running tests:**

```bash
cd e2e && npm test          # all tests
cd e2e && npm run test:ui   # Playwright UI mode
```

**Test conventions:**

- Test files: `e2e/tests/<entity>.spec.ts`
- Use helpers from `e2e/helpers/` (auth, API, constants)
- API tests use `ApiHelper` class for authenticated requests
- UI tests use `loginViaUI()` for browser-based authentication
- Performance tests measure page load and API response times
- UI tests must use selectors that match the actual rendered DOM (not stale mock data)

---

### Do Not

- Do not use past tense — use `add` not `added`, `fix` not `fixed`
- Do not mix multiple concerns in one commit
- Do not commit directly to `main` — always use a feature branch and PR
- Do not leave a scope empty when a ticket exists
- Do not add a backend controller method to an existing frontend view (or vice versa) without adding E2E tests
