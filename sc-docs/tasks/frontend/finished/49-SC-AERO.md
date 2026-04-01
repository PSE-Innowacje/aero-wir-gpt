# 49-SC-AERO: OperationFormPage -- activities + contacts + comments

**Phase**: 3 — Operations
**Depends on**: 48-SC-AERO
**Ref**: implementation-plan.md § 3.6

## Description

Extend the operation form page with three additional sections: activity type multi-select, contact email chip input, and a comments panel. Activity types are loaded from the dictionary API and displayed as checkboxes with Polish labels. Contact emails use a chip-based input with email validation. The comments section (edit mode only) lists existing comments chronologically and provides a form to add new ones.

## Acceptance Criteria

- [ ] Activity types section renders multi-select checkboxes populated from `getActivityTypes()` dictionary
- [ ] Activity type labels are displayed in Polish
- [ ] At least one activity type must be selected (validation enforced)
- [ ] Contact emails section uses chip-based input where Enter adds a new chip
- [ ] Existing contact emails are displayed as removable chips
- [ ] Email format is validated on add (invalid emails are rejected)
- [ ] Comments section is shown only in edit mode
- [ ] Existing comments display content, author email, and formatted date
- [ ] "Dodaj komentarz" text field and submit button allow adding new comments
- [ ] On submit, `addComment(operationId, content)` is called and the comment list refreshes
- [ ] Comments are append-only (no edit or delete functionality)
- [ ] Comments display in chronological order

## Files to Create/Modify

- `frontend/src/pages/operations/OperationFormPage.tsx` (extend existing)
