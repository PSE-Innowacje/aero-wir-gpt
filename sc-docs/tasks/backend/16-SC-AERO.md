# 16-SC-AERO: HelicopterService + HelicopterController + DTOs

**Phase**: 2 — Admin CRUD
**Depends on**: 15-SC-AERO
**Ref**: implementation-plan.md § 2.2

## Description
Implement the full CRUD API layer for helicopters. Create request and response DTOs with Jakarta Bean Validation annotations. Build a service layer with business logic including a conditional validation rule: active helicopters must have an inspection expiry date. Expose RESTful endpoints for listing, retrieving, creating, and updating helicopters.

## Acceptance Criteria
- [ ] `HelicopterRequest` DTO uses Jakarta validation: @NotBlank, @Size, @Min, @Max, @NotNull as appropriate
- [ ] `HelicopterResponse` DTO maps all entity fields
- [ ] `HelicopterService` provides findAll (sorted by status then registrationNumber), findById, create, update
- [ ] Validation rule: if status is ACTIVE, inspectionExpiryDate is required (returns error if missing)
- [ ] `HelicopterController` at `/api/helicopters` exposes: GET (list), GET /{id}, POST, PUT /{id}
- [ ] POST with valid data creates helicopter and returns 201
- [ ] GET returns list sorted by status then registrationNumber
- [ ] Validation errors return 400 with error details

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/dto/HelicopterRequest.java
- backend/src/main/java/com/nullterrier/aero/dto/HelicopterResponse.java
- backend/src/main/java/com/nullterrier/aero/service/HelicopterService.java
- backend/src/main/java/com/nullterrier/aero/controller/HelicopterController.java
