# 21-SC-AERO: CrewMember types + API functions

**Phase**: 2 — Admin CRUD
**Depends on**: 9-SC-AERO
**Ref**: implementation-plan.md § 2.3

## Description

Define TypeScript interfaces for crew member data matching the backend DTOs. Implement typed API functions for CRUD operations and a dedicated function for fetching crew members filtered by role (used when assigning pilots to flight orders).

## Acceptance Criteria

- [ ] `CrewMember` interface matches all fields from the backend crew member response DTO
- [ ] `CrewMemberRequest` interface matches the backend request DTO
- [ ] `getAll()` returns `CrewMember[]`
- [ ] `getById(id)` returns a single `CrewMember`
- [ ] `create(req)` accepts `CrewMemberRequest` and returns `CrewMember`
- [ ] `update(id, req)` accepts an ID and `CrewMemberRequest` and returns `CrewMember`
- [ ] `getByRole(role)` filters crew members by role (used for pilot selection)
- [ ] All functions use the shared Axios instance

## Files to Create/Modify

- `frontend/src/types/crew.ts`
- `frontend/src/api/crew.ts`
