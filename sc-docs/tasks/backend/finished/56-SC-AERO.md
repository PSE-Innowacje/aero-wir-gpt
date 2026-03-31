# 56-SC-AERO: OrderService — status cascading to operations

**Phase**: 4 — Orders
**Depends on**: 55-SC-AERO, 39-SC-AERO
**Ref**: implementation-plan.md § 4.2

## Description
Add bidirectional status cascading between flight orders and their linked operations. When operations are added to or removed from an order, their status changes accordingly (CONFIRMED to SCHEDULED on add, SCHEDULED back to CONFIRMED on remove). When the order itself changes status to a completion state, all linked operations cascade to the corresponding state. All cascading happens within a single transaction to ensure atomicity.

## Acceptance Criteria
- [ ] Adding operations to an order (during create/update) calls `operationService.schedule()` — transitions each from CONFIRMED to SCHEDULED
- [ ] Removing operations from an order (during update) calls `operationService.unschedule()` — transitions each from SCHEDULED back to CONFIRMED
- [ ] Order status PARTIALLY_COMPLETED cascades all linked operations to PARTIALLY_COMPLETED
- [ ] Order status COMPLETED cascades all linked operations to COMPLETED
- [ ] Order status NOT_COMPLETED cascades all linked operations back to CONFIRMED
- [ ] All cascading operations are wrapped in @Transactional for atomicity
- [ ] Adding an operation that is not CONFIRMED is rejected before scheduling

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/service/OrderService.java (modify — add cascading logic)
