# 53-SC-AERO: OrderService — CRUD + auto-fill + auto-calc

**Phase**: 4 — Orders
**Depends on**: 52-SC-AERO
**Ref**: implementation-plan.md § 4.2

## Description
Create the main service layer for flight orders. Implement list retrieval with status filtering (default: SENT_FOR_APPROVAL) and sorting (default: plannedDeparture ASC), full detail retrieval including nested crew, operations with kml points, helicopter, and landing sites, creation with automatic pilot assignment and calculated fields, and update with recalculation of auto fields. The create method auto-fills the pilot from the current user's linked crew member and auto-calculates crew weight and estimated route length.

## Acceptance Criteria
- [ ] `OrderService` provides `findAll(status filter, sort)` with default filter SENT_FOR_APPROVAL and sort by plannedDeparture ASC
- [ ] `findById(id)` returns order with nested crew members, operations (with kmlPoints from each), helicopter details, and landing site details
- [ ] `create(request, currentUser)` auto-fills pilotId from `currentUser.crewMemberId` (throws error if null — user has no linked crew member)
- [ ] `create` auto-calculates crewWeightKg as pilot weight + sum of selected crew members' weights
- [ ] `create` auto-calculates estimatedRouteLengthKm as sum of routeLengthKm from all selected operations
- [ ] `create` rejects operations whose status is not CONFIRMED
- [ ] `update(id, request, currentUser)` recalculates auto fields (weight, route length)
- [ ] Selecting a non-CONFIRMED operation is rejected with clear error

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/service/OrderService.java
