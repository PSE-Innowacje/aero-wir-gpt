# AERO — Helicopter Flight Operations Management System

A web application for planning and managing helicopter flight operations over power-line inspection routes. Covers the full lifecycle: planners submit operations, supervisors approve them, pilots create flight orders with crew/helicopter selection and validation, and report completion with status cascading.

---

## 1. Quick Start

### Prerequisites

- **Java 21** (JDK)
- **Docker Desktop** (running)
- **Node.js 18+**

### Option A: macOS / Linux (simplest)

If Docker is running, a single Gradle task starts a temporary MongoDB via Testcontainers and boots the backend against it — no manual setup needed:

```bash
./gradlew :backend:bootTestRun
```

Then start the frontend:

```bash
cd frontend && npm install && npm run dev
```

### Option B: Windows (manual MongoDB container)

On Windows, `docker-java` (used by Testcontainers) has a known incompatibility with Docker Desktop 4.67+ — it throws `Could not find a valid Docker environment` because the library cannot locate the Docker pipe at `//./pipe/docker_engine`. To work around this, start MongoDB manually:

```bash
bash backend/setup-mongodb.sh
```

This creates a Docker container `aero-mongodb` with **MongoDB 7** on `localhost:27017` (database: `aero`, no authentication).

Then start backend and frontend:

```bash
# Terminal 1 — Backend
./gradlew :backend:bootRun

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Manage the MongoDB container:

```bash
docker start aero-mongodb      # start
docker stop aero-mongodb       # stop
docker rm aero-mongodb         # remove (re-run setup script to recreate)
docker exec -it aero-mongodb mongosh aero   # shell
```

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 (proxies `/api/**` to backend) |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| MongoDB | localhost:27017 (database: `aero`) |

### Default Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@aero.pl` | `admin` | Administrator |
| `planista@aero.pl` | `planista` | Planner |
| `nadzor@aero.pl` | `nadzor` | Supervisor |
| `pilot@aero.pl` | `pilot` | Pilot |

On first boot the backend seeds these 4 users, 3 helicopters, 4 crew members, 3 landing sites, and 4 sample flight operations.

---

## 2. Testing

### 2.1. Backend Tests (Spock + Testcontainers)

Integration tests auto-start a temporary MongoDB container via Testcontainers:

```bash
./gradlew :backend:test
```

> **Windows note**: If Testcontainers fails with `Could not find a valid Docker environment`, unit tests (Spock specs with mocks) still pass. For full integration testing on Windows, use the manual MongoDB container (Option B above) and `bootRun`.

### 2.2. E2E Tests (Playwright)

112 tests covering authentication, CRUD, status workflows, role-based access, and performance. Require backend + frontend running.

```bash
# Install (first time only)
cd e2e && npm install && npx playwright install chromium

# Run all tests
cd e2e && npm test

# Other modes
npm run test:headed          # visible browser
npm run test:ui              # Playwright UI
npm run report               # view HTML report
```

Individual suites:

```bash
npm run test:auth            # authentication (login/logout, all 4 roles)
npm run test:nav             # navigation, layout, page routing
npm run test:helicopters     # helicopter CRUD (UI + API), search, modal
npm run test:operations      # operation lifecycle, status transitions, comments
npm run test:crew            # crew member CRUD, pilot license validation
npm run test:landing-sites   # landing site CRUD
npm run test:users           # user management, role-based access
npm run test:dictionaries    # public dictionary endpoints
npm run test:performance     # page load times, API response times, concurrency
npm run test:api             # all API integration tests
```

### 2.3. Postman Collection

The file `backend/src/test/resources/AERO-API.postman_collection.json` covers all 32 REST endpoints. Import it into Postman.

**Structure:**

| Folder | Requests | Notes |
|--------|----------|-------|
| Test Flow | 18 | Sequential test suite — run via Collection Runner. Generates unique data per run. |
| Auth | 5 | Login (with 4 role examples), Signup, Logout, Get Me, List Users |
| Helicopters | 4 | CRUD. Create has 3 examples (Active, Inactive, Validation error) |
| Landing Sites | 4 | CRUD. Create has 4 examples (3 Polish airfields + validation error) |
| Users | 4 | CRUD (ADMIN only) |
| Crew Members | 4 | CRUD. Create has 2 examples (Observer, Pilot with license) |
| Dictionaries | 4 | Public endpoints: activity types, crew roles, operation/order statuses |
| Operations | 8 | CRUD + status change (3 examples), comments, KML upload/download |
| Orders | 5 | CRUD + status change (3 examples) |

**Session management**: The collection uses a pre-request script that attaches `JSESSIONID` cookie to all requests. Login first, then all subsequent requests authenticate automatically.

---

## 3. Technology Stack

### 3.1. Architecture

```
Browser (SPA)               Spring Boot              MongoDB
React + TypeScript + MUI  <--HTTP-->  REST API :8080  <--driver-->  :27017
```

Self-contained system — no external APIs, message queues, or third-party integrations. A single Spring Boot backend serves the REST API; a React SPA (served by Vite dev server) consumes it.

### 3.2. Backend

| Technology | Version | Justification |
|------------|---------|---------------|
| **Java** | 21 (LTS) | Latest LTS with virtual threads and pattern matching; required by Spring Boot 3.x |
| **Spring Boot** | 3.x | Industry standard for Java backends — auto-configuration, embedded server, rich ecosystem |
| **Spring Security** | (in Boot) | Session-based auth (JSESSIONID cookie), URL-level and field-level access control |
| **Spring Data MongoDB** | (in Boot) | Document-to-Java mapping, derived query methods, unique indexes via `@Indexed(unique=true)` |
| **MongoDB** | 7 | Document-oriented NoSQL — flexible schema allows embedding comments, change history, and KML points directly in operation documents. Unique indexes enforce constraints on email and registration number. No schema migrations needed. |
| **Testcontainers** | (Gradle) | Auto-starts ephemeral MongoDB container for integration tests — zero manual DB setup |
| **Spock Framework** | (Gradle) | Groovy-based BDD test framework — readable `given`/`when`/`then` syntax, built-in mocking |
| **SpringDoc OpenAPI** | (Gradle) | Auto-generates Swagger UI from controller annotations |
| **Gradle** | Kotlin DSL | Build system — faster than Maven, declarative Kotlin configuration |

### 3.3. Frontend

| Technology | Version | Justification |
|------------|---------|---------------|
| **React** | 18 | Component-based UI library — virtual DOM, massive ecosystem, strong TypeScript support |
| **TypeScript** | 5.6 | Static typing — catches entire classes of bugs at compile time, better IDE navigation |
| **Vite** | 5.x | Dev server with HMR (instant reload). Proxies `/api/**` to the backend. |
| **MUI (Material UI)** | 7.x | Component library — DataGrid, Dialog, TextField, Select with accessibility and dark theme |
| **react-router-dom** | 7.x | SPA routing — declarative routes, protected paths, redirects |
| **Axios** | 1.x | HTTP client — interceptors, automatic `withCredentials` for session cookies |
| **react-leaflet + Leaflet** | 4.x / 1.9 | Interactive map — renders polylines from KML files and markers for landing sites. OpenStreetMap tiles. |
| **Zod** | 4.x | Schema validation — safe parsing of API responses |

### 3.4. E2E Testing

| Technology | Version | Justification |
|------------|---------|---------------|
| **Playwright** | 1.x | Fast, reliable E2E framework — built-in API for testing both UI interactions and REST endpoints in one suite |

### 3.5. Repository Structure (Monorepo)

```
aero-wir-gpt/
├── backend/                          # Spring Boot (Java 21)
│   ├── build.gradle.kts
│   └── src/main/java/pl/pse/aero/
│       ├── AeroApplication.java
│       ├── config/                   # SecurityConfig, CORS, DataInitializer, MongoConfig
│       ├── controller/               # Thin REST controllers
│       ├── dto/                      # Request/Response objects
│       ├── domain/                   # MongoDB documents (@Document) + enums
│       ├── exception/                # GlobalExceptionHandler, EntityNotFoundException
│       ├── repository/               # Spring Data MongoDB interfaces
│       └── service/                  # Business logic, state machines, KML parsing
├── frontend/                         # Vite + React 18 + TypeScript
│   ├── package.json
│   └── src/
│       ├── api/                      # Axios instance + typed API functions
│       ├── components/               # DataTable, MapView, StatusBadge, Layout
│       ├── contexts/                 # AuthContext
│       ├── pages/                    # Pages (list + form per entity)
│       ├── types/                    # TypeScript interfaces mirroring DTOs
│       └── App.tsx                   # Router + sidebar + protected routes
├── e2e/                              # E2E tests (Playwright)
│   ├── playwright.config.ts
│   ├── helpers/                      # Auth, API, constants
│   └── tests/                        # Test files (*.spec.ts)
├── build.gradle.kts                  # Root Gradle config
├── settings.gradle.kts
├── CLAUDE.md                         # AI agent context
└── README.md                         # <-- you are here
```

> **Design decision**: The frontend is NOT managed by Gradle. It runs independently via `npm run dev` with Vite proxy: `/api/**` -> `http://localhost:8080`. This keeps the build pipeline simple.

---

## 4. User Roles

| Role | Polish Name | Capabilities |
|------|-------------|--------------|
| **Admin** | Administrator systemu | Manages helicopters, crew, landing sites, users |
| **Planner** | Osoba planujaca | Creates and monitors flight operations |
| **Supervisor** | Osoba nadzorujaca | Approves/rejects operations and orders |
| **Pilot** | Pilot | Creates flight orders, reports completion |

### Menu Permissions

| Role | Administration | Operations | Orders |
|------|:--------------:|:----------:|:------:|
| Admin | create / edit / view | view | view |
| Planner | none | create / edit / view | none |
| Supervisor | view | create / edit / view | edit / view |
| Pilot | view | view | create / edit / view |

---

## 5. User Stories

- **a)** As a **planner**, I want to submit a planned flight operation so that the inspection of a given power-line section gets scheduled.
- **b)** As a **planner**, I want to see the current status of my submitted operations to track whether and when a flight is planned.
- **c)** As a **planner**, I want to cancel a planned operation if it is no longer needed.
- **d)** As a **supervisor**, I want to set statuses and dates on operations to approve/reject them and tentatively plan flights given available resources.
- **e)** As a **pilot**, I want to create a flight order for one or more confirmed operations, selecting departure/arrival landing sites, with a route length calculation and simplified map display.
- **f)** As a **pilot**, I want to assign a helicopter and crew members to the order, with the system checking required conditions (inspections, licenses, training, weight, range).
- **g)** As a **supervisor**, I want to approve or reject flight orders.
- **h)** As a **pilot**, I want to report what was completed, how long and how far the flight was, to close out operations.
- **i)** As an **admin**, I want to manage helicopters, crew members, and landing sites to keep the system current.

---

## 6. Functional Requirements

### 6.1. Helicopters

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Registration number | text | yes | max 30 chars, **unique** |
| Helicopter type | text | yes | max 100 chars |
| Description | text | no | max 100 chars |
| Max crew count | integer | yes | 1-10 |
| Max crew weight | integer | yes | 1-1000 kg |
| Status | choice | yes | ACTIVE / INACTIVE |
| Inspection expiry date | date | yes (if ACTIVE) | - |
| Range (no landing) | integer | yes | 1-1000 km |

**List view**: Menu -> Helicopters. Sorted by status then registration number.

### 6.2. Crew Members

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| First name | text | yes | max 100 chars |
| Last name | text | yes | max 100 chars |
| Email / login | text | yes | max 100 chars, valid email, **unique** |
| Weight | integer | yes | 30-200 kg |
| Role | choice | yes | Pilot / Observer |
| Pilot license number | text | yes (if Pilot) | max 30 chars |
| License expiry date | date | yes (if Pilot) | - |
| Training expiry date | date | yes | - |

**List view**: Menu -> Crew Members. Sorted by email.

### 6.3. Landing Sites

| Field | Type | Required |
|-------|------|----------|
| Name | text | yes |
| Coordinates | lat/lng | yes |

**List view**: Menu -> Landing Sites. Sorted by name.

### 6.4. Users

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| First name | text | yes | max 100 chars |
| Last name | text | yes | max 100 chars |
| Email / login | text | yes | max 100 chars, valid email, **unique** |
| Role | choice | yes | Admin / Planner / Supervisor / Pilot |

**List view**: Menu -> Users. Sorted by email.

### 6.5. Flight Operations

#### Data fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Operation number | auto | auto | sequential |
| Order/project number | text | yes | max 30 chars |
| Short description | text | yes | max 100 chars |
| KML points / route | KML file | yes | 1 file, max 5000 points, Poland territory |
| Proposed dates (earliest/latest) | date | no | - |
| Activity types | multi-select | yes | min 1 from dictionary |
| Additional info | text | no | max 500 chars |
| Route length (km) | integer | auto | calculated via Haversine formula |
| Planned dates (earliest/latest) | date | no | - |
| Comments | text list | no | append-only, max 500 chars each |
| Change history | auto | auto | field, old/new value, user, timestamp |
| Status | choice | yes | see table below |
| Created by | email | auto | current user |
| Contacts | email list | no | - |
| Post-completion notes | text | no | max 500 chars |

#### Operation statuses

| Code | Status (EN) | Status (PL) |
|------|-------------|-------------|
| 1 | SUBMITTED | Wprowadzone |
| 2 | REJECTED | Odrzucone |
| 3 | CONFIRMED | Potwierdzone do planu |
| 4 | SCHEDULED | Zaplanowane do zlecenia |
| 5 | PARTIALLY_COMPLETED | Czesciowo zrealizowane |
| 6 | COMPLETED | Zrealizowane |
| 7 | CANCELLED | Rezygnacja |

#### Status transitions

- **Supervisor** (status = 1): Reject (1->2), Confirm (1->3, requires planned dates)
- **Planner** (status 1/3/4): Cancel (->7)
- **Automatic** via orders: 3->4 (scheduled), 4->5 (partial), 4->6 (complete), 4->3 (not completed)

#### Role-based editing

- **Planner**: can edit in statuses 1,2,3,4,5 — cannot edit planned dates, status, post-completion notes
- **Supervisor**: can edit all fields in all statuses

### 6.6. Flight Orders

#### Data fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Order number | auto | auto | sequential |
| Planned departure | datetime | yes | - |
| Planned arrival | datetime | yes | - |
| Pilot | single select | yes | from crew members with Pilot role |
| Status | choice | yes | see table below |
| Helicopter | single select | yes | ACTIVE helicopters only |
| Crew members | multi-select | no | any role |
| Crew weight | integer | auto | sum of pilot + crew weights |
| Departure site | single select | yes | from landing sites |
| Arrival site | single select | yes | from landing sites |
| Selected operations | multi-select | yes | operations with status CONFIRMED |
| Estimated route length | integer | auto | sum of operation route lengths |
| Actual departure/arrival | datetime | before status 5/6 | - |

#### Order statuses

| Code | Status (EN) | Status (PL) |
|------|-------------|-------------|
| 1 | SUBMITTED | Wprowadzone |
| 2 | SENT_FOR_APPROVAL | Przekazane do akceptacji |
| 3 | REJECTED | Odrzucone |
| 4 | APPROVED | Zaakceptowane |
| 5 | PARTIALLY_COMPLETED | Zrealizowane w czesci |
| 6 | COMPLETED | Zrealizowane w calosci |
| 7 | NOT_COMPLETED | Nie zrealizowane |

#### 5 Blocking Validation Rules

| # | Rule |
|---|------|
| 1 | Helicopter inspection expiry >= planned departure date |
| 2 | Pilot license expiry >= planned departure date |
| 3 | All crew training expiry >= planned departure date |
| 4 | Sum of crew weights <= helicopter max crew weight |
| 5 | Estimated route length <= helicopter range |

#### Status cascading (pilot marks order final)

| Pilot action | Order status | All linked operations |
|--------------|-------------|----------------------|
| Completed | 4 -> 6 | all -> 6 (COMPLETED) |
| Partially completed | 4 -> 5 | all -> 5 (PARTIALLY_COMPLETED) |
| Not completed | 4 -> 7 | all -> 3 (back to CONFIRMED) |

---

## 7. Non-Functional Requirements

### Security
- **Authentication**: email + password, session-based (JSESSIONID cookie)
- **Authorization**: role-based, enforced at URL and field level

### Performance
- No formal requirements. E2E performance tests monitor API response times and page load speeds.

### Out of Scope
- Automatic optimal route calculation
- Automatic estimated flight length calculation
- Additional validations beyond the 5 blocking rules

### Demo Success Criteria (MVP)
- At least 2 user roles (planner + supervisor)
- Operations list with editing by planner and status changes by supervisor

---

---

# AERO — System ewidencji operacji lotniczych (PL)

Aplikacja webowa do **ewidencji planowanych operacji lotniczych** oraz **przygotowania zlecenia na lot helikopterem**.

System wspiera pelny cykl zycia operacji lotniczej — od zgłoszenia przez osobe planujaca, przez zatwierdzenie przez osobe nadzorujaca, az po realizacje i raportowanie przez pilota.

---

## 1. Opis ogolny

- Potrzeba aplikacji www do ewidencji i planowania operacji lotniczych.
- Potrzeba logiki pokazujacej na mapie miejsce wykonania lotu.
- Potrzeba logiki sprawdzajacej procedury podczas tworzenia / potwierdzenia zlecenia na lot.

**Cel**: Wsparcie procesu zbierania planowanych operacji oraz bezposredniego przygotowania zlecenia na lot.

---

## 2. Uzytkownicy docelowi

| Rola | Opis |
|------|------|
| **Osoba planujaca** (DE / CJI) | Wprowadza i monitoruje status planowanych operacji lotniczych |
| **Osoba nadzorujaca** (DB) | Nadzoruje i zmienia status planowanych operacji lotniczych oraz akceptuje / odrzuca zlecenie na lot |
| **Pilot** | Planuje zlecenie na lot i raportuje stopien realizacji operacji |
| **Administrator systemu** | Wprowadza konfiguracje (helikoptery, zaloga, ladowiska, uzytkownicy) |

---

## 3. User Stories

- **a)** Jako **osoba planujaca**, chce wprowadzic planowana operacje lotnicza, aby lot wskazanego odcinka linii zostal zaplanowany.
- **b)** Jako **osoba planujaca**, chce odczytywac aktualny stan planowanych operacji lotniczych, ktore wprowadzilem, aby sledzic kiedy jest planowana operacja lotnicza i jakie sa szanse na ten lot.
- **c)** Jako **osoba planujaca**, chce zrezygnowac z planowanej operacji lotniczej, ktore wprowadzilem, aby nie wykonywac lotu jesli jest juz zbedny.
- **d)** Jako **osoba nadzorujaca**, chce ustawiac status i daty planowanych operacji lotniczych, aby potwierdzac / odrzucac planowane operacje i wstepne planowac loty w kontekscie posiadanych srodkow.
- **e)** Jako **pilot**, chce wprowadzic zlecenie na lot do realizacji jednego lub wiecej planowanych operacji lotniczych z wybranym lotniskiem startu i ladowania z wyliczeniem dlugosci planowanego lotu i uproszczonym pokazaniem na mapie trasy przelotu, aby dobrac odpowiednie operacje lotnicze do zlecenia.
- **f)** Jako **pilot**, chce uzupelnic zlecenie na lot o wybor helikoptera i czlonkow zalogi ze sprawdzeniem niezbednych warunkow, aby zlecenie na lot spelnialo procedury.
- **g)** Jako **osoba nadzorujaca**, chce ustawiac status zlecenia na lot, aby potwierdzac / odrzucac zlecenie na lot.
- **h)** Jako **pilot**, chce wprowadzic co z planowanej operacji lotniczej zostalo zrealizowane, ile czasu i km trwal lot, aby zaraportowac stan wykonania zadania.
- **i)** Jako **administrator systemu**, chce edytowac aktualne informacje dotyczace floty helikopterow, czlonkow zalogi oraz lotnisk, aby system dzialal w sposob planowany i aktualny.

---

## 4. Funkcje obowiazkowe

### 4.1. Helikopter

| Pole | Typ | Wymagalnosc | Ograniczenia |
|------|-----|-------------|--------------|
| Numer rejestracyjny | tekst | obowiazkowe | do 30 znakow, **unikalny** |
| Typ helikoptera | tekst | obowiazkowe | do 100 znakow |
| Opis | tekst | opcjonalne | do 100 znakow |
| Maks. liczba czlonkow zalogi | liczba calkowita | obowiazkowe | 1-10 |
| Maks. udzwig czlonkow zalogi | liczba calkowita | obowiazkowe | 1-1000 kg |
| Status | wybor | obowiazkowe | aktywny / nieaktywny |
| Data waznosci przegladu | data | obowiazkowe dla statusu *aktywny* | - |
| Zasieg bez ladowania | liczba calkowita | obowiazkowe | 1-1000 km |

### 4.2. Czlonkowie zalogi

| Pole | Typ | Wymagalnosc | Ograniczenia |
|------|-----|-------------|--------------|
| Imie | tekst | obowiazkowe | do 100 znakow |
| Nazwisko | tekst | obowiazkowe | do 100 znakow |
| Email / login | tekst | obowiazkowe | do 100 znakow, walidacja email, **unikalny** |
| Waga | liczba calkowita | obowiazkowe | 30-200 kg |
| Rola | wybor jednokrotny | obowiazkowe | Pilot / Obserwator |
| Nr licencji pilota | tekst | obowiazkowe dla roli *Pilot* | do 30 znakow |
| Data waznosci licencji | data | obowiazkowe dla roli *Pilot* | - |
| Data waznosci szkolenia | data | obowiazkowe | - |

### 4.3. Ladowiska planowe

| Pole | Typ | Wymagalnosc |
|------|-----|-------------|
| Nazwa | tekst | obowiazkowe |
| Wspolrzedne | wspolrzedne | obowiazkowe |

### 4.4. Uzytkownicy

| Pole | Typ | Wymagalnosc | Ograniczenia |
|------|-----|-------------|--------------|
| Imie | tekst | obowiazkowe | do 100 znakow |
| Nazwisko | tekst | obowiazkowe | do 100 znakow |
| Email / login | tekst | obowiazkowe | do 100 znakow, walidacja email, **unikalny** |
| Rola | wybor jednokrotny | obowiazkowe | Administrator / Osoba planujaca / Osoba nadzorujaca / Pilot |

### 4.5. Planowana operacja lotnicza

**Tabela statusow:**

| Kod | Status |
|-----|--------|
| 1 | Wprowadzone |
| 2 | Odrzucone |
| 3 | Potwierdzone do planu |
| 4 | Zaplanowane do zlecenia |
| 5 | Czesciowo zrealizowane |
| 6 | Zrealizowane |
| 7 | Rezygnacja |

**Przejscia statusow:**
- Osoba nadzorujaca (status=1): Odrzuc (1->2), Potwierdz do planu (1->3, wymaga planowanych dat)
- Osoba planujaca (status 1/3/4): Rezygnuj (->7)
- Automatyczne przez zlecenia: 3->4, 4->5, 4->6, 4->3

### 4.6. Zlecenia na lot

**Tabela statusow:**

| Kod | Status |
|-----|--------|
| 1 | Wprowadzone |
| 2 | Przekazane do akceptacji |
| 3 | Odrzucone |
| 4 | Zaakceptowane |
| 5 | Zrealizowane w czesci |
| 6 | Zrealizowane w calosci |
| 7 | Nie zrealizowane |

**5 regul blokujacych zapis:**

| # | Regula |
|---|--------|
| 1 | Helikopter bez waznego przegladu na dzien lotu |
| 2 | Pilot bez waznej licencji na dzien lotu |
| 3 | Czlonek zalogi bez waznego szkolenia na dzien lotu |
| 4 | Waga zalogi przekraczajaca maksymalny udzwig helikoptera |
| 5 | Szacowana dlugosc trasy wieksza niz zasieg helikoptera |

**Kaskadowanie statusow (pilot zamyka zlecenie):**

| Akcja pilota | Status zlecenia | Powiazane operacje |
|-------------|----------------|-------------------|
| Zrealizowane w calosci | 4 -> 6 | wszystkie -> 6 |
| Zrealizowane w czesci | 4 -> 5 | wszystkie -> 5 |
| Nie zrealizowane | 4 -> 7 | wszystkie -> 3 |

---

## 5. Wymagania niefunkcjonalne

### Uprawnienia do menu

| Rola | Administracja | Planowanie operacji | Zlecenia na lot |
|------|:-------------:|:-------------------:|:---------------:|
| Administrator systemu | tworzenie / edycja / podglad | podglad | podglad |
| Osoba planujaca | brak | tworzenie / edycja / podglad | brak |
| Osoba nadzorujaca | podglad | tworzenie / edycja / podglad | edycja / podglad |
| Pilot | podglad | podglad | tworzenie / edycja / podglad |

### Bezpieczenstwo

- **Uwierzytelnianie**: login + haslo (sesja JSESSIONID)
- **Kontrola dostepu**: zgodnie z uprawnieniami do menu

### Poza zakresem

- Automatyczne wyliczanie szacowanej dlugosci przelotu
- Automatyczne pokazywanie optymalnej trasy
- Inne walidacje

### Demo — kryteria sukcesu (MVP)

- Co najmniej 2 rodzaje uzytkownikow (osoba planujaca + nadzorujaca)
- Lista operacji z edycja przez osobe planujaca i zmiana statusu przez osobe nadzorujaca
