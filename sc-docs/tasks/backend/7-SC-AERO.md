# 7-SC-AERO: AuthController — login/logout/me + DTOs

**Phase**: 1 — Auth
**Depends on**: 5-SC-AERO, 6-SC-AERO
**Ref**: implementation-plan.md § 1.1

## Description
Implement the authentication REST endpoints for the SPA. Create request and response DTOs for login and user data. The login endpoint authenticates credentials via Spring's `AuthenticationManager`, creates a server-side session, and returns user details. The logout endpoint invalidates the session. The me endpoint returns the currently authenticated user's information.

## Acceptance Criteria
- [ ] `LoginRequest` DTO contains email and password fields
- [ ] `UserResponse` DTO contains id, email, firstName, lastName, and role fields
- [ ] `POST /api/auth/login` authenticates with `AuthenticationManager`, creates session, returns `UserResponse` JSON
- [ ] `POST /api/auth/login` sets JSESSIONID cookie on successful authentication
- [ ] `POST /api/auth/login` returns 401 for invalid credentials
- [ ] `POST /api/auth/logout` invalidates the session and returns 200
- [ ] `GET /api/auth/me` returns current user's `UserResponse` when authenticated
- [ ] `GET /api/auth/me` returns 401 when not authenticated

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/dto/LoginRequest.java
- backend/src/main/java/pl/pse/aero/dto/UserResponse.java
- backend/src/main/java/pl/pse/aero/controller/AuthController.java
