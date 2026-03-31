# AERO — Implementation Plan

Based on `docs/description.md` (PRD), `docs/plan.md` (technical plan), and resolved decisions from `sc-docs/questions.md`.

---

## Resolved Decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | User ↔ CrewMember link | Explicit FK: `users.crew_member_id → crew_members.id` (nullable) |
| 2 | Database | Docker Compose with Postgres |
| 3 | UI language | Polish UI, English codebase (enums, variables, API fields) |
| 4 | Java version | Java 21 |
| 5 | Crew roles | Fixed enum: `PILOT`, `OBSERVER` |
| 6 | Activity types | Fixed enum in code |
| 7 | KML test data | Generate synthetic KML files with Polish coordinates |
| 8 | Route length (orders) | Auto-calculated: sum of `routeLengthKm` from selected operations (simple sum, not geometric path — PRD section 9 excludes automatic flight path calculation) |
| 9 | Deployment | Local only |
| 10 | Project structure | Monorepo: delete root `src/`, create `backend/` + `frontend/` |

---

## Phase 0 — Project Scaffolding

**Goal**: Working monorepo with both apps starting and communicating.

### 0.1 Restructure to Monorepo
- Delete `src/` directory
- Create `backend/` subdirectory with its own `build.gradle.kts`
- Move Java source skeleton into `backend/src/main/java/com/nullterrier/aero/`
- Update root `settings.gradle.kts` to `include("backend")`
- Root `build.gradle.kts` becomes allprojects config only

### 0.2 Backend Dependencies (`backend/build.gradle.kts`)
```
Spring Boot 3.x (latest stable)
Java 21 toolchain
Dependencies:
  - spring-boot-starter-web
  - spring-boot-starter-data-jpa
  - spring-boot-starter-security
  - spring-boot-starter-validation
  - postgresql (runtime)
  - lombok (optional, compileOnly)
```

### 0.3 Docker Compose
- `docker-compose.yml` at project root
- Postgres 16 on port 5432
- Database: `aero`, user: `aero`, password: `aero`
- Volume for data persistence

### 0.4 Backend Configuration (`application.yml`)
- Datasource pointing to Docker Postgres
- JPA: `ddl-auto: update` (dev mode — schema auto-created from entities)
- File upload directory: `./uploads/kml`
- Server port: 8080

### 0.5 Scaffold Frontend
- `npm create vite@latest frontend -- --template react-ts` (in project root)
- Install: `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/x-data-grid`
- Install: `react-router-dom`, `axios`
- Install: `react-leaflet`, `leaflet`, `@types/leaflet`
- Configure Vite proxy: `/api` → `http://localhost:8080`
- Dev server on port 5173

### 0.6 Verification
- `docker compose up -d` starts Postgres
- `./gradlew :backend:bootRun` starts Spring Boot, connects to DB
- `cd frontend && npm run dev` starts Vite, proxy works
- `GET http://localhost:5173/api/auth/me` returns 401 (no session) — proxy confirmed

---

## Phase 1 — Authentication & App Shell

**Goal**: Login works for all 4 roles, sidebar is role-aware, protected routes redirect unauthenticated users.

### 1.1 Backend: User Entity & Auth
- `User` entity with fields: id, firstName, lastName, email, passwordHash, role, **crewMemberId** (nullable FK)
- `UserRole` enum: `ADMIN`, `PLANNER`, `SUPERVISOR`, `PILOT`
- `UserRepository` with `findByEmail()`
- `SecurityConfig`:
  - Session-based auth (JSESSIONID cookie)
  - CSRF disabled (SPA uses JSON)
  - CORS configured for localhost:5173
  - Endpoint patterns: `/api/auth/**` permitAll, everything else authenticated
- `AuthController`:
  - `POST /api/auth/login` — accepts `{email, password}`, returns `{id, email, firstName, lastName, role}`
  - `POST /api/auth/logout` — invalidates session
  - `GET /api/auth/me` — returns current user or 401

### 1.2 Backend: DataInitializer
- `CommandLineRunner` that seeds 4 users on first run (if table is empty):
  - `admin@aero.pl` / `admin` — ADMIN
  - `planista@aero.pl` / `planista` — PLANNER
  - `nadzor@aero.pl` / `nadzor` — SUPERVISOR
  - `pilot@aero.pl` / `pilot` — PILOT
- Passwords stored as BCrypt hashes

### 1.3 Frontend: Auth Layer
- `AuthContext` — holds user state, provides `login()`, `logout()`, `isAuthenticated`
- On app load: `GET /api/auth/me` — if 401, redirect to `/login`
- `LoginPage` — email + password form, calls `POST /api/auth/login`
- `ProtectedRoute` component — wraps routes, redirects to `/login` if not authed

### 1.4 Frontend: Layout Shell
- `Layout` component: sidebar + top bar + main content area
- Sidebar navigation with Polish labels, sections hidden/shown per role:
  - **Administracja**: Helikoptery, Czlonkowie zalogi, Ladowiska planowe, Uzytkownicy
  - **Planowanie operacji**: Lista operacji
  - **Zlecenia na lot**: Lista zlecen
- Visibility rules per PRD section 7.2
- Top bar: logged-in user name + role + logout button

### 1.5 Verification
- Log in as each of the 4 users
- Sidebar shows correct sections per role
- Accessing a protected route while logged out redirects to `/login`
- `GET /api/auth/me` returns user data after login

---

## Phase 2 — Admin CRUD (4 Entities)

**Goal**: Admin can manage helicopters, crew members, landing sites, and users. Other roles see read-only views where permitted.

### 2.1 Shared: DataTable Component
- Wraps MUI DataGrid
- Props: columns, data, default sort, onRowClick
- Used by all list pages

### 2.2 Helicopters
**Backend**:
- `Helicopter` entity (all fields from PRD 6.1)
- `HelicopterStatus` enum: `ACTIVE`, `INACTIVE`
- Repository, Service, Controller (`/api/helicopters`)
- Validation: inspectionExpiryDate required when status = ACTIVE

**Frontend**:
- `HelicopterListPage` — DataTable with registration number, type, status; sorted by status + registration
- `HelicopterFormPage` — all fields, conditional inspection date

### 2.3 Crew Members
**Backend**:
- `CrewMember` entity (all fields from PRD 6.2)
- `CrewRole` enum: `PILOT`, `OBSERVER`
- Repository, Service, Controller (`/api/crew-members`)
- Validation: pilotLicenseNumber + licenseExpiryDate required when role = PILOT
- Email validation (regex)

**Frontend**:
- `CrewListPage` — DataTable with email, role, license expiry, training expiry; sorted by email
- `CrewFormPage` — all fields, conditional pilot fields

### 2.4 Landing Sites
**Backend**:
- `LandingSite` entity: id, name, latitude, longitude
- Repository, Service, Controller (`/api/landing-sites`)

**Frontend**:
- `LandingSiteListPage` — DataTable with name; sorted by name
- `LandingSiteFormPage` — name + coordinates (lat/lng inputs)

### 2.5 Users
**Backend**:
- Uses the existing User entity from Phase 1
- `UserController` (`/api/users`) — CRUD
- `UserService` — creates users with BCrypt password, manages crew_member_id link
- Validation: email format

**Frontend**:
- `UserListPage` — DataTable with email, role; sorted by email
- `UserFormPage` — all fields including role dropdown, optional crew member link for PILOT role

### 2.6 Role-Based Access
- Controllers annotated with `@PreAuthorize` or checked in service layer
- ADMIN: full CRUD on all 4 entities
- SUPERVISOR, PILOT: read-only on admin entities (GET only)
- PLANNER: no access to admin section (403)
- Frontend: form fields disabled for non-ADMIN roles; create/edit buttons hidden

### 2.7 Dictionary Endpoints
- `GET /api/dictionaries/activity-types` — returns fixed list
- `GET /api/dictionaries/crew-roles` — returns PILOT, OBSERVER
- `GET /api/dictionaries/operation-statuses` — returns all 7 statuses
- `GET /api/dictionaries/order-statuses` — returns all 7 statuses
- All return `[{value, label}]` where label is the Polish display name

### 2.8 Verification
- Admin creates helicopter, crew member, landing site, new user
- Supervisor/Pilot can view but not edit admin entities
- Planner gets 403 on admin endpoints
- Validation errors display correctly (e.g., missing pilot license)

---

## Phase 3 — Flight Operations (MVP Milestone)

**Goal**: Planners create operations with KML uploads shown on map. Supervisors approve/reject. This is the MVP demo target.

### 3.1 Backend: KML Service
- `KmlService`:
  1. Save uploaded file: `{upload-dir}/{UUID}_{original-name}.kml`
  2. Parse XML: extract `<coordinates>` from `<Placemark>` nodes
  3. Validate: max 5000 points, all within Poland bounding box (lat 49.0–54.9, lng 14.1–24.2)
  4. Calculate route length: Haversine formula on consecutive points, sum in km
  5. Return: `KmlProcessingResult { filePath, List<LatLng> points, int routeLengthKm }`
- **Coordinate persistence**: Parsed points are stored as a JSON column (`kml_points TEXT/JSONB`) on the `flight_operations` entity. This avoids re-parsing KML on every page load. The column stores a JSON array of `[lat, lng]` pairs.
- Endpoint: `POST /api/operations/upload-kml` — multipart file upload, returns result
- Endpoint: `GET /api/operations/{id}/kml` — serves the stored KML file (raw download)

### 3.2 Backend: Flight Operation Entity & Supporting Tables
- `FlightOperation` entity with all fields from PRD 6.5
- **`kml_points`** — TEXT/JSONB column storing parsed coordinates as JSON array (persisted at upload time, served in detail response)
- **`auto_number`** — display-friendly sequential number. Strategy: use the entity `id` as the display number (both are sequential). Avoids complexity of managing a second sequence with JPA `ddl-auto: update`. If distinct numbering is needed later, switch to a `@PrePersist` hook with `SELECT COALESCE(MAX(auto_number), 0) + 1`.
- `OperationStatus` enum: `SUBMITTED(1)`, `REJECTED(2)`, `CONFIRMED(3)`, `SCHEDULED(4)`, `PARTIALLY_COMPLETED(5)`, `COMPLETED(6)`, `CANCELLED(7)`
- `ActivityType` enum: `VISUAL_INSPECTION`, `SCAN_3D`, `FAULT_LOCATION`, `PHOTOS`, `PATROL` (with Polish labels)
- Join tables: `flight_operation_activity_types`, `flight_operation_contacts`
- `OperationComment` entity (append-only)
- `OperationChangeHistory` entity (audit trail, auto-populated on updates)

### 3.3 Backend: Operation Service (Business Logic)
- **Status transitions** — validated state machine:
  - `SUBMITTED → REJECTED` (supervisor)
  - `SUBMITTED → CONFIRMED` (supervisor, requires planned dates)
  - `SUBMITTED/CONFIRMED/SCHEDULED → CANCELLED` (planner: Rezygnuj)
  - *The following transitions are triggered by flight orders (Phase 4) — define the state machine now, implement triggers in Phase 4:*
  - `CONFIRMED → SCHEDULED` (automatic, when operation is added to a flight order)
  - `SCHEDULED → PARTIALLY_COMPLETED` (automatic, when order marked partial)
  - `SCHEDULED → COMPLETED` (automatic, when order marked complete)
  - `SCHEDULED → CONFIRMED` (automatic, when order marked not completed — returns to pool)
- **PRD dead-end statuses** (no transitions out defined in PRD):
  - `REJECTED(2)` — planner can edit fields but no "resubmit" action exists. For now: implement as-is (editable, no status change). Document for future PRD clarification.
  - `PARTIALLY_COMPLETED(5)` — no path to completion or re-scheduling. Implement as-is.
- **Role-based field editing**:
  - Planner: can edit in statuses 1,2,3,4,5 but NOT: planned dates (earliest/latest), status, post-completion notes, and auto-populated fields (operation number, route km, created-by, change history, linked orders)
  - Supervisor: can edit all fields in all statuses
- **Change history**: on every update, compare old/new values per field, write to `operation_change_history`
- **Comments**: append-only, `POST /api/operations/{id}/comments`

### 3.4 Backend: Operation Controller
- `GET /api/operations` — list with filtering (default: status=CONFIRMED), sorting (default: planned date earliest ASC)
- `GET /api/operations/{id}` — full detail including: comments, history, activity types, contacts, **parsed KML points** (from JSON column), **linked flight order numbers** (from `flight_order_operations` join)
- `POST /api/operations` — create (PLANNER or SUPERVISOR)
- `PUT /api/operations/{id}` — update (role-based restrictions enforced in service)
- `POST /api/operations/{id}/status` — explicit status change (with action name: reject, confirm, cancel)
- Access: ADMIN and PILOT have read-only access (GET only); PLANNER and SUPERVISOR can create/edit

### 3.5 Frontend: MapView Component
- Wraps `react-leaflet` with OpenStreetMap tiles
- Props: `polylines: LatLng[][]`, `markers: {position, label}[]`
- Renders KML points as polyline, landing sites as markers
- Auto-fits bounds to show all data

### 3.6 Frontend: Operation Pages
- **OperationListPage**:
  - DataTable: operation number, order number, activity types, proposed dates, planned dates, status
  - Default filter: status = CONFIRMED
  - Default sort: planned date earliest ASC
  - Custom filtering support
- **OperationFormPage**:
  - Full form with all fields
  - KML file upload with immediate map preview (points from JSON column on subsequent loads)
  - Activity types as multi-select checkboxes
  - Contacts as email chip input
  - Comments section (list + add form)
  - **Linked flight orders** — read-only list of order numbers linking to this operation (PRD: "Lista powiązanych zleceń", auto-populated via `flight_order_operations`)
  - **Status action buttons** (role-aware):
    - Supervisor sees: "Odrzuc" (reject), "Potwierdz do planu" (confirm) when status=SUBMITTED
    - Planner sees: "Rezygnuj" (cancel) when status=SUBMITTED/CONFIRMED/SCHEDULED
  - Fields disabled based on role + status
  - **Planner blocked fields** (PRD 6.5.e): operation number (auto), route km (calculated), created-by (auto), change history (auto), linked orders (auto), planned dates, status, post-completion notes
  - Map showing the KML route

### 3.7 Generate Synthetic KML Test Data
- Create 3-4 KML files with realistic Polish coordinates (power line routes):
  - One short route (~50 points, ~20km, around Warsaw)
  - One medium route (~200 points, ~80km, southern Poland)
  - One long route (~1000 points, ~200km, crossing multiple regions)
- Place in `backend/src/main/resources/test-data/` for seeding

### 3.8 DataInitializer Extension
- Seed sample data for demo:
  - 2-3 helicopters (1 active, 1 inactive)
  - 3-4 crew members (2 pilots, 2 observers)
  - 3-4 landing sites (real Polish airfield coordinates)
  - 3-5 flight operations in various statuses with uploaded KML files
- Link pilot user to crew member (set `crewMemberId` FK on pilot user)

### 3.9 Verification (MVP Demo)
- Planner logs in → creates operation with KML → sees it on map (points from persisted JSON)
- Planner sees operation list with filters
- Supervisor logs in → sees submitted operations → confirms with planned dates / rejects
- Map correctly renders the KML route
- Status transitions work (SUBMITTED↔REJECTED, SUBMITTED→CONFIRMED, →CANCELLED), history is recorded
- Comments can be added and viewed
- Note: transitions triggered by flight orders (CONFIRMED→SCHEDULED, SCHEDULED→COMPLETED/PARTIAL/CONFIRMED) are defined in the state machine but **untestable until Phase 4**
- **This satisfies PRD section 10 "Level I — Minimum Viable Demo"**

---

## Phase 4 — Flight Orders

**Goal**: Pilots create flight orders combining operations + resources, with full validation. Supervisors approve. Status cascading works.

### 4.1 Backend: Flight Order Entity
- `FlightOrder` entity with all fields from PRD 6.6
- **`auto_number`** — same strategy as operations: use entity `id` as display number
- `OrderStatus` enum: `SUBMITTED(1)`, `SENT_FOR_APPROVAL(2)`, `REJECTED(3)`, `APPROVED(4)`, `PARTIALLY_COMPLETED(5)`, `COMPLETED(6)`, `NOT_COMPLETED(7)`
- Join tables: `flight_order_crew_members`, `flight_order_operations`

### 4.2 Backend: Order Service (Business Logic)
- **Auto-fill pilot** from logged-in user's linked crew member (via `user.crewMemberId`). If user has no linked crew member, block order creation with error.
- **Auto-calculate crew weight**: sum of pilot weight + all selected crew members' weights
- **Auto-calculate estimated route length**: sum of `routeLengthKm` from all selected operations. Note: this is a simple sum of individual operation distances, NOT a geometric path calculation including landing sites (PRD section 9 explicitly excludes automatic flight path calculation).
- **5 validation rules** (blocking — checked on save):
  1. `helicopter.inspectionExpiryDate >= plannedDeparture.toLocalDate()`
  2. `pilotCrewMember.licenseExpiryDate >= plannedDeparture.toLocalDate()`
  3. For **pilot AND each crew member**: `trainingExpiryDate >= plannedDeparture.toLocalDate()` (pilot is tracked via `pilot_id` separately from the crew join table — must check both)
  4. `crewWeightKg <= helicopter.maxCrewWeightKg`
  5. `estimatedRouteLengthKm <= helicopter.rangeKm`
- **Status transition precondition**: Transitions to status 5 or 6 require `actualDeparture` and `actualArrival` to be non-null (PRD 6.6.a: "obowiązkowe przed statusem 5/6")
- **Status transitions**:
  - `SUBMITTED → SENT_FOR_APPROVAL` (pilot) — *inferred transition, not explicitly in PRD but logically required; alternative: create orders directly in status 2*
  - `SENT_FOR_APPROVAL → REJECTED` (supervisor)
  - `SENT_FOR_APPROVAL → APPROVED` (supervisor)
  - `APPROVED → PARTIALLY_COMPLETED` (pilot, requires actual dates) — cascades all operations → PARTIALLY_COMPLETED
  - `APPROVED → COMPLETED` (pilot, requires actual dates) — cascades all operations → COMPLETED
  - `APPROVED → NOT_COMPLETED` (pilot) — cascades all operations → back to CONFIRMED
- **Operation status side effects**: when operations are added to an order, their status changes CONFIRMED → SCHEDULED

### 4.3 Backend: Order Controller
- `GET /api/orders` — list, default filter: status=SENT_FOR_APPROVAL, sort: planned departure ASC
- `GET /api/orders/{id}` — full detail with crew, operations (including **KML points** from each operation's JSON column), helicopter, landing sites
- `POST /api/orders` — create (**PILOT only** — supervisor cannot create, only edit/approve)
- `PUT /api/orders/{id}` — update (PILOT for own orders; SUPERVISOR for status changes)
- `POST /api/orders/{id}/status` — status transition with cascading
- **Role access** (PRD 7.2):
  - PILOT: full CRUD (create, edit, view)
  - SUPERVISOR: edit + view only (no create — "edycja / podgląd")
  - ADMIN: view only ("podgląd")
  - PLANNER: **no access at all** — 403 on all `/api/orders/**` endpoints ("brak")

### 4.4 Frontend: Order Pages
- **OrderListPage**:
  - DataTable: order number, planned departure, helicopter (registration number), pilot, status
  - Default filter: status = SENT_FOR_APPROVAL
  - Default sort: planned departure ASC
  - "Nowe zlecenie" (create) button visible to **PILOT only** (not supervisor, not admin)
- **OrderFormPage**:
  - Pilot auto-filled (from logged-in user's linked crew member), displayed as read-only
  - Helicopter dropdown (only ACTIVE helicopters)
  - Crew member multi-select
  - Landing site selectors (departure + arrival)
  - Operations multi-select (only status=CONFIRMED operations)
  - Auto-calculated fields displayed: crew weight, estimated route length
  - Planned departure + arrival datetime pickers
  - **Live validation warnings** — show red messages as user selects helicopter/crew/operations:
    - "Przegląd helikoptera wygasa przed datą lotu" (helicopter inspection expires before flight)
    - "Licencja pilota wygasa przed datą lotu"
    - "Szkolenie [imię nazwisko] wygasa przed datą lotu" (also check pilot's training)
    - "Waga załogi (X kg) przekracza udźwig helikoptera (Y kg)"
    - "Szacowana trasa (X km) przekracza zasięg helikoptera (Y km)"
  - **Status action buttons** (role-aware):
    - Pilot: "Przekaz do akceptacji" (submit for approval) when status=SUBMITTED
    - Supervisor: "Odrzuć" / "Zaakceptuj" when status=SENT_FOR_APPROVAL
    - Pilot: "Zrealizowane w części" / "Zrealizowane w całości" / "Nie zrealizowane" when status=APPROVED
  - Actual departure/arrival fields — shown for APPROVED status, **required before** clicking completion/partial buttons
  - **Map** showing: departure site marker, arrival site marker, polylines from all selected operations' KML points (loaded from operations' persisted JSON coordinates)

### 4.5 Verification
- Pilot creates order, selects operations → map shows combined routes
- Validation fires when selecting expired-license pilot or overweight crew
- Pilot submits for approval → supervisor approves
- Pilot marks order as completed → linked operations auto-transition to COMPLETED
- Pilot marks order as not completed → linked operations return to CONFIRMED

---

## Phase 5 — Polish & Quality

**Goal**: Error handling, UX polish, edge cases.

### 5.1 Backend
- `GlobalExceptionHandler` (`@ControllerAdvice`):
  - Validation errors → 400 with field-level messages
  - Not found → 404
  - Unauthorized → 401/403 with clear message
  - Generic → 500 with safe message
- Review all status transitions for edge cases (e.g., operation in SCHEDULED can't be cancelled if order is APPROVED)

### 5.2 Frontend
- Error display: toast/snackbar for API errors
- Loading spinners on data fetches
- Confirmation dialogs before destructive actions (reject, cancel)
- Empty state messages on lists
- Form dirty-state warnings (unsaved changes)

### 5.3 End-to-End Smoke Test
Walk through the complete workflow:
1. Start Postgres + backend + frontend
2. Admin: create helicopter, crew members, landing sites
3. Planner: create flight operation with KML, view on map
4. Supervisor: confirm operation with planned dates
5. Pilot: create flight order, select operation + helicopter + crew, pass validations, submit
6. Supervisor: approve flight order
7. Pilot: mark order as completed, verify operation cascaded

---

## File Inventory (What Gets Created)

### Root
- `docker-compose.yml`
- `settings.gradle.kts` (modified: include backend)
- `build.gradle.kts` (modified: allprojects only)
- `.gitignore` (updated for uploads, node_modules, etc.)

### backend/
- `build.gradle.kts` (Spring Boot + deps)
- `src/main/resources/application.yml`
- `src/main/java/com/nullterrier/aero/`
  - `AeroApplication.java`
  - `config/` — SecurityConfig, WebConfig, DataInitializer
  - `entity/` — User, Helicopter, CrewMember, LandingSite, FlightOperation, FlightOrder, OperationComment, OperationChangeHistory + enums
  - `repository/` — one per entity
  - `service/` — UserService, HelicopterService, CrewMemberService, LandingSiteService, OperationService, OrderService, KmlService
  - `controller/` — AuthController, UserController, HelicopterController, CrewMemberController, LandingSiteController, OperationController, OrderController, DictionaryController
  - `dto/` — request/response DTOs per entity
  - `exception/` — GlobalExceptionHandler, custom exceptions
- `src/main/resources/test-data/` — synthetic KML files

### frontend/
- `package.json`
- `vite.config.ts`
- `src/`
  - `api/` — axiosInstance.ts, auth.ts, helicopters.ts, crew.ts, landingSites.ts, users.ts, operations.ts, orders.ts, dictionaries.ts
  - `types/` — one .ts per entity (interfaces mirroring DTOs)
  - `contexts/` — AuthContext.tsx
  - `components/` — Layout.tsx, DataTable.tsx, MapView.tsx, StatusBadge.tsx, ProtectedRoute.tsx
  - `pages/auth/` — LoginPage.tsx
  - `pages/helicopters/` — HelicopterListPage.tsx, HelicopterFormPage.tsx
  - `pages/crew/` — CrewListPage.tsx, CrewFormPage.tsx
  - `pages/landingSites/` — LandingSiteListPage.tsx, LandingSiteFormPage.tsx
  - `pages/users/` — UserListPage.tsx, UserFormPage.tsx
  - `pages/operations/` — OperationListPage.tsx, OperationFormPage.tsx
  - `pages/orders/` — OrderListPage.tsx, OrderFormPage.tsx
  - `App.tsx` — router + layout

### Approximate counts
- ~12 Java entities/enums
- ~8 repositories
- ~8 services
- ~9 controllers
- ~16 DTOs
- ~14 React page components
- ~5 shared React components
- ~9 API modules
- ~7 TypeScript type files
