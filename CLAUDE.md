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
| Persistence | Spring Data JPA, PostgreSQL 16 (Docker Compose) |
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
│       ├── entity/                   # JPA entities + enums
│       ├── repository/               # Spring Data JPA interfaces
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
Browser (SPA)               Spring Boot              PostgreSQL
React + TS + MUI  ←HTTPS→  REST API :8080  ←JDBC→   :5432
```

### Backend — Layered Structure

```
Controller → Service → Repository → Database
  (DTO)      (Entity)    (JPA)      (Postgres)
```

- **Controllers** — handle HTTP only; validate request DTOs; call services; return response DTOs. No business logic.
- **Services** — own all business rules: status transitions, role-based field restrictions, validation checks (crew weight, helicopter range, license dates), KML processing.
- **Repositories** — standard Spring Data JPA; custom JPQL only for complex filtered queries.

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

### Entity Relationships (12 Tables)

**Core (4):** `helicopters`, `crew_members`, `landing_sites`, `users`

**Business (2 + joins):**
- `flight_operations` + `flight_operation_activity_types`, `flight_operation_contacts`, `operation_comments`, `operation_change_history`
- `flight_orders` + `flight_order_crew_members`, `flight_order_operations` (the critical many-to-many)

```
Helicopters ──── Flight Orders ──── Crew Members
                      │
              Flight Operations
                      │
                  KML Points (JSON column)
```

**User ↔ CrewMember**: Separate entities. Users have login credentials and roles.
CrewMembers are flight personnel (weight, training dates, etc.). Linked via an explicit
nullable FK: `users.crew_member_id → crew_members.id`. Only populated for Pilot users.

### KML Processing Pipeline

```
Upload KML file
  → Save to disk ({upload-dir}/{UUID}_{filename}.kml)
  → Parse XML: extract <coordinates> from <Placemark> nodes
  → Validate: max 5000 points, within Poland bbox (lat 49.0–54.9, lng 14.1–24.2)
  → Calculate: Haversine formula on consecutive points → routeLengthKm
  → Persist: parsed points as JSON column (kml_points) on flight_operations
  → Return: { filePath, points[], routeLengthKm }
```

Coordinate storage as a JSON column avoids re-parsing KML on every page load.
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
| 1 | User ↔ CrewMember link | Explicit nullable FK: `users.crew_member_id → crew_members.id` |
| 2 | Database | Docker Compose with Postgres 16 |
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
| 0 | Scaffolding — monorepo, deps, Docker Postgres, proxy | Setup |
| 1 | Auth + App Shell — login, session, sidebar, role routing | Foundation |
| 2 | Admin CRUD — helicopters, crew, landing sites, users | Supporting data |
| 3 | Flight Operations — KML, status workflow, map, comments | **MVP milestone** |
| 4 | Flight Orders — validations, cascading statuses, full map | Full scope |
| 5 | Polish — error handling, loading states, edge cases | Quality |

**MVP = after Phase 3**: A working app where planners create operations with map
display, and supervisors can approve/reject them.

---

## Running the Project

```bash
# 1. Start database
docker compose up -d

# 2. Start backend (from repo root)
./gradlew :backend:bootRun

# 3. Start frontend (in a separate terminal)
cd frontend && npm run dev
```

- Backend: http://localhost:8080
- Frontend: http://localhost:5173 (proxies `/api/**` to backend)
- Database: localhost:5432 — db/user/password all: `aero`

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

Store parsed lat/lng points as a JSON column on flight_operations to
avoid re-parsing on every page load. Validate max 5000 points and
Poland bounding box at upload time.

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

### Do Not

- Do not use past tense — use `add` not `added`, `fix` not `fixed`
- Do not mix multiple concerns in one commit
- Do not commit directly to `main` — always use a feature branch and PR
- Do not leave a scope empty when a ticket exists
