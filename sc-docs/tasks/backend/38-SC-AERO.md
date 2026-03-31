# 38-SC-AERO: OperationService — CRUD + role-based field editing

**Phase**: 3 — Operations
**Depends on**: 37-SC-AERO, 33-SC-AERO
**Ref**: implementation-plan.md § 3.3

## Description
Create the main service layer for flight operations. Implement list retrieval with status filtering (default: CONFIRMED) and sorting (default: plannedDateEarliest ASC), full detail retrieval including nested comments/history/activity types/contacts/kml points/linked order IDs, creation with KML processing and automatic field population, and update with role-based field restrictions. Planners can edit most fields across statuses 1-5 but cannot touch planned dates, status, post-completion notes, or auto-calculated fields. Supervisors have unrestricted field access across all statuses.

## Acceptance Criteria
- [ ] `OperationService` provides `findAll(status filter, sort)` with default filter CONFIRMED and sort by plannedDateEarliest ASC
- [ ] `findById(id)` returns operation with comments, history, activity types, contacts, kml points, and linked order IDs
- [ ] `create(request, currentUserEmail)` sets createdByEmail, calls KmlService to process KML, persists kml_points as JSON, calculates routeLengthKm, sets status to SUBMITTED
- [ ] `update(id, request, currentUser)` enforces role-based field restrictions:
  - Planner: can edit in statuses 1,2,3,4,5 but NOT planned dates, status, post-completion notes, or auto fields (id, routeKm, createdBy, history, linked orders)
  - Supervisor: all fields, all statuses
- [ ] Planner attempting to set planned dates is rejected with clear error
- [ ] Supervisor updating planned dates succeeds
- [ ] Create sets correct default values (status SUBMITTED, timestamps)

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/service/OperationService.java
