# 62-SC-AERO: OrderFormPage -- operations + auto-calc + map

**Phase**: 4 — Orders
**Depends on**: 61-SC-AERO, 46-SC-AERO
**Ref**: implementation-plan.md § 4.4

## Description

Extend the order form page with an operations multi-select, auto-calculated fields for crew weight and estimated route length, and a live-updating map. The operations selector shows only CONFIRMED operations. As the user changes selections for operations, crew members, and landing sites, the auto-calculated values and map update in real time to provide immediate feedback.

## Acceptance Criteria

- [ ] Operations multi-select shows only CONFIRMED operations (loaded with `status=CONFIRMED` filter)
- [ ] Operations are displayed as "Nr: {orderNumber} -- {shortDescription}" and sorted by planned date earliest
- [ ] Crew weight is auto-calculated as the sum of the pilot's weight plus all selected crew members' weights
- [ ] Crew weight is displayed as read-only text: "Waga zalogi: X kg"
- [ ] Estimated route length is auto-calculated as the sum of `routeLengthKm` from all selected operations
- [ ] Estimated route length is displayed as read-only text: "Szacowana dlugosc trasy: X km"
- [ ] Auto-calculated values update live as selections change
- [ ] MapView renders the departure site as a marker with the site name as label
- [ ] MapView renders the arrival site as a marker with the site name as label
- [ ] MapView renders all selected operations' kmlPoints as polylines with distinct colors per operation
- [ ] Map updates live as operations and sites are selected or deselected
- [ ] Auto-calculated values match the backend calculation logic

## Files to Create/Modify

- `frontend/src/pages/orders/OrderFormPage.tsx` (extend existing)
