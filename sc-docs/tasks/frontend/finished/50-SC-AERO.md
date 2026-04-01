# 50-SC-AERO: OperationFormPage -- status buttons + field restrictions

**Phase**: 3 — Operations
**Depends on**: 48-SC-AERO
**Ref**: implementation-plan.md § 3.6

## Description

Extend the operation form page with role-aware and status-aware action buttons, planner-specific field restrictions, status-based editability rules, and a collapsible change history panel. Status action buttons allow supervisors to reject or confirm operations and planners to cancel them. Field restrictions prevent planners from editing fields outside their responsibility. The change history panel provides a read-only audit trail of all field-level changes.

## Acceptance Criteria

- [ ] Supervisor sees "Odrzuc" (red) and "Potwierdz do planu" (green) buttons when status is SUBMITTED
- [ ] Planner sees "Rezygnuj" (gray) button when status is SUBMITTED, CONFIRMED, or SCHEDULED
- [ ] "Potwierdz do planu" button validates that planned dates are filled before proceeding
- [ ] Each status action button calls `changeStatus(id, action)` and refreshes form data on success
- [ ] When user is PLANNER, the following fields are disabled: planned dates (earliest/latest) and post-completion notes
- [ ] Auto-generated fields (operation number, route km, created-by, change history) display as read-only text for planners
- [ ] Form is entirely read-only when the user's role cannot edit at the current status (e.g., planner at COMPLETED or CANCELLED)
- [ ] Change history panel is collapsible and read-only
- [ ] Change history entries display: field name, old value, new value, who changed, and when

## Files to Create/Modify

- `frontend/src/pages/operations/OperationFormPage.tsx` (extend existing)
