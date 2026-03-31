# 27-SC-AERO: UserService + UserController + DTOs

**Phase**: 2 — Admin CRUD
**Depends on**: 5-SC-AERO, 19-SC-AERO
**Ref**: implementation-plan.md § 2.5

## Description
Implement the user management API layer for admin use. Create request and response DTOs. Build the service layer with password hashing on create and the ability to link PILOT users to crew member records. Expose RESTful endpoints for listing, retrieving, creating, and updating users.

## Acceptance Criteria
- [ ] `UserRequest` DTO contains: firstName, lastName, email, password (for create), role, crewMemberId (nullable)
- [ ] `UserService` provides findAll (sorted by email), findById, create (hashes password with BCrypt), update (manages crewMemberId link for PILOTs)
- [ ] `UserController` at `/api/users` exposes: GET (list), GET /{id}, POST, PUT /{id}
- [ ] POST creates user with BCrypt-hashed password
- [ ] PILOT user can be linked to a crew member via crewMemberId
- [ ] Validation errors return 400

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/dto/UserRequest.java
- backend/src/main/java/com/nullterrier/aero/controller/UserController.java
- backend/src/main/java/com/nullterrier/aero/service/UserService.java
