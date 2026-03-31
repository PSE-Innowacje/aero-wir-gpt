# 15-SC-AERO: Helicopter entity + HelicopterStatus enum + repository

**Phase**: 2 — Admin CRUD
**Depends on**: 5-SC-AERO
**Ref**: implementation-plan.md § 2.2

## Description
Create the helicopter domain model. Define a status enum to track whether a helicopter is active or inactive. Build the Couchbase document with registration details, operational limits, inspection tracking, and range information. Provide a Spring Data repository for persistence.

## Acceptance Criteria
- [ ] `HelicopterStatus` enum defines: ACTIVE, INACTIVE
- [ ] `Helicopter` entity has fields: id (Long, auto-generated), registrationNumber (unique, max 30), type (max 100), description (max 100, nullable), maxCrewCount (1-10), maxCrewWeightKg (1-1000), status (HelicopterStatus), inspectionExpiryDate (nullable), rangeKm (1-1000)
- [ ] `HelicopterRepository` extends `CouchbaseRepository<Helicopter, Long>`
- [ ] Backend compiles successfully
- [ ] `helicopters` table is created on application startup

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/domain/HelicopterStatus.java
- backend/src/main/java/com/nullterrier/aero/domain/Helicopter.java
- backend/src/main/java/com/nullterrier/aero/repository/HelicopterRepository.java
