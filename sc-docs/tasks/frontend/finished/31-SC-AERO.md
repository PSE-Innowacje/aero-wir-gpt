# 31-SC-AERO: Dictionary API functions + types

**Phase**: 2 — Admin CRUD
**Depends on**: 9-SC-AERO
**Ref**: implementation-plan.md § 2.7

## Description

Define a shared TypeScript type for dictionary entries and implement typed API functions for fetching dictionary data from the backend. Dictionaries provide standardized label-value pairs (with Polish labels) for activity types, crew roles, operation statuses, and order statuses used in dropdowns and display components throughout the application.

## Acceptance Criteria

- [ ] `DictionaryEntry` type is defined with `value: string` and `label: string` fields
- [ ] `getActivityTypes()` returns `DictionaryEntry[]`
- [ ] `getCrewRoles()` returns `DictionaryEntry[]`
- [ ] `getOperationStatuses()` returns `DictionaryEntry[]`
- [ ] `getOrderStatuses()` returns `DictionaryEntry[]`
- [ ] All functions use the shared Axios instance
- [ ] Dictionary entries contain Polish labels

## Files to Create/Modify

- `frontend/src/types/dictionary.ts`
- `frontend/src/api/dictionaries.ts`
