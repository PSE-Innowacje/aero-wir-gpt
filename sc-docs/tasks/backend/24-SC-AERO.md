# 24-SC-AERO: LandingSiteService + LandingSiteController + DTOs

**Phase**: 2 — Admin CRUD
**Depends on**: 23-SC-AERO
**Ref**: implementation-plan.md § 2.4

## Description
Implement the full CRUD API layer for landing sites. Create request and response DTOs with validation annotations. Build the service layer with sorted listing and expose RESTful endpoints for all CRUD operations.

## Acceptance Criteria
- [ ] `LandingSiteRequest` DTO uses Jakarta validation (name not blank, latitude/longitude not null)
- [ ] `LandingSiteResponse` DTO maps all entity fields
- [ ] `LandingSiteService` provides findAll (sorted by name), findById, create, update
- [ ] `LandingSiteController` at `/api/landing-sites` exposes: GET (list), GET /{id}, POST, PUT /{id}
- [ ] Full CRUD operations work for landing sites
- [ ] Validation errors return 400

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/dto/LandingSiteRequest.java
- backend/src/main/java/com/nullterrier/aero/dto/LandingSiteResponse.java
- backend/src/main/java/com/nullterrier/aero/service/LandingSiteService.java
- backend/src/main/java/com/nullterrier/aero/controller/LandingSiteController.java
