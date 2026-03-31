# 28-SC-AERO: User management types + API functions

**Phase**: 2 — Admin CRUD
**Depends on**: 9-SC-AERO
**Ref**: implementation-plan.md § 2.5

## Description

Define TypeScript interfaces for user management data (separate from the auth `User` type). The `UserDetail` type represents the admin-facing user management view, while `UserRequest` handles create and update payloads. Implement typed API functions for all user CRUD operations.

## Acceptance Criteria

- [ ] `UserDetail` interface is defined separately from the auth `User` type (admin management context)
- [ ] `UserRequest` interface matches the backend request DTO
- [ ] `getAll()` returns `UserDetail[]`
- [ ] `getById(id)` returns a single `UserDetail`
- [ ] `create(req)` accepts `UserRequest` and returns `UserDetail`
- [ ] `update(id, req)` accepts an ID and `UserRequest` and returns `UserDetail`
- [ ] All functions use the shared Axios instance

## Files to Create/Modify

- `frontend/src/types/user.ts`
- `frontend/src/api/users.ts`
