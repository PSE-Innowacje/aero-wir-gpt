# 23-SC-AERO: LandingSite entity + repository

**Phase**: 2 — Admin CRUD
**Depends on**: 5-SC-AERO
**Ref**: implementation-plan.md § 2.4

## Description
Create the landing site domain model. Build a JPA entity representing a named geographic location with latitude and longitude coordinates. Provide a Spring Data repository for persistence.

## Acceptance Criteria
- [ ] `LandingSite` entity has fields: id (Long, auto-generated), name (not blank), latitude (double), longitude (double)
- [ ] `LandingSiteRepository` extends `JpaRepository<LandingSite, Long>`
- [ ] Backend compiles successfully
- [ ] `landing_sites` table is created on application startup

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/domain/LandingSite.java
- backend/src/main/java/com/nullterrier/aero/repository/LandingSiteRepository.java
