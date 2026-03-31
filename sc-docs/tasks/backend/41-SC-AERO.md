# 41-SC-AERO: OperationController + DTOs

**Phase**: 3 — Operations
**Depends on**: 38-SC-AERO, 39-SC-AERO, 40-SC-AERO
**Ref**: implementation-plan.md § 3.4

## Description
Create the REST API layer for flight operations. Define request and response DTOs with Jakarta Bean Validation for input and comprehensive field mapping for output. The list response uses a reduced field set for performance. Build the controller with endpoints for CRUD, status transitions, and comments. The detail endpoint returns all nested data including comments, history, activity types, contacts, kml points, and linked order IDs.

## Acceptance Criteria
- [ ] `OperationRequest` DTO has fields: orderNumber, shortDescription, activityTypes (Set), proposedDateEarliest, proposedDateLatest, additionalInfo, plannedDateEarliest, plannedDateLatest, contactEmails (Set), postCompletionNotes — with Jakarta validation annotations
- [ ] `OperationResponse` DTO has all fields including: id (used as display number), comments list, history list, activityTypes, contactEmails, kmlPoints (List of [lat,lng]), linkedOrderIds, status with Polish label
- [ ] `OperationListResponse` DTO has a subset of fields suitable for list view
- [ ] `StatusChangeRequest` DTO has: action (String)
- [ ] `CommentRequest` DTO has: content (String, validated)
- [ ] `OperationController` at `/api/operations` exposes:
  - GET / — list with optional status filter, sorted by plannedDateEarliest ASC
  - GET /{id} — full detail with all nested data
  - POST / — create operation
  - PUT /{id} — update operation
  - POST /{id}/status — change status
  - POST /{id}/comments — add comment
- [ ] List endpoint returns correct default filter (CONFIRMED) and sort (plannedDateEarliest ASC)
- [ ] Detail endpoint includes all nested data (comments, history, activity types, contacts, kml points, linked orders)

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/dto/OperationRequest.java
- backend/src/main/java/com/nullterrier/aero/dto/OperationResponse.java
- backend/src/main/java/com/nullterrier/aero/dto/OperationListResponse.java
- backend/src/main/java/com/nullterrier/aero/dto/StatusChangeRequest.java
- backend/src/main/java/com/nullterrier/aero/dto/CommentRequest.java
- backend/src/main/java/com/nullterrier/aero/controller/OperationController.java
