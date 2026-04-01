# 9-SC-AERO: Axios instance + auth types + auth API

**Phase**: 1 — Auth
**Depends on**: 4-SC-AERO
**Ref**: implementation-plan.md § 1.3

## Description

Set up the foundational HTTP client layer and authentication API functions. Create a shared Axios instance configured to send session cookies with every request (required for Spring Security session-based auth). Define TypeScript types for authentication payloads and user data. Implement typed API functions for login, logout, and session validation.

## Acceptance Criteria

- [ ] Axios instance is configured with `withCredentials: true` to send the JSESSIONID cookie
- [ ] Axios instance uses an empty base URL (Vite proxy handles `/api` routing)
- [ ] `LoginRequest`, `User`, and `UserRole` types are defined and exported
- [ ] `UserRole` is a union type of `'ADMIN' | 'PLANNER' | 'SUPERVISOR' | 'PILOT'`
- [ ] `login(req)`, `logout()`, and `getMe()` functions are implemented and properly typed
- [ ] All API functions use the shared Axios instance

## Files to Create/Modify

- `frontend/src/api/axiosInstance.ts`
- `frontend/src/types/auth.ts`
- `frontend/src/api/auth.ts`
