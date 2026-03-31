# 52-SC-AERO: OrderStatus enum + FlightOrder entity + repository

**Phase**: 4 — Orders
**Depends on**: 5-SC-AERO, 15-SC-AERO, 19-SC-AERO, 23-SC-AERO, 35-SC-AERO
**Ref**: implementation-plan.md § 4.1

## Description
Create the flight order domain model. Define the `OrderStatus` enum with seven lifecycle states, integer codes, and Polish labels. Build the `FlightOrder` JPA entity with scheduling details, helicopter and crew references, departure/arrival site foreign keys, auto-calculated fields (crew weight, estimated route length), and actual flight times. The entity uses two `@ManyToMany` join tables: one for crew members and one for operations. The entity `id` doubles as the display number. Create the repository with filtering and sorting support.

## Acceptance Criteria
- [ ] `OrderStatus` enum defines: SUBMITTED(1), SENT_FOR_APPROVAL(2), REJECTED(3), APPROVED(4), PARTIALLY_COMPLETED(5), COMPLETED(6), NOT_COMPLETED(7) — with int code and Polish label
- [ ] `FlightOrder` entity has fields: id (Long PK, used as display number), plannedDeparture (LocalDateTime), plannedArrival (LocalDateTime), pilotId (FK to crew_members), status (OrderStatus, default SUBMITTED), helicopterId (FK to helicopters), crewWeightKg (int, calculated), departureSiteId (FK to landing_sites), arrivalSiteId (FK to landing_sites), estimatedRouteLengthKm (int, calculated), actualDeparture (LocalDateTime, nullable), actualArrival (LocalDateTime, nullable), createdAt, updatedAt
- [ ] `@ManyToMany` crewMembers via `flight_order_crew_members` join table
- [ ] `@ManyToMany` operations via `flight_order_operations` join table
- [ ] `FlightOrderRepository` extends `JpaRepository<FlightOrder, Long>` with filtering by status and sorting by plannedDeparture
- [ ] Backend compiles successfully
- [ ] All tables including both join tables are created on startup

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/domain/OrderStatus.java
- backend/src/main/java/com/nullterrier/aero/domain/FlightOrder.java
- backend/src/main/java/com/nullterrier/aero/repository/FlightOrderRepository.java
