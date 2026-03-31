# 45-SC-AERO: Operation types + API functions

**Phase**: 3 — Operations
**Depends on**: 9-SC-AERO
**Ref**: implementation-plan.md § 3.6

## Description

Define all TypeScript types for the flight operations domain and implement the corresponding API functions. The types must mirror the backend DTOs exactly, covering the full operation lifecycle including comments and change history. The API layer provides typed functions for CRUD operations, status transitions, comment management, and KML file handling (multipart upload and raw download).

## Acceptance Criteria

- [ ] `FlightOperation` interface includes all fields: id, orderNumber, shortDescription, kmlFilePath, kmlPoints (number[][]), proposedDateEarliest/Latest, activityTypes (string[]), additionalInfo, routeLengthKm, plannedDateEarliest/Latest, status, createdByEmail, contactEmails (string[]), postCompletionNotes, comments (OperationComment[]), changeHistory (ChangeHistoryEntry[]), linkedOrderIds (number[]), createdAt, updatedAt
- [ ] `OperationComment` interface includes: id, content, authorEmail, createdAt
- [ ] `ChangeHistoryEntry` interface includes: id, fieldName, oldValue, newValue, changedByEmail, changedAt
- [ ] `OperationRequest` interface includes all editable fields
- [ ] `OperationListItem` interface includes a subset of fields for list view
- [ ] `getAll(params?)` supports optional status filter
- [ ] `getById(id)` returns a fully typed `FlightOperation`
- [ ] `create(req)` and `update(id, req)` accept `OperationRequest`
- [ ] `changeStatus(id, action)` sends the status transition action
- [ ] `addComment(id, content)` posts a new comment
- [ ] `uploadKml(file: File)` sends multipart form data and returns `{ filePath, points, routeLengthKm }`
- [ ] `downloadKml(id)` triggers a raw file download
- [ ] All types match backend DTOs
- [ ] All API functions use the shared Axios instance and are fully typed

## Files to Create/Modify

- `frontend/src/types/operation.ts`
- `frontend/src/api/operations.ts`
