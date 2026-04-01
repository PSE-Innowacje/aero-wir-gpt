# 64-SC-AERO: OrderFormPage -- status buttons + actual dates

**Phase**: 4 — Orders
**Depends on**: 61-SC-AERO
**Ref**: implementation-plan.md § 4.4

## Description

Extend the order form page with role-aware and status-aware action buttons, and actual departure/arrival datetime fields. Status buttons allow pilots to submit orders for approval and mark completion, while supervisors can reject or approve. Actual departure and arrival times are required before marking an order as completed. The form is read-only for ADMIN users and hidden from PLANNER users.

## Acceptance Criteria

- [ ] Pilot sees "Przekaz do akceptacji" button when status is SUBMITTED
- [ ] Supervisor sees "Odrzuc" (red) and "Zaakceptuj" (green) buttons when status is SENT_FOR_APPROVAL
- [ ] Pilot sees "Zrealizowane w czesci", "Zrealizowane w calosci", and "Nie zrealizowane" buttons when status is APPROVED
- [ ] Actual departure and actual arrival DateTimePicker fields are shown when status is APPROVED
- [ ] Clicking a completion button ("Zrealizowane w czesci" or "Zrealizowane w calosci") without actual dates shows validation error "Uzupelnij rzeczywisty czas startu i ladowania"
- [ ] Each status action button calls `changeStatus(orderId, action)` with the appropriate action string
- [ ] Form data refreshes after a successful status change
- [ ] Form is entirely read-only for ADMIN users (view only)
- [ ] PLANNER users should not reach this page (form is hidden or redirected)

## Files to Create/Modify

- `frontend/src/pages/orders/OrderFormPage.tsx` (extend existing)
