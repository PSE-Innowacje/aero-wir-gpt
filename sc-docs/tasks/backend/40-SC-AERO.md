# 40-SC-AERO: OperationService — change history tracking

**Phase**: 3 — Operations
**Depends on**: 38-SC-AERO
**Ref**: implementation-plan.md § 3.3

## Description
Add automatic change history tracking to the `update()` method in OperationService. Before persisting an update, compare every editable field of the existing entity against the incoming request values. For each changed field, create an `OperationChangeHistory` entry recording the field name, old and new values serialized as strings, the email of the user who made the change, and the timestamp. Status changes are also recorded in history.

## Acceptance Criteria
- [ ] Before saving an update, old entity values are compared field-by-field with new request values
- [ ] For each changed field, an `OperationChangeHistory` entry is created with: fieldName, oldValue (as string), newValue (as string), changedByEmail, changedAt
- [ ] Status changes are recorded in the change history
- [ ] History entries are persisted in the same transaction as the update
- [ ] `findById` returns the full history list for the operation
- [ ] Unchanged fields do not generate history entries

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/service/OperationService.java (modify — add change tracking to update method)
