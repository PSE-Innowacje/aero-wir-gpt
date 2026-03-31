# 36-SC-AERO: OperationComment + OperationChangeHistory entities

**Phase**: 3 — Operations
**Depends on**: 35-SC-AERO
**Ref**: implementation-plan.md § 3.2

## Description
Create the two supporting entities for flight operation audit and collaboration features. `OperationComment` stores user-submitted comments on an operation. `OperationChangeHistory` records every field-level change made to an operation, capturing the old and new values as text for display in a history log. Both entities reference the parent `FlightOperation` via foreign key and auto-set their timestamp on creation.

## Acceptance Criteria
- [ ] `OperationComment` entity has fields: id (Long PK), operationId (FK to flight_operations), content (varchar 500), authorEmail (varchar 100), createdAt (LocalDateTime, auto-set on persist)
- [ ] `OperationChangeHistory` entity has fields: id (Long PK), operationId (FK to flight_operations), fieldName (varchar 100), oldValue (TEXT, nullable), newValue (TEXT, nullable), changedByEmail (varchar 100), changedAt (LocalDateTime, auto-set on persist)
- [ ] Both entities have correct foreign key relationships to `flight_operations`
- [ ] Backend compiles successfully
- [ ] `operation_comments` and `operation_change_history` tables are created on startup

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/domain/OperationComment.java
- backend/src/main/java/pl/pse/aero/domain/OperationChangeHistory.java
