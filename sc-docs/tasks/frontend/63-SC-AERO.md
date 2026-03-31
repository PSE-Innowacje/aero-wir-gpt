# 63-SC-AERO: OrderFormPage -- live validation warnings

**Phase**: 4 — Orders
**Depends on**: 62-SC-AERO
**Ref**: implementation-plan.md § 4.4

## Description

Extend the order form page with live validation warnings displayed as MUI Alert components below the relevant form sections. These warnings check helicopter inspection dates, pilot license expiry, crew training expiry, crew weight limits, and route range limits against the planned departure date and selected helicopter. Warnings update dynamically as the user changes selections, providing immediate feedback to prevent submission errors. The backend enforces these as blocking rules on save; the frontend warnings are informational to save the user time.

## Acceptance Criteria

- [ ] Helicopter inspection warning: if `helicopter.inspectionExpiryDate < plannedDeparture.date`, display "Przeglad helikoptera wygasa przed data lotu (wazny do: DD-MM-YYYY)" as an error Alert
- [ ] Pilot license warning: if pilot's license expiry date is before planned departure, display "Licencja pilota wygasa przed data lotu (wazna do: DD-MM-YYYY)" as an error Alert
- [ ] Training warning: for each crew member (including pilot), if training expiry is before planned departure, display "Szkolenie {Imie Nazwisko} wygasa przed data lotu (wazne do: DD-MM-YYYY)" as an error Alert
- [ ] Weight warning: if crew weight exceeds `helicopter.maxCrewWeightKg`, display "Waga zalogi (X kg) przekracza maksymalny udzwig helikoptera (Y kg)" as an error Alert
- [ ] Range warning: if estimated route length exceeds `helicopter.rangeKm`, display "Szacowana trasa (X km) przekracza zasieg helikoptera (Y km)" as an error Alert
- [ ] All warnings appear and disappear dynamically as selections change
- [ ] All warning messages are in Polish with specific values filled in
- [ ] Pilot's training is also checked under rule 3 (not just non-pilot crew)

## Files to Create/Modify

- `frontend/src/pages/orders/OrderFormPage.tsx` (extend existing)
