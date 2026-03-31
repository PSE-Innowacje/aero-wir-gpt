# AERO — High-Level Architecture Overview

## 1. System Context

AERO is a web application for managing helicopter flight operations — from planning aerial inspections of power lines to creating and approving flight orders. Four user roles (Admin, Planner, Supervisor, Pilot) collaborate through status-driven workflows.

```
                    +------------------+
                    |   Browser (SPA)  |
                    |  React + TS + MUI|
                    +--------+---------+
                             |
                        HTTPS / JSON
                             |
                    +--------+---------+
                    |   Spring Boot    |
                    |  REST API (8080) |
                    +--------+---------+
                             |
                    +--------+---------+
                    |   PostgreSQL     |
                    |   (5432)         |
                    +------------------+
```

There are no external integrations, message queues, or third-party APIs. The system is self-contained: a single backend serves the SPA and manages all data.

---

## 2. Monorepo Layout

```
auro/
├── backend/                    # Spring Boot (Java 21)
│   ├── build.gradle.kts        # Spring Boot + JPA + Security + Postgres
│   └── src/main/java/com/nullterrier/aero/
│       ├── AeroApplication.java
│       ├── config/             # Security, Web, CORS, DataInitializer
│       ├── controller/         # REST controllers (thin — delegate to services)
│       ├── dto/                # Request/Response objects with validation
│       ├── entity/             # JPA entities (DB model)
│       ├── repository/         # Spring Data JPA interfaces
│       └── service/            # Business logic, status machines, KML parsing
├── frontend/                   # Vite + React 18 + TypeScript
│   ├── package.json
│   └── src/
│       ├── api/                # Axios instance + typed API functions
│       ├── components/         # Shared: DataTable, MapView, StatusBadge, Layout
│       ├── contexts/           # AuthContext (login state + role)
│       ├── pages/              # One folder per entity (list + form pages)
│       ├── types/              # TypeScript interfaces mirroring DTOs
│       └── App.tsx             # Router + sidebar + protected routes
├── docs/                       # PRD, plan, tasks
├── sc-docs/                    # This architecture documentation
├── build.gradle.kts            # Root Gradle (includes backend only)
└── settings.gradle.kts
```

**Key decision**: Frontend is NOT managed by Gradle. It runs independently via `npm run dev` with a proxy to the backend (`/api/** -> localhost:8080`). This keeps the build pipeline simple and avoids Gradle-Node plugin complexity.

---

## 3. Backend Architecture

### 3.1 Layered Structure

```
Controller  →  Service  →  Repository  →  Database
   (DTO)       (Entity)    (JPA)         (Postgres)
```

- **Controllers** handle HTTP, validate request DTOs, call services, return response DTOs. No business logic here.
- **Services** own business rules: status transitions, role-based field restrictions, validation checks (crew weight, helicopter range, license dates), KML processing.
- **Repositories** are standard Spring Data JPA interfaces — no custom SQL unless needed for complex queries (e.g., filtered operation lists).

### 3.2 Authentication & Authorization

- **Session-based auth** via Spring Security (JSESSIONID cookie).
- `POST /api/auth/login` authenticates and creates session — returns user info + role as JSON (no redirects).
- `GET /api/auth/me` returns current user or 401.
- **Role-based access** enforced at two levels:
  1. **URL-level**: SecurityConfig restricts endpoints by role (e.g., `POST /api/helicopters` requires ADMIN).
  2. **Field-level**: Services enforce which fields each role can edit (e.g., Planner cannot set planned dates on operations).
- `DataInitializer` seeds 4 default users on first boot so the app is immediately usable.

### 3.3 Entity Relationships

```
                    Users (login/auth)
                         |
     +-------------------+-------------------+
     |                   |                   |
  Planner           Supervisor            Pilot
  (creates ops)     (approves)      (creates orders)

                                     Crew Members
                                     (assigned to orders)
                                          |
  Helicopters ──── Flight Orders ────────┘
       |                |
  Landing Sites ───────┘
       |                |
       └── Flight Operations (many-to-many with orders)
                |
           KML Files (stored on disk)
```

**Critical relationship**: `Flight Orders <-> Flight Operations` is many-to-many. An order contains multiple operations; an operation's status changes based on order outcomes.

**User vs CrewMember**: These are separate entities. Users have login credentials and application roles. CrewMembers are people assigned to flights (with weight, training dates, etc.). Linked via an explicit FK: `users.crew_member_id → crew_members.id` (nullable — only populated for Pilot users). When a pilot creates a flight order, the pilot field auto-fills from `currentUser.crewMemberId`.

### 3.4 KML Processing Pipeline

```
Upload KML file
    → Save to disk ({upload-dir}/{UUID}_{filename}.kml)
    → Parse XML: extract <coordinates> from <Placemark> nodes
    → Validate: max 5000 points, within Poland bounding box
    → Calculate route: Haversine formula on consecutive points → total km
    → Persist parsed points to DB (JSON column on flight_operations)
    → Return: { filePath, points[], routeLengthKm }
```

**Coordinate storage**: Parsed lat/lng points are stored as a JSON column (`kml_points`) on the `flight_operations` table. This avoids re-parsing the KML file on every page load. The `GET /api/operations/{id}` response includes the points array so the frontend MapView can render the route directly. For flight orders, `GET /api/orders/{id}` includes the points from all linked operations.

Uses `javax.xml.parsers.DocumentBuilder` — no external KML library needed since we only extract coordinates.

---

## 4. Frontend Architecture

### 4.1 Technology Stack

| Concern | Library |
|---------|---------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| UI Components | MUI (Material UI) |
| Routing | react-router-dom v6 |
| HTTP | Axios |
| Map | react-leaflet + Leaflet (OpenStreetMap tiles) |
| State | React Context (auth) + local state (forms/lists) |

No Redux or global state management — the app is CRUD-heavy with simple data flow. AuthContext holds the logged-in user; everything else is fetched per-page.

### 4.2 Page Structure

Every entity follows the same pattern:
1. **ListPage** — DataTable (MUI DataGrid) with sorting, filtering, default sort/filter per entity.
2. **FormPage** — Create/edit form with role-based field visibility/editability. Reused for both new and edit (`:id` param).

```
/login              → LoginPage
/helicopters        → HelicopterListPage    → /helicopters/new | /:id
/crew               → CrewListPage          → /crew/new | /:id
/landing-sites      → LandingSiteListPage   → /landing-sites/new | /:id
/users              → UserListPage          → /users/new | /:id
/operations         → OperationListPage     → /operations/new | /:id
/orders             → OrderListPage         → /orders/new | /:id
```

### 4.3 Shared Components

| Component | Purpose |
|-----------|---------|
| **DataTable** | Wraps MUI DataGrid — consistent sorting, filtering, column definitions |
| **MapView** | Wraps react-leaflet — renders polylines (routes) and markers (landing sites) |
| **StatusBadge** | Colored MUI Chip per status code |
| **Layout** | Sidebar navigation (role-aware) + top bar + content area |
| **ProtectedRoute** | Redirects to /login if not authenticated; optionally checks role |

### 4.4 Role-Aware UI

The sidebar, form fields, and action buttons all adapt based on the logged-in user's role:

| UI Element | How roles affect it |
|------------|-------------------|
| Sidebar sections | Hidden entirely if role has no access (e.g., Planner sees no Admin section) |
| Form fields | Disabled/hidden based on role + entity status |
| Action buttons | Only shown when the role can perform that status transition |
| List default filter | Operations default to status=CONFIRMED; Orders default to status=SENT_FOR_APPROVAL |

---

## 5. Data Flow: Key Workflows

### 5.1 Flight Operation Lifecycle

```
Planner creates operation          Supervisor reviews
with KML file + details            sets planned dates
        │                                │
        ▼                                ▼
   [SUBMITTED] ──────────────────→ [CONFIRMED] ←──────────┐
        │         (supervisor)           │                 │
        │                                │ (added to order)│ (order not completed)
        │ (supervisor rejects)           ▼                 │
        ▼                          [SCHEDULED] ────────────┘
   [REJECTED] *                     /    |
                          partial  /     | complete
                                  ▼      ▼
                          [PARTIAL] * [COMPLETED]

   Any of [SUBMITTED, CONFIRMED, SCHEDULED] → [CANCELLED] (Planner: Rezygnuj)
```

> **\* PRD gaps — dead-end statuses:**
> - **REJECTED(2)**: Planner can edit fields (PRD 6.5.d) but no status transition out is defined. Likely intent: planner fixes fields, supervisor re-reviews — but no "resubmit" mechanism exists in PRD.
> - **PARTIALLY_COMPLETED(5)**: No transitions defined. Cannot be re-scheduled, completed, or cancelled. Planner can edit (PRD 6.5.d) but status is stuck. Likely needs a path back to CONFIRMED(3) or forward to COMPLETED(6) in a future iteration.

### 5.2 Flight Order Lifecycle

```
Pilot creates order
selects operations, crew,
helicopter, landing sites
        │
        ▼
   [SUBMITTED]
        │  (pilot: Przekaz do akceptacji) *
        ▼
   [SENT_FOR_APPROVAL]
        │
   ┌────┴────┐
   ▼         ▼
[REJECTED] [APPROVED]
             │
        ┌────┼────────┐
        ▼    ▼        ▼
  [PARTIAL] [DONE] [NOT DONE]
```

> **\* Inferred transition**: The PRD defines buttons only for status=2 (supervisor) and status=4 (pilot). The 1→2 transition ("Przekaz do akceptacji") is not explicitly in the PRD but is logically required — pilot needs to explicitly submit for approval. Alternative: create orders directly in status 2 (auto-submit on save).

**Status cascading**: When a pilot marks an order as completed/partial/not-done, all linked operations automatically transition:
- Order COMPLETED → all operations → COMPLETED
- Order PARTIAL → all operations → PARTIALLY_COMPLETED
- Order NOT_COMPLETED → all operations → back to CONFIRMED

### 5.3 Flight Order Validation (5 rules)

Before saving/submitting a flight order, these are checked:

| # | Rule | Data Source |
|---|------|------------|
| 1 | Helicopter inspection valid on flight date | helicopter.inspection_expiry_date >= planned_departure.date |
| 2 | Pilot license valid on flight date | pilot_crew_member.license_expiry_date >= planned_departure.date |
| 3 | All crew training valid on flight date (including pilot) | pilot + each crew_member: training_expiry_date >= planned_departure.date |
| 4 | Crew weight within helicopter limit | SUM(all crew weights) <= helicopter.max_crew_weight_kg |
| 5 | Route within helicopter range | estimated_route_length_km <= helicopter.range_km |

These are **blocking** — the save is rejected with a specific error message for each failed rule.

**Additional precondition**: Transitions to status 5 (PARTIALLY_COMPLETED) or 6 (COMPLETED) require `actual_departure` and `actual_arrival` to be non-null (PRD 6.6.a: "obowiązkowe przed statusem 5/6").

---

## 6. Database Design Summary

### Core Tables (4)
- `helicopters` — fleet registry with status, inspection dates, capacity limits
- `crew_members` — personnel with roles (PILOT/OBSERVER), certifications, weight
- `landing_sites` — named coordinates (lat/lng)
- `users` — login accounts with application roles

### Business Tables (2 + 6 join/support)
- `flight_operations` — planned aerial work items with KML routes and persisted coordinates
  - `flight_operation_activity_types` (join)
  - `flight_operation_contacts` (join)
  - `operation_comments` (append-only log)
  - `operation_change_history` (audit trail)
- `flight_orders` — concrete flight assignments combining operations + resources
  - `flight_order_crew_members` (join)
  - `flight_order_operations` (join — the critical many-to-many)

Total: **12 tables**. Schema is detailed in `docs/plan.md` section 2 (note: `users.crew_member_id` FK was added post-plan as resolved decision #1).

---

## 7. Implementation Strategy

### Phase Order (from plan.md)

| Phase | Focus | Est. Effort | MVP? |
|-------|-------|-------------|------|
| 0 | Scaffolding — monorepo, deps, Docker Postgres, proxy | ~2h | Setup |
| 1 | Auth + App Shell — login, session, sidebar, role routing | ~2h | Foundation |
| 2 | Admin CRUD — 4 entities, list+form pages, DataTable | ~3h | Supporting data |
| 3 | Flight Operations — KML, status workflow, map, comments | ~4h | **MVP milestone** |
| 4 | Flight Orders — validations, cascading statuses, full map | ~4h | Full scope |
| 5 | Polish — error handling, loading states, responsive | ~2h | Quality |

**MVP = after Phase 3**: A working app where planners create operations with map display, and supervisors can approve/reject them. This satisfies the "Minimum Viable Demo" criteria from the PRD (section 10).

### Build Order Rationale

The order is driven by dependencies:
1. You can't build anything without scaffolding (Phase 0)
2. Every page needs auth context (Phase 1)
3. Flight operations reference helicopters/crew/sites (Phase 2 before 3)
4. Flight orders reference operations (Phase 3 before 4)

### Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Auth mechanism | Session-based (JSESSIONID) | Simplest for monolith; no token refresh logic needed |
| State management | React Context + local state | CRUD app with no complex cross-page state; Redux would be overhead |
| Map library | Leaflet + OpenStreetMap | Free, no API key, good enough for displaying routes and markers |
| KML parsing | Built-in Java XML parser | KML is XML; we only need coordinates — no need for a full GIS library |
| File storage | Local filesystem | No cloud requirements specified; simplest approach |
| DB schema management | JPA auto-DDL (dev) | Fast for development; can add Flyway later if needed |

---

## 8. Risk Areas & Complexity Hotspots

| Area | Risk | Mitigation |
|------|------|------------|
| **Status cascading** (order → operations) | Race conditions if multiple orders reference same operation | Optimistic locking on operations; service-layer transaction boundaries |
| **Role-based field editing** | Complex matrix of who can edit what in which status | Centralize in service layer with clear permission checks; don't scatter across controllers |
| **KML parsing** | Diverse KML formats, large files | Validate strictly (only extract coordinates); enforce 5000-point limit; reject malformed files gracefully |
| **User ↔ CrewMember link** | Pilot user auto-populates from login, but pilot is a CrewMember FK | Explicit nullable FK `users.crew_member_id` — set by admin when creating pilot users |
| **Map rendering performance** | 5000 points per operation, multiple operations per order | Leaflet handles this fine; consider point simplification only if visible lag |
