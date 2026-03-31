# 54-SC-AERO: OrderService — 5 validation rules

**Phase**: 4 — Orders
**Depends on**: 53-SC-AERO
**Ref**: implementation-plan.md § 4.2

## Description
Add five blocking validation rules to the create and update methods in OrderService. Each rule is checked independently on every save, and all five can fire at once, returning a combined error response. Each failed rule produces a specific Polish-language error message. The validations ensure the helicopter, pilot, and crew are all operationally valid for the planned departure date.

## Acceptance Criteria
- [ ] Rule 1: `helicopter.inspectionExpiryDate >= plannedDeparture.toLocalDate()` — rejects with Polish error if expired
- [ ] Rule 2: `pilotCrewMember.licenseExpiryDate >= plannedDeparture.toLocalDate()` — rejects with Polish error if expired
- [ ] Rule 3: For pilot AND each crew member: `trainingExpiryDate >= plannedDeparture.toLocalDate()` — rejects with Polish error if any expired
- [ ] Rule 4: `crewWeightKg <= helicopter.maxCrewWeightKg` — rejects with Polish error if exceeded
- [ ] Rule 5: `estimatedRouteLengthKm <= helicopter.rangeKm` — rejects with Polish error if exceeded
- [ ] All 5 validations are checked independently; multiple can fail at once
- [ ] Combined errors are returned in a single response
- [ ] Error messages are specific and in Polish

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/service/OrderService.java (modify — add validation rules to create/update)
