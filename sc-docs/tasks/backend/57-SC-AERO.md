# 57-SC-AERO: OrderController + DTOs

**Phase**: 4 — Orders
**Depends on**: 53-SC-AERO, 54-SC-AERO, 55-SC-AERO, 56-SC-AERO
**Ref**: implementation-plan.md § 4.3

## Description
Create the REST API layer for flight orders. Define request and response DTOs with Jakarta Bean Validation for input and comprehensive field mapping for output, including nested summaries of helicopter, pilot, crew, operations (with kml points for map rendering), and landing sites. The list response uses a reduced field set. Build the controller with endpoints for CRUD and status transitions.

## Acceptance Criteria
- [ ] `OrderRequest` DTO has fields: plannedDeparture, plannedArrival, helicopterId, crewMemberIds (Set<Long>), departureSiteId, arrivalSiteId, operationIds (Set<Long>), estimatedRouteLengthKm (auto but accepted), actualDeparture (nullable), actualArrival (nullable) — with Jakarta validation
- [ ] `OrderResponse` DTO has all fields plus: nested helicopter summary, pilot name, crew list, operations list (with kmlPoints for map), departure/arrival site details, status with Polish label, auto-calculated crewWeightKg and estimatedRouteLengthKm
- [ ] `OrderListResponse` DTO has: id (display number), plannedDeparture, helicopter registration, pilot name, status with label
- [ ] `OrderController` at `/api/orders` exposes:
  - GET / — list with optional status filter, sorted by plannedDeparture ASC
  - GET /{id} — full detail including operation kml points for map rendering
  - POST / — create order
  - PUT /{id} — update order
  - POST /{id}/status — status transition
- [ ] All endpoints return correct response structures
- [ ] List has correct default filter (SENT_FOR_APPROVAL) and sort (plannedDeparture ASC)

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/dto/OrderRequest.java
- backend/src/main/java/com/nullterrier/aero/dto/OrderResponse.java
- backend/src/main/java/com/nullterrier/aero/dto/OrderListResponse.java
- backend/src/main/java/com/nullterrier/aero/controller/OrderController.java
