# 14-SC-AERO: StatusBadge shared component

**Phase**: 2 — Admin CRUD
**Depends on**: 4-SC-AERO
**Ref**: implementation-plan.md § 4.3 (shared components)

## Description

Create a reusable status badge component using MUI Chip that displays a status value with color coding. The component maps status enum values to appropriate colors for visual differentiation across operations, flight orders, and entity statuses throughout the application.

## Acceptance Criteria

- [ ] Component accepts `status: string` and `label: string` props
- [ ] SUBMITTED / Introduced statuses render as default/gray
- [ ] REJECTED renders as error/red
- [ ] CONFIRMED renders as success/green
- [ ] SCHEDULED renders as info/blue
- [ ] PARTIALLY_COMPLETED renders as warning/orange
- [ ] COMPLETED renders as success/green (darker variant)
- [ ] CANCELLED and NOT_COMPLETED render as default/gray
- [ ] ACTIVE renders as success/green; INACTIVE renders as default/gray
- [ ] SENT_FOR_APPROVAL renders as info/blue; APPROVED renders as success/green
- [ ] Polish labels are displayed on the chip

## Files to Create/Modify

- `frontend/src/components/StatusBadge.tsx`
