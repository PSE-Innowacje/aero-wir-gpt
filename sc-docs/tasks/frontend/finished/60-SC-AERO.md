# 60-SC-AERO: OrderListPage

**Phase**: 4 — Orders
**Depends on**: 13-SC-AERO, 14-SC-AERO, 59-SC-AERO
**Ref**: implementation-plan.md § 4.4

## Description

Create the orders list page that displays flight orders in a filterable, sortable data table. The page fetches orders on mount with a default status filter of SENT_FOR_APPROVAL, renders Polish-labelled columns, and restricts the create button to the PILOT role only. Row clicks navigate to the order detail/edit page.

## Acceptance Criteria

- [ ] Orders list is fetched on mount with default filter `status=SENT_FOR_APPROVAL`
- [ ] DataTable columns display: Nr zlecenia (id), Data planowanego startu (plannedDeparture), Helikopter (registration number), Pilot (name), Status (StatusBadge)
- [ ] Default sort is planned departure ascending
- [ ] Filter controls include a status dropdown with apply and reset buttons
- [ ] "Nowe zlecenie" button is visible only to users with the PILOT role
- [ ] Supervisor, planner, and admin users do not see the create button
- [ ] Row click navigates to `/orders/:id`
- [ ] Route is registered at `/orders`
- [ ] Column headers are in Polish

## Files to Create/Modify

- `frontend/src/pages/orders/OrderListPage.tsx`
