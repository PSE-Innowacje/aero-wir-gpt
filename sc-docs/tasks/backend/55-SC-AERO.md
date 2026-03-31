# 55-SC-AERO: OrderService — status transitions + actual dates precondition

**Phase**: 4 — Orders
**Depends on**: 53-SC-AERO
**Ref**: implementation-plan.md § 4.2

## Description
Add the status transition state machine to OrderService. The `changeStatus` method validates that the requested transition is legal for the order's current status and that the current user's role is authorized for the action. Completion-related transitions (partialComplete, complete) require that actual departure and arrival times are already set on the order. Each transition has a defined source status, target status, and role restriction.

## Acceptance Criteria
- [ ] `changeStatus(orderId, action, currentUser)` method added to OrderService
- [ ] `submitForApproval` action: SUBMITTED -> SENT_FOR_APPROVAL (pilot only)
- [ ] `reject` action: SENT_FOR_APPROVAL -> REJECTED (supervisor only)
- [ ] `approve` action: SENT_FOR_APPROVAL -> APPROVED (supervisor only)
- [ ] `partialComplete` action: APPROVED -> PARTIALLY_COMPLETED (pilot only, requires actualDeparture + actualArrival non-null)
- [ ] `complete` action: APPROVED -> COMPLETED (pilot only, requires actualDeparture + actualArrival non-null)
- [ ] `notCompleted` action: APPROVED -> NOT_COMPLETED (pilot only)
- [ ] Transition to COMPLETED or PARTIALLY_COMPLETED without actual dates returns 400
- [ ] Supervisor cannot perform pilot-only transitions (submitForApproval, complete, etc.)
- [ ] Pilot cannot perform supervisor-only transitions (approve, reject)
- [ ] Invalid transition for current status throws IllegalStateException

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/service/OrderService.java (modify — add changeStatus method)
