# 51-SC-AERO: OperationFormPage -- linked orders display

**Phase**: 3 — Operations
**Depends on**: 48-SC-AERO
**Ref**: implementation-plan.md § 3.6

## Description

Extend the operation form page with a read-only section displaying flight orders linked to the current operation. The linked order IDs come from the `flight_order_operations` join table and are populated automatically when orders reference this operation. Each linked order is shown as a clickable link navigating to the order detail page.

## Acceptance Criteria

- [ ] Linked flight orders section is displayed in edit mode only
- [ ] Section shows a list of flight order IDs/numbers from `operation.linkedOrderIds`
- [ ] Each order is rendered as a clickable link navigating to `/orders/:id`
- [ ] When no linked orders exist, the section displays "Brak powiazanych zlecen" (No linked orders)
- [ ] The section is entirely read-only (not editable by any role)

## Files to Create/Modify

- `frontend/src/pages/operations/OperationFormPage.tsx` (extend existing)
