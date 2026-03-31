# 52-SC-AERO: OrderStatus enum + FlightOrder entity + repository

**Phase**: 4 — Orders
**Depends on**: 5-SC-AERO, 15-SC-AERO, 19-SC-AERO, 23-SC-AERO, 35-SC-AERO
**Ref**: implementation-plan.md § 4.1

## Description
Create the flight order domain model. Define the `OrderStatus` enum with seven lifecycle states, integer codes, and Polish labels. Build the `FlightOrder` Couchbase document with scheduling details, helicopter and crew references, departure/arrival site references, auto-calculated fields (crew weight, estimated route length), and actual flight times. The document uses two embedded lists: one for crew member IDs and one for operation IDs. The document `id` doubles as the display number. Create the repository with filtering and sorting support.

## Acceptance Criteria
- [ ] `OrderStatus` enum defines: SUBMITTED(1), SENT_FOR_APPROVAL(2), REJECTED(3), APPROVED(4), PARTIALLY_COMPLETED(5), COMPLETED(6), NOT_COMPLETED(7) — with int code and Polish label
- [ ] `FlightOrder` entity has fields: id (Long PK, used as display number), plannedDeparture (LocalDateTime), plannedArrival (LocalDateTime), pilotId (FK to crew_members), status (OrderStatus, default SUBMITTED), helicopterId (FK to helicopters), crewWeightKg (int, calculated), departureSiteId (FK to landing_sites), arrivalSiteId (FK to landing_sites), estimatedRouteLengthKm (int, calculated), actualDeparture (LocalDateTime, nullable), actualArrival (LocalDateTime, nullable), createdAt, updatedAt
- [ ] Embedded list of crewMember IDs stored within the document
- [ ] Embedded list of operation IDs stored within the document
- [ ] `FlightOrderRepository` extends `CouchbaseRepository<FlightOrder, Long>` with filtering by status and sorting by plannedDeparture
- [ ] Backend compiles successfully
- [ ] All documents and indexes are created on startup

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/domain/OrderStatus.java
- backend/src/main/java/com/nullterrier/aero/domain/FlightOrder.java
- backend/src/main/java/com/nullterrier/aero/repository/FlightOrderRepository.java
