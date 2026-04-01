# 47-SC-AERO: OperationListPage

**Phase**: 3 — Operations
**Depends on**: 13-SC-AERO, 14-SC-AERO, 45-SC-AERO
**Ref**: implementation-plan.md § 3.6

## Description

Create the operations list page that displays flight operations in a filterable, sortable data table. The page fetches operations on mount with a default status filter of CONFIRMED, renders Polish-labelled columns, and supports role-based visibility for the create button. Row clicks navigate to the operation detail/edit page.

## Acceptance Criteria

- [ ] Operations list is fetched on mount with default filter `status=CONFIRMED`
- [ ] DataTable columns display: Nr operacji (id), Nr zlecenia (orderNumber), Rodzaj czynnosci (activityTypes joined), Proponowane daty (earliest -- latest), Planowane daty (earliest -- latest), Status (StatusBadge)
- [ ] Default sort is planned date earliest ascending
- [ ] Filter controls include a status dropdown (values from dictionary) with apply and reset buttons
- [ ] "Nowa operacja" button is visible only to users with PLANNER or SUPERVISOR role
- [ ] Row click navigates to `/operations/:id`
- [ ] Route is registered at `/operations`
- [ ] PILOT and ADMIN users do not see the create button

## Files to Create/Modify

- `frontend/src/pages/operations/OperationListPage.tsx`
