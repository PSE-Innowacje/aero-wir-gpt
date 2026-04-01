# 25-SC-AERO: LandingSite types + API functions

**Phase**: 2 — Admin CRUD
**Depends on**: 9-SC-AERO
**Ref**: implementation-plan.md § 2.4

## Description

Define TypeScript interfaces for landing site data matching the backend DTOs. Implement typed API functions for all landing site CRUD operations using the shared Axios instance.

## Acceptance Criteria

- [ ] `LandingSite` interface matches all fields from the backend landing site response DTO
- [ ] `LandingSiteRequest` interface matches the backend request DTO
- [ ] `getAll()` returns `LandingSite[]`
- [ ] `getById(id)` returns a single `LandingSite`
- [ ] `create(req)` accepts `LandingSiteRequest` and returns `LandingSite`
- [ ] `update(id, req)` accepts an ID and `LandingSiteRequest` and returns `LandingSite`
- [ ] All functions use the shared Axios instance

## Files to Create/Modify

- `frontend/src/types/landingSite.ts`
- `frontend/src/api/landingSites.ts`
