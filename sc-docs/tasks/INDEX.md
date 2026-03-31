# AERO — Implementation Tasks

68 atomic tasks organized by phase. Each task is in `backend/` or `frontend/` directory.

**Naming**: `X-SC-AERO.md` where X is sequential.
**Source**: `sc-docs/architecture.md` + `sc-docs/implementation-plan.md`

---

## Dependency Graph (simplified)

```
Phase 0: [1] → [2] → [3,4] (parallel)
Phase 1: [5] → [6,7] → [8] | [9] → [10] → [11,12]
Phase 2: [13,14] → per-entity chains → [32]
Phase 3: [33] → [34-37] → [38-43] | [45-51]  → [44]
Phase 4: [52] → [53-58] | [59-64]
Phase 5: [65-68] (independent)
```

---

## Phase 0 — Scaffolding

| Task | Dir | Title | Depends |
|------|-----|-------|---------|
| 1-SC-AERO | backend | Monorepo restructure | — |
| 2-SC-AERO | backend | Backend Spring Boot setup | 1 |
| 3-SC-AERO | backend | Docker Compose for PostgreSQL | 1 |
| 4-SC-AERO | frontend | Frontend scaffold (Vite + React + TS) | 1 |

## Phase 1 — Authentication & App Shell

| Task | Dir | Title | Depends |
|------|-----|-------|---------|
| 5-SC-AERO | backend | User entity + UserRole enum + repository | 2 |
| 6-SC-AERO | backend | SecurityConfig — session auth, CORS, CSRF | 5 |
| 7-SC-AERO | backend | AuthController — login/logout/me + DTOs | 5,6 |
| 8-SC-AERO | backend | DataInitializer — seed 4 default users | 5 |
| 9-SC-AERO | frontend | Axios instance + auth types + auth API | 4 |
| 10-SC-AERO | frontend | AuthContext + ProtectedRoute | 9 |
| 11-SC-AERO | frontend | LoginPage | 10 |
| 12-SC-AERO | frontend | Layout shell — sidebar, topbar, routing | 10 |

## Phase 2 — Admin CRUD

| Task | Dir | Title | Depends |
|------|-----|-------|---------|
| 13-SC-AERO | frontend | DataTable shared component | 12 |
| 14-SC-AERO | frontend | StatusBadge shared component | 4 |
| 15-SC-AERO | backend | Helicopter entity + enum + repository | 5 |
| 16-SC-AERO | backend | HelicopterService + Controller + DTOs | 15 |
| 17-SC-AERO | frontend | Helicopter types + API functions | 9 |
| 18-SC-AERO | frontend | HelicopterListPage + HelicopterFormPage | 13,17 |
| 19-SC-AERO | backend | CrewMember entity + enum + repository | 5 |
| 20-SC-AERO | backend | CrewMemberService + Controller + DTOs | 19 |
| 21-SC-AERO | frontend | CrewMember types + API functions | 9 |
| 22-SC-AERO | frontend | CrewListPage + CrewFormPage | 13,21 |
| 23-SC-AERO | backend | LandingSite entity + repository | 5 |
| 24-SC-AERO | backend | LandingSiteService + Controller + DTOs | 23 |
| 25-SC-AERO | frontend | LandingSite types + API functions | 9 |
| 26-SC-AERO | frontend | LandingSiteListPage + LandingSiteFormPage | 13,25 |
| 27-SC-AERO | backend | UserService + UserController + DTOs | 5,19 |
| 28-SC-AERO | frontend | User management types + API functions | 9 |
| 29-SC-AERO | frontend | UserListPage + UserFormPage | 13,28 |
| 30-SC-AERO | backend | DictionaryController — all lookups | 2 |
| 31-SC-AERO | frontend | Dictionary API functions + types | 9 |
| 32-SC-AERO | backend | Admin CRUD role-based security | 6,16,20,24,27 |

## Phase 3 — Flight Operations (MVP)

| Task | Dir | Title | Depends |
|------|-----|-------|---------|
| 33-SC-AERO | backend | KmlService — parse, validate, Haversine | 2 |
| 34-SC-AERO | backend | OperationStatus + ActivityType enums | 2 |
| 35-SC-AERO | backend | FlightOperation entity + kml_points JSON | 5,34 |
| 36-SC-AERO | backend | OperationComment + ChangeHistory entities | 35 |
| 37-SC-AERO | backend | FlightOperation join tables + repositories | 35,36 |
| 38-SC-AERO | backend | OperationService — CRUD + role-based editing | 37,33 |
| 39-SC-AERO | backend | OperationService — status state machine | 38 |
| 40-SC-AERO | backend | OperationService — change history tracking | 38 |
| 41-SC-AERO | backend | OperationController + DTOs | 38,39,40 |
| 42-SC-AERO | backend | KML upload + download endpoints | 33,41 |
| 43-SC-AERO | backend | Operations role-based endpoint security | 6,41 |
| 44-SC-AERO | backend | Synthetic KML + DataInitializer extension | 33,15,19,23 |
| 45-SC-AERO | frontend | Operation types + API functions | 9 |
| 46-SC-AERO | frontend | MapView shared component (react-leaflet) | 4 |
| 47-SC-AERO | frontend | OperationListPage | 13,14,45 |
| 48-SC-AERO | frontend | OperationFormPage — fields + KML upload + map | 45,46,31 |
| 49-SC-AERO | frontend | OperationFormPage — activities + contacts + comments | 48 |
| 50-SC-AERO | frontend | OperationFormPage — status buttons + field restrictions | 48 |
| 51-SC-AERO | frontend | OperationFormPage — linked orders display | 48 |

## Phase 4 — Flight Orders

| Task | Dir | Title | Depends |
|------|-----|-------|---------|
| 52-SC-AERO | backend | OrderStatus enum + FlightOrder entity + repository | 5,15,19,23,35 |
| 53-SC-AERO | backend | OrderService — CRUD + auto-fill + auto-calc | 52 |
| 54-SC-AERO | backend | OrderService — 5 validation rules | 53 |
| 55-SC-AERO | backend | OrderService — status transitions + actual dates | 53 |
| 56-SC-AERO | backend | OrderService — status cascading to operations | 55,39 |
| 57-SC-AERO | backend | OrderController + DTOs | 53,54,55,56 |
| 58-SC-AERO | backend | Orders role-based endpoint security | 6,57 |
| 59-SC-AERO | frontend | Order types + API functions | 9 |
| 60-SC-AERO | frontend | OrderListPage | 13,14,59 |
| 61-SC-AERO | frontend | OrderFormPage — base form + pilot + selectors | 59,31 |
| 62-SC-AERO | frontend | OrderFormPage — operations + auto-calc + map | 61,46 |
| 63-SC-AERO | frontend | OrderFormPage — live validation warnings | 62 |
| 64-SC-AERO | frontend | OrderFormPage — status buttons + actual dates | 61 |

## Phase 5 — Polish & Quality

| Task | Dir | Title | Depends |
|------|-----|-------|---------|
| 65-SC-AERO | backend | GlobalExceptionHandler | 2 |
| 66-SC-AERO | frontend | Error display — toast/snackbar | 9 |
| 67-SC-AERO | frontend | Loading spinners + empty states | 13 |
| 68-SC-AERO | frontend | Confirmation dialogs + dirty-state warnings | 12 |

---

## Summary

| Phase | Backend | Frontend | Total |
|-------|---------|----------|-------|
| 0 — Scaffolding | 3 | 1 | 4 |
| 1 — Auth + Shell | 4 | 4 | 8 |
| 2 — Admin CRUD | 10 | 10 | 20 |
| 3 — Operations (MVP) | 12 | 7 | 19 |
| 4 — Orders | 7 | 6 | 13 |
| 5 — Polish | 1 | 3 | 4 |
| **Total** | **37** | **31** | **68** |

## Critical Path to MVP

```
1 → 2 → 5 → 6 → 7 → 8  (backend auth)
1 → 4 → 9 → 10 → 12 → 13  (frontend shell)
5 → 15 → 16 → 32  (helicopters + security)
5 → 19 → 20  (crew)
5 → 23 → 24  (landing sites)
2 → 33 → 35 → 37 → 38 → 39 → 41 → 42  (operations backend)
9 → 45 → 48 → 49 → 50  (operations frontend)
4 → 46  (map component)
33 → 44  (test data)
```

MVP is reached when all Phase 0-3 tasks are complete.
