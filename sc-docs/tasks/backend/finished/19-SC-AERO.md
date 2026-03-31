# 19-SC-AERO: CrewMember entity + CrewRole enum + repository

**Phase**: 2 — Admin CRUD
**Depends on**: 5-SC-AERO
**Ref**: implementation-plan.md § 2.3

## Description
Create the crew member domain model. Define a role enum distinguishing pilots from observers. Build the Couchbase document with personal details, weight (used for helicopter load calculations), licensing information, and training certification tracking. Provide a repository with a role-based query method.

## Acceptance Criteria
- [ ] `CrewRole` enum defines: PILOT, OBSERVER
- [ ] `CrewMember` entity has fields: id (Long, auto-generated), firstName (max 100), lastName (max 100), email (unique, max 100), weightKg (30-200), role (CrewRole), pilotLicenseNumber (max 30, nullable), licenseExpiryDate (nullable), trainingExpiryDate (not null)
- [ ] `CrewMemberRepository` extends `CouchbaseRepository<CrewMember, Long>` with `findByRole(CrewRole role)` query method
- [ ] Backend compiles successfully
- [ ] `crew_members` table is created on application startup

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/domain/CrewRole.java
- backend/src/main/java/pl/pse/aero/domain/CrewMember.java
- backend/src/main/java/pl/pse/aero/repository/CrewMemberRepository.java
