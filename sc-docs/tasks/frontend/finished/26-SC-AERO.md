# 26-SC-AERO: LandingSiteListPage + LandingSiteFormPage

**Phase**: 2 — Admin CRUD
**Depends on**: 13-SC-AERO, 25-SC-AERO
**Ref**: implementation-plan.md § 2.4

## Description

Build the landing site management pages. The list page displays landing sites in a DataTable sorted by name. The form page includes name, latitude, and longitude fields, and renders as read-only for non-ADMIN roles.

## Acceptance Criteria

- [ ] LandingSiteListPage displays landing sites in a DataTable with a name column
- [ ] Default sort order is name ASC
- [ ] "Nowe l&#261;dowisko" button is visible only to ADMIN users
- [ ] LandingSiteFormPage fields: name, latitude (number input), longitude (number input)
- [ ] Form is disabled (read-only) for non-ADMIN roles
- [ ] CRUD operations work end-to-end (create, read, update)
- [ ] Routes registered: `/landing-sites`, `/landing-sites/new`, `/landing-sites/:id`

## Files to Create/Modify

- `frontend/src/pages/landingSites/LandingSiteListPage.tsx`
- `frontend/src/pages/landingSites/LandingSiteFormPage.tsx`
- `frontend/src/App.tsx`
