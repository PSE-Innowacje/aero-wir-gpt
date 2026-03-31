# 39-SC-AERO: OperationService — status state machine

**Phase**: 3 — Operations
**Depends on**: 38-SC-AERO
**Ref**: implementation-plan.md § 3.3

## Description
Add the status transition state machine to OperationService. The `changeStatus` method validates that the requested transition is legal for the operation's current status and that the current user's role is authorized for the action. Some transitions are internal-only (called from OrderService in Phase 4) and are not exposed directly via the API. Each transition has specific preconditions: the `confirm` action requires that planned dates are already set.

## Acceptance Criteria
- [ ] `changeStatus(operationId, action, currentUser)` method added to OperationService
- [ ] `reject` action: SUBMITTED -> REJECTED (supervisor only)
- [ ] `confirm` action: SUBMITTED -> CONFIRMED (supervisor only, requires plannedDateEarliest + plannedDateLatest non-null)
- [ ] `cancel` action: SUBMITTED/CONFIRMED/SCHEDULED -> CANCELLED (planner only)
- [ ] `schedule` action: CONFIRMED -> SCHEDULED (internal only, called from OrderService in Phase 4)
- [ ] `partialComplete` action: SCHEDULED -> PARTIALLY_COMPLETED (internal only, Phase 4)
- [ ] `complete` action: SCHEDULED -> COMPLETED (internal only, Phase 4)
- [ ] `unschedule` action: SCHEDULED -> CONFIRMED (internal only, Phase 4)
- [ ] Invalid transition for current status throws IllegalStateException
- [ ] Unauthorized role for action throws AccessDeniedException
- [ ] `confirm` without planned dates returns 400

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/service/OperationService.java (modify — add changeStatus method)
