# 22-SC-AERO: CrewListPage + CrewFormPage

**Phase**: 2 — Admin CRUD
**Depends on**: 13-SC-AERO, 21-SC-AERO
**Ref**: implementation-plan.md § 2.3

## Description

Build the crew member management pages. The list page displays crew members in a DataTable sorted by email. The form page conditionally shows pilot-specific fields (license number, license expiry) based on the selected role, validates email format on the frontend, and renders as read-only for non-ADMIN roles.

## Acceptance Criteria

- [ ] CrewListPage displays crew members in a DataTable with columns: email, role, license expiry date, training expiry date
- [ ] Default sort order is email ASC
- [ ] "Nowy cz&#322;onek za&#322;ogi" button is visible only to ADMIN users
- [ ] CrewFormPage fields: firstName, lastName, email, weightKg, role (Pilot/Obserwator), pilotLicenseNumber, licenseExpiryDate, trainingExpiryDate
- [ ] pilotLicenseNumber and licenseExpiryDate fields are shown only when role is PILOT
- [ ] Email field is validated with a frontend regex pattern
- [ ] Form is disabled (read-only) for non-ADMIN roles
- [ ] Routes registered: `/crew`, `/crew/new`, `/crew/:id`

## Files to Create/Modify

- `frontend/src/pages/crew/CrewListPage.tsx`
- `frontend/src/pages/crew/CrewFormPage.tsx`
- `frontend/src/App.tsx`
