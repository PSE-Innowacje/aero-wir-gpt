# 18-SC-AERO: HelicopterListPage + HelicopterFormPage

**Phase**: 2 — Admin CRUD
**Depends on**: 13-SC-AERO, 17-SC-AERO
**Ref**: implementation-plan.md § 2.2

## Description

Build the helicopter management pages. The list page displays all helicopters in a DataTable with sorting and a create button for admins. The form page supports both create and edit modes, conditionally requires the inspection expiry date when status is ACTIVE, and renders as read-only for non-ADMIN roles.

## Acceptance Criteria

- [ ] HelicopterListPage fetches all helicopters on mount and displays them in a DataTable
- [ ] DataTable columns include registration number, type, and status (rendered with StatusBadge)
- [ ] Default sort order is status ASC, then registration number ASC
- [ ] "Nowy helikopter" button is visible only to ADMIN users
- [ ] Clicking a row navigates to the edit form for that helicopter
- [ ] HelicopterFormPage loads helicopter data when an `:id` param is present (edit mode)
- [ ] HelicopterFormPage shows an empty form when navigating to `/new` (create mode)
- [ ] Form fields: registrationNumber, type, description, maxCrewCount, maxCrewWeightKg, status (Aktywny/Nieaktywny), inspectionExpiryDate, rangeKm
- [ ] inspectionExpiryDate is required when status is ACTIVE
- [ ] "Zapisz" button calls the appropriate create or update API
- [ ] Form is disabled (read-only) for non-ADMIN roles
- [ ] "Powr&#243;t do listy" link navigates back to the helicopter list
- [ ] Routes registered in App.tsx: `/helicopters`, `/helicopters/new`, `/helicopters/:id`

## Files to Create/Modify

- `frontend/src/pages/helicopters/HelicopterListPage.tsx`
- `frontend/src/pages/helicopters/HelicopterFormPage.tsx`
- `frontend/src/App.tsx`
