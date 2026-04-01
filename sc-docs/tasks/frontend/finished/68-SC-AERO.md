# 68-SC-AERO: Confirmation dialogs + dirty-state warnings

**Phase**: 5 — Polish
**Depends on**: 12-SC-AERO
**Ref**: implementation-plan.md § 5.2

## Description

Add confirmation dialogs before destructive status actions and dirty-state navigation warnings across all form pages. Destructive actions (reject, cancel, mark as not completed) require explicit user confirmation before executing. Form pages track whether the user has unsaved changes and warn before navigation, using react-router's `useBlocker` or the `beforeunload` browser event.

## Acceptance Criteria

- [ ] Destructive status actions ("Odrzuc", "Rezygnuj", "Nie zrealizowane") show a confirmation dialog before executing
- [ ] Confirmation dialog displays "Czy na pewno?" (Are you sure?) with "Potwierdz" and "Anuluj" buttons
- [ ] Confirmation dialog uses MUI Dialog component
- [ ] Form pages track dirty state by comparing initial values to current values
- [ ] Navigating away from a form with unsaved changes shows "Masz niezapisane zmiany. Czy chcesz opuscic strone?" dialog
- [ ] User can cancel the navigation warning and stay on the page
- [ ] Navigation blocking uses react-router's `useBlocker` or the `beforeunload` event

## Files to Create/Modify

- `frontend/src/components/ConfirmDialog.tsx`
- Modify form pages to track dirty state
