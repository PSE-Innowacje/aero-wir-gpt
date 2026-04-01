# 29-SC-AERO: UserListPage + UserFormPage

**Phase**: 2 — Admin CRUD
**Depends on**: 13-SC-AERO, 28-SC-AERO
**Ref**: implementation-plan.md § 2.5

## Description

Build the user management pages. The list page displays users in a DataTable sorted by email. The form page supports creating and editing users, with a password field shown only during creation and a crew member selector shown only when the PILOT role is selected. The form renders as read-only for non-ADMIN roles.

## Acceptance Criteria

- [ ] UserListPage displays users in a DataTable with columns: email, role
- [ ] Default sort order is email ASC
- [ ] "Nowy u&#380;ytkownik" button is visible only to ADMIN users
- [ ] UserFormPage fields: firstName, lastName, email, password, role (Administrator/Osoba planuj&#261;ca/Osoba nadzoruj&#261;ca/Pilot), crewMemberId
- [ ] Password field is shown only in create mode (not when editing)
- [ ] crewMemberId field (Select from crew members) is shown only when role is PILOT
- [ ] Form is disabled (read-only) for non-ADMIN roles
- [ ] Routes registered: `/users`, `/users/new`, `/users/:id`

## Files to Create/Modify

- `frontend/src/pages/users/UserListPage.tsx`
- `frontend/src/pages/users/UserFormPage.tsx`
- `frontend/src/App.tsx`
