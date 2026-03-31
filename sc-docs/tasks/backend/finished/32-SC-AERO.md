# 32-SC-AERO: Admin CRUD role-based security

**Phase**: 2 — Admin CRUD
**Depends on**: 6-SC-AERO, 16-SC-AERO, 20-SC-AERO, 24-SC-AERO, 27-SC-AERO
**Ref**: implementation-plan.md § 2.6

## Description
Apply role-based access control to the admin CRUD controllers. ADMIN users get full CRUD access to all admin entities. SUPERVISOR and PILOT users can read (GET) admin entities but cannot create or modify them. PLANNER users are denied access to all admin endpoints entirely. Implement via `@PreAuthorize` annotations or SecurityConfig URL-based rules.

## Acceptance Criteria
- [ ] ADMIN role has full CRUD access (GET, POST, PUT) on helicopters, crew members, landing sites, and users
- [ ] SUPERVISOR role has GET-only access on all admin entities
- [ ] PILOT role has GET-only access on all admin entities
- [ ] PLANNER role receives 403 on all admin entity endpoints (GET, POST, PUT)
- [ ] `POST /api/helicopters` as PLANNER returns 403
- [ ] `GET /api/helicopters` as SUPERVISOR returns 200
- [ ] `POST /api/helicopters` as ADMIN returns 201

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/config/SecurityConfig.java
- backend/src/main/java/pl/pse/aero/controller/HelicopterController.java
- backend/src/main/java/pl/pse/aero/controller/CrewMemberController.java
- backend/src/main/java/pl/pse/aero/controller/LandingSiteController.java
- backend/src/main/java/pl/pse/aero/controller/UserController.java
