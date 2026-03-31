# 20-SC-AERO: CrewMemberService + CrewMemberController + DTOs

**Phase**: 2 — Admin CRUD
**Depends on**: 19-SC-AERO
**Ref**: implementation-plan.md § 2.3

## Description
Implement the full CRUD API layer for crew members. Create request and response DTOs with Jakarta Bean Validation annotations including conditional validation: pilots must have a license number and license expiry date. Add email format validation. Build the service layer and expose RESTful endpoints.

## Acceptance Criteria
- [ ] `CrewMemberRequest` DTO uses Jakarta validation with conditional rule: if role is PILOT, pilotLicenseNumber and licenseExpiryDate are required
- [ ] `CrewMemberRequest` includes email regex validation
- [ ] `CrewMemberResponse` DTO maps all entity fields
- [ ] `CrewMemberService` provides findAll (sorted by email), findById, create, update
- [ ] `CrewMemberController` at `/api/crew-members` exposes: GET (list), GET /{id}, POST, PUT /{id}
- [ ] POST with valid data creates crew member
- [ ] POST for pilot without license number returns 400
- [ ] Invalid email format returns 400

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/dto/CrewMemberRequest.java
- backend/src/main/java/pl/pse/aero/dto/CrewMemberResponse.java
- backend/src/main/java/pl/pse/aero/service/CrewMemberService.java
- backend/src/main/java/pl/pse/aero/controller/CrewMemberController.java
