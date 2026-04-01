# 17-SC-AERO: Helicopter types + API functions

**Phase**: 2 — Admin CRUD
**Depends on**: 9-SC-AERO
**Ref**: implementation-plan.md § 2.2

## Description

Define TypeScript interfaces for helicopter data matching the backend HelicopterResponse and HelicopterRequest DTOs. Implement typed API functions for all helicopter CRUD operations using the shared Axios instance.

## Acceptance Criteria

- [ ] `Helicopter` interface matches all fields from the backend `HelicopterResponse` DTO
- [ ] `HelicopterRequest` interface matches the backend `HelicopterRequest` DTO
- [ ] `getAll()` returns `Helicopter[]`
- [ ] `getById(id)` returns a single `Helicopter`
- [ ] `create(req)` accepts `HelicopterRequest` and returns `Helicopter`
- [ ] `update(id, req)` accepts an ID and `HelicopterRequest` and returns `Helicopter`
- [ ] All functions use the shared Axios instance

## Files to Create/Modify

- `frontend/src/types/helicopter.ts`
- `frontend/src/api/helicopters.ts`
